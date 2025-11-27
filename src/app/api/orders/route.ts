import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { items } = await req.json();

  if (!items || !Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: "Invalid items" }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check for 5 items limit (Pending orders + current request)
    const pendingOrders = await prisma.order.findMany({
      where: {
        userId: user.id,
        status: "PENDING",
      },
      include: {
        items: true,
      },
    });

    const pendingCount = pendingOrders.reduce(
      (acc: number, order: any) => acc + order.items.reduce((sum: number, item: any) => sum + item.quantity, 0),
      0
    );

    const currentRequestCount = items.reduce((acc: number, item: any) => acc + item.quantity, 0);

    if (pendingCount + currentRequestCount > 5) {
      return NextResponse.json(
        { error: `Limit exceeded. You have ${pendingCount} pending items. Max allowed is 5.` },
        { status: 400 }
      );
    }

    const total = items.reduce((acc: number, item: any) => acc + item.price * item.quantity, 0);

    // Transaction to check stock and create order
    const order = await prisma.$transaction(async (tx: any) => {
      // 1. Check and decrement stock for each item
      for (const item of items) {
        const variant = await tx.productVariant.findUnique({
          where: { id: item.variantId },
          include: { productColor: true },
        });

        if (!variant) {
          throw new Error(`Variant not found for item ${item.name || 'unknown'}`);
        }

        if (variant.stock < item.quantity) {
          throw new Error(`Insufficient stock for ${variant.productColor.color} - ${variant.size}. Available: ${variant.stock}`);
        }

        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { stock: variant.stock - item.quantity },
        });
      }

      // 2. Create Order
      return await tx.order.create({
        data: {
          userId: user.id,
          total,
          status: "PENDING",
          items: {
            create: items.map((item: any) => ({
              productVariantId: item.variantId,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
      });
    });

    // Audit Log
    await prisma.auditLog.create({
        data: {
            action: "ORDER_CREATED",
            details: `Order ${order.id} created with ${items.length} items. Total: ${total}`,
            userId: user.id,
        }
    });

    return NextResponse.json(order);
  } catch (error: any) {
    console.error("Error creating order:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

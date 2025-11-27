import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  // @ts-ignore
  if (!session || !session.user?.admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { status, delivered } = await req.json();
  const { id } = await params;

  const data: any = {};
  if (status !== undefined) data.status = status;
  if (delivered !== undefined) data.delivered = delivered;

  try {
    const order = await prisma.order.update({
      where: { id },
      data,
    });

    // Audit Log
    let action = "ORDER_UPDATED";
    let details = `Order ${id} updated.`;

    if (status !== undefined && delivered !== undefined) {
        details = `Order ${id} updated: Status=${status}, Delivered=${delivered}`;
    } else if (status !== undefined) {
        action = status === "PAID" ? "ORDER_PAID" : "ORDER_UNPAID";
        details = `Order ${id} marked as ${status}.`;
    } else if (delivered !== undefined) {
        action = delivered ? "ORDER_DELIVERED" : "ORDER_UNDELIVERED";
        details = `Order ${id} marked as ${delivered ? "DELIVERED" : "NOT DELIVERED"}.`;
    }

    await prisma.auditLog.create({
        data: {
            action,
            details,
            // @ts-ignore
            userId: session.user.id,
        }
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  // @ts-ignore
  if (!session || !session.user?.admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const order = await prisma.order.findUnique({
        where: { id },
        include: { items: true }
    });

    if (!order) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
        // Restore stock
        for (const item of order.items) {
            await tx.productVariant.update({
                where: { id: item.productVariantId },
                data: { stock: { increment: item.quantity } }
            });
        }

        // Delete order items
        await tx.orderItem.deleteMany({
            where: { orderId: id }
        });

        // Delete order
        await tx.order.delete({
            where: { id }
        });
        
        // Audit Log
        await tx.auditLog.create({
            data: {
                action: "ORDER_DELETED",
                details: `Order ${id} deleted. Stock restored.`,
                // @ts-ignore
                userId: session.user.id,
            }
        });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting order:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

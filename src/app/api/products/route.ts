import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  // @ts-ignore
  if (!session || !session.user?.admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await req.json();

  try {
    const product = await prisma.product.create({
      data: {
        name: data.name,
        description: data.description,
        price: parseFloat(data.price),
        imageUrl: data.imageUrl,
        backImageUrl: data.backImageUrl,
        active: data.active ?? true,
        hasVariants: data.hasVariants ?? true,
        category: data.category ?? "Generale",
        isVariablePrice: data.isVariablePrice ?? false,
        colors: {
          create: data.colors.map((c: any) => ({
            color: c.color,
            name: c.name,
            variants: {
              create: c.variants.map((v: any) => ({
                size: v.size,
                stock: parseInt(v.stock),
              })),
            },
          })),
        },
      },
    });
    return NextResponse.json(product);
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

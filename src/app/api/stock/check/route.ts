import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { variantIds } = await req.json();

    if (!Array.isArray(variantIds)) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const variants = await prisma.productVariant.findMany({
      where: {
        id: { in: variantIds },
      },
      select: {
        id: true,
        stock: true,
      },
    });

    const stockMap = variants.reduce((acc, v) => {
      acc[v.id] = v.stock;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json(stockMap);
  } catch (error) {
    console.error("Error checking stock:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

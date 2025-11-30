import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  // @ts-ignore
  if (!session || !session.user?.admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const data = await req.json();

  try {
    // Update product details
    const product = await prisma.product.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        price: parseFloat(data.price),
        imageUrl: data.imageUrl,
        backImageUrl: data.backImageUrl,
        active: data.active,
      },
    });

    // Handle Colors and Variants
    if (data.colors && Array.isArray(data.colors)) {
        // 1. Get all existing colors for this product
        const existingColors = await prisma.productColor.findMany({
            where: { productId: id },
            include: { variants: true }
        });

        // 2. Identify colors to delete (present in DB but not in incoming data)
        const incomingColorIds = data.colors.map((c: any) => c.id).filter((id: any) => id);
        // @ts-ignore
        const colorsToDelete = existingColors.filter(c => !incomingColorIds.includes(c.id));

        for (const colorToDelete of colorsToDelete) {
            await prisma.productColor.delete({ where: { id: colorToDelete.id } });
        }

        // 3. Process incoming colors
        for (const c of data.colors) {
            let colorId = c.id;

            if (colorId) {
                // Update existing color
                await prisma.productColor.update({
                    where: { id: colorId },
                    data: { color: c.color, name: c.name }
                });
            } else {
                // Create new color
                const newColor = await prisma.productColor.create({
                    data: {
                        productId: id,
                        color: c.color,
                        name: c.name
                    }
                });
                colorId = newColor.id;
            }

            // Handle Variants for this color
            if (c.variants && Array.isArray(c.variants)) {
                // Get existing variants for this color (if it existed)
                // @ts-ignore
                const existingVariants = colorId && incomingColorIds.includes(colorId) 
                    // @ts-ignore
                    ? existingColors.find(ec => ec.id === colorId)?.variants || [] 
                    : [];

                // Identify variants to delete
                const incomingVariantIds = c.variants.map((v: any) => v.id).filter((id: any) => id);
                // @ts-ignore
                const variantsToDelete = existingVariants.filter(v => !incomingVariantIds.includes(v.id));

                for (const variantToDelete of variantsToDelete) {
                    await prisma.productVariant.delete({ where: { id: variantToDelete.id } });
                }

                // Process incoming variants
                for (const v of c.variants) {
                    if (v.id) {
                        await prisma.productVariant.update({
                            where: { id: v.id },
                            data: {
                                size: v.size,
                                stock: parseInt(v.stock),
                            }
                        });
                    } else {
                        const existingVariant = await prisma.productVariant.findFirst({
                            where: {
                                // @ts-ignore
                                productColorId: colorId,
                                size: v.size
                            }
                        });

                        if (existingVariant) {
                             await prisma.productVariant.update({
                                where: { id: existingVariant.id },
                                data: { stock: parseInt(v.stock) }
                             });
                        } else {
                             await prisma.productVariant.create({
                                data: {
                                    // @ts-ignore
                                    productColorId: colorId,
                                    size: v.size,
                                    stock: parseInt(v.stock)
                                }
                             });
                        }
                    }
                }
            }
        }
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("Error updating product:", error);
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
    // Soft delete by setting active to false is safer, but if user wants to remove...
    // If there are orders, we can't delete easily.
    // Let's try to delete, if it fails due to foreign key, we return error.
    await prisma.product.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { error: "Cannot delete product. It might be in use. Try disabling it instead." },
      { status: 400 }
    );
  }
}

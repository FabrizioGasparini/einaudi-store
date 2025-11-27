import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import AdminDashboard from "@/components/AdminDashboard";
import AdminProducts from "@/components/AdminProducts";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  // @ts-ignore
  if (!session || !session.user?.admin) {
    redirect("/");
  }

  const orders = await prisma.order.findMany({
    include: {
      user: true,
      items: {
        include: {
          productVariant: {
            include: {
              productColor: {
                include: {
                  product: true,
                },
              },
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const products = await prisma.product.findMany({
    include: {
      colors: {
        include: {
          variants: true,
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });

  // @ts-ignore
  const serializedOrders = orders.map((order) => ({
      ...order,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      // @ts-ignore
      items: order.items.map((item) => ({
          ...item,
          // Flatten structure for easier usage if needed, but keeping it nested is fine
      }))
  }));

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-12">
      <div>
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
        <AdminDashboard initialOrders={serializedOrders} products={products} />
      </div>
      
      <div>
        <AdminProducts initialProducts={products} />
      </div>
    </div>
  );
}

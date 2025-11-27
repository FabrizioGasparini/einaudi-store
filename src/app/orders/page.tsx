import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Package, Clock, CheckCircle, Truck } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    redirect("/login");
  }

  const orders = await prisma.order.findMany({
    where: {
      user: {
        email: session.user.email,
      },
    },
    include: {
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

  const activeOrders = orders.filter((o) => !o.delivered);
  const pastOrders = orders.filter((o) => o.delivered);

  return (
    <div className="max-w-5xl mx-auto py-12 px-4">
      <div className="mb-12">
        <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">I tuoi Ordini</h1>
        <p className="text-gray-500">Gestisci e monitora lo stato dei tuoi acquisti.</p>
      </div>

      <div className="space-y-16">
        {/* Active Orders */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-blue-100 p-2 rounded-full">
                <Clock className="text-blue-600" size={20} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">In Corso</h2>
          </div>
          
          {activeOrders.length > 0 ? (
            <div className="grid gap-6">
              {activeOrders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-gray-200">
              <p className="text-gray-400">Non hai ordini in corso al momento.</p>
            </div>
          )}
        </section>

        {/* Past Orders */}
        {pastOrders.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-6">
                <div className="bg-green-100 p-2 rounded-full">
                    <CheckCircle className="text-green-600" size={20} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Consegnati</h2>
            </div>
            <div className="grid gap-6 opacity-80 hover:opacity-100 transition-opacity">
              {pastOrders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function OrderCard({ order }: { order: any }) {
  const isPaid = order.status === "PAID";
  const isDelivered = order.delivered;

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6 border-b border-gray-50 pb-4">
        <div>
          <div className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">Ordine #{order.id.slice(-6).toUpperCase()}</div>
          <div className="text-sm text-gray-500">
            Effettuato il {new Date(order.createdAt).toLocaleDateString("it-IT", { day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
        </div>
        <div className="flex gap-2">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full w-fit ${isPaid ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
                {isPaid ? <CheckCircle size={16} /> : <Clock size={16} />}
                <span className="text-sm font-bold">{isPaid ? "Pagato" : "In Attesa di Pagamento"}</span>
            </div>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full w-fit ${isDelivered ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-600"}`}>
                <Truck size={16} />
                <span className="text-sm font-bold">{isDelivered ? "Consegnato" : "In Lavorazione"}</span>
            </div>
        </div>
      </div>

      <div className="space-y-4">
        {order.items.map((item: any) => (
          <div key={item.id} className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gray-50 rounded-xl flex items-center justify-center overflow-hidden border border-gray-100">
                {item.productVariant.productColor.product.imageUrl ? (
                    <img src={item.productVariant.productColor.product.imageUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                    <Package size={24} className="text-gray-300" />
                )}
            </div>
            <div className="grow">
              <h3 className="font-bold text-gray-900">{item.productVariant.productColor.product.name}</h3>
              <p className="text-sm text-gray-500 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full border border-gray-200 inline-block" style={{ backgroundColor: item.productVariant.productColor.color }}></span>
                {item.productVariant.productColor.name || item.productVariant.productColor.color} / {item.productVariant.size}
              </p>
            </div>
            <div className="text-right">
                <div className="font-medium text-gray-900">€ {item.price.toFixed(2)}</div>
                <div className="text-xs text-gray-400">x{item.quantity}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-50 flex justify-between items-center">
        <span className="font-medium text-gray-500">Totale Ordine</span>
        <span className="text-2xl font-black text-gray-900">€ {order.total.toFixed(2)}</span>
      </div>
    </div>
  );
}

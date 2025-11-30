import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { CheckCircle, Home, Package } from "lucide-react";
import OrderConfetti from "@/components/OrderConfetti";

export default async function OrderConfirmationPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/login");
  }

  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          productVariant: {
            include: {
              productColor: {
                include: {
                  product: true
                }
              }
            }
          }
        }
      }
    }
  });

  if (!order) {
    notFound();
  }

  // @ts-ignore
  if (order.userId !== session.user.id && !session.user.admin) {
     return (
         <div className="min-h-screen flex items-center justify-center">
             <div className="text-center">
                 <h1 className="text-2xl font-bold text-red-600">Accesso Negato</h1>
                 <p className="text-gray-600 mt-2">Non hai i permessi per visualizzare questo ordine.</p>
                 <Link href="/" className="mt-4 inline-block text-blue-600 hover:underline">Torna alla Home</Link>
             </div>
         </div>
     );
  }

  return (
    <div className="h-full flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <OrderConfetti />
      
      <div className="max-w-3xl w-full space-y-8 relative z-10">
        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 text-center border border-gray-100 animate-in zoom-in duration-500">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-in zoom-in delay-200 duration-500">
                <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            
            <h1 className="text-4xl font-black text-gray-900 mb-2 tracking-tight">Grazie per il tuo ordine!</h1>
            <p className="text-xl text-gray-500 mb-8">La tua prenotazione è stata confermata.</p>
            
            <div className="bg-gray-50 rounded-2xl p-6 mb-8 text-left border border-gray-100">
                <div className="flex justify-between items-center mb-4 border-b border-gray-200 pb-4">
                    <div>
                        <p className="text-sm text-gray-500 uppercase tracking-wider font-semibold">Numero Ordine</p>
                        <p className="text-lg font-mono font-bold text-gray-900">#{order.id.slice(-6).toUpperCase()}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-gray-500 uppercase tracking-wider font-semibold">Totale</p>
                        <p className="text-lg font-bold text-blue-600">€ {order.total.toFixed(2)}</p>
                    </div>
                </div>
                
                <div className="space-y-3">
                    {order.items.map((item) => (
                        <div key={item.id} className="flex justify-between items-center text-sm">
                            <div className="flex items-center gap-3">
                                <span className="font-bold text-gray-900">{item.quantity}x</span>
                                <span className="text-gray-700">{item.productVariant.productColor.product.name}</span>
                                <span className="text-gray-500">({item.productVariant.productColor.color}, {item.productVariant.size})</span>
                            </div>
                            <span className="font-medium text-gray-900">€ {(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                    href="/" 
                    className="flex items-center justify-center gap-2 px-8 py-4 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-all hover:-translate-y-1 shadow-lg shadow-gray-900/20"
                >
                    <Home size={20} />
                    Torna alla Home
                </Link>
                <Link 
                    href="/orders" 
                    className="flex items-center justify-center gap-2 px-8 py-4 bg-white text-gray-900 border border-gray-200 rounded-xl font-bold hover:bg-gray-50 transition-all hover:-translate-y-1"
                >
                    <Package size={20} />
                    I miei Ordini
                </Link>
            </div>
        </div>
        
        <p className="text-center text-gray-400 text-sm">
            Contatta i rappresentanti se hai domande riguardo il tuo ordine.
        </p>
      </div>
    </div>
  );
}

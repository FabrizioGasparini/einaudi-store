"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Trash2, ShoppingBag, ArrowRight, Minus, Plus } from "lucide-react";
import Modal from "@/components/ui/Modal";

export default function CartPage() {
    const { items, removeFromCart, updateQuantity, clearCart, showToast, total } = useCart();
  const { data: session } = useSession();
  const router = useRouter();
  const [stockMap, setStockMap] = useState<Record<string, number>>({});
  const [alertModalOpen, setAlertModalOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const showAlert = (message: string) => {
    setAlertMessage(message);
    setAlertModalOpen(true);
  };

  useEffect(() => {
    const fetchStock = async () => {
      if (items.length === 0) return;
      const variantIds = items.map(i => i.variantId);
      try {
        const res = await fetch('/api/stock/check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ variantIds })
        });
        if (res.ok) {
          const data = await res.json();
          setStockMap(data);
        }
      } catch (e) {
        console.error("Failed to fetch stock", e);
      }
    };
    fetchStock();
  }, [items]);

  const handleCheckout = async () => {
    if (!session) {
      router.push("/login");
      return;
    }

    // Check stock before checkout
    const outOfStockItems = items.filter(item => 
        stockMap[item.variantId] !== undefined && item.quantity > stockMap[item.variantId]
    );

    if (outOfStockItems.length > 0) {
        showAlert(`Alcuni articoli nel carrello superano la disponibilità: ${outOfStockItems.map(i => i.name).join(", ")}`);
        return;
    }

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ items }),
      });

      if (response.ok) {
        const order = await response.json();
        showToast("Ordine effettuato con successo!");
        clearCart();
        router.push(`/order-confirmation/${order.id}`);
      } else {
        const data = await response.json();
        showAlert(data.error || "Impossibile effettuare l'ordine.");
      }
    } catch (error) {
      console.error("Error placing order:", error);
      showAlert("Si è verificato un errore.");
    }
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center animate-in fade-in zoom-in duration-500">
        <div className="bg-gray-50 p-8 rounded-full mb-6 shadow-inner">
            <ShoppingBag size={48} className="text-gray-300" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Il tuo carrello è vuoto</h1>
        <p className="text-gray-500 mb-8">Sembra che tu non abbia ancora aggiunto nulla.</p>
        <button 
            onClick={() => router.push("/")}
            className="bg-gray-900 text-white px-8 py-3 rounded-full font-medium hover:bg-black transition-all shadow-lg hover:shadow-xl active:scale-95"
        >
            Inizia lo Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8 tracking-tight">Il tuo Carrello</h1>
      
      <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
            <thead className="bg-gray-50/80 border-b border-gray-100 backdrop-blur-sm">
                <tr>
                <th className="p-6 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Prodotto</th>
                <th className="p-6 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Dettagli</th>
                <th className="p-6 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Prezzo</th>
                <th className="p-6 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Qta</th>
                <th className="p-6 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Totale</th>
                <th className="p-6 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider"></th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
                {items.map((item) => (
                <tr key={item.variantId} className="group hover:bg-blue-50/30 transition-colors">
                    <td className="p-6 font-medium text-gray-900">{item.name}</td>
                    <td className="p-6">
                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                            <div className="w-3 h-3 rounded-full border border-gray-300 shadow-sm" style={{ backgroundColor: item.color }} title={item.colorName || item.color} />
                            {item.colorName && <span className="text-gray-600">{item.colorName}</span>}
                            <span className="text-gray-400">|</span>
                            {item.size}
                        </span>
                    </td>
                    <td className="p-6 text-gray-600">€ {item.price.toFixed(2)}</td>
                                      <td className="py-4">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                        className="w-8 h-8 text-black rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={item.quantity <= 1}
                      >
                        <Minus size={14} />
                      </button>
                      <span className="font-medium w-4 text-center text-black">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                        className="w-8 h-8 text-black rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={stockMap[item.variantId] !== undefined && item.quantity >= stockMap[item.variantId]}
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    {stockMap[item.variantId] !== undefined && item.quantity > stockMap[item.variantId] && (
                        <div className="text-red-500 text-xs mt-1 font-medium">
                            Disponibili solo {stockMap[item.variantId]}
                        </div>
                    )}
                  </td>
                    <td className="p-6 font-bold text-gray-900">
                    € {(item.price * item.quantity).toFixed(2)}
                    </td>
                    <td className="p-6 text-right">
                    <button
                        onClick={() => removeFromCart(item.variantId)}
                        className="text-gray-400 hover:text-red-600 transition-colors p-2 rounded-full hover:bg-red-50"
                        title="Rimuovi"
                    >
                        <Trash2 size={18} />
                    </button>
                    </td>
                </tr>
                ))}
            </tbody>
            <tfoot className="bg-gray-50/50 border-t border-gray-100">
                <tr>
                <td colSpan={4} className="p-6 text-right text-sm font-medium text-gray-500">
                    Totale Ordine
                </td>
                <td className="p-6 text-xl font-bold text-gray-900">€ {total.toFixed(2)}</td>
                <td></td>
                </tr>
            </tfoot>
            </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden divide-y divide-gray-100">
            {items.map((item) => (
                <div key={item.variantId} className="p-4 space-y-3">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="font-medium text-gray-900">{item.name}</h3>
                            <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
                                <div className="w-3 h-3 rounded-full border border-gray-300 shadow-sm" style={{ backgroundColor: item.color }} />
                                <span>{item.colorName || item.color}</span>
                                <span>•</span>
                                <span>{item.size}</span>
                            </div>
                        </div>
                        <button
                            onClick={() => removeFromCart(item.variantId)}
                            className="text-gray-400 hover:text-red-600 p-1"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                    
                    <div className="flex justify-between items-center">
                        <div className="text-gray-600">€ {item.price.toFixed(2)}</div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                                className="w-8 h-8 text-black rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50"
                                disabled={item.quantity <= 1}
                            >
                                <Minus size={14} />
                            </button>
                            <span className="font-medium w-4 text-center text-black">{item.quantity}</span>
                            <button
                                onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                                className="w-8 h-8 text-black rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50"
                                disabled={stockMap[item.variantId] !== undefined && item.quantity >= stockMap[item.variantId]}
                            >
                                <Plus size={14} />
                            </button>
                        </div>
                    </div>
                    
                    <div className="flex justify-between items-center pt-2 border-t border-gray-50">
                        <span className="text-sm text-gray-500">Totale</span>
                        <span className="font-bold text-gray-900">€ {(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                    
                    {stockMap[item.variantId] !== undefined && item.quantity > stockMap[item.variantId] && (
                        <div className="text-red-500 text-xs font-medium">
                            Disponibili solo {stockMap[item.variantId]}
                        </div>
                    )}
                </div>
            ))}
            <div className="p-4 bg-gray-50 border-t border-gray-100">
                <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-900">Totale Ordine</span>
                    <span className="text-xl font-bold text-gray-900">€ {total.toFixed(2)}</span>
                </div>
            </div>
        </div>
      </div>

      <div className="mt-8 flex flex-col items-end gap-3">
        <p className="text-sm text-gray-500 text-right max-w-md">
            Nota: Confermando l'ordine non verrà effettuato alcun pagamento online. Si tratta esclusivamente di una prenotazione.
        </p>
        <button
          onClick={handleCheckout}
          className="bg-linear-to-r from-blue-600 to-indigo-600 text-white py-4 px-10 rounded-2xl text-lg font-bold hover:shadow-lg hover:shadow-blue-500/30 transition-all active:scale-95"
        >
          Conferma Prenotazione
        </button>
      </div>

      <Modal isOpen={alertModalOpen} onClose={() => setAlertModalOpen(false)} title="Attenzione">
        <div className="space-y-4">
            <p className="text-gray-600">{alertMessage}</p>
            <div className="flex justify-end">
                <button 
                    onClick={() => setAlertModalOpen(false)}
                    className="px-4 py-2 bg-gray-900 text-white rounded-xl hover:bg-black transition-colors font-medium"
                >
                    OK
                </button>
            </div>
        </div>
      </Modal>
    </div>
  );
}

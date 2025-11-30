"use client";

import { useState } from "react";
import * as XLSX from "xlsx";
import { Check, X, Download, AlertCircle, Trash2 } from "lucide-react";

type ProductVariant = {
  id: string;
  size: string;
  stock: number;
};

type ProductColor = {
  id: string;
  color: string;
  variants: ProductVariant[];
};

type Product = {
  id: string;
  name: string;
  colors: ProductColor[];
};

type OrderItem = {
  id: string;
  quantity: number;
  price: number;
  productVariant: {
    productColor: {
      product: { name: string };
      color: string;
    };
    size: string;
  };
};

type Order = {
  id: string;
  user: {
    nome: string | null;
    email: string;
    classe: string | null;
  };
  status: string;
  delivered: boolean;
  total: number;
  createdAt: string;
  items: OrderItem[];
};

const Toast = ({ message, type, visible }: { message: string; type: "success" | "error"; visible: boolean }) => {
  if (!visible) return null;
  return (
    <div className={`fixed bottom-8 right-8 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 z-[100] animate-in slide-in-from-bottom-5 fade-in duration-300 ${type === "success" ? "bg-gray-900 text-white" : "bg-red-500 text-white"}`}>
      <div className={`${type === "success" ? "bg-green-500" : "bg-white/20"} rounded-full p-1`}>
        {type === "success" ? <Check size={14} className="text-white" /> : <AlertCircle size={14} className="text-white" />}
      </div>
      <span className="font-medium">{message}</span>
    </div>
  );
};

export default function AdminDashboard({ initialOrders, products }: { initialOrders: Order[], products: Product[] }) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [filterClass, setFilterClass] = useState<string>("");
  const [filterStudent, setFilterStudent] = useState<string>(""); // Search by student or Order ID
  const [filterStatus, setFilterStatus] = useState<string>("ALL"); // ALL, PAID, UNPAID
  const [filterDelivered, setFilterDelivered] = useState<string>("ALL"); // ALL, ARRIVED, NOT_ARRIVED
  const [filterProduct, setFilterProduct] = useState<string>("");
  const [filterStock, setFilterStock] = useState<string>("ALL"); // ALL, AVAILABLE, OUT_OF_STOCK
  const [toast, setToast] = useState<{ show: boolean; message: string; type: "success" | "error" }>({ show: false, message: "", type: "success" });
  const [deleteModal, setDeleteModal] = useState<{ show: boolean; orderId: string | null }>({ show: false, orderId: null });

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000);
  };

  const classes = Array.from(new Set(orders.map((o) => o.user.classe).filter(Boolean) as string[])).sort();

  const filteredOrders = orders.filter((order) => {
    const matchesClass = filterClass ? order.user.classe === filterClass : true;
    const matchesStudent = filterStudent
      ? (order.user.nome?.toLowerCase().includes(filterStudent.toLowerCase()) ||
         order.user.email.toLowerCase().includes(filterStudent.toLowerCase()) ||
         order.id.toLowerCase().includes(filterStudent.toLowerCase()))
      : true;
    
    let matchesStatus = true;
    if (filterStatus === "PAID") {
        matchesStatus = order.status === "PAID";
    } else if (filterStatus === "UNPAID") {
        matchesStatus = order.status === "PENDING";
    }

    let matchesDelivered = true;
    if (filterDelivered === "ARRIVED") {
        matchesDelivered = order.delivered === true;
    } else if (filterDelivered === "NOT_ARRIVED") {
        matchesDelivered = order.delivered === false;
    }

    return matchesClass && matchesStudent && matchesStatus && matchesDelivered;
  });

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
        );
        showToast(newStatus === "PAID" ? "Ordine segnato come PAGATO" : "Ordine segnato come DA PAGARE");
      } else {
        showToast("Errore durante l'aggiornamento", "error");
      }
    } catch (error) {
      console.error("Failed to update status", error);
      showToast("Errore di connessione", "error");
    }
  };

  const handleDeliveredChange = async (orderId: string, newDelivered: boolean) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ delivered: newDelivered }),
      });

      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, delivered: newDelivered } : o))
        );
        showToast(newDelivered ? "Ordine segnato come CONSEGNATO" : "Ordine segnato come NON CONSEGNATO");
      } else {
        showToast("Errore durante l'aggiornamento", "error");
      }
    } catch (error) {
      console.error("Failed to update delivery status", error);
      showToast("Errore di connessione", "error");
    }
  };

  const handleDeleteOrder = async () => {
    if (!deleteModal.orderId) return;

    try {
      const res = await fetch(`/api/orders/${deleteModal.orderId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete order");

      showToast("Ordine eliminato con successo");
      setOrders((prev) => prev.filter((o) => o.id !== deleteModal.orderId));
      setDeleteModal({ show: false, orderId: null });
    } catch (error) {
      console.error("Error deleting order:", error);
      showToast("Errore durante l'eliminazione", "error");
    }
  };

  const downloadClassSpreadsheet = (className: string) => {
    const classOrders = orders.filter((o) => o.user.classe === className);
    
    const data = classOrders.map((order) => {
      const itemsDetail = order.items
        .map(
          (i) =>
            `${i.quantity}x ${i.productVariant.productColor.product.name} (${i.productVariant.productColor.color}, ${i.productVariant.size})`
        )
        .join("; ");

      return {
        ID: order.id,
        Student: order.user.nome || order.user.email,
        Items: itemsDetail,
        Total: order.total,
        Status: order.status === "PAID" ? "PAGATO" : "DA PAGARE",
        Delivered: order.delivered ? "SI" : "NO",
      };
    });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, className);
    XLSX.writeFile(wb, `Orders_${className}.xlsx`);
  };

  const downloadAllSpreadsheet = () => {
     const data = orders.map((order) => {
      const itemsDetail = order.items
        .map(
          (i) =>
            `${i.quantity}x ${i.productVariant.productColor.product.name} (${i.productVariant.productColor.color}, ${i.productVariant.size})`
        )
        .join("; ");

      return {
        ID: order.id,
        Class: order.user.classe || "N/A",
        Student: order.user.nome || order.user.email,
        Items: itemsDetail,
        Total: order.total,
        Status: order.status === "PAID" ? "PAGATO" : "DA PAGARE",
        Delivered: order.delivered ? "SI" : "NO",
      };
    });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "All Orders");
    XLSX.writeFile(wb, `All_Orders.xlsx`);
  }

  // Stats
  const paidOrders = orders.filter(o => o.status === "PAID");
  const totalRevenue = paidOrders.reduce((acc, o) => acc + o.total, 0);
  const potentialRevenue = orders.reduce((acc, o) => acc + o.total, 0);
  
  const totalOrders = orders.length;
  const deliveredCount = orders.filter(o => o.delivered).length;
  const inDeliveryCount = totalOrders - deliveredCount;

  const productStats: Record<string, number> = {};

  paidOrders.forEach((order) => {
    order.items.forEach((item) => {
      const key = `${item.productVariant.productColor.product.name} (${item.productVariant.productColor.color}, ${item.productVariant.size})`;
      productStats[key] = (productStats[key] || 0) + item.quantity;
    });
  });

  const totalProductsOrdered = orders.reduce((acc, order) => {
    return acc + order.items.reduce((iAcc, item) => iAcc + item.quantity, 0);
  }, 0);

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider">Ricavo Totale</h3>
          <p className="text-4xl font-extrabold text-gray-900 mt-2">€ {totalRevenue.toFixed(2)}</p>
          <p className="text-sm text-gray-400 mt-1 font-medium">su € {potentialRevenue.toFixed(2)} totali</p>
        </div>
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider">Ordini Totali</h3>
          <p className="text-4xl font-extrabold text-gray-900 mt-2">{totalOrders}</p>
          <p className="text-sm text-gray-400 mt-1 font-medium">
            <span className="text-orange-500">{inDeliveryCount} in consegna</span> / <span className="text-green-600">{deliveredCount} consegnati</span>
          </p>
        </div>
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider">Prodotti Venduti</h3>
          <p className="text-4xl font-extrabold text-gray-900 mt-2">
            {Object.values(productStats).reduce((a, b) => a + b, 0)}
          </p>
          <p className="text-sm text-gray-400 mt-1 font-medium">su {totalProductsOrdered} ordinati</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <Toast message={toast.message} type={toast.type} visible={toast.show} />
        <div className="p-8 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
          <h2 className="text-2xl font-bold text-gray-900">Prenotazioni</h2>
          <div className="flex gap-3 flex-wrap w-full md:w-auto items-center">
            <div className="flex flex-col gap-2">
                <div className="flex bg-gray-100 p-1 rounded-xl">
                    <button 
                        onClick={() => setFilterStatus("ALL")}
                        className={`flex-1 px-3 py-1 text-nowrap rounded-lg text-xs font-medium transition-all ${filterStatus === "ALL" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                    >
                        Tutti (Pagamento)
                    </button>
                    <button 
                        onClick={() => setFilterStatus("UNPAID")}
                        className={`flex-1 px-3 py-1 text-nowrap rounded-lg text-xs font-medium transition-all ${filterStatus === "UNPAID" ? "bg-white text-yellow-700 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                    >
                        Da Pagare
                    </button>
                    <button 
                        onClick={() => setFilterStatus("PAID")}
                        className={`flex-1 px-3 py-1 text-nowrap rounded-lg text-xs font-medium transition-all ${filterStatus === "PAID" ? "bg-white text-green-700 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                    >
                        Pagati
                    </button>
                </div>
                <div className="flex bg-gray-100 p-1 rounded-xl">
                    <button 
                        onClick={() => setFilterDelivered("ALL")}
                        className={`flex-1 px-3 py-1 text-nowrap rounded-lg text-xs font-medium transition-all ${filterDelivered === "ALL" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                    >
                        Tutti (Consegna)
                    </button>
                    <button 
                        onClick={() => setFilterDelivered("NOT_ARRIVED")}
                        className={`flex-1 px-3 py-1 text-nowrap rounded-lg text-xs font-medium transition-all ${filterDelivered === "NOT_ARRIVED" ? "bg-white text-orange-700 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                    >
                        Non Consegnati
                    </button>
                    <button 
                        onClick={() => setFilterDelivered("ARRIVED")}
                        className={`flex-1 px-3 py-1 text-nowrap rounded-lg text-xs font-medium transition-all ${filterDelivered === "ARRIVED" ? "bg-white text-blue-700 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                    >
                        Consegnati
                    </button>
                </div>
            </div>

            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              className="border text-black border-gray-200 p-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            >
              <option value="" className="text-black">Tutte le Classi</option>
              {classes.map((c) => (
                <option key={c} value={c} className="text-black">
                  {c}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Cerca Studente o ID..."
              value={filterStudent}
              onChange={(e) => setFilterStudent(e.target.value)}
              className="border text-black border-gray-200 p-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all grow md:grow-0"
            />
            <button onClick={downloadAllSpreadsheet} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-green-700 transition-colors shadow-lg shadow-green-600/20">
                <Download size={16} /> Tutto
            </button>
            {filterClass && (
              <button
                onClick={() => downloadClassSpreadsheet(filterClass)}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
              >
                <Download size={16} /> {filterClass}
              </button>
            )}
          </div>
        </div>

        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="p-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">ID Ordine</th>
                <th className="p-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Studente</th>
                <th className="p-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Classe</th>
                <th className="p-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Articoli</th>
                <th className="p-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Totale</th>
                <th className="p-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Stato</th>
                <th className="p-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Azioni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-6 text-xs font-mono text-gray-400">
                    {order.id.slice(-6).toUpperCase()}
                  </td>
                  <td className="p-6">
                    <div className="font-semibold text-gray-900">{order.user.nome}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{order.user.email}</div>
                  </td>
                  <td className="p-6 text-sm text-gray-600">{order.user.classe}</td>
                  <td className="p-6 text-sm text-gray-600 space-y-1">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">{item.quantity}x</span>
                        <span>{item.productVariant.productColor.product.name}</span>
                        <span className="text-gray-400 text-xs flex items-center gap-1">
                            <div className="w-3 h-3 rounded-full border border-gray-300" style={{ backgroundColor: item.productVariant.productColor.color }} />
                            {item.productVariant.size}
                        </span>
                      </div>
                    ))}
                  </td>
                  <td className="p-6 font-bold text-gray-900">€ {order.total.toFixed(2)}</td>
                  <td className="p-6">
                    <div className="flex flex-col gap-2">
                        <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium w-fit ${
                            order.status === "PAID"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                        >
                        {order.status === "PAID" ? "PAGATO" : "DA PAGARE"}
                        </span>
                        <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium w-fit ${
                            order.delivered
                            ? "bg-blue-100 text-blue-800"
                            : "bg-orange-100 text-orange-800"
                        }`}
                        >
                        {order.delivered ? "CONSEGNATO" : "NON CONSEGNATO"}
                        </span>
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="flex gap-2">
                      {order.status !== "PAID" ? (
                        <button
                          onClick={() => handleStatusChange(order.id, "PAID")}
                          className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                          title="Segna come Pagato"
                        >
                          <Check size={18} />
                        </button>
                      ) : (
                         <button
                          onClick={() => handleStatusChange(order.id, "PENDING")}
                          className="p-2 bg-yellow-50 text-yellow-600 rounded-lg hover:bg-yellow-100 transition-colors"
                          title="Segna come Da Pagare"
                        >
                          <X size={18} />
                        </button>
                      )}

                      {!order.delivered ? (
                        <button
                          onClick={() => handleDeliveredChange(order.id, true)}
                          className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                          title="Segna come Consegnato"
                        >
                          <Download size={18} className="rotate-180" /> {/* Using Download icon rotated as 'Arrived' icon placeholder */}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleDeliveredChange(order.id, false)}
                          className="p-2 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 transition-colors"
                          title="Segna come Non Consegnato"
                        >
                          <X size={18} />
                        </button>
                      )}
                      
                      <button
                        onClick={() => setDeleteModal({ show: true, orderId: order.id })}
                        className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                        title="Elimina Ordine"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View for Orders */}
        <div className="md:hidden divide-y divide-gray-100">
            {filteredOrders.map((order) => (
                <div key={order.id} className="p-4 space-y-4">
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="font-semibold text-gray-900">{order.user.nome}</div>
                            <div className="text-xs text-gray-500">{order.user.email}</div>
                            <div className="text-xs text-gray-500 mt-1">Classe: {order.user.classe || "N/A"}</div>
                        </div>
                        <div className="text-xs font-mono text-gray-400">#{order.id.slice(-6).toUpperCase()}</div>
                    </div>

                    <div className="space-y-2">
                        {order.items.map((item) => (
                            <div key={item.id} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <span className="font-medium text-gray-900">{item.quantity}x</span>
                                    <span className="text-gray-700">{item.productVariant.productColor.product.name}</span>
                                </div>
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                    <div className="w-2 h-2 rounded-full border border-gray-300" style={{ backgroundColor: item.productVariant.productColor.color }} />
                                    {item.productVariant.size}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-gray-50">
                        <span className="text-sm text-gray-500">Totale</span>
                        <span className="font-bold text-gray-900">€ {order.total.toFixed(2)}</span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                order.status === "PAID"
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                        >
                            {order.status === "PAID" ? "PAGATO" : "DA PAGARE"}
                        </span>
                        <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                order.delivered
                                ? "bg-blue-100 text-blue-800"
                                : "bg-orange-100 text-orange-800"
                            }`}
                        >
                            {order.delivered ? "CONSEGNATO" : "NON CONSEGNATO"}
                        </span>
                    </div>

                    <div className="flex gap-2 pt-2">
                        {order.status !== "PAID" ? (
                        <button
                          onClick={() => handleStatusChange(order.id, "PAID")}
                          className="flex-1 p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors flex justify-center"
                          title="Segna come Pagato"
                        >
                          <Check size={18} />
                        </button>
                      ) : (
                         <button
                          onClick={() => handleStatusChange(order.id, "PENDING")}
                          className="flex-1 p-2 bg-yellow-50 text-yellow-600 rounded-lg hover:bg-yellow-100 transition-colors flex justify-center"
                          title="Segna come Da Pagare"
                        >
                          <X size={18} />
                        </button>
                      )}

                      {!order.delivered ? (
                        <button
                          onClick={() => handleDeliveredChange(order.id, true)}
                          className="flex-1 p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors flex justify-center"
                          title="Segna come Consegnato"
                        >
                          <Download size={18} className="rotate-180" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleDeliveredChange(order.id, false)}
                          className="flex-1 p-2 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 transition-colors flex justify-center"
                          title="Segna come Non Consegnato"
                        >
                          <X size={18} />
                        </button>
                      )}
                      
                      <button
                        onClick={() => setDeleteModal({ show: true, orderId: order.id })}
                        className="flex-1 p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors flex justify-center"
                        title="Elimina Ordine"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                </div>
            ))}
        </div>
      </div>
      
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <h2 className="text-2xl font-bold text-gray-900">Inventario</h2>
            <div className="flex gap-4 w-full md:w-auto">
                <select
                value={filterStock}
                onChange={(e) => setFilterStock(e.target.value)}
                className="border text-black border-gray-200 p-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all flex-1 md:w-auto"
                >
                <option value="ALL">Tutti gli Stati</option>
                <option value="AVAILABLE">Disponibile</option>
                <option value="OUT_OF_STOCK">Esaurito</option>
                </select>
                <select
                value={filterProduct}
                onChange={(e) => setFilterProduct(e.target.value)}
                className="border text-black border-gray-200 p-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all flex-1 md:w-auto"
                >
                <option value="">Tutti i Prodotti</option>
                {products.map((p) => (
                    <option key={p.id} value={p.id}>
                    {p.name}
                    </option>
                ))}
                </select>
            </div>
          </div>
          <div className="flex flex-col gap-8">
            {products
              .filter((p) => !filterProduct || p.id === filterProduct)
              .map((product) => {
                const filteredColors = product.colors.map(color => ({
                    ...color,
                    variants: color.variants.filter(v => {
                        if (filterStock === "ALL") return true;
                        if (filterStock === "AVAILABLE") return v.stock > 0;
                        if (filterStock === "OUT_OF_STOCK") return v.stock === 0;
                        return true;
                    })
                })).filter(c => c.variants.length > 0);

                if (filteredColors.length === 0) return null;

                return (
              <div key={product.id} className="border border-gray-200 rounded-xl overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                  <h3 className="font-bold text-lg text-gray-900">{product.name}</h3>
                  <span className="text-sm text-gray-500">
                    {filteredColors.reduce((acc, c) => acc + c.variants.length, 0)} varianti
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-white text-gray-500 font-medium border-b border-gray-100">
                      <tr>
                        <th className="px-6 py-3 w-1/3">Variante</th>
                        <th className="px-6 py-3 text-center">Stock</th>
                        <th className="px-6 py-3 text-center">Venduti</th>
                        <th className="px-6 py-3 text-right">Stato</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {filteredColors.map((color) => (
                        color.variants.map((variant) => {
                          const sold = orders.reduce((acc, order) => {
                            if (order.status !== "PAID") return acc;
                            const item = order.items.find(
                              (i) =>
                                i.productVariant.productColor.product.name === product.name &&
                                i.productVariant.productColor.color === color.color &&
                                i.productVariant.size === variant.size
                            );
                            return acc + (item ? item.quantity : 0);
                          }, 0);

                          return (
                            <tr key={variant.id} className="hover:bg-gray-50/50 transition-colors">
                              <td className="px-6 py-3 font-medium text-gray-700 flex items-center gap-2">
                                  <div className="w-4 h-4 rounded-full border border-gray-300 shadow-sm" style={{ backgroundColor: color.color }} />
                                  {variant.size}
                              </td>
                              <td className="px-6 py-3 text-center font-mono text-gray-600">{variant.stock}</td>
                              <td className="px-6 py-3 text-center font-bold text-blue-600">{sold}</td>
                              <td className="px-6 py-3 text-right">
                                <span
                                  className={`inline-block px-2 py-1 rounded-full text-xs font-bold ${
                                    variant.stock > 0
                                      ? "bg-green-100 text-green-700"
                                      : "bg-red-100 text-red-700"
                                  }`}
                                >
                                  {variant.stock > 0 ? "Disponibile" : "Esaurito"}
                                </span>
                              </td>
                            </tr>
                          );
                        })
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
            })}
          </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                <AlertCircle size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Elimina Ordine</h3>
                <p className="text-gray-500 mt-1">
                  Sei sicuro di voler eliminare questo ordine? Questa azione non può essere annullata e ripristinerà lo stock dei prodotti.
                </p>
              </div>
              <div className="flex gap-3 w-full mt-2">
                <button
                  onClick={() => setDeleteModal({ show: false, orderId: null })}
                  className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                >
                  Annulla
                </button>
                <button
                  onClick={handleDeleteOrder}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20"
                >
                  Elimina
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

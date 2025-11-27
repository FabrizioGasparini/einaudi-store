"use client";

import { useState } from "react";
import { Plus, Edit, Trash2, Save, X, Package, Layers } from "lucide-react";
import Modal from "./ui/Modal";

type Variant = {
  id?: string;
  size: string;
  stock: number;
};

type ProductColor = {
  id?: string;
  color: string;
  name?: string;
  variants: Variant[];
};

type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  active: boolean;
  colors: ProductColor[];
};

export default function AdminProducts({ initialProducts }: { initialProducts: Product[] }) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Modal states
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [alertModalOpen, setAlertModalOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const showAlert = (message: string) => {
    setAlertMessage(message);
    setAlertModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    const isNew = !editingProduct.id;
    const url = isNew ? "/api/products" : `/api/products/${editingProduct.id}`;
    const method = isNew ? "POST" : "PUT";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingProduct),
      });

      if (res.ok) {
        const savedProduct = await res.json();
        if (isNew) {
          setProducts([...products, savedProduct]);
        } else {
          setProducts(products.map((p) => (p.id === savedProduct.id ? savedProduct : p)));
        }
        setEditingProduct(null);
        setIsCreating(false);
        window.location.reload();
      } else {
        showAlert("Failed to save product");
      }
    } catch (error) {
      console.error(error);
      showAlert("Error saving product");
    }
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;

    try {
      const res = await fetch(`/api/products/${productToDelete}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setProducts(products.filter((p) => p.id !== productToDelete));
        setDeleteModalOpen(false);
        setProductToDelete(null);
      } else {
        const data = await res.json();
        showAlert(data.error || "Failed to delete");
      }
    } catch (error) {
      console.error(error);
      showAlert("Error deleting product");
    }
  };

  const handleDeleteClick = (id: string) => {
    setProductToDelete(id);
    setDeleteModalOpen(true);
  };

  const addColor = () => {
    if (!editingProduct) return;
    setEditingProduct({
      ...editingProduct,
      colors: [...editingProduct.colors, { color: "#000000", name: "", variants: [] }],
    });
  };

  const removeColor = (index: number) => {
    if (!editingProduct) return;
    const newColors = editingProduct.colors.filter((_, i) => i !== index);
    setEditingProduct({ ...editingProduct, colors: newColors });
  };

  const updateColor = (index: number, field: "color" | "name", value: string) => {
    if (!editingProduct) return;
    const newColors = [...editingProduct.colors];
    newColors[index] = { ...newColors[index], [field]: value };
    setEditingProduct({ ...editingProduct, colors: newColors });
  };

  const addVariant = (colorIndex: number) => {
    if (!editingProduct) return;
    const newColors = [...editingProduct.colors];
    newColors[colorIndex].variants.push({ size: "", stock: 0 });
    setEditingProduct({ ...editingProduct, colors: newColors });
  };

  const removeVariant = (colorIndex: number, variantIndex: number) => {
    if (!editingProduct) return;
    const newColors = [...editingProduct.colors];
    newColors[colorIndex].variants = newColors[colorIndex].variants.filter((_, i) => i !== variantIndex);
    setEditingProduct({ ...editingProduct, colors: newColors });
  };

  const updateVariant = (colorIndex: number, variantIndex: number, field: keyof Variant, value: string | number) => {
    if (!editingProduct) return;
    const newColors = [...editingProduct.colors];
    newColors[colorIndex].variants[variantIndex] = {
      ...newColors[colorIndex].variants[variantIndex],
      [field]: value,
    };
    setEditingProduct({ ...editingProduct, colors: newColors });
  };


  if (editingProduct) {
    return (
      <div className="bg-white/80 backdrop-blur-md border border-white/20 shadow-xl rounded-2xl p-8 animate-in fade-in zoom-in duration-300">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-linear-to-r from-blue-600 to-indigo-600">
            {isCreating ? "Crea Nuovo Prodotto" : "Modifica Prodotto"}
            </h2>
            <button
              type="button"
              onClick={() => {
                setEditingProduct(null);
                setIsCreating(false);
              }}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={20} className="text-gray-500" />
            </button>
        </div>
        
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Nome</label>
                <input
                type="text"
                value={editingProduct.name}
                onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                className="w-full text-black px-4 py-2 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all bg-white/50"
                required
                placeholder="Nome Prodotto"
                />
            </div>
            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Prezzo (€)</label>
                <input
                type="number"
                step="0.01"
                value={editingProduct.price}
                onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) })}
                className="w-full text-black px-4 py-2 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all bg-white/50"
                required
                />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Descrizione</label>
            <textarea
              value={editingProduct.description || ""}
              onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
              className="w-full text-black px-4 py-2 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all bg-white/50 min-h-[100px]"
              placeholder="Descrizione del prodotto..."
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">URL Immagine</label>
            <input
              type="text"
              value={editingProduct.imageUrl || ""}
              onChange={(e) => setEditingProduct({ ...editingProduct, imageUrl: e.target.value })}
              className="w-full text-black px-4 py-2 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all bg-white/50"
              placeholder="https://..."
            />
          </div>

          <div className="flex items-center gap-3 p-4 bg-gray-50/50 rounded-xl border border-gray-100">
            <input
              type="checkbox"
              checked={editingProduct.active}
              onChange={(e) => setEditingProduct({ ...editingProduct, active: e.target.checked })}
              id="active"
              className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
            />
            <label htmlFor="active" className="text-sm font-medium text-gray-700 cursor-pointer select-none">
                Attivo (Visibile nel negozio)
            </label>
          </div>

          <div className="border-t border-gray-100 pt-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <Layers size={18} /> Varianti (Colori)
                </h3>
                <button
                type="button"
                onClick={addColor}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                >
                <Plus size={16} /> Aggiungi Colore
                </button>
            </div>
            
            <div className="space-y-6">
                {editingProduct.colors.map((colorGroup, colorIndex) => (
                <div key={colorIndex} className="bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="flex items-center gap-2">
                            <input
                                type="color"
                                value={colorGroup.color || "#000000"}
                                onChange={(e) => updateColor(colorIndex, "color", e.target.value)}
                                className="h-10 w-14 p-1 rounded-lg border border-gray-200 cursor-pointer"
                            />
                            <input
                                type="text"
                                value={colorGroup.color}
                                onChange={(e) => updateColor(colorIndex, "color", e.target.value)}
                                className="w-24 text-black px-3 py-1.5 rounded-lg border border-gray-200 text-sm focus:border-blue-500 outline-none uppercase"
                                placeholder="#000000"
                            />
                            <input
                                type="text"
                                value={colorGroup.name || ""}
                                onChange={(e) => updateColor(colorIndex, "name", e.target.value)}
                                className="w-40 text-black px-3 py-1.5 rounded-lg border border-gray-200 text-sm focus:border-blue-500 outline-none"
                                placeholder="Nome (es. Rosso)"
                            />
                        </div>
                        <div className="grow"></div>
                        <button
                            type="button"
                            onClick={() => removeColor(colorIndex)}
                            className="text-red-500 hover:text-red-700 text-sm font-medium"
                        >
                            Rimuovi Colore
                        </button>
                    </div>

                    <div className="space-y-2 pl-4 border-l-2 border-gray-200">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-bold text-gray-500 uppercase">Taglie e Stock</span>
                            <button
                                type="button"
                                onClick={() => addVariant(colorIndex)}
                                className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                            >
                                <Plus size={12} /> Aggiungi Taglia
                            </button>
                        </div>
                        
                        {colorGroup.variants.map((variant, variantIndex) => (
                            <div key={variantIndex} className="flex gap-3 items-center">
                                <div className="w-24">
                                    <input
                                        type="text"
                                        value={variant.size}
                                        onChange={(e) => updateVariant(colorIndex, variantIndex, "size", e.target.value)}
                                        className="w-full text-black px-3 py-1.5 rounded-lg border border-gray-200 text-sm focus:border-blue-500 outline-none"
                                        placeholder="Taglia"
                                    />
                                </div>
                                <div className="w-24">
                                    <input
                                        type="number"
                                        value={variant.stock}
                                        onChange={(e) => updateVariant(colorIndex, variantIndex, "stock", parseInt(e.target.value))}
                                        className="w-full text-black px-3 py-1.5 rounded-lg border border-gray-200 text-sm focus:border-blue-500 outline-none"
                                        placeholder="Stock"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => removeVariant(colorIndex, variantIndex)}
                                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                        {colorGroup.variants.length === 0 && (
                            <div className="text-xs text-gray-400 italic">Nessuna taglia aggiunta.</div>
                        )}
                    </div>
                </div>
                ))}
                {editingProduct.colors.length === 0 && (
                    <div className="text-center py-8 text-gray-400 bg-gray-50/30 rounded-xl border border-dashed border-gray-200">
                      Nessun colore aggiunto. Clicca "Aggiungi Colore" per iniziare.
                    </div>
                )}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-linear-to-r from-blue-600 to-indigo-600 text-white px-6 py-2.5 rounded-xl hover:shadow-lg hover:shadow-blue-500/20 transition-all flex items-center justify-center gap-2 font-medium"
            >
              <Save size={18} /> Salva Prodotto
            </button>
            <button
              type="button"
              onClick={() => {
                setEditingProduct(null);
                setIsCreating(false);
              }}
              className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur-md border border-white/20 shadow-xl rounded-2xl p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
            <h2 className="text-2xl font-bold text-gray-800">Gestione Prodotti</h2>
            <p className="text-gray-500 text-sm">Gestisci il tuo inventario e le inserzioni del negozio</p>
        </div>
        <button
          onClick={() => {
            setEditingProduct({
              id: "",
              name: "",
              description: "",
              price: 0,
              imageUrl: "",
              active: true,
              colors: [],
            });
            setIsCreating(true);
          }}
          className="bg-linear-to-r from-blue-600 to-indigo-600 text-white px-5 py-2.5 rounded-xl hover:shadow-lg hover:shadow-blue-500/20 transition-all flex items-center gap-2 font-medium"
        >
          <Plus size={18} /> Aggiungi Prodotto
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-100">
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
            <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100">
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Nome</th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Prezzo</th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Stato</th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Varianti</th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Azioni</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
                {products.map((product) => (
                <tr key={product.id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 overflow-hidden">
                                {product.imageUrl ? (
                                    <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                                ) : (
                                    <Package size={20} />
                                )}
                            </div>
                            <span className="font-medium text-gray-800">{product.name}</span>
                        </div>
                    </td>
                    <td className="p-4 text-gray-600">€ {product.price.toFixed(2)}</td>
                    <td className="p-4">
                    <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                        product.active 
                            ? "bg-green-50 text-green-700 border-green-100" 
                            : "bg-gray-100 text-gray-600 border-gray-200"
                        }`}
                    >
                        {product.active ? "Attivo" : "Bozza"}
                    </span>
                    </td>
                    <td className="p-4">
                        <div className="flex flex-col gap-1">
                            {product.colors.slice(0, 2).map((c, i) => (
                                <div key={i} className="flex items-center gap-1">
                                    <div className="w-3 h-3 rounded-full border border-gray-200" style={{ backgroundColor: c.color }} title={c.name || c.color}></div>
                                    {c.name && <span className="text-xs text-gray-500">{c.name}</span>}
                                    <div className="flex flex-wrap gap-1">
                                        {c.variants.slice(0, 3).map((v, j) => (
                                            <span key={j} className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded border border-gray-200">
                                                {v.size} ({v.stock})
                                            </span>
                                        ))}
                                        {c.variants.length > 3 && <span className="text-xs text-gray-400">...</span>}
                                    </div>
                                </div>
                            ))}
                            {product.colors.length > 2 && (
                                <span className="text-xs text-gray-400 px-1">+{product.colors.length - 2} altri colori</span>
                            )}
                            {product.colors.length === 0 && (
                                <span className="text-xs text-red-400 italic">Nessuno stock</span>
                            )}
                        </div>
                    </td>
                    <td className="p-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                        onClick={() => setEditingProduct(product)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Modifica"
                        >
                        <Edit size={18} />
                        </button>
                        <button
                        onClick={() => handleDeleteClick(product.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Elimina"
                        >
                        <Trash2 size={18} />
                        </button>
                    </div>
                    </td>
                </tr>
                ))}
                {products.length === 0 && (
                    <tr>
                        <td colSpan={5} className="p-8 text-center text-gray-500">
                            Nessun prodotto trovato. Clicca "Aggiungi Prodotto" per crearne uno.
                        </td>
                    </tr>
                )}
            </tbody>
            </table>
        </div>
      </div>

      <Modal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} title="Conferma Eliminazione">
        <div className="space-y-4">
            <p className="text-gray-600">Sei sicuro di voler eliminare questo prodotto? Questa azione non può essere annullata.</p>
            <div className="flex justify-end gap-3">
                <button 
                    onClick={() => setDeleteModalOpen(false)}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors font-medium"
                >
                    Annulla
                </button>
                <button 
                    onClick={confirmDelete}
                    className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium shadow-lg shadow-red-600/20"
                >
                    Elimina
                </button>
            </div>
        </div>
      </Modal>

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
"use client";

import { useState, useEffect } from "react";
import { X, ShoppingCart, Check, LogIn, RotateCw, Hourglass } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Modal from "./ui/Modal";

type ProductVariant = {
  id: string;
  size: string;
  stock: number;
};

type ProductColor = {
  id: string;
  color: string;
  name?: string;
  variants: ProductVariant[];
};

type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  backImageUrl: string | null;
  hasVariants: boolean;
  category: string | null;
  isVariablePrice?: boolean;
  colors: ProductColor[];
};

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProductModal({ product, isOpen, onClose }: ProductModalProps) {
  const { addToCart, items } = useCart();
  const { data: session } = useSession();
  const router = useRouter();
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [isClosing, setIsClosing] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [alertModalOpen, setAlertModalOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const showAlert = (message: string) => {
    setAlertMessage(message);
    setAlertModalOpen(true);
  };

  const [showBack, setShowBack] = useState(false);
  const [isStoreOpen, setIsStoreOpen] = useState(false);

  useEffect(() => {
    const checkStoreStatus = () => {
      const now = new Date();
      const target = new Date();
      target.setHours(20, 0, 0, 0);
      
      // If now is past 20:00, store is open
      if (now.getTime() >= target.getTime()) {
        setIsStoreOpen(true);
      } else {
        setIsStoreOpen(false);
      }
    };
    
    checkStoreStatus();
    const timer = setInterval(checkStoreStatus, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (isOpen && product) {
      setIsClosing(false);
      setShowLoginPrompt(false);
      setShowBack(false);

      if (!product.hasVariants && product.colors.length > 0 && product.colors[0].variants.length > 0) {
        // Auto-select for single products
        setSelectedColor(product.colors[0].color);
        setSelectedSize(product.colors[0].variants[0].size);
      } else {
        setSelectedColor("");
        setSelectedSize("");
      }
    }
  }, [isOpen, product]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(onClose, 300); // Match animation duration
  };

  if (!isOpen || !product) return null;

  const colors = product.colors.map((c) => c.color);
  const selectedColorGroup = product.colors.find((c) => c.color === selectedColor);
  const sizes = selectedColorGroup ? selectedColorGroup.variants.map((v) => v.size) : [];

  const selectedVariant = selectedColorGroup?.variants.find((v) => v.size === selectedSize);

  const handleAddToCart = () => {
    if (!selectedVariant) return;

    if (!session) {
      setShowLoginPrompt(true);
      return;
    }

    const currentItem = items.find(i => i.variantId === selectedVariant.id);
    const currentQty = currentItem ? currentItem.quantity : 0;

    if (currentQty + 1 > selectedVariant.stock) {
      showAlert(`Non puoi aggiungere altri articoli di questo tipo (limite raggiunto).`);
      return;
    }

    if (selectedVariant.stock <= 0) {
      showAlert("Questo articolo è esaurito!");
      return;
    }

    addToCart({
      productId: product.id,
      variantId: selectedVariant.id,
      name: product.name,
      color: selectedColor,
      colorName: selectedColorGroup?.name,
      size: selectedSize,
      price: product.price,
      quantity: 1,
    });
    handleClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div
        className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${isClosing ? "opacity-0" : "opacity-100"}`}
        onClick={handleClose}
      />

      <div
        className={`relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl flex flex-col md:flex-row transition-all duration-300 transform max-h-[90vh] overflow-y-auto md:overflow-hidden ${isClosing ? "scale-95 opacity-0" : "scale-100 opacity-100"}`}
      >
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 p-2 bg-white/80 backdrop-blur-md rounded-full hover:bg-white transition-colors shadow-sm"
        >
          <X size={20} className="text-gray-500" />
        </button>

        {/* Image Section */}
        <div
          className="w-full md:w-1/2 bg-gray-50 relative min-h-[300px] md:min-h-[500px] group shrink-0 cursor-pointer"
          onClick={() => product.backImageUrl && setShowBack(!showBack)}
        >
          {product.imageUrl ? (
            <>
              <img
                src={product.imageUrl}
                alt={product.name}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${product.backImageUrl ? (showBack ? "opacity-0" : "group-hover:opacity-0") : ""}`}
              />
              {product.backImageUrl && (
                <>
                  <img
                    src={product.backImageUrl}
                    alt={`${product.name} - Retro`}
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${showBack ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
                  />
                  <div className="absolute bottom-4 right-4 bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-sm md:hidden">
                    <RotateCw size={20} className="text-gray-600" />
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-gray-300">
              <span className="text-4xl font-light">Einaudi Store</span>
            </div>
          )}
        </div>

        {/* Details Section */}
        <div className="w-full md:w-1/2 p-8 flex flex-col relative animate-slide-in-right overflow-y-auto">
          {showLoginPrompt && (
            <div className="absolute inset-0 z-20 bg-white/90 backdrop-blur-sm flex items-center justify-center p-6 rounded-r-3xl animate-in fade-in duration-200">
              <div className="text-center max-w-xs">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
                  <LogIn size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Accedi per acquistare</h3>
                <p className="text-gray-500 mb-6 text-sm">Devi effettuare l'accesso con la tua email scolastica per aggiungere articoli al carrello.</p>
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => router.push("/login")}
                    className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
                  >
                    Vai al Login
                  </button>
                  <button
                    onClick={() => setShowLoginPrompt(false)}
                    className="w-full py-3 text-gray-500 font-medium hover:text-gray-700 transition-colors"
                  >
                    Annulla
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h2>
            {product.isVariablePrice ? (
              <>
                <div className="flex items-center gap-3">
                  <span className="text-xl text-red-500 line-through font-bold">€ {(product.price + 3).toFixed(2)}</span>
                  <p className="text-3xl font-bold text-blue-600">€ {product.price.toFixed(2)}</p>
                </div>
                <p className="text-xs text-gray-400 mt-1">NB: il prezzo è variabile al numero di pezzi che verranno venduti</p>
              </>
            ) : (
              <p className="text-2xl font-semibold text-blue-600">€ {product.price.toFixed(2)}</p>
            )}
          </div>

          <div className="prose prose-sm text-gray-500 mb-8">
            {product.description}
          </div>

          <div className="space-y-6 mb-8">
            {product.hasVariants && (
              <>
                {/* Colors */}
                <div>
                  <span className="text-sm font-medium text-gray-900 block mb-3">
                    Colore {selectedColorGroup?.name ? <span className="text-gray-500 font-normal">- {selectedColorGroup.name}</span> : ""}
                  </span>
                  <div className="flex flex-wrap gap-3">
                    {product.colors.map((c) => (
                      <button
                        key={c.color}
                        onClick={() => {
                          setSelectedColor(c.color);
                          setSelectedSize("");
                        }}
                        className={`w-10 h-10 rounded-full transition-all border-2 ${selectedColor === c.color
                          ? "border-blue-600 scale-110 shadow-md"
                          : "border-gray-400 hover:scale-105 hover:shadow-sm"
                          }`}
                        style={{ backgroundColor: c.color }}
                        title={c.name || c.color}
                      />
                    ))}
                  </div>
                </div>

                {/* Sizes */}
                <div>
                  <span className="text-sm font-medium text-gray-900 block mb-3">Taglia</span>
                  <div className="flex flex-wrap gap-3">
                    {sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`w-12 h-12 rounded-xl flex items-center justify-center text-sm font-medium transition-all border ${selectedSize === size
                          ? "border-blue-600 bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-600"
                          : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                          }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="mt-auto pt-6 border-t border-gray-100">
            <div className="flex items-center justify-between mb-4">
              {selectedVariant ? (
                selectedVariant.stock > 0 ? (
                  <span className="flex items-center gap-2 text-green-600 text-sm font-medium">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    Disponibile
                  </span>
                ) : (
                  <span className="text-red-500 text-sm font-medium">Esaurito</span>
                )
              ) : (
                <span className="text-gray-400 text-sm">Seleziona le opzioni</span>
              )}
            </div>

            <button
              onClick={handleAddToCart}
              disabled={!isStoreOpen || !selectedColor || !selectedSize || (selectedVariant?.stock || 0) <= 0}
              className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-black hover:-translate-y-1 hover:shadow-2xl active:scale-[0.98] transition-all disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed shadow-xl shadow-gray-900/10 flex items-center justify-center gap-3"
            >
              {!isStoreOpen ? (
                <>
                  <Hourglass size={20} className="animate-spin-slow" />
                  In attesa del drop...
                </>
              ) : (
                <>
                  <ShoppingCart size={20} />
                  {selectedVariant && selectedVariant.stock <= 0 ? "Esaurito" : "Aggiungi al Carrello"}
                </>
              )}
            </button>

            <p className="text-xs text-gray-500 text-center mt-3">
              Nota: Questo è un ordine di prenotazione. Non verrà richiesto alcun pagamento immediato.
            </p>
          </div>
        </div>
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

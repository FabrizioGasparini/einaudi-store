"use client";

import { ShoppingBag, Hourglass } from "lucide-react";
import { useState, useEffect } from "react";

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
  isVariablePrice?: boolean;
  colors: ProductColor[];
};

interface ProductCardProps {
  product: Product;
  onClick: () => void;
  index?: number;
}

export default function ProductCard({ product, onClick, index = 0 }: ProductCardProps) {
  const colors = product.colors.map((c) => c.color);
  const totalStock = product.colors.reduce((acc, c) => acc + c.variants.reduce((vAcc, v) => vAcc + v.stock, 0), 0);
  const [isStoreOpen, setIsStoreOpen] = useState(false);

  useEffect(() => {
    const checkStoreStatus = () => {
      const now = new Date();
      const target = new Date();
      target.setHours(20, 0, 0, 0);
      
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

  return (
    <div 
      onClick={onClick}
      className="group bg-white rounded-3xl border border-gray-100 overflow-hidden flex flex-col cursor-pointer hover:shadow-2xl hover:shadow-blue-900/10 transition-all duration-500 hover:-translate-y-2 active:scale-[0.98] relative animate-fade-in-up"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="relative h-96 bg-gray-50 flex items-center justify-center overflow-hidden">
        {product.imageUrl ? (
          <img  
            src={product.imageUrl} 
            alt={product.name} 
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" 
          />
        ) : (
          <div className="flex flex-col items-center text-gray-300">
            <span className="text-4xl font-light">Einaudi</span>
            <span className="text-xs uppercase tracking-widest mt-2">Store</span>
          </div>
        )}
        
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />

        {totalStock <= 0 && (
             <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center z-10">
                 <span className="bg-black text-white text-xs font-bold px-4 py-2 rounded-full uppercase tracking-wider shadow-lg">Esaurito</span>
             </div>
        )}

        <div className="absolute bottom-4 right-4 translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 ease-out">
            <button className="bg-white text-black p-3 rounded-full shadow-lg hover:bg-blue-600 hover:text-white transition-colors">
                {isStoreOpen ? <ShoppingBag size={20} /> : <Hourglass size={20} className="animate-spin-slow" />}
            </button>
        </div>
      </div>
      
      <div className="p-6 flex flex-col gap-3 grow">
        <div className="flex justify-between items-start">
            <div>
                <h2 className="text-lg font-bold text-gray-900 leading-tight group-hover:text-blue-600 transition-colors">{product.name}</h2>
                <p className="text-gray-400 text-sm mt-1 line-clamp-1">{product.description}</p>
            </div>
        </div>
        
        <div className="mt-auto pt-4 flex items-center justify-between">
            <div className="flex flex-col">
              {product.isVariablePrice ? (
                <>
                  <span className="text-sm text-red-500 line-through font-bold">€ {(product.price + 3).toFixed(2)}</span>
                  <span className="text-xl font-bold text-gray-900">
                    € {product.price.toFixed(2)}
                  </span>
                </>
              ) : (
                <span className="text-xl font-bold text-gray-900">
                  € {product.price.toFixed(2)}
                </span>
              )}
            </div>
            
            <div className="flex -space-x-2">
                {product.colors.slice(0, 3).map((c, i) => (
                    <div 
                        key={i} 
                        className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                        style={{ backgroundColor: c.color }}
                        title={c.name || c.color}
                    />
                ))}
                {product.colors.length > 3 && (
                    <div className="w-6 h-6 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-[10px] text-gray-500 font-medium">
                        +{product.colors.length - 3}
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import ProductCard from "./ProductCard";
import ProductModal from "./ProductModal";

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
  description: string | null;
  price: number;
  imageUrl: string | null;
  backImageUrl: string | null;
  hasVariants: boolean;
  category: string | null;
  isVariablePrice?: boolean;
  colors: ProductColor[];
};

export default function ProductGrid({ products }: { products: Product[] }) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
        {products.length > 0 ? (
          products.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              onClick={() => setSelectedProduct(product)}
              index={index}
            />
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-24 text-gray-400 bg-white rounded-2xl border border-dashed border-gray-200">
            <p className="text-lg">Nessun prodotto disponibile al momento.</p>
            <p className="text-sm">Torna a controllare presto!</p>
          </div>
        )}
      </div>

      <ProductModal
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </>
  );
}

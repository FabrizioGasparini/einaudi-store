"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useEffect, useState } from "react";

export default function CartButton() {
  const { items } = useCart();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  if (!mounted) {
    return (
      <Link href="/cart" className="flex items-center gap-2 hover:text-blue-600 transition-colors relative group">
        <ShoppingCart size={20} />
        <span className="hidden sm:inline">Carrello</span>
      </Link>
    );
  }

  return (
    <Link href="/cart" className="flex items-center gap-2 hover:text-blue-600 transition-colors relative group">
      <div className="relative">
        <ShoppingCart size={20} />
        {itemCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full animate-in zoom-in duration-300">
            {itemCount}
          </span>
        )}
      </div>
      <span className="hidden sm:inline font-medium">Carrello</span>
    </Link>
  );
}

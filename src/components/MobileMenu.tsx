"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, LayoutDashboard, Package, LogOut, User } from "lucide-react";
import { signOut } from "next-auth/react";

interface MobileMenuProps {
  user?: {
    name?: string | null;
    email?: string | null;
    class?: string;
    admin?: boolean;
  };
}

export default function MobileMenu({ user }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <div className="md:hidden">
      <button
        onClick={toggleMenu}
        className="p-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 mx-4 bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 flex flex-col gap-2 animate-in slide-in-from-top-5 fade-in duration-200 z-50">
          {user ? (
            <>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl mb-2">
                <div className="flex flex-col">
                  <span className="font-bold text-gray-900">{user.name}</span>
                  <span className="text-xs text-gray-500">{user.email}</span>
                {user.class && (
                  <span className="text-xs mt-2 font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg border border-blue-100">
                    {user.class}
                  </span>
                )}
                </div>
              </div>

              {user.admin && (
                <Link
                  href="/admin"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 p-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-colors font-medium"
                >
                  <LayoutDashboard size={20} />
                  Admin Dashboard
                </Link>
              )}

              <Link
                href="/orders"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 p-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-colors font-medium"
              >
                <Package size={20} />
                I miei Ordini
              </Link>

              <div className="h-px bg-gray-100 my-1"></div>

              <button
                onClick={() => signOut()}
                className="flex items-center gap-3 p-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors font-medium w-full text-left"
              >
                <LogOut size={20} />
                Esci
              </button>
            </>
          ) : (
            <Link
              href="/login"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center gap-2 bg-gray-900 text-white p-3 rounded-xl font-bold hover:bg-black transition-colors"
            >
              <User size={20} />
              Accedi
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

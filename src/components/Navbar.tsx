import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { User, LayoutDashboard, Package, ShoppingBag } from "lucide-react";
import CartButton from "./CartButton";
import LogoutButton from "./LogoutButton";
import MobileMenu from "./MobileMenu";

export default async function Navbar() {
  const session = await getServerSession(authOptions);

  return (
    <nav className="sticky top-4 z-50 mx-4 mt-4 rounded-2xl bg-white/80 backdrop-blur-xl border border-white/40 shadow-xl shadow-blue-900/5 transition-all duration-300 animate-slide-down">
      <div className="container mx-auto px-6 h-16 flex justify-between items-center">
        <Link href="/" className="group flex items-center gap-2">
          <div className="bg-blue-600 text-white p-1.5 rounded-lg shadow-lg shadow-blue-600/30 group-hover:scale-110 transition-transform duration-300">
            <ShoppingBag size={20} strokeWidth={2.5} />
          </div>
          <span className="text-xl font-black tracking-tighter text-gray-900 group-hover:text-blue-600 transition-colors">
            EINAUDI<span className="text-blue-600">STORE</span>
          </span>
        </Link>
        
        <div className="flex items-center gap-2 md:gap-4 text-sm font-medium text-gray-600">
          {session ? (
            <>              
              {/* Desktop Menu */}
              {/* @ts-ignore */}
              {session.user?.admin && (
                <Link href="/admin" className="hidden md:flex items-center gap-2 hover:text-blue-600 transition-colors px-3 py-2 hover:bg-blue-50 rounded-xl" title="Pannello Admin">
                  <LayoutDashboard size={18} />
                  <span>Admin</span>
                </Link>
              )}

              <Link href="/orders" className="hidden md:flex items-center gap-2 hover:text-blue-600 transition-colors px-3 py-2 hover:bg-blue-50 rounded-xl" title="I miei Ordini">
                <Package size={18} />
                <span>Ordini</span>
              </Link>
              
              <div className="px-2">
                <CartButton />
              </div>

              <div className="h-8 w-px bg-gray-200 mx-2 hidden md:block"></div>

              <div className="hidden md:flex items-center gap-3 pl-2">
                <div className="flex flex-col items-end leading-tight">
                  <span className="text-gray-900 font-bold text-xs uppercase tracking-wide">{session.user?.name}</span>
                  {/* @ts-ignore */}
                  {(session.user as any).class && (
                    <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">{(session.user as any).class}</span>
                  )}
                </div>
                
                <LogoutButton />
              </div>

              {/* Mobile Menu */}
              <MobileMenu user={{
                name: session.user?.name,
                email: session.user?.email,
                // @ts-ignore
                class: (session.user as any).class,
                // @ts-ignore
                admin: (session.user as any).admin
              }} />
            </>
          ) : (
            <>
              <Link href="/login" className="hidden md:flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-xl hover:bg-blue-600 transition-all shadow-lg shadow-gray-900/20 hover:shadow-blue-600/30 hover:-translate-y-0.5 font-bold">
                <User size={16} />
                <span>Accedi</span>
              </Link>
              <MobileMenu />
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

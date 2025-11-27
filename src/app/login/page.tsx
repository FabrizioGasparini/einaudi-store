"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { Lock, Mail } from "lucide-react";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [showAdmin, setShowAdmin] = useState(false);

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await signIn("credentials", { password, callbackUrl: "/" });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh]">
      <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-linear-to-r from-gray-900 to-gray-600 tracking-tight">Bentornato</h1>
          <p className="text-gray-500 mt-2">Accedi per entrare nell'Einaudi Store</p>
        </div>
        
        <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl shadow-blue-900/10 border border-white/50">
          <button
            onClick={() => signIn("google", { callbackUrl: "/" })}
            className="w-full bg-white text-gray-700 border border-gray-200 py-4 px-4 rounded-2xl hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center justify-center gap-3 font-medium group shadow-sm hover:shadow-md"
          >
            <Mail size={20} className="text-blue-600 group-hover:scale-110 transition-transform" />
            Accedi con Email Scolastica
          </button>
          
          <div className="mt-6 text-center">
            <button 
                onClick={() => setShowAdmin(!showAdmin)}
                className="text-xs text-gray-300 hover:text-gray-500 transition-colors font-medium"
            >
                {showAdmin ? "Nascondi accesso admin" : "Accesso Admin"}
            </button>
          </div>

          {showAdmin && (
            <div className="mt-4 pt-4 border-t border-gray-100 animate-in slide-in-from-top-2 fade-in duration-200">
                <form onSubmit={handleCredentialsLogin} className="flex flex-col gap-3">
                    <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={14} />
                    <input
                        type="password"
                        placeholder="Password Amministratore"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full text-black pl-10 pr-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all bg-gray-50/50 focus:bg-white"
                    />
                    </div>
                    <button
                    type="submit"
                    className="w-full bg-gray-900 text-white py-2.5 px-4 rounded-xl text-sm font-bold hover:bg-black transition-all active:scale-[0.98]"
                    >
                    Login Admin
                    </button>
                </form>
            </div>
          )}
        </div>
        
        <p className="text-center text-xs text-gray-400 mt-8 font-medium">
          &copy; {new Date().getFullYear()} Istituto Einaudi. Tutti i diritti riservati.
        </p>
      </div>
    </div>
  );
}

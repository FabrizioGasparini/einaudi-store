"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { LogOut, AlertCircle } from "lucide-react";
import { signOut } from "next-auth/react";

export default function LogoutButton() {
  const [showModal, setShowModal] = useState(false);

  const handleLogout = () => {
    signOut({ callbackUrl: "/" });
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center justify-center w-9 h-9 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all duration-200"
        title="Esci"
      >
        <LogOut size={18} />
      </button>

      {showModal && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                <LogOut size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Vuoi uscire?</h3>
                <p className="text-gray-500 mt-1">
                  Sei sicuro di voler effettuare il logout?
                </p>
              </div>
              <div className="flex gap-3 w-full mt-2">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                >
                  Annulla
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20"
                >
                  Esci
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

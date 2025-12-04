"use client";

import { useState } from "react";
import { Search, FileText } from "lucide-react";

type AuditLog = {
  id: string;
  action: string;
  details: string | null;
  userId: string | null;
  user: {
    nome: string | null;
    email: string;
  } | null;
  createdAt: string;
};

export default function AdminLogs({ initialLogs }: { initialLogs: AuditLog[] }) {
  const [logs, setLogs] = useState<AuditLog[]>(initialLogs);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredLogs = logs.filter((log) =>
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (log.details && log.details.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (log.user && log.user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (log.user && log.user.nome && log.user.nome.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
      <div className="p-8 border-b border-gray-100 bg-gray-50/50">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <FileText className="text-blue-600" />
              Audit Logs
            </h2>
            <p className="text-gray-500 mt-1">Monitora le attività del sistema</p>
          </div>
          
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Cerca nei log..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50/80 border-b border-gray-100 backdrop-blur-sm">
            <tr>
              <th className="p-6 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Data</th>
              <th className="p-6 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Utente</th>
              <th className="p-6 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Azione</th>
              <th className="p-6 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Dettagli</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredLogs.length > 0 ? (
              filteredLogs.map((log) => (
                <tr key={log.id} className="group hover:bg-blue-50/30 transition-colors">
                  <td className="p-6 text-sm text-gray-600 whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString("it-IT")}
                  </td>
                  <td className="p-6 text-sm font-medium text-gray-900">
                    {log.user ? (
                      <div className="flex flex-col">
                        <span>{log.user.nome || "N/A"}</span>
                        <span className="text-xs text-gray-500">{log.user.email}</span>
                      </div>
                    ) : (
                      <span className="text-gray-400 italic">Sistema / Anonimo</span>
                    )}
                  </td>
                  <td className="p-6">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {log.action}
                    </span>
                  </td>
                  <td className="p-6 text-sm text-gray-600 max-w-md truncate" title={log.details || ""}>
                    {log.details || "-"}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="p-12 text-center text-gray-500">
                  Nessun log trovato
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      <div className="p-4 bg-gray-50 border-t border-gray-100 text-xs text-gray-500 text-center">
        Visualizzati gli ultimi {filteredLogs.length} log
      </div>
    </div>
  );
}

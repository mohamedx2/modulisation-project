"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search, Filter, Plus } from "lucide-react";

export default function TicketsPage() {
  const { data: session } = useSession();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.accessToken) {
      fetch("http://localhost:3001/tickets", {
        headers: {
          Authorization: `Bearer ${session.accessToken}`
        }
      })
      .then(res => res.json())
      .then(data => { setTickets(data); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });
    }
  }, [session]);

  return (
    <div className="p-8 lg:p-12 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-[#1c1b1b]">Tickets</h1>
          <p className="text-[#a1a1aa] mt-2 font-medium text-lg">Gestion des interventions et rendez-vous.</p>
        </div>
        <button className="bg-[#1c1b1b] text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-black transition-all">
          <Plus className="w-5 h-5" /> Nouveau Ticket
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-black/5 shadow-xl shadow-black/[0.02]">
        <div className="p-4 border-b border-black/5 flex gap-4">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-[#a1a1aa]" />
            <input 
              type="text" 
              placeholder="Rechercher un ticket ou une plaque..." 
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:border-[#f5c800] focus:ring-2 focus:ring-[#f5c800]/20 transition-all outline-none font-medium"
            />
          </div>
          <button className="px-4 py-3 border border-black/5 rounded-xl flex items-center gap-2 font-bold text-[#1c1b1b] hover:bg-gray-50">
            <Filter className="w-5 h-5" /> Filtres
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-black/5 bg-gray-50/50">
                <th className="p-4 font-bold text-xs uppercase tracking-wider text-[#a1a1aa]">ID</th>
                <th className="p-4 font-bold text-xs uppercase tracking-wider text-[#a1a1aa]">Client</th>
                <th className="p-4 font-bold text-xs uppercase tracking-wider text-[#a1a1aa]">V�hicule</th>
                <th className="p-4 font-bold text-xs uppercase tracking-wider text-[#a1a1aa]">Type</th>
                <th className="p-4 font-bold text-xs uppercase tracking-wider text-[#a1a1aa]">Statut</th>
                <th className="p-4 font-bold text-xs uppercase tracking-wider text-[#a1a1aa]">Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? <tr><td colSpan={5} className="p-4 text-center">Chargement...</td></tr> : tickets.map((item: { id: number; userId: number; title: string; description: string; status: string; createdAt: string; }) => (
                <tr key={item} className="border-b border-black/5 hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-black text-[#1c1b1b]">#TK-{2000 + item}</td>
                  <td className="p-4 font-medium text-[#1c1b1b]">Jean Dupont</td>
                  <td className="p-4">
                    <span className="inline-block px-2.5 py-1 bg-gray-100 rounded border border-gray-200 font-mono text-xs font-bold">AB-123-CD</span>
                  </td>
                  <td className="p-4 font-medium text-[#71717a]">Entretien standard</td>
                  <td className="p-4">
                    <span className="inline-block px-3 py-1 bg-blue-50 text-blue-600 rounded-full font-bold text-xs">En cours</span>
                  </td>
                  <td className="p-4 font-medium text-[#a1a1aa]">15 Oct, 09:30</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
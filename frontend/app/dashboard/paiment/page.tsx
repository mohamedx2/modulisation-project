"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CreditCard, Download, ExternalLink } from "lucide-react";

export default function PaymentPage() {
  const { data: session } = useSession();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.accessToken) {
      fetch("http://localhost:3001/payments", {
        headers: {
          Authorization: `Bearer ${session.accessToken}`
        }
      })
      .then(res => res.json())
      .then(data => { setPayments(data); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });
    }
  }, [session]);

  return (
    <div className="p-8 lg:p-12 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-[#1c1b1b]">Paiements</h1>
          <p className="text-[#a1a1aa] mt-2 font-medium text-lg">Historique des transactions et facturation.</p>
        </div>
        <button className="bg-white border border-black/10 text-[#1c1b1b] px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-gray-50 transition-all shadow-sm">
          <Download className="w-5 h-5" /> Exporter CSV
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-[#1c1b1b] text-white p-6 rounded-2xl shadow-xl relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
            <h3 className="text-white/60 font-bold text-xs uppercase tracking-wider mb-2">Revenu Net (Mois)</h3>
            <p className="text-4xl font-black">24,500 �</p>
         </div>
         <div className="bg-white border border-black/5 p-6 rounded-2xl shadow-sm">
            <h3 className="text-[#a1a1aa] font-bold text-xs uppercase tracking-wider mb-2">Paiements en attente</h3>
            <p className="text-4xl font-black text-[#1c1b1b]">1,240 �</p>
         </div>
         <div className="bg-white border border-black/5 p-6 rounded-2xl shadow-sm">
            <h3 className="text-[#a1a1aa] font-bold text-xs uppercase tracking-wider mb-2">Taux de recouvrement</h3>
            <p className="text-4xl font-black text-[#1c1b1b]">94%</p>
         </div>
      </div>

      <div className="bg-white rounded-2xl border border-black/5 shadow-xl shadow-black/[0.02] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-black/5 bg-gray-50/50">
                <th className="p-4 font-bold text-xs uppercase tracking-wider text-[#a1a1aa]">Transaction</th>
                <th className="p-4 font-bold text-xs uppercase tracking-wider text-[#a1a1aa]">Date</th>
                <th className="p-4 font-bold text-xs uppercase tracking-wider text-[#a1a1aa]">M�thode</th>
                <th className="p-4 font-bold text-xs uppercase tracking-wider text-[#a1a1aa]">Statut</th>
                <th className="p-4 font-bold text-xs uppercase tracking-wider text-[#a1a1aa]">Montant</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? <tr><td colSpan={5} className="p-4 text-center">Chargement...</td></tr> : payments.map((item: { id: number; userId: number; amount: number; status: string; createdAt: string; }) => (
                <tr key={item.id} className="border-b border-black/5 hover:bg-gray-50/50 transition-colors">
                  <td className="p-4 font-medium text-[#1c1b1b]">#{item.id}</td>
                  <td className="p-4 font-bold text-[#1c1b1b]">{item.amount} €</td>
                  <td className="p-4"><span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-xs font-bold">{item.status}</span></td>
                  <td className="p-4 text-[#a1a1aa] font-medium">{new Date(item.createdAt).toLocaleDateString()}</td>
                  <td className="p-4 text-right"><button className="text-[#a1a1aa] hover:text-[#1c1b1b] transition-colors">Détails</button></td>
                </tr>
              ))}
              {[1,2,3,4,5].map((item) => (
                <tr key={item} className="border-b border-black/5 hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-black text-[#1c1b1b]">TRX-{8800 + item * 12}</td>
                  <td className="p-4 font-medium text-[#71717a]">Aujourd&apos;hui, 14:23</td>
                  <td className="p-4">
                    <span className="flex items-center gap-2 font-bold text-sm text-[#1c1b1b]">
                      <CreditCard className="w-4 h-4 text-[#a1a1aa]" /> **** 4242
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="inline-block px-3 py-1 bg-green-50 text-green-600 rounded-full font-bold text-xs">Pay�</span>
                  </td>
                  <td className="p-4 font-black text-[#1c1b1b]">350.00 �</td>
                  <td className="p-4 text-right">
                    <button className="text-[#a1a1aa] hover:text-[#1c1b1b] transition-colors">
                      <ExternalLink className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
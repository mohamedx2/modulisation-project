"use client";
import { motion } from "framer-motion";
import { FileText, Smartphone, CreditCard, TrendingUp, Activity, ArrowRight } from "lucide-react";
import Link from "next/link";

const STATS = [
  { label: "Tickets Ouverts", value: "14", icon: FileText, color: "bg-black text-white", trend: "+2.5%" },
  { label: "Plaques Scann�es", value: "1,284", icon: Smartphone, color: "bg-[#f5c800] text-black", trend: "+12.4%" },
  { label: "Paiements (30j)", value: "24,500 �", icon: CreditCard, color: "bg-green-500 text-white", trend: "+5.1%" },
  { label: "Taux de Succ�s OCR", value: "98.2%", icon: TrendingUp, color: "bg-[#1c1b1b] text-white", trend: "+0.8%" },
];

export default function DashboardOverview() {
  return (
    <div className="p-8 lg:p-12 max-w-7xl mx-auto space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-[#1c1b1b]">Aper�u G�n�ral</h1>
          <p className="text-[#a1a1aa] mt-2 font-medium text-lg">Bienvenue sur votre tableau de bord Renault.</p>
        </div>
        <button className="bg-[#f5c800] text-[#1c1b1b] px-6 py-3 rounded-xl font-bold text-sm tracking-wide shadow-lg shadow-[#f5c800]/20 hover:scale-105 active:scale-95 transition-all">
          G�n�rer un Rapport
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {STATS.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.5, ease: "easeOut" }}
            className="bg-white p-6 rounded-2xl border border-black/5 shadow-xl shadow-black/[0.02] hover:-translate-y-1 transition-transform"
          >
            <div className="flex justify-between items-start mb-6">
              <div className={"p-3 rounded-xl " + stat.color}>
                <stat.icon className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-green-600 bg-green-50 border border-green-100 px-2.5 py-1 rounded-full">
                {stat.trend}
              </span>
            </div>
            <h3 className="text-[#a1a1aa] font-bold text-xs uppercase tracking-wider">{stat.label}</h3>
            <p className="text-4xl font-black text-[#1c1b1b] mt-2">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-black/5 p-8 shadow-xl shadow-black/[0.02]">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-black text-[#1c1b1b]">Activit� R�cente</h2>
            <Activity className="text-[#a1a1aa] w-5 h-5" />
          </div>
          <div className="space-y-6">
            {[1, 2, 3].map((_, i) => (
              <div key={i} className="flex items-center justify-between pb-6 border-b border-black/5 last:border-0 last:pb-0">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gray-50 border border-black/5 flex items-center justify-center">
                    <span className="font-bold text-[#1c1b1b] text-sm">AB</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-[#1c1b1b]">Diagnostic Moteur</h4>
                    <p className="text-sm text-[#a1a1aa] font-medium mt-0.5">Plaque: AB-123-CD � Il y a 2h</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-block px-3 py-1 bg-amber-50 text-amber-600 rounded-full font-bold text-xs">En attente</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#1c1b1b] rounded-2xl p-8 shadow-xl relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#f5c800] rounded-bl-full opacity-10" />
          <div>
            <h2 className="text-xl font-black text-white mb-2">Scanner une Plaque</h2>
            <p className="text-[#a1a1aa] text-sm leading-relaxed">
              Utilisez notre syst�me OCR avanc� pour identifier rapidement un v�hicule et cr�er un ticket.
            </p>
          </div>
          <Link href="/dashboard/ocr" className="mt-8 bg-white/10 hover:bg-white/20 border border-white/10 text-white w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors">
            Lancer le scan <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
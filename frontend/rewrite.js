const fs = require("fs");

const dashboardPage = `"use client";
import { motion } from "framer-motion";
import { FileText, Smartphone, CreditCard, TrendingUp, Activity, ArrowRight } from "lucide-react";
import Link from "next/link";

const STATS = [
  { label: "Tickets Ouverts", value: "14", icon: FileText, color: "bg-black text-white", trend: "+2.5%" },
  { label: "Plaques Scannées", value: "1,284", icon: Smartphone, color: "bg-[#f5c800] text-black", trend: "+12.4%" },
  { label: "Paiements (30j)", value: "24,500 €", icon: CreditCard, color: "bg-green-500 text-white", trend: "+5.1%" },
  { label: "Taux de Succès OCR", value: "98.2%", icon: TrendingUp, color: "bg-[#1c1b1b] text-white", trend: "+0.8%" },
];

export default function DashboardOverview() {
  return (
    <div className="p-8 lg:p-12 max-w-7xl mx-auto space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-[#1c1b1b]">Aperçu Général</h1>
          <p className="text-[#a1a1aa] mt-2 font-medium text-lg">Bienvenue sur votre tableau de bord Renault.</p>
        </div>
        <button className="bg-[#f5c800] text-[#1c1b1b] px-6 py-3 rounded-xl font-bold text-sm tracking-wide shadow-lg shadow-[#f5c800]/20 hover:scale-105 active:scale-95 transition-all">
          Générer un Rapport
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
            <h2 className="text-xl font-black text-[#1c1b1b]">Activité Récente</h2>
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
                    <p className="text-sm text-[#a1a1aa] font-medium mt-0.5">Plaque: AB-123-CD • Il y a 2h</p>
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
              Utilisez notre système OCR avancé pour identifier rapidement un véhicule et créer un ticket.
            </p>
          </div>
          <Link href="/dashboard/ocr" className="mt-8 bg-white/10 hover:bg-white/20 border border-white/10 text-white w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors">
            Lancer le scan <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}`

const ticketsPage = `"use client";
import { motion } from "framer-motion";
import { Search, Filter, Plus } from "lucide-react";

export default function TicketsPage() {
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
                <th className="p-4 font-bold text-xs uppercase tracking-wider text-[#a1a1aa]">Véhicule</th>
                <th className="p-4 font-bold text-xs uppercase tracking-wider text-[#a1a1aa]">Type</th>
                <th className="p-4 font-bold text-xs uppercase tracking-wider text-[#a1a1aa]">Statut</th>
                <th className="p-4 font-bold text-xs uppercase tracking-wider text-[#a1a1aa]">Date</th>
              </tr>
            </thead>
            <tbody>
              {[1,2,3,4,5].map((item) => (
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
}`

const ocrPage = `"use client";
import { motion } from "framer-motion";
import { Camera, UploadCloud, CheckCircle2 } from "lucide-react";

export default function OcrScannerPage() {
  return (
    <div className="p-8 lg:p-12 max-w-7xl mx-auto space-y-8">
      <div className="mb-10">
        <h1 className="text-4xl font-black tracking-tight text-[#1c1b1b]">Scanner de Plaque</h1>
        <p className="text-[#a1a1aa] mt-2 font-medium text-lg">Système de reconnaissance automatique de véhicules (LPR).</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl border border-black/5 shadow-xl shadow-black/[0.02] p-8 flex flex-col items-center justify-center min-h-[400px] border-dashed border-2 border-gray-300 relative overflow-hidden group">
          <div className="absolute inset-0 bg-[#f5c800]/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <UploadCloud className="w-16 h-16 text-[#a1a1aa] group-hover:text-[#f5c800] transition-colors mb-6" />
          <h3 className="text-xl font-bold text-[#1c1b1b] text-center mb-2">Glissez une image ici</h3>
          <p className="text-[#a1a1aa] font-medium text-center mb-8">ou cliquez pour parcourir vos fichiers (JPG, PNG)</p>
          <button className="bg-[#1c1b1b] text-white px-8 py-3.5 rounded-xl font-bold shadow-lg hover:bg-black transition-all relative z-10 flex items-center gap-3">
            <Camera className="w-5 h-5" /> Activer la Caméra
          </button>
        </div>

        <div className="bg-gray-50 rounded-2xl border border-black/5 shadow-inner p-8 flex flex-col">
          <h3 className="text-lg font-black text-[#1c1b1b] mb-6">Résultats en Direct</h3>
          
          <div className="flex-1 flex items-center justify-center flex-col text-center opacity-50">
            <div className="w-20 h-12 border-2 border-gray-300 rounded flex items-center justify-center font-mono text-xl font-black text-gray-400 mb-4">
              ---
            </div>
            <p className="text-[#71717a] font-medium">En attente d&apos;une numérisation...</p>
          </div>
          
        </div>
      </div>
    </div>
  );
}`

const paymentPage = `"use client";
import { motion } from "framer-motion";
import { CreditCard, Download, ExternalLink } from "lucide-react";

export default function PaymentPage() {
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
            <p className="text-4xl font-black">24,500 €</p>
         </div>
         <div className="bg-white border border-black/5 p-6 rounded-2xl shadow-sm">
            <h3 className="text-[#a1a1aa] font-bold text-xs uppercase tracking-wider mb-2">Paiements en attente</h3>
            <p className="text-4xl font-black text-[#1c1b1b]">1,240 €</p>
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
                <th className="p-4 font-bold text-xs uppercase tracking-wider text-[#a1a1aa]">Méthode</th>
                <th className="p-4 font-bold text-xs uppercase tracking-wider text-[#a1a1aa]">Statut</th>
                <th className="p-4 font-bold text-xs uppercase tracking-wider text-[#a1a1aa]">Montant</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody>
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
                    <span className="inline-block px-3 py-1 bg-green-50 text-green-600 rounded-full font-bold text-xs">Payé</span>
                  </td>
                  <td className="p-4 font-black text-[#1c1b1b]">350.00 €</td>
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
}`

fs.writeFileSync("app/dashboard/page.tsx", dashboardPage);
fs.writeFileSync("app/dashboard/tickets/page.tsx", ticketsPage);
fs.writeFileSync("app/dashboard/ocr/page.tsx", ocrPage);
fs.writeFileSync("app/dashboard/paiment/page.tsx", paymentPage);

console.log("Pages professionalized!");


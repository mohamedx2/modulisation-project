"use client";
import { motion } from "framer-motion";
import { Settings, Wrench, Info, Target, ArrowLeft, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const SERVICES = [
  { id: 1, title: "Diagnostic Rapide", desc: "Analyse des codes erreurs ODB-II", icon: Target, price: "45 �" },
  { id: 2, title: "Entretien Climatisation", desc: "Recharge fluide et remplacement filtres", icon: Wrench, price: "89 �" },
  { id: 3, title: "R�vision Compl�te", desc: "Vidange, filtres, bougies (100 points)", icon: Settings, price: "249 �" },
  { id: 4, title: "Batterie & Alternateur", desc: "Remplacement et test circuit de charge", icon: Info, price: "Sur devis" },
];

export default function Step2ServicePage() {
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <div className="p-8 lg:p-12 max-w-5xl mx-auto space-y-12">
      <div className="flex flex-col items-center">
        <div className="w-full flex items-center justify-between mb-16 relative">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 -translate-y-1/2 -z-10" />
          <div className="absolute top-1/2 left-0 w-[100%] h-0.5 bg-[#f5c800] -translate-y-1/2 -z-10" />
          {[1,2,3].map((step) => (
             <div key={step} className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-lg border-4 border-white shadow-md ${step <= 2 ? "bg-[#f5c800] text-[#1c1b1b]" : "bg-gray-200 text-gray-400"}`}>
                {step < 2 ? <CheckCircle2 className="w-6 h-6" /> : step}
             </div>
          ))}
        </div>
        
        <h1 className="text-4xl font-black tracking-tight text-[#1c1b1b] text-center mb-4">Nature de l&apos;intervention</h1>
        <p className="text-[#a1a1aa] font-medium text-lg text-center max-w-2xl">
          S�lectionnez le type de service � programmer pour le v�hicule AB-123-CD.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {SERVICES.map((srv, i) => (
          <motion.div
            key={srv.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.4 }}
            onClick={() => setSelected(srv.id)}
            className={`cursor-pointer border-2 rounded-2xl p-6 relative overflow-hidden transition-all ${selected === srv.id ? "bg-white border-[#f5c800] shadow-[0_15px_30px_rgba(245,200,0,0.15)] ring-4 ring-[#f5c800]/10" : "bg-white border-black/5 hover:border-black/20 hover:shadow-lg"}`}
          >
            <div className="flex items-start gap-4">
               <div className={`p-4 rounded-xl ${selected === srv.id ? "bg-[#f5c800] text-[#1c1b1b]" : "bg-gray-50 text-[#a1a1aa]"}`}>
                 <srv.icon className="w-6 h-6" />
               </div>
               <div className="flex-1">
                 <h3 className="text-xl font-black text-[#1c1b1b] tracking-tight">{srv.title}</h3>
                 <p className="text-sm font-medium text-[#71717a] mt-1">{srv.desc}</p>
                 <span className="inline-block mt-4 font-bold bg-gray-100 text-[#1c1b1b] px-3 py-1 rounded-md text-sm">{srv.price}</span>
               </div>
               
               <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${selected === srv.id ? "border-[#f5c800] bg-[#f5c800]" : "border-gray-300"}`}>
                  {selected === srv.id && <div className="w-2.5 h-2.5 rounded-full bg-[#1c1b1b]" />}
               </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="flex items-center justify-between pt-8 border-t border-black/10 mt-12">
        <Link href="/dashboard/step1" className="px-6 py-3 border-2 border-black/10 rounded-xl font-bold text-[#a1a1aa] hover:text-[#1c1b1b] hover:border-black/20 transition-all flex items-center gap-2">
          <ArrowLeft className="w-5 h-5"/> Retour
        </Link>
        <button 
          disabled={!selected}
          className={`px-8 py-3.5 rounded-xl font-bold flex items-center gap-2 transition-all ${selected ? "bg-[#1c1b1b] text-white hover:bg-black shadow-xl" : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}
        >
          Confirmer le service <CheckCircle2 className="w-5 h-5" />
        </button>
      </div>

    </div>
  );
}
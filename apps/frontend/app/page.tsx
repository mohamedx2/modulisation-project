"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, User, ShieldCheck, Activity, BarChart4 } from "lucide-react";

export default function HomePage() {
  return (
    <div className="bg-[#1c1b1b] min-h-screen w-full relative flex flex-col items-center overflow-hidden font-sans selection:bg-[#f5c800] selection:text-[#1c1b1b]">
      
      {/* Dynamic Background */}
      <div className="absolute inset-0 w-full h-full pointer-events-none opacity-30 mix-blend-screen">
        <div className="absolute inset-0 w-full h-full bg-[radial-gradient(circle_at_20%_30%,_#f5c800_0%,_transparent_50%)] opacity-20 animate-pulse" />
        <div className="absolute inset-0 w-full h-full bg-[linear-gradient(to_bottom,#1c1b1b_0%,transparent_50%,#1c1b1b_100%)] z-10" />
      </div>

      {/* Navigation */}
      <nav className="w-full flex items-center justify-between px-8 py-6 max-w-7xl relative z-40">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-[#f5c800] rounded-lg flex items-center justify-center shadow-lg shadow-[#f5c800]/20">
            <ShieldCheck className="w-5 h-5 text-[#1c1b1b]" />
          </div>
          <span className="font-black italic text-xl tracking-tighter text-white">REN<span className="text-[#f5c800]">AULT</span> AXIS</span>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/login" className="text-sm font-bold text-[#a1a1aa] hover:text-white transition-colors uppercase tracking-widest hidden sm:block">
            Support
          </Link>
          <div className="w-px h-4 bg-white/20 hidden sm:block" />
          <Link href="/login" className="text-sm font-bold text-white hover:text-[#f5c800] transition-colors uppercase tracking-widest">
            Portail Client
          </Link>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="relative z-30 flex-1 flex flex-col items-center justify-center w-full max-w-7xl px-4 sm:px-8 mt-12 pb-24">
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col items-center text-center max-w-4xl"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8">
            <span className="w-2 h-2 rounded-full bg-[#f5c800] animate-pulse" />
            <span className="text-xs font-bold text-[#a1a1aa] uppercase tracking-[2px]">Système central d&apos;ingénierie</span>
          </div>
          
          <h1 className="font-black text-5xl sm:text-6xl md:text-7xl lg:text-[80px] leading-[1.05] tracking-tight text-white drop-shadow-2xl mb-10">
            Performance <span className="text-[#f5c800] italic">Absolue.</span><br/>
            Contrôle <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-400 to-white">Total.</span>
          </h1>

          <p className="font-medium text-[#a1a1aa] text-lg sm:text-xl md:text-2xl leading-relaxed max-w-3xl mb-16">
            Plateforme unifiée pour la gestion d&apos;interventions, la facturation automatisée et la reconnaissance OCR des véhicules Renault.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-5 w-full sm:w-auto">
            <Link 
              href="/login"
              className="group w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-5 rounded-2xl bg-[#f5c800] shadow-[0_20px_40px_-10px_rgba(245,200,0,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-[-100%] group-hover:translate-y-0 transition-transform duration-300" />
              <span className="font-black text-[#1c1b1b] text-base uppercase tracking-wide relative z-10">
                Accéder au Dashboard
              </span>
              <ArrowRight className="w-5 h-5 text-[#1c1b1b] relative z-10 group-hover:translate-x-1 transition-transform" />
            </Link>

            <button className="group w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-md transition-all">
              <span className="font-bold text-white text-base uppercase tracking-wide">
                Démo Système
              </span>
              <User className="w-5 h-5 text-[#a1a1aa] group-hover:text-white transition-colors" />
            </button>
          </div>
        </motion.div>

      </main>

      {/* Kinetic Features Array */}
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="w-full border-t border-white/10 bg-black/40 backdrop-blur-xl relative z-40"
      >
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/10">
          {[
            { tag: "01", icon: Activity, title: "Suivi Temps Réel", desc: "Monitorez l&apos;état des interventions au fil de l&apos;eau." },
            { tag: "02", icon: ShieldCheck, title: "Sécurité Keycloak", desc: "Authentification SSO robuste pour les collaborateurs." },
            { tag: "03", icon: BarChart4, title: "Analytique Intégrée", desc: "Rapports de rentabilité et volumes de facturation." }
          ].map((feat) => (
            <div key={feat.tag} className="flex gap-6 p-8 lg:p-12 hover:bg-white/5 transition-colors group cursor-pointer">
              <div className="text-[#a1a1aa] font-black text-4xl opacity-50 group-hover:text-[#f5c800] group-hover:opacity-100 transition-all">
                {feat.tag}
              </div>
              <div>
                <feat.icon className="w-6 h-6 text-[#f5c800] mb-4" />
                <h3 className="text-white font-bold text-lg mb-2">{feat.title}</h3>
                <p className="text-[#a1a1aa] font-medium text-sm leading-relaxed max-w-[250px]">{feat.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

    </div>
  );
}

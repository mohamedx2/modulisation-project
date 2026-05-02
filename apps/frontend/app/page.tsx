"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, Activity, BarChart4, Zap, Lock, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="min-h-screen w-full relative flex flex-col items-center overflow-hidden bg-black selection:bg-primary selection:text-black">

      {/* Premium Mesh Background */}
      <div className="absolute inset-0 mesh-gradient opacity-60 z-0 pointer-events-none" />

      {/* Decorative Grid */}
      <div className="absolute inset-0 opacity-[0.03] z-0 pointer-events-none"
        style={{ backgroundImage: 'linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)', backgroundSize: '60px 60px' }}
      />

      {/* Navigation */}
      <nav className="w-full flex items-center justify-between px-8 lg:px-12 py-8 max-w-7xl relative z-40">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-2xl shadow-primary/20 group">
            <ShieldCheck className="w-6 h-6 text-black transition-transform group-hover:rotate-12" />
          </div>
          <div className="flex flex-col">
            <span className="font-black italic text-2xl tracking-tighter text-white leading-none">
              RENAULT <span className="text-primary">AXIS</span>
            </span>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mt-1">Industrial Intelligence</span>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-10">
          <Link href="#features" className="text-[10px] font-black text-white/50 hover:text-white transition-colors uppercase tracking-[0.2em]">Technologie</Link>
          <Link href="#security" className="text-[10px] font-black text-white/50 hover:text-white transition-colors uppercase tracking-[0.2em]">Sécurité</Link>
          <div className="w-px h-4 bg-white/10" />
          <Link href="/login">
            <Button className="rounded-2xl border border-white/10 bg-transparent hover:border-primary hover:bg-primary/5 text-white hover:text-primary font-black uppercase text-[10px] tracking-[0.3em] h-12 px-8 transition-all duration-500 backdrop-blur-sm">
              Accès Portail
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-30 flex-1 flex flex-col items-center justify-center w-full max-w-7xl px-8 mt-12 pb-32">

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center text-center"
        >
          <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-12">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-[10px] font-black text-white/60 uppercase tracking-[3px]">Next-Gen Automotive Ecosystem</span>
          </div>

          <h1 className="font-black text-6xl sm:text-7xl md:text-8xl lg:text-[110px] leading-[0.9] tracking-tighter text-white uppercase italic mb-12">
            PILOTAGE <br />
            <span className="text-primary">ABSOLU.</span>
          </h1>

          <p className="font-bold text-white/40 text-xl md:text-2xl leading-relaxed max-w-3xl mb-16 uppercase tracking-tight">
            Plateforme centralisée de gestion technique, <span className="text-white italic">analytique prédictive</span> et automatisation des flux après-vente Renault.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-6 w-full sm:w-auto">
            <Link href="/login" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto h-20 px-12 rounded-[2rem] bg-primary text-black font-black uppercase italic tracking-tight text-xl shadow-[0_20px_50px_rgba(255,203,5,0.2)] hover:scale-[1.02] active:scale-[0.98] transition-all">
                Démarrer l'expérience <ArrowRight className="w-6 h-6 ml-3" />
              </Button>
            </Link>

            <Button variant="ghost" size="lg" className="w-full sm:w-auto h-20 px-12 rounded-[2rem] border border-white/10 text-white font-black uppercase italic tracking-tight text-xl hover:bg-white/5 transition-all">
              Spécifications <Zap className="w-6 h-6 ml-3 opacity-40" />
            </Button>
          </div>
        </motion.div>
      </main>

      {/* Stats / Features Grid */}
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.2 }}
        className="w-full bg-zinc-950/50 backdrop-blur-3xl border-t border-white/5 relative z-40"
      >
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/5">
          {[
            { tag: "SYSTÈME", icon: Activity, title: "LPR Diagnostic", desc: "Traitement OCR haute fidélité des matricules via Vision Intelligence." },
            { tag: "SÉCURITÉ", icon: Lock, title: "Auth Keycloak", desc: "Protocole IAM de grade industriel avec chiffrement AES-256." },
            { tag: "RÉSEAU", icon: Globe, title: "Nexus Global", desc: "Synchronisation multi-ateliers en temps réel pour une flotte unifiée." }
          ].map((feat, i) => (
            <div key={i} className="group p-12 lg:p-16 hover:bg-white/[0.02] transition-all cursor-pointer relative overflow-hidden">
              <div className="relative z-10">
                <div className="text-[10px] font-black text-primary tracking-[0.4em] mb-8 opacity-40 group-hover:opacity-100 transition-opacity">{feat.tag}</div>
                <feat.icon className="w-8 h-8 text-white mb-6 group-hover:scale-110 group-hover:text-primary transition-all duration-500" />
                <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-4">{feat.title}</h3>
                <p className="text-white/40 font-bold text-sm leading-relaxed max-w-[280px]">{feat.desc}</p>
              </div>
              {/* Decorative Stripes */}
              <div className="absolute top-0 right-0 w-16 h-full flex gap-1 opacity-[0.02] rotate-12 -mr-4 group-hover:opacity-[0.05] transition-opacity">
                <div className="w-4 h-full bg-primary" />
                <div className="w-2 h-full bg-primary" />
                <div className="w-8 h-full bg-primary" />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

    </div>
  );
}

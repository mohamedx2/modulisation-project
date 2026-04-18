const fs = require("fs");

const loginPage = `"use client";
import { motion } from "framer-motion";
import { ArrowRight, Lock, User, KeyRound, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen w-full bg-[#fcf9f8] relative overflow-hidden font-sans">
      {/* Visual Column - Left */}
      <div className="hidden lg:flex w-[55%] relative items-end justify-start bg-[#1c1b1b] overflow-hidden">
        <div className="absolute inset-0 w-full h-full opacity-60 mix-blend-overlay bg-black">
          {/* We replace the figma 89c16 dba image with a sleek abstract animated background representing engineering */}
          <div className="absolute inset-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,_#f5c800_0%,_transparent_60%)] opacity-20 animate-pulse" />
          <div className="absolute inset-0 w-full h-full bg-[linear-gradient(to_right,#1c1b1b_0%,transparent_50%,#1c1b1b_100%)]" />
        </div>
        
        <div className="absolute top-0 bottom-0 right-0 w-24 bg-gradient-to-l from-[#fcf9f8] to-transparent z-10" />
        
        <div className="relative z-20 flex flex-col justify-between h-full w-full p-16">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#f5c800] rounded-xl flex items-center justify-center shadow-lg shadow-[#f5c800]/20">
              <ShieldCheck className="w-6 h-6 text-[#1c1b1b]" />
            </div>
            <h1 className="font-black italic text-3xl tracking-tighter text-white">
              REN<span className="text-[#f5c800]">AULT</span> AXIS
            </h1>
          </div>
          <div className="max-w-lg mb-12">
            <h2 className="text-5xl font-black text-white leading-[1.1] tracking-tight mb-6">
              Portail de <br/><span className="text-[#f5c800]">Gestion</span> Sécurisé
            </h2>
            <p className="text-[#a1a1aa] font-medium text-xl leading-relaxed">
              Accédez à vos outils de gestion de flotte, de suivi d&apos;interventions, et d&apos;analyses OCR.
            </p>
          </div>
        </div>
      </div>

      {/* Form Column - Right */}
      <div className="flex flex-1 items-center justify-center p-8 lg:p-24 relative z-20">
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex flex-col w-full max-w-md gap-10"
        >
          <div className="text-center lg:text-left">
            <h2 className="text-4xl font-black text-[#1c1b1b] tracking-tight mb-3">Connexion</h2>
            <p className="text-[#71717a] font-medium text-lg">Entrez vos identifiants pour continuer.</p>
          </div>
          
          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-2">
              <label className="font-bold text-sm tracking-wide uppercase text-[#a1a1aa]">Identifiant</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#a1a1aa]" />
                <input 
                  type="text" 
                  className="w-full bg-white border border-black/10 rounded-xl px-12 py-4 font-bold text-[#1c1b1b] focus:ring-2 focus:ring-[#f5c800]/30 focus:border-[#f5c800] transition-all outline-none"
                  placeholder="ID Collaborateur"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="font-bold text-sm tracking-wide uppercase text-[#a1a1aa]">Mot de passe</label>
                <a href="#" className="font-bold text-xs text-[#1c1b1b] hover:text-[#f5c800] transition-colors">Oublié?</a>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#a1a1aa]" />
                <input 
                  type="password" 
                  className="w-full bg-white border border-black/10 rounded-xl px-12 py-4 font-bold text-[#1c1b1b] focus:ring-2 focus:ring-[#f5c800]/30 focus:border-[#f5c800] transition-all outline-none"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button 
              onClick={() => signIn("keycloak", { callbackUrl: "/dashboard" })}
              className="w-full mt-4 bg-[#1c1b1b] hover:bg-black text-white py-4 rounded-xl font-bold flex items-center justify-center gap-3 transition-colors shadow-xl shadow-black/[0.04]"
            >
              Se Connecter avec Keycloak <ArrowRight className="w-5 h-5" />
            </button>
          </form>

          <div className="pt-8 border-t border-black/5 flex items-center justify-center gap-2">
            <span className="font-medium text-[#71717a] text-sm">Problème d&apos;accès?</span>
            <a href="#" className="font-bold text-[#1c1b1b] text-sm hover:text-[#f5c800]">Contacter le support</a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}`

fs.writeFileSync("app/login/page.tsx", loginPage);
console.log("Login page fixed!");


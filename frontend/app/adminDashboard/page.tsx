"use client";
import { motion } from "framer-motion";
import { Users, Settings, Database, Activity, ShieldCheck, Mail } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";

export default function AdminDashboardPage() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-[#fcf9f8] text-[#1c1b1b] font-sans selection:bg-[#f5c800]">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-black/5 h-20 flex items-center px-8 justify-between">
        <div className="flex items-center gap-4">
           <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center font-bold shadow-lg shadow-black/20">
              <ShieldCheck className="w-4 h-4" />
           </div>
           <h2 className="font-black text-xl tracking-tight text-[#1c1b1b]">Panel Administration</h2>
        </div>
        <div className="flex items-center gap-4">
           <Link href="/dashboard" className="text-sm font-bold text-[#a1a1aa] hover:text-[#1c1b1b] transition-colors">
              Retour Utilisateur
           </Link>
           <button className="px-4 py-2 bg-black text-white rounded-lg font-bold text-xs shadow-md">
             {session?.user?.name || "Admin System"}
           </button>
        </div>
      </header>

      <main className="p-8 lg:p-12 max-w-7xl mx-auto space-y-12">
        
        <div className="flex justify-between items-end">
           <div>
              <h1 className="text-4xl font-black text-[#1c1b1b] tracking-tight">Vue Globale Syst�me</h1>
              <p className="text-[#a1a1aa] mt-2 font-medium text-lg">
                Gestion des instances Keycloak, utilisateurs et configurations OCR.
              </p>
           </div>
        </div>

        {/* Global Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           <div className="bg-white p-6 justify-between rounded-2xl border border-black/5 shadow-xl shadow-black/[0.02]">
              <Users className="w-8 h-8 text-[#1c1b1b] mb-4" />
              <h3 className="text-[#a1a1aa] font-bold text-xs uppercase tracking-wider">Comptes Actifs</h3>
              <p className="text-4xl font-black mt-1 text-[#1c1b1b]">12,450</p>
           </div>
           <div className="bg-white p-6 justify-between rounded-2xl border border-black/5 shadow-xl shadow-black/[0.02]">
              <Activity className="w-8 h-8 text-green-500 mb-4" />
              <h3 className="text-[#a1a1aa] font-bold text-xs uppercase tracking-wider">�tat Serveurs (NestJS)</h3>
              <p className="text-4xl font-black mt-1 text-green-500">Normal</p>
           </div>
           <div className="bg-[#1c1b1b] p-6 justify-between rounded-2xl border border-black/5 shadow-xl shadow-black/[0.02] relative overflow-hidden">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#f5c800]/20 rounded-full blur-2xl" />
              <Database className="w-8 h-8 text-[#f5c800] mb-4" />
              <h3 className="text-white/60 font-bold text-xs uppercase tracking-wider">Requ�tes DB / s</h3>
              <p className="text-4xl font-black mt-1 text-white">480 QPS</p>
           </div>
           <div className="bg-[#f5c800] p-6 justify-between rounded-2xl shadow-xl shadow-[#f5c800]/20">
              <Settings className="w-8 h-8 text-[#1c1b1b] mb-4" />
              <h3 className="text-[#1c1b1b]/60 font-bold text-xs uppercase tracking-wider">Tickets Support</h3>
              <p className="text-4xl font-black mt-1 text-[#1c1b1b] flex items-center gap-2">8 <span className="text-sm font-bold bg-[#1c1b1b] text-[#f5c800] px-2 py-0.5 rounded-full">+2</span></p>
           </div>
        </div>

        {/* Administration Tools Grid */}
        <div>
          <h2 className="text-2xl font-black text-[#1c1b1b] mb-6 border-b border-black/5 pb-4">Outils d&apos;Infrastructure</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="group bg-white rounded-2xl border border-black/5 p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer">
               <ShieldCheck className="w-6 h-6 text-[#1c1b1b] mb-4 group-hover:scale-110 transition-transform" />
               <h4 className="font-bold text-lg text-[#1c1b1b]">Keycloak IAM</h4>
               <p className="text-sm text-[#a1a1aa] mt-2 font-medium">G�rer les r�les, les politiques de mot de passe et l&apos;authentification SSO.</p>
            </div>
            <div className="group bg-white rounded-2xl border border-black/5 p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer">
               <Database className="w-6 h-6 text-[#1c1b1b] mb-4 group-hover:scale-110 transition-transform" />
               <h4 className="font-bold text-lg text-[#1c1b1b]">Prisma Studio</h4>
               <p className="text-sm text-[#a1a1aa] mt-2 font-medium">Visionner les tables Tickets, Users, Payments et �diter les logs en direct.</p>
            </div>
            <div className="group bg-white rounded-2xl border border-black/5 p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer">
               <Mail className="w-6 h-6 text-[#1c1b1b] mb-4 group-hover:scale-110 transition-transform" />
               <h4 className="font-bold text-lg text-[#1c1b1b]">SMTP (V�rification OTP)</h4>
               <p className="text-sm text-[#a1a1aa] mt-2 font-medium">Logs d&apos;envoi des codes de v�rification par email ou SMS.</p>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}

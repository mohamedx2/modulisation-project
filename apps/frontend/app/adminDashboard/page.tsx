"use client";
import { motion } from "framer-motion";
import { Users, Settings, Database, Activity, ShieldCheck, Mail, Server, Cpu, Globe, Zap, ArrowLeft, Download } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/app/providers";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function AdminDashboardPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-primary selection:text-black overflow-x-hidden">
      {/* Background Mesh */}
      <div className="absolute inset-0 mesh-gradient opacity-40 z-0 pointer-events-none" />
      
      <header className="sticky top-0 z-50 bg-black/60 backdrop-blur-2xl border-b border-white/5 h-24 flex items-center px-12 justify-between">
        <div className="flex items-center gap-6">
           <div className="w-12 h-12 rounded-2xl bg-primary text-black flex items-center justify-center font-black shadow-[0_10px_30px_rgba(255,203,5,0.2)] group cursor-pointer">
             <ShieldCheck className="w-6 h-6 group-hover:rotate-12 transition-transform" />
           </div>
           <div>
             <h2 className="font-black text-2xl tracking-tighter uppercase italic leading-none">Command <span className="text-primary">Center</span></h2>
             <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mt-1">Infrastructure Management v4.0</p>
           </div>
        </div>
        <div className="flex items-center gap-8">
           <Link href="/dashboard" className="text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors">
             <ArrowLeft className="w-4 h-4 inline mr-2" /> Exit Admin
           </Link>
           <div className="h-8 w-px bg-white/10" />
           <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/40 leading-none mb-1">Authenticated as</p>
                <p className="text-sm font-black italic uppercase tracking-tighter text-primary">{user?.name || "System Architect"}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center font-black text-primary italic">
                {user?.name?.charAt(0) || "A"}
              </div>
           </div>
        </div>
      </header>

      <main className="p-12 lg:p-16 max-w-[1600px] mx-auto space-y-16 relative z-10">
        
        {/* Page Title & Actions */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
           <div className="space-y-3">
              <h1 className="text-5xl lg:text-6xl font-black text-white uppercase italic tracking-tighter">Instance <span className="text-primary italic">Overview</span></h1>
              <div className="flex items-center gap-4">
                <Badge className="bg-emerald-500/10 text-emerald-500 border-none px-4 py-1.5 rounded-full font-black uppercase text-[9px] tracking-widest">
                   System Healthy
                </Badge>
                <span className="text-white/40 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" /> Uptime: 1,248 Hours
                </span>
              </div>
           </div>
           <div className="flex gap-4">
              <Button variant="outline" className="rounded-2xl h-14 px-8 border-white/10 hover:bg-white/5 font-black uppercase italic tracking-tight gap-3">
                <Download className="w-5 h-5 opacity-40" /> System Logs
              </Button>
              <Button className="rounded-2xl h-14 px-8 font-black uppercase italic tracking-tight gap-3 shadow-xl shadow-primary/20">
                <Server className="w-5 h-5" /> Deploy Update
              </Button>
           </div>
        </div>

        {/* Real-time Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
           {[
             { label: "Total Handled Transactions", value: "1.2M", icon: Zap, color: "text-primary", sub: "+12% Growth" },
             { label: "Active Connections", value: "12,450", icon: Users, color: "text-blue-500", sub: "Global Reach" },
             { label: "Server Load (NestJS)", value: "14%", icon: Cpu, color: "text-emerald-500", sub: "Optimal Usage" },
             { label: "Database Latency", value: "24ms", icon: Database, color: "text-amber-500", sub: "PostgreSQL Cluster" },
           ].map((stat, i) => (
             <motion.div
               key={i}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: i * 0.1 }}
             >
               <Card className="rounded-[2.5rem] border-white/5 bg-white/[0.03] backdrop-blur-xl p-10 hover:bg-white/[0.05] transition-all group overflow-hidden relative">
                 <div className="flex items-center justify-between mb-10 relative z-10">
                    <div className={`p-4 rounded-2xl bg-white/5 ${stat.color} group-hover:scale-110 transition-transform duration-500`}>
                      <stat.icon className="w-8 h-8" />
                    </div>
                    <div className="text-[9px] font-black uppercase tracking-widest text-white/20 italic">{stat.sub}</div>
                 </div>
                 <div className="space-y-1 relative z-10">
                    <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">{stat.label}</p>
                    <div className="text-5xl font-black italic tracking-tighter text-white">{stat.value}</div>
                 </div>
                 {/* Decorative stripes */}
                  <div className="absolute top-0 right-0 w-16 h-full flex gap-1 opacity-[0.02] rotate-12 -mr-4 group-hover:opacity-[0.05] transition-opacity">
                     <div className="w-4 h-full bg-primary" />
                     <div className="w-2 h-full bg-primary" />
                     <div className="w-8 h-full bg-primary" />
                  </div>
               </Card>
             </motion.div>
           ))}
        </div>

        {/* Infrastructure Tools Section */}
        <section className="space-y-10">
          <div className="flex items-center gap-6">
            <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">System <span className="text-primary italic">Infrastructure</span></h2>
            <div className="h-px bg-white/10 flex-1" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: ShieldCheck, title: "Keycloak IAM", desc: "Manage roles, identity providers, and OIDC client configurations.", action: "Manage Identity" },
              { icon: Database, title: "Prisma Layer", desc: "View transactional records, perform deep queries and audit logs.", action: "Explore Data" },
              { icon: Mail, title: "SMTP Relay", desc: "Monitor email delivery, OTP verification codes and mail logs.", action: "Check Logs" },
            ].map((tool, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + (i * 0.1) }}
              >
                <Card className="rounded-[3rem] border-white/10 bg-zinc-950/50 p-12 hover:bg-zinc-900 transition-all cursor-pointer group flex flex-col h-full border-none shadow-2xl">
                   <div className="w-16 h-16 bg-primary/10 text-primary rounded-[1.5rem] flex items-center justify-center mb-10 group-hover:bg-primary group-hover:text-black transition-all duration-500">
                      <tool.icon className="w-8 h-8" />
                   </div>
                   <div className="flex-1 space-y-4">
                      <h4 className="text-2xl font-black text-white uppercase italic tracking-tighter">{tool.title}</h4>
                      <p className="text-white/40 font-bold text-sm leading-relaxed">{tool.desc}</p>
                   </div>
                   <Button variant="outline" className="w-full h-14 mt-12 rounded-2xl border-white/10 font-black uppercase text-[10px] tracking-widest hover:bg-white/5 transition-all group-hover:border-primary/50 group-hover:text-primary">
                      {tool.action} &rarr;
                   </Button>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Real-time Logs / Activity */}
        <Card className="rounded-[3rem] border-white/5 bg-zinc-950/50 overflow-hidden shadow-2xl">
          <div className="p-10 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Activity className="w-6 h-6 text-primary animate-pulse" />
              <h3 className="text-xl font-black uppercase italic tracking-tighter">Live Traffic Node</h3>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-primary animate-ping" />
              <span className="text-[10px] font-black text-primary uppercase tracking-widest">Atelier Actif</span>
            </div>
          </div>
          <CardContent className="p-12 font-mono text-sm space-y-6">
            <div className="flex gap-6 text-white/40 border-b border-white/5 pb-4">
              <span className="text-primary font-black">[08:42:12]</span>
              <span className="text-white font-bold uppercase tracking-tight">POST /api/ocr/scan</span>
              <span className="italic">User: hamrouni_m | Latency: 42ms | Code: 201</span>
            </div>
            <div className="flex gap-6 text-white/40 border-b border-white/5 pb-4">
              <span className="text-primary font-black">[08:42:15]</span>
              <span className="text-white font-bold uppercase tracking-tight">GET /api/dashboard/stats</span>
              <span className="italic">User: anonymized | Latency: 12ms | Code: 200</span>
            </div>
            <div className="flex gap-6 text-white/40 border-b border-white/5 pb-4 opacity-50">
              <span className="text-primary font-black">[08:42:18]</span>
              <span className="text-white font-bold uppercase tracking-tight">PUT /api/users/profile</span>
              <span className="italic">User: admin_sys | Latency: 22ms | Code: 204</span>
            </div>
          </CardContent>
        </Card>

      </main>
    </div>
  );
}
"use client";

import { useEffect, useState } from "react";
import { Users, Ticket, CreditCard, Activity, ArrowUpRight, ArrowDownRight, Clock, ExternalLink, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchWithAuth } from "@/lib/api";

interface StatItem {
  name: string;
  value: string;
  iconType: string;
  change: string;
  changeType: string;
}

export default function DashboardOverview() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<StatItem[]>([]);
  const [recentTickets, setRecentTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch stats
        const statsData = await fetchWithAuth("/dashboard/stats");
        setStats(statsData);

        // Fetch recent tickets
        const ticketsData = await fetchWithAuth("/tickets");
        setRecentTickets(ticketsData.slice(0, 5));
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }

    if (session) {
      fetchData();
    }
  }, [session]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'Ticket': return Ticket;
      case 'CreditCard': return CreditCard;
      case 'Users': return Users;
      case 'Activity': return Activity;
      default: return Activity;
    }
  };

  return (
    <div className="p-8 lg:p-12 max-w-7xl mx-auto space-y-10 pb-20">
      {/* Premium Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[2.5rem] bg-zinc-950 p-10 text-white shadow-2xl border border-white/5"
      >
        <div className="relative z-10">
          <Badge className="bg-primary/20 text-primary border-primary/30 mb-6 font-bold px-4 py-1.5 rounded-full">
            Console de Gestion v2.1
          </Badge>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter leading-tight">
            Bonjour, <span className="text-primary italic">{session?.user?.name || "Utilisateur"}</span>
          </h1>
          <p className="mt-4 text-zinc-400 font-medium max-w-xl text-lg leading-relaxed">
            Votre plateforme Renault Axis est prête. Vous avez <span className="text-white font-bold">{stats.find(s => s.name === 'Total Tickets')?.value || '...'} interventions</span> actives ce mois-ci.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
             <Button className="rounded-2xl h-14 px-8 font-black bg-primary text-primary-foreground hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95">
                Nouveau Rapport
             </Button>
             <Button variant="outline" className="rounded-2xl h-14 px-8 font-black border-zinc-800 bg-zinc-900/50 text-white hover:bg-zinc-800 transition-all">
                Historique
             </Button>
          </div>
        </div>
        
        {/* Modern Background Decorations */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 blur-[120px] -mr-64 -mt-64 rounded-full animate-pulse" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-blue-600/10 blur-[100px] rounded-full" />
        
        <div className="absolute right-12 bottom-12 hidden lg:block opacity-20 grayscale hover:grayscale-0 transition-all duration-700 hover:opacity-40">
           <div className="font-black italic text-8xl tracking-tighter select-none">RENAULT</div>
        </div>
      </motion.div>

      {/* Stats Bento Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-40 rounded-[2rem] w-full" />)
        ) : stats.map((item, idx) => {
          const Icon = getIcon(item.iconType);
          return (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1, type: "spring", stiffness: 100 }}
            >
              <Card className="group border-border/40 bg-card/40 backdrop-blur-md hover:bg-card hover:border-primary/30 transition-all duration-500 rounded-[2rem] shadow-sm hover:shadow-xl hover:shadow-primary/5 overflow-hidden border-2 border-transparent">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 p-8">
                  <CardTitle className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em]">{item.name}</CardTitle>
                  <div className="rounded-2xl bg-muted/80 p-3 text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500 shadow-inner group-hover:rotate-12">
                    <Icon className="h-6 w-6" />
                  </div>
                </CardHeader>
                <CardContent className="px-8 pb-8 pt-0">
                  <div className="text-4xl font-black tracking-tighter leading-none">{item.value}</div>
                  <div className={`flex items-center gap-1.5 mt-4 text-[13px] font-bold ${
                    item.changeType === 'positive' ? 'text-emerald-500' : item.changeType === 'negative' ? 'text-rose-500' : 'text-muted-foreground'
                  }`}>
                    <div className={`flex items-center gap-0.5 rounded-full px-2 py-0.5 ${
                       item.changeType === 'positive' ? 'bg-emerald-500/10' : item.changeType === 'negative' ? 'bg-rose-500/10' : 'bg-muted'
                    }`}>
                      {item.changeType === 'positive' ? <ArrowUpRight className="w-4 h-4" /> : item.changeType === 'negative' ? <ArrowDownRight className="w-4 h-4" /> : null}
                      {item.change}
                    </div>
                    <span className="text-muted-foreground font-semibold">ce mois</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Tickets Modern Card */}
        <Card className="lg:col-span-2 rounded-[2.5rem] border-border/40 shadow-sm overflow-hidden bg-card/40 backdrop-blur-md border-2 border-transparent hover:border-border/60 transition-all">
          <CardHeader className="flex flex-row items-center justify-between bg-muted/10 border-b border-border/40 p-8">
            <div>
              <CardTitle className="text-2xl font-black tracking-tight flex items-center gap-3">
                <Clock className="w-6 h-6 text-primary" />
                Interventions Récentes
              </CardTitle>
              <CardDescription className="font-semibold mt-1">Dernières demandes de service enregistrées.</CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="rounded-xl font-black text-xs uppercase tracking-widest hover:bg-primary/10 hover:text-primary transition-all">
              VOIR TOUT &rarr;
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-8 space-y-4">
                <Skeleton className="h-14 w-full rounded-xl" />
                <Skeleton className="h-14 w-full rounded-xl" />
                <Skeleton className="h-14 w-full rounded-xl" />
              </div>
            ) : recentTickets.length === 0 ? (
              <div className="p-20 text-center flex flex-col items-center">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                   <Ticket className="w-8 h-8 text-muted-foreground opacity-20" />
                </div>
                <p className="text-muted-foreground font-bold italic">Aucune intervention récente.</p>
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-muted/5">
                  <TableRow className="border-border/40 hover:bg-transparent">
                    <TableHead className="font-black px-8 py-5 text-xs uppercase tracking-widest">Titre</TableHead>
                    <TableHead className="font-black text-xs uppercase tracking-widest">Statut</TableHead>
                    <TableHead className="font-black text-xs uppercase tracking-widest">Date</TableHead>
                    <TableHead className="font-black text-right px-8 text-xs uppercase tracking-widest">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentTickets.map((ticket) => (
                    <TableRow key={ticket.id} className="hover:bg-muted/30 border-border/40 transition-colors group">
                      <TableCell className="font-bold px-8 py-5 text-base">{ticket.title}</TableCell>
                      <TableCell>
                        <Badge className={`rounded-xl px-3 py-1 text-[11px] font-black uppercase tracking-wider shadow-sm border-none ${
                          ticket.status === 'OPEN' ? 'bg-blue-500/10 text-blue-600' :
                          ticket.status === 'CLOSED' ? 'bg-emerald-500/10 text-emerald-600' :
                          'bg-amber-500/10 text-amber-600'
                        }`}>
                          {ticket.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground font-bold text-sm">
                        {new Date(ticket.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                      </TableCell>
                      <TableCell className="text-right px-8">
                         <Button variant="ghost" size="icon" className="rounded-xl group-hover:bg-primary/20 group-hover:text-primary transition-all">
                            <ExternalLink className="w-4 h-4" />
                         </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Status & Side Content */}
        <div className="space-y-8">
          <Card className="rounded-[2.5rem] border-border/40 bg-card/40 backdrop-blur-md shadow-sm overflow-hidden p-8 border-2 border-transparent">
             <CardHeader className="p-0 pb-6">
                <CardTitle className="text-xl font-black flex items-center gap-3">
                  <Activity className="w-6 h-6 text-primary" />
                  État Réseau
                </CardTitle>
             </CardHeader>
             <CardContent className="p-0">
                <div className="space-y-6">
                  {[
                    { label: "Backend API", status: "Opérationnel", color: "bg-emerald-500" },
                    { label: "OCR Engine", status: "Optimal", color: "bg-emerald-500" },
                    { label: "PostgreSQL", status: "Connecté", color: "bg-emerald-500" },
                    { label: "Redis Cache", status: "Actif", color: "bg-emerald-500" },
                  ].map((sys) => (
                    <div key={sys.label} className="flex items-center justify-between group">
                      <span className="text-sm font-bold text-muted-foreground group-hover:text-foreground transition-colors">{sys.label}</span>
                      <div className="flex items-center gap-2 bg-emerald-500/5 px-3 py-1 rounded-full border border-emerald-500/10">
                        <div className={`w-2 h-2 rounded-full ${sys.color} animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]`} />
                        <span className="text-[11px] font-black uppercase text-emerald-600">{sys.status}</span>
                      </div>
                    </div>
                  ))}
                  
                  <div className="pt-8 border-t border-border/40">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Charge Infrastructure</span>
                      <span className="text-xs font-black italic">42.8%</span>
                    </div>
                    <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden shadow-inner">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: '42.8%' }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-primary to-blue-400" 
                      />
                    </div>
                  </div>
                </div>
             </CardContent>
          </Card>

          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="rounded-[2.5rem] border-none bg-gradient-to-br from-primary to-blue-600 text-white shadow-2xl shadow-primary/30 p-10 overflow-hidden relative group cursor-pointer"
          >
             <div className="relative z-10">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-sm shadow-lg border border-white/10 group-hover:rotate-6 transition-transform">
                   <AlertCircle className="w-6 h-6" />
                </div>
                <h3 className="font-black text-2xl italic tracking-tighter">CENTRE DE SUPPORT</h3>
                <p className="text-sm font-semibold mt-3 opacity-90 leading-relaxed">Une question ? Une assistance technique ? Nos experts Renault Axis sont à votre écoute.</p>
                <Button className="mt-8 w-full bg-white text-primary hover:bg-zinc-100 rounded-2xl h-14 font-black shadow-2xl transition-all border-none">
                  OUVRIR UN TICKET
                </Button>
             </div>
             
             {/* Decorative Patterns */}
             <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 blur-[60px] -mr-24 -mt-24 rounded-full" />
             <div className="absolute -bottom-10 -right-10 font-black italic text-9xl text-white/5 select-none pointer-events-none">?</div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
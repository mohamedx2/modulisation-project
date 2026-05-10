"use client";

import { useEffect, useState } from "react";
import { Calendar, Clock, Car, ChevronRight, Loader2, MapPin, X, Trash2, CheckCircle2, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../providers";
import { fetchWithAuth } from "@/lib/api";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

interface Ticket {
  id: string;
  title: string;
  description: string;
  status: string;
  createdAt: string;
  scheduledAt: string | null;
}

export default function MyRDVPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [cancelling, setCancelling] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMyTickets() {
      if (!user) return;
      try {
        const res = await fetchWithAuth("/tickets/mine");
        setTickets(res.data || res || []);
      } catch (err) {
        console.error("Failed to fetch my tickets:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchMyTickets();
  }, [user]);

  const now = new Date();

  const upcoming = tickets
    .filter((t) => t.scheduledAt && new Date(t.scheduledAt) >= now && t.status !== "CLOSED")
    .sort((a, b) => new Date(a.scheduledAt!).getTime() - new Date(b.scheduledAt!).getTime());

  const past = tickets
    .filter((t) => !t.scheduledAt || new Date(t.scheduledAt) < now || t.status === "CLOSED")
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const nextAppointment = upcoming[0];

  const getRelativeLabel = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(date);
    target.setHours(0, 0, 0, 0);
    const diff = Math.floor((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diff === 0) return { label: "Aujourd'hui", color: "text-emerald-700 dark:text-emerald-400", bg: "bg-emerald-500/10" };
    if (diff === 1) return { label: "Demain", color: "text-blue-700 dark:text-blue-400", bg: "bg-blue-500/10" };
    if (diff <= 7) return { label: "Cette semaine", color: "text-amber-700 dark:text-amber-400", bg: "bg-amber-500/10" };
    return { label: "À venir", color: "text-zinc-600 dark:text-zinc-400", bg: "bg-zinc-500/10" };
  };

  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case "OPEN":
        return <Badge className="bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20 px-3 py-1 rounded-full font-black uppercase text-[10px] tracking-widest shadow-sm">Confirmé</Badge>;
      case "PENDING":
        return <Badge className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20 px-3 py-1 rounded-full font-black uppercase text-[10px] tracking-widest shadow-sm">En attente</Badge>;
      case "CLOSED":
        return <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 px-3 py-1 rounded-full font-black uppercase text-[10px] tracking-widest shadow-sm">Terminé</Badge>;
      default:
        return <Badge variant="outline" className="font-black uppercase text-[10px] tracking-widest">{status}</Badge>;
    }
  };

  const cancelTicket = async (id: string) => {
    setCancelling(id);
    try {
      await fetchWithAuth(`/tickets/${id}`, { method: "DELETE" });
      setTickets((prev) => prev.filter((t) => t.id !== id));
      setSelectedTicket(null);
      toast.success("Rendez-vous annulé");
    } catch {
      toast.error("Erreur lors de l'annulation");
    } finally {
      setCancelling(null);
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  };

  const formatTime = (dateStr: string | null) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDateTimeShort = (dateStr: string | null) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }) + " à " + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8 lg:space-y-10 px-4 sm:px-6 lg:px-0 pb-8 sm:pb-12">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 sm:gap-6">
        <div>
          <Badge variant="outline" className="mb-3 px-3 py-1 border-primary/30 text-primary font-black uppercase italic tracking-widest bg-primary/5 text-xs">
            Espace Client Renault
          </Badge>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tighter italic uppercase leading-none">
            Mes <span className="text-primary">Rendez-vous</span>
          </h1>
          <p className="text-muted-foreground font-medium mt-3 text-xs sm:text-sm max-w-md">
            Gérez vos interventions techniques et optimisez la performance de votre véhicule Renault Axis.
          </p>
        </div>
        <Button 
          onClick={() => router.push("/dashboard/tickets")} 
          className="rounded-2xl font-black uppercase italic tracking-tight h-14 px-8 shadow-2xl shadow-primary/30 w-full sm:w-auto text-lg group hover:scale-[1.02] transition-all"
        >
          Nouveau RDV <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>

      {nextAppointment && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="relative group"
        >
          {/* Decorative Glow */}
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/50 to-primary/10 rounded-[2.5rem] blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
          
          <Card className="relative rounded-[2.2rem] border-none bg-zinc-900 overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] rounded-full -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 blur-[100px] rounded-full -ml-32 -mb-32"></div>
            
            <CardContent className="p-0">
              <div className="flex flex-col lg:flex-row">
                <div className="lg:w-64 bg-primary p-8 flex flex-col items-center justify-center text-primary-foreground relative overflow-hidden">
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0 rotate-12 scale-150 transform">
                      {[...Array(6)].map((_, i) => (
                        <div key={i} className="h-4 bg-black/50 mb-4 w-full"></div>
                      ))}
                    </div>
                  </div>
                  <div className="relative z-10 flex flex-col items-center">
                    <div className="w-20 h-20 bg-white/20 rounded-[2rem] flex items-center justify-center mb-4 backdrop-blur-md shadow-inner">
                      <Calendar className="w-10 h-10" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em]">Prochain RDV</p>
                    <p className="text-2xl font-black italic uppercase tracking-tighter mt-1">Confirmé</p>
                  </div>
                </div>
                
                <div className="flex-1 p-8 lg:p-10 relative z-10">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="space-y-4">
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 rounded-lg border border-white/10">
                        <Badge className="bg-primary text-primary-foreground font-black text-[9px] uppercase px-2 py-0.5 rounded">Priorité</Badge>
                        <span className="text-white/40 text-[10px] font-black uppercase tracking-widest">Entretien Periodique</span>
                      </div>
                      
                      <h3 className="text-2xl md:text-3xl font-black text-white uppercase italic tracking-tighter leading-tight">
                        {nextAppointment.title}
                      </h3>
                      
                      {nextAppointment.scheduledAt && (
                        <div className="flex flex-wrap items-center gap-6 pt-2">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-primary">
                              <Calendar className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">Date</p>
                              <p className="text-sm font-bold text-white capitalize">{formatDate(nextAppointment.scheduledAt)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-primary">
                              <Clock className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">Heure</p>
                              <p className="text-sm font-bold text-white">{formatTime(nextAppointment.scheduledAt)}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-row md:flex-col items-center justify-between md:justify-center gap-4 border-t md:border-t-0 md:border-l border-white/10 pt-6 md:pt-0 md:pl-8">
                      {(() => {
                        const rel = getRelativeLabel(new Date(nextAppointment.scheduledAt!));
                        return (
                          <div className="text-center">
                            <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1 hidden md:block">Status</p>
                            <Badge className={`${rel.bg} ${rel.color} border-none px-6 py-2.5 rounded-full font-black text-xs uppercase tracking-[0.1em] shadow-lg`}>
                              {rel.label}
                            </Badge>
                          </div>
                        );
                      })()}
                      <Button
                        onClick={() => setSelectedTicket(nextAppointment)}
                        className="bg-white hover:bg-zinc-200 text-black rounded-xl font-black text-xs uppercase tracking-widest h-12 px-8 transition-transform hover:scale-105 active:scale-95"
                      >
                        Gérer le RDV
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <Tabs defaultValue="upcoming" className="space-y-8">
        <div className="flex items-center justify-center">
          <TabsList className="bg-muted/30 p-1.5 rounded-[1.5rem] h-16 w-full max-w-lg border border-border/50">
            <TabsTrigger value="upcoming" className="rounded-[1.1rem] h-13 px-8 font-black uppercase text-[11px] tracking-widest data-[state=active]:bg-zinc-950 data-[state=active]:text-white data-[state=active]:shadow-2xl transition-all flex-1">
              À venir <span className="ml-2 opacity-50">({upcoming.length})</span>
            </TabsTrigger>
            <TabsTrigger value="past" className="rounded-[1.1rem] h-13 px-8 font-black uppercase text-[11px] tracking-widest data-[state=active]:bg-zinc-950 data-[state=active]:text-white data-[state=active]:shadow-2xl transition-all flex-1">
              Historique <span className="ml-2 opacity-50">({past.length})</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="upcoming" className="space-y-6 focus-visible:outline-none">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-48 w-full rounded-[2.5rem]" />)}
            </div>
          ) : upcoming.length === 0 ? (
            <Card className="rounded-[3rem] border-dashed border-2 p-12 sm:p-20 text-center bg-muted/10 border-muted-foreground/20">
              <div className="flex flex-col items-center space-y-6">
                <div className="w-24 h-24 bg-muted/30 rounded-[2.5rem] flex items-center justify-center text-muted-foreground/50 border border-muted-foreground/10">
                  <Calendar className="w-10 h-10" />
                </div>
                <div>
                  <h2 className="text-2xl font-black uppercase italic tracking-tight">Agenda Vide</h2>
                  <p className="text-muted-foreground max-w-sm mx-auto font-medium mt-2">Votre Renault mérite le meilleur. Planifiez votre prochaine visite dès maintenant.</p>
                </div>
                <Button onClick={() => router.push("/dashboard/tickets")} className="rounded-2xl px-10 font-black uppercase italic h-14 shadow-xl text-lg group">
                  Prendre RDV <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {upcoming.map((ticket, idx) => {
                const rel = getRelativeLabel(new Date(ticket.scheduledAt!));
                return (
                  <motion.div
                    key={ticket.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <Card
                      className="group rounded-[2.2rem] border-border/50 shadow-sm hover:shadow-2xl hover:border-primary/50 hover:bg-primary/[0.02] transition-all duration-500 cursor-pointer overflow-hidden relative"
                      onClick={() => setSelectedTicket(ticket)}
                    >
                      <CardContent className="p-8">
                        <div className="flex flex-col h-full space-y-6">
                          <div className="flex items-start justify-between">
                            <div className="w-14 h-14 bg-amber-500/10 text-amber-600 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:bg-amber-500 group-hover:text-black transition-all duration-500 shadow-inner">
                              <Car className="w-7 h-7" />
                            </div>
                            <div className="flex gap-2">
                              {getStatusBadge(ticket.status)}
                            </div>
                          </div>
                          
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-[0.2em]">Renault Service</span>
                              <div className="h-px bg-amber-600/20 dark:bg-amber-400/20 flex-1"></div>
                            </div>
                            <h3 className="text-xl font-black uppercase italic tracking-tighter truncate leading-none pt-1">
                              {ticket.title}
                            </h3>
                          </div>
                          
                          <div className="space-y-3 pt-2 border-t border-border/50">
                            {ticket.scheduledAt ? (
                              <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                                  <Calendar className="w-4 h-4 text-amber-600/60 dark:text-amber-400/60" />
                                  <span className="text-xs font-bold capitalize truncate">{formatDateTimeShort(ticket.scheduledAt)}</span>
                                </div>
                                <div className="flex items-center gap-2 text-muted-foreground justify-end">
                                  <Badge variant="outline" className={`${rel.bg} ${rel.color} border-none font-black text-[9px] uppercase px-2 py-0.5`}>
                                    {rel.label}
                                  </Badge>
                                </div>
                              </div>
                            ) : (
                              <p className="text-xs font-bold text-muted-foreground italic">En attente de confirmation</p>
                            )}
                          </div>
                          
                          <div className="absolute bottom-6 right-8 opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all duration-500">
                            <ArrowRight className="w-6 h-6 text-primary" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-4 focus-visible:outline-none">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 w-full rounded-3xl" />)}
            </div>
          ) : past.length === 0 ? (
            <Card className="rounded-[3rem] border-dashed border-2 p-12 sm:p-20 text-center bg-muted/10 border-muted-foreground/20">
              <div className="flex flex-col items-center space-y-6">
                <div className="w-20 h-20 bg-muted/30 rounded-[2rem] flex items-center justify-center text-muted-foreground/50 border border-muted-foreground/10">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h2 className="text-2xl font-black uppercase italic tracking-tight">Aucun historique</h2>
                <p className="text-muted-foreground max-w-sm mx-auto font-medium">Vos interventions passées apparaîtront ici.</p>
              </div>
            </Card>
          ) : (
            <div className="grid gap-4">
              {past.map((ticket, idx) => (
                <motion.div
                  key={ticket.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Card
                    className="group rounded-[1.5rem] border border-border/30 hover:border-primary/20 hover:bg-primary/[0.01] transition-all cursor-pointer opacity-80 hover:opacity-100"
                    onClick={() => setSelectedTicket(ticket)}
                  >
                    <CardContent className="p-6 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-5 min-w-0">
                        <div className="w-12 h-12 bg-muted/50 text-muted-foreground rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                          <Car className="w-6 h-6" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-black text-sm uppercase italic tracking-tight truncate group-hover:text-primary transition-colors">{ticket.title}</h4>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                              {ticket.scheduledAt ? formatDate(ticket.scheduledAt) : new Date(ticket.createdAt).toLocaleDateString('fr-FR')}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 flex-shrink-0">
                        {getStatusBadge(ticket.status)}
                        <div className="w-8 h-8 rounded-full border border-border flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition-all">
                          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary-foreground transition-all" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <AnimatePresence>
        {selectedTicket && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-zinc-950/80 backdrop-blur-md px-4 sm:px-0"
            onClick={() => setSelectedTicket(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 50, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 50, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full sm:max-w-xl bg-white rounded-t-[3rem] sm:rounded-[3.5rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)] max-h-[95vh] flex flex-col"
            >
              <div className="bg-zinc-900 p-8 sm:p-10 pb-16 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[80px] rounded-full -mr-32 -mt-32"></div>
                
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="absolute top-6 right-6 w-10 h-10 bg-white/5 text-white/40 rounded-full flex items-center justify-center hover:bg-white/10 hover:text-white transition-all z-20"
                >
                  <X className="w-5 h-5" />
                </button>
                
                <div className="relative z-10 space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
                      <Car className="w-7 h-7" />
                    </div>
                    <div>
                      <Badge className="bg-primary/20 text-primary border-none font-black text-[9px] uppercase tracking-[0.2em] mb-1">Confirmation Officielle</Badge>
                      <h3 className="text-2xl sm:text-3xl font-black text-white uppercase italic tracking-tighter leading-tight">
                        {selectedTicket.title}
                      </h3>
                    </div>
                  </div>
                </div>
                
                {/* Perforated edge effect */}
                <div className="absolute bottom-0 left-0 right-0 h-4 flex gap-2 px-2 overflow-hidden">
                  {[...Array(20)].map((_, i) => (
                    <div key={i} className="w-4 h-4 bg-white rounded-full -mb-2 flex-shrink-0"></div>
                  ))}
                </div>
              </div>

              <div className="p-8 sm:p-10 pt-10 space-y-8 flex-1 overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-5 bg-zinc-50 rounded-3xl border border-zinc-100 flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-zinc-400">
                      <Calendar className="w-4 h-4" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Date Intervention</span>
                    </div>
                    {selectedTicket.scheduledAt ? (
                      <p className="font-black text-sm text-zinc-900 capitalize">{formatDate(selectedTicket.scheduledAt)}</p>
                    ) : (
                      <p className="font-bold text-sm text-zinc-400 italic">À confirmer</p>
                    )}
                  </div>
                  <div className="p-5 bg-zinc-50 rounded-3xl border border-zinc-100 flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-zinc-400">
                      <Clock className="w-4 h-4" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Créneau Horaire</span>
                    </div>
                    {selectedTicket.scheduledAt ? (
                      <p className="font-black text-xl text-zinc-900">{formatTime(selectedTicket.scheduledAt)}</p>
                    ) : (
                      <p className="font-bold text-sm text-zinc-400 italic">À confirmer</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-5 p-5 bg-zinc-50 rounded-3xl border border-zinc-100">
                  <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Centre Technique</p>
                    <p className="font-black text-zinc-900">Renault Axis — Paris Sud</p>
                  </div>
                </div>

                <div className="relative group">
                  <div className="absolute -inset-2 bg-gradient-to-r from-primary/20 to-transparent rounded-[2.5rem] blur opacity-50"></div>
                  <div className="relative bg-white border-2 border-dashed border-zinc-200 rounded-[2rem] p-8 flex flex-col items-center justify-center">
                    <div className="relative p-4 bg-white rounded-2xl border border-zinc-100 shadow-xl">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/tickets/verify/${selectedTicket.id}`)}`}
                        alt="QR Code RDV"
                        className="w-40 h-40 sm:w-48 sm:h-48"
                      />
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary rounded-full border-4 border-white shadow-lg"></div>
                    </div>
                    <div className="text-center mt-6">
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 mb-1">Pass Service Digital</p>
                      <p className="font-mono text-[10px] font-bold text-zinc-300">REF: {selectedTicket.id.toUpperCase()}</p>
                    </div>
                  </div>
                </div>

                {selectedTicket.status !== "CLOSED" && (
                  <div className="pt-4">
                    <Button
                      variant="ghost"
                      className="w-full rounded-2xl h-14 font-black uppercase italic tracking-widest text-red-500 hover:bg-red-50 hover:text-red-600 transition-all border border-transparent hover:border-red-100"
                      onClick={() => cancelTicket(selectedTicket.id)}
                      disabled={cancelling === selectedTicket.id}
                    >
                      {cancelling === selectedTicket.id ? (
                        <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                      ) : (
                        <Trash2 className="w-5 h-5 mr-3" />
                      )}
                      Annuler l&apos;intervention
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

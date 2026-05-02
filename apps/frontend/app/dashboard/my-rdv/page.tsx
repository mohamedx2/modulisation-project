"use client";

import { useEffect, useState } from "react";
import { Calendar, Clock, Car, ChevronRight, Loader2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "../../providers";
import { fetchWithAuth } from "@/lib/api";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface Ticket {
  id: string;
  title: string;
  description: string;
  status: string;
  createdAt: string;
}

export default function MyRDVPage() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

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

  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case "OPEN":
        return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20 px-3 py-1 rounded-full font-bold">En cours</Badge>;
      case "PENDING":
        return <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 px-3 py-1 rounded-full font-bold">En attente</Badge>;
      case "CLOSED":
        return <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 px-3 py-1 rounded-full font-bold">Terminé</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col space-y-2">
        <h1 className="text-4xl font-black tracking-tight italic uppercase">Mes Rendez-vous</h1>
        <p className="text-muted-foreground font-medium">Suivez l&apos;état de vos interventions en temps réel.</p>
      </div>

      {loading ? (
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full rounded-3xl" />
          ))}
        </div>
      ) : tickets.length === 0 ? (
        <Card className="rounded-[2.5rem] border-dashed border-2 p-12 text-center bg-muted/20">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
              <Calendar className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-bold">Aucun rendez-vous trouvé</h2>
            <p className="text-muted-foreground max-w-sm mx-auto">Vous n&apos;avez pas encore de réservations. Commencez par en créer une !</p>
            <Button variant="default" className="rounded-xl px-8 font-bold h-12 shadow-lg" onClick={() => window.location.href = '/dashboard/tickets'}>
              Prendre RDV
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid gap-6">
          {tickets.map((ticket, idx) => (
            <motion.div
              key={ticket.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className="group overflow-hidden rounded-[2rem] border-none shadow-sm hover:shadow-xl transition-all cursor-pointer">
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row">
                    <div className="md:w-1/4 bg-muted/30 p-8 flex flex-col items-center justify-center border-r border-border/50">
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-3">
                        <Car className="w-6 h-6 text-primary" />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Intervention</span>
                    </div>
                    <div className="flex-1 p-8 flex flex-col justify-between">
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div className="space-y-1">
                          <h3 className="text-xl font-black uppercase italic tracking-tighter">{ticket.title}</h3>
                          <p className="text-sm text-muted-foreground font-medium">{ticket.description}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          {getStatusBadge(ticket.status)}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-6 mt-8 pt-6 border-t border-border/50">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span className="text-xs font-bold uppercase tracking-wider">{new Date(ticket.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span className="text-xs font-bold uppercase tracking-wider">{new Date(ticket.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <div className="flex-1" />
                        <Button variant="ghost" size="sm" className="group/btn font-black uppercase text-[10px] tracking-widest p-0 hover:bg-transparent hover:text-primary transition-colors">
                          Détails <ChevronRight className="w-4 h-4 ml-1 group-hover/btn:translate-x-1 transition-transform" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

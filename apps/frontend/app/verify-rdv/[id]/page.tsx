"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { CheckCircle2, AlertCircle, Calendar, Car, Wrench, ShieldCheck, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function VerifyRDVPage() {
  const { id } = useParams();
  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function verify() {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
        const res = await fetch(`${baseUrl}/tickets/verify/${id}`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        setTicket(data);
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    if (id) verify();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 text-white">
        <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
        <p className="font-black uppercase italic tracking-widest text-sm">Vérification en cours...</p>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 text-white text-center">
        <div className="w-24 h-24 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-8">
          <AlertCircle className="w-12 h-12" />
        </div>
        <h1 className="text-4xl font-black uppercase italic tracking-tighter mb-4">RDV Invalide</h1>
        <p className="text-muted-foreground max-w-xs font-medium">Ce code ne correspond à aucun rendez-vous actif dans notre système.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="rounded-[3rem] border-none bg-zinc-900 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          <div className="bg-primary p-12 text-center relative overflow-hidden">
             {/* Decorative pattern */}
             <div className="absolute inset-0 opacity-10 pointer-events-none flex items-center justify-center scale-150 rotate-12">
                <CheckCircle2 className="w-64 h-64" />
             </div>
             
             <div className="relative z-10">
                <div className="w-24 h-24 bg-black rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-2xl ring-8 ring-black/5">
                  <ShieldCheck className="w-12 h-12 text-primary" />
                </div>
                <h1 className="text-4xl font-black text-black uppercase italic tracking-tighter">RDV Validé</h1>
                <Badge className="bg-black text-primary border-none rounded-lg mt-4 font-black uppercase tracking-widest px-4 py-1">Confirmé</Badge>
             </div>
          </div>

          <CardContent className="p-10 space-y-8">
            <div className="space-y-6">
              <div className="flex gap-6 items-center">
                <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-primary shadow-inner">
                  <Car className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Véhicule</p>
                  <p className="text-xl font-black text-white uppercase italic tracking-tight">
                    {ticket.title?.split(' (')[0] || "Véhicule"}
                  </p>
                  <p className="text-[10px] font-bold text-primary/60 uppercase tracking-widest mt-0.5">
                    {ticket.title?.includes('(') ? ticket.title.split('(')[1].split(')')[0] : "---"}
                  </p>
                </div>
              </div>

              <div className="flex gap-6 items-center">
                <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-primary shadow-inner">
                  <Wrench className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Intervention</p>
                  <p className="text-xl font-black text-white uppercase italic tracking-tight">
                    {ticket.title?.split(' - ')[1] || "Service Renault"}
                  </p>
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mt-0.5">
                    {ticket.description?.includes('Service: ') ? ticket.description.split('Service: ')[1] : "Révision standard"}
                  </p>
                </div>
              </div>

              <div className="flex gap-6 items-center">
                <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-primary shadow-inner">
                  <Calendar className="w-7 h-7" />
                </div>
                <div className="flex-1 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Date</p>
                    <p className="text-lg font-black text-white uppercase italic tracking-tight">
                      {ticket.description?.includes('RDV:') 
                        ? ticket.description.split(' | ')[0].replace('RDV: ', '').split(' à ')[0]
                        : (ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }) : "---")}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Heure</p>
                    <p className="text-lg font-black text-white uppercase italic tracking-tight">
                      {ticket.description?.includes(' à ') 
                        ? ticket.description.split(' | ')[0].split(' à ')[1]
                        : (ticket.createdAt ? new Date(ticket.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : "--:--")}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-white/5 text-center">
               <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">ID Dossier</p>
               <p className="text-sm font-mono text-primary/60 uppercase">{ticket.id?.substring(0, 8)}...{ticket.id?.substring(ticket.id.length - 4)}</p>
            </div>
          </CardContent>
        </Card>
        
        <p className="text-center mt-12">
           <span className="text-2xl font-black text-white uppercase italic tracking-tighter">Renault <span className="text-primary">Axis</span></span>
        </p>
      </motion.div>
    </div>
  );
}

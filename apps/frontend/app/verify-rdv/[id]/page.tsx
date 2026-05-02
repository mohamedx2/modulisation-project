"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { CheckCircle2, AlertCircle, Calendar, Car, Wrench, ShieldCheck, Loader2, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function VerifyRDVPage() {
  const params = useParams();
  const id = params?.id as string;
  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function verify() {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
        const res = await fetch(`${baseUrl}/tickets/verify/${id}`);
        if (!res.ok) throw new Error();
        const json = await res.json();
        const data = json.data || json;
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
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-white relative">
        <div className="absolute inset-0 mesh-gradient opacity-40" />
        <Loader2 className="w-16 h-16 animate-spin text-primary mb-8 relative z-10" />
        <p className="font-black uppercase italic tracking-[0.5em] text-sm text-primary animate-pulse relative z-10">Verification Unit</p>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-white text-center relative">
        <div className="absolute inset-0 mesh-gradient opacity-20" />
        <div className="relative z-10 space-y-8 max-w-md">
          <div className="w-32 h-32 bg-destructive/10 text-destructive rounded-[2.5rem] flex items-center justify-center mx-auto shadow-2xl">
            <AlertCircle className="w-16 h-16" />
          </div>
          <div className="space-y-4">
            <h1 className="text-5xl font-black uppercase italic tracking-tighter">RDV Invalide</h1>
            <p className="text-white/40 font-bold leading-relaxed">
              Le code d'accès fourni ne correspond à aucune instance de rendez-vous enregistrée sur les serveurs Renault Axis.
            </p>
          </div>
          <Link href="/">
            <Button variant="outline" className="h-16 px-10 rounded-2xl border-white/10 hover:bg-white/5 font-black uppercase italic tracking-tight mt-8">
              Retour Accueil
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return null;
    return {
      day: d.toLocaleDateString('fr-FR', { day: '2-digit' }),
      month: d.toLocaleDateString('fr-FR', { month: 'short' }).toUpperCase().replace('.', ''),
      time: d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    };
  };

  const dateInfo = ticket.scheduledAt 
    ? formatDate(ticket.scheduledAt)
    : formatDate(ticket.createdAt);

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 mesh-gradient opacity-50 pointer-events-none" />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-lg relative z-10"
      >
        <Card className="rounded-[4rem] border-white/10 bg-white/[0.03] backdrop-blur-3xl shadow-[0_50px_100px_rgba(0,0,0,0.8)] overflow-hidden group">
          <div className="bg-primary p-16 text-center relative overflow-hidden">
             {/* Technical pattern overlay */}
             <div className="absolute inset-0 opacity-[0.03] flex items-center justify-center scale-150 rotate-12 pointer-events-none">
                <ShieldCheck className="w-96 h-96" />
             </div>
             
             <div className="relative z-10 space-y-8">
                <div className="w-28 h-28 bg-black rounded-[2.5rem] flex items-center justify-center mx-auto shadow-2xl ring-[12px] ring-black/5 group-hover:scale-110 transition-transform duration-500">
                  <ShieldCheck className="w-14 h-14 text-primary" />
                </div>
                <div className="space-y-2">
                  <h1 className="text-5xl font-black text-black uppercase italic tracking-tighter leading-none">RDV Validé</h1>
                  <p className="text-black/40 font-black uppercase tracking-[0.4em] text-[10px]">Security Certification Approved</p>
                </div>
             </div>
          </div>

          <CardContent className="p-16 space-y-12">
            <div className="space-y-10">
              <div className="flex gap-8 items-center">
                <div className="w-16 h-16 bg-white/5 rounded-[1.5rem] flex items-center justify-center text-primary shadow-inner">
                  <Car className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Configuration Véhicule</p>
                  <p className="text-2xl font-black text-white uppercase italic tracking-tighter">
                    {ticket.title?.split(' (')[0] || "Véhicule Renault"}
                  </p>
                  <Badge variant="outline" className="border-primary/20 text-primary/60 rounded-lg text-[9px] font-black uppercase tracking-widest px-3 py-0.5">
                    {ticket.title?.includes('(') ? ticket.title.split('(')[1].split(')')[0] : "MATRICULE CERTIFIÉ"}
                  </Badge>
                </div>
              </div>

              <div className="flex gap-8 items-center">
                <div className="w-16 h-16 bg-white/5 rounded-[1.5rem] flex items-center justify-center text-primary shadow-inner">
                  <Wrench className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Protocol Intervention</p>
                  <p className="text-2xl font-black text-white uppercase italic tracking-tighter">
                    {ticket.title?.split(' - ')[1] || "Maintenance Système"}
                  </p>
                  <p className="text-[11px] font-bold text-white/40 uppercase tracking-wide">
                    {ticket.description?.includes('Service: ') ? ticket.description.split('Service: ')[1] : "Revision Technique Standard"}
                  </p>
                </div>
              </div>

              <div className="h-px bg-white/5 w-full" />

              <div className="grid grid-cols-2 gap-12">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-primary" />
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Date</p>
                  </div>
                  <div className="flex items-end gap-3">
                    <span className="text-4xl font-black text-white uppercase italic tracking-tighter leading-none">{dateInfo ? dateInfo.day : "--"}</span>
                    <span className="text-sm font-black text-primary uppercase italic tracking-widest pb-1">{dateInfo ? dateInfo.month : "---"}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Loader2 className="w-4 h-4 text-primary" />
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Slot</p>
                  </div>
                  <div className="flex items-end gap-3">
                    <span className="text-4xl font-black text-white uppercase italic tracking-tighter leading-none">{dateInfo ? dateInfo.time : "--:--"}</span>
                    <span className="text-[10px] font-black text-white/20 uppercase tracking-widest pb-1">UTC+1</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-12 border-t border-white/5 text-center space-y-4">
               <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.5em]">Authentication ID</p>
               <div className="bg-white/5 py-4 px-6 rounded-2xl border border-white/5 font-mono text-xs text-primary/40 break-all">
                 {ticket.id}
               </div>
            </div>
          </CardContent>

           {/* Decorative stripes */}
           <div className="absolute top-0 right-0 w-24 h-full flex gap-1 opacity-[0.03] rotate-12 -mr-8 pointer-events-none group-hover:opacity-[0.08] transition-opacity">
             <div className="w-4 h-full bg-primary" />
             <div className="w-2 h-full bg-primary" />
             <div className="w-8 h-full bg-primary" />
          </div>
        </Card>

        <div className="mt-12 flex flex-col items-center gap-8">
           <Link href="/">
             <Button variant="ghost" className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30 hover:text-white transition-all">
                &larr; Exit Verification System
             </Button>
           </Link>
           <p className="text-2xl font-black text-white uppercase italic tracking-tighter opacity-20">
             Renault <span className="text-primary">Axis</span>
           </p>
        </div>
      </motion.div>
    </div>
  );
}

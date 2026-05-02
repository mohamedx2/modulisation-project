"use client";

import { useEffect, useState } from "react";
import { Plus, Search, Filter, History, CheckCircle2, DollarSign, Download, Loader2, Car, Calendar, ArrowRight, Settings, Info, MapPin, Activity } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAuth } from "../providers";
import { fetchWithAuth } from "@/lib/api";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardOverview() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [stats, setStats] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!user) return;
      try {
        const [statsData, vehiclesData] = await Promise.all([
          fetchWithAuth("/dashboard/stats"),
          fetchWithAuth("/dashboard/vehicles")
        ]);
        
        setStats(statsData.data || statsData);
        setVehicles(vehiclesData.data || vehiclesData);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setFetching(false);
      }
    }

    loadData();
  }, [user]);

  if (loading || fetching) {
    return (
      <div className="p-12 flex items-center justify-center h-full">
         <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-12 max-w-[1600px] mx-auto space-y-12">
      {/* Header Section */}
      <div className="space-y-2">
        <h1 className="text-5xl font-black tracking-tighter">
          Bonjour, <span className="text-primary italic">{user?.name?.split(' ')[0] || "Jean-Pierre"}</span>
        </h1>
        <p className="text-muted-foreground font-bold text-lg">
          Bienvenue sur votre espace Renault RDV. Voici l'état de votre parc.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Main Content Area */}
        <div className="flex-1 space-y-12">
          {/* Quick Actions Grid */}
          <section className="space-y-6">
            <h2 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Actions Rapides</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card 
                onClick={() => router.push("/dashboard/tickets")}
                className="bg-primary border-none p-6 flex flex-col justify-between h-40 cursor-pointer hover:shadow-lg transition-all group"
              >
                 <div className="w-10 h-10 bg-black/10 rounded-xl flex items-center justify-center">
                    <Plus className="w-6 h-6 text-black" />
                 </div>
                 <div>
                    <h3 className="font-black text-black text-lg uppercase">Prendre RDV</h3>
                    <p className="text-black/60 text-xs font-bold uppercase tracking-tighter">RÉSERVEZ EN 1 MINUTE</p>
                 </div>
              </Card>
              <Card 
                onClick={() => router.push("/dashboard/my-rdv")}
                className="bg-muted/50 border-none p-6 flex flex-col justify-between h-40 cursor-pointer hover:bg-muted transition-all"
              >
                 <div className="w-10 h-10 bg-background rounded-xl flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-black" />
                 </div>
                 <h3 className="font-black text-black text-lg uppercase">Mes RDVs</h3>
              </Card>
              <Card 
                onClick={() => router.push("/dashboard/history")}
                className="bg-muted/50 border-none p-6 flex flex-col justify-between h-40 cursor-pointer hover:bg-muted transition-all"
              >
                 <div className="w-10 h-10 bg-background rounded-xl flex items-center justify-center">
                    <History className="w-5 h-5 text-black" />
                 </div>
                 <h3 className="font-black text-black text-lg uppercase">Historique</h3>
              </Card>
            </div>
          </section>

          {/* Vehicle Management */}
          <section className="space-y-6">
            <div className="flex items-center justify-between border-l-4 border-primary pl-4">
              <h2 className="text-2xl font-black uppercase tracking-tighter">MES VÉHICULES</h2>
              <Button 
                onClick={() => router.push("/dashboard/vehicles/add")}
                className="rounded-xl font-black uppercase italic tracking-tight h-10 px-6 shadow-lg shadow-primary/20"
              >
                <Car className="w-4 h-4 mr-2" /> Ajouter
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {vehicles.map((vehicle, idx) => (
                <Card key={vehicle.id || idx} className="overflow-hidden border-none shadow-sm group cursor-pointer hover:shadow-xl transition-all rounded-[2rem]">
                   <div className="relative aspect-video overflow-hidden">
                      <img src={vehicle.img || "https://images.unsplash.com/photo-1541899481282-d53bffe3c15d?q=80&w=600&auto=format&fit=crop"} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                      <div className="absolute top-4 right-4">
                        <Badge className="bg-black/80 backdrop-blur-md text-white border-none font-bold px-3 py-1">{vehicle.plate}</Badge>
                      </div>
                   </div>
                   <CardContent className="p-8 space-y-4">
                      <div className="flex justify-between items-start">
                         <div>
                            <h3 className="text-xl font-black">{vehicle.name}</h3>
                            <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase mt-1">
                               <Calendar className="w-3 h-3" />
                               DERNIER ENTRETIEN: {vehicle.lastService || vehicle.date || "N/A"}
                            </div>
                         </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                           <span>Prochain Service: 15,000 KM</span>
                           <span className="text-primary">{vehicle.health}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                           <div className="h-full bg-primary" style={{ width: `${vehicle.health}%` }} />
                        </div>
                      </div>
                   </CardContent>
                </Card>
              ))}
            </div>
          </section>
        </div>

        {/* Right Sidebar Tracker */}
        <div className="w-full lg:w-[380px] space-y-8">
           <Card className="bg-black text-white rounded-[2rem] p-8 space-y-8 overflow-hidden relative border-none shadow-2xl">
              <div className="relative z-10 space-y-8">
                <div className="space-y-2">
                  <Badge className="bg-primary text-black font-black uppercase text-[10px] px-3 border-none">En cours</Badge>
                  <h3 className="text-2xl font-black uppercase italic tracking-tighter">Révision Annuelle</h3>
                  <p className="text-white/60 text-xs font-medium italic">Clio V - TUN 9999</p>
                </div>

                <div className="space-y-6">
                   <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-black">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-black uppercase tracking-widest">Réception du véhicule</p>
                        <p className="text-[10px] text-white/40 font-bold">TERMINÉ - 08:30</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full border-2 border-primary flex items-center justify-center text-primary">
                        <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-black uppercase tracking-widest">Diagnostic & Inspection</p>
                        <p className="text-[10px] text-primary font-bold">EN COURS</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-4 opacity-30">
                      <div className="w-8 h-8 rounded-full border-2 border-white/20" />
                      <div className="flex-1">
                        <p className="text-xs font-black uppercase tracking-widest">Travaux d'entretien</p>
                        <p className="text-[10px] font-bold">EN ATTENTE</p>
                      </div>
                   </div>
                </div>

                <Button className="w-full bg-primary text-black font-black rounded-xl h-12 hover:bg-primary/90 border-none uppercase text-xs tracking-widest">
                   VOIR LE DÉTAIL
                </Button>
              </div>
              <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 blur-[60px] -mr-20 -mt-20 rounded-full" />
           </Card>

           <Card className="bg-white border-none shadow-sm rounded-[2rem] p-8 space-y-6">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Localisation</h4>
              <div className="flex items-start gap-4">
                 <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-primary" />
                 </div>
                 <div>
                    <p className="font-black text-sm uppercase">Renault Axis - Tunis</p>
                    <p className="text-xs text-muted-foreground font-medium">Zone Industrielle Khair-Eddine</p>
                 </div>
              </div>
              <div className="aspect-video bg-muted rounded-2xl relative overflow-hidden group">
                 <img src="https://images.unsplash.com/photo-1526772662000-3f88f10405ff?q=80&w=400&auto=format&fit=crop" className="w-full h-full object-cover grayscale" />
                 <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-all" />
              </div>
           </Card>
        </div>
      </div>
    </div>
  );
}
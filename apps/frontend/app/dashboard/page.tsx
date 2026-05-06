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
    if (user && !loading) {
      const role = user.role?.toUpperCase();
      if (role === "ADMIN" || role === "SUPER_ADMIN") {
        router.replace("/adminDashboard");
      }
    }
  }, [user, loading, router]);

  useEffect(() => {
    async function loadData() {
      if (!user) return;
      try {
        const [statsData, vehiclesData] = await Promise.all([
          fetchWithAuth("/dashboard/stats"),
          fetchWithAuth("/vehicles")
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
    <div className="p-8 lg:p-12 max-w-[1600px] mx-auto space-y-12 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -mr-64 -mt-64 z-0 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-primary/5 rounded-full blur-[100px] -ml-32 -mb-32 z-0 pointer-events-none" />
      
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2 relative z-10"
      >
        <h1 className="text-5xl lg:text-6xl font-black tracking-tighter uppercase italic">
          Bonjour, <span className="text-primary">{user?.name?.split(' ')[0] || "Client"}</span>
        </h1>
        <p className="text-muted-foreground font-bold text-lg max-w-2xl">
          Bienvenue sur votre espace <span className="text-foreground">Renault Axis</span>. Voici l'état en temps réel de votre parc automobile.
        </p>
      </motion.div>

      <div className="flex flex-col lg:flex-row gap-12 relative z-10">
        {/* Main Content Area */}
        <div className="flex-1 space-y-16">
          {/* Quick Actions Grid */}
          <section className="space-y-6">
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground ml-1">Actions Rapides</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: "Prendre RDV", desc: "RÉSERVEZ EN 1 MINUTE", icon: Plus, path: "/dashboard/tickets", primary: true },
                { label: "Mes RDVs", desc: "CONSULTEZ VOS PLANNINGS", icon: Calendar, path: "/dashboard/my-rdv" },
                { label: "Historique", desc: "ARCHIVES DES SERVICES", icon: History, path: "/dashboard/history" },
              ].map((action, i) => (
                <motion.div
                  key={action.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card 
                    onClick={() => router.push(action.path)}
                    className={`group relative overflow-hidden h-44 cursor-pointer transition-all duration-500 border-none rounded-[2rem] flex flex-col justify-between p-8 ${
                      action.primary 
                        ? "bg-primary text-black shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-1" 
                        : "bg-white dark:bg-zinc-900 shadow-sm hover:shadow-xl hover:-translate-y-1 border border-zinc-100 dark:border-zinc-800"
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12 ${
                      action.primary ? "bg-black/10" : "bg-primary/10 text-primary"
                    }`}>
                      <action.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className={`font-black text-xl uppercase italic tracking-tighter ${action.primary ? "text-black" : "text-foreground"}`}>
                        {action.label}
                      </h3>
                      <p className={`text-[10px] font-black uppercase tracking-widest mt-1 ${action.primary ? "text-black/60" : "text-muted-foreground"}`}>
                        {action.desc}
                      </p>
                    </div>
                    {/* Decorative stripes */}
                    <div className="absolute top-0 right-0 w-24 h-full flex gap-1 opacity-10 group-hover:opacity-20 transition-opacity rotate-12 -mr-8">
                       <div className={`w-4 h-full ${action.primary ? 'bg-black' : 'bg-primary'}`} />
                       <div className={`w-2 h-full ${action.primary ? 'bg-black' : 'bg-primary'}`} />
                       <div className={`w-8 h-full ${action.primary ? 'bg-black' : 'bg-primary'}`} />
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Vehicle Management */}
          <section className="space-y-8">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h2 className="text-3xl font-black uppercase tracking-tighter italic">MES VÉHICULES</h2>
                <div className="h-1.5 w-24 bg-primary rounded-full" />
              </div>
              <Button 
                onClick={() => router.push("/dashboard/vehicles/add")}
                className="rounded-2xl font-black uppercase italic tracking-tight h-12 px-8 shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all active:scale-95"
              >
                <Car className="w-5 h-5 mr-2" /> Ajouter un véhicule
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {vehicles.map((vehicle, idx) => (
                <motion.div
                  key={vehicle.id || idx}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card className="group overflow-hidden border-none shadow-sm hover:shadow-2xl transition-all duration-500 rounded-[2.5rem] bg-white dark:bg-zinc-900 cursor-pointer">
                    <div className="relative aspect-[16/9] overflow-hidden">
                      <img 
                        src={vehicle.img || vehicle.imageData || "https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=800&auto=format&fit=crop"} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                      <div className="absolute top-6 right-6">
                        <Badge className="bg-primary text-black border-none font-black px-4 py-2 rounded-xl text-xs shadow-xl tracking-tighter">
                          {vehicle.plate}
                        </Badge>
                      </div>
                      <div className="absolute bottom-6 left-8">
                        <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter group-hover:text-primary transition-colors">
                          {vehicle.name}
                        </h3>
                      </div>
                    </div>
                    <CardContent className="p-8 space-y-6">
                       <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                          <div className="flex items-center gap-2">
                             <Calendar className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                             DERNIER SERVICE: {vehicle.lastService || vehicle.date || "NON DISPONIBLE"}
                          </div>
                          <div className="text-foreground flex items-center gap-2">
                             <Activity className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                             SANTÉ: <span className="text-amber-600 dark:text-amber-400">{vehicle.health || 100}%</span>
                          </div>
                       </div>
                       <div className="space-y-3">
                          <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                             <motion.div 
                               initial={{ width: 0 }}
                               animate={{ width: `${vehicle.health || 100}%` }}
                               transition={{ duration: 1, delay: 0.5 }}
                               className={`h-full ${ (vehicle.health || 100) > 70 ? 'bg-emerald-500' : (vehicle.health || 100) > 40 ? 'bg-primary' : 'bg-destructive'}`} 
                             />
                          </div>
                          <div className="flex justify-between items-center text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                             <span>Révision recommandée: 15,000 KM</span>
                             <span className="flex items-center gap-1">OPTIMAL <CheckCircle2 className="w-3 h-3 text-emerald-500" /></span>
                          </div>
                       </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Sidebar Tracker */}
        <div className="w-full lg:w-[400px] space-y-8">
           <motion.div
             initial={{ opacity: 0, x: 20 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ delay: 0.3 }}
           >
             <Card className="bg-zinc-950 text-white rounded-[2.5rem] p-10 space-y-10 overflow-hidden relative border-none shadow-2xl">
                <div className="relative z-10 space-y-10">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Badge className="bg-primary text-black font-black uppercase text-[10px] px-4 py-1.5 border-none rounded-full shadow-lg shadow-primary/20">
                        Live Tracking
                      </Badge>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                        <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Atelier Actif</span>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-3xl font-black uppercase italic tracking-tighter leading-none">Révision Annuelle</h3>
                      <p className="text-white/40 text-xs font-bold uppercase tracking-widest mt-2">Clio V — <span className="text-primary italic">TUN 224</span></p>
                    </div>
                  </div>

                  <div className="space-y-8 relative">
                    <div className="absolute left-[15px] top-4 bottom-4 w-0.5 bg-zinc-800" />
                    
                    {[
                      { label: "Réception véhicule", time: "08:30", status: "completed" },
                      { label: "Diagnostic & Inspection", time: "EN COURS", status: "active" },
                      { label: "Travaux d'entretien", time: "EN ATTENTE", status: "pending" },
                      { label: "Contrôle Qualité", time: "EN ATTENTE", status: "pending" },
                    ].map((step, i) => (
                      <div key={step.label} className="flex items-center gap-6 relative">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 transition-colors duration-500 ${
                          step.status === 'completed' ? 'bg-primary text-black' : 
                          step.status === 'active' ? 'bg-black border-2 border-primary text-primary shadow-lg shadow-primary/20' : 
                          'bg-zinc-900 border-2 border-zinc-800 text-zinc-600'
                        }`}>
                          {step.status === 'completed' ? <CheckCircle2 className="w-4 h-4" /> : <div className={`w-2 h-2 rounded-full ${step.status === 'active' ? 'bg-primary animate-pulse' : 'bg-zinc-700'}`} />}
                        </div>
                        <div className="flex-1">
                          <p className={`text-xs font-black uppercase tracking-widest ${step.status === 'pending' ? 'text-zinc-600' : 'text-white'}`}>
                            {step.label}
                          </p>
                          <p className={`text-[10px] font-bold mt-1 ${
                            step.status === 'completed' ? 'text-zinc-500' : 
                            step.status === 'active' ? 'text-primary' : 
                            'text-zinc-700'
                          }`}>
                            {step.time}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Button className="w-full bg-white text-black font-black rounded-2xl h-14 hover:bg-zinc-200 border-none uppercase text-xs tracking-[0.2em] shadow-xl transition-all active:scale-95">
                     Détails de l'intervention
                  </Button>
                </div>
                
                {/* Background decorative elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] -mr-32 -mt-32 rounded-full" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/5 blur-[60px] -ml-16 -mb-16 rounded-full" />
             </Card>
           </motion.div>

           <Card className="bg-white dark:bg-zinc-900 border-none shadow-sm hover:shadow-xl transition-all duration-500 rounded-[2.5rem] p-10 space-y-8 group overflow-hidden relative">
              <div className="flex items-center justify-between">
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Centre Service</h4>
                <Badge variant="outline" className="border-primary/20 text-primary rounded-lg text-[9px] font-black italic">OUVERT</Badge>
              </div>
              <div className="flex items-start gap-5 relative z-10">
                 <div className="w-14 h-14 bg-primary/10 rounded-[1.25rem] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-500">
                    <MapPin className="w-7 h-7 text-primary" />
                 </div>
                 <div>
                    <p className="font-black text-lg uppercase italic tracking-tighter">Renault Axis Tunis</p>
                    <p className="text-xs text-muted-foreground font-semibold leading-relaxed mt-1">Zone Industrielle Khair-Eddine,<br />Le Kram, Tunis</p>
                 </div>
              </div>
              <div className="aspect-[4/3] bg-muted rounded-[2rem] relative overflow-hidden group/map shadow-inner border border-zinc-100 dark:border-zinc-800">
                 <img 
                   src="https://images.unsplash.com/photo-1565008447742-97f6f38c985c?q=80&w=600&auto=format&fit=crop" 
                   className="w-full h-full object-cover grayscale group-hover/map:grayscale-0 transition-all duration-1000" 
                 />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                 <div className="absolute bottom-6 left-6 right-6">
                   <Button variant="secondary" className="w-full bg-white/10 backdrop-blur-md border-white/20 text-white font-black uppercase text-[10px] tracking-widest h-10 rounded-xl hover:bg-white/20">
                      S'y rendre &rarr;
                   </Button>
                 </div>
              </div>
              {/* Decorative stripes for consistency */}
              <div className="absolute top-0 right-0 w-16 h-full flex gap-1 opacity-[0.03] rotate-12 -mr-4">
                 <div className="w-4 h-full bg-primary" />
                 <div className="w-2 h-full bg-primary" />
                 <div className="w-8 h-full bg-primary" />
              </div>
           </Card>
        </div>
      </div>
    </div>
  );
}
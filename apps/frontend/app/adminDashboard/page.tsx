"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, Settings, Database, Activity, ShieldCheck, Mail, Server, Cpu, 
  Globe, Zap, ArrowLeft, Download, Calendar, Car, BarChart3, PieChart, 
  Search, Filter, CheckCircle2, AlertCircle, Clock, Trash2, ExternalLink,
  ChevronRight, RefreshCcw, LayoutDashboard
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/app/providers";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { fetchWithAuth } from "@/lib/api";

type TabType = "overview" | "reservations" | "cars" | "monitoring";

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [reservations, setReservations] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const loadAdminData = async () => {
    try {
      setIsLoading(true);
      const [resData, vehData] = await Promise.all([
        fetchWithAuth("/tickets"),
        fetchWithAuth("/vehicles")
      ]);
      setReservations(resData.data || resData || []);
      setVehicles(vehData.data || vehData || []);
    } catch (err) {
      console.error("Failed to load admin data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const TABS = [
    { id: "overview", label: "Dashboard", icon: LayoutDashboard },
    { id: "reservations", label: "Reservations", icon: Calendar },
    { id: "cars", label: "Fleet", icon: Car },
    { id: "monitoring", label: "Monitoring", icon: BarChart3 },
  ];

  return (
    <div className="dark min-h-screen bg-black text-white font-sans selection:bg-primary selection:text-black overflow-x-hidden">
      {/* Background Mesh */}
      <div className="absolute inset-0 mesh-gradient opacity-30 z-0 pointer-events-none" />
      
      <header className="sticky top-0 z-50 bg-black/60 backdrop-blur-2xl border-b border-white/10 h-24 flex items-center px-12 justify-between">
        <div className="flex items-center gap-6">
           <div className="w-12 h-12 rounded-2xl bg-primary text-black flex items-center justify-center font-black shadow-[0_10px_30px_rgba(255,203,5,0.2)] group cursor-pointer">
             <ShieldCheck className="w-6 h-6 group-hover:rotate-12 transition-transform" />
           </div>
           <div>
             <h2 className="font-black text-2xl tracking-tighter uppercase italic leading-none">Command <span className="text-primary">Center</span></h2>
             <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60 mt-1">Infrastructure Management v4.0</p>
           </div>
        </div>

        <nav className="hidden lg:flex items-center gap-2 bg-white/5 p-1.5 rounded-2xl border border-white/5">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center gap-3 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
                activeTab === tab.id 
                  ? "bg-primary text-black shadow-lg shadow-primary/20" 
                  : "text-white/40 hover:text-white hover:bg-white/5"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-8">
           <Link href="/dashboard" className="text-[10px] font-black uppercase tracking-widest text-white/60 hover:text-white transition-colors flex items-center gap-2">
             <ArrowLeft className="w-4 h-4" /> Exit Admin
           </Link>
           <div className="h-8 w-px bg-white/10" />
           <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/60 leading-none mb-1">Authenticated as</p>
                <p className="text-sm font-black italic uppercase tracking-tighter text-primary">{user?.name || "System Architect"}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center font-black text-primary italic">
                {user?.name?.charAt(0) || "A"}
              </div>
           </div>
        </div>
      </header>

      <main className="p-12 lg:p-16 max-w-[1600px] mx-auto relative z-10">
        
        <AnimatePresence mode="wait">
          {activeTab === "overview" && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-16"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
                <div className="space-y-3">
                    <h1 className="text-5xl lg:text-6xl font-black text-white uppercase italic tracking-tighter">System <span className="text-primary italic">Overview</span></h1>
                    <div className="flex items-center gap-4">
                      <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-4 py-1.5 rounded-full font-black uppercase text-[9px] tracking-widest">
                        Core Online
                      </Badge>
                      <span className="text-white/60 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" /> Uptime: 1,248 Hours
                      </span>
                    </div>
                </div>
                <div className="flex gap-4">
                    <Button onClick={loadAdminData} variant="outline" className="rounded-2xl h-14 px-8 border-white/20 bg-white/5 hover:bg-white/10 text-white font-black uppercase italic tracking-tight gap-3">
                      <RefreshCcw className={`w-5 h-5 opacity-60 ${isLoading ? "animate-spin" : ""}`} /> Refresh Data
                    </Button>
                    <Button className="rounded-2xl h-14 px-8 font-black uppercase italic tracking-tight gap-3 shadow-xl shadow-primary/20 bg-primary text-black hover:bg-primary/90">
                      <Server className="w-5 h-5" /> Deploy Update
                    </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                  { label: "Active Reservations", value: reservations.length, icon: Calendar, color: "text-primary", sub: "Global Active" },
                  { label: "Managed Fleet", value: vehicles.length, icon: Car, color: "text-blue-400", sub: "Fleet Capacity" },
                  { label: "CPU Utilization", value: "14%", icon: Cpu, color: "text-emerald-400", sub: "Optimal Load" },
                  { label: "Storage Capacity", value: "82%", icon: Database, color: "text-amber-400", sub: "PostgreSQL Cluster" },
                ].map((stat, i) => (
                  <Card key={i} className="rounded-[2.5rem] border-white/10 bg-white/[0.05] backdrop-blur-xl p-10 hover:bg-white/[0.08] transition-all group overflow-hidden relative border-none">
                    <div className="flex items-center justify-between mb-10 relative z-10">
                        <div className={`p-4 rounded-2xl bg-white/5 ${stat.color} group-hover:scale-110 transition-transform duration-500`}>
                          <stat.icon className="w-8 h-8" />
                        </div>
                        <div className="text-[9px] font-black uppercase tracking-widest text-white/40 italic">{stat.sub}</div>
                    </div>
                    <div className="space-y-1 relative z-10">
                        <p className="text-[10px] font-black text-white/70 uppercase tracking-[0.2em]">{stat.label}</p>
                        <div className="text-5xl font-black italic tracking-tighter text-white">{stat.value}</div>
                    </div>
                    <div className="absolute top-0 right-0 w-16 h-full flex gap-1 opacity-[0.03] rotate-12 -mr-4 group-hover:opacity-[0.08] transition-opacity">
                       <div className="w-4 h-full bg-primary" />
                       <div className="w-2 h-full bg-primary" />
                    </div>
                  </Card>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-2 rounded-[3rem] border-white/10 bg-white/[0.03] backdrop-blur-xl p-12 overflow-hidden relative">
                   <div className="flex justify-between items-center mb-10">
                      <div>
                        <h3 className="text-2xl font-black uppercase italic tracking-tighter text-white">System <span className="text-primary italic">Activity</span></h3>
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mt-1">Live Transaction Stream</p>
                      </div>
                      <Badge variant="outline" className="border-primary/20 text-primary font-black uppercase tracking-widest">Live Node</Badge>
                   </div>
                   <div className="space-y-6 font-mono text-xs">
                      {[
                        { time: "08:42:12", method: "POST", endpoint: "/api/ocr/scan", user: "hamrouni_m", code: 201, latency: "42ms" },
                        { time: "08:42:15", method: "GET", endpoint: "/api/tickets/summary", user: "anonymized", code: 200, latency: "12ms" },
                        { time: "08:42:18", method: "PUT", endpoint: "/api/users/role", user: "admin_sys", code: 204, latency: "22ms" },
                        { time: "08:42:22", method: "GET", endpoint: "/api/vehicles/mine", user: "client_x", code: 200, latency: "8ms" },
                      ].map((log, i) => (
                        <div key={i} className="flex gap-6 text-white/60 border-b border-white/5 pb-4 last:border-none">
                           <span className="text-primary font-black">[{log.time}]</span>
                           <span className="text-white font-bold uppercase w-20">{log.method}</span>
                           <span className="text-white/40 flex-1">{log.endpoint}</span>
                           <span className="italic hidden md:block w-32 truncate">{log.user}</span>
                           <span className="text-emerald-400 font-black">{log.code}</span>
                           <span className="text-white/40 hidden md:block">{log.latency}</span>
                        </div>
                      ))}
                   </div>
                </Card>

                <Card className="rounded-[3rem] border-white/10 bg-white/[0.03] backdrop-blur-xl p-12 space-y-8">
                   <h3 className="text-xl font-black uppercase italic tracking-tighter text-white">Management <span className="text-primary italic">Tools</span></h3>
                   <div className="space-y-4">
                      {[
                        { label: "Keycloak IAM", icon: ShieldCheck, desc: "Security & Roles" },
                        { label: "Prisma Studio", icon: Database, desc: "Database Audit" },
                        { label: "SMTP Relay", icon: Mail, desc: "Email Engine" },
                      ].map((tool, i) => (
                        <div key={i} className="flex items-center justify-between p-6 bg-white/5 rounded-[2rem] hover:bg-white/10 transition-colors cursor-pointer group">
                           <div className="flex items-center gap-4">
                              <div className="p-3 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-black transition-all">
                                <tool.icon className="w-5 h-5" />
                              </div>
                              <div>
                                <p className="text-sm font-black uppercase italic tracking-tighter">{tool.label}</p>
                                <p className="text-[8px] font-black uppercase tracking-widest text-white/40">{tool.desc}</p>
                              </div>
                           </div>
                           <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-primary transition-colors" />
                        </div>
                      ))}
                   </div>
                </Card>
              </div>
            </motion.div>
          )}

          {activeTab === "reservations" && (
            <motion.div
              key="reservations"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-10"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                  <h2 className="text-4xl font-black uppercase italic tracking-tighter text-white">Reservation <span className="text-primary italic">Control</span></h2>
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mt-1">Managing {reservations.length} total active tickets</p>
                </div>
                <div className="flex gap-4 w-full md:w-auto">
                  <div className="relative flex-1 md:flex-initial">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <Input 
                      placeholder="Search Client or Plate..." 
                      className="w-full md:w-80 h-14 pl-12 rounded-2xl bg-white/5 border-white/10 text-[10px] font-black uppercase tracking-widest focus:ring-primary"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Button variant="outline" className="h-14 rounded-2xl border-white/10 font-black uppercase text-[10px] tracking-widest gap-2 bg-white/5 hover:bg-white/10">
                    <Filter className="w-4 h-4" /> Filter
                  </Button>
                </div>
              </div>

              <Card className="rounded-[3rem] border-white/10 bg-white/[0.03] overflow-hidden border-none shadow-2xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead>
                      <tr className="bg-white/5 border-b border-white/5">
                        <th className="p-8 text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Client Details</th>
                        <th className="p-8 text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Vehicle Model</th>
                        <th className="p-8 text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Registration</th>
                        <th className="p-8 text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Schedule</th>
                        <th className="p-8 text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Status</th>
                        <th className="p-8 text-[10px] font-black uppercase tracking-[0.3em] text-white/40 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {reservations.filter(r => 
                        r.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        r.vehiclePlate?.toLowerCase().includes(searchQuery.toLowerCase())
                      ).map((res) => (
                        <tr key={res.id} className="hover:bg-white/[0.02] transition-colors group">
                          <td className="p-8">
                            <div className="font-black italic uppercase tracking-tight text-lg text-white leading-none mb-1">{res.user?.name || "Anonymous"}</div>
                            <div className="text-[10px] font-black text-white/40 uppercase tracking-widest">{res.user?.email || "internal@axis.com"}</div>
                          </td>
                          <td className="p-8 font-bold text-white uppercase italic tracking-tight">{res.vehicleModel || "Standard Service"}</td>
                          <td className="p-8">
                            <Badge className="bg-primary/10 text-primary border border-primary/20 px-3 py-1 font-black uppercase text-[10px] tracking-widest">
                               {res.vehiclePlate || "N/A"}
                            </Badge>
                          </td>
                          <td className="p-8">
                            <div className="font-bold text-white uppercase italic tracking-tight leading-none mb-1">{new Date(res.date).toLocaleDateString('fr-FR')}</div>
                            <div className="text-[10px] font-black text-white/40 uppercase tracking-widest flex items-center gap-2">
                               <Clock className="w-3 h-3 text-primary" /> {res.time}
                            </div>
                          </td>
                          <td className="p-8">
                            <div className="flex items-center gap-2 text-emerald-400 font-black uppercase text-[10px] tracking-widest">
                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Confirmed
                            </div>
                          </td>
                          <td className="p-8 text-right">
                            <div className="flex justify-end gap-2">
                               <Button size="icon" variant="ghost" className="w-10 h-10 rounded-xl hover:bg-white/5 text-white/40 hover:text-white">
                                  <ExternalLink className="w-4 h-4" />
                               </Button>
                               <Button size="icon" variant="ghost" className="w-10 h-10 rounded-xl hover:bg-destructive/10 text-white/40 hover:text-destructive">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </motion.div>
          )}

          {activeTab === "cars" && (
            <motion.div
              key="cars"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-12"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-4xl font-black uppercase italic tracking-tighter text-white">Fleet <span className="text-primary italic">Intelligence</span></h2>
                <Button className="rounded-2xl h-14 px-8 font-black uppercase italic tracking-tight gap-3 bg-white/5 text-white border border-white/10 hover:bg-white/10">
                   Add New Vehicle
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {vehicles.map((veh) => (
                  <Card key={veh.id} className="rounded-[3rem] border-white/10 bg-white/[0.03] overflow-hidden group hover:bg-white/[0.05] transition-all duration-500 border-none shadow-xl">
                    <div className="aspect-[16/10] bg-zinc-900 flex items-center justify-center relative overflow-hidden">
                       {veh.img ? (
                         <img src={veh.img} alt={veh.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                       ) : (
                         <div className="flex flex-col items-center gap-4">
                            <Car className="w-20 h-20 text-white/5 group-hover:scale-125 transition-transform duration-700" />
                            <p className="text-[10px] font-black uppercase tracking-widest text-white/20">No Visual Assets</p>
                         </div>
                       )}
                       <div className="absolute top-6 right-6">
                          <Badge className="bg-primary text-black font-black italic px-4 py-1.5 rounded-full uppercase text-[10px] tracking-widest shadow-xl shadow-primary/20">
                            {veh.plate}
                          </Badge>
                       </div>
                    </div>
                    <div className="p-10 space-y-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter leading-none">{veh.name}</h3>
                          <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mt-2 flex items-center gap-2">
                             <div className="w-1.5 h-1.5 rounded-full bg-primary" /> SYSTEM ID: {veh.id.slice(0,8)}
                          </p>
                        </div>
                        <Button size="icon" variant="ghost" className="w-12 h-12 rounded-2xl hover:bg-white/5 border border-white/5">
                          <Settings className="w-5 h-5 text-white/40" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                         <div className="bg-white/5 p-5 rounded-2xl border border-white/5">
                            <p className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em] mb-1">Assigned To</p>
                            <p className="text-[10px] font-black text-white uppercase italic truncate">{veh.owner?.name || "Inventory Stock"}</p>
                         </div>
                         <div className="bg-white/5 p-5 rounded-2xl border border-white/5">
                            <p className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em] mb-1">Health Check</p>
                            <p className="text-[10px] font-black text-emerald-400 uppercase italic">Operational</p>
                         </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === "monitoring" && (
            <motion.div
              key="monitoring"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-12"
            >
              <div className="flex justify-between items-center">
                 <div>
                   <h2 className="text-4xl font-black uppercase italic tracking-tighter text-white">Prometheus & <span className="text-primary italic">Grafana</span></h2>
                   <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mt-2 flex items-center gap-2">
                     <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" /> Live Infrastructure Feed - Core v4.0
                   </p>
                 </div>
                 <div className="flex gap-4">
                    <Button variant="outline" className="h-14 rounded-2xl border-white/10 bg-orange-500/10 text-orange-400 font-black uppercase text-[10px] tracking-widest px-8">
                      Open Grafana &nearrow;
                    </Button>
                    <Button className="h-14 rounded-2xl bg-primary text-black font-black uppercase text-[10px] tracking-widest px-8 shadow-xl shadow-primary/20">
                      Sync Metrics
                    </Button>
                 </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-2 rounded-[3rem] border-white/10 bg-[#080808] overflow-hidden p-12 relative group border-none shadow-2xl">
                  <div className="flex justify-between items-center mb-12">
                    <h3 className="font-black uppercase tracking-widest text-[11px] text-white/40">Request Latency (ms) - Global Prometheus Feed</h3>
                    <div className="flex items-center gap-6 text-[9px] font-black tracking-widest uppercase">
                       <span className="flex items-center gap-2"><div className="w-2 h-2 bg-primary rounded-full" /> API Gateway</span>
                       <span className="flex items-center gap-2"><div className="w-2 h-2 bg-blue-400 rounded-full" /> Auth Engine</span>
                    </div>
                  </div>
                  <div className="h-64 w-full flex items-end gap-2 mb-10">
                    {Array.from({ length: 45 }).map((_, i) => {
                      const height = 20 + Math.random() * 80;
                      return (
                        <div key={i} className="flex-1 flex flex-col justify-end gap-1 group/bar h-full">
                           <motion.div 
                             initial={{ height: 0 }}
                             animate={{ height: `${height}%` }}
                             className={`w-full rounded-t-sm transition-all duration-700 ${
                               height > 85 ? "bg-red-500/50" : i % 3 === 0 ? "bg-blue-400/50" : "bg-primary/50"
                             } group-hover/bar:bg-primary opacity-80`}
                           />
                        </div>
                      );
                    })}
                  </div>
                  <div className="grid grid-cols-4 gap-8 pt-10 border-t border-white/5">
                     {[
                       { label: "P99 LATENCY", value: "142ms", trend: "+4ms", color: "text-red-400" },
                       { label: "THROUGHPUT", value: "1.2k rps", trend: "-2%", color: "text-primary" },
                       { label: "ERROR RATE", value: "0.02%", trend: "Stable", color: "text-emerald-400" },
                       { label: "UPTIME", value: "99.99%", trend: "+0.01%", color: "text-emerald-400" },
                     ].map((m, i) => (
                       <div key={i}>
                         <p className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em] mb-2">{m.label}</p>
                         <p className={`text-2xl font-black italic uppercase tracking-tighter ${m.color}`}>{m.value}</p>
                       </div>
                     ))}
                  </div>
                </Card>

                <Card className="rounded-[3rem] border-white/10 bg-[#080808] p-12 space-y-12 border-none shadow-2xl">
                   <h3 className="font-black uppercase tracking-widest text-[11px] text-white/40 text-center">Memory Allocation Gauge</h3>
                   <div className="relative w-56 h-56 mx-auto">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="8" />
                        <motion.circle 
                          cx="50" cy="50" r="45" fill="none" stroke="#FFCB05" strokeWidth="8" 
                          strokeDasharray="283"
                          initial={{ strokeDashoffset: 283 }}
                          animate={{ strokeDashoffset: 283 - (283 * 0.74) }}
                          transition={{ duration: 2.5, ease: "circOut" }}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                         <span className="text-6xl font-black italic text-white">74<span className="text-2xl text-primary">%</span></span>
                         <span className="text-[9px] font-black text-white/30 uppercase tracking-widest mt-1">Utilization</span>
                      </div>
                   </div>
                   <div className="space-y-5 pt-4">
                      {[
                        { label: "PostgreSQL Pool", val: "12.4GB", color: "bg-primary" },
                        { label: "Redis Cluster", val: "4.1GB", color: "bg-blue-400" },
                        { label: "NestJS Memory", val: "32.8GB", color: "bg-emerald-400" },
                      ].map((item, i) => (
                        <div key={i} className="flex justify-between items-center text-[11px] font-black uppercase tracking-tight">
                           <div className="flex items-center gap-3 text-white/50">
                             <div className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                             {item.label}
                           </div>
                           <span className="text-white">{item.val}</span>
                        </div>
                      ))}
                   </div>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {["EU-WEST-1", "EU-CENTRAL-1", "US-EAST-1", "AP-SOUTH-1"].map((region, i) => (
                  <Card key={i} className="rounded-3xl border-white/10 bg-white/5 p-8 hover:border-primary/40 transition-all cursor-pointer group">
                    <div className="flex justify-between items-center mb-6">
                      <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">{region}</span>
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.4)]" />
                    </div>
                    <div className="flex items-end justify-between">
                       <span className="text-3xl font-black italic text-white tracking-tighter">{12 + i * 4}ms</span>
                       <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Active</span>
                    </div>
                  </Card>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </main>
    </div>
  );
}
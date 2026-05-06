"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, ShieldCheck, Mail, Server, Clock,
  ArrowLeft, Calendar, Car, BarChart3, 
  Search, Trash2, RefreshCcw, LayoutDashboard,
  CreditCard, Ticket, UserPlus, CarFront
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/app/providers";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { fetchWithAuth } from "@/lib/api";

type TabType = "overview" | "reservations" | "cars" | "users" | "monitoring";

interface Creator {
  name?: string;
  email?: string;
}

interface Reservation {
  id: string;
  title?: string;
  description?: string;
  status?: string;
  scheduledAt?: string;
  createdAt?: string;
  createdBy?: string;
  creator?: Creator;
}

interface Vehicle {
  id: string;
  name?: string;
  plate?: string;
  img?: string;
  imageData?: string;
  health?: number;
  lastService?: string;
  tenantName?: string;
  createdAt?: string;
}

interface ActivityEntry {
  id: string;
  type: string;
  method: string;
  path: string;
  status: string;
  statusCode: number;
  timestamp: string;
  user: string;
  details: string;
}

interface Tenant {
  id: string;
  name?: string;
}


interface UserData {
  id: string;
  name?: string;
  email?: string;
  role?: string;
  createdAt?: string;
  tenant?: Tenant;
}

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [users, setUsers] = useState<UserData[]>([]);
  const [activities, setActivities] = useState<ActivityEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [dashboardStats, setDashboardStats] = useState<Record<string, unknown> | null>(null);
  const [monitoringData, setMonitoringData] = useState<Record<string, unknown> | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [isMonitoringLoading, setIsMonitoringLoading] = useState(true);
  const [latencyHistory, setLatencyHistory] = useState<number[]>([]);
  const [logFilter, setLogFilter] = useState<string>("all");
  const logsContainerRef = useRef<HTMLDivElement>(null);

  const GRAFANA_URL = "http://localhost:3100";

  const loadAdminData = async () => {
    try {
      setIsLoading(true);
      const [resData, vehData, dashboardData, usersData, activityData] = await Promise.all([
        fetchWithAuth("/admin/tickets"),
        fetchWithAuth("/admin/vehicles"),
        fetchWithAuth("/admin/dashboard"),
        fetchWithAuth("/admin/users"),
        fetchWithAuth("/admin/activity"),
      ]);

      setTimeout(() => {
        setReservations(Array.isArray(resData) ? resData : (resData?.data && Array.isArray(resData.data) ? resData.data : []));
        setVehicles(Array.isArray(vehData) ? vehData : (vehData?.data && Array.isArray(vehData.data) ? vehData.data : []));
        setUsers(Array.isArray(usersData) ? usersData : (usersData?.data && Array.isArray(usersData.data) ? usersData.data : []));
        setActivities(Array.isArray(activityData) ? activityData : (activityData?.data && Array.isArray(activityData.data) ? activityData.data : []));
        const unwrappedDashboard = dashboardData?.data || dashboardData;
        if (unwrappedDashboard && typeof unwrappedDashboard === 'object' && 'stats' in unwrappedDashboard) {
          setDashboardStats(unwrappedDashboard.stats as Record<string, unknown>);
        }
        setIsLoading(false);
      }, 0);
    } catch (err) {
      console.error("Failed to load admin data:", err);
      setIsLoading(false);
    }
  };

  const loadMonitoringData = async () => {
    try {
      setIsMonitoringLoading(true);
      const metricsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/metrics/summary`);
      const metricsJson = await metricsRes.json();
      console.log('[Monitoring] Raw metrics response:', metricsJson);
      console.log('[Monitoring] Unwrapped data:', metricsJson.data || metricsJson);
      const data = metricsJson.data || metricsJson;
      setMonitoringData(data);
      setLatencyHistory((prev) => {
        const next = [...prev, (data.avgResponseTime as number) || 0];
        if (next.length > 45) next.shift();
        return next;
      });

      const logsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/logs`);
      if (logsRes.ok) {
        const logsJson = await logsRes.json();
        setLogs((logsJson.data?.logs || logsJson.logs || []) as string[]);
      }
    } catch (err) {
      console.error("Failed to load monitoring data:", err);
    } finally {
      setIsMonitoringLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadAdminData();
  }, []);

  useEffect(() => {
    if (activeTab === "monitoring") {
      loadMonitoringData();
      const interval = setInterval(loadMonitoringData, 10000);
      return () => clearInterval(interval);
    }
  }, [activeTab]);

  useEffect(() => {
    if (logsContainerRef.current) {
      logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight;
    }
  }, [logs]);

  const TABS: { id: TabType; label: string; icon: React.ElementType }[] = [
    { id: "overview", label: "Dashboard", icon: LayoutDashboard },
    { id: "reservations", label: "Reservations", icon: Calendar },
    { id: "cars", label: "Fleet", icon: Car },
    { id: "users", label: "Users", icon: Users },
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
              onClick={() => setActiveTab(tab.id)}
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
                         <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse inline-block" /> {reservations.length} Active Tickets
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
                   { label: "Active Reservations", value: dashboardStats?.activeTickets || reservations.length, icon: Calendar, color: "text-primary", sub: "Global Active" },
                   { label: "Managed Fleet", value: dashboardStats?.totalVehicles || vehicles.length, icon: Car, color: "text-blue-400", sub: "Fleet Capacity" },
                   { label: "Total Users", value: dashboardStats?.totalUsers || 0, icon: Users, color: "text-emerald-400", sub: "Registered" },
                   { label: "Revenue", value: `${dashboardStats?.totalRevenue || 0}€`, icon: Mail, color: "text-amber-400", sub: "Completed Payments" },
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
                         <div className="text-5xl font-black italic tracking-tighter text-white">{String(stat.value)}</div>
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
                        {activities.slice(0, 12).map((entry) => {
                          const methodColor = entry.method === 'POST' ? 'text-emerald-400' : entry.method === 'PATCH' ? 'text-amber-400' : 'text-blue-400';
                          const statusColor = entry.statusCode >= 500 ? 'text-red-400' : entry.statusCode >= 400 ? 'text-amber-400' : 'text-emerald-400';
                          const TypeIcon = entry.type === 'ticket' ? Ticket : entry.type === 'vehicle' ? CarFront : entry.type === 'payment' ? CreditCard : UserPlus;
                          return (
                            <div key={`${entry.id}-${entry.type}`} className="flex gap-4 text-white/60 border-b border-white/5 pb-3 last:border-none items-center group hover:bg-white/[0.02] px-2 -mx-2 rounded-lg transition-colors">
                               <span className="text-white/15 shrink-0"><TypeIcon className="w-3.5 h-3.5" /></span>
                               <span className="text-primary font-black shrink-0">[{new Date(entry.timestamp).toLocaleTimeString('fr-FR')}]</span>
                               <span className={`${methodColor} font-bold uppercase w-14 shrink-0`}>{entry.method}</span>
                               <span className="text-white/40 flex-1 truncate">{entry.path}</span>
                               <span className="italic hidden md:block w-28 truncate text-white/50">{entry.user}</span>
                               <span className={`${statusColor} font-black shrink-0`}>{entry.statusCode}</span>
                               <span className="text-white/30 hidden lg:block w-32 truncate text-[10px]">{entry.details}</span>
                            </div>
                          );
                        })}
                        {activities.length === 0 && (
                          <div className="text-center py-8 text-white/30 text-[10px] font-black uppercase tracking-widest">
                            No recent activity
                          </div>
                        )}
                     </div>
                </Card>

                <Card className="rounded-[3rem] border-white/10 bg-white/[0.03] backdrop-blur-xl p-12 space-y-8">
                   <h3 className="text-xl font-black uppercase italic tracking-tighter text-white">Management <span className="text-primary italic">Tools</span></h3>
                   <div className="space-y-4">
                      {[
                        { label: "Keycloak IAM", icon: ShieldCheck, desc: "Security & Roles" },
                        { label: "Prisma Studio", icon: Server, desc: "Database Audit" },
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
                      placeholder="Search Client or Ticket..." 
                      className="w-full md:w-80 h-14 pl-12 rounded-2xl bg-white/5 border-white/10 text-[10px] font-black uppercase tracking-widest focus:ring-primary"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <Card className="rounded-[3rem] border-white/10 bg-white/[0.03] overflow-hidden border-none shadow-2xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead>
                      <tr className="bg-white/5 border-b border-white/5">
                        <th className="p-8 text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Client Details</th>
                        <th className="p-8 text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Service</th>
                        <th className="p-8 text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Status</th>
                        <th className="p-8 text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Schedule</th>
                        <th className="p-8 text-[10px] font-black uppercase tracking-[0.3em] text-white/40">State</th>
                        <th className="p-8 text-[10px] font-black uppercase tracking-[0.3em] text-white/40 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {reservations.filter(r => 
                        r.creator?.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        r.creator?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        r.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        r.description?.toLowerCase().includes(searchQuery.toLowerCase())
                      ).map((res) => (
                        <tr key={res.id} className="hover:bg-white/[0.02] transition-colors group">
                          <td className="p-8">
                            <div className="font-black italic uppercase tracking-tight text-lg text-white leading-none mb-1">{res.creator?.name || "Anonymous"}</div>
                            <div className="text-[10px] font-black text-white/40 uppercase tracking-widest">{res.creator?.email || "N/A"}</div>
                          </td>
                          <td className="p-8">
                            <div className="font-bold text-white uppercase italic tracking-tight max-w-[200px] truncate">{res.title || "N/A"}</div>
                            <div className="text-[10px] text-white/30 mt-1 truncate max-w-[200px]">{res.description || ""}</div>
                          </td>
                          <td className="p-8">
                            <Badge className="bg-primary/10 text-primary border border-primary/20 px-3 py-1 font-black uppercase text-[10px] tracking-widest">
                               {res.status || "N/A"}
                            </Badge>
                          </td>
                          <td className="p-8">
                            {res.scheduledAt ? (
                              <>
                                <div className="font-bold text-white uppercase italic tracking-tight leading-none mb-1">{new Date(res.scheduledAt).toLocaleDateString('fr-FR')}</div>
                                <div className="text-[10px] font-black text-white/40 uppercase tracking-widest flex items-center gap-2">
                                   <Clock className="w-3 h-3 text-primary" /> {new Date(res.scheduledAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                </div>
                              </>
                            ) : (
                              <div className="text-[10px] font-black text-white/30 uppercase tracking-widest italic">Not scheduled</div>
                            )}
                          </td>
                          <td className="p-8">
                            <div className={`flex items-center gap-2 font-black uppercase text-[10px] tracking-widest ${
                              res.status === 'OPEN' ? 'text-emerald-400' : 
                              res.status === 'PENDING' ? 'text-amber-400' : 
                              res.status === 'CLOSED' ? 'text-zinc-500' : 'text-blue-400'
                            }`}>
                              <div className={`w-1.5 h-1.5 rounded-full ${
                                res.status === 'OPEN' ? 'bg-emerald-400' : 
                                res.status === 'PENDING' ? 'bg-amber-400' : 
                                res.status === 'CLOSED' ? 'bg-zinc-500' : 'bg-blue-400'
                              }`} /> {res.status === 'OPEN' ? 'Confirmed' : res.status === 'PENDING' ? 'Pending' : res.status === 'CLOSED' ? 'Closed' : res.status}
                            </div>
                          </td>
                          <td className="p-8 text-right">
                            <div className="flex justify-end gap-2">
                               <Button 
                                  size="icon" 
                                  variant="ghost" 
                                  className="w-10 h-10 rounded-xl hover:bg-white/5 text-white/40 hover:text-white"
                                  onClick={async () => {
                                    try {
                                      await fetchWithAuth(`/tickets/${res.id}/status`, { 
                                        method: "PATCH", 
                                        headers: { "Content-Type": "application/json" }, 
                                        body: JSON.stringify({ status: res.status === 'CLOSED' ? 'OPEN' : 'CLOSED' }) 
                                      });
                                      await loadAdminData();
                                    } catch (e) {
                                      console.error("Failed to toggle status:", e);
                                    }
                                  }}
                                >
                                   <Calendar className="w-4 h-4" />
                                </Button>
                                <Button 
                                  size="icon" 
                                  variant="ghost" 
                                  className="w-10 h-10 rounded-xl hover:bg-destructive/10 text-white/40 hover:text-destructive"
                                  onClick={async () => {
                                    if (!confirm("Delete this reservation?")) return;
                                    try {
                                      await fetchWithAuth(`/tickets/${res.id}`, { method: "DELETE" });
                                      await loadAdminData();
                                    } catch (e) {
                                      console.error("Failed to delete:", e);
                                    }
                                  }}
                                >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                              </div>
                          </td>
                        </tr>
                      ))}
                      {reservations.length === 0 && (
                        <tr>
                          <td colSpan={6} className="p-12 text-center text-white/30 text-[10px] font-black uppercase tracking-widest">
                            No reservations found
                          </td>
                        </tr>
                      )}
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
                        <div className="flex gap-3">
                          <Input 
                            placeholder="Search fleet..." 
                            className="w-64 h-14 rounded-2xl bg-white/5 border-white/10 text-[10px] font-black uppercase tracking-widest focus:ring-primary"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {vehicles.filter(v => 
                          v.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          v.plate?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          v.tenantName?.toLowerCase().includes(searchQuery.toLowerCase())
                        ).map((veh) => (
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
                                    {veh.plate || "N/A"}
                                  </Badge>
                               </div>
                            </div>
                            <div className="p-10 space-y-6">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter leading-none">{veh.name || "Unknown"}</h3>
                                   <div className="text-[10px] font-black text-white/40 uppercase tracking-widest mt-2 flex items-center gap-2">
                                      <div className="w-1.5 h-1.5 rounded-full bg-primary" /> {veh.tenantName || "No Tenant"}
                                   </div>
                                </div>
                                <Button size="icon" variant="ghost" className="w-12 h-12 rounded-2xl hover:bg-white/5 border border-white/5"
                                  onClick={async () => {
                                    if (!confirm("Delete this vehicle?")) return;
                                    try {
                                      await fetchWithAuth(`/vehicles/${veh.id}`, { method: "DELETE" });
                                      await loadAdminData();
                                    } catch (e) {
                                      console.error("Failed to delete vehicle:", e);
                                    }
                                  }}
                                >
                                  <Trash2 className="w-5 h-5 text-white/40" />
                                </Button>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                 <div className="bg-white/5 p-5 rounded-2xl border border-white/5">
                                    <p className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em] mb-1">Health</p>
                                    <p className={`text-[10px] font-black uppercase italic ${
                                      (veh.health || 100) > 70 ? 'text-emerald-400' : (veh.health || 100) > 40 ? 'text-primary' : 'text-destructive'
                                    }`}>{veh.health || 100}%</p>
                                 </div>
                                 <div className="bg-white/5 p-5 rounded-2xl border border-white/5">
                                    <p className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em] mb-1">Last Service</p>
                                    <p className="text-[10px] font-black text-white uppercase italic truncate">{veh.lastService || "N/A"}</p>
                                 </div>
                              </div>
                            </div>
                          </Card>
                        ))}
                        {vehicles.length === 0 && (
                          <div className="col-span-full p-12 text-center text-white/30 text-[10px] font-black uppercase tracking-widest">
                            No vehicles in fleet
                          </div>
                        )}
                      </div>
            </motion.div>
          )}

          {activeTab === "users" && (
            <motion.div
              key="users"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-10"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                  <h2 className="text-4xl font-black uppercase italic tracking-tighter text-white">User <span className="text-primary italic">Management</span></h2>
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mt-1">Managing {users.length} registered users</p>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                  <Input 
                    placeholder="Search users..." 
                    className="w-64 h-14 rounded-2xl bg-white/5 border-white/10 text-[10px] font-black uppercase tracking-widest focus:ring-primary"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <Card className="rounded-[3rem] border-white/10 bg-white/[0.03] overflow-hidden border-none shadow-2xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead>
                      <tr className="bg-white/5 border-b border-white/5">
                        <th className="p-8 text-[10px] font-black uppercase tracking-[0.3em] text-white/40">User Details</th>
                        <th className="p-8 text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Role</th>
                        <th className="p-8 text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Tenant</th>
                        <th className="p-8 text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Joined</th>
                        <th className="p-8 text-[10px] font-black uppercase tracking-[0.3em] text-white/40 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {users.filter(u => 
                        u.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        u.role?.toLowerCase().includes(searchQuery.toLowerCase())
                      ).map((u) => (
                        <tr key={u.id} className="hover:bg-white/[0.02] transition-colors group">
                          <td className="p-8">
                            <div className="font-black italic uppercase tracking-tight text-lg text-white leading-none mb-1">{u.name || "Anonymous"}</div>
                            <div className="text-[10px] font-black text-white/40 uppercase tracking-widest">{u.email}</div>
                          </td>
                          <td className="p-8">
                            <Badge className={`px-3 py-1 font-black uppercase text-[10px] tracking-widest ${
                              u.role === 'ADMIN' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                              u.role === 'SUPER_ADMIN' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                              u.role === 'MECHANIC' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                              'bg-primary/10 text-primary border border-primary/20'
                            }`}>
                              {u.role}
                            </Badge>
                          </td>
                          <td className="p-8 text-[10px] font-black text-white/60 uppercase tracking-widest">{u.tenant?.name || "No Tenant"}</td>
                          <td className="p-8 text-[10px] font-black text-white/60 uppercase tracking-widest">
                            {u.createdAt ? new Date(u.createdAt).toLocaleDateString('fr-FR') : "N/A"}
                          </td>
                          <td className="p-8 text-right">
                            <div className="flex justify-end gap-2">
                               <Button 
                                  size="icon" 
                                  variant="ghost" 
                                  className="w-10 h-10 rounded-xl hover:bg-primary/10 text-white/40 hover:text-primary"
                                  onClick={async () => {
                                    const newRole = u.role === 'ADMIN' || u.role === 'SUPER_ADMIN' ? 'USER' : 'ADMIN';
                                    if (!confirm(`Change ${u.name}'s role from ${u.role} to ${newRole}?`)) return;
                                    try {
                                      await fetchWithAuth(`/admin/users/${u.id}/role`, { 
                                        method: "PATCH", 
                                        headers: { "Content-Type": "application/json" }, 
                                        body: JSON.stringify({ role: newRole }) 
                                      });
                                      await loadAdminData();
                                    } catch (e) {
                                      console.error("Failed to update role:", e);
                                    }
                                  }}
                                >
                                   <ShieldCheck className="w-4 h-4" />
                                </Button>
                                <Button 
                                  size="icon" 
                                  variant="ghost" 
                                  className="w-10 h-10 rounded-xl hover:bg-destructive/10 text-white/40 hover:text-destructive"
                                  onClick={async () => {
                                    if (!confirm(`Delete user ${u.name}?`)) return;
                                    try {
                                      await fetchWithAuth(`/dashboard/admin/users/${u.id}`, { method: "DELETE" });
                                      await loadAdminData();
                                    } catch (e) {
                                      console.error("Failed to delete user:", e);
                                    }
                                  }}
                                >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                              </div>
                          </td>
                        </tr>
                      ))}
                      {users.length === 0 && (
                        <tr>
                          <td colSpan={5} className="p-12 text-center text-white/30 text-[10px] font-black uppercase tracking-widest">
                            No users found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
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
                     <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse block" /> Live Infrastructure Feed - Core v4.0
                   </p>
                 </div>
                 <div className="flex gap-4">
                    <Button 
                      variant="outline" 
                      className="h-14 rounded-2xl border-white/10 bg-orange-500/10 text-orange-400 font-black uppercase text-[10px] tracking-widest px-8"
                      onClick={() => window.open(GRAFANA_URL, '_blank')}
                    >
                      Open Grafana &nearrow;
                    </Button>
                    <Button 
                      className="h-14 rounded-2xl bg-primary text-black font-black uppercase text-[10px] tracking-widest px-8 shadow-xl shadow-primary/20"
                      onClick={loadMonitoringData}
                    >
                      <RefreshCcw className={`w-4 h-4 mr-2 ${isMonitoringLoading ? "animate-spin" : ""}`} /> Sync Metrics
                    </Button>
                 </div>
              </div>

              {isMonitoringLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-white/40 text-[10px] font-black uppercase tracking-widest animate-pulse">Loading metrics...</div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <Card className="lg:col-span-2 rounded-[3rem] border-white/10 bg-[#080808] overflow-hidden p-12 relative group border-none shadow-2xl">
                      <div className="flex justify-between items-center mb-12">
                        <h3 className="font-black uppercase tracking-widest text-[11px] text-white/40">Request Latency (ms) - Global Prometheus Feed</h3>
                        <div className="flex items-center gap-6 text-[9px] font-black tracking-widest uppercase">
                           <span className="flex items-center gap-2"><span className="w-2 h-2 bg-primary rounded-full inline-block" /> API Gateway</span>
                           <span className="flex items-center gap-2"><span className="w-2 h-2 bg-blue-400 rounded-full inline-block" /> Auth Engine</span>
                        </div>
                      </div>
                       <div className="h-64 w-full flex items-end gap-2 mb-10">
                         {Array.from({ length: 45 }, (_, i) => {
                           const value = latencyHistory[i] || 0;
                           const maxLatency = Math.max(...latencyHistory, 1);
                           const height = latencyHistory.length > 0 ? (value / maxLatency) * 100 : 20;
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
                           { label: "AVG RESPONSE", value: `${((monitoringData?.avgResponseTime as number) || 0).toFixed(1)}ms`, color: "text-red-400" },
                           { label: "TOTAL REQUESTS", value: (monitoringData?.totalRequests as number)?.toLocaleString() || "0", color: "text-primary" },
                           { label: "ERROR RATE", value: `${((monitoringData?.errorRate as number) || 0).toFixed(2)}%`, color: (monitoringData?.errorRate as number || 0) > 5 ? "text-red-400" : "text-emerald-400" },
                           { label: "UPTIME", value: `${(((monitoringData?.uptime as number) || 0) / 3600).toFixed(1)}h`, color: "text-emerald-400" },
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
                              animate={{ strokeDashoffset: 283 - (283 * (Math.min(((monitoringData?.memoryUsage as number) || 0) / (512 * 1024 * 1024), 1))) }}
                              transition={{ duration: 2.5, ease: "circOut" }}
                              strokeLinecap="round"
                            />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                             <span className="text-6xl font-black italic text-white">{Math.round(((monitoringData?.memoryUsage as number) || 0) / (1024 * 1024))}<span className="text-2xl text-primary">MB</span></span>
                             <span className="text-[9px] font-black text-white/30 uppercase tracking-widest mt-1">Heap Used</span>
                          </div>
                       </div>
                       <div className="space-y-5 pt-4">
                          {[
                            { label: "CPU Usage", val: `${((monitoringData?.cpuUsage as number) || 0).toFixed(1)}s`, color: "bg-primary" },
                            { label: "Node Version", val: (monitoringData?.nodeVersion as string) || "N/A", color: "bg-blue-400" },
                            { label: "Error Rate", val: `${((monitoringData?.errorRate as number) || 0).toFixed(2)}%`, color: (monitoringData?.errorRate as number || 0) > 5 ? "bg-red-400" : "bg-emerald-400" },
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

                  <Card className="rounded-[3rem] border-white/10 bg-[#080808] p-12 border-none shadow-2xl">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                      <div>
                        <h3 className="font-black uppercase tracking-widest text-[11px] text-white/40">Application Logs</h3>
                        <p className="text-[9px] font-black uppercase tracking-widest text-white/20 mt-1">Real-time stream via Winston</p>
                      </div>
                      <div className="flex items-center gap-3">
                        {["all", "error", "warn", "info"].map((filter) => (
                          <button
                            key={filter}
                            onClick={() => setLogFilter(filter)}
                            className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                              logFilter === filter
                                ? filter === "error" ? "bg-red-500/20 text-red-400 border border-red-500/30"
                                  : filter === "warn" ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                                  : filter === "info" ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                                  : "bg-primary/20 text-primary border border-primary/30"
                                : "bg-white/5 text-white/30 border border-white/10 hover:text-white/50"
                            }`}
                          >
                            {filter}
                          </button>
                        ))}
                        <div className="flex items-center gap-2 ml-2 text-[9px] font-black tracking-widest uppercase text-emerald-400">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse inline-block" /> Live
                        </div>
                      </div>
                    </div>
                    <div ref={logsContainerRef} className="bg-black/50 rounded-2xl p-6 font-mono text-xs max-h-72 overflow-y-auto space-y-1">
                      {isMonitoringLoading ? (
                        <div className="space-y-3">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="animate-pulse flex gap-3">
                              <span className="w-20 h-3 bg-white/5 rounded" />
                              <span className="flex-1 h-3 bg-white/5 rounded" />
                            </div>
                          ))}
                        </div>
                      ) : logs.length > 0 ? (
                        logs
                          .filter((log) => {
                            if (logFilter === "all") return true;
                            return log.toLowerCase().includes(`[${logFilter}]`);
                          })
                          .map((log, i) => {
                            const isError = log.toLowerCase().includes("[error]");
                            const isWarn = log.toLowerCase().includes("[warn]");
                            return (
                              <div key={i} className={`flex gap-4 py-2 px-3 rounded-lg transition-colors hover:bg-white/[0.02] ${
                                isError ? "text-red-400/80" : isWarn ? "text-amber-400/80" : "text-white/50"
                              }`}>
                                <span className="text-white/20 shrink-0 select-none">{String(i + 1).padStart(3, "0")}</span>
                                <span className="break-all">{log}</span>
                              </div>
                            );
                          })
                      ) : (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                          <Server className="w-12 h-12 text-white/10 mb-4" />
                          <p className="text-white/30 text-[10px] font-black uppercase tracking-widest mb-2">No Logs Yet</p>
                          <p className="text-white/15 text-[9px] font-black uppercase tracking-widest max-w-xs">
                            Logs will appear here as your backend processes requests. Make sure the server is running.
                          </p>
                        </div>
                      )}
                    </div>
                    {logs.length > 0 && (
                      <div className="flex justify-between items-center mt-4 text-[9px] font-black uppercase tracking-widest text-white/20">
                        <span>{logs.length} entries</span>
                        <button
                          onClick={() => { setLogs([]); loadMonitoringData(); }}
                          className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                        >
                          Refresh
                        </button>
                      </div>
                    )}
                  </Card>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {["Prometheus", "Grafana", "Loki", "Backend"].map((service, i) => (
                      <Card key={i} className="rounded-3xl border-white/10 bg-white/5 p-8 hover:border-primary/40 transition-all cursor-pointer group">
                        <div className="flex justify-between items-center mb-6">
                          <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">{service}</span>
                          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.4)]" />
                        </div>
                        <div className="flex items-end justify-between">
                           <span className="text-3xl font-black italic text-white tracking-tighter">{["9090", "3100", "3101", "3001"][i]}</span>
                           <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Active</span>
                        </div>
                      </Card>
                    ))}
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

      </main>
    </div>
  );
}

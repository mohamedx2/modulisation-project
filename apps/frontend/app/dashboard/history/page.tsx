"use client";

import { useEffect, useState } from "react";
import { History, Search, Filter, Download, ChevronRight, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { fetchWithAuth } from "@/lib/api";
import { useAuth } from "../../providers";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";

interface Ticket {
  id: string;
  title: string;
  status: string;
  createdAt: string;
  createdBy: string;
}

interface Payment {
  id: string;
  amount: number;
  status: string;
  createdAt: string;
}

export default function HistoryPage() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [activeTab, setActiveTab] = useState("interventions");

  useEffect(() => {
    async function fetchData() {
      if (!user) return;
      try {
        const [tRes, pRes] = await Promise.all([
          fetchWithAuth("/tickets"),
          fetchWithAuth("/payments")
        ]);
        setTickets(tRes.data || tRes || []);
        setPayments(pRes.data || pRes || []);
      } catch (err) {
        console.error("Failed to fetch history:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [user]);

  const filteredTickets = tickets.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPayments = payments.filter(p => 
    p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.amount.toString().includes(searchQuery)
  );

  const handleExport = async () => {
    try {
      const endpoint = activeTab === "interventions" ? "/tickets/export/csv" : "/payments/export/csv";
      const filename = activeTab === "interventions" ? "interventions.csv" : "paiements.csv";
      
      const csvData = await fetchWithAuth(endpoint, {
        headers: { "Accept": "text/csv" }
      });
      
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export failed:", err);
    }
  };

  const getTicketStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case "CLOSED":
        return <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 px-3 py-1 rounded-full font-bold">Terminé</Badge>;
      default:
        return <Badge variant="outline" className="px-3 py-1 rounded-full">{status}</Badge>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight italic uppercase">Historique d&apos;activité</h1>
          <p className="text-muted-foreground font-medium">Consultez l&apos;intégralité des interventions et transactions passées.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleExport} variant="outline" className="rounded-xl font-bold gap-2">
            <Download className="w-4 h-4" /> Exporter
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4 bg-muted/20 p-4 rounded-2xl border border-border/50">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder={activeTab === "interventions" ? "Rechercher une intervention..." : "Rechercher un paiement..."}
            value={searchQuery || ""}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 border-none bg-transparent focus-visible:ring-0 shadow-none" 
          />
        </div>
        <Button variant="ghost" size="icon" className="rounded-xl">
          <Filter className="w-4 h-4" />
        </Button>
      </div>

      <Tabs defaultValue="interventions" onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-muted/50 p-1 rounded-2xl h-14 w-full md:w-auto">
          <TabsTrigger value="interventions" className="rounded-xl h-12 px-8 font-black uppercase text-xs tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all">
            Interventions
          </TabsTrigger>
          <TabsTrigger value="paiements" className="rounded-xl h-12 px-8 font-black uppercase text-xs tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all">
            Paiements
          </TabsTrigger>
        </TabsList>

        <TabsContent value="interventions" className="space-y-4">
          <div className="grid gap-4">
            {filteredTickets.map((ticket, idx) => (
              <motion.div
                key={ticket.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className="rounded-2xl border-none shadow-sm hover:shadow-md transition-all">
                  <CardContent className="p-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl ${ticket.status === 'CLOSED' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-muted text-muted-foreground'}`}>
                        {ticket.status === 'CLOSED' ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                      </div>
                      <div>
                        <h4 className="font-bold text-lg uppercase tracking-tight italic">{ticket.title}</h4>
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">ID: {ticket.id.slice(0, 8)} • {new Date(ticket.createdAt).toLocaleDateString('fr-FR')}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {getTicketStatusBadge(ticket.status)}
                      <Button variant="ghost" size="icon" className="rounded-full">
                        <ChevronRight className="w-5 h-5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="paiements" className="space-y-4">
           {/* Similarly for payments */}
           <div className="grid gap-4">
            {filteredPayments.map((payment, idx) => (
              <motion.div
                key={payment.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className="rounded-2xl border-none shadow-sm hover:shadow-md transition-all">
                  <CardContent className="p-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-primary/10 text-primary">
                        <History className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-lg uppercase tracking-tight italic">Transaction #{payment.id.slice(0, 8)}</h4>
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{new Date(payment.createdAt).toLocaleDateString('fr-FR')} • {new Date(payment.createdAt).toLocaleTimeString('fr-FR')}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <span className="text-xl font-black italic">{payment.amount.toLocaleString('fr-FR')} €</span>
                      <Badge variant={payment.status === 'PAID' ? 'default' : 'secondary'} className="rounded-full px-3 font-bold uppercase text-[10px]">
                        {payment.status === 'PAID' ? 'Payé' : 'En attente'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

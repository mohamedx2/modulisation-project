"use client";

import { useEffect, useState } from "react";
import { History, Search, Filter, Download, ChevronRight, CheckCircle2, Clock, AlertCircle, FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { fetchWithAuth } from "@/lib/api";
import { useAuth } from "../../providers";
import { jsPDF } from "jspdf";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

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

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const isInterventions = activeTab === "interventions";
    const data = isInterventions ? filteredTickets : filteredPayments;
    const title = isInterventions ? "Historique des Interventions" : "Historique des Paiements";

    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(0, 0, 0);
    doc.text("RENAULT AXIS", 20, 22);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(120, 120, 120);
    doc.text("Rapport généré le " + new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }), 20, 30);

    doc.setLineWidth(0.5);
    doc.setDrawColor(0);
    doc.line(20, 34, 190, 34);

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text(title, 20, 46);

    if (isInterventions) {
      const tickets = data as Ticket[];
      let y = 58;
      
      doc.setFillColor(245, 245, 245);
      doc.rect(20, y - 6, 170, 10, 'F');
      doc.setFontSize(8);
      doc.text("TITRE", 24, y);
      doc.text("STATUT", 110, y);
      doc.text("DATE", 145, y);
      doc.text("ID", 170, y);
      y += 8;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      
      tickets.forEach((ticket, i) => {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
        
        if (i % 2 === 0) {
          doc.setFillColor(250, 250, 250);
          doc.rect(20, y - 5, 170, 9, 'F');
        }

        const statusLabel = ticket.status === "CLOSED" ? "Terminé" : ticket.status;
        doc.text(ticket.title.substring(0, 40), 24, y);
        doc.text(statusLabel, 110, y);
        doc.text(new Date(ticket.createdAt).toLocaleDateString('fr-FR'), 145, y);
        doc.text(ticket.id.slice(0, 8), 170, y);
        y += 9;
      });

      doc.setLineWidth(0.3);
      doc.setDrawColor(180, 180, 180);
      doc.line(20, y + 4, 190, y + 4);
      
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.text(`Total: ${tickets.length} intervention(s)`, 20, y + 12);
    } else {
      const payments = data as Payment[];
      let y = 58;

      doc.setFillColor(245, 245, 245);
      doc.rect(20, y - 6, 170, 10, 'F');
      doc.setFontSize(8);
      doc.text("TRANSACTION", 24, y);
      doc.text("MONTANT", 110, y);
      doc.text("STATUT", 145, y);
      doc.text("DATE", 170, y);
      y += 8;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);

      let totalAmount = 0;
      payments.forEach((payment, i) => {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }

        if (i % 2 === 0) {
          doc.setFillColor(250, 250, 250);
          doc.rect(20, y - 5, 170, 9, 'F');
        }

        const statusLabel = payment.status === "PAID" ? "Payé" : "En attente";
        doc.text("#" + payment.id.slice(0, 8), 24, y);
        doc.text(payment.amount.toLocaleString('fr-FR') + " €", 110, y);
        doc.text(statusLabel, 145, y);
        doc.text(new Date(payment.createdAt).toLocaleDateString('fr-FR'), 170, y);
        totalAmount += payment.amount;
        y += 9;
      });

      doc.setLineWidth(0.3);
      doc.setDrawColor(180, 180, 180);
      doc.line(20, y + 4, 190, y + 4);

      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.text(`Total: ${payments.length} transaction(s) — Montant total: ${totalAmount.toLocaleString('fr-FR')} €`, 20, y + 12);
    }

    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.text("© 2026 Renault Axis Digital Service", 20, 285);

    const filename = isInterventions ? "interventions.pdf" : "paiements.pdf";
    doc.save(filename);
    toast.success("Export PDF téléchargé");
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
    <div className="max-w-[1400px] mx-auto space-y-6 sm:space-y-8 lg:space-y-12 pb-6 sm:pb-8 lg:pb-12 px-4 sm:px-6 lg:px-8 xl:px-12 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-[200px] sm:w-[300px] lg:w-[400px] h-[200px] sm:h-[300px] lg:h-[400px] bg-primary/5 rounded-full blur-[60px] sm:blur-[80px] lg:blur-[100px] -mr-24 sm:-mr-36 lg:-mr-48 -mt-24 sm:-mt-36 lg:-mt-48 z-0 pointer-events-none" />
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6 lg:gap-8 relative z-10">
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight italic uppercase leading-none">Historique <span className="text-primary italic">Activité</span></h1>
          <p className="text-muted-foreground font-bold text-sm sm:text-lg">Consultez l&apos;intégralité de vos interventions et transactions.</p>
        </div>
        <div className="flex items-center gap-4">
          <Button onClick={handleExportPDF} variant="outline" className="h-12 rounded-2xl font-black uppercase italic tracking-tight gap-2 border-primary/20 text-primary hover:bg-primary/10 transition-all active:scale-95">
            <FileText className="w-5 h-5" /> Export PDF
          </Button>
          <Button onClick={handleExport} variant="outline" className="h-12 rounded-2xl font-black uppercase italic tracking-tight gap-2 border-zinc-200 hover:bg-zinc-50 transition-all active:scale-95">
            <Download className="w-5 h-5" /> CSV
          </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start relative z-10">
        <div className="flex-1 w-full space-y-8">
          <div className="flex flex-col md:flex-row items-center gap-6 bg-white dark:bg-zinc-900 p-6 rounded-[2rem] border border-zinc-100 dark:border-zinc-800 shadow-sm">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input 
                placeholder={activeTab === "interventions" ? "Rechercher une intervention (ID, Titre...)" : "Rechercher un paiement (ID, Statut...)"}
                value={searchQuery || ""}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-12 pl-12 border-none bg-muted/30 rounded-xl font-bold placeholder:text-muted-foreground focus-visible:ring-primary shadow-inner" 
              />
            </div>
            <Tabs defaultValue="interventions" onValueChange={setActiveTab} className="w-full md:w-auto">
              <TabsList className="bg-muted/50 p-1.5 rounded-[1.25rem] h-14">
                <TabsTrigger value="interventions" className="rounded-xl h-11 px-8 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-primary data-[state=active]:text-black data-[state=active]:shadow-lg transition-all duration-300">
                  Interventions
                </TabsTrigger>
                <TabsTrigger value="paiements" className="rounded-xl h-11 px-8 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-primary data-[state=active]:text-black data-[state=active]:shadow-lg transition-all duration-300">
                  Paiements
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <AnimatePresence mode="wait">
            <Tabs value={activeTab} className="w-full">
              <TabsContent value="interventions" className="m-0 focus-visible:ring-0">
                <div className="grid gap-4">
                  {filteredTickets.length > 0 ? filteredTickets.map((ticket, idx) => (
                    <motion.div
                      key={ticket.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <Card className="group rounded-[1.5rem] border-none shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden bg-white dark:bg-zinc-900">
                        <CardContent className="p-0">
                          <div className="flex items-center">
                            <div className={`w-2 h-20 ${ticket.status === 'CLOSED' ? 'bg-emerald-500' : 'bg-primary'}`} />
                            <div className="flex-1 p-6 flex items-center justify-between">
                              <div className="flex items-center gap-6">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-500 ${ticket.status === 'CLOSED' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-primary/10 text-primary'}`}>
                                  {ticket.status === 'CLOSED' ? <CheckCircle2 className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
                                </div>
                                <div>
                                  <h4 className="font-black text-xl uppercase italic tracking-tighter group-hover:text-primary transition-colors leading-none">{ticket.title}</h4>
                                  <div className="flex items-center gap-3 mt-2">
                                    <span className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em]">ID: #{ticket.id.slice(0, 8)}</span>
                                    <div className="w-1 h-1 rounded-full bg-zinc-300" />
                                    <span className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em]">{new Date(ticket.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-6">
                                {getTicketStatusBadge(ticket.status)}
                                <Button variant="ghost" size="icon" className="rounded-xl hover:bg-primary/10 hover:text-primary transition-all">
                                  <ChevronRight className="w-6 h-6" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )) : (
                    <div className="h-64 flex flex-col items-center justify-center bg-muted/20 rounded-[2rem] border-2 border-dashed border-muted-foreground/20">
                      <History className="w-12 h-12 text-muted-foreground/30 mb-4" />
                      <p className="font-black uppercase italic text-muted-foreground">Aucune intervention trouvée</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="paiements" className="m-0 focus-visible:ring-0">
                 <div className="grid gap-4">
                  {filteredPayments.length > 0 ? filteredPayments.map((payment, idx) => (
                    <motion.div
                      key={payment.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <Card className="group rounded-[1.5rem] border-none shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden bg-white dark:bg-zinc-900">
                        <CardContent className="p-0">
                          <div className="flex items-center">
                            <div className={`w-2 h-20 ${payment.status === 'PAID' ? 'bg-emerald-500' : 'bg-primary'}`} />
                            <div className="flex-1 p-6 flex items-center justify-between">
                              <div className="flex items-center gap-6">
                                <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center transition-transform group-hover:scale-110 duration-500">
                                  <FileText className="w-6 h-6 text-zinc-400" />
                                </div>
                                <div>
                                  <h4 className="font-black text-xl uppercase italic tracking-tighter group-hover:text-primary transition-colors leading-none">Transaction #{payment.id.slice(0, 8)}</h4>
                                  <div className="flex items-center gap-3 mt-2">
                                    <span className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em]">{new Date(payment.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}</span>
                                    <div className="w-1 h-1 rounded-full bg-zinc-300" />
                                    <span className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em]">{new Date(payment.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-8">
                                <div className="text-right">
                                  <p className="text-2xl font-black italic tracking-tighter leading-none">{payment.amount.toLocaleString('fr-FR')} €</p>
                                  <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mt-1">TVA INCLUSE</p>
                                </div>
                                <Badge className={`rounded-lg px-4 py-1.5 font-black uppercase text-[9px] border-none shadow-sm ${
                                  payment.status === 'PAID' ? 'bg-emerald-500 text-white' : 'bg-primary text-black'
                                }`}>
                                  {payment.status === 'PAID' ? 'PAYÉ' : 'EN ATTENTE'}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )) : (
                    <div className="h-64 flex flex-col items-center justify-center bg-muted/20 rounded-[2rem] border-2 border-dashed border-muted-foreground/20">
                      <AlertCircle className="w-12 h-12 text-muted-foreground/30 mb-4" />
                      <p className="font-black uppercase italic text-muted-foreground">Aucun paiement trouvé</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </AnimatePresence>
        </div>

        {/* Info Sidebar */}
        <div className="w-full lg:w-[350px] space-y-6">
           <Card className="bg-zinc-950 text-white rounded-[2rem] p-8 space-y-6 border-none shadow-2xl overflow-hidden relative">
              <div className="relative z-10">
                <Badge className="bg-primary text-black font-black uppercase text-[10px] mb-4 border-none">Renault Axis Care</Badge>
                <h3 className="text-2xl font-black uppercase italic tracking-tighter">Support Technique</h3>
                <p className="text-white/40 text-xs font-bold leading-relaxed mt-4 uppercase tracking-widest">Besoin d'un justificatif officiel ou d'un détail sur une intervention ?</p>
                <Button className="w-full bg-white text-black font-black rounded-xl h-12 mt-8 uppercase text-[10px] tracking-widest hover:bg-zinc-200 active:scale-95 transition-all">
                  Contacter l'atelier
                </Button>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[60px] -mr-16 -mt-16 rounded-full" />
           </Card>

           <Card className="rounded-[2rem] p-8 border-none shadow-sm bg-white dark:bg-zinc-900 space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Statistiques</h4>
              <div className="space-y-4">
                 <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-muted-foreground uppercase italic tracking-tight">Interventions</span>
                    <span className="text-xl font-black italic">{tickets.length}</span>
                 </div>
                 <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary w-full" />
                 </div>
                 <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-muted-foreground uppercase italic tracking-tight">Total Facturé</span>
                    <span className="text-xl font-black italic text-primary">{payments.reduce((acc, p) => acc + p.amount, 0).toLocaleString('fr-FR')} €</span>
                 </div>
              </div>
           </Card>
        </div>
      </div>
    </div>
  );
}

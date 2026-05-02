"use client";

import { useState, useEffect, useMemo } from "react";
import { Plus, Search, Filter, History, CheckCircle2, DollarSign, Download, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "../../providers";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { fetchWithAuth } from "@/lib/api";

interface Payment {
  id?: string;
  amount: string | number;
  status: 'PAID' | 'PENDING' | 'OVERDUE' | string;
  createdAt?: string;
  user?: {
    name?: string;
  };
}

export default function PaymentsPage() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPayments() {
      if (!user) {
         setLoading(false);
         return;
      }
      try {
        const json = await fetchWithAuth("/payments");
        setPayments(json.data !== undefined ? json.data : json || []);
      } catch (err) {
        console.error('Failed to fetch payments:', err);
      } finally {
        setLoading(false);
      }
    }
    
    if (user) {
      fetchPayments();
    }
  }, [user]);

  const stats = useMemo(() => {
    let CA = 0;
    let pending = 0;
    let validCount = 0;

    payments.forEach((p) => {
      const amount = typeof p.amount === 'number' ? p.amount : parseFloat(p.amount) || 0;
      if (p.status === 'PAID') {
        CA += amount;
        validCount++;
      } else if (p.status === 'PENDING') {
        pending += amount;
      }
    });

    return [
      { label: "Chiffre d'Affaires (Total)", value: `${CA.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €`, icon: DollarSign, color: "text-emerald-600" },
      { label: "En attente d'encaissement", value: `${pending.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €`, icon: History, color: "text-amber-600" },
      { label: "Factures validées", value: validCount.toString(), icon: CheckCircle2, color: "text-blue-600" },
    ];
  }, [payments]);

  const getBadgeVariant = (status: string) => {
    switch (status) {
      case "PAID": return "default";
      case "PENDING": return "secondary";
      case "OVERDUE": return "destructive";
      default: return "outline";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "PAID": return "Payé";
      case "PENDING": return "En attente";
      case "OVERDUE": return "En retard";
      default: return status;
    }
  };

  const handleExport = async () => {
    try {
      toast.info("Exportation en cours...");
      const csvData = await fetchWithAuth("/payments/export/csv", {
        headers: { "Accept": "text/csv" }
      });
      
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'factures.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast.success("Factures exportées avec succès !");
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de l'exportation des factures.");
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto py-12 px-8 lg:p-12 pb-24 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -mr-64 -mt-64 z-0 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-primary/5 rounded-full blur-[100px] -ml-32 -mb-32 z-0 pointer-events-none" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16 relative z-10">
        <div className="space-y-2">
          <h1 className="text-5xl lg:text-6xl font-black tracking-tighter uppercase italic leading-none">Finances <span className="text-primary italic">& Factures</span></h1>
          <p className="text-muted-foreground font-bold text-lg max-w-2xl">Gérez la facturation de vos interventions et le suivi de vos encaissements en temps réel.</p>
        </div>
        <div className="flex items-center gap-4">
          <Button onClick={handleExport} variant="outline" className="h-14 px-8 rounded-2xl font-black uppercase italic tracking-tight gap-3 border-zinc-200 hover:bg-zinc-50 transition-all active:scale-95 shadow-sm">
            <Download className="w-5 h-5" /> Exporter
          </Button>
          <Button className="h-14 px-8 rounded-2xl font-black uppercase italic tracking-tight gap-3 shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all active:scale-95">
            <Plus className="w-5 h-5" /> Nouvelle Facture
          </Button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-3 mb-16 relative z-10">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="rounded-[2.5rem] shadow-sm border-none bg-white dark:bg-zinc-900 p-8 hover:shadow-xl transition-all duration-500 group overflow-hidden relative">
              <div className="flex items-center justify-between mb-8 relative z-10">
                <div className={`rounded-2xl p-4 bg-muted/50 ${stat.color} group-hover:scale-110 transition-transform duration-500`}>
                  <stat.icon className="h-8 w-8" />
                </div>
                <Badge variant="outline" className="border-zinc-100 dark:border-zinc-800 text-[9px] font-black uppercase tracking-widest opacity-50">Mise à jour: Live</Badge>
              </div>
              <div className="space-y-1 relative z-10">
                <p className="text-sm font-black text-muted-foreground uppercase tracking-widest">{stat.label}</p>
                <div className="text-4xl font-black italic tracking-tighter text-foreground">{stat.value}</div>
              </div>
              {/* Decorative background element */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[50px] -mr-16 -mt-16 rounded-full" />
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main List */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="relative z-10"
      >
        <Card className="rounded-[3rem] shadow-sm overflow-hidden border-none bg-white dark:bg-zinc-900">
          <div className="flex flex-col md:flex-row items-center justify-between p-8 gap-6 bg-muted/20 border-b border-zinc-100 dark:border-zinc-800">
            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input 
                type="search" 
                placeholder="Rechercher une facture (N°, Client...)" 
                className="h-12 pl-12 bg-background border-none rounded-xl font-bold shadow-inner focus-visible:ring-primary"
              />
            </div>
            <div className="flex items-center gap-4 w-full md:w-auto">
              <Button variant="ghost" className="h-12 px-6 rounded-xl font-black uppercase italic tracking-tight gap-2 text-muted-foreground hover:bg-white dark:hover:bg-zinc-800">
                <Filter className="w-4 h-4" /> Filtres Avancés
              </Button>
            </div>
          </div>
          
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/10">
                <TableRow className="border-zinc-100 dark:border-zinc-800 hover:bg-transparent">
                  <TableHead className="h-16 px-8 font-black uppercase text-[10px] tracking-widest text-muted-foreground">N° Facture</TableHead>
                  <TableHead className="h-16 px-8 font-black uppercase text-[10px] tracking-widest text-muted-foreground">Client</TableHead>
                  <TableHead className="h-16 px-8 font-black uppercase text-[10px] tracking-widest text-muted-foreground">Montant</TableHead>
                  <TableHead className="h-16 px-8 font-black uppercase text-[10px] tracking-widest text-muted-foreground">Statut</TableHead>
                  <TableHead className="h-16 px-8 font-black uppercase text-[10px] tracking-widest text-muted-foreground">Émission</TableHead>
                  <TableHead className="h-16 px-8 font-black uppercase text-[10px] tracking-widest text-muted-foreground text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i} className="border-zinc-100 dark:border-zinc-800">
                      <TableCell className="px-8 py-6"><Skeleton className="h-6 w-24 rounded-lg" /></TableCell>
                      <TableCell className="px-8 py-6"><Skeleton className="h-6 w-40 rounded-lg" /></TableCell>
                      <TableCell className="px-8 py-6"><Skeleton className="h-6 w-20 rounded-lg" /></TableCell>
                      <TableCell className="px-8 py-6"><Skeleton className="h-8 w-24 rounded-xl" /></TableCell>
                      <TableCell className="px-8 py-6"><Skeleton className="h-6 w-28 rounded-lg" /></TableCell>
                      <TableCell className="px-8 py-6 text-right"><Skeleton className="h-10 w-24 ml-auto rounded-xl" /></TableCell>
                    </TableRow>
                  ))
                ) : payments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-64 text-center">
                       <div className="flex flex-col items-center justify-center space-y-4 opacity-30">
                          <DollarSign className="w-16 h-16" />
                          <p className="font-black uppercase italic tracking-widest text-sm">Aucun historique de paiement</p>
                       </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  payments.map((payment: Payment, idx: number) => (
                    <TableRow key={payment.id || idx} className="group border-zinc-100 dark:border-zinc-800 hover:bg-muted/30 transition-colors">
                      <TableCell className="px-8 py-6 font-black uppercase italic tracking-tighter text-lg">{payment.id || `INV-${idx + 1000}`}</TableCell>
                      <TableCell className="px-8 py-6">
                         <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center font-black text-[10px] uppercase">{payment.user?.name?.slice(0, 2) || "CI"}</div>
                            <span className="font-bold text-sm">{payment.user?.name || "Client Inconnu"}</span>
                         </div>
                      </TableCell>
                      <TableCell className="px-8 py-6">
                         <span className="font-black text-2xl italic tracking-tighter">{parseFloat(String(payment.amount || 0)).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</span>
                      </TableCell>
                      <TableCell className="px-8 py-6">
                        <Badge className={`rounded-xl px-4 py-1.5 font-black uppercase text-[10px] border-none shadow-sm ${
                          payment.status === 'PAID' ? 'bg-emerald-500 text-white' : 
                          payment.status === 'PENDING' ? 'bg-primary text-black' : 
                          'bg-destructive text-white'
                        }`}>
                          {getStatusLabel(payment.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-8 py-6 text-muted-foreground font-bold text-xs uppercase tracking-widest">
                        {payment.createdAt ? new Date(payment.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : "---"}
                      </TableCell>
                      <TableCell className="px-8 py-6 text-right">
                        <Button variant="ghost" className="h-12 px-6 rounded-xl font-black uppercase italic tracking-tight text-primary hover:bg-primary/10 hover:text-primary transition-all active:scale-95">
                          Détails &rarr;
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
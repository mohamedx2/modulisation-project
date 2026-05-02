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
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Facturation & Paiements</h1>
          <p className="mt-2 text-sm text-muted-foreground">Gérez la facturation des interventions et le suivi des encaissements.</p>
        </div>
        <div className="mt-4 sm:mt-0 flex gap-3">
          <Button onClick={handleExport} variant="outline" aria-label="Exporter les paiements" className="gap-2 shadow-sm rounded-xl">
            <Download className="h-4 w-4" />
            Exporter
          </Button>
          <Button aria-label="Nouvelle facture" className="gap-2 rounded-xl shadow-lg hover:bg-black transition-all">
            <Plus className="h-4 w-4" />
            Nouvelle Facture
          </Button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label} className="rounded-2xl shadow-sm border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-bold text-muted-foreground">
                {stat.label}
              </CardTitle>
              <div className={`rounded-lg p-2 bg-muted/50 ${stat.color}`}>
                <stat.icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main List */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="rounded-2xl shadow-sm overflow-hidden border-border/50">
          <div className="flex items-center justify-between p-4 border-b bg-muted/40">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                type="search" 
                placeholder="Rechercher une facture..." 
                className="pl-8 bg-background rounded-lg border-border/50"
              />
            </div>
            <Button variant="ghost" size="sm" aria-label="Filtres avancés" className="gap-2 text-muted-foreground">
              <Filter className="w-4 h-4" /> Plus de filtres
            </Button>
          </div>
          
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead className="font-bold">N° Facture</TableHead>
                  <TableHead className="font-bold">Client</TableHead>
                  <TableHead className="font-bold">Montant</TableHead>
                  <TableHead className="font-bold">Statut</TableHead>
                  <TableHead className="font-bold">Date d&apos;émission</TableHead>
                  <TableHead className="text-right font-bold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : payments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground font-medium">
                      Aucun paiement trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  payments.map((payment: Payment, idx: number) => (
                    <TableRow key={payment.id || idx} className="hover:bg-muted/50 transition-colors">
                      <TableCell className="font-bold">{payment.id || `INV-${idx + 1000}`}</TableCell>
                      <TableCell className="font-semibold text-sm">{payment.user?.name || "Client Inconnu"}</TableCell>
                      <TableCell className="font-black text-base">{parseFloat(String(payment.amount || 0)).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</TableCell>
                      <TableCell>
                        <Badge variant={getBadgeVariant(payment.status) as Parameters<typeof Badge>["0"]["variant"]}>
                          {getStatusLabel(payment.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground font-medium text-sm">
                        {payment.createdAt ? new Date(payment.createdAt).toLocaleDateString('fr-FR') : "N/A"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" className="text-primary font-bold hover:text-primary/90 hover:bg-primary/10">
                          Aperçu &rarr;
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
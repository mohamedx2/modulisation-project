const fs = require('fs');
const path = require('path');

const dashboardPagePath = path.join(__dirname, 'apps/frontend/app/dashboard/page.tsx');
const dashboardPageContent = `import { Users, Ticket, CreditCard, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const stats = [
  { name: 'Total Tickets', value: '12', icon: Ticket, change: '+2.5%', changeType: 'positive' },
  { name: 'Pending Payments', value: '$2,400', icon: CreditCard, change: '-4.1%', changeType: 'negative' },
  { name: 'Active Mechanics', value: '4', icon: Users, change: '+0%', changeType: 'neutral' },
  { name: 'System Health', value: '98.9%', icon: Activity, change: '+1.2%', changeType: 'positive' },
];

export default function DashboardOverview() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Overview</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            A high-level view of your Renault Axis operations.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => (
          <Card key={item.name} className="shadow-sm rounded-2xl border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-semibold text-muted-foreground">{item.name}</CardTitle>
              <div className="rounded-lg bg-primary/10 p-2 text-primary">
                <item.icon className="h-4 w-4" aria-hidden="true" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black">{item.value}</div>
              <p className={\`text-xs font-medium mt-1 \${
                item.changeType === 'positive' ? 'text-green-600' : item.changeType === 'negative' ? 'text-red-500' : 'text-muted-foreground'
              }\`}>
                {item.change} from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="shadow-sm rounded-2xl border-border/50">
        <CardHeader className="border-b bg-muted/40">
          <CardTitle className="text-base font-semibold">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="p-12 text-center text-sm text-muted-foreground font-medium">
          No recent activity to display. Connect your APIs to populate this feed.
        </CardContent>
      </Card>
    </div>
  );
}`;

const step1PagePath = path.join(__dirname, 'apps/frontend/app/dashboard/step1/page.tsx');
const step1Content = `"use client";
import { motion } from "framer-motion";
import { ShieldCheck, Phone, ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function Step1OTPPage() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const router = useRouter();

  return (
    <div className="p-8 lg:p-12 max-w-4xl mx-auto flex items-center justify-center min-h-[80vh]">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full relative"
      >
        <Card className="rounded-3xl border-border/50 shadow-xl overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-muted">
            <div className="h-full bg-primary w-1/2" />
          </div>
          
          <CardContent className="p-10 pt-14">
            <Button variant="link" asChild className="text-muted-foreground hover:text-foreground font-bold text-sm tracking-wide -ml-4 mb-8">
              <Link href="/dashboard">
                <ArrowLeft className="w-4 h-4 mr-2" /> Retour
              </Link>
            </Button>
            
            <div className="flex flex-col items-center text-center space-y-6 mb-12">
              <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                <ShieldCheck className="w-10 h-10" />
              </div>
              <div>
                <h1 className="text-3xl font-black tracking-tight">Vérification Sécurisée</h1>
                <p className="text-muted-foreground font-medium mt-3 max-w-md mx-auto">
                  Nous avons envoyé un code de vérification au <span className="font-bold text-foreground">+33 6 ** ** ** 42</span>.
                </p>
              </div>
            </div>

            <div className="flex justify-center gap-3 mb-10 w-full max-w-sm mx-auto">
              {otp.map((digit, i) => (
                <Input
                  key={i}
                  type="text"
                  maxLength={1}
                  className="flex-1 w-14 h-16 text-center text-2xl font-black bg-muted/50 rounded-xl focus-visible:ring-primary shadow-inner"
                />
              ))}
            </div>

            <div className="flex flex-col items-center space-y-6">
              <Button 
                onClick={() => router.push("/dashboard/step2")}
                size="lg"
                className="w-full max-w-sm py-6 rounded-xl font-bold text-base group shadow-lg"
              >
                Valider l'identité <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <Button variant="ghost" className="text-muted-foreground hover:text-primary font-bold">
                <Phone className="w-4 h-4 mr-2" />
                Renvoyer le code dans 00:59
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}`;

const step2PagePath = path.join(__dirname, 'apps/frontend/app/dashboard/step2/page.tsx');
const step2Content = `"use client";
import { motion } from "framer-motion";
import { Settings, Wrench, Info, Target, ArrowLeft, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const SERVICES = [
  { id: 1, title: "Diagnostic Rapide", desc: "Analyse des codes erreurs ODB-II", icon: Target, price: "45 €" },
  { id: 2, title: "Entretien Climatisation", desc: "Recharge fluide et remplacement filtres", icon: Wrench, price: "89 €" },
  { id: 3, title: "Révision Complète", desc: "Vidange, filtres, bougies (100 points)", icon: Settings, price: "249 €" },
  { id: 4, title: "Batterie & Alternateur", desc: "Remplacement et test circuit de charge", icon: Info, price: "Sur devis" },
];

export default function Step2ServicePage() {
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <div className="p-8 lg:p-12 max-w-5xl mx-auto space-y-12">
      <div className="flex flex-col items-center">
        <div className="w-full flex items-center justify-between mb-16 relative">
          <div className="absolute top-1/2 left-0 w-full h-1 bg-muted -translate-y-1/2 -z-10 rounded-full" />
          <div className="absolute top-1/2 left-0 w-full h-1 bg-primary -translate-y-1/2 -z-10 rounded-full" />
          {[1,2,3].map((step) => (
             <div key={step} className={\`w-12 h-12 rounded-full flex items-center justify-center font-black text-lg border-4 border-background shadow-md \${step <= 2 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}\`}>
                {step < 2 ? <CheckCircle2 className="w-6 h-6" /> : step}
             </div>
          ))}
        </div>
        
        <h1 className="text-4xl font-black tracking-tight text-center mb-4">Nature de l'intervention</h1>
        <p className="text-muted-foreground font-medium text-lg text-center max-w-2xl">
          Sélectionnez le type de service à programmer pour le véhicule AB-123-CD.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {SERVICES.map((srv, i) => (
          <motion.div
            key={srv.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.4 }}
            onClick={() => setSelected(srv.id)}
          >
            <Card className={\`cursor-pointer rounded-2xl relative overflow-hidden transition-all border-2 \${selected === srv.id ? "border-primary shadow-lg ring-4 ring-primary/10" : "border-border hover:border-foreground/20 hover:shadow-md"}\`}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className={\`p-4 rounded-xl \${selected === srv.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}\`}>
                    <srv.icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-black tracking-tight">{srv.title}</h3>
                    <p className="text-sm font-medium text-muted-foreground mt-1">{srv.desc}</p>
                    <Badge variant={selected === srv.id ? "default" : "secondary"} className="mt-4 text-sm px-3 py-1">
                      {srv.price}
                    </Badge>
                  </div>
                  
                  <div className={\`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors \${selected === srv.id ? "border-primary bg-primary" : "border-muted-foreground"}\`}>
                      {selected === srv.id && <div className="w-2.5 h-2.5 rounded-full bg-primary-foreground" />}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="flex items-center justify-between pt-8 border-t mt-12">
        <Button variant="outline" size="lg" asChild className="rounded-xl font-bold h-12 px-6">
          <Link href="/dashboard/step1">
            <ArrowLeft className="w-5 h-5 mr-2"/> Retour
          </Link>
        </Button>
        <Button 
          disabled={!selected}
          size="lg"
          className="rounded-xl font-bold h-12 px-8 shadow-lg"
        >
          Confirmer le service <CheckCircle2 className="w-5 h-5 ml-2" />
        </Button>
      </div>

    </div>
  );
}`;


const ocrPagePath = path.join(__dirname, 'apps/frontend/app/dashboard/ocr/page.tsx');
const ocrContent = `"use client";
import { motion } from "framer-motion";
import { Camera, UploadCloud, CheckCircle2, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { useSession } from "next-auth/react";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function OcrScannerPage() {
  const { data: session } = useSession();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
      setResult(null);
      setError(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selected = e.dataTransfer.files[0];
      if (selected.type.startsWith('image/')) {
        setFile(selected);
        setPreview(URL.createObjectURL(selected));
        setResult(null);
        setError(null);
      } else {
        setError("Veuillez sélectionner une image valide (JPG, PNG).");
      }
    }
  };

  const resetForm = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUpload = async () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (!file || !session?.accessToken) return;
    setLoading(true);
    setError(null);
    const formData = new FormData();
    formData.append("image", file);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const res = await fetch(\`\${apiUrl}/ocr/matricule\`, {
        method: "POST",
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        headers: { Authorization: \`Bearer \${session.accessToken}\` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erreur de numérisation OCR");
      setResult(data);
    } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 lg:p-12 max-w-7xl mx-auto space-y-8">
      <div className="mb-10">
        <h1 className="text-4xl font-black tracking-tight">Scanner de Plaque</h1>
        <p className="text-muted-foreground mt-2 font-medium text-lg">Système de reconnaissance automatique de véhicules (LPR).</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card 
          className={\`rounded-2xl overflow-hidden shadow-xl transition-all border-2 border-dashed \${isDragOver ? 'border-primary bg-primary/5' : 'border-border'}\`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !file && fileInputRef.current?.click()}
        >
          <CardContent className="p-8 flex flex-col items-center justify-center min-h-[400px] h-full cursor-pointer relative">
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="image/*" 
              className="hidden" 
            />

            {!file ? (
              <div className="flex flex-col items-center">
                <UploadCloud className="w-16 h-16 text-muted-foreground hover:text-primary transition-colors mb-6" />
                <h3 className="text-xl font-bold text-center mb-2">Glissez une image ici</h3>
                <p className="text-muted-foreground font-medium text-center mb-8">ou cliquez pour parcourir vos fichiers (JPG, PNG)</p>
                <Button 
                  onClick={(e) => { e.stopPropagation(); /* Logic for camera  */ }} 
                  size="lg"
                  className="rounded-xl font-bold shadow-lg"
                >
                  <Camera className="w-5 h-5 mr-2" /> Activer la Caméra
                </Button>
              </div>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center cursor-default">
                <img src={preview!} alt="Aperçu" className="w-full h-full object-contain rounded-xl max-h-[300px] shadow-sm mb-6" />
                <div className="flex flex-wrap items-center justify-center gap-4">
                  <Button 
                    variant="outline"
                    onClick={(e) => { e.stopPropagation(); resetForm(); }}
                    disabled={loading}
                    className="rounded-xl font-bold"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Changer
                  </Button>
                  <Button 
                    onClick={(e) => { e.stopPropagation(); handleUpload(); }}
                    disabled={loading}
                    className="rounded-xl font-bold shadow-lg shadow-primary/20"
                  >
                    {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Camera className="w-4 h-4 mr-2" />}
                    {loading ? 'Analyse en cours...' : 'Lancer l\\'analyse'}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/50 shadow-inner bg-muted/20">
          <CardContent className="p-8 flex flex-col h-full">
            <h3 className="text-lg font-black mb-6">Résultat de l'analyse</h3>
            
            {error && (
              <Alert variant="destructive" className="mb-6 rounded-xl">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="font-medium ml-2">{error}</AlertDescription>
              </Alert>
            )}

            {result ? (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex-1 flex flex-col justify-center items-center">
                <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mb-6 shadow-sm ring-8 ring-green-500/5">
                  <CheckCircle2 className="w-12 h-12 text-green-600" />
                </div>
                <p className="text-muted-foreground font-bold text-sm uppercase tracking-widest mb-2">Matricule détectée</p>
                <div className="bg-background px-8 py-4 rounded-xl border border-border font-mono text-4xl font-black tracking-wider shadow-sm mb-6">
                  {result.matricule || "NON DÉTECTÉ"}
                </div>
                
                <div className="w-full bg-background p-4 rounded-xl border border-border shadow-sm mt-4 text-left">
                  <p className="text-xs font-bold text-muted-foreground uppercase mb-2">Données Brutes (Raw)</p>
                  <div className="text-sm font-mono whitespace-pre-wrap break-all text-muted-foreground">
                    {result.raw || "Aucune donnée brute extraite."}
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="flex-1 flex items-center justify-center flex-col text-center opacity-50">
                <div className="w-20 h-12 border-2 border-dashed border-muted-foreground/30 rounded flex items-center justify-center font-mono text-xl font-black text-muted-foreground mb-4">
                  ---
                </div>
                <p className="text-muted-foreground font-medium">
                  {loading ? "Traitement de l'image en cours..." : "En attente d'une numérisation..."}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}`;


const layoutPath = path.join(__dirname, 'apps/frontend/app/dashboard/layout.tsx');
const layoutContent = `"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Home, FileText, CreditCard, Settings, LogOut, CheckCircle, Smartphone } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";

const SIDEBAR_LINKS = [
  { href: "/dashboard", label: "Aperçu", icon: Home },
  { href: "/dashboard/tickets", label: "Tickets", icon: FileText },
  { href: "/dashboard/paiment", label: "Paiements", icon: CreditCard },
  { href: "/dashboard/ocr", label: "Scanner Plaque", icon: Smartphone },
  { href: "/dashboard/step1", label: "Vérification OTP", icon: CheckCircle },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession() || {};

  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* Sidebar Navigation */}
      <motion.aside
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        className="w-[280px] bg-background border-r flex flex-col shadow-sm z-50 sticky top-0 h-screen"
      >
        <div className="h-24 flex items-center px-8 border-b">
          <h1 className="font-black italic text-3xl tracking-tighter">
            REN<span className="text-primary">AULT</span>
          </h1>
        </div>

        <nav className="flex-1 px-4 py-8 flex flex-col gap-2 overflow-y-auto">
          {SIDEBAR_LINKS.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link key={link.href} href={link.href}>
                <div
                  className={\`group relative flex items-center gap-4 px-4 py-3.5 rounded-xl font-bold text-[15px] tracking-wide transition-all duration-300 \${
                    isActive
                      ? "bg-foreground text-background shadow-lg"
                      : "text-muted-foreground hover:bg-primary/10 hover:text-foreground"
                  }\`}
                >
                  <Icon
                    className={\`w-5 h-5 transition-colors \${
                       isActive ? "text-primary" : "text-muted-foreground group-hover:text-primary"
                    }\`}
                  />
                  {link.label}
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute right-3 w-1.5 h-1.5 rounded-full bg-primary"
                    />
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary-foreground">
              {session?.user?.name?.charAt(0) || "U"}
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm">{session?.user?.name || "Utilisateur"}</span>
              <span className="text-xs text-muted-foreground truncate max-w-[140px]">{session?.user?.email || "Authentifié"}</span>
            </div>
          </div>
          <Button
            variant="destructive"
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full gap-2 font-bold"
          >
            <LogOut className="w-4 h-4" />
            DECONNEXION
          </Button>
        </div>
      </motion.aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b h-24 flex items-center px-8 justify-between">
          <h2 className="font-black text-xl tracking-tight capitalize">
            {SIDEBAR_LINKS.find((l) => l.href === pathname)?.label || "Tableau de Bord"}
          </h2>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="rounded-full bg-muted/50 hover:bg-primary/20">
              <Settings className="w-5 h-5 text-muted-foreground" />
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto w-full">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="w-full"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}`;


fs.writeFileSync(dashboardPagePath, dashboardPageContent);
fs.writeFileSync(step1PagePath, step1Content);
fs.writeFileSync(step2PagePath, step2Content);
fs.writeFileSync(ocrPagePath, ocrContent);
fs.writeFileSync(layoutPath, layoutContent);

console.log('Successfully refactored dashboard, ocr, step1, step2 and layout to use shadcn ui templates!');
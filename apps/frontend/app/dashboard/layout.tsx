"use client";
import { useAuth } from "../providers";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Home, FileText, CreditCard, Settings, LogOut, Smartphone, Calendar, History, PlusCircle } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

const SIDEBAR_LINKS = [
  { href: "/dashboard", label: "Aperçu", icon: Home },
  { href: "/dashboard/my-rdv", label: "Mes RDVs", icon: Calendar },
  { href: "/dashboard/tickets", label: "Nouveau RDV", icon: PlusCircle },
  { href: "/dashboard/history", label: "Historique", icon: History },
  { href: "/dashboard/ocr", label: "Scanner", icon: Smartphone },
];

function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Chargement...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-muted/30">
      <motion.aside
        initial={{ x: -100 }}
        animate={{ x: 0 }}
        className="w-[80px] bg-background border-r flex flex-col shadow-sm z-50 sticky top-0 h-screen items-center py-8"
      >
        <div className="mb-12">
          <Link href="/dashboard">
            <div className="w-12 h-12 relative flex items-center justify-center group">
              <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <Image 
                src="/favicon.svg" 
                alt="Renault Axis Logo" 
                width={48} 
                height={48} 
                className="relative z-10 transition-transform duration-500 group-hover:scale-110"
              />
            </div>
          </Link>
        </div>

        <nav className="flex-1 flex flex-col gap-6">
          {SIDEBAR_LINKS.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link key={link.href} href={link.href}>
                <div
                  className={`relative flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-300 ${
                    isActive
                      ? "bg-primary text-black shadow-lg shadow-primary/20"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute -left-4 w-1 h-6 bg-primary rounded-r-full"
                    />
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="flex flex-col gap-6 items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => logout()}
            className="w-12 h-12 rounded-2xl text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          >
            <LogOut className="w-5 h-5" />
          </Button>
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary overflow-hidden border-2 border-primary/20">
            {user?.name?.charAt(0) || "U"}
          </div>
        </div>
      </motion.aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b h-20 flex items-center px-12 justify-between">
           <div className="flex items-center gap-4">
              <Image 
                src="/favicon.svg" 
                alt="Logo" 
                width={32} 
                height={32} 
                className="rounded-lg shadow-sm"
              />
              <div className="flex flex-col">
                <h2 className="font-black text-xl tracking-tighter uppercase">
                  RENAULT <span className="text-primary italic">RDV</span>
                </h2>
                <p className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase">Console Client v2.0</p>
              </div>
           </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center bg-muted/50 px-4 py-2 rounded-xl gap-3 border border-border/50">
               <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
               <span className="text-[10px] font-black uppercase tracking-wider">Serveur Opérationnel</span>
            </div>
            <Button variant="ghost" size="icon" className="rounded-xl bg-muted/50">
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
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>;
}
"use client";
import { useAuth } from "../providers";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Home, FileText, CreditCard, Settings, LogOut, Smartphone, Calendar, History, PlusCircle, Menu, X } from "lucide-react";
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Mobile menu */}
      <motion.aside
        initial={{ x: -300 }}
        animate={{ x: mobileMenuOpen ? 0 : -300 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="fixed left-0 top-0 bottom-0 w-[280px] bg-background border-r border-border z-50 lg:hidden flex flex-col shadow-2xl"
      >
        <div className="p-6 border-b border-border flex items-center justify-between">
          <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
            <div className="flex items-center gap-3">
              <Image src="/favicon.svg" alt="Renault Axis Logo" width={40} height={40} />
              <div>
                <h2 className="font-black text-lg tracking-tighter uppercase leading-none">
                  RENAULT <span className="text-primary italic">RDV</span>
                </h2>
              </div>
            </div>
          </Link>
          <button onClick={() => setMobileMenuOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <nav className="flex-1 flex flex-col gap-2 p-4 overflow-y-auto">
          {SIDEBAR_LINKS.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link key={link.href} href={link.href} onClick={() => setMobileMenuOpen(false)}>
                <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 ${
                  isActive
                    ? "bg-primary text-black shadow-lg shadow-primary/20 font-bold"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}>
                  <Icon className="w-5 h-5" />
                  <span className="text-sm font-bold">{link.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border space-y-4">
          <Button
            variant="ghost"
            onClick={() => { logout(); setMobileMenuOpen(false); }}
            className="w-full rounded-2xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 justify-start gap-3"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-bold">Déconnexion</span>
          </Button>
          <div className="flex items-center gap-3 px-4">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary overflow-hidden border-2 border-primary/20">
              {user?.name?.charAt(0) || "U"}
            </div>
            <div className="min-w-0">
              <p className="font-bold text-sm truncate">{user?.name || "Utilisateur"}</p>
              <p className="text-[10px] text-muted-foreground truncate">{user?.role || "USER"}</p>
            </div>
          </div>
        </div>
      </motion.aside>

      {/* Desktop sidebar */}
      <motion.aside
        initial={{ x: -100 }}
        animate={{ x: 0 }}
        className="hidden lg:flex w-[80px] bg-background border-r flex-col shadow-sm z-50 sticky top-0 h-screen items-center py-8"
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

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b h-16 sm:h-20 flex items-center px-4 sm:px-6 lg:px-12 justify-between">
           <div className="flex items-center gap-3 sm:gap-4">
              {/* Mobile menu toggle */}
              <button 
                onClick={() => setMobileMenuOpen(true)} 
                className="lg:hidden w-10 h-10 rounded-xl hover:bg-muted flex items-center justify-center"
                aria-label="Open menu"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              <Image 
                src="/favicon.svg" 
                alt="Logo" 
                width={28} 
                height={28} 
                className="rounded-lg shadow-sm sm:hidden"
              />
              <Image 
                src="/favicon.svg" 
                alt="Logo" 
                width={32} 
                height={32} 
                className="rounded-lg shadow-sm hidden sm:block"
              />
              <div className="flex flex-col">
                <h2 className="font-black text-base sm:text-xl tracking-tighter uppercase">
                  RENAULT <span className="text-primary italic">RDV</span>
                </h2>
                <p className="text-[8px] sm:text-[10px] font-bold text-muted-foreground tracking-widest uppercase hidden sm:block">Console Client v2.0</p>
              </div>
           </div>
          
          <div className="flex items-center gap-3 sm:gap-6">
            <div className="hidden md:flex items-center bg-muted/50 px-4 py-2 rounded-xl gap-3 border border-border/50">
               <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
               <span className="text-[10px] font-black uppercase tracking-wider">Serveur Opérationnel</span>
            </div>
            <Button variant="ghost" size="icon" className="rounded-xl bg-muted/50 w-9 h-9 sm:w-10 sm:h-10">
              <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
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
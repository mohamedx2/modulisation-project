"use client";
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
                  className={`group relative flex items-center gap-4 px-4 py-3.5 rounded-xl font-bold text-[15px] tracking-wide transition-all duration-300 ${
                    isActive
                      ? "bg-foreground text-background shadow-lg"
                      : "text-muted-foreground hover:bg-primary/10 hover:text-foreground"
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 transition-colors ${
                       isActive ? "text-primary" : "text-muted-foreground group-hover:text-primary"
                    }`}
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
}
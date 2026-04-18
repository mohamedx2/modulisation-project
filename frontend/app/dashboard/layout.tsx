"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Home, FileText, CreditCard, Settings, LogOut, CheckCircle, Smartphone } from "lucide-react";
import { signOut, useSession } from "next-auth/react";

const SIDEBAR_LINKS = [
  { href: "/dashboard", label: "Apercu", icon: Home },
  { href: "/dashboard/tickets", label: "Tickets", icon: FileText },
  { href: "/dashboard/paiment", label: "Paiements", icon: CreditCard },
  { href: "/dashboard/ocr", label: "Scanner Plaque", icon: Smartphone },
  { href: "/dashboard/step1", label: "Verification OTP", icon: CheckCircle },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession() || {};

  return (
    <div className="flex min-h-screen bg-[#fcf9f8] text-[#1c1b1b] font-sans selection:bg-[#f5c800] selection:text-[#1c1b1b]">
      {/* Sidebar Navigation */}
      <motion.aside
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        className="w-[280px] bg-white border-r border-black/5 flex flex-col shadow-[20px_0_40px_rgba(28,27,27,0.03)] z-50 sticky top-0 h-screen"
      >
        <div className="h-24 flex items-center px-8 border-b border-black/5 bg-gradient-to-r from-white to-[#fcf9f8]">
          <h1 className="font-black italic text-3xl tracking-tighter text-[#1c1b1b]">
            REN<span className="text-[#f5c800]">AULT</span>
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
                      ? "bg-[#1c1b1b] text-white shadow-xl shadow-[#1c1b1b]/10"
                      : "text-[#71717a] hover:bg-[#f5c800]/10 hover:text-[#1c1b1b]"
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 transition-colors ${
                       isActive ? "text-[#f5c800]" : "text-[#a1a1aa] group-hover:text-[#f5c800]"
                    }`}
                  />
                  {link.label}
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute right-3 w-1.5 h-1.5 rounded-full bg-[#f5c800]"
                    />
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t border-black/5">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-10 h-10 rounded-full bg-[#f5c800]/20 flex items-center justify-center font-bold text-[#695400]">
              {session?.user?.name?.charAt(0) || "U"}
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm">{session?.user?.name || "Utilisateur"}</span>
              <span className="text-xs text-[#a1a1aa] truncate max-w-[140px]">{session?.user?.email || "Authentifie"}</span>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-bold text-sm tracking-wide text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            DECONNEXION
          </button>
        </div>
      </motion.aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-black/5 h-24 flex items-center px-8 justify-between">
          <h2 className="font-black text-xl tracking-tight text-[#1c1b1b] capitalize">
            {SIDEBAR_LINKS.find((l) => l.href === pathname)?.label || "Tableau de Bord"}
          </h2>
          <div className="flex items-center gap-4">
            <button className="p-2.5 rounded-full bg-[#fcf9f8] hover:bg-[#f5c800]/20 transition-colors">
              <Settings className="w-5 h-5 text-[#71717a]" />
            </button>
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
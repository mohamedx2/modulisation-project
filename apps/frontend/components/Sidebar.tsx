"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Ticket, CreditCard, ScanLine, Settings } from "lucide-react";
import clsx from "clsx";

const navigation = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Tickets", href: "/dashboard/tickets", icon: Ticket },
  { name: "Payments", href: "/dashboard/paiment", icon: CreditCard },
  { name: "OCR Scans", href: "/dashboard/ocr", icon: ScanLine },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col bg-gray-900 border-r border-gray-800">
      <div className="flex h-16 shrink-0 items-center px-6">
        <span className="text-xl font-bold text-white tracking-tight">Renault Axis</span>
      </div>
      <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
        <nav className="flex-1 space-y-1 px-3">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={clsx(
                  isActive
                    ? "bg-gray-800 text-white"
                    : "text-gray-400 hover:bg-gray-800 hover:text-white",
                  "group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors"
                )}
              >
                <item.icon
                  className={clsx(
                    isActive ? "text-white" : "text-gray-400 group-hover:text-white",
                    "mr-3 h-5 w-5 flex-shrink-0"
                  )}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

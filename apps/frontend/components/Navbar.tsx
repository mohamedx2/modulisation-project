"use client";

import { useSession, signOut } from "next-auth/react";
import { LogOut, User } from "lucide-react";

export function Navbar() {
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-10 flex h-16 flex-shrink-0 bg-white border-b border-gray-200 shadow-sm">
      <div className="flex flex-1 items-center justify-between px-6">
        <div className="flex-1"></div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm text-gray-700">
            <User className="h-4 w-4" />
            <span>{session?.user?.name || session?.user?.email || "User"}</span>
          </div>
          <button
            onClick={() => signOut()}
            className="flex items-center space-x-1 text-sm font-medium text-red-600 hover:text-red-500 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span>Log out</span>
          </button>
        </div>
      </div>
    </header>
  );
}

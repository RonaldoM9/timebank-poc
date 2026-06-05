"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import {
  Clock,
  LayoutDashboard,
  Search,
  Calendar,
  CalendarCheck,
  Wallet,
  Award,
  BarChart3,
  User,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/services", label: "Missions", icon: Search },
  { href: "/agenda", label: "Agenda", icon: CalendarCheck },
  { href: "/bookings", label: "Bookings", icon: Calendar },
  { href: "/wallet", label: "Wallet", icon: Wallet },
  { href: "/rewards", label: "Rewards", icon: Award },
  { href: "/impact", label: "Impact", icon: BarChart3 },
  { href: "/profile", label: "Profil", icon: User },
];

export default function ConnectedHeader() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="border-b border-[#262626] bg-[#0a0a0a]/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2 group shrink-0">
          <Clock className="w-5 h-5 text-[#00d4aa] group-hover:text-[#00b894] transition-colors" />
          <span className="font-anton text-lg tracking-wide text-[#f5f5f5] hidden sm:inline">
            TimeHeroes
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-[#a3a3a3] hover:text-[#f5f5f5] hover:bg-[#181818] transition-colors"
            >
              <link.icon className="w-4 h-4" />
              <span>{link.label}</span>
            </Link>
          ))}
        </nav>

        {/* Desktop right side */}
        <div className="hidden md:flex items-center gap-3">
          {session?.user?.name && (
            <span className="text-xs text-[#5c5c5c] truncate max-w-[120px]">
              {session.user.name}
            </span>
          )}
          <button
            onClick={() => signOut({ callbackUrl: "/auth/signin" })}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-[#a3a3a3] hover:text-[#f5f5f5] hover:bg-[#181818] transition-colors"
            title="Déconnexion"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden lg:inline">Déconnexion</span>
          </button>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-[#a3a3a3] hover:text-[#f5f5f5] transition-colors"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-[#262626] bg-[#111111] max-h-[80vh] overflow-y-auto">
          <nav className="flex flex-col px-4 py-3 gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm text-[#a3a3a3] hover:text-[#f5f5f5] hover:bg-[#181818] transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                <link.icon className="w-5 h-5" />
                <span>{link.label}</span>
              </Link>
            ))}
            <hr className="border-[#262626] my-2" />
            <div className="px-3 py-2">
              {session?.user?.name && (
                <p className="text-xs text-[#5c5c5c] mb-2">{session.user.name}</p>
              )}
              <button
                onClick={() => {
                  setMenuOpen(false);
                  signOut({ callbackUrl: "/auth/signin" });
                }}
                className="flex items-center gap-3 text-sm text-red-400 hover:text-red-300 transition-colors w-full py-2"
              >
                <LogOut className="w-5 h-5" />
                <span>Déconnexion</span>
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

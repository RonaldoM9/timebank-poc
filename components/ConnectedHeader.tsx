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
  ChevronDown,
} from "lucide-react";
import { useState } from "react";

const PRIMARY_NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/services", label: "Missions", icon: Search },
  { href: "/bookings", label: "Bookings", icon: Calendar },
];

const SECONDARY_NAV = [
  { href: "/agenda", label: "Agenda", icon: CalendarCheck },
  { href: "/wallet", label: "Wallet", icon: Wallet },
  { href: "/rewards", label: "Rewards", icon: Award },
  { href: "/impact", label: "Impact", icon: BarChart3 },
  { href: "/profile", label: "Profil", icon: User },
];

const ALL_NAV = [...PRIMARY_NAV, ...SECONDARY_NAV];

export default function ConnectedHeader() {
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [desktopMoreOpen, setDesktopMoreOpen] = useState(false);

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

        {/* Desktop nav — primaires visibles */}
        <nav className="hidden md:flex items-center gap-1">
          {PRIMARY_NAV.map((link) => (
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

        {/* Desktop right side — nom + Menu ▼ */}
        <div className="hidden md:flex items-center gap-3">
          {session?.user?.name && (
            <span className="text-xs text-[#5c5c5c] truncate max-w-[120px]">
              {session.user.name}
            </span>
          )}

          <div className="relative">
            <button
              onClick={() => setDesktopMoreOpen((prev) => !prev)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-[#a3a3a3] hover:text-[#f5f5f5] hover:bg-[#181818] transition-colors"
              aria-label="Plus de menus"
              aria-expanded={desktopMoreOpen}
            >
              <span>Menu</span>
              <ChevronDown
                className={`w-4 h-4 transition-transform ${desktopMoreOpen ? "rotate-180" : ""}`}
              />
            </button>

            {desktopMoreOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setDesktopMoreOpen(false)}
                />
                <div className="absolute top-full right-0 mt-1 w-56 bg-[#111111] border border-[#262626] rounded-xl shadow-xl z-20 py-2">
                  {SECONDARY_NAV.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setDesktopMoreOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm text-[#a3a3a3] hover:text-[#f5f5f5] hover:bg-[#181818] transition-colors"
                    >
                      <link.icon className="w-4 h-4" />
                      <span>{link.label}</span>
                    </Link>
                  ))}
                  <hr className="border-[#262626] my-2" />
                  <button
                    onClick={() => {
                      setDesktopMoreOpen(false);
                      signOut({ callbackUrl: "/auth/signin" });
                    }}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:text-red-300 transition-colors w-full text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Déconnexion</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-[#a3a3a3] hover:text-[#f5f5f5] transition-colors"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile menu — tous les liens */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#262626] bg-[#111111] max-h-[80vh] overflow-y-auto">
          <nav className="flex flex-col px-4 py-3 gap-1">
            {ALL_NAV.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm text-[#a3a3a3] hover:text-[#f5f5f5] hover:bg-[#181818] transition-colors"
                onClick={() => setMobileMenuOpen(false)}
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
                  setMobileMenuOpen(false);
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

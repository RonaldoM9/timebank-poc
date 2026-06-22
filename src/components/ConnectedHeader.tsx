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
  ShieldCheck,
  Users,
  Activity,
  Sparkles,
  Building2,
} from "lucide-react";
import { useState } from "react";

type NavItem = { href: string; label: string; icon: any; role?: string };
type NavSection = {
  title: string;
  icon: any;
  items: NavItem[];
};

function buildNavSections(isFacilitator: boolean, role: string): NavSection[] {
  const sections: NavSection[] = [
    {
      title: "Pair à pair",
      icon: Users,
      items: [
        { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { href: "/services", label: "Missions", icon: Search },
        { href: "/collective-missions", label: "Collectives", icon: Users },
        { href: "/bookings", label: "Bookings", icon: Calendar },
        { href: "/agenda", label: "Agenda", icon: CalendarCheck },
        { href: "/wallet", label: "Wallet", icon: Wallet },
        { href: "/rewards", label: "Rewards", icon: Award },
        { href: "/impact", label: "Impact", icon: BarChart3 },
        { href: "/profile", label: "Profil", icon: User },
      ],
    },
    {
      title: "Organisation",
      icon: Building2,
      items: [
        { href: "/organizations", label: "Mes organisations", icon: Building2 },
      ],
    },
  ];

  if (isFacilitator) {
    sections[1].items.push(
      { href: "/facilitator/community-pot", label: "Pot commun", icon: ShieldCheck },
      { href: "/facilitator/network", label: "Réseau", icon: Activity },
      { href: "/facilitator/matching", label: "Matchmaking", icon: Sparkles },
    );
  }

  if (role === "ADMIN") {
    sections[1].items.push({ href: "/admin/organizations", label: "Admin org.", icon: ShieldCheck });
  }

  return sections;
}

export default function ConnectedHeader() {
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [desktopMoreOpen, setDesktopMoreOpen] = useState(false);

  const role = (session?.user as any)?.role;
  const isFacilitator = role === "FACILITATOR" || role === "ADMIN";
  const SECTIONS = buildNavSections(isFacilitator, role);

  return (
    <header className="border-b border-tb-border bg-tb-bg/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2 group shrink-0">
          <Clock className="w-5 h-5 text-tb-accent group-hover:text-tb-accent-hover transition-colors" />
          <span className="font-anton text-lg tracking-wide text-tb-text-primary hidden sm:inline">
            TimeHeroes
          </span>
        </Link>

        {/* Desktop right side — nom + Menu ▼ */}
        <div className="hidden md:flex items-center gap-3">
          {session?.user?.name && (
            <span className="text-xs text-tb-text-muted truncate max-w-[120px]">
              {session.user.name}
            </span>
          )}

          <div className="relative">
            <button
              onClick={() => setDesktopMoreOpen((prev) => !prev)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-tb-text-secondary hover:text-tb-text-primary hover:bg-tb-surface-elevated transition-colors"
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
                <div className="absolute top-full right-0 mt-1 w-64 bg-tb-surface border border-tb-border rounded-xl shadow-xl z-20 py-2 max-h-[70vh] overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-tb-border/60 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent scrollbar-thin scrollbar-color-tb-border/60-transparent" style={{scrollbarWidth:'thin',scrollbarColor:'#E8E1D8 transparent'}}>
                  {SECTIONS.map((section, si) => (
                    <div key={section.title}>
                      {si > 0 && <hr className="border-tb-border my-1 mx-2" />}
                      <div className="px-4 py-1.5 text-[10px] uppercase tracking-widest text-tb-text-muted font-semibold flex items-center gap-1.5">
                        <section.icon className="w-3 h-3" />
                        <span>{section.title}</span>
                      </div>
                      {section.items.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={() => setDesktopMoreOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-tb-text-secondary hover:text-tb-text-primary hover:bg-tb-surface-elevated transition-colors"
                        >
                          <link.icon className="w-4 h-4" />
                          <span>{link.label}</span>
                        </Link>
                      ))}
                    </div>
                  ))}
                  <hr className="border-tb-border my-1 mx-2" />
                  <button
                    onClick={() => {
                      setDesktopMoreOpen(false);
                      signOut({ callbackUrl: "/auth/signin" });
                    }}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 transition-colors w-full text-left"
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
          className="md:hidden text-tb-text-secondary hover:text-tb-text-primary transition-colors"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile menu — sections séparées */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-tb-border bg-tb-surface max-h-[80vh] overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-tb-border/60 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent scrollbar-thin scrollbar-color-tb-border/60-transparent" style={{scrollbarWidth:'thin',scrollbarColor:'#E8E1D8 transparent'}}>
          <nav className="flex flex-col px-4 py-3 gap-1">
            {SECTIONS.map((section, si) => (
              <div key={section.title}>
                {si > 0 && <hr className="border-tb-border my-2 mx-2" />}
                <div className="px-3 py-1.5 text-[10px] uppercase tracking-widest text-tb-text-muted font-semibold flex items-center gap-1.5">
                  <section.icon className="w-3 h-3" />
                  <span>{section.title}</span>
                </div>
                {section.items.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm text-tb-text-secondary hover:text-tb-text-primary hover:bg-tb-surface-elevated transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <link.icon className="w-5 h-5" />
                    <span>{link.label}</span>
                  </Link>
                ))}
              </div>
            ))}
            <hr className="border-tb-border my-2" />
            <div className="px-3 py-2">
              {session?.user?.name && (
                <p className="text-xs text-tb-text-muted mb-2">{session.user.name}</p>
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

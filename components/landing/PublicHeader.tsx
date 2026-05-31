"use client";

import Link from "next/link";
import { Clock, Menu, X } from "lucide-react";
import { useState } from "react";

export default function PublicHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="border-b border-[#262626] bg-[#0a0a0a]/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <Clock className="w-5 h-5 text-[#00d4aa] group-hover:text-[#00b894] transition-colors" />
          <span className="font-anton text-lg tracking-wide text-[#f5f5f5]">
            TimeHeroes
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/services"
            className="text-sm text-[#a3a3a3] hover:text-[#f5f5f5] transition-colors"
          >
            Missions
          </Link>
          <Link
            href="/impact"
            className="text-sm text-[#a3a3a3] hover:text-[#f5f5f5] transition-colors"
          >
            Impact
          </Link>
          <a
            href="#how-it-works"
            className="text-sm text-[#a3a3a3] hover:text-[#f5f5f5] transition-colors"
          >
            Comment ça marche
          </a>
          <Link
            href="/auth/signin"
            className="text-sm px-4 py-2 rounded-xl bg-[#00d4aa] text-[#0a0a0a] font-semibold hover:bg-[#00b894] transition-colors"
          >
            Tester la démo
          </Link>
          <Link
            href="/auth/signin"
            className="text-sm text-[#a3a3a3] hover:text-[#f5f5f5] transition-colors"
          >
            Connexion
          </Link>
        </nav>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-[#a3a3a3] hover:text-[#f5f5f5] transition-colors"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu"
        >
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-[#262626] bg-[#111111]">
          <nav className="flex flex-col px-4 py-4 gap-4">
            <Link
              href="/services"
              className="text-sm text-[#a3a3a3] hover:text-[#f5f5f5] transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              Missions
            </Link>
            <Link
              href="/impact"
              className="text-sm text-[#a3a3a3] hover:text-[#f5f5f5] transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              Impact
            </Link>
            <a
              href="#how-it-works"
              className="text-sm text-[#a3a3a3] hover:text-[#f5f5f5] transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              Comment ça marche
            </a>
            <Link
              href="/auth/signin"
              className="text-sm px-4 py-2 rounded-xl bg-[#00d4aa] text-[#0a0a0a] font-semibold hover:bg-[#00b894] transition-colors text-center"
              onClick={() => setMenuOpen(false)}
            >
              Tester la démo
            </Link>
            <Link
              href="/auth/signin"
              className="text-sm text-[#a3a3a3] hover:text-[#f5f5f5] transition-colors text-center"
              onClick={() => setMenuOpen(false)}
            >
              Connexion
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}

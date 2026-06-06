"use client";

import Link from "next/link";
import { Clock, Menu, X } from "lucide-react";
import { useState } from "react";

export default function PublicHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="bg-tb-surface border-b border-tb-border sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group shrink-0">
          <Clock className="w-5 h-5 text-tb-accent group-hover:text-tb-accent-hover transition-colors" />
          <span className="font-anton text-lg tracking-wide text-tb-text-primary">
            TimeHeroes
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/services"
            className="text-sm text-tb-text-secondary hover:text-tb-text-primary transition-colors"
          >
            Missions
          </Link>
          <Link
            href="/impact"
            className="text-sm text-tb-text-secondary hover:text-tb-text-primary transition-colors"
          >
            Impact
          </Link>
          <a
            href="#how-it-works"
            className="text-sm text-tb-text-secondary hover:text-tb-text-primary transition-colors"
          >
            Comment ça marche
          </a>
          <Link
            href="/auth/signin"
            className="text-sm px-4 py-2 rounded-xl bg-tb-accent text-white font-semibold hover:bg-tb-accent-hover transition-colors"
          >
            Tester la démo
          </Link>
          <Link
            href="/auth/signin"
            className="text-sm text-tb-text-secondary hover:text-tb-text-primary transition-colors"
          >
            Connexion
          </Link>
        </nav>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-tb-text-secondary hover:text-tb-text-primary transition-colors"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu"
        >
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-tb-border bg-tb-surface">
          <nav className="flex flex-col px-4 py-4 gap-4">
            <Link
              href="/services"
              className="text-sm text-tb-text-secondary hover:text-tb-text-primary transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              Missions
            </Link>
            <Link
              href="/impact"
              className="text-sm text-tb-text-secondary hover:text-tb-text-primary transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              Impact
            </Link>
            <a
              href="#how-it-works"
              className="text-sm text-tb-text-secondary hover:text-tb-text-primary transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              Comment ça marche
            </a>
            <Link
              href="/auth/signin"
              className="text-sm px-4 py-2 rounded-xl bg-tb-accent text-white font-semibold hover:bg-tb-accent-hover transition-colors text-center"
              onClick={() => setMenuOpen(false)}
            >
              Tester la démo
            </Link>
            <Link
              href="/auth/signin"
              className="text-sm text-tb-text-secondary hover:text-tb-text-primary transition-colors text-center"
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

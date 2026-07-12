import type { Metadata } from "next";
import { Inter, Anton, Bangers } from "next/font/google";
import "./globals.css";
import AuthProvider from "./providers";
import CapacitorInit from "@/components/CapacitorInit";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const anton = Anton({
  variable: "--font-anton",
  subsets: ["latin"],
  weight: "400",
});

const bangers = Bangers({
  variable: "--font-bangers",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "TimeHeroes — Échangez du temps, pas de l'argent",
  description:
    "Plateforme de TimeHeroes. Chacun échange ses compétences contre du temps via l'unité interne TIME.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "TimeHeroes",
  },
  icons: {
    apple: "/icon-192.png",
  },
  viewport:
    "width=device-width, initial-scale=1, viewport-fit=cover, user-scalable=no",
  themeColor: "#2BB286",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${inter.variable} ${anton.variable} ${bangers.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-tb-bg text-tb-text-primary font-sans">
        <AuthProvider>
          <CapacitorInit />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}

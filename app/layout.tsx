import type { Metadata } from "next";
import { Inter, Anton, Bangers } from "next/font/google";
import "./globals.css";
import AuthProvider from "./providers";

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
      <body className="min-h-full bg-[#0a0a0a] text-[#f5f5f5] font-sans">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}

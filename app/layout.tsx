import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Inscription Collecte Amiante 2026 — SITCOM",
  description: "Formulaire d'inscription à la campagne de collecte d'amiante SITCOM Côte Sud des Landes.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}

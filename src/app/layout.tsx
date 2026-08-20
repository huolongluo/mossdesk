import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const display = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const body = Manrope({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "MossDesk — Gemini agents that mint invoices on X Layer",
  description:
    "A professional firm operated by Gemini. Agents intake the mess, set the price, deliver a 7-day package, mint the invoice as an AI-issued receivable on X Layer, and collect in OKB.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased">
        <header className="site-header">
          <Link href="/" className="brand">
            Moss<span>Desk</span>
          </Link>
          <nav className="nav">
            <a href="/#how">How it runs</a>
            <a href="/#rwa">AI-RWA</a>
            <Link href="/xlayer">X Layer</Link>
            <Link href="/ops">Ops log</Link>
            <Link href="/start" className="btn-solid">
              Hire the firm
            </Link>
          </nav>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="site-footer">
          <span>MossDesk · OKX Build X AI Season · AI-RWA on X Layer</span>
          <span>Gemini prices the work. X Layer settles the receivable.</span>
        </footer>
      </body>
    </html>
  );
}

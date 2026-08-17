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
  title: "MossDesk — Gemini agents that run a small-business front office",
  description:
    "A real professional firm operated by Gemini. Agents intake the mess, set the price, deliver a 7-day operating package, invoice, and only escalate exceptions.",
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
            <a href="/#agents">Agents</a>
            <Link href="/ops">Ops log</Link>
            <Link href="/start" className="btn-solid">
              Hire the firm
            </Link>
          </nav>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="site-footer">
          <span>MossDesk · Build with Gemini XPRIZE · Small Business Services</span>
          <span>Gemini prices, delivers, and collects. Humans handle exceptions.</span>
        </footer>
      </body>
    </html>
  );
}

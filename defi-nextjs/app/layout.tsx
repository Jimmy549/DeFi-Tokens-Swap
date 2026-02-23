import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SimpleSwap DEX | DeFi Learning Lab",
  description: "Decentralized token exchange built with Solidity AMM — DeFi learning project",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body>{children}</body>
    </html>
  );
}

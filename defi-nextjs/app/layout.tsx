import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SimpleSwap DEX | DeFi Learning Lab",
  description: "Decentralized token exchange built with Solidity AMM — DeFi learning project",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' fill='%2300d9ff'/><text y='75' font-size='70' fill='%23000'>💱</text></svg>" />
      </head>
      <body>{children}</body>
    </html>
  );
}

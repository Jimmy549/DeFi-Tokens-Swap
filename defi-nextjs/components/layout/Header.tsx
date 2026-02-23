"use client";

import { Activity, Wifi } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { fmtAddress } from "@/lib/utils";

interface HeaderProps {
  connected: boolean;
  address: string;
  network: string;
  blockNumber: number;
  connecting: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
}

export function Header({
  connected,
  address,
  network,
  blockNumber,
  connecting,
  onConnect,
  onDisconnect,
}: HeaderProps) {
  return (
    <header className="relative z-20 flex justify-between items-center px-6 md:px-10 py-4 border-b border-border bg-bg/80 backdrop-blur-xl">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="w-7 h-7 border border-[#00d9ff]/60 flex items-center justify-center">
          <div className="w-3 h-3 bg-[#00d9ff] animate-pulse2" />
        </div>
        <span className="font-display font-extrabold text-lg tracking-tight">
          <span className="text-[#00d9ff]">Simple</span>
          <span className="text-white">Swap</span>
        </span>
        <span className="hidden md:block font-mono text-[0.55rem] tracking-[3px] text-gray-600 uppercase border border-border px-2 py-1">
          DeFi Lab
        </span>
      </div>

      {/* Status Bar */}
      <div className="hidden md:flex items-center gap-6">
        {connected && (
          <>
            <div className="flex items-center gap-2">
              <Activity size={12} className="text-emerald-400" />
              <span className="font-mono text-[0.65rem] text-gray-500 tracking-widest uppercase">
                {network}
              </span>
            </div>
            <div className="font-mono text-[0.65rem] text-gray-500">
              Block{" "}
              <span className="text-[#00d9ff]">#{blockNumber.toLocaleString()}</span>
            </div>
          </>
        )}
      </div>

      {/* Wallet Button */}
      <div className="flex items-center gap-3">
        {connected ? (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-2 border border-emerald-500/40 bg-emerald-500/5">
              <Wifi size={12} className="text-emerald-400" />
              <span className="font-mono text-[0.7rem] text-emerald-400 tracking-widest">
                {fmtAddress(address)}
              </span>
            </div>
            <Button variant="ghost" size="sm" onClick={onDisconnect}>
              Disconnect
            </Button>
          </div>
        ) : (
          <Button variant="primary" size="sm" loading={connecting} onClick={onConnect}>
            {connecting ? "Connecting" : "[ Connect Wallet ]"}
          </Button>
        )}
      </div>
    </header>
  );
}

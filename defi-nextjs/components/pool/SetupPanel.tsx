"use client";

import { useState, useEffect } from "react";
import { Card, CardTitle } from "@/components/ui/Card";
import { AddressInput } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { isValidAddress } from "@/lib/utils";
import { clsx } from "clsx";
import type { ContractAddresses, SavedPair } from "@/types";

interface SetupPanelProps {
  network: string;
  blockNumber: number;
  connected: boolean;
  onLoad: (addresses: ContractAddresses) => Promise<void>;
  savedPairs: SavedPair[];
  activePairIndex: number | null;
  onSelectPair: (index: number) => Promise<void>;
}

export function SetupPanel({ 
  network, 
  blockNumber, 
  connected, 
  onLoad,
  savedPairs,
  activePairIndex,
  onSelectPair
}: SetupPanelProps) {
  const [addrs, setAddrs] = useState<ContractAddresses>({
    tokenA: "",
    tokenB: "",
    swap: "",
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ msg: string; ok: boolean } | null>(null);

  // Auto-fill inputs when a pair is selected or from history
  useEffect(() => {
    if (activePairIndex !== null && savedPairs[activePairIndex]) {
      const p = savedPairs[activePairIndex];
      setAddrs({ tokenA: p.tokenA, tokenB: p.tokenB, swap: p.swap });
    }
  }, [activePairIndex, savedPairs]);

  // Load last used addresses from localStorage if no active pair
  useEffect(() => {
    const last = localStorage.getItem("defi_last_addrs");
    if (last && activePairIndex === null) {
      try {
        setAddrs(JSON.parse(last));
      } catch (e) {}
    }
  }, [activePairIndex]);

  const validA = addrs.tokenA ? isValidAddress(addrs.tokenA) : undefined;
  const validB = addrs.tokenB ? isValidAddress(addrs.tokenB) : undefined;
  const validSwap = addrs.swap ? isValidAddress(addrs.swap) : undefined;
  const allValid = validA && validB && validSwap;

  const handleLoad = async () => {
    if (!allValid) return;
    if (!connected) {
      setStatus({ msg: "Please connect wallet first", ok: false });
      return;
    }
    setLoading(true);
    setStatus(null);
    try {
      await onLoad(addrs);
      localStorage.setItem("defi_last_addrs", JSON.stringify(addrs));
      setStatus({ msg: "✓ Contracts loaded successfully", ok: true });
      setTimeout(() => setStatus(null), 3000);
    } catch (e: unknown) {
      let msg = "Failed to load contracts";
      if (e instanceof Error) {
        if (e.message.includes("Invalid")) {
          msg = e.message;
        } else if (e.message.includes("network")) {
          msg = "Network error. Check your connection";
        } else {
          msg = e.message.slice(0, 100);
        }
      }
      setStatus({ msg, ok: false });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 mb-6">
      <CardTitle>⚙ Contract Setup</CardTitle>

      {/* Network info */}
      <div className="grid grid-cols-3 gap-px bg-border mb-5">
        {[
          ["Network", network || "—"],
          ["Block", blockNumber > 0 ? `#${blockNumber}` : "—"],
          ["Fee", "0.3%"],
        ].map(([label, value]) => (
          <div key={label} className="bg-surface px-3 py-2.5">
            <div className="font-mono text-[0.58rem] tracking-widest text-gray-500 uppercase mb-1">
              {label}
            </div>
            <div className="font-mono text-[0.75rem] font-bold text-emerald-400">{value}</div>
          </div>
        ))}
      </div>

      {/* Saved Pairs Dropdown */}
      {savedPairs.length > 0 && (
        <div className="mb-6">
          <div className="font-mono text-[0.62rem] tracking-[2px] text-gray-500 uppercase mb-2">
            Quick Load (Saved Pairs)
          </div>
          <div className="flex flex-wrap gap-2">
            {savedPairs.map((pair, idx) => (
              <button
                key={pair.swap}
                onClick={() => onSelectPair(idx)}
                className={clsx(
                  "px-3 py-2 font-mono text-[0.7rem] border transition-all duration-200",
                  activePairIndex === idx
                    ? "border-[#00d9ff] text-[#00d9ff] bg-[#00d9ff]/5"
                    : "border-border text-gray-400 hover:border-gray-500 hover:text-gray-200"
                )}
              >
                {pair.symbolA} / {pair.symbolB}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3">
        <AddressInput
          label="Token A Address"
          placeholder="0x... (MyToken A)"
          value={addrs.tokenA}
          valid={validA}
          onChange={(e) => setAddrs((p) => ({ ...p, tokenA: e.target.value }))}
        />
        <AddressInput
          label="Token B Address"
          placeholder="0x... (MyToken B)"
          value={addrs.tokenB}
          valid={validB}
          onChange={(e) => setAddrs((p) => ({ ...p, tokenB: e.target.value }))}
        />
        <AddressInput
          label="SimpleSwap Address"
          placeholder="0x... (SimpleSwap contract)"
          value={addrs.swap}
          valid={validSwap}
          onChange={(e) => setAddrs((p) => ({ ...p, swap: e.target.value }))}
        />
      </div>

      <Button
        variant="primary"
        size="lg"
        loading={loading}
        disabled={!allValid || !connected}
        onClick={handleLoad}
        className="mt-4"
      >
        {connected ? "[ Load Contracts ]" : "[ Connect Wallet First ]"}
      </Button>

      {status && (
        <div
          className={`mt-3 p-3 font-mono text-[0.7rem] border ${
            status.ok
              ? "border-emerald-500/40 text-emerald-400 bg-emerald-500/5"
              : "border-red-500/40 text-red-400 bg-red-500/5"
          }`}
        >
          {status.msg}
        </div>
      )}
    </Card>
  );
}

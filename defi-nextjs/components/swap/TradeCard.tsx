"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { ChevronDown } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/Card";
import { SwapPanel } from "./SwapPanel";
import { LiquidityPanel } from "./LiquidityPanel";
import { RemovePanel } from "./RemovePanel";
import { TxHistory } from "./TxHistory";
import { clsx } from "clsx";
import type { PoolState, UserState, TxRecord, SavedPair } from "@/types";

const TABS = ["SWAP", "ADD LIQ.", "REMOVE"] as const;
type Tab = (typeof TABS)[number];

interface TradeCardProps {
  pool: PoolState;
  user: UserState;
  symbolA: string;
  symbolB: string;
  tokenAContract: ethers.Contract | null;
  tokenBContract: ethers.Contract | null;
  swapContract: ethers.Contract | null;
  onSuccess: () => void;
  onNotify: (msg: string, type?: "success" | "error" | "warn" | "info") => void;
  savedPairs: SavedPair[];
  activePairIndex: number | null;
  onSelectPair: (index: number) => Promise<void>;
}

export function TradeCard(props: TradeCardProps) {
  const [activeTab, setActiveTab] = useState<Tab>("SWAP");
  const [txHistory, setTxHistory] = useState<TxRecord[]>([]);
  const [showPairMenu, setShowPairMenu] = useState(false);

  // Load history on mount
  useEffect(() => {
    const saved = localStorage.getItem("defi_tx_history");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Convert ISO strings back to Date objects
        const records = parsed.map((r: any) => ({
          ...r,
          timestamp: new Date(r.timestamp)
        }));
        setTxHistory(records);
      } catch (e) {}
    }
  }, []);

  const handleSuccess = (type: TxRecord["type"], description: string, hash?: string) => {
    const newRecord: TxRecord = {
      id: Date.now(),
      type,
      description,
      timestamp: new Date(),
      hash
    };

    setTxHistory((prev) => {
      const newList = [newRecord, ...prev].slice(0, 20);
      localStorage.setItem("defi_tx_history", JSON.stringify(newList));
      return newList;
    });
    props.onSuccess();
  };

  return (
    <Card className="p-6 relative">
      <div className="flex justify-between items-center mb-6">
        <CardTitle className="mb-0">⟷ Trade</CardTitle>
        
        {/* Pair Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowPairMenu(!showPairMenu)}
            className="flex items-center gap-2 px-3 py-1.5 font-mono text-[0.68rem] bg-slate-900 border border-border hover:border-[#00d9ff] transition-all"
          >
            <span className="text-[#00d9ff] font-bold">
              {props.symbolA}/{props.symbolB}
            </span>
            <ChevronDown size={14} className={clsx("transition-transform", showPairMenu && "rotate-180")} />
          </button>

          {showPairMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-surface border border-border shadow-glow-sm z-50 py-1">
              {props.savedPairs.length === 0 ? (
                <div className="px-3 py-2 text-[0.65rem] text-gray-500 font-mono">No saved pairs</div>
              ) : (
                props.savedPairs.map((pair, idx) => (
                  <button
                    key={pair.swap}
                    onClick={() => {
                      props.onSelectPair(idx);
                      setShowPairMenu(false);
                    }}
                    className={clsx(
                      "w-full text-left px-3 py-2 font-mono text-[0.68rem] hover:bg-[#00d9ff]/10 hover:text-white transition-colors",
                      props.activePairIndex === idx ? "text-[#00d9ff]" : "text-gray-400"
                    )}
                  >
                    {pair.symbolA} / {pair.symbolB}
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border mb-6">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={clsx(
              "px-4 pb-3 font-mono text-[0.68rem] tracking-widest border-b-2 -mb-px transition-all duration-200",
              activeTab === tab
                ? "border-[#00d9ff] text-[#00d9ff]"
                : "border-transparent text-gray-500 hover:text-gray-300"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Panel Content */}
      <div className="min-h-[360px]">
        {activeTab === "SWAP" && (
          <SwapPanel
            {...props}
            onSuccess={(desc: string, hash?: string) => handleSuccess("SWAP", desc, hash)}
          />
        )}
        {activeTab === "ADD LIQ." && (
          <LiquidityPanel
            {...props}
            onSuccess={(desc: string, hash?: string) => handleSuccess("ADD_LIQ", desc, hash)}
          />
        )}
        {activeTab === "REMOVE" && (
          <RemovePanel
            {...props}
            onSuccess={(desc: string, hash?: string) => handleSuccess("REMOVE_LIQ", desc, hash)}
          />
        )}
      </div>

      {/* TX History */}
      <TxHistory records={txHistory} />
    </Card>
  );
}

"use client";

import { clsx } from "clsx";
import { ExternalLink } from "lucide-react";
import type { TxRecord } from "@/types";

interface TxHistoryProps {
  records: TxRecord[];
}

const TYPE_CONFIG: Record<TxRecord["type"], { label: string; color: string }> = {
  SWAP: { label: "SWAP", color: "text-[#00d9ff]" },
  ADD_LIQ: { label: "ADD LIQ", color: "text-emerald-400" },
  REMOVE_LIQ: { label: "REMOVE", color: "text-red-400" },
};

export function TxHistory({ records }: TxHistoryProps) {
  return (
    <div className="mt-6 pt-5 border-t border-border">
      <div className="flex justify-between items-center mb-3">
        <div className="font-mono text-[0.6rem] tracking-[3px] text-gray-600 uppercase">
          TX History
        </div>
        {records.length > 0 && (
          <button 
            onClick={() => {
              localStorage.removeItem("defi_tx_history");
              window.location.reload();
            }}
            className="font-mono text-[0.55rem] text-gray-700 hover:text-red-400 transition-colors uppercase tracking-widest"
          >
            [ Clear ]
          </button>
        )}
      </div>
      {records.length === 0 ? (
        <div className="font-mono text-[0.68rem] text-gray-600 text-center py-5">
          No transactions yet
        </div>
      ) : (
        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
          {records.map((tx) => {
            const cfg = TYPE_CONFIG[tx.type];
            return (
              <div
                key={tx.id}
                className="group flex justify-between items-start py-2.5 border-b border-border/40 animate-slide-up"
              >
                <div className="flex flex-col gap-1">
                  <span className={clsx("font-mono text-[0.62rem] font-bold tracking-wider", cfg.color)}>
                    {cfg.label}
                  </span>
                  <div className="font-mono text-[0.55rem] text-gray-600">
                    {tx.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                <div className="text-right flex flex-col items-end gap-1">
                  <div className="font-mono text-[0.7rem] text-gray-300 leading-tight">
                    {tx.description}
                  </div>
                  {tx.hash && (
                    <a
                      href={`https://sepolia.etherscan.io/tx/${tx.hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 font-mono text-[0.55rem] text-[#00d9ff]/60 hover:text-[#00d9ff] transition-colors"
                    >
                      View on Explorer <ExternalLink size={10} />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

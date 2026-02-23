"use client";

import { Card, CardTitle } from "@/components/ui/Card";
import { fmt } from "@/lib/utils";
import type { PoolState } from "@/types";

interface PoolStatsProps {
  pool: PoolState;
  symbolA: string;
  symbolB: string;
}

export function PoolStats({ pool, symbolA, symbolB }: PoolStatsProps) {
  // Value-based composition (ValueA = ReserveA * Price, ValueB = ReserveB)
  const valA = pool.reserveA * pool.price;
  const valB = pool.reserveB;
  const totalVal = valA + valB;
  
  const pctA = totalVal > 0 ? (valA / totalVal) * 100 : 50;
  const pctB = 100 - pctA;

  return (
    <Card className="p-6">
      <CardTitle>⬡ Pool Status</CardTitle>

      {/* Reserve Stats */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="bg-surface border border-border p-4">
          <div className="font-mono text-[0.6rem] tracking-[2px] text-gray-500 uppercase mb-2">
            Reserve {symbolA}
          </div>
          <div className="font-display font-extrabold text-2xl text-[#00d9ff]">
            {pool.reserveA > 0 ? fmt(pool.reserveA, 2) : "—"}
          </div>
          <div className="font-mono text-[0.65rem] text-gray-600 mt-1">{symbolA}</div>
        </div>
        <div className="bg-surface border border-border p-4">
          <div className="font-mono text-[0.6rem] tracking-[2px] text-gray-500 uppercase mb-2">
            Reserve {symbolB}
          </div>
          <div className="font-display font-extrabold text-2xl text-violet-400">
            {pool.reserveB > 0 ? fmt(pool.reserveB, 2) : "—"}
          </div>
          <div className="font-mono text-[0.65rem] text-gray-600 mt-1">{symbolB}</div>
        </div>
      </div>

      {/* Price Row */}
      <div className="flex items-center justify-between bg-gradient-to-r from-[#00d9ff]/5 to-violet-500/5 border border-[#00d9ff]/25 px-5 py-4 mb-5">
        <div>
          <div className="font-mono text-[0.6rem] tracking-[2px] text-gray-500 uppercase mb-1">
            Current Price
          </div>
          <div className="font-display font-extrabold text-xl text-white">
            1 {symbolA} ={" "}
            <span className="text-[#00d9ff]">
              {pool.price > 0 ? fmt(pool.price, 4) : "—"}
            </span>{" "}
            {symbolB}
          </div>
        </div>
        <div className="text-right">
          <div className="font-mono text-[0.6rem] tracking-[2px] text-gray-500 uppercase mb-1">
            K = x·y
          </div>
          <div className="font-display font-bold text-lg text-violet-400">
            {pool.kValue > 0 ? pool.kValue.toExponential(3) : "—"}
          </div>
        </div>
      </div>

      {/* Pool Bar */}
      <div>
        <div className="font-mono text-[0.6rem] tracking-[2px] text-gray-500 uppercase mb-2">
          Pool Composition
        </div>
        <div className="flex h-8 border border-border overflow-hidden">
          <div
            className="flex items-center justify-center text-[0.62rem] font-mono font-bold text-[#00d9ff] bg-[#00d9ff]/10 transition-all duration-700"
            style={{ width: `${pctA}%` }}
          >
            {pctA.toFixed(0)}%
          </div>
          <div
            className="flex items-center justify-center text-[0.62rem] font-mono font-bold text-violet-400 bg-violet-500/10 transition-all duration-700"
            style={{ width: `${pctB}%` }}
          >
            {pctB.toFixed(0)}%
          </div>
        </div>
        <div className="flex justify-between mt-1.5">
          <span className="font-mono text-[0.6rem] text-[#00d9ff]">{symbolA}</span>
          <span className="font-mono text-[0.6rem] text-violet-400">{symbolB}</span>
        </div>
      </div>

      {/* AMM Formula */}
      <div className="mt-5 bg-[#00d9ff]/3 border border-[#00d9ff]/15 p-4">
        <div className="font-mono text-[0.6rem] tracking-[2px] text-gray-500 uppercase mb-2">
          AMM Formula
        </div>
        <div className="text-center font-mono text-[#00d9ff] text-xl font-bold tracking-wide my-2">
          x · y = k
        </div>
        <div className="font-mono text-[0.65rem] text-gray-500 leading-relaxed">
          Price adjusts automatically as tokens flow in/out. 0.3% fee per swap
          stays in pool for LPs.
        </div>
      </div>
    </Card>
  );
}

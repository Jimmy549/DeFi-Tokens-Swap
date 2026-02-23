"use client";

import { useState } from "react";
import { Card, CardTitle } from "@/components/ui/Card";
import { calcAmountOut, calcPriceImpact, calcImpactColor, fmt } from "@/lib/utils";
import { clsx } from "clsx";

export function FormulaCalculator() {
  const [rA, setRA] = useState("1000");
  const [rB, setRB] = useState("2000");
  const [amtIn, setAmtIn] = useState("10");

  const numRA = parseFloat(rA) || 0;
  const numRB = parseFloat(rB) || 0;
  const numIn = parseFloat(amtIn) || 0;

  const k = numRA * numRB;
  const outNoFee = numIn && numRA ? (numRB * numIn) / (numRA + numIn) : 0;
  const outWithFee = calcAmountOut(numIn, numRA, numRB);
  const impact = calcPriceImpact(numIn, numRA, numRB);
  const newA = numRA + numIn;
  const newB = numRB - outWithFee;

  const inputCls =
    "w-full bg-bg border border-border px-3 py-2 font-mono text-[0.75rem] text-white outline-none focus:border-[#00d9ff] transition-colors placeholder-gray-700";

  return (
    <Card className="p-6">
      <CardTitle>📐 Live AMM Calculator</CardTitle>

      {/* Formula display */}
      <div className="bg-[#00d9ff]/3 border border-[#00d9ff]/15 p-4 mb-5">
        <div className="font-mono text-[0.6rem] tracking-[2px] text-gray-500 uppercase mb-2">
          With 0.3% Fee
        </div>
        <div className="font-mono text-[0.68rem] text-gray-400 leading-[2.2] bg-bg/50 p-3">
          out = (
          <span className="text-violet-400">reserveB</span> ×{" "}
          <span className="text-[#00d9ff]">amtIn</span> × 997)<br />
          &nbsp;&nbsp;&nbsp;&nbsp; ÷ (<span className="text-violet-400">reserveA</span> × 1000
          {" "}+ <span className="text-[#00d9ff]">amtIn</span> × 997)
        </div>
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <div className="font-mono text-[0.58rem] tracking-widest text-gray-600 uppercase mb-1.5">
            Reserve A
          </div>
          <input className={inputCls} value={rA} onChange={(e) => setRA(e.target.value)} placeholder="1000" />
        </div>
        <div>
          <div className="font-mono text-[0.58rem] tracking-widest text-gray-600 uppercase mb-1.5">
            Reserve B
          </div>
          <input className={inputCls} value={rB} onChange={(e) => setRB(e.target.value)} placeholder="2000" />
        </div>
      </div>
      <div className="mb-4">
        <div className="font-mono text-[0.58rem] tracking-widest text-gray-600 uppercase mb-1.5">
          Amount A In
        </div>
        <input className={inputCls} value={amtIn} onChange={(e) => setAmtIn(e.target.value)} placeholder="10" />
      </div>

      {/* Results */}
      {numIn > 0 && numRA > 0 && numRB > 0 ? (
        <div className="space-y-2 bg-bg border border-border p-4">
          <div className="flex justify-between font-mono text-[0.7rem]">
            <span className="text-gray-500">k = {numRA} × {numRB}</span>
            <span className="text-violet-400 font-bold">{k.toLocaleString()}</span>
          </div>
          <div className="flex justify-between font-mono text-[0.7rem]">
            <span className="text-gray-500">Out (no fee)</span>
            <span className="text-amber-400">{fmt(outNoFee, 4)}</span>
          </div>
          <div className="flex justify-between font-mono text-[0.7rem]">
            <span className="text-gray-500">Out (0.3% fee)</span>
            <span className="text-[#00d9ff] font-bold">{fmt(outWithFee, 4)}</span>
          </div>
          <div className="flex justify-between font-mono text-[0.7rem]">
            <span className="text-gray-500">Price Impact</span>
            <span className={clsx("font-bold", calcImpactColor(impact))}>
              {impact.toFixed(2)}%
            </span>
          </div>
          <div className="h-px bg-border" />
          <div className="font-mono text-[0.62rem] text-gray-600">
            Pool after: {fmt(newA, 2)} A / {fmt(newB, 2)} B
          </div>
        </div>
      ) : (
        <div className="bg-bg border border-border p-4 font-mono text-[0.7rem] text-gray-600 text-center">
          Enter values to calculate
        </div>
      )}
    </Card>
  );
}

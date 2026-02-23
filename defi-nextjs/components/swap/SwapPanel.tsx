"use client";

import { useState, useCallback } from "react";
import { ArrowUpDown } from "lucide-react";
import { ethers } from "ethers";
import { TokenInput } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { calcAmountOut, calcPriceImpact, toWei, fmt, calcImpactColor } from "@/lib/utils";
import { SLIPPAGE_OPTIONS } from "@/lib/constants";
import type { PoolState, UserState } from "@/types";
import { clsx } from "clsx";

interface SwapPanelProps {
  pool: PoolState;
  user: UserState;
  symbolA: string;
  symbolB: string;
  tokenAContract: ethers.Contract | null;
  tokenBContract: ethers.Contract | null;
  swapContract: ethers.Contract | null;
  onSuccess: (description: string, hash?: string) => void;
  onNotify: (msg: string, type?: "success" | "error" | "warn" | "info") => void;
}

export function SwapPanel({
  pool,
  user,
  symbolA,
  symbolB,
  tokenAContract,
  tokenBContract,
  swapContract,
  onSuccess,
  onNotify,
}: SwapPanelProps) {
  const [amountIn, setAmountIn] = useState("");
  const [isAtoB, setIsAtoB] = useState(true);
  const [slippage, setSlippage] = useState(0.5);
  const [loading, setLoading] = useState(false);

  const reserveIn = isAtoB ? pool.reserveA : pool.reserveB;
  const reserveOut = isAtoB ? pool.reserveB : pool.reserveA;
  const balIn = isAtoB ? user.balanceA : user.balanceB;

  const numAmountIn = parseFloat(amountIn) || 0;
  const amountOut = calcAmountOut(numAmountIn, reserveIn, reserveOut);
  const priceImpact = calcPriceImpact(numAmountIn, reserveIn, reserveOut);
  const fee = numAmountIn * 0.003;
  const minOut = amountOut * (1 - slippage / 100);
  const hasPreview = numAmountIn > 0 && pool.reserveA > 0;

  const flipDirection = () => {
    setIsAtoB((prev) => !prev);
    setAmountIn("");
  };

  const executeSwap = useCallback(async () => {
    if (!swapContract || !numAmountIn) return;
    const token = isAtoB ? tokenAContract : tokenBContract;
    if (!token) return;

    setLoading(true);
    try {
      const amtInWei = toWei(amountIn);
      const minOutStr = minOut.toFixed(18);
      const minOutWei = toWei(minOutStr);
      
      const swapAddr = swapContract.target;
      onNotify(`Approving ${isAtoB ? symbolA : symbolB}...`, "info");
      const approveTx = await token.approve(swapAddr, amtInWei);
      await approveTx.wait();

      onNotify("Executing swap...", "info");
      const swapTx = isAtoB
        ? await swapContract.swapAforB(amtInWei, minOutWei)
        : await swapContract.swapBforA(amtInWei, minOutWei);
      const receipt = await swapTx.wait();

      const desc = `${fmt(numAmountIn)} ${isAtoB ? symbolA : symbolB} → ${fmt(amountOut)} ${isAtoB ? symbolB : symbolA}`;
      onNotify(`✓ ${desc}`, "success");
      
      setAmountIn("");
      onSuccess(desc, receipt.hash);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Swap failed";
      onNotify(msg.length > 80 ? msg.slice(0, 80) + "..." : msg, "error");
    } finally {
      setLoading(false);
    }
  }, [swapContract, tokenAContract, tokenBContract, isAtoB, numAmountIn, minOut, amountOut, symbolA, symbolB, onNotify, onSuccess]);

  return (
    <div className="space-y-4">
      {/* Pay */}
      <TokenInput
        label="You Pay"
        badge={isAtoB ? symbolA : symbolB}
        badgeColor={isAtoB ? "accent" : "violet"}
        balance={balIn}
        onMax={() => setAmountIn(balIn.toString())}
        value={amountIn}
        onChange={(e) => setAmountIn(e.target.value)}
        placeholder="0.0"
      />

      {/* Flip Arrow */}
      <div className="flex justify-center">
        <button
          onClick={flipDirection}
          className="w-10 h-10 border border-border bg-surface hover:border-[#00d9ff] hover:text-[#00d9ff] text-gray-500 flex items-center justify-center transition-all duration-200 hover:rotate-180"
        >
          <ArrowUpDown size={16} />
        </button>
      </div>

      {/* Receive */}
      <TokenInput
        label="You Receive"
        badge={isAtoB ? symbolB : symbolA}
        badgeColor={isAtoB ? "violet" : "accent"}
        value={hasPreview ? fmt(amountOut) : ""}
        readOnly
        placeholder="0.0"
        className="cursor-default opacity-70"
      />

      {/* Slippage */}
      <div>
        <div className="font-mono text-[0.62rem] tracking-[2px] text-gray-500 uppercase mb-2">
          Slippage Tolerance
        </div>
        <div className="flex gap-2">
          {SLIPPAGE_OPTIONS.map((s) => (
            <button
              key={s}
              onClick={() => setSlippage(s)}
              className={clsx(
                "flex-1 py-2 font-mono text-[0.68rem] border transition-all duration-150",
                slippage === s
                  ? "border-[#00d9ff] text-[#00d9ff] bg-[#00d9ff]/5"
                  : "border-border text-gray-500 hover:border-[#00d9ff]/50 hover:text-gray-300"
              )}
            >
              {s}%
            </button>
          ))}
        </div>
      </div>

      {/* Preview */}
      {hasPreview && (
        <div className="bg-surface border border-border p-4 space-y-2 animate-fade-in">
          <div className="flex justify-between font-mono text-[0.72rem]">
            <span className="text-gray-500">Amount Out</span>
            <span className="text-[#00d9ff] font-bold">
              {fmt(amountOut)} {isAtoB ? symbolB : symbolA}
            </span>
          </div>
          <div className="flex justify-between font-mono text-[0.72rem]">
            <span className="text-gray-500">Price Impact</span>
            <span className={clsx("font-bold", calcImpactColor(priceImpact))}>
              {priceImpact.toFixed(2)}%
            </span>
          </div>
          <div className="flex justify-between font-mono text-[0.72rem]">
            <span className="text-gray-500">Swap Fee (0.3%)</span>
            <span className="text-gray-300">
              {fmt(fee)} {isAtoB ? symbolA : symbolB}
            </span>
          </div>
          <div className="h-px bg-border" />
          <div className="flex justify-between font-mono text-[0.72rem]">
            <span className="text-gray-500">Min. Received ({slippage}% slip)</span>
            <span className="text-gray-300">
              {fmt(minOut)} {isAtoB ? symbolB : symbolA}
            </span>
          </div>
        </div>
      )}

      <Button
        variant="primary"
        size="lg"
        loading={loading}
        disabled={!numAmountIn || !swapContract || pool.reserveA === 0}
        onClick={executeSwap}
      >
        [ Execute Swap ]
      </Button>
    </div>
  );
}
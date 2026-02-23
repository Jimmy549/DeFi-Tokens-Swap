"use client";

import { useState, useCallback } from "react";
import { ethers } from "ethers";
import { TokenInput } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { calcLPShares, toWei, fmt } from "@/lib/utils";
import type { PoolState, UserState } from "@/types";

interface LiquidityPanelProps {
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

export function LiquidityPanel({
  pool,
  user,
  symbolA,
  symbolB,
  tokenAContract,
  tokenBContract,
  swapContract,
  onSuccess,
  onNotify,
}: LiquidityPanelProps) {
  const [amtA, setAmtA] = useState("");
  const [amtB, setAmtB] = useState("");
  const [loading, setLoading] = useState(false);

  const numA = parseFloat(amtA) || 0;
  const numB = parseFloat(amtB) || 0;

  const estimatedShares =
    numA > 0 && numB > 0
      ? calcLPShares(numA, numB, pool.reserveA, pool.reserveB, pool.totalLPShares)
      : 0;

  const newTotal = pool.totalLPShares + estimatedShares;
  const sharePercent = newTotal > 0 ? (estimatedShares / newTotal) * 100 : 0;
  const newK = (pool.reserveA + numA) * (pool.reserveB + numB);

  const handleAmtAChange = (value: string) => {
    setAmtA(value);
    const num = parseFloat(value);
    if (num > 0 && pool.reserveA > 0) {
      const price = pool.reserveB / pool.reserveA;
      setAmtB((num * price).toFixed(6));
    }
  };

  const handleAmtBChange = (value: string) => {
    setAmtB(value);
    const num = parseFloat(value);
    if (num > 0 && pool.reserveB > 0) {
      const price = pool.reserveA / pool.reserveB;
      setAmtA((num * price).toFixed(6));
    }
  };

  const addLiquidity = useCallback(async () => {
    if (!swapContract || !tokenAContract || !tokenBContract || !numA || !numB) return;
    setLoading(true);
    try {
      const waA = toWei(amtA);
      const waB = toWei(amtB);
      const swapAddr = swapContract.target;

      onNotify(`Approving ${symbolA}...`, "info");
      const txA = await tokenAContract.approve(swapAddr, waA);
      await txA.wait();

      onNotify(`Approving ${symbolB}...`, "info");
      const txB = await tokenBContract.approve(swapAddr, waB);
      await txB.wait();

      onNotify("Adding liquidity...", "info");
      const tx = await swapContract.addLiquidity(waA, waB);
      const receipt = await tx.wait();

      const desc = `Added ${fmt(numA)} ${symbolA} + ${fmt(numB)} ${symbolB}`;
      onNotify(`✓ ${desc}`, "success");
      
      setAmtA("");
      setAmtB("");
      onSuccess(desc, receipt.hash);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed";
      onNotify(msg.length > 80 ? msg.slice(0, 80) + "..." : msg, "error");
    } finally {
      setLoading(false);
    }
  }, [swapContract, tokenAContract, tokenBContract, amtA, amtB, numA, numB, symbolA, symbolB, onNotify, onSuccess]);

  return (
    <div className="space-y-4">
      <p className="font-mono text-[0.7rem] text-gray-500 leading-relaxed">
        Deposit both tokens to earn <span className="text-[#00d9ff]">0.3% fee</span> on every
        swap. Receive LP shares proportional to your contribution.
      </p>

      <TokenInput
        label={`Amount ${symbolA}`}
        badge={symbolA}
        badgeColor="accent"
        balance={user.balanceA}
        onMax={() => handleAmtAChange(user.balanceA.toString())}
        value={amtA}
        onChange={(e) => handleAmtAChange(e.target.value)}
        placeholder="0.0"
      />

      <TokenInput
        label={`Amount ${symbolB}`}
        badge={symbolB}
        badgeColor="violet"
        balance={user.balanceB}
        onMax={() => handleAmtBChange(user.balanceB.toString())}
        value={amtB}
        onChange={(e) => handleAmtBChange(e.target.value)}
        placeholder="0.0"
      />

      {estimatedShares > 0 && (
        <div className="bg-surface border border-border p-4 space-y-2 animate-fade-in">
          <div className="flex justify-between font-mono text-[0.72rem]">
            <span className="text-gray-500">LP Shares Minted</span>
            <span className="text-[#00d9ff] font-bold">{fmt(estimatedShares, 6)}</span>
          </div>
          <div className="flex justify-between font-mono text-[0.72rem]">
            <span className="text-gray-500">Your Pool Share</span>
            <span className="text-emerald-400 font-bold">{sharePercent.toFixed(2)}%</span>
          </div>
          <div className="flex justify-between font-mono text-[0.72rem]">
            <span className="text-gray-500">K After Deposit</span>
            <span className="text-violet-400">{newK.toExponential(3)}</span>
          </div>
        </div>
      )}

      <Button
        variant="secondary"
        size="lg"
        loading={loading}
        disabled={!numA || !numB || !swapContract}
        onClick={addLiquidity}
      >
        [ Add Liquidity ]
      </Button>

      {/* Your Position */}
      {user.lpShares > 0 && (
        <div className="border border-violet-500/30 p-4 bg-violet-500/3">
          <div className="font-mono text-[0.6rem] tracking-[2px] text-violet-400 uppercase mb-3">
            Your Position
          </div>
          <div className="space-y-2">
            {[
              ["LP Shares", fmt(user.lpShares, 6)],
              ["Pool Share", user.lpSharePct.toFixed(2) + "%"],
              [`${symbolA} Value`, fmt(user.lpTokenAValue, 4)],
              [`${symbolB} Value`, fmt(user.lpTokenBValue, 4)],
            ].map(([label, value]) => (
              <div
                key={label}
                className="flex justify-between font-mono text-[0.72rem] border-b border-border/50 pb-2 last:border-0 last:pb-0"
              >
                <span className="text-gray-500">{label}</span>
                <span className="text-white font-bold">{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

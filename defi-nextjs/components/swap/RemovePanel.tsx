"use client";

import { useState, useCallback } from "react";
import { ethers } from "ethers";
import { TokenInput } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { toWei, fmt } from "@/lib/utils";
import type { PoolState, UserState } from "@/types";

interface RemovePanelProps {
  pool: PoolState;
  user: UserState;
  symbolA: string;
  symbolB: string;
  swapContract: ethers.Contract | null;
  onSuccess: (description: string, hash?: string) => void;
  onNotify: (msg: string, type?: "success" | "error" | "warn" | "info") => void;
}

export function RemovePanel({
  pool,
  user,
  symbolA,
  symbolB,
  swapContract,
  onSuccess,
  onNotify,
}: RemovePanelProps) {
  const [shares, setShares] = useState("");
  const [loading, setLoading] = useState(false);

  const numShares = parseFloat(shares) || 0;
  const returnA =
    pool.totalLPShares > 0 ? (numShares / pool.totalLPShares) * pool.reserveA : 0;
  const returnB =
    pool.totalLPShares > 0 ? (numShares / pool.totalLPShares) * pool.reserveB : 0;

  const removeLiquidity = useCallback(async () => {
    if (!swapContract || !numShares) return;
    setLoading(true);
    try {
      onNotify("Removing liquidity...", "info");
      const tx = await swapContract.removeLiquidity(toWei(numShares));
      const receipt = await tx.wait();

      const desc = `Removed ${fmt(returnA)} ${symbolA} + ${fmt(returnB)} ${symbolB}`;
      onNotify(`✓ ${desc}`, "success");
      
      setShares("");
      onSuccess(desc, receipt.hash);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed";
      onNotify(msg.length > 80 ? msg.slice(0, 80) + "..." : msg, "error");
    } finally {
      setLoading(false);
    }
  }, [swapContract, numShares, returnA, returnB, symbolA, symbolB, onNotify, onSuccess]);

  return (
    <div className="space-y-4">
      <p className="font-mono text-[0.7rem] text-gray-500 leading-relaxed">
        Burn LP shares to reclaim your proportional tokens — including any{" "}
        <span className="text-emerald-400">accumulated fees</span>.
      </p>

      <TokenInput
        label="LP Shares to Burn"
        badge="LP SHARES"
        badgeColor="accent"
        balance={user.lpShares}
        onMax={() => setShares(user.lpShares.toString())}
        value={shares}
        onChange={(e) => setShares(e.target.value)}
        placeholder="0.0"
      />

      {numShares > 0 && pool.totalLPShares > 0 && (
        <div className="bg-surface border border-red-500/20 p-4 space-y-2 animate-fade-in">
          <div className="font-mono text-[0.6rem] tracking-[2px] text-red-400 uppercase mb-2">
            You Will Receive
          </div>
          <div className="flex justify-between font-mono text-[0.72rem]">
            <span className="text-gray-500">{symbolA} Return</span>
            <span className="text-[#00d9ff] font-bold">{fmt(returnA, 6)}</span>
          </div>
          <div className="flex justify-between font-mono text-[0.72rem]">
            <span className="text-gray-500">{symbolB} Return</span>
            <span className="text-violet-400 font-bold">{fmt(returnB, 6)}</span>
          </div>
          <div className="h-px bg-border" />
          <div className="flex justify-between font-mono text-[0.72rem]">
            <span className="text-gray-500">Share Burned</span>
            <span className="text-red-400">
              {pool.totalLPShares > 0
                ? ((numShares / pool.totalLPShares) * 100).toFixed(2)
                : 0}
              %
            </span>
          </div>
        </div>
      )}

      <Button
        variant="danger"
        size="lg"
        loading={loading}
        disabled={!numShares || !swapContract || user.lpShares === 0}
        onClick={removeLiquidity}
      >
        [ Remove Liquidity ]
      </Button>
    </div>
  );
}

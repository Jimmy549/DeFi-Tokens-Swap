"use client";

import { useCallback, useRef, useState, useEffect } from "react";
import { useWallet } from "@/hooks/useWallet";
import { useContracts } from "@/hooks/useContracts";
import { useNotifications } from "@/hooks/useNotifications";
import { Header } from "@/components/layout/Header";
import { PoolStats } from "@/components/pool/PoolStats";
import { SetupPanel } from "@/components/pool/SetupPanel";
import { FormulaCalculator } from "@/components/pool/FormulaCalculator";
import { QuickRef } from "@/components/pool/QuickRef";
import { TradeCard } from "@/components/swap/TradeCard";
import { NotificationStack } from "@/components/ui/Notification";
import type { ContractAddresses, SavedPair } from "@/types";

export default function Home() {
  const { wallet, connecting, connect, disconnect, shortAddress, error } = useWallet();
  const { contracts, pool, userInfo, loadContracts, refreshPool } = useContracts(wallet.signer);
  const { notifications, notify, dismiss } = useNotifications();

  const [savedPairs, setSavedPairs] = useState<SavedPair[]>([]);
  const [activePairIndex, setActivePairIndex] = useState<number | null>(null);

  const contractsRef = useRef(contracts);
  contractsRef.current = contracts;

  const handleConnect = useCallback(async () => {
    const success = await connect();
    if (!success && error) {
      notify(error, "error");
    }
  }, [connect, error, notify]);

  // Load saved pairs from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("defi_simpleswap_pairs");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setSavedPairs(parsed);
      } catch (e) {
        console.error("Failed to parse saved pairs", e);
      }
    }
  }, []);

  const handleLoad = useCallback(
    async (addresses: ContractAddresses) => {
      const { tokenA, tokenB, swap } = await loadContracts(addresses);
      const symA = await tokenA.symbol();
      const symB = await tokenB.symbol();
      
      await refreshPool(tokenA, tokenB, swap, wallet.address);

      // Save to pairs list if new
      setSavedPairs(prev => {
        const exists = prev.findIndex(p => p.swap.toLowerCase() === addresses.swap.toLowerCase());
        let newList;
        if (exists >= 0) {
          newList = [...prev];
          newList[exists] = { ...addresses, symbolA: symA, symbolB: symB };
          setActivePairIndex(exists);
        } else {
          newList = [...prev, { ...addresses, symbolA: symA, symbolB: symB }];
          setActivePairIndex(newList.length - 1);
        }
        localStorage.setItem("defi_simpleswap_pairs", JSON.stringify(newList));
        return newList;
      });
    },
    [loadContracts, refreshPool, wallet.address]
  );

  // Auto-load contracts when wallet connects
  useEffect(() => {
    if (wallet.connected && !contracts.loaded) {
      const last = localStorage.getItem("defi_last_addrs");
      if (last) {
        try {
          handleLoad(JSON.parse(last));
        } catch (e) {}
      }
    }
  }, [wallet.connected, contracts.loaded, handleLoad]);

  const handleSelectPair = useCallback(async (index: number) => {
    const pair = savedPairs[index];
    if (!pair) return;
    setActivePairIndex(index);
    await handleLoad({ tokenA: pair.tokenA, tokenB: pair.tokenB, swap: pair.swap });
  }, [savedPairs, handleLoad]);

  const handleRefresh = useCallback(async () => {
    const { tokenA, tokenB, swap } = contractsRef.current;
    if (tokenA && tokenB && swap) {
      await refreshPool(tokenA, tokenB, swap, wallet.address);
    }
  }, [refreshPool, wallet.address]);

  return (
    <div className="relative min-h-screen">
      {/* Ambient orbs */}
      <div
        className="fixed top-0 right-0 w-[500px] h-[500px] rounded-full pointer-events-none z-0"
        style={{
          background: "radial-gradient(circle, rgba(0,217,255,0.06) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />
      <div
        className="fixed bottom-0 left-0 w-[400px] h-[400px] rounded-full pointer-events-none z-0"
        style={{
          background: "radial-gradient(circle, rgba(139,92,246,0.07) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />

      {/* Header */}
      <Header
        connected={wallet.connected}
        address={wallet.address}
        network={wallet.network}
        blockNumber={wallet.blockNumber}
        connecting={connecting}
        onConnect={handleConnect}
        onDisconnect={disconnect}
      />

      {/* Notifications */}
      <NotificationStack notifications={notifications} onDismiss={dismiss} />

      {/* Main Content */}
      <main className="relative z-10 max-w-[1120px] mx-auto px-4 py-8">
        {/* Hero text */}
        <div className="mb-8 animate-slide-up">
          <h1 className="font-display font-extrabold text-3xl md:text-4xl tracking-tight">
            <span className="text-[#00d9ff]">Decentralized</span>{" "}
            <span className="text-white">Exchange</span>
          </h1>
          <p className="font-mono text-[0.72rem] text-gray-500 mt-2 tracking-wide">
            AMM-powered token swaps · Constant product formula · 0.3% LP fees
          </p>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
          {/* Left Column */}
          <div className="flex flex-col gap-6">
            <div className="animate-slide-up" style={{ animationDelay: "0.05s" }}>
              <PoolStats
                pool={pool}
                symbolA={contracts.symbolA}
                symbolB={contracts.symbolB}
              />
            </div>
            <div className="animate-slide-up" style={{ animationDelay: "0.1s" }}>
              <TradeCard
                pool={pool}
                user={userInfo}
                symbolA={contracts.symbolA}
                symbolB={contracts.symbolB}
                tokenAContract={contracts.tokenA}
                tokenBContract={contracts.tokenB}
                swapContract={contracts.swap}
                onSuccess={handleRefresh}
                onNotify={notify}
                savedPairs={savedPairs}
                activePairIndex={activePairIndex}
                onSelectPair={handleSelectPair}
              />
            </div>
          </div>

          {/* Right Column */}
          <div className="flex flex-col gap-6">
            <div className="animate-slide-up" style={{ animationDelay: "0.15s" }}>
              <SetupPanel
                network={wallet.network}
                blockNumber={wallet.blockNumber}
                connected={wallet.connected}
                onLoad={handleLoad}
                savedPairs={savedPairs}
                activePairIndex={activePairIndex}
                onSelectPair={handleSelectPair}
              />
            </div>
            <div className="animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <FormulaCalculator />
            </div>
            <div className="animate-slide-up" style={{ animationDelay: "0.25s" }}>
              <QuickRef />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-border text-center font-mono text-[0.62rem] text-gray-700 tracking-widest">
          SIMPLESWAP DEX · DEFI LEARNING LAB · x·y=k AMM
        </div>
      </main>
    </div>
  );
}

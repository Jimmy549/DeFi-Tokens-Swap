"use client";

import { useState, useCallback } from "react";
import { ethers } from "ethers";
import { ERC20_ABI, SWAP_ABI } from "@/lib/constants";
import { fromWei } from "@/lib/utils";
import type { PoolState, UserState, ContractAddresses } from "@/types";

interface ContractState {
  tokenA: ethers.Contract | null;
  tokenB: ethers.Contract | null;
  swap: ethers.Contract | null;
  symbolA: string;
  symbolB: string;
  loaded: boolean;
}

export function useContracts(signer: ethers.Signer | null) {
  const [contracts, setContracts] = useState<ContractState>({
    tokenA: null,
    tokenB: null,
    swap: null,
    symbolA: "TKA",
    symbolB: "TKB",
    loaded: false,
  });

  const [pool, setPool] = useState<PoolState>({
    reserveA: 0,
    reserveB: 0,
    totalLPShares: 0,
    price: 0,
    kValue: 0,
  });

  const [userInfo, setUserInfo] = useState<UserState>({
    address: "",
    balanceA: 0,
    balanceB: 0,
    lpShares: 0,
    lpSharePct: 0,
    lpTokenAValue: 0,
    lpTokenBValue: 0,
  });

  const [loading, setLoading] = useState(false);

  const loadContracts = useCallback(
    async (addresses: ContractAddresses) => {
      if (!signer) throw new Error("Wallet not connected");
      setLoading(true);
      try {
        const tokenA = new ethers.Contract(addresses.tokenA, ERC20_ABI, signer);
        const tokenB = new ethers.Contract(addresses.tokenB, ERC20_ABI, signer);
        const swap = new ethers.Contract(addresses.swap, SWAP_ABI, signer);

        const [symA, symB] = await Promise.all([tokenA.symbol(), tokenB.symbol()]);

        setContracts({ tokenA, tokenB, swap, symbolA: symA, symbolB: symB, loaded: true });
        return { tokenA, tokenB, swap };
      } finally {
        setLoading(false);
      }
    },
    [signer]
  );

  const refreshPool = useCallback(
    async (
      tokenA: ethers.Contract,
      tokenB: ethers.Contract,
      swap: ethers.Contract,
      userAddress: string
    ) => {
      const [[rA, rB], totalShares, priceRaw] = await Promise.all([
        swap.getReserves(),
        swap.totalLPShares(),
        swap.getPrice(),
      ]);

      const ra = fromWei(rA);
      const rb = fromWei(rB);
      const ts = fromWei(totalShares);
      const price = ra > 0 ? rb / ra : 0;

      setPool({
        reserveA: ra,
        reserveB: rb,
        totalLPShares: ts,
        price,
        kValue: ra * rb,
      });

      if (userAddress) {
        const [balA, balB, lpInfo] = await Promise.all([
          tokenA.balanceOf(userAddress),
          tokenB.balanceOf(userAddress),
          swap.getLPInfo(userAddress),
        ]);

        setUserInfo({
          address: userAddress,
          balanceA: fromWei(balA),
          balanceB: fromWei(balB),
          lpShares: fromWei(lpInfo[0]),
          lpSharePct: Number(lpInfo[1]) / 100,
          lpTokenAValue: fromWei(lpInfo[2]),
          lpTokenBValue: fromWei(lpInfo[3]),
        });
      }
    },
    []
  );

  return { contracts, pool, userInfo, loading, loadContracts, refreshPool };
}

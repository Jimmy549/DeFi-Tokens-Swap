import { ethers } from "ethers";
import { DECIMALS } from "./constants";

export const toWei = (value: string | number): bigint => {
  const s = typeof value === "string" ? value : value.toFixed(18);
  // Ensure no more than 18 decimals to avoid parseUnits error
  const parts = s.split(".");
  if (parts.length > 1 && parts[1].length > 18) {
    return ethers.parseUnits(parts[0] + "." + parts[1].slice(0, 18), 18);
  }
  return ethers.parseUnits(s, 18);
};

export const fromWei = (value: any): number => {
  return parseFloat(ethers.formatUnits(value, DECIMALS));
};

export const fmt = (value: number, decimals = 4): string => {
  if (value === 0) return "0";
  if (value < 0.0001) return value.toExponential(2);
  return value.toFixed(decimals);
};

export const fmtAddress = (address: string): string => {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const calcImpactColor = (impact: number): string => {
  if (impact > 5) return "text-red-400";
  if (impact > 2) return "text-amber-400";
  return "text-emerald-400";
};

export const calcAmountOut = (
  amountIn: number,
  reserveIn: number,
  reserveOut: number
): number => {
  if (!amountIn || !reserveIn || !reserveOut) return 0;
  const amountInWithFee = amountIn * 997;
  const numerator = amountInWithFee * reserveOut;
  const denominator = reserveIn * 1000 + amountInWithFee;
  return numerator / denominator;
};

export const calcPriceImpact = (
  amountIn: number,
  reserveIn: number,
  reserveOut: number
): number => {
  const amountOut = calcAmountOut(amountIn, reserveIn, reserveOut);
  const idealOut = (amountIn * reserveOut) / reserveIn;
  if (!idealOut) return 0;
  return ((idealOut - amountOut) / idealOut) * 100;
};

export const calcLPShares = (
  amountA: number,
  amountB: number,
  reserveA: number,
  reserveB: number,
  totalShares: number
): number => {
  if (totalShares === 0) return Math.sqrt(amountA * amountB);
  const shareA = (amountA / reserveA) * totalShares;
  const shareB = (amountB / reserveB) * totalShares;
  return Math.min(shareA, shareB);
};

export const isValidAddress = (address: string): boolean => {
  try {
    ethers.getAddress(address);
    return true;
  } catch {
    return false;
  }
};

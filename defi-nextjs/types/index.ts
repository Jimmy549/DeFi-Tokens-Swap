export interface PoolState {
  reserveA: number;
  reserveB: number;
  totalLPShares: number;
  price: number;
  kValue: number;
}

export interface UserState {
  address: string;
  balanceA: number;
  balanceB: number;
  lpShares: number;
  lpSharePct: number;
  lpTokenAValue: number;
  lpTokenBValue: number;
}

export interface SwapPreview {
  amountOut: number;
  priceImpact: number;
  fee: number;
  minReceived: number;
}

export interface TxRecord {
  id: number;
  type: "SWAP" | "ADD_LIQ" | "REMOVE_LIQ";
  description: string;
  timestamp: Date;
  hash?: string;
}

export interface ContractAddresses {
  tokenA: string;
  tokenB: string;
  swap: string;
}

export interface SavedPair extends ContractAddresses {
  symbolA: string;
  symbolB: string;
}

export type Notification = {
  id: number;
  message: string;
  type: "success" | "error" | "warn" | "info";
};

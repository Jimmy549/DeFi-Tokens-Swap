"use client";

import { useState, useCallback, useEffect } from "react";
import { ethers } from "ethers";
import { SUPPORTED_NETWORKS } from "@/lib/constants";
import { fmtAddress } from "@/lib/utils";

interface WalletState {
  provider: ethers.BrowserProvider | null;
  signer: ethers.Signer | null;
  address: string;
  network: string;
  chainId: number;
  blockNumber: number;
  connected: boolean;
}

export function useWallet() {
  const [wallet, setWallet] = useState<WalletState>({
    provider: null,
    signer: null,
    address: "",
    network: "",
    chainId: 0,
    blockNumber: 0,
    connected: false,
  });
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState("");

  const connect = useCallback(async (isAuto = false) => {
    try {
      if (typeof window === "undefined") return false;
      
      if (!window.ethereum) {
        if (!isAuto) setError("MetaMask not installed. Please install MetaMask extension.");
        return false;
      }
    
      if (!isAuto) setConnecting(true);
      setError("");
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      
      // If auto-connecting, check if we already have permission
      if (isAuto) {
        const accounts = await provider.listAccounts();
        if (accounts.length === 0) return false;
      } else {
        await provider.send("eth_requestAccounts", []);
      }

      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const network = await provider.getNetwork();
      const blockNumber = await provider.getBlockNumber();

      setWallet({
        provider,
        signer,
        address,
        network: SUPPORTED_NETWORKS[Number(network.chainId)] ?? `Chain ${network.chainId}`,
        chainId: Number(network.chainId),
        blockNumber,
        connected: true,
      });

      localStorage.setItem("defi_wallet_connected", "true");
      return true;
    } catch (e: unknown) {
      if (!isAuto) {
        let msg = "Connection failed";
        if (e instanceof Error) {
          if (e.message.includes("user rejected")) {
            msg = "Connection rejected by user";
          } else if (e.message.includes("already pending")) {
            msg = "Connection request already pending";
          } else {
            msg = e.message;
          }
        }
        setError(msg);
      }
      return false;
    } finally {
      setConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setWallet({
      provider: null,
      signer: null,
      address: "",
      network: "",
      chainId: 0,
      blockNumber: 0,
      connected: false,
    });
    localStorage.removeItem("defi_wallet_connected");
  }, []);

  // Auto-connect on mount
  useEffect(() => {
    const wasConnected = localStorage.getItem("defi_wallet_connected") === "true";
    if (wasConnected && typeof window !== "undefined") {
      const timer = setTimeout(() => {
        connect(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, []);

  // Block listener cleanup and setup
  useEffect(() => {
    if (!wallet.provider || !wallet.connected) return;

    const provider = wallet.provider;
    const handleBlock = (bn: number) => {
      setWallet((prev) => ({ ...prev, blockNumber: bn }));
    };

    provider.on("block", handleBlock);
    
    return () => {
      provider.off("block", handleBlock);
    };
  }, [wallet.provider, wallet.connected]);

  // Handle account/network changes
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    const ethereum = window.ethereum;
    if (!ethereum) return;

    const handleAccountsChanged = (...args: unknown[]) => {
      const accounts = args[0] as string[];
      if (accounts.length === 0) {
        disconnect();
      } else {
        connect(true); 
      }
    };
    const handleChainChanged = () => {
      window.location.reload();
    };

    ethereum.on("accountsChanged", handleAccountsChanged);
    ethereum.on("chainChanged", handleChainChanged);
    
    return () => {
      ethereum.removeListener("accountsChanged", handleAccountsChanged);
      ethereum.removeListener("chainChanged", handleChainChanged);
    };
  }, [disconnect, connect]);

  return {
    wallet,
    connecting,
    error,
    connect,
    disconnect,
    shortAddress: fmtAddress(wallet.address),
  };
}

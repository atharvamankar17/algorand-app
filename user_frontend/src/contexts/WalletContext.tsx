import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { setWalletAddressGetter } from "@/services/api";
import {
  clearStoredWallet,
  connectPeraWallet,
  disconnectPeraWallet,
  getStoredWalletAddress,
  getStoredWalletProvider,
  isValidAlgorandAddress,
  persistWallet,
  reconnectPeraWallet,
  type WalletProviderType,
} from "@/services/wallet";

interface WalletContextValue {
  walletAddress: string | null;
  walletProvider: WalletProviderType | null;
  isConnecting: boolean;
  connectWithPera: () => Promise<string>;
  connectWithManual: (address: string) => string;
  disconnect: () => Promise<void>;
}

const WalletContext = createContext<WalletContextValue | undefined>(undefined);

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [walletAddress, setWalletAddress] = useState<string | null>(getStoredWalletAddress());
  const [walletProvider, setWalletProvider] = useState<WalletProviderType | null>(getStoredWalletProvider());
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    setWalletAddressGetter(() => walletAddress);
  }, [walletAddress]);

  useEffect(() => {
    const tryReconnect = async () => {
      if (walletProvider !== "pera") return;

      try {
        const account = await reconnectPeraWallet();
        if (!account) return;
        setWalletAddress(account);
        persistWallet(account, "pera");
      } catch {
        clearStoredWallet();
        setWalletAddress(null);
        setWalletProvider(null);
      }
    };

    void tryReconnect();
  }, [walletProvider]);

  const connectWithPera = useCallback(async () => {
    setIsConnecting(true);

    try {
      const account = await connectPeraWallet();
      if (!account) throw new Error("No account returned by wallet.");

      setWalletAddress(account);
      setWalletProvider("pera");
      persistWallet(account, "pera");
      return account;
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const connectWithManual = useCallback((address: string) => {
    const normalized = address.trim();
    if (!isValidAlgorandAddress(normalized)) {
      throw new Error("Invalid Algorand address.");
    }

    setWalletAddress(normalized);
    setWalletProvider("manual");
    persistWallet(normalized, "manual");
    return normalized;
  }, []);

  const disconnect = useCallback(async () => {
    if (walletProvider === "pera") {
      await disconnectPeraWallet();
    }

    clearStoredWallet();
    setWalletAddress(null);
    setWalletProvider(null);
  }, [walletProvider]);

  const value = useMemo(
    () => ({
      walletAddress,
      walletProvider,
      isConnecting,
      connectWithPera,
      connectWithManual,
      disconnect,
    }),
    [walletAddress, walletProvider, isConnecting, connectWithPera, connectWithManual, disconnect],
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used inside WalletProvider");
  }
  return context;
};


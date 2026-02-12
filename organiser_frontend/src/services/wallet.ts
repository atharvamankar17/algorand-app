import algosdk from "algosdk";

export const WALLET_ADDRESS_STORAGE_KEY = "algorand_wallet_address";
export const WALLET_PROVIDER_STORAGE_KEY = "algorand_wallet_provider";
export type WalletProviderType = "pera" | "manual";

let peraWalletInstance: any = null;

async function getPeraWallet() {
  if (peraWalletInstance) {
    return peraWalletInstance;
  }

  try {
    const module = await import("@perawallet/connect");
    peraWalletInstance = new module.PeraWalletConnect();
    return peraWalletInstance;
  } catch (error) {
    throw new Error("Pera Wallet SDK is unavailable. Use manual address mode or install @perawallet/connect.");
  }
}

export const isValidAlgorandAddress = (value: string) => {
  const normalized = value.trim();
  return Boolean(normalized) && algosdk.isValidAddress(normalized);
};

export const getStoredWalletAddress = () => localStorage.getItem(WALLET_ADDRESS_STORAGE_KEY);
export const getStoredWalletProvider = () => localStorage.getItem(WALLET_PROVIDER_STORAGE_KEY) as WalletProviderType | null;

export const persistWallet = (address: string, provider: WalletProviderType) => {
  localStorage.setItem(WALLET_ADDRESS_STORAGE_KEY, address);
  localStorage.setItem(WALLET_PROVIDER_STORAGE_KEY, provider);
};

export const clearStoredWallet = () => {
  localStorage.removeItem(WALLET_ADDRESS_STORAGE_KEY);
  localStorage.removeItem(WALLET_PROVIDER_STORAGE_KEY);
};

export async function connectPeraWallet() {
  const peraWallet = await getPeraWallet();
  const accounts: string[] = await peraWallet.connect();
  return accounts?.[0] || null;
}

export async function reconnectPeraWallet() {
  const peraWallet = await getPeraWallet();
  const accounts: string[] = await peraWallet.reconnectSession();
  return accounts?.[0] || null;
}

export async function disconnectPeraWallet() {
  if (!peraWalletInstance) {
    try {
      peraWalletInstance = await getPeraWallet();
    } catch {
      return;
    }
  }

  await peraWalletInstance.disconnect();
}

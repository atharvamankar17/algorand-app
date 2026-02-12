import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useWallet } from "@/contexts/WalletContext";

const shortenAddress = (address: string) => `${address.slice(0, 6)}...${address.slice(-4)}`;

const WalletConnectButton = () => {
  const { walletAddress, walletProvider, isConnecting, connectWithPera, connectWithManual, disconnect } = useWallet();
  const [isOpen, setIsOpen] = useState(false);
  const [manualAddress, setManualAddress] = useState("");
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const buttonLabel = useMemo(() => {
    if (!walletAddress) return "Connect Wallet";
    return shortenAddress(walletAddress);
  }, [walletAddress]);

  const handleConnectPera = async () => {
    setError(null);
    try {
      await connectWithPera();
      setIsOpen(false);
    } catch (err: any) {
      setError(err?.message || "Failed to connect wallet.");
    }
  };

  const handleManualConnect = () => {
    setError(null);
    try {
      connectWithManual(manualAddress);
      setManualAddress("");
      setIsOpen(false);
    } catch (err: any) {
      setError(err?.message || "Failed to use this address.");
    }
  };

  const handleDisconnect = async () => {
    await disconnect();
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={containerRef}>
      <Button variant={walletAddress ? "secondary" : "outline"} size="sm" onClick={() => setIsOpen(v => !v)}>
        {isConnecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wallet className="h-4 w-4" />}
        <span className="hidden sm:inline">{buttonLabel}</span>
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 rounded-lg border border-border bg-card p-3 shadow-card z-50 space-y-3">
          {walletAddress ? (
            <>
              <div>
                <p className="text-small text-muted-foreground">Connected address</p>
                <p className="text-body text-foreground break-all">{walletAddress}</p>
                <p className="text-small text-muted-foreground capitalize mt-1">{walletProvider} wallet</p>
              </div>
              <Button variant="outline" className="w-full" onClick={handleDisconnect}>
                Disconnect
              </Button>
            </>
          ) : (
            <>
              <Button className="w-full" onClick={handleConnectPera} disabled={isConnecting}>
                {isConnecting ? "Connecting..." : "Connect with Pera"}
              </Button>
              <div className="border-t border-border pt-3 space-y-2">
                <p className="text-small text-muted-foreground">Fallback: use wallet address</p>
                <Input
                  placeholder="Algorand address"
                  value={manualAddress}
                  onChange={e => setManualAddress(e.target.value)}
                />
                <Button variant="secondary" className="w-full" onClick={handleManualConnect}>
                  Use this address
                </Button>
              </div>
            </>
          )}

          {error && <p className="text-small text-destructive">{error}</p>}
        </div>
      )}
    </div>
  );
};

export default WalletConnectButton;


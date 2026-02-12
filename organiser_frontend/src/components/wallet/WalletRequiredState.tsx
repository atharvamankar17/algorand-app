import { Wallet } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/contexts/WalletContext";

interface WalletRequiredStateProps {
  title?: string;
  description?: string;
  compact?: boolean;
}

const WalletRequiredState = ({
  title = "Wallet connection required",
  description = "Connect your Algorand wallet to load your account-specific data.",
  compact = false,
}: WalletRequiredStateProps) => {
  const { connectWithPera, isConnecting } = useWallet();
  const [error, setError] = useState<string | null>(null);

  const handleConnect = async () => {
    setError(null);
    try {
      await connectWithPera();
    } catch (err: any) {
      setError(err?.message || "Unable to connect wallet.");
    }
  };

  return (
    <div className={`rounded-lg bg-card border border-border shadow-card ${compact ? "p-4" : "p-6"}`}>
      <div className={`flex ${compact ? "items-start gap-3" : "flex-col items-center text-center gap-3"}`}>
        <div className="h-11 w-11 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Wallet className="h-5 w-5 text-primary" />
        </div>
        <div className={compact ? "flex-1" : ""}>
          <h3 className="text-title text-foreground">{title}</h3>
          <p className="text-small text-muted-foreground mt-1">{description}</p>
          <Button className={`${compact ? "mt-3" : "mt-4"}`} onClick={handleConnect} disabled={isConnecting}>
            {isConnecting ? "Connecting..." : "Connect Wallet"}
          </Button>
          {error && <p className="text-small text-destructive mt-2">{error}</p>}
        </div>
      </div>
    </div>
  );
};

export default WalletRequiredState;

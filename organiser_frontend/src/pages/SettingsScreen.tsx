import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useWallet } from '@/contexts/WalletContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Copy, Check, Moon, Sun } from 'lucide-react';
import { useState } from 'react';

export default function SettingsScreen() {
  const { walletAddress, disconnect } = useWallet();
  const { theme, toggleTheme } = useTheme();
  const [copied, setCopied] = useState(false);

  const handleCopyAddress = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDisconnect = () => {
    disconnect();
  };

  return (
    <AppLayout title="Settings" showBack={false}>
      <div className="pb-20 space-y-6">
        {/* Wallet Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Wallet Settings</CardTitle>
            <CardDescription>Manage your Algorand wallet connection</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {walletAddress ? (
              <>
                <div>
                  <Label>Connected Wallet Address</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      readOnly
                      value={walletAddress}
                      className="font-mono text-xs"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCopyAddress}
                    >
                      {copied ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <Button
                  onClick={handleDisconnect}
                  variant="destructive"
                  className="w-full"
                >
                  Disconnect Wallet
                </Button>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No wallet connected</p>
            )}
          </CardContent>
        </Card>

        {/* Appearance Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>Customize the app appearance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Dark Mode</Label>
                <p className="text-sm text-muted-foreground">Toggle between light and dark themes</p>
              </div>
              <Switch
                checked={theme === 'dark'}
                onCheckedChange={toggleTheme}
              />
            </div>
          </CardContent>
        </Card>

        {/* Event Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Event Settings</CardTitle>
            <CardDescription>Configure default event settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Default Ticket Price (Algo)</Label>
              <Input type="number" placeholder="0.00" defaultValue={0} />
            </div>
            <div>
              <Label>Default Event Capacity</Label>
              <Input type="number" placeholder="100" defaultValue={100} />
            </div>
          </CardContent>
        </Card>

        {/* About */}
        <Card>
          <CardHeader>
            <CardTitle>About</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p><strong>Event Organiser Dashboard</strong></p>
            <p>Version 1.0.0</p>
            <p>Powered by Algorand</p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

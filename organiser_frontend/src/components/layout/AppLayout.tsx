import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, ArrowLeft } from 'lucide-react';
import BottomNav from './BottomNav';
import WalletConnectButton from '@/components/wallet/WalletConnectButton';

interface AppLayoutProps {
  children: ReactNode;
  title?: string;
  showBack?: boolean;
  showSettings?: boolean;
}

const AppLayout = ({ children, title, showBack = false, showSettings = true }: AppLayoutProps) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card border-b border-border px-4 py-3 flex items-center gap-3">
        {showBack && (
          <button onClick={() => navigate(-1)} className="p-1 -ml-1 text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </button>
        )}
        <h1 className="text-lg font-semibold flex-1 truncate">{title || 'Event Organiser'}</h1>
        <div className="flex items-center gap-2">
          <WalletConnectButton />
          {showSettings && (
            <button onClick={() => navigate('/settings')} className="p-1 text-muted-foreground">
              <Settings className="h-5 w-5" />
            </button>
          )}
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto pb-20 max-w-md mx-auto w-full">
        <div className="p-4">
          {children}
        </div>
      </main>

      {/* Bottom Nav */}
      <BottomNav />
    </div>
  );
};

export default AppLayout;

import { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  const location = useLocation();
  const isSubPage = showBack || !['/','','/groups','/analysis','/chats','/events','/activity'].includes(location.pathname);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card border-b border-border px-4 py-3 flex items-center gap-3">
        {(showBack || isSubPage) && (
          <button onClick={() => navigate(-1)} className="p-1 -ml-1 text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </button>
        )}
        <h1 className="text-title flex-1 truncate">{title || 'Campus Wallet'}</h1>
        <div className="flex items-center gap-2">
          <WalletConnectButton />
          {showSettings && !isSubPage && (
            <button onClick={() => navigate('/settings')} className="p-1 text-muted-foreground">
              <Settings className="h-5 w-5" />
            </button>
          )}
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto pb-20">
        {children}
      </main>

      {/* Bottom Nav - only on main tabs */}
      {!isSubPage && <BottomNav />}
    </div>
  );
};

export default AppLayout;

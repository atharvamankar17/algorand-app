import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import AppLayout from '@/components/layout/AppLayout';
import { ListSkeleton } from '@/components/common/LoadingSkeletons';
import EmptyState from '@/components/common/EmptyState';
import ErrorState from '@/components/common/ErrorState';
import { getActivityFeed } from '@/services/api';
import { Clock, ArrowUpRight, ArrowDownLeft, Users, Wallet } from 'lucide-react';
import WalletRequiredState from '@/components/wallet/WalletRequiredState';
import { useWallet } from '@/contexts/WalletContext';

const ActivityScreen = () => {
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const { walletAddress } = useWallet();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['activity', walletAddress, filter, page],
    queryFn: () => getActivityFeed({ filter, page: String(page), limit: '20' }),
    enabled: !!walletAddress,
  });

  const activities = data?.items || data || [];

  const getIcon = (type: string) => {
    switch (type) {
      case 'sent': return ArrowUpRight;
      case 'received': return ArrowDownLeft;
      case 'group': return Users;
      default: return Wallet;
    }
  };

  return (
    <AppLayout title="Activity">
      <div className="px-4 py-4 space-y-4">
        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto">
          {['all', 'expenses', 'transfers', 'groups'].map(f => (
            <button
              key={f}
              onClick={() => { setFilter(f); setPage(1); }}
              className={`px-3 py-1.5 rounded-full text-small font-medium capitalize whitespace-nowrap transition-colors ${
                filter === f ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {!walletAddress ? (
          <WalletRequiredState
            title="Connect wallet to view activity"
            description="Your activity feed is specific to your connected Algorand address."
          />
        ) : isLoading ? (
          <ListSkeleton count={8} />
        ) : isError ? (
          <ErrorState onRetry={refetch} />
        ) : activities.length === 0 ? (
          <EmptyState
            icon={Clock}
            title="No activity"
            description="Your transactions and group activities will appear here"
          />
        ) : (
          <div className="space-y-2">
            {activities.map((a: any) => {
              const Icon = getIcon(a.type);
              return (
                <div key={a.id} className="flex items-center gap-3 rounded-lg bg-card p-3 shadow-card border border-border">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                    a.type === 'received' ? 'bg-positive/10' : a.type === 'sent' ? 'bg-destructive/10' : 'bg-muted'
                  }`}>
                    <Icon className={`h-4 w-4 ${
                      a.type === 'received' ? 'text-positive' : a.type === 'sent' ? 'text-destructive' : 'text-muted-foreground'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-body text-foreground truncate">{a.description}</p>
                    <p className="text-small text-muted-foreground">
                      {a.timestamp ? new Date(a.timestamp).toLocaleDateString() : ''} {a.category && `• ${a.category}`}
                    </p>
                  </div>
                  {a.amount != null && (
                    <span className={`text-body font-semibold flex-shrink-0 ${a.type === 'received' ? 'text-positive' : 'text-destructive'}`}>
                      {a.type === 'received' ? '+' : '-'}₹{Math.abs(a.amount).toLocaleString()}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Load more */}
        {walletAddress && activities.length >= 20 && (
          <button
            onClick={() => setPage(p => p + 1)}
            className="w-full py-2 text-small font-medium text-primary"
          >
            Load more
          </button>
        )}
      </div>
    </AppLayout>
  );
};

export default ActivityScreen;

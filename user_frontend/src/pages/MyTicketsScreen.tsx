import { useQuery } from '@tanstack/react-query';
import AppLayout from '@/components/layout/AppLayout';
import { ListSkeleton } from '@/components/common/LoadingSkeletons';
import EmptyState from '@/components/common/EmptyState';
import ErrorState from '@/components/common/ErrorState';
import { getMyTickets } from '@/services/api';
import { Ticket, Calendar } from 'lucide-react';
import WalletRequiredState from '@/components/wallet/WalletRequiredState';
import { useWallet } from '@/contexts/WalletContext';

const MyTicketsScreen = () => {
  const { walletAddress } = useWallet();

  const { data: tickets, isLoading, isError, refetch } = useQuery({
    queryKey: ['tickets', walletAddress],
    queryFn: getMyTickets,
    enabled: !!walletAddress,
  });

  return (
    <AppLayout title="My Tickets" showBack>
      <div className="px-4 py-4">
        {!walletAddress ? (
          <WalletRequiredState
            title="Connect wallet to view your tickets"
            description="Ticket ownership is tracked by wallet address."
          />
        ) : isLoading ? (
          <ListSkeleton count={3} />
        ) : isError ? (
          <ErrorState onRetry={refetch} />
        ) : !tickets?.length ? (
          <EmptyState
            icon={Ticket}
            title="No tickets"
            description="Purchase event tickets to see them here"
          />
        ) : (
          <div className="space-y-3">
            {tickets.map((t: any) => (
              <div key={t.id} className="rounded-lg bg-card p-4 shadow-card border border-border space-y-2">
                <h3 className="text-title text-foreground">{t.eventTitle || 'Event'}</h3>
                <div className="flex items-center gap-2 text-small text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  {t.date ? new Date(t.date).toLocaleDateString() : 'TBD'}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-small text-muted-foreground">#{t.id?.slice(0, 8)}</span>
                  <span className={`text-small font-medium px-2 py-0.5 rounded-full ${
                    t.status === 'valid' ? 'bg-positive/10 text-positive' : 'bg-muted text-muted-foreground'
                  }`}>
                    {t.status || 'valid'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default MyTicketsScreen;

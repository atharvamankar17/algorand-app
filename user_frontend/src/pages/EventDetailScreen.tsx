import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AppLayout from '@/components/layout/AppLayout';
import { CardSkeleton } from '@/components/common/LoadingSkeletons';
import ErrorState from '@/components/common/ErrorState';
import WalletRequiredState from '@/components/wallet/WalletRequiredState';
import { getEvents, buyTicket } from '@/services/api';
import { useWallet } from '@/contexts/WalletContext';
import { Calendar, MapPin, Ticket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const EventDetailScreen = () => {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { walletAddress } = useWallet();

  const { data: events, isLoading, isError, refetch } = useQuery({
    queryKey: ['events'],
    queryFn: getEvents,
  });

  const event = events?.find((e: any) => e.id === id);

  const buyMut = useMutation({
    mutationFn: () => buyTicket(id!, walletAddress || undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      toast({ title: 'Ticket purchased!' });
    },
    onError: () => toast({ title: 'Failed to buy ticket', variant: 'destructive' }),
  });

  if (isLoading) return <AppLayout title="Event" showBack><div className="px-4 py-4"><CardSkeleton /></div></AppLayout>;
  if (isError || !event) return <AppLayout title="Event" showBack><ErrorState onRetry={refetch} /></AppLayout>;

  return (
    <AppLayout title={event.title} showBack>
      <div>
        {event.image && (
          <div className="h-48 bg-muted">
            <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
          </div>
        )}
        <div className="px-4 py-4 space-y-4">
          <h1 className="text-h1 text-foreground">{event.title}</h1>

          <div className="flex flex-wrap gap-3 text-body text-muted-foreground">
            {event.date && (
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" /> {new Date(event.date).toLocaleDateString()}
              </span>
            )}
            {event.location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" /> {event.location}
              </span>
            )}
          </div>

          {event.description && (
            <p className="text-body text-foreground">{event.description}</p>
          )}

          <div className="flex items-center justify-between rounded-lg bg-muted p-4">
            <div>
              <p className="text-small text-muted-foreground">Price</p>
              <p className="text-h2 font-bold text-foreground">Rs {event.price ?? 'Free'}</p>
            </div>
            {walletAddress ? (
              <Button onClick={() => buyMut.mutate()} disabled={buyMut.isPending}>
                <Ticket className="h-4 w-4 mr-1" />
                {buyMut.isPending ? 'Buying...' : 'Buy Ticket'}
              </Button>
            ) : (
              <span className="text-small text-muted-foreground">Connect wallet to buy</span>
            )}
          </div>

          {!walletAddress && (
            <WalletRequiredState compact description="Ticket purchases require a connected Algorand wallet." />
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default EventDetailScreen;


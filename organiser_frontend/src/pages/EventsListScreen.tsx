import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { getOrganizerEvents } from '@/services/api';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Calendar, MapPin, Users, DollarSign, Edit2, Trash2 } from 'lucide-react';
import LoadingSkeletons from '@/components/common/LoadingSkeletons';
import ErrorState from '@/components/common/ErrorState';
import EmptyState from '@/components/common/EmptyState';
import { useWallet } from '@/contexts/WalletContext';

export default function EventsListScreen() {
  const navigate = useNavigate();
  const { walletAddress } = useWallet();

  const { data: events, isLoading, isError, refetch } = useQuery({
    queryKey: ['organiser-events'],
    queryFn: getOrganizerEvents,
    enabled: !!walletAddress,
  });

  return (
    <AppLayout title="My Events" showBack={false}>
      <div className="pb-20">
        <div className="flex gap-2 mb-6">
          <Button 
            onClick={() => navigate('/events/create')}
            className="flex-1"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Event
          </Button>
          <Button 
            onClick={() => navigate('/analytics')}
            variant="outline"
            className="flex-1"
          >
            Analytics
          </Button>
        </div>

        {isLoading ? (
          <LoadingSkeletons count={5} />
        ) : isError ? (
          <ErrorState onRetry={refetch} />
        ) : !events?.length ? (
          <EmptyState
            icon={Calendar}
            title="No events yet"
            description="Create your first event to start selling tickets"
          />
        ) : (
          <div className="space-y-3">
            {events.map((event: any) => (
              <Card key={event.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{event.title || event.event_name}</h3>
                        {event.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>
                        )}
                      </div>
                      <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">Active</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(event.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4" />
                        <span>{event.location || 'TBD'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Users className="w-4 h-4" />
                        <span>{event.capacity} tickets</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <DollarSign className="w-4 h-4" />
                        <span>{event.price ? `₳${event.price}` : 'Free'}</span>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => navigate(`/events/${event.id}`)}
                      >
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => navigate(`/events/${event.id}/edit`)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

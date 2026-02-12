import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import { ListSkeleton } from '@/components/common/LoadingSkeletons';
import EmptyState from '@/components/common/EmptyState';
import ErrorState from '@/components/common/ErrorState';
import { getEvents } from '@/services/api';
import { Ticket, Calendar, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';

const EventsScreen = () => {
  const navigate = useNavigate();
  const { data: events, isLoading, isError, refetch } = useQuery({
    queryKey: ['events'],
    queryFn: getEvents,
  });

  return (
    <AppLayout title="Events">
      <div className="px-4 py-4 space-y-4">
        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={() => navigate('/tickets')}>
            <Ticket className="h-4 w-4 mr-1" /> My Tickets
          </Button>
        </div>

        {isLoading ? (
          <ListSkeleton count={4} />
        ) : isError ? (
          <ErrorState onRetry={refetch} />
        ) : !events?.length ? (
          <EmptyState
            icon={Ticket}
            title="No events"
            description="Campus events will appear here when available"
          />
        ) : (
          <div className="space-y-3">
            {events.map((event: any) => (
              <button
                key={event.id}
                onClick={() => navigate(`/events/${event.id}`)}
                className="w-full rounded-lg bg-card shadow-card border border-border overflow-hidden text-left transition-colors active:bg-muted"
              >
                {event.image && (
                  <div className="h-32 bg-muted">
                    <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="p-4 space-y-2">
                  <h3 className="text-title text-foreground">{event.title}</h3>
                  <div className="flex items-center gap-3 text-small text-muted-foreground">
                    {event.date && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(event.date).toLocaleDateString()}
                      </span>
                    )}
                    {event.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {event.location}
                      </span>
                    )}
                  </div>
                  {event.price != null && (
                    <p className="text-body font-semibold text-primary">₹{event.price}</p>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default EventsScreen;

import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getEventDetails } from '@/services/api';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Users, DollarSign, Share2 } from 'lucide-react';
import LoadingSkeletons from '@/components/common/LoadingSkeletons';
import ErrorState from '@/components/common/ErrorState';

export default function EventDetailScreen() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: event, isLoading, isError, refetch } = useQuery({
    queryKey: ['event', id],
    queryFn: () => getEventDetails(id!),
    enabled: !!id,
  });

  if (isLoading) return <AppLayout title="Event Details"><LoadingSkeletons count={3} /></AppLayout>;
  if (isError) return <AppLayout title="Event Details"><ErrorState onRetry={refetch} /></AppLayout>;
  if (!event) return <AppLayout title="Event Details"><div>Event not found</div></AppLayout>;

  return (
    <AppLayout title={event.title || event.event_name} showBack>
      <div className="pb-20 space-y-4">
        {event.image && (
          <div className="relative w-full aspect-video bg-muted rounded-lg overflow-hidden">
            <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>{event.title || event.event_name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {event.description && (
              <div>
                <p className="text-sm text-muted-foreground">{event.description}</p>
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="w-4 h-4 text-primary" />
                <span>{new Date(event.date).toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="w-4 h-4 text-primary" />
                <span>{event.location || 'TBD'}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Users className="w-4 h-4 text-primary" />
                <span>{event.capacity} total tickets</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <DollarSign className="w-4 h-4 text-primary" />
                <span>{event.price || event.ticket_price ? `₳${event.price || event.ticket_price} per ticket` : 'Free'}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-2">
          <Button variant="outline" className="flex-1">
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
          <Button className="flex-1" onClick={() => navigate(`/events/${id}/tickets`)}>View Tickets</Button>
        </div>
      </div>
    </AppLayout>
  );
}

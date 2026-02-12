import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getOrganizerEvents } from '@/services/api';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Calendar, MapPin, Users, DollarSign } from 'lucide-react';
import LoadingSkeletons from '@/components/common/LoadingSkeletons';
import ErrorState from '@/components/common/ErrorState';
import EmptyState from '@/components/common/EmptyState';
import { useWallet } from '@/contexts/WalletContext';

export default function Dashboard() {
  const navigate = useNavigate();
  const { walletAddress } = useWallet();
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalTicketsSold: 0,
    totalRevenue: 0,
  });

  const { data: events, isLoading, isError, refetch } = useQuery({
    queryKey: ['organiser-events'],
    queryFn: getOrganizerEvents,
    enabled: !!walletAddress,
  });

  useEffect(() => {
    if (events) {
      const totalRevenue = events.reduce((sum: number, event: any) => sum + (event.ticket_price * 10), 0);
      setStats({
        totalEvents: events.length,
        totalTicketsSold: events.length * 10,
        totalRevenue,
      });
    }
  }, [events]);

  return (
    <AppLayout title="Dashboard" showBack={false}>
      {!walletAddress ? (
        <div className="flex flex-col items-center justify-center py-20">
          <h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2>
          <p className="text-muted-foreground mb-6">Connect your Algorand wallet to get started as an event organizer</p>
        </div>
      ) : (
        <div className="space-y-6 pb-20">
          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-3">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Total Events</p>
                  <p className="text-2xl font-bold mt-1">{stats.totalEvents}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Tickets Sold</p>
                  <p className="text-2xl font-bold mt-1">{stats.totalTicketsSold}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Revenue</p>
                  <p className="text-2xl font-bold mt-1">₳{stats.totalRevenue}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Create Event Button */}
          <Button 
            onClick={() => navigate('/events/create')}
            className="w-full h-12"
            size="lg"
          >
            <Plus className="mr-2 h-5 w-5" />
            Create New Event
          </Button>

          {/* Recent Events */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Your Events</h3>
            {isLoading ? (
              <LoadingSkeletons count={3} />
            ) : isError ? (
              <ErrorState onRetry={refetch} />
            ) : !events?.length ? (
              <EmptyState 
                icon={Calendar}
                title="No events yet"
                description="Create your first event to get started"
              />
            ) : (
              <div className="space-y-3">
                {events.map((event: any) => (
                  <Card 
                    key={event.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => navigate(`/events/${event.id}`)}
                  >
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg">{event.title || event.event_name}</h4>
                          <div className="flex flex-col gap-1 mt-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              {new Date(event.date).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              {event.location || 'TBD'}
                            </div>
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4" />
                              {event.capacity} tickets
                            </div>
                            <div className="flex items-center gap-2">
                              <DollarSign className="w-4 h-4" />
                              ₳{event.price || event.ticket_price || 0} per ticket
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-primary">Active</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </AppLayout>
  );
}

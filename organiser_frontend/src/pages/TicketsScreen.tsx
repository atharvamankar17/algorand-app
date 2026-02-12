import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getEventTicketHolders } from '@/services/api';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import LoadingSkeletons from '@/components/common/LoadingSkeletons';
import ErrorState from '@/components/common/ErrorState';
import EmptyState from '@/components/common/EmptyState';

export default function TicketsScreen() {
  const { id } = useParams<{ id: string }>();

  const { data: tickets, isLoading, isError, refetch } = useQuery({
    queryKey: ['event-tickets', id],
    queryFn: () => getEventTicketHolders(id!),
    enabled: !!id,
  });

  return (
    <AppLayout title="Ticket Holders" showBack>
      <div className="pb-20">
        {isLoading ? (
          <LoadingSkeletons count={5} />
        ) : isError ? (
          <ErrorState onRetry={refetch} />
        ) : !tickets?.length ? (
          <EmptyState
            icon={Check}
            title="No ticket holders yet"
            description="Attendees who purchase tickets will appear here"
          />
        ) : (
          <div className="space-y-3">
            {tickets.map((ticket: any, index: number) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold">{ticket.holder_name || 'Attendee ' + (index + 1)}</p>
                      <p className="text-sm text-muted-foreground">{ticket.holder_address}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Purchased: {new Date(ticket.purchase_date).toLocaleDateString()}
                      </p>
                    </div>
                    <Button size="sm" variant={ticket.checked_in ? "default" : "outline"}>
                      {ticket.checked_in ? (
                        <>
                          <Check className="mr-1 h-4 w-4" />
                          Checked In
                        </>
                      ) : (
                        'Check In'
                      )}
                    </Button>
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

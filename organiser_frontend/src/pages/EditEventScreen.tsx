import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getEventDetails, updateEvent } from '@/services/api';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import LoadingSkeletons from '@/components/common/LoadingSkeletons';
import { toast } from 'sonner';

export default function EditEventScreen() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: event, isLoading } = useQuery({
    queryKey: ['event', id],
    queryFn: () => getEventDetails(id!),
    enabled: !!id,
  });

  const [formData, setFormData] = useState({
    eventName: '',
    description: '',
    location: '',
    capacity: 100,
    ticketPrice: 0,
  });

  useEffect(() => {
    if (event) {
      setFormData({
        eventName: event.event_name || event.title || '',
        description: event.description || '',
        location: event.location || '',
        capacity: event.capacity || 100,
        ticketPrice: event.ticket_price || event.price || 0,
      });
    }
  }, [event]);

  const updateMutation = useMutation({
    mutationFn: (data: any) => updateEvent(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event', id] });
      toast.success('Event updated successfully!');
      navigate(`/events/${id}`);
    },
    onError: () => {
      toast.error('Failed to update event');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  if (isLoading) return <AppLayout title="Edit Event"><LoadingSkeletons count={3} /></AppLayout>;

  return (
    <AppLayout title="Edit Event" showBack>
      <div className="pb-20">
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Event Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Event Name</Label>
                <Input
                  value={formData.eventName}
                  onChange={(e) => setFormData({ ...formData, eventName: e.target.value })}
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                />
              </div>
              <div>
                <Label>Location</Label>
                <Input
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ticket Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Total Tickets</Label>
                <Input
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                />
              </div>
              <div>
                <Label>Ticket Price (Algo)</Label>
                <Input
                  type="number"
                  step="0.001"
                  value={formData.ticketPrice}
                  onChange={(e) => setFormData({ ...formData, ticketPrice: parseFloat(e.target.value) })}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button type="button" variant="outline" className="flex-1" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}

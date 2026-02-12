import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createEvent } from '@/services/api';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useWallet } from '@/contexts/WalletContext';
import { toast } from 'sonner';

interface EventFormData {
  eventName: string;
  description: string;
  date: string;
  time: string;
  location: string;
  capacity: number;
  ticketPrice: number;
  isFree: boolean;
  image?: string;
}

export default function CreateEventScreen() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { walletAddress } = useWallet();
  
  const [formData, setFormData] = useState<EventFormData>({
    eventName: '',
    description: '',
    date: '',
    time: '',
    location: '',
    capacity: 100,
    ticketPrice: 0,
    isFree: true,
    image: '',
  });

  const [imagePreview, setImagePreview] = useState<string>('');

  const createEventMutation = useMutation({
    mutationFn: (data: any) => createEvent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organiser-events'] });
      toast.success('Event created successfully!');
      navigate('/events');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to create event');
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!walletAddress) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!formData.eventName || !formData.date || !formData.location) {
      toast.error('Please fill in all required fields');
      return;
    }

    const eventData = {
      eventName: formData.eventName,
      description: formData.description,
      date: `${formData.date}T${formData.time}`,
      location: formData.location,
      capacity: parseInt(formData.capacity.toString()),
      ticketPrice: formData.isFree ? 0 : parseFloat(formData.ticketPrice.toString()),
      image: imagePreview,
      price: formData.isFree ? 0 : parseFloat(formData.ticketPrice.toString()),
    };

    createEventMutation.mutate(eventData);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setImagePreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <AppLayout title="Create Event" showBack>
      <div className="pb-20">
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
          {/* Event Image */}
          <Card>
            <CardHeader>
              <CardTitle>Event Image</CardTitle>
              <CardDescription>Upload a cover image for your event</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                {imagePreview && (
                  <div className="relative w-full aspect-video bg-muted rounded-lg overflow-hidden">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="cursor-pointer"
                />
              </div>
            </CardContent>
          </Card>

          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Event details and description</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="eventName">Event Name *</Label>
                <Input
                  id="eventName"
                  placeholder="Enter event name"
                  value={formData.eventName}
                  onChange={(e) => setFormData({ ...formData, eventName: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your event"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Date & Time */}
          <Card>
            <CardHeader>
              <CardTitle>Date & Time</CardTitle>
              <CardDescription>When will your event take place?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="time">Time *</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Location & Venue */}
          <Card>
            <CardHeader>
              <CardTitle>Venue Information</CardTitle>
              <CardDescription>Where will your event be held?</CardDescription>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  placeholder="e.g., New York Convention Center"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Ticket Details */}
          <Card>
            <CardHeader>
              <CardTitle>Ticket Information</CardTitle>
              <CardDescription>Configure ticket pricing and capacity</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="capacity">Total Tickets Available *</Label>
                <Input
                  id="capacity"
                  type="number"
                  min="1"
                  max="10000"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">Maximum number of tickets to sell</p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isFree"
                    checked={formData.isFree}
                    onChange={(e) => setFormData({ ...formData, isFree: e.target.checked, ticketPrice: 0 })}
                    className="w-4 h-4"
                  />
                  <Label htmlFor="isFree" className="cursor-pointer">Free Event</Label>
                </div>

                {!formData.isFree && (
                  <div>
                    <Label htmlFor="ticketPrice">Ticket Price (in Algo) *</Label>
                    <Input
                      id="ticketPrice"
                      type="number"
                      min="0.001"
                      step="0.001"
                      placeholder="0.00"
                      value={formData.ticketPrice}
                      onChange={(e) => setFormData({ ...formData, ticketPrice: parseFloat(e.target.value) })}
                      required={!formData.isFree}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => navigate('/events')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={createEventMutation.isPending}
            >
              {createEventMutation.isPending ? 'Creating...' : 'Create Event'}
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}

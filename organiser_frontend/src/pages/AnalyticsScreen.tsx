import { useQuery } from '@tanstack/react-query';
import { getOrganizerEvents } from '@/services/api';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import LoadingSkeletons from '@/components/common/LoadingSkeletons';
import { useWallet } from '@/contexts/WalletContext';

export default function AnalyticsScreen() {
  const { walletAddress } = useWallet();

  const { data: events, isLoading, isError, refetch } = useQuery({
    queryKey: ['organiser-events'],
    queryFn: () => getOrganizerEvents(),
    enabled: !!walletAddress,
  });

  const chartData = events?.map((event: any) => ({
    name: event.title || event.event_name,
    revenue: event.ticket_price * 10,
    tickets: event.capacity,
  })) || [];

  const stats = {
    totalEvents: events?.length || 0,
    totalRevenue: events?.reduce((sum: number, e: any) => sum + (e.ticket_price * 10), 0) || 0,
    totalTickets: events?.reduce((sum: number, e: any) => sum + e.capacity, 0) || 0,
    averageTicketPrice: events?.length ? (events.reduce((sum: number, e: any) => sum + e.ticket_price, 0) / events.length) : 0,
  };

  if (isLoading) return <AppLayout title="Analytics"><LoadingSkeletons count={4} /></AppLayout>;

  return (
    <AppLayout title="Analytics" showBack={false}>
      <div className="pb-20 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Total Events</p>
              <p className="text-2xl font-bold mt-2">{stats.totalEvents}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <p className="text-2xl font-bold mt-2">₳{stats.totalRevenue.toFixed(2)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Total Tickets</p>
              <p className="text-2xl font-bold mt-2">{stats.totalTickets}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Avg Price</p>
              <p className="text-2xl font-bold mt-2">₳{stats.averageTicketPrice.toFixed(2)}</p>
            </CardContent>
          </Card>
        </div>

        {/* Revenue Chart */}
        {chartData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Revenue by Event</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="revenue" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Tickets Distribution */}
        {chartData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Ticket Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="tickets" stroke="#8884d8" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}

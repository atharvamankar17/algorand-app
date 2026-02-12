import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { WalletProvider } from "@/contexts/WalletContext";
import Dashboard from "./pages/Dashboard";
import EventsListScreen from "./pages/EventsListScreen";
import CreateEventScreen from "./pages/CreateEventScreen";
import EditEventScreen from "./pages/EditEventScreen";
import EventDetailScreen from "./pages/EventDetailScreen";
import TicketsScreen from "./pages/TicketsScreen";
import AnalyticsScreen from "./pages/AnalyticsScreen";
import SettingsScreen from "./pages/SettingsScreen";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30000,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <WalletProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/events" element={<EventsListScreen />} />
              <Route path="/events/create" element={<CreateEventScreen />} />
              <Route path="/events/:id/edit" element={<EditEventScreen />} />
              <Route path="/events/:id" element={<EventDetailScreen />} />
              <Route path="/events/:id/tickets" element={<TicketsScreen />} />
              <Route path="/analytics" element={<AnalyticsScreen />} />
              <Route path="/settings" element={<SettingsScreen />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </WalletProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { WalletProvider } from "@/contexts/WalletContext";
import Dashboard from "./pages/Dashboard";
import GroupsScreen from "./pages/GroupsScreen";
import CreateGroupScreen from "./pages/CreateGroupScreen";
import GroupDetailScreen from "./pages/GroupDetailScreen";
import AddExpenseScreen from "./pages/AddExpenseScreen";
import AnalysisScreen from "./pages/AnalysisScreen";
import EventsScreen from "./pages/EventsScreen";
import EventDetailScreen from "./pages/EventDetailScreen";
import MyTicketsScreen from "./pages/MyTicketsScreen";
import ActivityScreen from "./pages/ActivityScreen";
import CategoriesScreen from "./pages/CategoriesScreen";
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
              <Route path="/groups" element={<GroupsScreen />} />
              <Route path="/groups/create" element={<CreateGroupScreen />} />
              <Route path="/groups/:id" element={<GroupDetailScreen />} />
              <Route path="/groups/:id/expense" element={<AddExpenseScreen />} />
              <Route path="/analysis" element={<AnalysisScreen />} />
              <Route path="/events" element={<EventsScreen />} />
              <Route path="/events/:id" element={<EventDetailScreen />} />
              <Route path="/tickets" element={<MyTicketsScreen />} />
              <Route path="/activity" element={<ActivityScreen />} />
              <Route path="/categories" element={<CategoriesScreen />} />
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

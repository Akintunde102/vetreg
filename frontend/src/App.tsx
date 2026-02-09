import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { OrgProvider } from "@/hooks/useCurrentOrg";
import { NotificationsProvider } from "@/hooks/useNotifications";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import LoginPage from "@/pages/Login";
import DashboardPage from "@/pages/Dashboard";
import OrganizationsPage from "@/pages/Organizations";
import AnimalsPage from "@/pages/Animals";
import AnimalDetailPage from "@/pages/AnimalDetail";
import ClientDetailPage from "@/pages/ClientDetail";
import RevenuePage from "@/pages/Revenue";
import PaymentsPage from "@/pages/Payments";
import ClientsPage from "@/pages/Clients";
import SchedulePage from "@/pages/Schedule";
import TreatmentsPage from "@/pages/Treatments";
import SettingsPage from "@/pages/Settings";
import MorePage from "@/pages/More";
import NotificationsPage from "@/pages/Notifications";
import LandingPage from "@/pages/Landing";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <OrgProvider>
        <NotificationsProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route element={<DashboardLayout />}>
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/dashboard/clients" element={<ClientsPage />} />
                  <Route path="/dashboard/clients/:clientId" element={<ClientDetailPage />} />
                  <Route path="/dashboard/animals" element={<AnimalsPage />} />
                  <Route path="/dashboard/animals/:animalId" element={<AnimalDetailPage />} />
                  <Route path="/dashboard/treatments" element={<TreatmentsPage />} />
                  <Route path="/dashboard/schedule" element={<SchedulePage />} />
                  <Route path="/dashboard/revenue" element={<RevenuePage />} />
                  <Route path="/dashboard/payments" element={<PaymentsPage />} />
                  <Route path="/organizations" element={<OrganizationsPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="/notifications" element={<NotificationsPage />} />
                  <Route path="/more" element={<MorePage />} />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </NotificationsProvider>
      </OrgProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

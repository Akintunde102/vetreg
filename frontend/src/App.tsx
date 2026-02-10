import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { OrgProvider } from "@/hooks/useCurrentOrg";
import { NotificationsProvider } from "@/hooks/useNotifications";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AdminRoute } from "@/components/auth/AdminRoute";
import { OrgRequiredGate } from "@/components/auth/OrgRequiredGate";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AdminLayout } from "@/components/layout/AdminLayout";
import LoginPage from "@/pages/Login";
import AuthCallbackPage from "@/pages/AuthCallback";
import OnboardingProfilePage from "@/pages/OnboardingProfile";
import OnboardingPendingPage from "@/pages/OnboardingPending";
import AccountRejectedPage from "@/pages/AccountRejected";
import AccountSuspendedPage from "@/pages/AccountSuspended";
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
import TreatmentDetailPage from "@/pages/TreatmentDetail";
import SettingsPage from "@/pages/Settings";
import ReportsPage from "@/pages/Reports";
import MorePage from "@/pages/More";
import NotificationsPage from "@/pages/Notifications";
import LandingPage from "@/pages/Landing";
import NotFound from "@/pages/NotFound";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminVets from "@/pages/admin/AdminVets";
import AdminOrganizations from "@/pages/admin/AdminOrganizations";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 60 * 1000, retry: 1 },
  },
});

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
                <Route path="/signup" element={<LoginPage />} />
                <Route path="/auth/callback" element={<AuthCallbackPage />} />
                <Route element={<ProtectedRoute requireApproved={false} />}>
                  <Route path="/onboarding/profile" element={<OnboardingProfilePage />} />
                  <Route path="/onboarding/pending" element={<OnboardingPendingPage />} />
                  <Route path="/account/rejected" element={<AccountRejectedPage />} />
                  <Route path="/account/suspended" element={<AccountSuspendedPage />} />
                </Route>
                <Route element={<ProtectedRoute />}>
                  <Route element={<AdminRoute />}>
                    <Route element={<AdminLayout />}>
                      <Route path="/admin" element={<AdminDashboard />} />
                      <Route path="/admin/vets" element={<AdminVets />} />
                      <Route path="/admin/organizations" element={<AdminOrganizations />} />
                    </Route>
                  </Route>
                  <Route element={<DashboardLayout />}>
                    <Route element={<OrgRequiredGate />}>
                      <Route path="/dashboard" element={<DashboardPage />} />
                      <Route path="/dashboard/clients" element={<ClientsPage />} />
                      <Route path="/dashboard/clients/:clientId" element={<ClientDetailPage />} />
                      <Route path="/dashboard/animals" element={<AnimalsPage />} />
                      <Route path="/dashboard/animals/:animalId" element={<AnimalDetailPage />} />
                      <Route path="/dashboard/treatments" element={<TreatmentsPage />} />
                      <Route path="/dashboard/treatments/:treatmentId" element={<TreatmentDetailPage />} />
                      <Route path="/dashboard/schedule" element={<SchedulePage />} />
                      <Route path="/dashboard/revenue" element={<RevenuePage />} />
                      <Route path="/dashboard/payments" element={<PaymentsPage />} />
                      <Route path="/organizations" element={<OrganizationsPage />} />
                      <Route path="/dashboard/settings" element={<SettingsPage />} />
                      <Route path="/dashboard/reports" element={<ReportsPage />} />
                      <Route path="/settings" element={<Navigate to="/dashboard/settings" replace />} />
                      <Route path="/notifications" element={<NotificationsPage />} />
                      <Route path="/more" element={<MorePage />} />
                    </Route>
                  </Route>
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

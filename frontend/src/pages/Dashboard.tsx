import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import {
  Building2, Users, PawPrint, Tractor, DollarSign,
  ClipboardList, CalendarDays, ArrowRight, AlertCircle, Plus,
} from 'lucide-react';
import { api } from '@/lib/api';
import { queryKeys } from '@/lib/query-keys';
import { useCurrentOrg } from '@/hooks/useCurrentOrg';
import { StatsWidget } from '@/components/dashboard/StatsWidget';
import { ScheduleCard } from '@/components/dashboard/ScheduleCard';
import { AddNewDialog } from '@/components/AddNewDialog';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { mockDashboardStats, mockScheduledToday, mockOrganizations } from '@/lib/mock-data';

const useMockFallback = false; // Always use API

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning,';
  if (h < 17) return 'Good afternoon,';
  return 'Good evening,';
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { currentOrgId, orgs } = useCurrentOrg();
  const navigate = useNavigate();
  const [addOpen, setAddOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: stats, isLoading: statsLoading, isError: statsError } = useQuery({
    queryKey: queryKeys.dashboard.stats(currentOrgId!),
    queryFn: () => api.getDashboardStats(currentOrgId!),
    enabled: !!currentOrgId && !useMockFallback,
  });

  const { data: scheduledData } = useQuery({
    queryKey: queryKeys.dashboard.scheduledToday(currentOrgId!),
    queryFn: () => api.getScheduledToday(currentOrgId!),
    enabled: !!currentOrgId && !useMockFallback,
    refetchInterval: 60000,
  });

  const settleMutation = useMutation({
    mutationFn: (treatmentId: string) =>
      api.updateTreatment(currentOrgId!, treatmentId, {
        status: 'COMPLETED',
        visitDate: new Date().toISOString(),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast({ title: 'Schedule settled successfully' });
    },
    onError: (e: Error) => {
      toast({ variant: 'destructive', title: 'Failed to settle', description: e.message });
    },
  });

  const useApiData = !useMockFallback && !!currentOrgId && !statsError;
  const displayStats = (useApiData && stats) ? stats : mockDashboardStats;
  const displayOrgs = (orgs?.length ? orgs : mockOrganizations);
  const scheduled = (useApiData && scheduledData?.treatments) ? scheduledData.treatments : mockScheduledToday;
  const isLoading = !useMockFallback && statsLoading && !!currentOrgId;

  const lastName = user?.fullName?.split(' ').pop() || '';
  const pendingOrgsCount = displayOrgs.filter((o) => o.status === 'PENDING_APPROVAL').length;

  if (!currentOrgId && orgs?.length === 0 && !useMockFallback) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground mb-4">No organizations yet. Create one to get started.</p>
        <button
          onClick={() => navigate('/organizations')}
          className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium"
        >
          Add Vet Clinic
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Greeting */}
      <div className="relative">
        <p className="text-primary font-semibold text-base">{getGreeting()}</p>
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Dr. {lastName}</h1>
        <div className="mt-3 flex items-center gap-3 bg-card border border-border rounded-xl px-4 py-2.5">
          <CalendarDays className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-foreground">Today, {format(new Date(), 'MMMM d')}</span>
        </div>
      </div>

      {/* Stats Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-4 gap-2 lg:gap-4">
            <StatsWidget icon={Building2} value={displayOrgs.length} label="Vet Clinics" badge={pendingOrgsCount || undefined} onClick={() => navigate('/organizations')} />
            <StatsWidget icon={Users} value={displayStats.clients.total} label="Clients" onClick={() => navigate('/dashboard/clients')} />
            <StatsWidget icon={PawPrint} value={displayStats.animals.byPatientType.SINGLE_PET} label="Pets" onClick={() => navigate('/dashboard/animals?type=pet')} />
            <StatsWidget icon={Tractor} value={displayStats.animals.byPatientType.SINGLE_LIVESTOCK + displayStats.animals.byPatientType.BATCH_LIVESTOCK} label="Livestocks" onClick={() => navigate('/dashboard/animals?type=livestock')} />
          </div>
          <div className="grid grid-cols-3 gap-2 lg:gap-4">
            <StatsWidget icon={DollarSign} value={`₦${(displayStats.revenue.total / 1000).toFixed(0)}k`} label="Revenue" onClick={() => navigate('/dashboard/revenue')} />
            <StatsWidget icon={ClipboardList} value={displayStats.revenue.unpaidInvoices} label="Pending payments" variant="warning" onClick={() => navigate('/dashboard/revenue?status=owed')} />
            <StatsWidget icon={CalendarDays} value={displayStats.treatments.scheduled} label="Upcoming appointments" badge={displayStats.treatments.scheduled} onClick={() => navigate('/dashboard/schedule')} />
          </div>
        </>
      )}

      {/* Unsettled Schedules */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-foreground">Unsettled schedules</h2>
            <span className="w-6 h-6 bg-primary text-primary-foreground text-xs font-bold rounded-full flex items-center justify-center">
              {scheduled.length}
            </span>
          </div>
        </div>

        {scheduled.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground bg-card rounded-xl border border-border">
            <CalendarDays className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No schedules for today</p>
          </div>
        ) : (
          <div className="space-y-3 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0">
            {scheduled.map((t) => (
              <ScheduleCard
                key={t.id}
                treatment={t}
                onSettle={!useMockFallback ? () => settleMutation.mutate(t.id) : undefined}
              />
            ))}
          </div>
        )}
      </div>

      {/* Don't Forget */}
      <div className="bg-accent border border-border rounded-xl p-4 lg:p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-warning" />
            <h2 className="text-lg font-bold text-foreground">Don't Forget</h2>
          </div>
          <button
            onClick={() => navigate('/dashboard/schedule')}
            className="text-sm text-primary font-medium hover:underline flex items-center gap-1"
          >
            View All <ArrowRight className="w-3 h-3" />
          </button>
        </div>
        <ul className="space-y-1.5">
          <li className="flex items-center gap-2 text-sm text-foreground">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            <span><strong>{displayStats.treatments.followUpsDue}</strong> follow-ups today</span>
          </li>
          <li className="flex items-center gap-2 text-sm text-foreground">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            <span><strong>{displayStats.revenue.unpaidInvoices}</strong> unpaid invoices</span>
          </li>
          {'vaccinationDue' in (displayStats.animals as Record<string, unknown>) && (displayStats.animals as { vaccinationDue?: number }).vaccinationDue > 0 && (
            <li className="flex items-center gap-2 text-sm text-foreground">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              <span><strong>{(displayStats.animals as { vaccinationDue?: number }).vaccinationDue}</strong> pets due for vaccination</span>
            </li>
          )}
        </ul>
      </div>

      {/* Add New prompt */}
      <div className="text-center text-sm text-muted-foreground pb-2">
        Want to add a new vet clinic, client, revenue, pending payment, pet, or livestock?
      </div>

      {/* Add New Button (mobile) */}
      <div className="lg:hidden pb-4">
        <button
          onClick={() => setAddOpen(true)}
          className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-xl text-base hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" /> Add New
        </button>
      </div>

      {/* FAB (desktop) */}
      <button
        onClick={() => setAddOpen(true)}
        className="hidden lg:flex fixed right-8 bottom-8 w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-lg items-center justify-center hover:opacity-90 transition-opacity z-40"
      >
        <Plus className="w-6 h-6" />
      </button>

      <AddNewDialog open={addOpen} onOpenChange={setAddOpen} showVetClinic />
    </div>
  );
}

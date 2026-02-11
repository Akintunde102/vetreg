import { useQuery } from '@tanstack/react-query';
import {
  BarChart3,
  DollarSign,
  Users,
  PawPrint,
  ClipboardList,
  CalendarClock,
  FileText,
  TrendingUp,
} from 'lucide-react';
import { api } from '@/lib/api';
import { queryKeys } from '@/lib/query-keys';
import { useCurrentOrg } from '@/hooks/useCurrentOrg';
import { Skeleton } from '@/components/ui/skeleton';

export default function ReportsPage() {
  const { currentOrgId } = useCurrentOrg();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: queryKeys.dashboard.stats(currentOrgId!),
    queryFn: () => api.getDashboardStats(currentOrgId!),
    enabled: !!currentOrgId,
  });

  const { data: revenue, isLoading: revenueLoading } = useQuery({
    queryKey: queryKeys.orgs.revenue(currentOrgId!),
    queryFn: () => api.getRevenue(currentOrgId!),
    enabled: !!currentOrgId,
  });

  const isLoading = statsLoading || revenueLoading;
  const totalRevenue = revenue?.totalRevenue ?? stats?.revenue?.total ?? 0;
  const unpaidInvoices = stats?.revenue?.unpaidInvoices ?? 0;
  const completedTreatments = (stats?.treatments as { completed?: number })?.completed ?? 0;
  const scheduledCount = (stats?.treatments as { scheduled?: number })?.scheduled ?? 0;
  const followUpsDue = (stats?.treatments as { followUpsDue?: number })?.followUpsDue ?? 0;
  const clientsTotal = stats?.clients?.total ?? 0;
  const animalsTotal = stats?.animals?.total ?? 0;
  const paidCount = (revenue as { paymentBreakdown?: { PAID: { count: number } } })?.paymentBreakdown?.PAID?.count ?? 0;
  const owedCount = (revenue as { paymentBreakdown?: { OWED: { count: number } } })?.paymentBreakdown?.OWED?.count ?? 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Reports</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Summary and analytics for your practice.
        </p>
      </div>

      {/* Summary cards */}
      <section>
        <h2 className="text-lg font-semibold text-foreground mb-3">Summary</h2>
        {isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Total revenue</p>
                <p className="text-lg font-bold text-foreground">
                  ₦{totalRevenue.toLocaleString()}
                </p>
              </div>
            </div>
            <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <ClipboardList className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Treatments</p>
                <p className="text-lg font-bold text-foreground">
                  {completedTreatments} completed · {scheduledCount} scheduled
                </p>
              </div>
            </div>
            <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Clients</p>
                <p className="text-lg font-bold text-foreground">{clientsTotal}</p>
              </div>
            </div>
            <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <PawPrint className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Animals</p>
                <p className="text-lg font-bold text-foreground">{animalsTotal}</p>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Payments snapshot */}
      <section>
        <h2 className="text-lg font-semibold text-foreground mb-3">Payments snapshot</h2>
        {isLoading ? (
          <Skeleton className="h-20 rounded-xl" />
        ) : (
          <div className="bg-card border border-border rounded-xl p-4 grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Paid invoices</p>
              <p className="text-xl font-bold text-foreground">{paidCount}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Unpaid / owed</p>
              <p className="text-xl font-bold text-foreground">{owedCount}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Follow-ups due today</p>
              <p className="text-xl font-bold text-foreground">{followUpsDue}</p>
            </div>
          </div>
        )}
      </section>

      {/* Placeholder report sections */}
      <section>
        <h2 className="text-lg font-semibold text-foreground mb-3">Report types</h2>
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="bg-card border border-border rounded-xl p-5 flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Revenue over time</h3>
              <p className="text-sm text-muted-foreground mt-0.5">
                Monthly and weekly revenue trends. Coming soon.
              </p>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-5 flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0">
              <ClipboardList className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Treatments by type</h3>
              <p className="text-sm text-muted-foreground mt-0.5">
                Breakdown by diagnosis and category. Coming soon.
              </p>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-5 flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
              <CalendarClock className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Schedule & follow-ups</h3>
              <p className="text-sm text-muted-foreground mt-0.5">
                Appointment and follow-up compliance. Coming soon.
              </p>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-5 flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Export & print</h3>
              <p className="text-sm text-muted-foreground mt-0.5">
                Export reports to PDF or CSV. Coming soon.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="flex flex-col items-center justify-center py-8 bg-card border border-border rounded-xl">
        <BarChart3 className="w-12 h-12 text-muted-foreground opacity-40 mb-3" />
        <p className="text-muted-foreground text-sm text-center">
          More detailed reports and charts will be available in a future update.
        </p>
      </div>
    </div>
  );
}

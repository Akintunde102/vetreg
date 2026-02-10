import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, ClipboardList, Calendar, Plus } from 'lucide-react';
import { mockTreatments } from '@/lib/mock-data';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';
import { queryKeys } from '@/lib/query-keys';
import { useCurrentOrg } from '@/hooks/useCurrentOrg';

const useMockFallback = false; // Always use API

const statusTabs = [
  { label: 'All', value: 'ALL' },
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'Scheduled', value: 'SCHEDULED' },
  { label: 'Follow-up', value: 'FOLLOW_UP_REQUIRED' },
];

function getSpeciesEmoji(species: string) {
  switch (species.toLowerCase()) {
    case 'dog': return '🐕';
    case 'cat': return '🐈';
    case 'cattle': return '🐄';
    default: return '🐾';
  }
}

export default function TreatmentsPage() {
  const [search, setSearch] = useState('');
  const [activeStatus, setActiveStatus] = useState('ALL');
  const navigate = useNavigate();
  const { currentOrgId } = useCurrentOrg();

  const { data: treatmentsRes, isLoading, isError } = useQuery({
    queryKey: queryKeys.treatments.list(currentOrgId!, { search, status: activeStatus }),
    queryFn: () =>
      api.getTreatments(currentOrgId!, {
        search: search || undefined,
        status: activeStatus === 'ALL' ? undefined : activeStatus,
      }),
    enabled: !!currentOrgId && !useMockFallback,
  });

  const treatments = useMockFallback || isError ? mockTreatments : treatmentsRes?.data ?? [];

  const filtered = treatments.filter(t => {
    const matchesStatus = activeStatus === 'ALL' || t.status === activeStatus;
    const matchesSearch = !search ||
      t.diagnosis?.toLowerCase().includes(search.toLowerCase()) ||
      t.animal.name.toLowerCase().includes(search.toLowerCase()) ||
      t.treatmentGiven?.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Treatments</h1>
        <p className="text-sm text-muted-foreground mt-0.5">View all treatment records across patients.</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search treatments..."
          className="w-full h-11 pl-10 pr-4 rounded-xl bg-card border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-primary transition-colors"
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {statusTabs.map(tab => (
          <button
            key={tab.value}
            onClick={() => setActiveStatus(tab.value)}
            className={cn(
              'px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors border',
              activeStatus === tab.value
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-card text-foreground border-border hover:border-primary/30'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Cards */}
      {isLoading && !useMockFallback ? (
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-32 bg-card border border-border rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
      <div className="space-y-3 lg:grid lg:grid-cols-2 xl:grid-cols-3 lg:gap-4 lg:space-y-0">
        {filtered.map(t => (
          <div
            key={t.id}
            onClick={() => navigate(`/dashboard/animals/${t.animalId}`)}
            className="bg-card border border-border rounded-xl p-4 hover:shadow-md hover:border-primary/20 transition-all cursor-pointer"
          >
            <div className="flex gap-3">
              <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center text-lg flex-shrink-0">
                {getSpeciesEmoji(t.animal.species)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-foreground">{t.diagnosis}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {t.animal.patientType === 'BATCH_LIVESTOCK' ? `Batch ${t.animal.batchIdentifier}` : t.animal.name} · {t.organization.name}
                    </p>
                    {t.treatmentGiven && <p className="text-xs text-muted-foreground">{t.treatmentGiven}</p>}
                  </div>
                  <span className={cn(
                    'text-xs font-semibold px-2.5 py-1 rounded-lg flex-shrink-0',
                    t.status === 'COMPLETED' ? 'bg-primary/10 text-primary' :
                    t.status === 'FOLLOW_UP_REQUIRED' ? 'bg-warning/10 text-warning border border-warning/20' :
                    'bg-accent text-foreground'
                  )}>
                    {t.status === 'COMPLETED' ? 'Done' : t.status === 'FOLLOW_UP_REQUIRED' ? 'Follow-up' : 'Scheduled'}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Calendar className="w-3 h-3" />
                <span>{format(parseISO(t.visitDate), 'MMM dd, yyyy')}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-foreground">₦{(t.amount || 0).toLocaleString()}</span>
                <span className={cn('w-2 h-2 rounded-full', t.paymentStatus === 'PAID' ? 'bg-primary' : 'bg-destructive')} />
              </div>
            </div>
          </div>
        ))}
      </div>
      )}

      {filtered.length === 0 && !isLoading && (
        <div className="text-center py-16 text-muted-foreground">
          <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No treatments found</p>
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => navigate('/dashboard/schedule')}
        className="hidden lg:flex fixed right-8 bottom-8 items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold text-sm shadow-lg hover:opacity-90 transition-opacity z-40"
      >
        <Plus className="w-4 h-4" /> New Treatment
      </button>
    </div>
  );
}

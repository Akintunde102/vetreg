import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Search, Plus, Building2, ArrowRight, AlertCircle } from 'lucide-react';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { queryKeys } from '@/lib/query-keys';
import { useOrgStore } from '@/lib/stores/org-store';
import { mockOrganizations } from '@/lib/mock-data';
import { AddNewDialog } from '@/components/AddNewDialog';

const useMockFallback = false; // Always use API

export default function OrganizationsPage() {
  const [search, setSearch] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { setCurrentOrgId } = useOrgStore();

  const { data: orgs = [], isError } = useQuery({
    queryKey: queryKeys.orgs.all,
    queryFn: () => api.getOrganizations(),
    staleTime: 5 * 60 * 1000,
    enabled: !useMockFallback,
  });

  const displayOrgs = (useMockFallback || isError) ? mockOrganizations : orgs;
  const filtered = displayOrgs.filter(
    (org) =>
      org.name.toLowerCase().includes(search.toLowerCase()) ||
      (org.address?.toLowerCase().includes(search.toLowerCase())) ||
      org.city.toLowerCase().includes(search.toLowerCase())
  );
  const pending = filtered.filter((o) => o.status === 'PENDING_APPROVAL');

  const handleSwitchOrg = (orgId: string) => {
    setCurrentOrgId(orgId);
    queryClient.invalidateQueries();
    navigate('/dashboard');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Vet Clinics</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage the veterinary clinics in your network.</p>
        </div>
        <button
          onClick={() => setAddOpen(true)}
          className="hidden sm:flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" /> Add New Clinic
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search clinics..."
          className="w-full h-10 pl-10 pr-4 rounded-lg bg-card border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-primary transition-colors"
        />
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((org) => (
          <div key={org.id} className="bg-card border border-border rounded-xl p-4 hover:shadow-md hover:border-primary/20 transition-all group">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-12 h-12 rounded-lg bg-accent flex items-center justify-center relative flex-shrink-0">
                <Building2 className="w-6 h-6 text-accent-foreground" />
                {(org._counts?.clients ?? 0) > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                    {org._counts?.clients}
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-foreground truncate">{org.name}</h3>
                <p className="text-xs text-muted-foreground truncate">{org.address}, {org.city}</p>
              </div>
            </div>

            <div className="text-sm text-muted-foreground mb-2">
              <span className="font-medium text-foreground">{org._counts?.clients || 0}</span> patients referred this month
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {org.status === 'PENDING_APPROVAL' ? (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-warning">
                    <span className="w-1.5 h-1.5 rounded-full bg-warning" />
                    Pending approval
                  </span>
                ) : org.paymentTerms ? (
                  <span className="text-xs text-muted-foreground">{org.paymentTerms}</span>
                ) : null}
              </div>
              <span className="text-[10px] text-muted-foreground">
                Updated {formatDistanceToNow(parseISO(org.updatedAt))} ago
              </span>
            </div>

            <button
              onClick={() => handleSwitchOrg(org.id)}
              className="mt-3 w-full py-2 text-sm font-medium text-primary border border-primary/20 rounded-lg hover:bg-accent transition-colors flex items-center justify-center gap-1"
            >
              View <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>

      {pending.length > 0 && (
        <div className="bg-warning/5 border border-warning/20 rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-warning" />
              <h3 className="font-semibold text-foreground">Pending Verification ({pending.length})</h3>
            </div>
            <button
              onClick={() => navigate('/organizations?status=pending')}
              className="text-sm text-primary font-medium hover:underline"
            >
              View All →
            </button>
          </div>
          <p className="text-sm text-muted-foreground">New clinics awaiting approval</p>
        </div>
      )}

      <button
        onClick={() => setAddOpen(true)}
        className="sm:hidden fixed right-4 bottom-[calc(var(--bottomnav-height)+16px)] w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-lg flex items-center justify-center z-40"
        aria-label="Add new clinic"
      >
        <Plus className="w-6 h-6" />
      </button>

      <AddNewDialog
        open={addOpen}
        onOpenChange={(open) => {
          setAddOpen(open);
          if (!open) queryClient.invalidateQueries({ queryKey: queryKeys.orgs.all });
        }}
        showVetClinic
      />
    </div>
  );
}

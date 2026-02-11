import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Search, Filter, ArrowUpDown, DollarSign, Download, ExternalLink, User, Phone, Mail, Stethoscope, PawPrint } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { api } from '@/lib/api';
import { queryKeys } from '@/lib/query-keys';
import { useCurrentOrg } from '@/hooks/useCurrentOrg';
import type { Treatment } from '@/types/api';

const sortOptions = [
  { label: 'Date (Newest)', value: 'date-desc' },
  { label: 'Date (Oldest)', value: 'date-asc' },
  { label: 'Amount (High)', value: 'amount-desc' },
  { label: 'Amount (Low)', value: 'amount-asc' },
];

const categoryTabs = [
  { label: 'All', value: 'ALL' },
  { label: 'Pet', value: 'PET' },
  { label: 'Livestock', value: 'LIVESTOCK' },
  { label: 'Farm', value: 'FARM' },
];

function clientName(t: Treatment): string {
  const c = t.animal?.client;
  if (!c) return '—';
  return [c.firstName, c.lastName].filter(Boolean).join(' ') || '—';
}

export default function PaymentsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('date-desc');
  const [selectedTreatment, setSelectedTreatment] = useState<Treatment | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { currentOrgId } = useCurrentOrg();

  const { data: treatmentsRes, isLoading } = useQuery({
    queryKey: queryKeys.treatments.list(currentOrgId!, {
      payments: 'all',
      category: categoryFilter,
      status: statusFilter,
    }),
    queryFn: () =>
      api.getTreatments(currentOrgId!, {
        limit: '500',
        paymentStatus: statusFilter === 'ALL' ? undefined : statusFilter,
        paymentCategory: categoryFilter === 'ALL' ? undefined : categoryFilter,
      }),
    enabled: !!currentOrgId,
  });

  const allTreatments = treatmentsRes?.data ?? [];

  const filtered = allTreatments
    .filter(t => {
      const matchesSearch = search === '' ||
        t.animal?.name?.toLowerCase().includes(search.toLowerCase()) ||
        t.organization?.name?.toLowerCase().includes(search.toLowerCase()) ||
        t.diagnosis?.toLowerCase().includes(search.toLowerCase()) ||
        clientName(t).toLowerCase().includes(search.toLowerCase());
      return matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'date-desc') return new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime();
      if (sortBy === 'date-asc') return new Date(a.visitDate).getTime() - new Date(b.visitDate).getTime();
      if (sortBy === 'amount-desc') return (b.amount || 0) - (a.amount || 0);
      return (a.amount || 0) - (b.amount || 0);
    });

  const totalPaid = filtered.filter(t => t.paymentStatus === 'PAID').reduce((s, t) => s + (t.amount || 0), 0);
  const totalOwed = filtered.filter(t => t.paymentStatus === 'OWED').reduce((s, t) => s + (t.amount || 0), 0);

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Payment History</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Full transaction log across all organizations.</p>
        </div>
        <button
          onClick={() => toast({ title: 'Export started', description: 'Your CSV download will begin shortly.' })}
          className="hidden lg:flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-xl text-sm font-medium text-foreground hover:bg-muted transition-colors"
        >
          <Download className="w-4 h-4" /> Export
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-xs text-muted-foreground">Total Transactions</p>
          <p className="text-2xl font-bold text-foreground">{filtered.length}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-xs text-muted-foreground">Paid</p>
          <p className="text-2xl font-bold text-primary">₦{totalPaid.toLocaleString()}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 col-span-2 lg:col-span-1">
          <p className="text-xs text-muted-foreground">Outstanding</p>
          <p className="text-2xl font-bold text-destructive">₦{totalOwed.toLocaleString()}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by patient, clinic, or diagnosis..."
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-card border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-primary transition-colors"
          />
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <button className="p-2.5 bg-card border border-border rounded-xl hover:bg-muted transition-colors">
              <Filter className="w-4 h-4 text-muted-foreground" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-2" align="end">
            <p className="text-xs font-semibold text-muted-foreground uppercase px-2 pb-1">Status</p>
            {['ALL', 'PAID', 'OWED'].map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={cn('w-full text-left px-3 py-2 text-sm rounded-lg transition-colors', statusFilter === s ? 'bg-primary/10 text-primary font-semibold' : 'hover:bg-muted text-foreground')}
              >
                {s === 'ALL' ? 'All' : s === 'PAID' ? 'Paid' : 'Pending'}
              </button>
            ))}
          </PopoverContent>
        </Popover>
        <Popover>
          <PopoverTrigger asChild>
            <button className="p-2.5 bg-card border border-border rounded-xl hover:bg-muted transition-colors">
              <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-2" align="end">
            <p className="text-xs font-semibold text-muted-foreground uppercase px-2 pb-1">Sort by</p>
            {sortOptions.map(opt => (
              <button
                key={opt.value}
                onClick={() => setSortBy(opt.value)}
                className={cn('w-full text-left px-3 py-2 text-sm rounded-lg transition-colors', sortBy === opt.value ? 'bg-primary/10 text-primary font-semibold' : 'hover:bg-muted text-foreground')}
              >
                {opt.label}
              </button>
            ))}
          </PopoverContent>
        </Popover>
      </div>

      {/* Status tabs */}
      <div className="flex flex-wrap gap-2">
        {['ALL', 'PAID', 'OWED'].map(s => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={cn(
              'px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors border',
              statusFilter === s
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-card text-foreground border-border hover:border-primary/30'
            )}
          >
            {s === 'ALL' ? 'All' : s === 'PAID' ? 'Paid' : 'Pending'}
          </button>
        ))}
      </div>

      {/* Category tabs (Pet / Livestock) */}
      <div className="flex flex-wrap gap-2">
        {categoryTabs.map(({ label, value }) => (
          <button
            key={value}
            onClick={() => setCategoryFilter(value)}
            className={cn(
              'px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors border',
              categoryFilter === value
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-card text-foreground border-border hover:border-primary/30'
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Mobile card view */}
      <div className="space-y-3 lg:hidden">
        {filtered.map(t => (
          <div
            key={t.id}
            role="button"
            tabIndex={0}
            onClick={() => setSelectedTreatment(t)}
            onKeyDown={e => e.key === 'Enter' && setSelectedTreatment(t)}
            className="bg-card border border-border rounded-xl p-4 cursor-pointer hover:bg-muted/50 transition-colors"
          >
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center text-base flex-shrink-0">
                {t.animal.species === 'Dog' ? '🐕' : t.animal.species === 'Cat' ? '🐈' : '🐄'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">{clientName(t)}</p>
                    <h3 className="font-bold text-sm text-foreground">
                      {t.animal.patientType === 'BATCH_LIVESTOCK' ? `Batch ${t.animal.batchIdentifier}` : t.animal.name}
                    </h3>
                    <p className="text-xs text-muted-foreground">{t.diagnosis}</p>
                  </div>
                  <p className="text-sm font-bold text-foreground">₦{(t.amount || 0).toLocaleString()}</p>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-muted-foreground">{format(parseISO(t.visitDate), 'MMM dd, yyyy')}</span>
                  <span className={cn(
                    'inline-flex items-center gap-1 text-[11px] font-medium',
                    t.paymentStatus === 'PAID' ? 'text-primary' : 'text-destructive'
                  )}>
                    <span className={cn('w-1.5 h-1.5 rounded-full', t.paymentStatus === 'PAID' ? 'bg-primary' : 'bg-destructive')} />
                    {t.paymentStatus === 'PAID' ? 'Paid' : 'Pending'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop table view */}
      <div className="hidden lg:block bg-card border border-border rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Client</TableHead>
              <TableHead>Patient</TableHead>
              <TableHead>Diagnosis</TableHead>
              <TableHead>Organization</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(t => (
              <TableRow
                key={t.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => setSelectedTreatment(t)}
              >
                <TableCell className="font-medium text-foreground">{clientName(t)}</TableCell>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <span>{t.animal.species === 'Dog' ? '🐕' : t.animal.species === 'Cat' ? '🐈' : '🐄'}</span>
                    {t.animal.patientType === 'BATCH_LIVESTOCK' ? `Batch ${t.animal.batchIdentifier}` : t.animal.name}
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">{t.diagnosis}</TableCell>
                <TableCell className="text-muted-foreground">{t.organization.name}</TableCell>
                <TableCell className="text-muted-foreground">{format(parseISO(t.visitDate), 'MMM dd, yyyy')}</TableCell>
                <TableCell className="text-right font-semibold">₦{(t.amount || 0).toLocaleString()}</TableCell>
                <TableCell>
                  <span className={cn(
                    'inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full',
                    t.paymentStatus === 'PAID' ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'
                  )}>
                    <span className={cn('w-1.5 h-1.5 rounded-full', t.paymentStatus === 'PAID' ? 'bg-primary' : 'bg-destructive')} />
                    {t.paymentStatus === 'PAID' ? 'Paid' : 'Pending'}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Payment detail modal */}
      <Dialog open={!!selectedTreatment} onOpenChange={open => !open && setSelectedTreatment(null)}>
        <DialogContent className="max-w-md sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Payment details</DialogTitle>
          </DialogHeader>
          {selectedTreatment && (
            <div className="space-y-4">
              {/* Client */}
              <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" /> Client
                </p>
                <div className="space-y-1">
                  <p className="font-medium text-foreground">
                    <button
                      type="button"
                      onClick={() => {
                        const clientId = selectedTreatment.animal?.client?.id;
                        if (clientId) {
                          setSelectedTreatment(null);
                          navigate(`/dashboard/clients/${clientId}`);
                        }
                      }}
                      className="text-primary hover:underline inline-flex items-center gap-1"
                    >
                      {clientName(selectedTreatment)}
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </p>
                  {selectedTreatment.animal?.client?.phoneNumber && (
                    <a
                      href={`tel:${selectedTreatment.animal.client.phoneNumber}`}
                      className="text-sm text-muted-foreground hover:text-primary inline-flex items-center gap-1.5"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      {selectedTreatment.animal.client.phoneNumber}
                    </a>
                  )}
                  {selectedTreatment.animal?.client?.email && (
                    <a
                      href={`mailto:${selectedTreatment.animal.client.email}`}
                      className="text-sm text-muted-foreground hover:text-primary inline-flex items-center gap-1.5 block"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      {selectedTreatment.animal.client.email}
                    </a>
                  )}
                </div>
              </div>
              {/* Treatment */}
              <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                  <Stethoscope className="w-3.5 h-3.5" /> Treatment
                </p>
                <div className="space-y-1 text-sm">
                  <p className="font-medium text-foreground">{selectedTreatment.diagnosis ?? '—'}</p>
                  <p className="text-muted-foreground">
                    {format(parseISO(selectedTreatment.visitDate), 'MMM dd, yyyy')} · ₦{(selectedTreatment.amount ?? 0).toLocaleString()}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTreatment(null);
                      navigate(`/dashboard/treatments/${selectedTreatment.id}`);
                    }}
                    className="text-primary hover:underline inline-flex items-center gap-1"
                  >
                    View full treatment
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
              {/* Animal */}
              <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                  <PawPrint className="w-3.5 h-3.5" /> Patient
                </p>
                <button
                  type="button"
                  onClick={() => {
                    if (selectedTreatment.animal?.id) {
                      setSelectedTreatment(null);
                      navigate(`/dashboard/animals/${selectedTreatment.animal.id}`);
                    }
                  }}
                  className="text-primary hover:underline inline-flex items-center gap-1 font-medium"
                >
                  {selectedTreatment.animal?.patientType === 'BATCH_LIVESTOCK'
                    ? `Batch ${selectedTreatment.animal?.batchIdentifier ?? ''}`
                    : selectedTreatment.animal?.name ?? '—'}
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {isLoading && (
        <div className="text-center py-8 text-muted-foreground">Loading...</div>
      )}

      {filtered.length === 0 && !isLoading && (
        <div className="text-center py-16 text-muted-foreground">
          <DollarSign className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No transactions found</p>
        </div>
      )}
    </div>
  );
}

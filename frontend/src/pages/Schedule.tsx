import { useState, useMemo } from 'react';
import { format, isToday, addDays } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { AddNewDialog } from '@/components/AddNewDialog';
import { Search, CalendarDays, Clock, ChevronRight, AlertCircle, ArrowRight, Plus } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { parseISO } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import { queryKeys } from '@/lib/query-keys';
import { useCurrentOrg } from '@/hooks/useCurrentOrg';
import type { Treatment } from '@/types/api';


function getSpeciesEmoji(species: string) {
  switch (species.toLowerCase()) {
    case 'dog': return '🐕';
    case 'cat': return '🐈';
    case 'cattle': return '🐄';
    default: return '🐾';
  }
}

type ViewMode = 'today' | 'week' | 'all';

export default function SchedulePage() {
  const today = new Date();
  const [viewMode, setViewMode] = useState<ViewMode>('today');
  const [date, setDate] = useState<Date>(() => new Date());
  const [search, setSearch] = useState('');
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState<string | null>(null);
  const [selectedApptTreatment, setSelectedApptTreatment] = useState<Treatment | null>(null);
  const [newDate, setNewDate] = useState<Date | undefined>(undefined);
  const [addOpen, setAddOpen] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [summaryTreatment, setSummaryTreatment] = useState<Treatment | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentOrgId } = useCurrentOrg();

  const isSelectedToday = isToday(date);
  const rangeFrom = viewMode === 'today' ? date : today;
  const rangeTo = viewMode === 'today' ? date : viewMode === 'week' ? addDays(today, 6) : addDays(today, 29);
  const fromStr = format(rangeFrom, 'yyyy-MM-dd');
  const toStr = format(rangeTo, 'yyyy-MM-dd');
  const useSingleDayApi = viewMode === 'today' && isSelectedToday;

  const { data: scheduledTodayData } = useQuery({
    queryKey: queryKeys.dashboard.scheduledToday(currentOrgId!),
    queryFn: () => api.getScheduledToday(currentOrgId!),
    enabled: !!currentOrgId && useSingleDayApi,
  });
  const { data: followUpsData } = useQuery({
    queryKey: queryKeys.dashboard.followUpsToday(currentOrgId!),
    queryFn: () => api.getFollowUpsToday(currentOrgId!),
    enabled: !!currentOrgId && useSingleDayApi,
  });
  const { data: scheduledListData } = useQuery({
    queryKey: queryKeys.treatments.scheduledList(currentOrgId!, fromStr, toStr),
    queryFn: () =>
      api.getScheduledList(currentOrgId!, { from: fromStr, to: toStr, limit: '200' }),
    enabled: !!currentOrgId && !useSingleDayApi && !!fromStr && !!toStr,
  });
  const { data: followUpsInRangeData } = useQuery({
    queryKey: queryKeys.treatments.followUpsInRange(currentOrgId!, fromStr, toStr),
    queryFn: () => api.getFollowUpsInRange(currentOrgId!, fromStr, toStr),
    enabled: !!currentOrgId && !useSingleDayApi && !!fromStr && !!toStr,
  });
  const { data: dashboardStats } = useQuery({
    queryKey: queryKeys.dashboard.stats(currentOrgId!),
    queryFn: () => api.getDashboardStats(currentOrgId!),
    enabled: !!currentOrgId,
  });

  const appointments: Treatment[] = !currentOrgId
    ? []
    : useMemo(() => {
        if (useSingleDayApi) {
          const scheduled = (scheduledTodayData as { treatments?: Treatment[] })?.treatments ?? [];
          const followUps = (followUpsData as { treatments?: Treatment[] })?.treatments ?? [];
          const ids = new Set(scheduled.map((t) => t.id));
          const combined = [...scheduled];
          for (const t of followUps) if (!ids.has(t.id)) { combined.push(t); ids.add(t.id); }
          return combined;
        }
        const scheduled = scheduledListData?.treatments ?? [];
        const followUps = followUpsInRangeData?.treatments ?? [];
        const ids = new Set(scheduled.map((t) => t.id));
        const combined = [...scheduled];
        for (const t of followUps) if (!ids.has(t.id)) { combined.push(t); ids.add(t.id); }
        return combined;
      }, [useSingleDayApi, scheduledTodayData, followUpsData, scheduledListData, followUpsInRangeData]);

  const filtered = appointments.filter(a => {
    if (!search) return true;
    return a.diagnosis?.toLowerCase().includes(search.toLowerCase()) ||
      a.animal.name.toLowerCase().includes(search.toLowerCase()) ||
      a.animal.client.firstName.toLowerCase().includes(search.toLowerCase());
  });

  const getSortTime = (t: Treatment) => {
    const d = t.scheduledFor || t.followUpDate;
    return d ? new Date(d).getTime() : 0;
  };
  const sorted = [...filtered].sort((a, b) => getSortTime(a) - getSortTime(b));

  const byDate = useMemo(() => {
    const map = new Map<string, Treatment[]>();
    for (const t of sorted) {
      const d = t.scheduledFor ? format(parseISO(t.scheduledFor), 'yyyy-MM-dd') : (t.followUpDate ? format(parseISO(t.followUpDate), 'yyyy-MM-dd') : '');
      if (!d) continue;
      if (!map.has(d)) map.set(d, []);
      map.get(d)!.push(t);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [sorted]);

  const handleReschedule = (e: React.MouseEvent, appt: Treatment) => {
    e.stopPropagation();
    setSelectedAppt(appt.id);
    setSelectedApptTreatment(appt);
    setNewDate(undefined);
    setRescheduleOpen(true);
  };

  const confirmReschedule = () => {
    if (newDate) {
      toast({
        title: 'Appointment rescheduled',
        description: `Moved to ${format(newDate, 'MMM d, yyyy')}`,
      });
    }
    setRescheduleOpen(false);
    setSelectedApptTreatment(null);
  };

  const openSummary = (appt: Treatment) => {
    setSummaryTreatment(appt);
    setSummaryOpen(true);
  };

  const onSelectedDay = (d: string | undefined, dayStr: string) => d && format(parseISO(d), 'yyyy-MM-dd') === dayStr;
  const renderApptCard = (appt: Treatment, dayStr: string) => {
    const time = (appt.scheduledFor && onSelectedDay(appt.scheduledFor, dayStr))
      ? format(parseISO(appt.scheduledFor), 'h:mm a')
      : (appt.followUpDate ? format(parseISO(appt.followUpDate), 'h:mm a') : '');
    const ownerName = `${appt.animal.client.firstName} ${appt.animal.client.lastName}`;
    const isFollowUp = !!appt.followUpDate && onSelectedDay(appt.followUpDate, dayStr);
    return (
      <div
        key={appt.id}
        role="button"
        tabIndex={0}
        onClick={() => openSummary(appt)}
        onKeyDown={(e) => e.key === 'Enter' && openSummary(appt)}
        className="bg-card border border-border rounded-xl p-4 hover:shadow-md transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-bold text-foreground">{time}</span>
              <span className="text-sm text-muted-foreground">· {appt.diagnosis}</span>
              {isFollowUp && (
                <span className="text-[10px] font-semibold text-warning border border-warning/30 px-2 py-0.5 rounded-full">
                  Follow-up
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center text-lg flex-shrink-0">
                {getSpeciesEmoji(appt.animal.species)}
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {appt.animal.patientType === 'BATCH_LIVESTOCK'
                    ? `Batch ${appt.animal.batchIdentifier} · ${appt.animal.batchSize} ${appt.animal.species.toLowerCase()}`
                    : `${appt.animal.name}, ${appt.animal.breed || appt.animal.species}`
                  }
                </p>
                <p className="text-xs text-muted-foreground">{ownerName}</p>
              </div>
            </div>
            {appt.amount && (
              <div className="flex items-center gap-3 mt-2">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-primary" /> Outstanding
                </span>
                {isFollowUp && (
                  <span className="text-sm font-bold text-foreground">₦{appt.amount.toLocaleString()}</span>
                )}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={(e) => handleReschedule(e, appt)}
            className="px-4 py-1.5 bg-primary text-primary-foreground text-xs font-semibold rounded-lg hover:opacity-90 transition-opacity flex-shrink-0"
          >
            Reschedule
          </button>
        </div>
        {appt.paymentStatus === 'OWED' && (
          <div className="mt-2 pt-2 border-t border-border">
            <span className="text-xs font-medium text-destructive">Overdue</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Upcoming Appointments</h1>
        <p className="text-sm text-muted-foreground mt-0.5">View by day, week, or all upcoming schedules.</p>
      </div>

      {/* Tabs: Today | Week | All */}
      <div className="flex gap-1 p-1 rounded-xl bg-muted/50 border border-border w-fit">
        {(['today', 'week', 'all'] as const).map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() => setViewMode(mode)}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              viewMode === mode
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            )}
          >
            {mode === 'today' ? 'Today' : mode === 'week' ? 'This week' : 'All upcoming'}
          </button>
        ))}
      </div>

      {/* Date Picker – only when viewing single day */}
      {viewMode === 'today' && (
        <Popover>
          <PopoverTrigger asChild>
            <button className="w-full flex items-center gap-3 bg-card border border-border rounded-xl px-4 py-2.5 hover:border-primary/30 transition-colors">
              <CalendarDays className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-foreground">
                {isSelectedToday ? 'Today' : format(date, 'EEEE')}, {format(date, 'MMM d')}
              </span>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(d) => d && setDate(d)}
              className={cn("p-3 pointer-events-auto")}
            />
          </PopoverContent>
        </Popover>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search upcoming visits..."
          className="w-full h-11 pl-10 pr-4 rounded-xl bg-card border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-primary transition-colors"
        />
      </div>

      {/* Appointment Cards */}
      <div id="appointments-list" className="space-y-4">
        {viewMode === 'today' ? (
          <div className="space-y-3 lg:grid lg:grid-cols-2 xl:grid-cols-3 lg:gap-4 lg:space-y-0">
            {sorted.map((appt) => renderApptCard(appt, fromStr))}
          </div>
        ) : (
          byDate.map(([dateStr, items]) => (
            <div key={dateStr} className="space-y-2">
              <h3 className="text-sm font-semibold text-foreground sticky top-[var(--topbar-height)] bg-background/95 py-1 z-10">
                {dateStr === format(today, 'yyyy-MM-dd') ? 'Today' : format(parseISO(dateStr), 'EEEE, MMM d')}
              </h3>
              <div className="space-y-3 lg:grid lg:grid-cols-2 xl:grid-cols-3 lg:gap-4 lg:space-y-0">
                {items.map((appt) => renderApptCard(appt, dateStr))}
              </div>
            </div>
          ))
        )}
      </div>

      {sorted.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <CalendarDays className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>{viewMode === 'today' ? 'No appointments scheduled' : 'No appointments in this range'}</p>
        </div>
      )}

      {/* Don't Forget – real counts from dashboard */}
      <div className="bg-accent border border-border rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-warning" />
            <h3 className="font-bold text-foreground">Don't Forget</h3>
          </div>
          <button
            onClick={() => document.getElementById('appointments-list')?.scrollIntoView({ behavior: 'smooth' })}
            className="text-sm text-primary font-medium hover:underline flex items-center gap-1"
          >
            View All <ArrowRight className="w-3 h-3" />
          </button>
        </div>
        <ul className="space-y-1">
          <li className="flex items-center gap-2 text-sm text-foreground">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            <strong>{(followUpsData as { treatments?: unknown[] })?.treatments?.length ?? (followUpsData as { count?: number })?.count ?? 0}</strong> follow-ups today
          </li>
          <li className="flex items-center gap-2 text-sm text-foreground">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            <strong>{dashboardStats?.revenue?.unpaidInvoices ?? 0}</strong> unpaid invoices
          </li>
        </ul>
      </div>

      {/* Add New (mobile) */}
      <div className="lg:hidden pb-4">
        <button
          onClick={() => setAddOpen(true)}
          className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-xl text-base hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" /> Add New
        </button>
      </div>

      <AddNewDialog open={addOpen} onOpenChange={setAddOpen} defaultType="appointment" />

      {/* Reschedule Modal */}
      <Dialog open={rescheduleOpen} onOpenChange={(open) => { if (!open) setSelectedApptTreatment(null); setRescheduleOpen(open); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reschedule Appointment</DialogTitle>
            <DialogDescription>Pick a new date for this appointment.</DialogDescription>
          </DialogHeader>
          {selectedApptTreatment && (
            <div className="rounded-lg bg-muted/50 border border-border p-3 text-sm space-y-1">
              <p className="text-muted-foreground">
                <span className="font-medium text-foreground">Created:</span>{' '}
                {selectedApptTreatment.createdAt
                  ? format(parseISO(selectedApptTreatment.createdAt), 'MMM d, yyyy')
                  : '—'}
              </p>
              {selectedApptTreatment.followUpDate && (
                <p className="text-muted-foreground">
                  <span className="font-medium text-foreground">Original follow-up date:</span>{' '}
                  {format(parseISO(selectedApptTreatment.followUpDate), 'MMM d, yyyy')}
                </p>
              )}
            </div>
          )}
          <Calendar
            mode="single"
            selected={newDate}
            onSelect={setNewDate}
            className="p-3 pointer-events-auto mx-auto"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => { setRescheduleOpen(false); setSelectedApptTreatment(null); }}>Cancel</Button>
            <Button onClick={confirmReschedule} disabled={!newDate}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Treatment summary popup */}
      <Dialog open={summaryOpen} onOpenChange={(open) => { if (!open) setSummaryTreatment(null); setSummaryOpen(open); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Treatment summary</DialogTitle>
            <DialogDescription>Original treatment for this appointment.</DialogDescription>
          </DialogHeader>
          {summaryTreatment && (
            <div className="space-y-3 text-sm">
              <p><span className="font-medium text-muted-foreground">Diagnosis:</span> {summaryTreatment.diagnosis ?? '—'}</p>
              <p><span className="font-medium text-muted-foreground">Animal:</span> {summaryTreatment.animal?.name ?? '—'} {summaryTreatment.animal?.species ? `(${summaryTreatment.animal.species})` : ''}</p>
              <p><span className="font-medium text-muted-foreground">Client:</span> {summaryTreatment.animal?.client ? `${summaryTreatment.animal.client.firstName} ${summaryTreatment.animal.client.lastName}` : '—'}</p>
              {summaryTreatment.visitDate && (
                <p><span className="font-medium text-muted-foreground">Visit date:</span> {format(parseISO(summaryTreatment.visitDate), 'MMM d, yyyy')}</p>
              )}
              {summaryTreatment.followUpDate && (
                <p><span className="font-medium text-muted-foreground">Follow-up date:</span> {format(parseISO(summaryTreatment.followUpDate), 'MMM d, yyyy')}</p>
              )}
              {summaryTreatment.amount != null && (
                <p><span className="font-medium text-muted-foreground">Amount:</span> ₦{Number(summaryTreatment.amount).toLocaleString()} {summaryTreatment.paymentStatus ? `(${summaryTreatment.paymentStatus})` : ''}</p>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSummaryOpen(false)}>Close</Button>
            {summaryTreatment && (
              <Button onClick={() => { navigate(`/dashboard/treatments/${summaryTreatment.id}`); setSummaryOpen(false); }}>
                View full treatment <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

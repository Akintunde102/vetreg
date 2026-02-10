import { useState, useMemo } from 'react';
import { format, isToday } from 'date-fns';
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

export default function SchedulePage() {
  const [date, setDate] = useState<Date>(new Date());
  const [search, setSearch] = useState('');
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState<string | null>(null);
  const [newDate, setNewDate] = useState<Date | undefined>(undefined);
  const [addOpen, setAddOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentOrgId } = useCurrentOrg();

  const isSelectedToday = isToday(date);
  const fromStr = format(date, 'yyyy-MM-dd');
  const toStr = format(date, 'yyyy-MM-dd');

  const { data: scheduledTodayData } = useQuery({
    queryKey: queryKeys.dashboard.scheduledToday(currentOrgId!),
    queryFn: () => api.getScheduledToday(currentOrgId!),
    enabled: !!currentOrgId && isSelectedToday,
  });
  const { data: followUpsData } = useQuery({
    queryKey: queryKeys.dashboard.followUpsToday(currentOrgId!),
    queryFn: () => api.getFollowUpsToday(currentOrgId!),
    enabled: !!currentOrgId && isSelectedToday,
  });
  const { data: scheduledListData } = useQuery({
    queryKey: queryKeys.treatments.scheduledList(currentOrgId!, fromStr, toStr),
    queryFn: () =>
      api.getScheduledList(currentOrgId!, { from: fromStr, to: toStr, limit: '100' }),
    enabled: !!currentOrgId && !isSelectedToday,
  });
  const { data: dashboardStats } = useQuery({
    queryKey: queryKeys.dashboard.stats(currentOrgId!),
    queryFn: () => api.getDashboardStats(currentOrgId!),
    enabled: !!currentOrgId,
  });

  const appointments: Treatment[] = !currentOrgId
    ? []
    : useMemo(() => {
        if (isSelectedToday) {
          const scheduled = (scheduledTodayData as { treatments?: Treatment[] })?.treatments ?? [];
          const followUps = (followUpsData as { treatments?: Treatment[] })?.treatments ?? [];
          const ids = new Set(scheduled.map((t) => t.id));
          const combined = [...scheduled];
          for (const t of followUps) if (!ids.has(t.id)) { combined.push(t); ids.add(t.id); }
          return combined;
        }
        return scheduledListData?.treatments ?? [];
      }, [isSelectedToday, scheduledTodayData, followUpsData, scheduledListData]);

  const filtered = appointments.filter(a => {
    if (!search) return true;
    return a.diagnosis?.toLowerCase().includes(search.toLowerCase()) ||
      a.animal.name.toLowerCase().includes(search.toLowerCase()) ||
      a.animal.client.firstName.toLowerCase().includes(search.toLowerCase());
  });

  const sorted = [...filtered].sort((a, b) => {
    const timeA = a.scheduledFor ? new Date(a.scheduledFor).getTime() : 0;
    const timeB = b.scheduledFor ? new Date(b.scheduledFor).getTime() : 0;
    return timeA - timeB;
  });

  const handleReschedule = (apptId: string) => {
    setSelectedAppt(apptId);
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
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Upcoming Appointments</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Review your scheduled client visits.</p>
      </div>

      {/* Date Picker */}
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
      <div id="appointments-list" className="space-y-3 lg:grid lg:grid-cols-2 xl:grid-cols-3 lg:gap-4 lg:space-y-0">
        {sorted.map(appt => {
          const time = appt.scheduledFor ? format(parseISO(appt.scheduledFor), 'h:mm a') : '';
          const ownerName = `${appt.animal.client.firstName} ${appt.animal.client.lastName}`;
          const isFollowUp = appt.status === 'FOLLOW_UP_REQUIRED';

          return (
            <div key={appt.id} className="bg-card border border-border rounded-xl p-4 hover:shadow-md transition-all">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-foreground">{time}</span>
                    <span className="text-sm text-muted-foreground">· {appt.diagnosis}</span>
                    {isFollowUp && (
                      <span className="text-[10px] font-semibold text-warning border border-warning/30 px-2 py-0.5 rounded-full">
                        Client 3 days ago
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
                        <span className="w-2 h-2 rounded-full bg-primary" /> Outstanding 1 foot
                      </span>
                      {isFollowUp && (
                        <span className="text-sm font-bold text-foreground">₦{appt.amount.toLocaleString()}</span>
                      )}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => handleReschedule(appt.id)}
                  className="px-4 py-1.5 bg-primary text-primary-foreground text-xs font-semibold rounded-lg hover:opacity-90 transition-opacity flex-shrink-0"
                >
                  Reschedule
                </button>
              </div>

              {appt.paymentStatus === 'OWED' && (
                <div className="mt-2 pt-2 border-t border-border">
                  <span className="text-xs font-medium text-destructive">Overdue 2 pets</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {sorted.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <CalendarDays className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No appointments scheduled</p>
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
            <strong>{dashboardStats?.treatments?.followUpsDue ?? 0}</strong> follow-ups today
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
      <Dialog open={rescheduleOpen} onOpenChange={setRescheduleOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reschedule Appointment</DialogTitle>
            <DialogDescription>Pick a new date for this appointment.</DialogDescription>
          </DialogHeader>
          <Calendar
            mode="single"
            selected={newDate}
            onSelect={setNewDate}
            className="p-3 pointer-events-auto mx-auto"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRescheduleOpen(false)}>Cancel</Button>
            <Button onClick={confirmReschedule} disabled={!newDate}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

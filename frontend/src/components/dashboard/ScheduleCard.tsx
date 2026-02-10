import type { Treatment } from '@/types/api';
import { format, parseISO } from 'date-fns';
import { Clock, PawPrint, CalendarCheck } from 'lucide-react';

interface ScheduleCardProps {
  treatment: Treatment;
  kind?: 'scheduled' | 'followUp';
  onSettle?: () => void;
  onView?: () => void;
}

export function ScheduleCard({ treatment, kind = 'scheduled', onSettle, onView }: ScheduleCardProps) {
  const dateIso = kind === 'followUp' ? treatment.followUpDate : treatment.scheduledFor;
  const time = dateIso ? format(parseISO(dateIso), 'h:mm a') : '';
  const isFollowUp = kind === 'followUp';

  return (
    <div className="flex items-center gap-4 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors group">
      <div className="flex items-center gap-1.5 text-muted-foreground min-w-[80px]">
        {isFollowUp ? (
          <CalendarCheck className="w-3.5 h-3.5" />
        ) : (
          <Clock className="w-3.5 h-3.5" />
        )}
        <span className="text-sm font-medium">{time}</span>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          {isFollowUp && (
            <span className="text-[10px] font-semibold uppercase tracking-wide text-warning bg-warning/10 px-1.5 py-0.5 rounded">
              Follow-up
            </span>
          )}
          <p className="text-sm font-semibold text-foreground truncate">{treatment.diagnosis || 'General Check'}</p>
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <PawPrint className="w-3 h-3 text-primary" />
          <span className="text-xs text-muted-foreground truncate">
            {treatment.animal?.name} ({treatment.animal?.client?.firstName} {treatment.animal?.client?.lastName})
          </span>
        </div>
      </div>

      {isFollowUp ? (
        <button
          onClick={(e) => { e.stopPropagation(); onView?.(); }}
          className="px-3 py-1.5 text-xs font-medium bg-primary text-primary-foreground rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:opacity-90"
        >
          View
        </button>
      ) : (
        <button
          onClick={(e) => { e.stopPropagation(); onSettle?.(); }}
          className="px-3 py-1.5 text-xs font-medium bg-primary text-primary-foreground rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:opacity-90"
        >
          Settle
        </button>
      )}
    </div>
  );
}

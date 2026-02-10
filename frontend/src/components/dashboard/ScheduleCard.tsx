import type { Treatment } from '@/types/api';
import { format, parseISO } from 'date-fns';
import { Clock, PawPrint } from 'lucide-react';

interface ScheduleCardProps {
  treatment: Treatment;
  onSettle?: () => void;
}

export function ScheduleCard({ treatment, onSettle }: ScheduleCardProps) {
  const time = treatment.scheduledFor ? format(parseISO(treatment.scheduledFor), 'h:mm a') : '';

  return (
    <div className="flex items-center gap-4 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors group">
      <div className="flex items-center gap-1.5 text-muted-foreground min-w-[80px]">
        <Clock className="w-3.5 h-3.5" />
        <span className="text-sm font-medium">{time}</span>
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground truncate">{treatment.diagnosis || 'General Check'}</p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <PawPrint className="w-3 h-3 text-primary" />
          <span className="text-xs text-muted-foreground truncate">
            {treatment.animal.name} ({treatment.animal.client.firstName} {treatment.animal.client.lastName})
          </span>
        </div>
      </div>

      <button
        onClick={(e) => { e.stopPropagation(); onSettle?.(); }}
        className="px-3 py-1.5 text-xs font-medium bg-primary text-primary-foreground rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:opacity-90"
      >
        Settle
      </button>
    </div>
  );
}

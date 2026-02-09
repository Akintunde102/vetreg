import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsWidgetProps {
  icon: LucideIcon;
  value: number | string;
  label: string;
  badge?: number;
  variant?: 'default' | 'warning';
  onClick?: () => void;
}

export function StatsWidget({ icon: Icon, value, label, badge, variant = 'default', onClick }: StatsWidgetProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'bg-card border border-border rounded-xl p-3 lg:p-4 text-center hover:shadow-md hover:border-primary/30 transition-all group relative flex flex-col items-center gap-1',
        variant === 'warning' && 'border-warning/20 bg-warning/5'
      )}
    >
      {badge !== undefined && badge > 0 && (
        <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1.5 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
          {badge}
        </span>
      )}
      <div className={cn(
        'w-10 h-10 lg:w-12 lg:h-12 rounded-xl flex items-center justify-center',
        variant === 'warning' ? 'bg-warning/10' : 'bg-primary/10'
      )}>
        <Icon className={cn(
          'w-5 h-5 lg:w-6 lg:h-6',
          variant === 'warning' ? 'text-warning' : 'text-primary'
        )} />
      </div>
      <p className="text-xs text-muted-foreground mt-1 leading-tight">{label}</p>
      {typeof value === 'string' && value.startsWith('₦') ? (
        <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full mt-0.5">{value}</span>
      ) : (
        badge !== undefined && badge > 0 ? null : 
        <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full mt-0.5">{value}</span>
      )}
    </button>
  );
}

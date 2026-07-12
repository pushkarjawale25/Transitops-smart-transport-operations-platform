import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type Tone = 'green' | 'blue' | 'amber' | 'red' | 'gray' | 'purple';

const toneClasses: Record<Tone, string> = {
  green: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400',
  blue: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400',
  amber: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400',
  red: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400',
  gray: 'bg-slate-200 text-slate-700 dark:bg-slate-700/40 dark:text-slate-300',
  purple: 'bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-400',
};

export function StatusBadge({ status, tone }: { status: string; tone: Tone }) {
  return (
    <Badge variant="outline" className={cn('border-transparent font-medium', toneClasses[tone])}>
      {status}
    </Badge>
  );
}

export function vehicleStatusTone(status: string): Tone {
  switch (status) {
    case 'Available': return 'green';
    case 'On Trip': return 'blue';
    case 'In Shop': return 'amber';
    case 'Retired': return 'gray';
    default: return 'gray';
  }
}

export function driverStatusTone(status: string): Tone {
  switch (status) {
    case 'Available': return 'green';
    case 'On Trip': return 'blue';
    case 'Off Duty': return 'gray';
    case 'Suspended': return 'red';
    default: return 'gray';
  }
}

export function tripStatusTone(status: string): Tone {
  switch (status) {
    case 'Draft': return 'gray';
    case 'Dispatched': return 'blue';
    case 'Completed': return 'green';
    case 'Cancelled': return 'red';
    default: return 'gray';
  }
}

export function maintenanceStatusTone(status: string): Tone {
  switch (status) {
    case 'Scheduled': return 'gray';
    case 'In Progress': return 'amber';
    case 'Completed': return 'green';
    default: return 'gray';
  }
}

export function safetyScoreTone(score: number): Tone {
  if (score >= 85) return 'green';
  if (score >= 70) return 'amber';
  return 'red';
}

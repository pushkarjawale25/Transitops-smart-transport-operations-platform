import { cn } from '@/utils/helpers'

const badgeVariants = {
  default: 'bg-primary/10 text-primary border-primary/20',
  secondary: 'bg-secondary text-secondary-foreground border-border',
  destructive: 'bg-destructive/10 text-destructive border-destructive/20',
  success: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  warning: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  outline: 'border border-border text-foreground',
}

export function Badge({ className, variant = 'default', children, ...props }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors',
        badgeVariants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}

export function StatusBadge({ status }) {
  const map = {
    Available: 'success',
    'On Trip': 'default',
    'In Shop': 'warning',
    Retired: 'secondary',
    'Off Duty': 'secondary',
    Suspended: 'destructive',
    Draft: 'secondary',
    Dispatched: 'default',
    Completed: 'success',
    Cancelled: 'destructive',
    'In Progress': 'warning',
    Scheduled: 'outline',
  }
  return <Badge variant={map[status] || 'secondary'}>{status}</Badge>
}

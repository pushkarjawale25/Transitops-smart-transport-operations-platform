import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';

interface KpiCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  gradient: string;
  trend?: { value: string; up: boolean };
  subtitle?: string;
}

export function KpiCard({ title, value, icon, gradient, trend, subtitle }: KpiCardProps) {
  return (
    <Card className="relative overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow animate-slide-up">
      <div className={cn('absolute inset-0 opacity-100', gradient)} />
      <div className="relative p-5 text-white">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-white/80">{title}</p>
            <p className="text-3xl font-bold mt-2">{value}</p>
            {subtitle && <p className="text-xs text-white/70 mt-1">{subtitle}</p>}
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
            {icon}
          </div>
        </div>
        {trend && (
          <div className="mt-3 flex items-center gap-1 text-xs">
            <span className={trend.up ? 'text-emerald-200' : 'text-red-200'}>
              {trend.up ? '↑' : '↓'} {trend.value}
            </span>
            <span className="text-white/60">vs last month</span>
          </div>
        )}
      </div>
    </Card>
  );
}

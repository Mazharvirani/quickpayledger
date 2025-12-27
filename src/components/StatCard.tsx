import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export function StatCard({ title, value, icon, trend, className }: StatCardProps) {
  return (
    <div className={cn('stat-card animate-fade-in', className)}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          {trend && (
            <p
              className={cn(
                'text-xs mt-1 font-medium',
                trend.isPositive ? 'text-success' : 'text-destructive'
              )}
            >
              {trend.isPositive ? '+' : ''}{trend.value}% from last month
            </p>
          )}
        </div>
        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          {icon}
        </div>
      </div>
    </div>
  );
}

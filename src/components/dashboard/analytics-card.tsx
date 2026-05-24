import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface AnalyticsCardProps {
  title: string;
  value: string;
  change: number;
  icon: React.ElementType;
}

export function AnalyticsCard({ title, value, change, icon: Icon }: AnalyticsCardProps) {
  const isPositive = change >= 0;
  return (
    <Card className="comic-card bg-zinc-900 border-4 border-black">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-black border-b-4 border-black">
        <CardTitle className="text-[10px] font-black uppercase tracking-widest text-primary">{title}</CardTitle>
        <Icon className="h-4 w-4 text-primary" />
      </CardHeader>
      <CardContent className="pt-6">
        <div className="text-3xl font-black italic uppercase tracking-tighter comic-text-stroke">{value}</div>
        <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mt-2 flex items-center">
          <span className={cn('mr-1 flex items-center gap-1', isPositive ? 'text-primary' : 'text-red-500')}>
            {isPositive ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
            {Math.abs(change)}%
          </span>
          Efficiency Variance
        </p>
      </CardContent>
    </Card>
  );
}

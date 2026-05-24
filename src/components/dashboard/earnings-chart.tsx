
'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bar, BarChart, XAxis, YAxis, Tooltip } from 'recharts';
import { ChartContainer, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { EarningsData } from '@/types';

interface EarningsChartProps {
  data: EarningsData[];
}

const chartConfig = {
  earnings: {
    label: 'Gold Recovered',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig;

export function EarningsChart({ data }: EarningsChartProps) {
  return (
    <Card className="comic-card bg-zinc-900 border-4 border-black">
      <CardHeader className="border-b-4 border-black bg-black">
        <CardTitle className="text-sm font-black uppercase tracking-widest text-primary">Resource Accumulation</CardTitle>
        <CardDescription className="text-[10px] uppercase font-bold text-muted-foreground italic">Operator gold recovery over the last standard cycle.</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <BarChart accessibilityLayer data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
            <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}G`} />
            <Tooltip
              cursor={{ fill: 'hsl(var(--muted))' }}
              content={<ChartTooltipContent formatter={(value) => `${value.toLocaleString()} GP`} />}
            />
            <Bar dataKey="earnings" fill="var(--color-earnings)" radius={[0, 0, 0, 0]} className="stroke-black stroke-2" />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

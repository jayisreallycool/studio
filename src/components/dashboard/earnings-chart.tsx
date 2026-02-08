'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bar, BarChart, XAxis, YAxis, Tooltip } from 'recharts';
import { ChartContainer, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';

interface EarningsChartProps {
  data: { month: string; earnings: number }[];
}

const chartConfig = {
  earnings: {
    label: 'Earnings',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig;

export function EarningsChart({ data }: EarningsChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Earnings Overview</CardTitle>
        <CardDescription>Your earnings over the last 6 months.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <BarChart accessibilityLayer data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
            <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
            <Tooltip
              cursor={{ fill: 'hsl(var(--muted))' }}
              content={<ChartTooltipContent formatter={(value) => `$${value.toLocaleString()}`} />}
            />
            <Bar dataKey="earnings" fill="var(--color-earnings)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

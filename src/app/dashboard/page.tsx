import { AnalyticsCard } from '@/components/dashboard/analytics-card';
import { EarningsChart } from '@/components/dashboard/earnings-chart';
import { PostsTable } from '@/components/dashboard/posts-table';
import { dashboardStats, earningsData, recentPostsData } from '@/lib/data';
import { BarChart, Briefcase, DollarSign, Eye, Zap } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <AnalyticsCard
          title="Total Earnings"
          value={`$${dashboardStats.totalEarnings.value.toLocaleString()}`}
          change={dashboardStats.totalEarnings.change}
          icon={DollarSign}
        />
        <AnalyticsCard
          title="Total Views"
          value={dashboardStats.totalViews.value.toLocaleString()}
          change={dashboardStats.totalViews.change}
          icon={Eye}
        />
        <AnalyticsCard
          title="Total Clicks"
          value={dashboardStats.totalClicks.value.toLocaleString()}
          change={dashboardStats.totalClicks.change}
          icon={Zap}
        />
        <AnalyticsCard
          title="Avg. Conversion Rate"
          value={`${dashboardStats.avgConversionRate.value}%`}
          change={dashboardStats.avgConversionRate.change}
          icon={BarChart}
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <EarningsChart data={earningsData} />
        </div>
        <div className="lg:col-span-1">
          <PostsTable data={recentPostsData} />
        </div>
      </div>
    </div>
  );
}

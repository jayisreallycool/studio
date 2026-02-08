'use client';
import { AnalyticsCard } from '@/components/dashboard/analytics-card';
import { EarningsChart } from '@/components/dashboard/earnings-chart';
import { PostsTable } from '@/components/dashboard/posts-table';
import {
  dashboardStats as staticDashboardStats,
  earningsData as staticEarningsData,
  recentPostsData as staticRecentPostsData,
} from '@/lib/data';
import { BarChart, DollarSign, Eye, Zap } from 'lucide-react';
import { useDoc } from '@/firebase';
import { DashboardStats, EarningsData, RecentPostData } from '@/types';
import { doc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { useMemo } from 'react';

export default function DashboardPage() {
  const firestore = useFirestore();

  const statsRef = useMemo(() => {
    if (!firestore) return null;
    return doc(firestore, 'dashboard/default/stats/main');
  }, [firestore]);
  const { data: dashboardStats } = useDoc<DashboardStats>(statsRef);

  const earningsRef = useMemo(() => {
    if (!firestore) return null;
    return doc(firestore, 'dashboard/default/earnings/chart');
  }, [firestore]);
  const { data: earningsData } = useDoc<{ data: EarningsData }>(earningsRef);

  const recentPostsRef = useMemo(() => {
    if (!firestore) return null;
    return doc(firestore, 'dashboard/default/posts/recent');
  }, [firestore]);
  const { data: recentPostsData } = useDoc<{ data: RecentPostData }>(recentPostsRef);

  const displayStats = dashboardStats ?? staticDashboardStats;
  const displayEarnings = earningsData?.data ?? staticEarningsData;
  const displayRecentPosts = recentPostsData?.data ?? staticRecentPostsData;

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <AnalyticsCard
          title="Total Earnings"
          value={`$${displayStats.totalEarnings.value.toLocaleString()}`}
          change={displayStats.totalEarnings.change}
          icon={DollarSign}
        />
        <AnalyticsCard
          title="Total Views"
          value={displayStats.totalViews.value.toLocaleString()}
          change={displayStats.totalViews.change}
          icon={Eye}
        />
        <AnalyticsCard
          title="Total Clicks"
          value={displayStats.totalClicks.value.toLocaleString()}
          change={displayStats.totalClicks.change}
          icon={Zap}
        />
        <AnalyticsCard
          title="Avg. Conversion Rate"
          value={`${displayStats.avgConversionRate.value}%`}
          change={displayStats.avgConversionRate.change}
          icon={BarChart}
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <EarningsChart data={displayEarnings} />
        </div>
        <div className="lg:col-span-1">
          <PostsTable data={displayRecentPosts} />
        </div>
      </div>
    </div>
  );
}

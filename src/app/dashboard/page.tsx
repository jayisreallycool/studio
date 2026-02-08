'use client';
import { AnalyticsCard } from '@/components/dashboard/analytics-card';
import { EarningsChart } from '@/components/dashboard/earnings-chart';
import { PostsTable } from '@/components/dashboard/posts-table';
import {
  dashboardStats as staticDashboardStats,
  earningsData as staticEarningsData,
  recentPostsData as staticRecentPostsData,
} from '@/lib/data';
import { BarChart, BotMessageSquare, DollarSign, Eye, Zap } from 'lucide-react';
import { useDoc, useUser } from '@/firebase';
import { DashboardStats, EarningsData, RecentPostData } from '@/types';
import { doc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function DashboardPage() {
  const { user, loading: userLoading } = useUser();
  const firestore = useFirestore();

  const statsRef = useMemo(() => {
    if (!firestore || !user) return null;
    return doc(firestore, `users/${user.uid}/dashboard/stats/main`);
  }, [firestore, user]);
  const { data: dashboardStats } = useDoc<DashboardStats>(statsRef);

  const earningsRef = useMemo(() => {
    if (!firestore || !user) return null;
    return doc(firestore, `users/${user.uid}/dashboard/earnings/chart`);
  }, [firestore, user]);
  const { data: earningsData } = useDoc<{ data: EarningsData }>(earningsRef);

  const recentPostsRef = useMemo(() => {
    if (!firestore || !user) return null;
    return doc(firestore, `users/${user.uid}/dashboard/posts/recent`);
  }, [firestore, user]);
  const { data: recentPostsData } = useDoc<{ data: RecentPostData }>(recentPostsRef);

  const displayStats = dashboardStats ?? staticDashboardStats;
  const displayEarnings = earningsData?.data ?? staticEarningsData;
  const displayRecentPosts = recentPostsData?.data ?? staticRecentPostsData;

  if (userLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle className="flex items-center justify-center gap-2">
              <BotMessageSquare /> Please Sign In
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              You need to be signed in to view your dashboard.
            </CardDescription>
          </CardContent>
        </Card>
      </div>
    );
  }

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

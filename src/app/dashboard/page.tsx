'use client';
import { AnalyticsCard } from '@/components/dashboard/analytics-card';
import { EarningsChart } from '@/components/dashboard/earnings-chart';
import { PostsTable } from '@/components/dashboard/posts-table';
import {
  dashboardStats as staticDashboardStats,
  earningsData as staticEarningsData,
} from '@/lib/data';
import { BarChart, BotMessageSquare, DollarSign, Eye, Zap } from 'lucide-react';
import { useDoc, useUser, useCollection, useFirestore } from '@/firebase';
import { DashboardStats, EarningsData, Post } from '@/types';
import { doc, collection, query, where, orderBy, limit } from 'firebase/firestore';
import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
  const { user, loading: userLoading } = useUser();
  const firestore = useFirestore();

  const statsRef = useMemo(() => {
    if (!firestore || !user) return null;
    return doc(firestore, `users/${user.uid}/dashboard/stats`);
  }, [firestore, user]);
  const { data: dashboardStats } = useDoc<DashboardStats>(statsRef);

  const earningsRef = useMemo(() => {
    if (!firestore || !user) return null;
    return doc(firestore, `users/${user.uid}/dashboard/earnings`);
  }, [firestore, user]);
  const { data: earningsData } = useDoc<{ data: EarningsData }>(earningsRef);

  const userPostsQuery = useMemo(() => {
    if (!firestore || !user) return null;
    return query(
      collection(firestore, 'posts'),
      where('uid', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(5)
    );
  }, [firestore, user]);
  const { data: userPosts, loading: postsLoading } = useCollection<Post>(userPostsQuery);

  const displayStats = dashboardStats ?? staticDashboardStats;
  const displayEarnings = earningsData?.data ?? staticEarningsData;

  if (userLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-10 w-48" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
        <div className="grid gap-8 lg:grid-cols-3">
          <Skeleton className="lg:col-span-2 h-80 w-full" />
          <Skeleton className="lg:col-span-1 h-80 w-full" />
        </div>
      </div>
    );
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
          <PostsTable posts={userPosts || []} loading={postsLoading} />
        </div>
      </div>
    </div>
  );
}

'use client';
import { AnalyticsCard } from '@/components/dashboard/analytics-card';
import { EarningsChart } from '@/components/dashboard/earnings-chart';
import { PostsTable } from '@/components/dashboard/posts-table';
import {
  dashboardStats as staticDashboardStats,
  earningsData as staticEarningsData,
} from '@/lib/data';
import { BarChart, BotMessageSquare, DollarSign, Eye, Zap, Trophy, Shield, Star } from 'lucide-react';
import { useDoc, useUser, useCollection, useFirestore } from '@/firebase';
import { DashboardStats, EarningsData, Post, UserProfile } from '@/types';
import { doc, collection, query, where, orderBy, limit } from 'firebase/firestore';
import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

export default function DashboardPage() {
  const { user, loading: userLoading } = useUser();
  const firestore = useFirestore();

  const profileRef = useMemo(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);
  const { data: profile } = useDoc<UserProfile>(profileRef);

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
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="w-full max-w-md text-center border-dashed border-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-center gap-2">
              <Shield className="text-primary" /> Unauthorized Access
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Identify yourself to access the Command Center.
            </CardDescription>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-foreground uppercase">Command Center</h1>
          <p className="text-muted-foreground text-sm uppercase font-bold tracking-widest">Operator: {user.displayName}</p>
        </div>
        <Card className="p-4 flex items-center gap-4 bg-accent/10 border-accent/20">
          <div className="bg-accent p-2 rounded-lg">
            <Trophy className="text-accent-foreground h-5 w-5" />
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] font-black uppercase tracking-wider text-accent">
              <span>Level {profile?.level || 1}</span>
              <span>{profile?.karma || 0} XP</span>
            </div>
            <Progress value={((profile?.karma || 0) % 100)} className="w-32 h-1.5" />
          </div>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <AnalyticsCard
          title="Gold Earned"
          value={`$${displayStats.totalEarnings.value.toLocaleString()}`}
          change={displayStats.totalEarnings.change}
          icon={DollarSign}
        />
        <AnalyticsCard
          title="Battle Views"
          value={displayStats.totalViews.value.toLocaleString()}
          change={displayStats.totalViews.change}
          icon={Eye}
        />
        <AnalyticsCard
          title="Action Clicks"
          value={displayStats.totalClicks.value.toLocaleString()}
          change={displayStats.totalClicks.change}
          icon={Zap}
        />
        <AnalyticsCard
          title="Loot Conversion"
          value={`${displayStats.avgConversionRate.value}%`}
          change={displayStats.avgConversionRate.change}
          icon={BarChart}
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <EarningsChart data={displayEarnings} />
        </div>
        <div className="lg:col-span-1 space-y-8">
           <Card className="bg-gradient-to-br from-card to-accent/5">
             <CardHeader>
               <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                 <Star className="text-accent h-4 w-4" /> Rare Drops
               </CardTitle>
             </CardHeader>
             <CardContent className="space-y-4">
               {profile?.inventory?.length ? (
                 <div className="grid grid-cols-3 gap-2">
                   {profile.inventory.map((item, i) => (
                     <div key={i} className="aspect-square bg-secondary rounded-lg flex items-center justify-center border border-white/5">
                        <span className="text-xl">🎁</span>
                     </div>
                   ))}
                 </div>
               ) : (
                 <p className="text-xs text-muted-foreground text-center py-4 italic">No rare drops yet. Forge more posts!</p>
               )}
             </CardContent>
           </Card>
          <PostsTable posts={userPosts || []} loading={postsLoading} />
        </div>
      </div>
    </div>
  );
}

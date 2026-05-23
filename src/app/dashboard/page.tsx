
'use client';
import { AnalyticsCard } from '@/components/dashboard/analytics-card';
import { EarningsChart } from '@/components/dashboard/earnings-chart';
import { PostsTable } from '@/components/dashboard/posts-table';
import {
  dashboardStats as staticDashboardStats,
  earningsData as staticEarningsData,
} from '@/lib/data';
import { BarChart, Coins, Eye, Zap, Trophy, Shield, Star, Sword } from 'lucide-react';
import { useDoc, useUser, useCollection, useFirestore } from '@/firebase';
import { DashboardStats, EarningsData, Post, UserProfile } from '@/types';
import { doc, collection, query, where, orderBy, limit } from 'firebase/firestore';
import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';

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
      <div className="space-y-8 p-6">
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
      <div className="flex items-center justify-center h-[calc(100vh-80px)]">
        <Card className="w-full max-w-md text-center border-dashed border-2 bg-black/40 border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center justify-center gap-3 uppercase italic font-black text-2xl text-primary">
              <Shield className="h-8 w-8" /> Connection Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-muted-foreground font-bold uppercase tracking-widest text-xs">
              Identify yourself to access your encrypted Command Center data.
            </CardDescription>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-foreground uppercase italic leading-none">Command Center</h1>
          <p className="text-primary text-[10px] uppercase font-black tracking-[0.3em] mt-2">Active Operator: {user.displayName}</p>
        </div>
        <Card className="p-5 flex items-center gap-6 bg-accent/5 border-accent/20 backdrop-blur-md shadow-2xl shadow-accent/10 min-w-[300px]">
          <div className="bg-accent/20 p-3 rounded-xl border border-accent/30 shadow-inner">
            <Trophy className="text-accent h-6 w-6" />
          </div>
          <div className="space-y-2 flex-grow">
            <div className="flex justify-between text-[11px] font-black uppercase tracking-[0.2em] text-accent">
              <span>Level {profile?.level || 1}</span>
              <span>{profile?.karma || 0} / 500 XP</span>
            </div>
            <Progress value={((profile?.karma || 0) % 500) / 5} className="h-2 bg-black/40" />
          </div>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <AnalyticsCard
          title="Gold Recovered"
          value={`${displayStats.totalEarnings.value.toLocaleString()} GP`}
          change={displayStats.totalEarnings.change}
          icon={Coins}
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
          title="Loot Yield"
          value={`${displayStats.avgConversionRate.value}%`}
          change={displayStats.avgConversionRate.change}
          icon={Sword}
        />
      </div>

      <div className="grid gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <EarningsChart data={displayEarnings} />
        </div>
        <div className="lg:col-span-1 space-y-10">
           <Card className="bg-gradient-to-br from-card to-accent/10 border-white/5 shadow-2xl">
             <CardHeader>
               <CardTitle className="text-xs font-black uppercase tracking-[0.3em] flex items-center gap-2 text-accent">
                 <Star className="h-4 w-4 fill-accent animate-pulse" /> Rare Inventory
               </CardTitle>
             </CardHeader>
             <CardContent className="space-y-6">
               {profile?.inventory?.length ? (
                 <div className="grid grid-cols-3 gap-3">
                   {profile.inventory.map((item, i) => (
                     <div key={i} className="aspect-square bg-black/40 rounded-xl flex items-center justify-center border border-white/10 hover:border-accent/50 transition-colors cursor-help group">
                        <span className="text-3xl group-hover:scale-125 transition-transform">💎</span>
                     </div>
                   ))}
                 </div>
               ) : (
                 <div className="text-center py-10 space-y-3">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest italic">Inventory Empty</p>
                    <p className="text-[9px] text-muted-foreground/60 font-bold">Forge high-rarity artifacts to claim rare drops.</p>
                 </div>
               )}
             </CardContent>
           </Card>
          <PostsTable posts={userPosts || []} loading={postsLoading} />
        </div>
      </div>
    </div>
  );
}

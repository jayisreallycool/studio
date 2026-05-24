'use client';
import { AnalyticsCard } from '@/components/dashboard/analytics-card';
import { EarningsChart } from '@/components/dashboard/earnings-chart';
import { PostsTable } from '@/components/dashboard/posts-table';
import {
  dashboardStats as staticDashboardStats,
  earningsData as staticEarningsData,
} from '@/lib/data';
import { BarChart, Coins, Eye, Zap, Trophy, Shield, Star, Sword, Medal, Box } from 'lucide-react';
import { useDoc, useUser, useCollection, useFirestore } from '@/firebase';
import { DashboardStats, EarningsData, Post, UserProfile } from '@/types';
import { doc, collection, query, where, orderBy, limit } from 'firebase/firestore';
import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
        <Card className="comic-card w-full max-w-md text-center bg-black/40">
          <CardHeader>
            <CardTitle className="flex items-center justify-center gap-3 uppercase italic font-black text-2xl text-primary comic-text-stroke">
              <Shield className="h-8 w-8" /> Connection Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-muted-foreground font-black uppercase tracking-widest text-[10px]">
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
          <h1 className="text-5xl font-black tracking-tighter text-foreground uppercase italic leading-none comic-text-stroke">Command Center</h1>
          <p className="text-primary text-[10px] uppercase font-black tracking-[0.3em] mt-3">Active Operator: {user.displayName}</p>
        </div>
        <Card className="p-6 flex items-center gap-6 bg-black border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] min-w-[320px]">
          <div className="bg-primary/20 p-4 border-2 border-primary/40 shadow-inner">
            <Trophy className="text-primary h-8 w-8" />
          </div>
          <div className="space-y-3 flex-grow">
            <div className="flex justify-between text-[11px] font-black uppercase tracking-[0.2em] text-primary">
              <span>Level {profile?.level || 1}</span>
              <span>{profile?.karma || 0} / 500 XP</span>
            </div>
            <Progress value={((profile?.karma || 0) % 500) / 5} className="h-3 bg-zinc-900 border-2 border-black" />
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
          title="Arena Views"
          value={displayStats.totalViews.value.toLocaleString()}
          change={displayStats.totalViews.change}
          icon={Eye}
        />
        <AnalyticsCard
          title="Battle Actions"
          value={displayStats.totalClicks.value.toLocaleString()}
          change={displayStats.totalClicks.change}
          icon={Zap}
        />
        <AnalyticsCard
          title="Raid Success"
          value={`${displayStats.avgConversionRate.value}%`}
          change={displayStats.avgConversionRate.change}
          icon={Sword}
        />
      </div>

      <div className="grid gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2">
           <Tabs defaultValue="overview" className="space-y-6">
             <TabsList className="bg-black border-4 border-black p-1">
               <TabsTrigger value="overview" className="font-black uppercase text-[10px] h-full data-[state=active]:bg-primary data-[state=active]:text-black">Progression</TabsTrigger>
               <TabsTrigger value="vault" className="font-black uppercase text-[10px] h-full data-[state=active]:bg-primary data-[state=active]:text-black">The Vault</TabsTrigger>
             </TabsList>
             <TabsContent value="overview">
               <EarningsChart data={displayEarnings} />
             </TabsContent>
             <TabsContent value="vault">
                <Card className="comic-card bg-black/40">
                  <CardHeader>
                    <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                      <Box className="h-4 w-4 text-primary" /> Operator Trophies
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {profile?.trophies?.length ? (
                      profile.trophies.map((trophy, i) => (
                        <div key={i} className="flex flex-col items-center gap-3 p-6 bg-black border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] transition-transform">
                          <Medal className="h-10 w-10 text-yellow-500 animate-pulse" />
                          <span className="text-[10px] font-black uppercase tracking-tighter text-center">{trophy}</span>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-full py-16 text-center text-muted-foreground/60">
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] italic">No Trophies Detected in Vault</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
             </TabsContent>
           </Tabs>
        </div>
        <div className="lg:col-span-1 space-y-10">
           <Card className="comic-card bg-zinc-900 overflow-hidden group">
             <CardHeader className="bg-black border-b-4 border-black">
               <CardTitle className="text-xs font-black uppercase tracking-[0.3em] flex items-center gap-2 text-primary">
                 <Star className="h-4 w-4 fill-primary animate-pulse" /> Rare Inventory
               </CardTitle>
             </CardHeader>
             <CardContent className="p-6">
               {profile?.inventory?.length ? (
                 <div className="grid grid-cols-3 gap-4">
                   {profile.inventory.map((item, i) => (
                     <div key={i} className="aspect-square bg-black border-4 border-black flex items-center justify-center hover:border-primary transition-colors cursor-help group relative shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        <span className="text-4xl group-hover:scale-110 transition-transform">💎</span>
                        <div className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full animate-ping" />
                     </div>
                   ))}
                 </div>
               ) : (
                 <div className="text-center py-12 space-y-4">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest italic leading-tight">Your inventory is empty, Operator.</p>
                    <p className="text-[9px] text-primary font-bold uppercase tracking-tighter italic">Defeat World Bosses to claim rare loot.</p>
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

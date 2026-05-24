
'use client';
import { AnalyticsCard } from '@/components/dashboard/analytics-card';
import { EarningsChart } from '@/components/dashboard/earnings-chart';
import { PostsTable } from '@/components/dashboard/posts-table';
import {
  dashboardStats as staticDashboardStats,
  earningsData as staticEarningsData,
} from '@/lib/data';
import { Coins, Eye, Zap, Trophy, Shield, Star, Sword, Medal, Box, Sparkles, Backpack, Hammer, ArrowRightLeft } from 'lucide-react';
import { useDoc, useUser, useCollection, useFirestore } from '@/firebase';
import { DashboardStats, EarningsData, Post, UserProfile, LootItem } from '@/types';
import { doc, collection, query, where, orderBy, limit, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function DashboardPage() {
  const { user, loading: userLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

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

  const handleEquip = async (item: LootItem) => {
    if (!profileRef || !profile) return;
    const slot = item.type === 'Weapon' ? 'weapon' : 'armor';
    const currentEquipped = profile.equipped?.[slot];

    const updates: any = {
      [`equipped.${slot}`]: item,
      inventory: arrayRemove(item)
    };
    
    if (currentEquipped) {
      updates.inventory = arrayUnion(currentEquipped);
    }

    await updateDoc(profileRef, updates);
    toast({ title: "Protocol Updated", description: `${item.name} equipped.` });
  };

  const handleStash = async (item: LootItem, toStash: boolean) => {
    if (!profileRef || !profile) return;
    const updates = {
      inventory: toStash ? arrayRemove(item) : arrayUnion(item),
      stash: toStash ? arrayUnion(item) : arrayRemove(item)
    };
    await updateDoc(profileRef, updates);
    toast({ title: "Vault Synced", description: `${item.name} moved to ${toStash ? 'Vault' : 'Inventory'}.` });
  };

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
              <span>Level {Math.floor(profile?.level || 1)}</span>
              <span>{Math.round(profile?.karma || 0) % 500} / 500 XP</span>
            </div>
            <Progress value={((profile?.karma || 0) % 500) / 5} className="h-3 bg-zinc-900 border-2 border-black" />
          </div>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <AnalyticsCard title="Gold Recovered" value={`${displayStats.totalEarnings.value.toLocaleString()} GP`} change={displayStats.totalEarnings.change} icon={Coins} />
        <AnalyticsCard title="Arena Views" value={displayStats.totalViews.value.toLocaleString()} change={displayStats.totalViews.change} icon={Eye} />
        <AnalyticsCard title="Battle Actions" value={displayStats.totalClicks.value.toLocaleString()} change={displayStats.totalClicks.change} icon={Zap} />
        <AnalyticsCard title="Raid Success" value={`${displayStats.avgConversionRate.value}%`} change={displayStats.avgConversionRate.change} icon={Sword} />
      </div>

      <Tabs defaultValue="armory" className="space-y-6">
        <TabsList className="bg-black border-4 border-black p-1">
          <TabsTrigger value="armory" className="font-black uppercase text-[10px] h-full data-[state=active]:bg-primary data-[state=active]:text-black">The Armory</TabsTrigger>
          <TabsTrigger value="vault" className="font-black uppercase text-[10px] h-full data-[state=active]:bg-primary data-[state=active]:text-black">The Vault</TabsTrigger>
          <TabsTrigger value="log" className="font-black uppercase text-[10px] h-full data-[state=active]:bg-primary data-[state=active]:text-black">Artifact Log</TabsTrigger>
        </TabsList>

        <TabsContent value="armory" className="grid gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card className="comic-card bg-black/40">
              <CardHeader className="border-b-4 border-black bg-black">
                <CardTitle className="text-xs font-black uppercase tracking-[0.3em] flex items-center gap-2 text-primary">
                  <Backpack className="h-4 w-4" /> Active Inventory
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {profile?.inventory?.length ? (
                    profile.inventory.map((item) => (
                      <div key={item.id} className="flex flex-col p-4 bg-zinc-900 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] transition-transform">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 bg-black border border-zinc-800 flex items-center justify-center text-2xl">
                                {item.type === 'Weapon' ? '⚔️' : item.type === 'Armor' ? '🛡️' : item.type === 'Potion' ? '🧪' : '📦'}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black uppercase text-foreground">{item.name}</span>
                                <span className={cn("text-[8px] font-bold uppercase italic", item.rarity === 'Legendary' ? 'text-yellow-500' : 'text-primary')}>
                                    {item.rarity} {item.type}
                                </span>
                                {item.statBoost && (
                                    <span className="text-[8px] font-black text-red-500 uppercase">+{item.statBoost} {item.type === 'Weapon' ? 'ATK' : 'HP'}</span>
                                )}
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mt-auto">
                            {(item.type === 'Weapon' || item.type === 'Armor') && (
                                <Button onClick={() => handleEquip(item)} className="h-8 bg-primary text-black font-black uppercase text-[9px] comic-button">
                                    <Hammer className="w-3 h-3 mr-1" /> EQUIP
                                </Button>
                            )}
                            <Button onClick={() => handleStash(item, true)} variant="outline" className="h-8 bg-black text-white font-black uppercase text-[9px] border-zinc-700">
                                <Box className="w-3 h-3 mr-1" /> STASH
                            </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full py-16 text-center text-muted-foreground/60 italic uppercase font-black text-[10px] tracking-widest">
                        No active materials detected.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <Card className="comic-card bg-zinc-900 overflow-hidden">
                <CardHeader className="bg-black border-b-4 border-black">
                    <CardTitle className="text-xs font-black uppercase tracking-[0.3em] flex items-center gap-2 text-primary">
                        <Shield className="h-4 w-4" /> Equipped Protocol
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <span className="text-[9px] font-black uppercase text-zinc-500">Weapon Slot</span>
                            {profile?.equipped?.weapon ? (
                                <div className="p-3 bg-black border-2 border-primary/40 flex items-center gap-3">
                                    <span className="text-xl">⚔️</span>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black uppercase">{profile.equipped.weapon.name}</span>
                                        <span className="text-[8px] font-black text-red-500">+{profile.equipped.weapon.statBoost} ATK</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-4 border-2 border-dashed border-zinc-800 text-center text-[8px] uppercase font-black text-zinc-600">Empty Handed</div>
                            )}
                        </div>
                        <div className="space-y-2">
                            <span className="text-[9px] font-black uppercase text-zinc-500">Armor Slot</span>
                            {profile?.equipped?.armor ? (
                                <div className="p-3 bg-black border-2 border-blue-500/40 flex items-center gap-3">
                                    <span className="text-xl">🛡️</span>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black uppercase">{profile.equipped.armor.name}</span>
                                        <span className="text-[8px] font-black text-blue-500">+{profile.equipped.armor.statBoost} HP</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-4 border-2 border-dashed border-zinc-800 text-center text-[8px] uppercase font-black text-zinc-600">No Protection</div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="vault">
            <Card className="comic-card bg-black/40">
                <CardHeader className="bg-black border-b-4 border-black">
                    <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2 text-primary">
                        <Box className="h-4 w-4" /> Secure Stash
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {profile?.stash?.length ? (
                            profile.stash.map((item) => (
                                <div key={item.id} className="flex flex-col items-center gap-3 p-4 bg-zinc-900 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:border-primary transition-all group">
                                    <div className="text-3xl group-hover:scale-110 transition-transform">
                                        {item.type === 'Weapon' ? '⚔️' : item.type === 'Armor' ? '🛡️' : '📦'}
                                    </div>
                                    <span className="text-[8px] font-black uppercase text-center truncate w-full">{item.name}</span>
                                    <Button onClick={() => handleStash(item, false)} className="h-6 w-full text-[7px] font-black uppercase bg-primary text-black px-0">WITHDRAW</Button>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full py-20 text-center text-muted-foreground font-black uppercase italic tracking-[0.4em] text-[10px]">Vault empty.</div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="log">
           <PostsTable posts={userPosts || []} loading={postsLoading} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

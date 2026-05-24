'use client';
import { PostCard } from '@/components/feed/post-card';
import { BossRaidCard } from '@/components/events/boss-raid-card';
import { useCollection, useUser, useDoc, useFirestore } from '@/firebase';
import { Post, WorldEvent, UserProfile } from '@/types';
import { collection, query, orderBy, limit, where, doc } from 'firebase/firestore';
import { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Trophy, Users, Zap, Swords, Flame, Skull, ShieldCheck, Loader2 } from 'lucide-react';
import { HeroSelection } from '@/components/dungeon/hero-selection';
import { SplashScreen } from '@/components/layout/splash-screen';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Home() {
  const { user, loading: userLoading } = useUser();
  const firestore = useFirestore();

  const profileRef = useMemo(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);
  const { data: profile, loading: profileLoading } = useDoc<UserProfile>(profileRef);
  
  const postsQuery = useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'posts'), orderBy('createdAt', 'desc'));
  }, [firestore]);
  const { data: posts, loading: postsLoading } = useCollection<Post>(postsQuery);

  const eventsQuery = useMemo(() => {
    if (!firestore) return null;
    return query(
      collection(firestore, 'worldEvents'), 
      where('status', 'in', ['active', 'upcoming']),
      limit(1)
    );
  }, [firestore]);
  const { data: worldEvents, loading: eventsLoading } = useCollection<WorldEvent>(eventsQuery);

  if (userLoading || (user && profileLoading)) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
          <p className="text-[10px] font-black uppercase text-primary tracking-widest italic animate-pulse">Synchronizing Neural Link...</p>
        </div>
      </div>
    );
  }

  // STAGE 1: Splash Screen (Not logged in)
  if (!user) {
    return <SplashScreen />;
  }

  // STAGE 2: Hero Selection (Logged in, no class)
  if (user && !profile?.heroClass) {
    return <HeroSelection userUid={user.uid} />;
  }

  // STAGE 3: The Arena (Main Game)
  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8 md:gap-12 px-4 md:px-0">
      <div className="lg:col-span-3 space-y-8 md:space-y-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b-8 border-black pb-6 gap-4">
          <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter text-foreground flex items-center gap-3 comic-text-stroke">
            <Skull className="text-red-600 h-8 w-8 md:h-12 md:w-12 fill-red-600" /> The Arena
          </h1>
          <div className="flex gap-4">
            <Button asChild className="comic-button bg-primary text-black h-10 md:h-12 px-6 md:px-8 text-md md:text-lg italic">
              <Link href="/dungeon">ENTER DUNGEON</Link>
            </Button>
          </div>
        </div>

        {worldEvents && worldEvents.map(event => (
          <BossRaidCard key={event.id} event={event} />
        ))}

        <div className="space-y-6 md:space-y-8">
          {postsLoading && (
            <div className="space-y-6">
              <Skeleton className="w-full h-40 md:h-64 rounded-none border-4 border-black" />
              <Skeleton className="w-full h-40 md:h-64 rounded-none border-4 border-black" />
            </div>
          )}
          {!postsLoading && posts && posts.length > 0 ? (
            posts.map((post, index) => (
              <PostCard key={post.id} post={post} priority={index === 0} />
            ))
          ) : null}
          {!postsLoading && (!posts || posts.length === 0) && (
             <Card className="comic-card border-dashed bg-black/40">
                <CardHeader className="text-center py-20">
                    <CardTitle className="uppercase font-black text-primary italic text-4xl">Arena Empty</CardTitle>
                    <CardDescription className="uppercase font-bold text-[10px] tracking-widest mt-4">
                        The protocol awaits its first artifact. Enter the forge to begin.
                    </CardDescription>
                </CardHeader>
            </Card>
          )}
        </div>
      </div>

      <div className="lg:col-span-1 space-y-6 md:space-y-8">
        <Card className="comic-card bg-primary border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <CardHeader>
            <CardTitle className="text-sm font-black uppercase text-black tracking-widest italic">Neural Link Active</CardTitle>
            <CardDescription className="text-black/80 font-bold uppercase text-[10px]">Welcome back, Operator {user.displayName}.</CardDescription>
          </CardHeader>
        </Card>
        
        <Card className="comic-card bg-zinc-900 sticky top-24">
          <CardHeader className="border-b-4 border-black bg-black">
            <CardTitle className="text-xs font-black uppercase tracking-[0.3em] flex items-center gap-2 text-yellow-500">
              <Trophy className="h-4 w-4" /> Top Operators
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            {[1, 2, 3].map((rank) => (
              <div key={rank} className="flex items-center justify-between p-3 rounded-none bg-black border-2 border-zinc-800 hover:border-primary transition-colors cursor-pointer group">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-black text-zinc-600 italic">#{rank}</span>
                  <div className="w-8 h-8 rounded-none bg-zinc-800 border-2 border-zinc-700 flex items-center justify-center font-black text-[10px] group-hover:bg-primary/20">
                    OP
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-tight group-hover:text-primary transition-colors">Operator_{rank * 1337}</span>
                </div>
                <div className="text-[10px] font-black text-primary">
                  {1000 - (rank * 100)} XP
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="comic-card bg-zinc-900">
          <CardHeader className="border-b-4 border-black bg-black">
             <CardTitle className="text-xs font-black uppercase tracking-[0.3em] flex items-center gap-2 text-red-600">
               <Swords className="h-4 w-4" /> Comms Hub
             </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <div className="space-y-4">
              <div className="border-l-4 border-red-600 pl-3">
                <p className="text-[10px] font-bold text-zinc-400 leading-tight uppercase">
                  <span className="text-red-600 font-black mr-1">[WAR]:</span> 
                  Demon King raid protocol initiated for the 13th.
                </p>
              </div>
              <div className="border-l-4 border-primary pl-3">
                <p className="text-[10px] font-bold text-zinc-400 leading-tight uppercase">
                  <span className="text-primary font-black mr-1">[LOOT]:</span> 
                  Void Scythe patterns detected in the Shadow Sector.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

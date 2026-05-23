'use client';
import { PostCard } from '@/components/feed/post-card';
import { useCollection } from '@/firebase';
import { Post } from '@/types';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Trophy, Users, Zap } from 'lucide-react';

export default function Home() {
  const firestore = useFirestore();
  const postsQuery = useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'posts'), orderBy('createdAt', 'desc'));
  }, [firestore]);
  const { data: posts, loading } = useCollection<Post>(postsQuery);

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
      <div className="lg:col-span-3 space-y-6">
        <h1 className="text-3xl font-black italic uppercase tracking-tighter text-foreground flex items-center gap-3">
          <Zap className="text-primary h-8 w-8" /> The Arena Feed
        </h1>
        {loading && (
          <div className="space-y-4">
            <Skeleton className="w-full h-40 rounded-lg" />
            <Skeleton className="w-full h-40 rounded-lg" />
            <Skeleton className="w-full h-40 rounded-lg" />
          </div>
        )}
        {!loading && posts && posts.length > 0 ? (
          posts.map((post, index) => (
            <PostCard key={post.id} post={post} priority={index === 0} />
          ))
        ) : null}
        {!loading && (!posts || posts.length === 0) && (
           <Card className="bg-black/40 border-dashed border-2 border-white/10">
              <CardHeader className="text-center">
                  <CardTitle className="uppercase font-black text-primary italic">Arena Empty</CardTitle>
                  <CardDescription className="uppercase font-bold text-[10px] tracking-widest">
                      The arena awaits its first artifact. Enter the forge to begin.
                  </CardDescription>
              </CardHeader>
          </Card>
        )}
      </div>

      <div className="lg:col-span-1 space-y-8">
        <Card className="bg-accent/5 border-accent/20 backdrop-blur-md sticky top-24">
          <CardHeader>
            <CardTitle className="text-xs font-black uppercase tracking-[0.3em] flex items-center gap-2 text-accent">
              <Trophy className="h-4 w-4" /> Top Operators
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3].map((rank) => (
              <div key={rank} className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/5 hover:border-accent/50 transition-colors cursor-pointer group">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-black text-accent/60 italic">#{rank}</span>
                  <div className="w-8 h-8 rounded-full bg-accent/20 border border-accent/40 flex items-center justify-center font-black text-[10px]">
                    OP
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-tight group-hover:text-accent transition-colors">Operator_{rank * 1337}</span>
                </div>
                <div className="text-[10px] font-black text-primary">
                  {1000 - (rank * 100)} XP
                </div>
              </div>
            ))}
            <div className="pt-4 border-t border-white/5">
               <p className="text-[9px] text-muted-foreground uppercase font-black text-center italic tracking-widest">Season 1: First Forge</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-primary/5 border-primary/20 backdrop-blur-md">
          <CardHeader>
             <CardTitle className="text-xs font-black uppercase tracking-[0.3em] flex items-center gap-2 text-primary">
               <Users className="h-4 w-4" /> Global Comms
             </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-[9px] font-bold text-muted-foreground leading-relaxed">
                <span className="text-primary font-black uppercase tracking-tighter mr-1">[SERVER]:</span> 
                New Legendary artifact forged in the Shadow Sector.
              </p>
              <p className="text-[9px] font-bold text-muted-foreground leading-relaxed">
                <span className="text-primary font-black uppercase tracking-tighter mr-1">[SYSTEM]:</span> 
                Quests reset in 04:22:11.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

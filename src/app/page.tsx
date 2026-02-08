'use client';
import { PostCard } from '@/components/feed/post-card';
import { useCollection } from '@/firebase';
import { Post } from '@/types';
import { collection, query, orderBy } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function Home() {
  const firestore = useFirestore();
  const postsQuery = useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'posts'), orderBy('createdAt', 'desc'));
  }, [firestore]);
  const { data: posts, loading } = useCollection<Post>(postsQuery);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">Feed</h1>
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
         <Card>
            <CardHeader className="text-center">
                <CardTitle>No posts yet!</CardTitle>
                <CardDescription>
                    It looks like the feed is empty. Why not be the first to create a post?
                </CardDescription>
            </CardHeader>
        </Card>
      )}
    </div>
  );
}

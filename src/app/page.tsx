'use client';
import { PostCard } from '@/components/feed/post-card';
import { posts as staticPosts } from '@/lib/data';
import { useCollection } from '@/firebase';
import { Post } from '@/types';
import { collection, query, orderBy } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { useMemo } from 'react';

export default function Home() {
  const firestore = useFirestore();
  const postsQuery = useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'posts'), orderBy('createdAt', 'desc'));
  }, [firestore]);
  const { data: posts, loading } = useCollection<Post>(postsQuery);

  const displayPosts = (!loading && posts && posts.length > 0) ? posts : staticPosts;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">Feed</h1>
      {displayPosts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}

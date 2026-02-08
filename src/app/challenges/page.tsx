'use client';
import { ChallengeCard } from '@/components/challenges/challenge-card';
import { useCollection } from '@/firebase';
import { Challenge } from '@/types';
import { collection, query } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function ChallengesPage() {
  const firestore = useFirestore();
  const challengesQuery = useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'challenges'));
  }, [firestore]);
  const { data: challenges, loading } = useCollection<Challenge>(challengesQuery);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">Challenges</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {loading && (
          <>
            <Skeleton className="w-full h-56 rounded-lg" />
            <Skeleton className="w-full h-56 rounded-lg" />
            <Skeleton className="w-full h-56 rounded-lg" />
          </>
        )}
        {!loading && challenges && challenges.length > 0 && (
          challenges.map((challenge) => (
            <ChallengeCard key={challenge.id} challenge={challenge} />
          ))
        )}
      </div>

      {!loading && (!challenges || challenges.length === 0) && (
        <Card>
          <CardHeader className="text-center">
            <CardTitle>No Challenges Available</CardTitle>
            <CardDescription>
              Check back later for new challenges to complete!
            </CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  );
}

'use client';
import { ChallengeCard } from '@/components/challenges/challenge-card';
import { challenges as staticChallenges } from '@/lib/data';
import { useCollection } from '@/firebase';
import { Challenge } from '@/types';
import { collection, query, orderBy } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { useMemo } from 'react';

export default function ChallengesPage() {
  const firestore = useFirestore();
  const challengesQuery = useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'challenges'));
  }, [firestore]);
  const { data: challenges, loading } = useCollection<Challenge>(challengesQuery);

  const displayChallenges = (!loading && challenges && challenges.length > 0) ? challenges : staticChallenges;

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">Challenges</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {displayChallenges.map((challenge) => (
          <ChallengeCard key={challenge.id} challenge={challenge} />
        ))}
      </div>
    </div>
  );
}

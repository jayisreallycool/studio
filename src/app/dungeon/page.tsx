
'use client';
import { useState, useMemo } from 'react';
import { useUser, useDoc, useFirestore } from '@/firebase';
import { UserProfile, HeroClass } from '@/types';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { HeroSelection } from '@/components/dungeon/hero-selection';
import { CombatArena } from '@/components/dungeon/combat-arena';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Shield, Skull, Loader2 } from 'lucide-react';

export default function DungeonPage() {
  const { user, loading: userLoading } = useUser();
  const firestore = useFirestore();

  const userRef = useMemo(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);
  const { data: profile, loading: profileLoading } = useDoc<UserProfile>(userRef);

  if (userLoading || profileLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-100px)]">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-100px)]">
        <Card className="comic-card w-full max-w-md bg-black/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-red-600 uppercase italic font-black text-2xl comic-text-stroke">
              <Shield className="h-8 w-8" /> Connection Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-muted-foreground font-black uppercase text-[10px] tracking-widest leading-loose">
              Only authenticated Operators can enter the Dungeon Protocol. Sign in via the Command Center to proceed.
            </CardDescription>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If user hasn't selected a class, show hero selection
  if (!profile?.heroClass) {
    return <HeroSelection userUid={user.uid} />;
  }

  return <CombatArena profile={profile} userUid={user.uid} />;
}

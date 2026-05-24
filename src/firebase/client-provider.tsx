'use client';

import { FirebaseProvider } from './provider';
import { initializeFirebase } from './index';
import { useEffect } from 'react';
import { collection, doc, getDocs, writeBatch, Timestamp, serverTimestamp, query, limit } from 'firebase/firestore';
import { posts as staticPosts, challenges as staticChallenges } from '@/lib/data';

interface FirebaseClientProviderProps {
  children: React.ReactNode;
}

export function FirebaseClientProvider({
  children,
}: FirebaseClientProviderProps) {
  const { firebaseApp, auth, firestore, storage } = initializeFirebase();

  useEffect(() => {
    const seedDatabase = async () => {
      if (!firestore) return;

      try {
        const eventsCollectionRef = collection(firestore, 'worldEvents');
        const eventsSnapshot = await getDocs(eventsCollectionRef);
        
        // Always ensure the Demon King exists with the correct schedule
        const eventId = 'demon-king-raid';
        const eventDocRef = doc(firestore, 'worldEvents', eventId);
        
        // Calculate the 13th of the current month
        const now = new Date();
        const ptFormatter = new Intl.DateTimeFormat('en-US', {
          timeZone: 'America/Los_Angeles',
          year: 'numeric',
          month: 'numeric',
          day: 'numeric',
          hour: 'numeric',
          minute: 'numeric',
          second: 'numeric',
          hour12: false,
        });

        const parts = ptFormatter.formatToParts(now);
        const getPart = (type: string) => parts.find(p => p.type === type)?.value;
        
        const ptYear = parseInt(getPart('year')!);
        const ptMonth = parseInt(getPart('month')!) - 1; // 0-indexed
        const ptDay = parseInt(getPart('day')!);
        const ptHour = parseInt(getPart('hour')!);

        // Start time: 13th of this month at 13:00 (1:00 PM) PT
        const startTime = new Date(ptYear, ptMonth, 13, 13, 0, 0);
        // If the 13th has already passed this month, schedule for next month
        if (ptDay > 13 || (ptDay === 13 && ptHour >= 14)) {
            startTime.setMonth(startTime.getMonth() + 1);
        }
        
        const endTime = new Date(startTime.getTime() + 3600000); // 1 hour duration

        const isLive = ptDay === 13 && ptHour === 13;

        const eventsBatch = writeBatch(firestore);
        eventsBatch.set(eventDocRef, {
          title: 'THE DEMON KING',
          type: 'Omega Invasion',
          bossId: 'demon-king',
          status: isLive ? 'active' : 'upcoming',
          startTime: Timestamp.fromDate(startTime),
          endTime: Timestamp.fromDate(endTime),
          globalHealth: 1000000,
          maxHealth: 1000000,
          participants: 1420
        }, { merge: true });

        // Seed Challenges
        const challengesCollectionRef = collection(firestore, 'challenges');
        const challengesSnapshot = await getDocs(challengesCollectionRef);
        if (challengesSnapshot.empty) {
          staticChallenges.forEach((challenge) => {
            const docRef = doc(firestore, 'challenges', challenge.id);
            const challengeData = { ...challenge };
            delete (challengeData as any).id;
            eventsBatch.set(docRef, challengeData);
          });
        }

        // Seed Posts
        const postsCollectionRef = collection(firestore, 'posts');
        const postsSnapshot = await getDocs(postsCollectionRef);
        if (postsSnapshot.empty) {
          staticPosts.forEach((post, index) => {
            const docRef = doc(postsCollectionRef);
            const postData = {
              ...post,
              createdAt: Timestamp.fromMillis(Date.now() - (index + 1) * 3 * 3600000),
              rarity: index === 0 ? 'Legendary' : index === 1 ? 'Epic' : 'Rare',
              upvotes: 100 + (index * 50),
              downvotes: 10,
              comments: 20 + (index * 5),
              imageHint: index === 0 ? "dark scythe" : index === 1 ? "clockwork armor" : "magic crystal",
              aiResult: {
                  relevanceScore: 0.7 + (Math.random() * 0.25),
                  reasoning: "Authentic artifact pattern detected in the Arena flux.",
                  boostRecommendation: index === 0
              }
            };
            delete (postData as any).id;
            eventsBatch.set(docRef, postData);
          });
        }

        await eventsBatch.commit();
      } catch (error) {
        // Silently catch permission errors during initial race conditions
      }
    };

    seedDatabase();
  }, [firestore]);

  return (
    <FirebaseProvider
      firebaseApp={firebaseApp}
      auth={auth}
      firestore={firestore}
      storage={storage}
    >
      {children}
    </FirebaseProvider>
  );
}

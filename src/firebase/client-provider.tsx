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
        // Seed World Events
        const eventsCollectionRef = collection(firestore, 'worldEvents');
        const eventsSnapshot = await getDocs(eventsCollectionRef);
        if (eventsSnapshot.empty) {
          const eventsBatch = writeBatch(firestore);
          const eventId = 'demon-king-raid';
          const eventDoc = doc(firestore, 'worldEvents', eventId);
          eventsBatch.set(eventDoc, {
            title: 'DEMON KING',
            type: 'Omega Invasion',
            bossId: 'demon-king',
            status: 'active',
            startTime: serverTimestamp(),
            endTime: Timestamp.fromMillis(Date.now() + 3600000 * 24),
            globalHealth: 1000000,
            maxHealth: 1000000,
            participants: 1420
          });
          await eventsBatch.commit();
        }

        // Seed Challenges
        const challengesCollectionRef = collection(firestore, 'challenges');
        const challengesSnapshot = await getDocs(challengesCollectionRef);
        if (challengesSnapshot.empty) {
          const challengesBatch = writeBatch(firestore);
          staticChallenges.forEach((challenge) => {
            const docRef = doc(firestore, 'challenges', challenge.id);
            const challengeData = { ...challenge };
            delete (challengeData as any).id;
            challengesBatch.set(docRef, challengeData);
          });
          await challengesBatch.commit();
        }

        // Corrective Seed for Posts: Clear old SEO blogging data if found
        const postsCollectionRef = collection(firestore, 'posts');
        const postsSnapshot = await getDocs(postsCollectionRef);
        
        const hasOldData = postsSnapshot.docs.some(d => {
            const t = d.data().title;
            return t?.includes('SEO') || t?.includes('Passive Income') || t?.includes('Conversion');
        });

        if (postsSnapshot.empty || hasOldData) {
          const postsBatch = writeBatch(firestore);
          
          // If we found old data, purge it first
          if (hasOldData) {
              postsSnapshot.docs.forEach(d => postsBatch.delete(d.ref));
          }

          staticPosts.forEach((post, index) => {
            const docRef = doc(postsCollectionRef);
            const postData = {
              ...post,
              createdAt: Timestamp.fromMillis(Date.now() - (index + 1) * 3 * 3600000),
              rarity: index === 0 ? 'Legendary' : index === 1 ? 'Epic' : 'Rare',
              upvotes: 100 + (index * 50),
              downvotes: 10,
              comments: 20 + (index * 5),
              aiResult: {
                  relevanceScore: 0.7 + (Math.random() * 0.25),
                  reasoning: "Authentic artifact pattern detected in the Arena flux.",
                  boostRecommendation: index === 0
              }
            };
            delete (postData as any).id;
            postsBatch.set(docRef, postData);
          });
          await postsBatch.commit();
        }

      } catch (error) {
        console.error("Error seeding database:", error);
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

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

        // AGGRESSIVE PURGE: Clear ALL old blogging/SEO data
        const postsCollectionRef = collection(firestore, 'posts');
        const postsSnapshot = await getDocs(postsCollectionRef);
        
        const legacyDocs = postsSnapshot.docs.filter(d => {
            const data = d.data();
            const title = (data.title || '').toLowerCase();
            const content = (data.content || '').toLowerCase();
            const author = (data.author || '').toLowerCase();
            
            return title.includes('seo') || 
                   title.includes('passive income') || 
                   title.includes('conversion') ||
                   author.includes('elena voss') ||
                   author.includes('marcus chen') ||
                   author.includes('sophie dubois') ||
                   content.includes('affiliate marketing');
        });

        if (postsSnapshot.empty || legacyDocs.length > 0) {
          const postsBatch = writeBatch(firestore);
          
          // Purge legacy data
          legacyDocs.forEach(d => postsBatch.delete(d.ref));

          // Seed fantasy artifacts if empty or after purge
          if (postsSnapshot.empty || legacyDocs.length > 0) {
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
          }
          await postsBatch.commit();
        }

      } catch (error) {
        // Silently catch permission errors during initial race conditions
        // These are often handled by subsequent re-renders once auth is stable
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

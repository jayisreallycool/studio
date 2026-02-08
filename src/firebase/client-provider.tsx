'use client';

import { FirebaseProvider } from './provider';
import { initializeFirebase } from './index';
import { useEffect } from 'react';
import { collection, doc, getDocs, writeBatch, Timestamp } from 'firebase/firestore';
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
        // Seed Challenges
        const challengesCollectionRef = collection(firestore, 'challenges');
        const challengesSnapshot = await getDocs(challengesCollectionRef);
        if (challengesSnapshot.empty) {
          console.log('Seeding challenges collection...');
          const challengesBatch = writeBatch(firestore);
          staticChallenges.forEach((challenge) => {
            // Use the static ID for the document ID
            const docRef = doc(firestore, 'challenges', challenge.id);
            const challengeData = { ...challenge };
            delete (challengeData as any).id; // Firestore document ID is the source of truth
            challengesBatch.set(docRef, challengeData);
          });
          await challengesBatch.commit();
          console.log('Challenges collection seeded.');
        }

        // Seed Posts
        const postsCollectionRef = collection(firestore, 'posts');
        const postsSnapshot = await getDocs(postsCollectionRef);
        if (postsSnapshot.empty) {
          console.log('Seeding posts collection...');
          const postsBatch = writeBatch(firestore);
          staticPosts.forEach((post, index) => {
            // Auto-generate ID
            const docRef = doc(postsCollectionRef);
            // Convert string date to a real timestamp for sorting
            const postData = {
              ...post,
              // Make timestamps slightly different to ensure order, starting from 3 hours ago
              createdAt: Timestamp.fromMillis(Date.now() - (index + 1) * 3 * 3600000),
            };
            delete (postData as any).id; // Don't store the static ID
            postsBatch.set(docRef, postData);
          });
          await postsBatch.commit();
          console.log('Posts collection seeded.');
        }

      } catch (error) {
        // Don't let seeding errors crash the app, but log them.
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

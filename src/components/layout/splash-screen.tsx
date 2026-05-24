'use client';
import { Button } from '@/components/ui/button';
import { Skull, Zap, Shield, Loader2, Link as LinkIcon } from 'lucide-react';
import { useAuth, useFirestore } from '@/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, getDoc, writeBatch, serverTimestamp } from 'firebase/firestore';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export function SplashScreen() {
  const auth = useAuth();
  const firestore = useFirestore();
  const [isConnecting, setIsConnecting] = useState<boolean>(false);

  const handleSignIn = async () => {
    if (!auth || !firestore) return;
    setIsConnecting(true);
    
    const provider = new GoogleAuthProvider();
    
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userDocRef = doc(firestore, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        const batch = writeBatch(firestore);
        batch.set(userDocRef, {
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
          createdAt: serverTimestamp(),
          level: 1,
          karma: 0,
        });
        
        const statsDocRef = doc(firestore, `users/${user.uid}/dashboard/stats`);
        batch.set(statsDocRef, { 
          totalEarnings: { value: 0, change: 0 },
          totalViews: { value: 0, change: 0 },
          totalClicks: { value: 0, change: 0 },
          avgConversionRate: { value: 0, change: 0 },
        });

        await batch.commit();
      }
    } catch (error) {
      console.error("Link Failure:", error);
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black overflow-hidden font-body">
      <div className="absolute inset-0 halftone-bg opacity-20" />
      
      {/* Background Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 blur-[120px] rounded-full" />
      <div className="absolute top-1/4 right-1/4 w-[300px] h-[300px] bg-red-600/10 blur-[100px] rounded-full" />

      <div className="relative z-10 flex flex-col items-center text-center space-y-12 px-6">
        <div className="relative group">
          <div className="absolute -inset-8 bg-primary/20 blur-2xl group-hover:bg-primary/40 transition-all rounded-full animate-pulse" />
          <div className="p-8 bg-black border-4 border-primary shadow-[12px_12px_0px_0px_rgba(34,197,94,1)] relative">
            <Skull className="w-24 h-24 text-primary animate-shake" />
          </div>
        </div>

        <div className="space-y-4 max-w-2xl">
          <h1 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter text-white comic-text-stroke leading-none">
            AFFLUENCE <br /> <span className="text-primary">ARENA</span>
          </h1>
          <p className="text-primary text-[10px] md:text-xs uppercase font-black tracking-[0.5em] italic">
            Social Gaming Protocol // Version 2.0.5
          </p>
        </div>

        <div className="flex flex-col gap-4 w-full max-w-xs">
          <Button 
            onClick={handleSignIn}
            disabled={isConnecting}
            className={cn(
              "h-20 text-2xl font-black italic uppercase tracking-tighter comic-button",
              isConnecting ? "bg-zinc-800 text-zinc-500" : "bg-primary text-black hover:bg-primary/90"
            )}
          >
            {isConnecting ? (
              <>
                <Loader2 className="mr-3 h-8 w-8 animate-spin" />
                LINKING...
              </>
            ) : (
              <>
                <LinkIcon className="mr-3 h-8 w-8" />
                ESTABLISH NEURAL LINK
              </>
            )}
          </Button>

          <div className="grid grid-cols-3 gap-4 mt-8">
            <div className="flex flex-col items-center gap-2 p-3 bg-zinc-900/50 border-2 border-zinc-800">
              <Zap className="w-5 h-5 text-yellow-500" />
              <span className="text-[8px] font-black uppercase text-zinc-500">Fast Pace</span>
            </div>
            <div className="flex flex-col items-center gap-2 p-3 bg-zinc-900/50 border-2 border-zinc-800">
              <Shield className="w-5 h-5 text-blue-500" />
              <span className="text-[8px] font-black uppercase text-zinc-500">Secure Link</span>
            </div>
            <div className="flex flex-col items-center gap-2 p-3 bg-zinc-900/50 border-2 border-zinc-800">
              <Skull className="w-5 h-5 text-red-500" />
              <span className="text-[8px] font-black uppercase text-zinc-500">Permadeath</span>
            </div>
          </div>
        </div>

        <div className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest leading-loose max-w-xs">
          By connecting, you agree to the Arena Protocols and data synchronization requirements.
        </div>
      </div>

      <div className="absolute bottom-8 left-0 right-0 text-center">
        <p className="text-[10px] font-black text-zinc-800 uppercase tracking-widest animate-pulse">
          INITIALIZING NEURAL INTERFACE...
        </p>
      </div>
    </div>
  );
}

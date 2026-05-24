'use client';
import { useState, useEffect } from 'react';
import { WorldEvent } from '@/types';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Swords, Skull, Users, Zap, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export function BossRaidCard({ event }: { event: WorldEvent }) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isAttacking, setIsAttacking] = useState(false);
  const [localHealth, setLocalHealth] = useState(event.globalHealth);

  useEffect(() => {
    setLocalHealth(event.globalHealth);
  }, [event.globalHealth]);

  const handleAttack = async () => {
    if (!user) {
      toast({
        title: 'Operator ID Required',
        description: 'You must be authenticated to engage the World Boss.',
        variant: 'destructive',
      });
      return;
    }
    if (!firestore || event.status !== 'active') return;

    setIsAttacking(true);
    const damage = Math.floor(Math.random() * 50) + 10;
    const eventRef = doc(firestore, 'worldEvents', event.id);
    const userRef = doc(firestore, 'users', user.uid);

    // Optimistic UI
    setLocalHealth(prev => Math.max(0, prev - damage));

    const updates = { 
      globalHealth: increment(-damage),
      participants: increment(1)
    };

    updateDoc(eventRef, updates).catch(async (err) => {
      const permissionError = new FirestorePermissionError({
        path: eventRef.path,
        operation: 'update',
        requestResourceData: updates,
      });
      errorEmitter.emit('permission-error', permissionError);
    });

    updateDoc(userRef, {
      totalDamageDealt: increment(damage),
      karma: increment(5)
    }).catch(() => {
      // Ignore if user doc doesn't exist yet for new users
    });

    setTimeout(() => setIsAttacking(false), 200);
  };

  const healthPercentage = (localHealth / event.maxHealth) * 100;
  const isCritical = healthPercentage < 20;

  return (
    <Card className={cn(
      "comic-card bg-zinc-950 overflow-hidden relative border-8",
      isAttacking && "animate-shake border-red-600 shadow-[12px_12px_0px_0px_rgba(220,38,38,1)]"
    )}>
      <div className="absolute top-0 right-0 p-8 opacity-20 pointer-events-none">
        <Skull className="w-48 h-48" />
      </div>
      
      <div className="absolute top-0 left-0 bg-red-600 text-white font-black uppercase px-6 py-2 text-[12px] tracking-[0.4em] flex items-center gap-3 z-20">
        <ShieldAlert className="w-4 h-4" /> LIVE EVENT IN PROGRESS
      </div>

      <CardHeader className="pt-16 pb-8 border-b-4 border-black bg-gradient-to-r from-red-950/40 to-black/40">
        <div className="flex justify-between items-end relative z-10">
          <div>
            <CardTitle className="text-6xl font-black italic uppercase tracking-tighter comic-text-stroke leading-none mb-3">
              {event.title}
            </CardTitle>
            <CardDescription className="uppercase font-black text-red-500 text-[12px] tracking-[0.2em] italic">
              THREAT LEVEL: WORLD ENDER // SECTOR: VOID
            </CardDescription>
          </div>
          <div className="bg-black/60 border-4 border-black p-4 flex items-center gap-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
             <Users className="w-5 h-5 text-primary" />
             <span className="font-black text-lg italic">{event.participants.toLocaleString()} RAIDING</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-8 p-8 bg-black/20">
        <div className="space-y-4">
          <div className="flex justify-between font-black uppercase text-[12px] tracking-widest">
            <span className={cn("flex items-center gap-2", isCritical ? "text-red-500 animate-pulse" : "text-zinc-400")}>
              <Flame className="w-4 h-4" /> BOSS VITALITY: {localHealth.toLocaleString()} / {event.maxHealth.toLocaleString()}
            </span>
            <span className="text-zinc-400 italic">{Math.round(healthPercentage)}% STABILITY</span>
          </div>
          <div className="relative h-10 bg-zinc-900 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)]">
            <div 
              className={cn("absolute inset-y-0 left-0 bg-red-600 transition-all duration-300", isCritical && "bg-red-500")}
              style={{ width: `${healthPercentage}%` }}
            />
            <div className="absolute inset-0 halftone-bg opacity-30" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="bg-zinc-900 border-4 border-black p-6 flex flex-col items-center justify-center space-y-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
             <Zap className="w-6 h-6 text-yellow-500 animate-pulse" />
             <span className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Reward Pool</span>
             <span className="text-sm font-black italic">ULTRA-RARE DROPS</span>
          </div>
          <div className="bg-zinc-900 border-4 border-black p-6 flex flex-col items-center justify-center space-y-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
             <Swords className="w-6 h-6 text-red-500" />
             <span className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Event Type</span>
             <span className="text-sm font-black italic">{event.type.toUpperCase()}</span>
          </div>
        </div>

        <Button 
          onClick={handleAttack} 
          disabled={event.status !== 'active' || localHealth <= 0}
          className={cn(
            "w-full h-24 text-4xl font-black italic uppercase tracking-tighter comic-button",
            "bg-red-600 hover:bg-red-700 text-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]",
            "hover:scale-[1.02] active:scale-95 transition-all"
          )}
        >
          {localHealth <= 0 ? 'ANOMALY PURGED' : 'STRIKE BOSS'}
        </Button>
      </CardContent>
    </Card>
  );
}
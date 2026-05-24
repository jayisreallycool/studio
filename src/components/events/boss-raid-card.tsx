
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
        title: 'ID Required',
        description: 'You must be authenticated to engage the Super Boss.',
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
    });

    setTimeout(() => setIsAttacking(false), 200);
  };

  const healthPercentage = (localHealth / event.maxHealth) * 100;
  const isCritical = healthPercentage < 20;

  return (
    <Card className={cn(
      "comic-card bg-zinc-950 overflow-hidden relative",
      isAttacking && "animate-shake border-red-600 shadow-[8px_8px_0px_0px_rgba(220,38,38,1)]"
    )}>
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <Skull className="w-32 h-32" />
      </div>
      
      <div className="absolute top-0 left-0 bg-red-600 text-white font-black uppercase px-4 py-1 text-[10px] tracking-[0.3em] flex items-center gap-2">
        <ShieldAlert className="w-3 h-3" /> LIVE WORLD EVENT
      </div>

      <CardHeader className="pt-10">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-4xl font-black italic uppercase tracking-tighter comic-text-stroke leading-none mb-1">
              {event.title}
            </CardTitle>
            <CardDescription className="uppercase font-bold text-red-500 text-[10px] tracking-widest">
              SUPER BOSS INVASION: {event.type}
            </CardDescription>
          </div>
          <div className="bg-black/40 border border-white/10 p-2 rounded flex items-center gap-2">
             <Users className="w-4 h-4 text-primary" />
             <span className="font-black text-xs">{event.participants} RAIDING</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between font-black uppercase text-[10px] tracking-widest">
            <span className={cn(isCritical ? "text-red-500 animate-pulse" : "text-zinc-400")}>BOSS HP: {localHealth.toLocaleString()}</span>
            <span className="text-zinc-400">{Math.round(healthPercentage)}%</span>
          </div>
          <Progress value={healthPercentage} className="h-4 bg-zinc-900 border-2 border-black" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-zinc-900 border-2 border-black p-4 flex flex-col items-center justify-center space-y-1">
             <Zap className="w-5 h-5 text-yellow-500" />
             <span className="text-[9px] font-black uppercase text-zinc-500">Reward Pool</span>
             <span className="text-xs font-black">LEGENDARY LOOT</span>
          </div>
          <div className="bg-zinc-900 border-2 border-black p-4 flex flex-col items-center justify-center space-y-1">
             <Swords className="w-5 h-5 text-red-500" />
             <span className="text-[9px] font-black uppercase text-zinc-500">Zone</span>
             <span className="text-xs font-black">VOID RIFT</span>
          </div>
        </div>

        <Button 
          onClick={handleAttack} 
          disabled={event.status !== 'active' || localHealth <= 0}
          className={cn(
            "w-full h-16 text-xl font-black italic uppercase tracking-tighter comic-button",
            "bg-red-600 hover:bg-red-700 text-white"
          )}
        >
          {localHealth <= 0 ? 'BOSS DEFEATED' : 'STRIKE BOSS'}
        </Button>
      </CardContent>
    </Card>
  );
}

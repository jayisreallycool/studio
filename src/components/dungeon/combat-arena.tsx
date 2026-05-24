
'use client';
import { useState, useEffect, useMemo } from 'react';
import { UserProfile, Monster, LootItem } from '@/types';
import { doc, updateDoc, increment, arrayUnion } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Swords, Shield, Target, Loader2, Skull, FlaskConical, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { generateMonster, generateLoot } from '@/lib/monster-generator';

interface CombatArenaProps {
  profile: UserProfile;
  userUid: string;
}

export function CombatArena({ profile, userUid }: CombatArenaProps) {
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const [monster, setMonster] = useState<Monster | null>(null);
  const [playerHp, setPlayerHp] = useState<number | null>(null);
  const [isAttacking, setIsAttacking] = useState(false);
  const [isMonsterAttacking, setIsMonsterAttacking] = useState(false);
  const [combatLog, setCombatLog] = useState<string[]>(["Protocol Synchronized. Entry Detected."]);

  // Derived stats from equipment
  const bonusHp = profile.equipped?.armor?.statBoost || 0;
  const bonusAtk = profile.equipped?.weapon?.statBoost || 0;
  const maxPlayerHp = useMemo(() => 100 + (profile.level * 20) + bonusHp, [profile.level, bonusHp]);
  const playerBaseAtk = useMemo(() => 15 + (profile.level * 10) + bonusAtk, [profile.level, bonusAtk]);

  useEffect(() => {
    if (playerHp === null) {
      setPlayerHp(maxPlayerHp);
    }
  }, [maxPlayerHp, playerHp]);

  const spawnMonster = () => {
    const level = Math.floor(profile.level) || 1;
    const newMonster = generateMonster(level);
    setMonster(newMonster);
    setCombatLog(prev => [`New Anomaly Detected: ${newMonster.name}!`, ...prev].slice(0, 5));
  };

  useEffect(() => {
    if (!monster) spawnMonster();
  }, [monster]);

  const handleAttack = () => {
    if (!monster || isAttacking || isMonsterAttacking || playerHp === null) return;

    setIsAttacking(true);
    const crit = Math.random() > 0.85;
    const damage = crit ? Math.floor(playerBaseAtk * 2) : Math.floor(playerBaseAtk);

    const newMonsterHp = Math.max(0, monster.hp - damage);
    setMonster(prev => prev ? { ...prev, hp: newMonsterHp } : null);
    setCombatLog(prev => [`You strike for ${damage} damage!${crit ? ' (CRITICAL)' : ''}`, ...prev].slice(0, 5));

    if (newMonsterHp <= 0) {
      handleVictory();
    } else {
      setTimeout(() => monsterTurn(), 600);
    }

    setTimeout(() => setIsAttacking(false), 300);
  };

  const monsterTurn = () => {
    if (!monster || playerHp === null) return;
    setIsMonsterAttacking(true);
    const damage = Math.max(5, Math.floor(Math.random() * monster.atk));
    
    const newPlayerHp = Math.max(0, playerHp - damage);
    setPlayerHp(newPlayerHp);
    
    if (newPlayerHp <= 0) {
      handleDefeat();
    }
    
    setCombatLog(prev => [`${monster.name} strikes for ${damage} damage!`, ...prev].slice(0, 5));
    setTimeout(() => setIsMonsterAttacking(false), 300);
  };

  const handleUsePotion = () => {
    if (!profile.potions || profile.potions <= 0 || playerHp === null || playerHp >= maxPlayerHp) {
      toast({ title: "Action Blocked", description: "No potions or full HP.", variant: "destructive" });
      return;
    }

    const healAmount = 50;
    const newHp = Math.min(maxPlayerHp, playerHp + healAmount);
    setPlayerHp(newHp);
    setCombatLog(prev => ["Consumed Neural Patch. Stability restored.", ...prev].slice(0, 5));

    if (firestore) {
      const userRef = doc(firestore, 'users', userUid);
      updateDoc(userRef, { potions: increment(-1) });
    }
  };

  const handleVictory = () => {
    if (!firestore || !monster) return;
    
    const lootItems = generateLoot(profile.level);
    const xpGained = 50;
    let toastDescription: string;

    if (lootItems.length > 0) {
      const lootNames = lootItems.map(item => item.name).join(', ');
      toastDescription = `Recovered: ${lootNames}! +${xpGained} XP.`;
    } else {
      toastDescription = `No loot recovered. +${xpGained} XP.`;
    }

    toast({ 
      title: "ANOMALY PURGED", 
      description: toastDescription
    });
    
    const userRef = doc(firestore, 'users', userUid);
    
    const updates: { [key: string]: any } = {
      karma: increment(xpGained),
      level: increment(0.1),
      totalDamageDealt: increment(monster.maxHp),
    };

    const potionsFound = lootItems.filter(item => item.type === 'Potion').length;
    if (potionsFound > 0) {
      updates.potions = increment(potionsFound);
    }

    const itemsToInventory = lootItems.filter(item => item.type !== 'Potion');
    if (itemsToInventory.length > 0) {
      updates.inventory = arrayUnion(...itemsToInventory);
    }

    updateDoc(userRef, updates).catch(async () => {
      const permissionError = new FirestorePermissionError({
        path: userRef.path,
        operation: 'update',
        requestResourceData: updates,
      });
      errorEmitter.emit('permission-error', permissionError);
    });

    setTimeout(() => spawnMonster(), 1500);
  };

  const handleDefeat = () => {
    toast({ variant: "destructive", title: "PROTOCOL FAILED", description: "Stability reached zero. Re-initializing..." });
    setCombatLog(prev => ["Ejection Protocol Initiated.", ...prev].slice(0, 5));
    setTimeout(() => {
        setPlayerHp(maxPlayerHp);
        spawnMonster();
    }, 2000);
  };

  if (playerHp === null) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-100px)]">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto grid lg:grid-cols-5 gap-10 pb-20 px-4">
      <div className="lg:col-span-1 space-y-6 order-2 lg:order-1">
        <Card className="comic-card bg-zinc-950 border-blue-600">
          <CardHeader className="bg-black border-b-4 border-black">
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500 flex items-center gap-2">
              <Shield className="w-4 h-4" /> Operator Vitality
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
             <div className="flex justify-between text-xs font-black uppercase italic">
                <span>Stability</span>
                <span>{playerHp} / {maxPlayerHp}</span>
             </div>
             <Progress value={(playerHp / maxPlayerHp) * 100} className="h-6 bg-zinc-900 border-2 border-black" />
             
             <div className="grid grid-cols-1 gap-2">
                <div className="p-3 bg-black border-2 border-zinc-800 flex justify-between items-center">
                    <span className="text-[9px] font-black uppercase text-zinc-500">Output</span>
                    <span className="text-xs font-black text-red-500">{playerBaseAtk} ATK</span>
                </div>
                <div className="p-3 bg-black border-2 border-zinc-800 flex justify-between items-center">
                    <span className="text-[9px] font-black uppercase text-zinc-500">Neural Patches</span>
                    <span className="text-xs font-black text-primary">{profile.potions || 0}</span>
                </div>
             </div>
          </CardContent>
        </Card>

        <Card className="comic-card bg-zinc-950">
          <CardHeader className="bg-black border-b-4 border-black">
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-primary flex items-center gap-2">
              <Target className="w-4 h-4" /> Tactical Data
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-2">
             {combatLog.map((log, i) => (
               <p key={i} className={cn(
                 "text-[9px] font-black uppercase tracking-tight leading-none mb-2 pb-2 border-b border-zinc-900",
                 i === 0 ? "text-primary" : "text-zinc-600"
               )}>
                 {log}
               </p>
             ))}
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-3 space-y-10 order-1 lg:order-2">
        <div className="flex flex-col items-center justify-center space-y-8">
           <div className="text-center">
              <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter comic-text-stroke leading-none">
                 {monster?.name || 'SCANNING...'}
              </h2>
              <p className="text-red-600 text-[10px] uppercase font-black tracking-[0.4em] mt-2 italic">Active Threat Detection</p>
           </div>

           <div className={cn(
             "relative w-full aspect-video border-8 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] overflow-hidden transition-all",
             isAttacking && "animate-shake border-primary",
             isMonsterAttacking && "animate-shake border-red-600"
           )}>
             {monster && (
               <>
                 <Image 
                   src={monster.imageUrl} 
                   alt={monster.name} 
                   fill 
                   className="object-cover"
                   data-ai-hint={monster.imageHint}
                 />
                 <div className="absolute inset-0 halftone-bg opacity-10 pointer-events-none" />
                 <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black p-4 md:p-8">
                    <div className="space-y-3">
                       <div className="flex justify-between font-black uppercase text-[10px] md:text-[12px] tracking-widest text-red-500">
                          <span>Anomaly Health</span>
                          <span>{monster.hp} / {monster.maxHp} HP</span>
                       </div>
                       <Progress value={(monster.hp / monster.maxHp) * 100} className="h-4 bg-zinc-900 border-2 border-black" />
                    </div>
                 </div>
               </>
             )}
           </div>

           <div className="grid grid-cols-2 gap-4 md:gap-8 w-full">
              <Button 
                onClick={handleAttack}
                disabled={!monster || monster.hp <= 0 || isMonsterAttacking}
                className="h-16 md:h-24 text-2xl md:text-4xl font-black italic uppercase tracking-tighter comic-button bg-primary text-black hover:bg-primary/90"
              >
                <Swords className="w-6 h-6 md:w-10 md:h-10 mr-2 md:mr-4" /> STRIKE
              </Button>
              <Button 
                onClick={handleUsePotion}
                disabled={!profile.potions || profile.potions <= 0}
                variant="outline"
                className="h-16 md:h-24 text-2xl md:text-4xl font-black italic uppercase tracking-tighter comic-button bg-zinc-950 border-4 border-primary/40 text-primary"
              >
                <FlaskConical className="w-6 h-6 md:w-10 md:h-10 mr-2 md:mr-4" /> PATCH
              </Button>
           </div>
        </div>
      </div>

      <div className="lg:col-span-1 space-y-6 order-3">
         <Card className="comic-card bg-zinc-950 border-red-600">
            <CardHeader className="bg-black border-b-4 border-black">
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-red-600 flex items-center gap-2">
                <Skull className="w-4 h-4" /> Threat Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
               <div className="space-y-2">
                  <span className="text-[9px] font-black uppercase text-zinc-500">Known Lore</span>
                  <p className="text-xs font-bold text-zinc-400 italic leading-relaxed uppercase">
                    {monster?.description}
                  </p>
               </div>
               <div className="p-4 bg-black border-2 border-zinc-800">
                  <span className="text-[9px] font-black uppercase text-zinc-500 block">Strike Capacity</span>
                  <span className="text-lg font-black text-red-500 italic">{monster?.atk} DMG</span>
               </div>
            </CardContent>
         </Card>
      </div>
    </div>
  );
}

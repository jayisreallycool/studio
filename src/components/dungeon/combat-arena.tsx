
'use client';
import { useState, useEffect } from 'react';
import { UserProfile, Monster } from '@/types';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Swords, Heart, Skull, Zap, Shield, Flame, Target } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';

interface CombatArenaProps {
  profile: UserProfile;
  userUid: string;
}

const MONSTER_NAMES = ["Void Golem", "Shadow Stalker", "Rift Wyrm", "Blood Harvester", "Dread Knight"];
const MONSTER_HINTS = ["golem monster", "shadow creature", "dragon wyrm", "demon hunter", "undead knight"];

export function CombatArena({ profile, userUid }: CombatArenaProps) {
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const [monster, setMonster] = useState<Monster | null>(null);
  const [playerHp, setPlayerHp] = useState(100 + (profile.level * 20));
  const [isAttacking, setIsAttacking] = useState(false);
  const [isMonsterAttacking, setIsMonsterAttacking] = useState(false);
  const [combatLog, setCombatLog] = useState<string[]>(["Protocol Synchronized. Entry Detected."]);

  const maxPlayerHp = 100 + (profile.level * 20);

  const spawnMonster = () => {
    const level = profile.level;
    const nameIndex = Math.floor(Math.random() * MONSTER_NAMES.length);
    const name = MONSTER_NAMES[nameIndex];
    const hint = MONSTER_HINTS[nameIndex];
    const hp = 50 + (level * 25);
    const atk = 10 + (level * 5);
    const seed = Math.floor(Math.random() * 1000);

    setMonster({
      id: `monster-${Date.now()}`,
      name: `${name} LVL ${level}`,
      hp,
      maxHp: hp,
      atk,
      level,
      imageUrl: `https://picsum.photos/seed/${seed}/800/600`,
      description: "A dark entity synthesized from Arena anomalies."
    });
    // Store hint locally for current combat session
    (window as any)._currentMonsterHint = hint;

    setPlayerHp(maxPlayerHp);
    setCombatLog(prev => [`New Anomaly Detected: ${name}!`, ...prev].slice(0, 5));
  };

  useEffect(() => {
    if (!monster) spawnMonster();
  }, [monster]);

  const handleAttack = async () => {
    if (!monster || isAttacking || isMonsterAttacking) return;

    setIsAttacking(true);
    const playerAtk = 15 + (profile.level * 10);
    const crit = Math.random() > 0.8;
    const damage = crit ? playerAtk * 2 : playerAtk;

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
    if (!monster) return;
    setIsMonsterAttacking(true);
    const damage = Math.floor(Math.random() * monster.atk) + 5;
    
    setPlayerHp(prev => {
      const newHp = Math.max(0, prev - damage);
      if (newHp <= 0) handleDefeat();
      return newHp;
    });
    setCombatLog(prev => [`${monster.name} strikes for ${damage} damage!`, ...prev].slice(0, 5));
    
    setTimeout(() => setIsMonsterAttacking(false), 300);
  };

  const handleVictory = async () => {
    if (!firestore) return;
    toast({ title: "ANOMALY PURGED", description: "You gained 50 XP and 100 GP!" });
    
    const userRef = doc(firestore, 'users', userUid);
    updateDoc(userRef, {
      karma: increment(50),
      level: increment(0.1),
      totalDamageDealt: increment(monster?.maxHp || 0)
    });

    setTimeout(() => spawnMonster(), 1500);
  };

  const handleDefeat = () => {
    toast({ variant: "destructive", title: "PROTOCOL FAILED", description: "You have been ejected from the sector." });
    setTimeout(() => spawnMonster(), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto grid lg:grid-cols-5 gap-10 pb-20">
      <div className="lg:col-span-1 space-y-6">
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
             <div className="p-4 bg-black border-2 border-zinc-800 text-center">
                <span className="text-[9px] font-black uppercase text-zinc-500 block">Class Protocol</span>
                <span className="text-sm font-black italic uppercase text-primary">{profile.heroClass}</span>
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

      <div className="lg:col-span-3 space-y-10">
        <div className="flex flex-col items-center justify-center space-y-8">
           <div className="text-center">
              <h2 className="text-6xl font-black italic uppercase tracking-tighter comic-text-stroke leading-none">
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
                   data-ai-hint={(window as any)._currentMonsterHint || "fantasy monster"}
                 />
                 <div className="absolute inset-0 halftone-bg opacity-10 pointer-events-none" />
                 <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black p-8">
                    <div className="space-y-3">
                       <div className="flex justify-between font-black uppercase text-[12px] tracking-widest text-red-500">
                          <span>Anomaly Health</span>
                          <span>{monster.hp} / {monster.maxHp} HP</span>
                       </div>
                       <Progress value={(monster.hp / monster.maxHp) * 100} className="h-4 bg-zinc-900 border-2 border-black" />
                    </div>
                 </div>
               </>
             )}
           </div>

           <div className="grid grid-cols-2 gap-8 w-full">
              <Button 
                onClick={handleAttack}
                disabled={!monster || monster.hp <= 0 || isMonsterAttacking}
                className="h-24 text-4xl font-black italic uppercase tracking-tighter comic-button bg-primary text-black hover:bg-primary/90"
              >
                <Swords className="w-10 h-10 mr-4" /> STRIKE
              </Button>
              <Button 
                variant="outline"
                className="h-24 text-4xl font-black italic uppercase tracking-tighter comic-button bg-zinc-950 border-4"
              >
                <Shield className="w-10 h-10 mr-4" /> BRACE
              </Button>
           </div>
        </div>
      </div>

      <div className="lg:col-span-1 space-y-6">
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

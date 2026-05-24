
'use client';
import { useState } from 'react';
import { HeroClass } from '@/types';
import { doc, updateDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sword, Zap, Shield, Skull, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

const HERO_CLASSES = [
  {
    id: 'Warrior',
    title: 'The Juggernaut',
    description: 'High HP and defensive capabilities. Forged in the iron pits of the Arena.',
    icon: Shield,
    color: 'text-blue-500',
    image: 'https://picsum.photos/seed/warrior/600/800',
    stats: { hp: 150, atk: 20 }
  },
  {
    id: 'Mage',
    title: 'The Rift Weaver',
    description: 'Masters of the Arcane. Vulnerable but capable of reality-warping damage.',
    icon: Flame,
    color: 'text-purple-500',
    image: 'https://picsum.photos/seed/mage/600/800',
    stats: { hp: 80, atk: 45 }
  },
  {
    id: 'Rogue',
    title: 'The Shadow Stalker',
    description: 'Agile and deadly. Critical strikes that bypass even legendary armor.',
    icon: Zap,
    color: 'text-yellow-500',
    image: 'https://picsum.photos/seed/rogue/600/800',
    stats: { hp: 110, atk: 30 }
  }
];

export function HeroSelection({ userUid }: { userUid: string }) {
  const firestore = useFirestore();
  const [isSelecting, setIsSelecting] = useState(false);

  const selectHero = async (heroClass: string) => {
    if (!firestore) return;
    setIsSelecting(true);
    const userRef = doc(firestore, 'users', userUid);
    await updateDoc(userRef, {
      heroClass: heroClass,
      level: 1,
      karma: 0,
      totalDamageDealt: 0,
      bossKills: 0,
      inventory: []
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20">
      <div className="text-center space-y-4">
        <h1 className="text-7xl font-black italic uppercase tracking-tighter text-foreground comic-text-stroke">Identify Your Protocol</h1>
        <p className="text-primary text-[10px] uppercase font-black tracking-[0.5em] italic">Select your Operator Class to begin the crawl</p>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {HERO_CLASSES.map((hero) => (
          <Card key={hero.id} className="comic-card group bg-black overflow-hidden hover:scale-105 transition-all">
            <div className="relative aspect-[3/4] border-b-4 border-black">
              <Image 
                src={hero.image} 
                alt={hero.title} 
                fill 
                className="object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                data-ai-hint="fantasy character"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
              <div className="absolute bottom-4 left-4 right-4">
                 <hero.icon className={cn("w-12 h-12 mb-2", hero.color)} />
                 <h2 className="text-3xl font-black uppercase italic comic-text-stroke text-white">{hero.title}</h2>
              </div>
            </div>
            <CardContent className="p-6 space-y-6 bg-zinc-950">
              <p className="text-xs font-bold text-zinc-400 leading-relaxed uppercase tracking-tight italic">
                {hero.description}
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                 <div className="p-3 bg-black border-2 border-zinc-800 flex flex-col items-center">
                    <span className="text-[9px] font-black uppercase text-zinc-500">Stability</span>
                    <span className="text-lg font-black text-white">{hero.stats.hp} HP</span>
                 </div>
                 <div className="p-3 bg-black border-2 border-zinc-800 flex flex-col items-center">
                    <span className="text-[9px] font-black uppercase text-zinc-500">Output</span>
                    <span className="text-lg font-black text-red-500">{hero.stats.atk} ATK</span>
                 </div>
              </div>

              <Button 
                onClick={() => selectHero(hero.id)}
                disabled={isSelecting}
                className="w-full comic-button bg-primary text-black h-16 text-xl font-black italic"
              >
                INITIALIZE {hero.id.toUpperCase()}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

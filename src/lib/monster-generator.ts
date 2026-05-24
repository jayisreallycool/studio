
import { Monster, LootItem, PostRarity } from '@/types';

const PREFIXES = [
  'Void-Touched', 'Corrupted', 'Infernal', 'Glacial', 'Ancient', 'Mechanical',
  'Ethereal', 'Blighted', 'Radiant', 'Chronos', 'Crystalline', 'Shadow',
  'Obsidian', 'Abyssal', 'Titan', 'Ghostly', 'Venomous', 'Primordial'
];

const BASE_TYPES = [
  { name: 'Golem', hint: 'stone golem', desc: 'A massive construct of animated material.' },
  { name: 'Wyrm', hint: 'dragon', desc: 'A scaled terror of the skies and rifts.' },
  { name: 'Stalker', hint: 'shadow monster', desc: 'A silent hunter of the lightless sectors.' },
  { name: 'Knight', hint: 'undead warrior', desc: 'A reanimated champion of a forgotten age.' },
  { name: 'Beholder', hint: 'cosmic horror eye', desc: 'A many-eyed entity that gazes into souls.' },
  { name: 'Hydra', hint: 'multi-headed serpent', desc: 'A many-headed beast that regrows what is lost.' },
  { name: 'Wraith', hint: 'spectral ghost', desc: 'A formless spirit bound to the Arena flux.' },
  { name: 'Colossus', hint: 'giant titan', desc: 'A being so large it dwarfs the Arena pillars.' },
  { name: 'Reaver', hint: 'armored demon', desc: 'A savage predator built for pure destruction.' },
  { name: 'Sentinel', hint: 'mechanical robot', desc: 'An automated defense unit gone rogue.' }
];

const SUFFIXES = [
  'of the Abyss', 'of the Void', 'the Eternal', 'the Damned', 'of the Rift',
  'the Unstoppable', 'of the High Council', 'the Blight', 'of Shadows'
];

const LOOT_NAMES = [
  'Void Fragment', 'Aether Blade', 'Shadow Core', 'Chrono Gear', 'Mana Crystal',
  'Titan Plate', 'Infernal Ember', 'Glacial Shard', 'Ancient Tome', 'Blighted Vine'
];

export function generateMonster(level: number): Monster {
  const prefix = PREFIXES[Math.floor(Math.random() * PREFIXES.length)];
  const base = BASE_TYPES[Math.floor(Math.random() * BASE_TYPES.length)];
  const suffix = Math.random() > 0.7 ? ` ${SUFFIXES[Math.floor(Math.random() * SUFFIXES.length)]}` : '';
  
  const name = `${prefix} ${base.name}${suffix}`;
  const id = `monster-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  
  // Stats scaling
  const hpBase = 50 + (level * 30);
  const atkBase = 10 + (level * 8);
  
  // Random variance (up to 20%)
  const variance = 0.8 + (Math.random() * 0.4);
  const hp = Math.floor(hpBase * variance);
  const atk = Math.floor(atkBase * variance);

  const seed = encodeURIComponent(name.toLowerCase().replace(/\s+/g, '-'));
  const imageUrl = `https://picsum.photos/seed/${seed}/800/600`;

  return {
    id,
    name: `${name} LVL ${level}`,
    hp,
    maxHp: hp,
    atk,
    level,
    imageUrl,
    imageHint: `${prefix.toLowerCase()} ${base.hint}`,
    description: `${base.desc} This ${name} has been warped by Arena energy.`
  };
}

export function generateLoot(level: number): LootItem {
  const nameBase = LOOT_NAMES[Math.floor(Math.random() * LOOT_NAMES.length)];
  const rarities: PostRarity[] = ['Common', 'Rare', 'Epic', 'Legendary'];
  const rarityIndex = Math.min(3, Math.floor(Math.random() * (level / 2)));
  const rarity = rarities[rarityIndex];
  
  const seed = encodeURIComponent(nameBase.toLowerCase().replace(/\s+/g, '-'));
  
  return {
    name: nameBase,
    type: Math.random() > 0.5 ? 'Weapon' : 'Material',
    rarity: rarity,
    imageUrl: `https://picsum.photos/seed/${seed}/200/200`
  };
}

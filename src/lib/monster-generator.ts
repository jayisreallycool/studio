import { Monster, LootItem } from "@/types";

// 1. DESIGN A MODULAR SYSTEM & 2. CREATE DATA-DRIVEN STRUCTURE
// We define a system of modular parts with rarities and stat modifiers.

type Rarity = 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary';

interface MonsterPart {
  name: string;
  rarity: Rarity;
  statModifiers: {
    hp: number;
    atk: number;
    def: number;
    spd: number;
  };
  imageHint: string;
  nameFragment: string;
}

const RARITY_WEIGHTS: Record<Rarity, number> = {
  Common: 60,
  Uncommon: 25,
  Rare: 10,
  Epic: 4,
  Legendary: 1,
};

// Helper function to select a part based on weighted rarity
function selectPart(parts: MonsterPart[]): MonsterPart {
  const weightedParts = parts.flatMap(part => Array(RARITY_WEIGHTS[part.rarity]).fill(part));
  return weightedParts[Math.floor(Math.random() * weightedParts.length)];
}


const BODY_TYPES: MonsterPart[] = [
    { name: 'Brute', rarity: 'Common', statModifiers: { hp: 20, atk: 5, def: 10, spd: -5 }, imageHint: 'massive muscular body', nameFragment: 'Brute' },
    { name: 'Skeletal', rarity: 'Uncommon', statModifiers: { hp: -10, atk: 10, def: -10, spd: 10 }, imageHint: 'skeletal frame', nameFragment: 'Wraith' },
    { name: 'Arachnid', rarity: 'Rare', statModifiers: { hp: 5, atk: 15, def: 5, spd: 5 }, imageHint: 'spider-like body with multiple limbs', nameFragment: 'Stalker' },
    { name: 'Serpentine', rarity: 'Epic', statModifiers: { hp: 10, atk: 10, def: 0, spd: 20 }, imageHint: 'long serpentine body', nameFragment: 'Wyrm' },
    { name: 'Celestial', rarity: 'Legendary', statModifiers: { hp: 30, atk: 20, def: 20, spd: 10 }, imageHint: 'body made of stars and galaxies', nameFragment: 'Cosmos' },
    { name: 'Golem', rarity: 'Common', statModifiers: { hp: 15, atk: 5, def: 20, spd: -10 }, imageHint: 'body made of rock and stone', nameFragment: 'Gargantua' },
    { name: 'Fey', rarity: 'Uncommon', statModifiers: { hp: -15, atk: 5, def: -10, spd: 30 }, imageHint: 'lithe and slender fey body', nameFragment: 'Sprite' },
    { name: 'Abomination', rarity: 'Rare', statModifiers: { hp: 25, atk: 15, def: 5, spd: -10 }, imageHint: 'a horrifying mess of flesh and limbs', nameFragment: 'Horror' },
    { name: 'Mech', rarity: 'Epic', statModifiers: { hp: 10, atk: 15, def: 25, spd: 0 }, imageHint: 'a mechanical and robotic body', nameFragment: 'Automaton' },
    { name: 'Primordial', rarity: 'Legendary', statModifiers: { hp: 40, atk: 10, def: 30, spd: -20 }, imageHint: 'body of pure elemental energy', nameFragment: 'Elemental' },
];

const HEADS: MonsterPart[] = [
    { name: 'Horned', rarity: 'Common', statModifiers: { hp: 0, atk: 5, def: 5, spd: 0 }, imageHint: 'head with large horns', nameFragment: 'Horned' },
    { name: 'Cyclops', rarity: 'Uncommon', statModifiers: { hp: 5, atk: 10, def: 0, spd: -5 }, imageHint: 'head with a single large eye', nameFragment: 'Cyclops' },
    { name: 'Dragon', rarity: 'Rare', statModifiers: { hp: 10, atk: 15, def: 10, spd: 0 }, imageHint: 'head of a fearsome dragon', nameFragment: 'Drake' },
    { name: 'Mindflayer', rarity: 'Epic', statModifiers: { hp: -10, atk: 25, def: -10, spd: 15 }, imageHint: 'eldritch head with tentacles', nameFragment: 'Mindflayer' },
    { name: 'Crown of Light', rarity: 'Legendary', statModifiers: { hp: 10, atk: 10, def: 10, spd: 10 }, imageHint: 'a crown of pure light as a head', nameFragment: 'Archon' },
    { name: 'Faceless', rarity: 'Common', statModifiers: { hp: 5, atk: 0, def: 0, spd: 5 }, imageHint: 'a smooth, featureless face', nameFragment: 'Nameless' },
    { name: 'Multi-faced', rarity: 'Uncommon', statModifiers: { hp: 5, atk: 5, def: 5, spd: -5 }, imageHint: 'a head with multiple faces', nameFragment: 'Legion' },
    { name: 'Crystal', rarity: 'Rare', statModifiers: { hp: 0, atk: 5, def: 15, spd: 0 }, imageHint: 'a head made of shimmering crystal', nameFragment: 'Crystal' },
    { name: 'Beast', rarity: 'Epic', statModifiers: { hp: 5, atk: 20, def: 5, spd: 10 }, imageHint: 'a savage, bestial head', nameFragment: 'Beast' },
    { name: 'Void', rarity: 'Legendary', statModifiers: { hp: 0, atk: 30, def: 0, spd: 10 }, imageHint: 'a head that is a portal to the void', nameFragment: 'Void-gazer' },
];

const ARMS: MonsterPart[] = [
    { name: 'Claws', rarity: 'Common', statModifiers: { hp: 0, atk: 10, def: 0, spd: 5 }, imageHint: 'sharp claws', nameFragment: 'Claw' },
    { name: 'Tentacles', rarity: 'Uncommon', statModifiers: { hp: 5, atk: 5, def: 0, spd: 10 }, imageHint: 'writhing tentacles for arms', nameFragment: 'Tentacle' },
    { name: 'Swords', rarity: 'Rare', statModifiers: { hp: 0, atk: 15, def: 5, spd: 5 }, imageHint: 'arms replaced with sharp blades', nameFragment: 'Blade' },
    { name: 'Shields', rarity: 'Epic', statModifiers: { hp: 10, atk: -5, def: 25, spd: -5 }, imageHint: 'arms that are massive shields', nameFragment: 'Guardian' },
    { name: 'Cannons', rarity: 'Legendary', statModifiers: { hp: 0, atk: 30, def: -10, spd: 0 }, imageHint: 'energy cannons instead of arms', nameFragment: 'Cannon' },
];

const LEGS: MonsterPart[] = [
    { name: 'Beastial', rarity: 'Common', statModifiers: { hp: 5, atk: 0, def: 0, spd: 10 }, imageHint: 'strong beast-like legs', nameFragment: 'Strider' },
    { name: 'Stilts', rarity: 'Uncommon', statModifiers: { hp: -5, atk: 0, def: -5, spd: 20 }, imageHint: 'long, thin stilt-like legs', nameFragment: 'Walker' },
    { name: 'Tracked', rarity: 'Rare', statModifiers: { hp: 10, atk: 0, def: 10, spd: -10 }, imageHint: 'tank tracks for legs', nameFragment: 'Juggernaut' },
    { name: 'Hovers', rarity: 'Epic', statModifiers: { hp: 0, atk: 0, def: 0, spd: 25 }, imageHint: 'hovers instead of legs, floating', nameFragment: 'Drifter' },
    { name: 'None', rarity: 'Legendary', statModifiers: { hp: 20, atk: 0, def: 0, spd: 20 }, imageHint: 'slithers on its belly', nameFragment: 'Slitherer' },
];

const SKIN_ARMOR: MonsterPart[] = [
    { name: 'Rocky', rarity: 'Common', statModifiers: { hp: 10, atk: 0, def: 10, spd: -5 }, imageHint: 'skin made of rock', nameFragment: 'Stone' },
    { name: 'Chitin', rarity: 'Uncommon', statModifiers: { hp: 5, atk: 5, def: 10, spd: 0 }, imageHint: 'a hard chitinous exoskeleton', nameFragment: 'Shell' },
    { name: 'Obsidian', rarity: 'Rare', statModifiers: { hp: 5, atk: 10, def: 15, spd: -5 }, imageHint: 'shimmering black obsidian skin', nameFragment: 'Obsidian' },
    { name: 'Magma', rarity: 'Epic', statModifiers: { hp: 15, atk: 15, def: 5, spd: 0 }, imageHint: 'skin of molten magma', nameFragment: 'Magma' },
    { name: 'Nebula', rarity: 'Legendary', statModifiers: { hp: 10, atk: 10, def: 10, spd: 10 }, imageHint: 'skin is a swirling nebula of gas and stars', nameFragment: 'Cosmic' },
];

const EXTRAS: MonsterPart[] = [
    { name: 'Wings', rarity: 'Common', statModifiers: { hp: 0, atk: 0, def: 0, spd: 15 }, imageHint: 'large leathery wings', nameFragment: 'Flier' },
    { name: 'Spikes', rarity: 'Uncommon', statModifiers: { hp: 0, atk: 5, def: 5, spd: 0 }, imageHint: 'covered in sharp spikes', nameFragment: 'Spiked' },
    { name: 'Aura', rarity: 'Rare', statModifiers: { hp: 5, atk: 5, def: 5, spd: 5 }, imageHint: 'glowing aura of power', nameFragment: 'Aura' },
    { name: 'Tail', rarity: 'Epic', statModifiers: { hp: 5, atk: 10, def: 0, spd: 10 }, imageHint: 'a long, powerful tail', nameFragment: 'Tailed' },
    { name: 'Halo', rarity: 'Legendary', statModifiers: { hp: 10, atk: 10, def: 10, spd: 10 }, imageHint: 'a halo of divine light', nameFragment: 'Saint' },
    { name: 'None', rarity: 'Common', statModifiers: { hp: 0, atk: 0, def: 0, spd: 0 }, imageHint: '', nameFragment: '' },
];


// 3. GENERATE STATS PROCEDURALLY & 4. COMBINE MODULES + STATS
export function generateMonster(level: number): Monster {
  const body = selectPart(BODY_TYPES);
  const head = selectPart(HEADS);
  const arms = selectPart(ARMS);
  const legs = selectPart(LEGS);
  const skin = selectPart(SKIN_ARMOR);
  const extra = selectPart(EXTRAS);

  const allParts = [body, head, arms, legs, skin, extra];

  // Procedural name generation
  const name = `${head.nameFragment} ${body.nameFragment}`;
  const description = `A formidable ${name} with a ${body.imageHint}, ${head.imageHint}, ${arms.imageHint}, ${legs.imageHint}, ${skin.imageHint}, and ${extra.imageHint}.`;

  const id = `monster-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  
  // Stats generation with randomness
  const baseStats = { hp: 50 + (level * 20), atk: 10 + (level * 5), def: 5 + (level * 5), spd: 5 + (level * 2) };
  
  const totalModifiers = allParts.reduce((totals, part) => {
    totals.hp += part.statModifiers.hp;
    totals.atk += part.statModifiers.atk;
    totals.def += part.statModifiers.def;
    totals.spd += part.statModifiers.spd;
    return totals;
  }, { hp: 0, atk: 0, def: 0, spd: 0 });

  const rarityMultiplier = allParts.reduce((multiplier, part) => {
      if (part.rarity === 'Uncommon') return multiplier * 1.1;
      if (part.rarity === 'Rare') return multiplier * 1.25;
      if (part.rarity === 'Epic') return multiplier * 1.5;
      if (part.rarity === 'Legendary') return multiplier * 2;
      return multiplier;
  }, 1);

  const hp = Math.floor((baseStats.hp + totalModifiers.hp) * rarityMultiplier * (0.8 + Math.random() * 0.4));
  const atk = Math.floor((baseStats.atk + totalModifiers.atk) * rarityMultiplier * (0.8 + Math.random() * 0.4));

  // 6. SCALE TO 10,000+ - Image Generation
  // "be creative, stylish, add animation"
  const imageHint = allParts.map(p => p.imageHint).filter(h => h).join(', ');
  const style = "concept art, fantasy, detailed, stylish, vibrant";
  const fullPrompt = `${name}, ${description}, ${style}`;

  // Using a public image generation API. The 'animated gif' is a creative take on the "add animation" request.
  const animatedImageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(`animated gif, ${fullPrompt}`)}`;
  const staticImageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(fullPrompt)}`;


  return {
    id,
    name,
    level,
    hp,
    maxHp: hp,
    atk,
    description,
    imageUrl: staticImageUrl, // Using static for now as animated might be too much for a list. Can be swapped.
    imageHint: fullPrompt,
  };
}

const LOOT_TABLE: Omit<LootItem, 'id'>[] = [
  { name: 'Health Potion', type: 'Potion', rarity: 'Common', imageUrl: '/images/potion.png' },
  { name: 'Mana Potion', type: 'Potion', rarity: 'Common', imageUrl: '/images/potion.png' },
  { name: 'Iron Sword', type: 'Weapon', rarity: 'Common', imageUrl: '/images/sword.png', statBoost: 5 },
  { name: 'Steel Armor', type: 'Armor', rarity: 'Uncommon', imageUrl: '/images/armor.png', statBoost: 10 },
  { name: 'Dragon Scale', type: 'Material', rarity: 'Rare', imageUrl: '/images/dragon-scale.png' },
  { name: 'Goblin Ear', type: 'Material', rarity: 'Common', imageUrl: '/images/goblin-ear.png' },
  { name: 'Excalibur', type: 'Weapon', rarity: 'Legendary', imageUrl: '/images/excalibur.png', statBoost: 50 },
  { name: 'Aegis Shield', type: 'Armor', rarity: 'Epic', imageUrl: '/images/aegis-shield.png', statBoost: 30 },
];


export function generateLoot(monsterLevel: number): LootItem[] {
  const loot: LootItem[] = [];
  const numberOfItems = Math.floor(Math.random() * 3) + 1; // 1 to 3 items

  for (let i = 0; i < numberOfItems; i++) {
    const randomLoot = LOOT_TABLE[Math.floor(Math.random() * LOOT_TABLE.length)];
    const rarityMultiplier = {
      'Common': 1,
      'Uncommon': 1.5,
      'Rare': 2.5,
      'Epic': 4,
      'Legendary': 10,
    };

    // Increase chance of better loot with higher monster level
    const lootChance = Math.random() * 100;
    const requiredChance = 100 - (monsterLevel * 2) - (rarityMultiplier[randomLoot.rarity] * 5);

    if (lootChance > requiredChance) {
        loot.push({
            ...randomLoot,
            id: `loot-${Date.now()}-${i}`,
        });
    }
  }

  // Always drop at least one item if lucky
  if (loot.length === 0 && Math.random() > 0.5) {
    const randomLoot = LOOT_TABLE[Math.floor(Math.random() * LOOT_TABLE.length)];
    loot.push({
        ...randomLoot,
        id: `loot-${Date.now()}-fallback`,
    });
  }


  return loot;
}

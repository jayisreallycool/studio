import type { Post, Challenge } from '@/types';
import { PlaceHolderImages } from './placeholder-images';

const findImage = (id: string) => PlaceHolderImages.find(img => img.id === id)?.imageUrl || '';
const findImageHint = (id: string) => PlaceHolderImages.find(img => img.id === id)?.imageHint || '';


export const posts: Post[] = [
  {
    id: '1',
    uid: 'user-1',
    title: 'Void-Touched Reaper Scythe',
    content: "A weapon forged in the depths of the Shadow Realm. It hums with a malevolent energy that drains the lifeforce of those it strikes. This artifact was recovered from the first Breach Event during the Great Incursion.",
    author: 'Elena Voss',
    avatarUrl: findImage('user-avatar-1'),
    imageUrl: findImage('post-image-1'),
    imageHint: findImageHint('post-image-1'),
    upvotes: 450,
    downvotes: 12,
    comments: 89,
    tags: ['Legendary', 'Shadow', 'Melee'],
    createdAt: '3 hours ago',
    rarity: 'Legendary',
  },
  {
    id: '2',
    uid: 'user-2',
    title: 'Chronos Weaver Armor',
    content: "Exquisite plating that allows the wearer to perceive moments before they occur. Found within the temporal rifts of the Clockwork Spire. It is said the gears within never stop turning, even when the wearer is still.",
    author: 'Marcus Chen',
    avatarUrl: findImage('user-avatar-2'),
    imageUrl: findImage('post-image-2'),
    imageHint: findImageHint('post-image-2'),
    upvotes: 320,
    downvotes: 5,
    comments: 42,
    tags: ['Epic', 'Time', 'Plate'],
    createdAt: '1 day ago',
    rarity: 'Epic',
  },
  {
    id: '3',
    uid: 'user-3',
    title: 'Crystalline Mana Infuser',
    content: "A powerful focus for arcane energy. It converts raw ambient magic into concentrated bolts of pure crystalline power. Operators often use these to stabilize unstable rift portals during Omega Raids.",
    author: 'Sophie Dubois',
    avatarUrl: findImage('user-avatar-3'),
    imageUrl: findImage('post-image-3'),
    imageHint: findImageHint('post-image-3'),
    upvotes: 215,
    downvotes: 8,
    comments: 15,
    tags: ['Rare', 'Arcane', 'Artifact'],
    createdAt: '2 days ago',
    rarity: 'Rare',
  },
];

export const dashboardStats = {
  totalEarnings: { value: 12500, change: 12 },
  totalViews: { value: 45000, change: 8 },
  totalClicks: { value: 2300, change: 15 },
  avgConversionRate: { value: 5.2, change: 2 },
};

export const earningsData: { month: string; earnings: number }[] = [
  { month: 'Aug', earnings: 1200 },
  { month: 'Sep', earnings: 1800 },
  { month: 'Oct', earnings: 1400 },
  { month: 'Nov', earnings: 2200 },
  { month: 'Dec', earnings: 1900 },
  { month: 'Jan', earnings: 2500 },
];

export const challenges: Challenge[] = [
  {
    id: 'challenge-1',
    title: 'First Forge',
    description: 'Forge your first artifact and chronicle its power in the Arena.',
    reward: '100 XP',
    progress: 0,
    goal: 100,
  },
  {
    id: 'challenge-2',
    title: 'Elite Appraiser',
    description: 'Achieve a Power Level score of over 85% on a single artifact.',
    reward: '250 XP',
    progress: 50,
    goal: 100,
  },
  {
    id: 'challenge-3',
    title: 'Battle-Hardened',
    description: 'Deal a total of 5,000 cumulative damage to World Bosses.',
    reward: '500 XP',
    progress: 20,
    goal: 100,
  },
  {
    id: 'challenge-4',
    title: 'Vault Seeker',
    description: 'Claim your first rare loot drop from a successful boss raid.',
    reward: 'Platinum Badge',
    progress: 0,
    goal: 100,
  },
];

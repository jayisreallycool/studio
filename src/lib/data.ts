import type { Post, Challenge } from '@/types';
import { PlaceHolderImages } from './placeholder-images';

const findImage = (id: string) => PlaceHolderImages.find(img => img.id === id)?.imageUrl || '';
const findHint = (id: string) => PlaceHolderImages.find(img => img.id === id)?.imageHint || '';

export const posts: Post[] = [];

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
    reward: '2500 GP',
    progress: 20,
    goal: 100,
  },
];

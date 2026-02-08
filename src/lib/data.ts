import type { Post, Challenge } from '@/types';
import { PlaceHolderImages } from './placeholder-images';

const findImage = (id: string) => PlaceHolderImages.find(img => img.id === id)?.imageUrl || '';
const findImageHint = (id: string) => PlaceHolderImages.find(img => img.id === id)?.imageHint || '';


export const posts: Post[] = [];

export const dashboardStats = {
  totalEarnings: {
    value: 0,
    change: 0,
  },
  totalViews: {
    value: 0,
    change: 0,
  },
  totalClicks: {
    value: 0,
    change: 0,
  },
  avgConversionRate: {
    value: 0,
    change: 0,
  },
};

export const earningsData: { month: string; earnings: number }[] = [];

export const recentPostsData: {
    id: string;
    title: string;
    views: number;
    clicks: number;
    conversions: number;
    earnings: number;
  }[] = [];

export const challenges: Challenge[] = [];

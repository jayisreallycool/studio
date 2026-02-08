import type { Post, Challenge } from '@/types';
import { PlaceHolderImages } from './placeholder-images';

const findImage = (id: string) => PlaceHolderImages.find(img => img.id === id)?.imageUrl || '';
const findImageHint = (id: string) => PlaceHolderImages.find(img => img.id === id)?.imageHint || '';


export const posts: Post[] = [
  {
    id: '1',
    uid: 'user-1',
    title: 'Unlocking Passive Income: A Beginner’s Guide to Affiliate Marketing',
    content: "Discover the foundational strategies of affiliate marketing. This guide covers everything from choosing the right niche to finding profitable affiliate programs. We'll walk you through setting up your first campaign and tracking its success.",
    author: 'Elena Voss',
    avatarUrl: findImage('user-avatar-1'),
    imageUrl: findImage('post-image-1'),
    imageHint: findImageHint('post-image-1'),
    upvotes: 125,
    downvotes: 12,
    comments: 45,
    tags: ['Affiliate Marketing', 'Beginners', 'Passive Income'],
    createdAt: '3 hours ago',
  },
  {
    id: '2',
    uid: 'user-2',
    title: 'Top 10 SEO Tools That Will Skyrocket Your Rankings in 2024',
    content: "SEO is constantly evolving, and so are the tools. In this post, we review the top 10 SEO tools that can give you a competitive edge. From keyword research to backlink analysis, these tools are game-changers.",
    author: 'Marcus Chen',
    avatarUrl: findImage('user-avatar-2'),
    imageUrl: findImage('post-image-2'),
    imageHint: findImageHint('post-image-2'),
    upvotes: 230,
    downvotes: 5,
    comments: 88,
    tags: ['SEO', 'Tools', 'Ranking'],
    createdAt: '1 day ago',
  },
  {
    id: '3',
    uid: 'user-3',
    title: 'The Art of Conversion: How to Turn Clicks into Cash',
    content: "Getting clicks is only half the battle. This article dives deep into conversion rate optimization (CRO) techniques for affiliate marketers. Learn about persuasive copywriting, effective call-to-actions, and A/B testing your landing pages.",
    author: 'Sophie Dubois',
    avatarUrl: findImage('user-avatar-3'),
    imageUrl: findImage('post-image-3'),
    imageHint: findImageHint('post-image-3'),
    upvotes: 98,
    downvotes: 8,
    comments: 32,
    tags: ['CRO', 'Conversion', 'Sales'],
    createdAt: '2 days ago',
  },
];

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

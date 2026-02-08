import type { Post } from '@/types';
import { PlaceHolderImages } from './placeholder-images';

const findImage = (id: string) => PlaceHolderImages.find(img => img.id === id)?.imageUrl || '';
const findImageHint = (id: string) => PlaceHolderImages.find(img => img.id === id)?.imageHint || '';


export const posts: Post[] = [
  {
    id: '1',
    title: 'Unlocking Passive Income: A Beginner’s Guide to Affiliate Marketing',
    content: 'Discover the foundational strategies of affiliate marketing. This guide covers everything from choosing the right niche to finding profitable affiliate programs. We\'ll walk you through setting up your first campaign and tracking its success.',
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
    title: 'Top 10 SEO Tools That Will Skyrocket Your Rankings in 2024',
    content: 'SEO is constantly evolving, and so are the tools. In this post, we review the top 10 SEO tools that can give you a competitive edge. From keyword research to backlink analysis, these tools are game-changers.',
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
    title: 'The Art of Conversion: How to Turn Clicks into Cash',
    content: 'Getting clicks is only half the battle. This article dives deep into conversion rate optimization (CRO) techniques for affiliate marketers. Learn about persuasive copywriting, effective call-to-actions, and A/B testing your landing pages.',
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
    value: 4250.75,
    change: 12.5,
  },
  totalViews: {
    value: 152300,
    change: 8.2,
  },
  totalClicks: {
    value: 12890,
    change: -2.1,
  },
  avgConversionRate: {
    value: 3.4,
    change: 0.5,
  },
};

export const earningsData = [
  { month: 'Jan', earnings: 600 },
  { month: 'Feb', earnings: 850 },
  { month: 'Mar', earnings: 700 },
  { month: 'Apr', earnings: 1100 },
  { month: 'May', earnings: 950 },
  { month: 'Jun', earnings: 1300 },
];

export const recentPostsData = [
  { id: '1', title: 'Unlocking Passive Income...', views: 25000, clicks: 2100, conversions: 50, earnings: 1250.00 },
  { id: '2', title: 'Top 10 SEO Tools...', views: 45000, clicks: 5200, conversions: 150, earnings: 2100.50 },
  { id: '3', title: 'The Art of Conversion', views: 18000, clicks: 1500, conversions: 35, earnings: 900.25 },
];

export const challenges = [
  {
    id: '1',
    title: 'First Post Sprint',
    description: 'Create and publish your first optimized post.',
    reward: '$10 Bonus',
    progress: 100,
    goal: 100,
  },
  {
    id: '2',
    title: 'Affiliate Initiate',
    description: 'Earn your first $100 from affiliate links.',
    reward: '$25 Bonus',
    progress: 75,
    goal: 100,
  },
  {
    id: '3',
    title: 'Engagement Pro',
    description: 'Get 100 upvotes on a single post.',
    reward: 'Featured Post Slot',
    progress: 40,
    goal: 100,
  },
  {
    id: '4',
    title: 'SEO Master',
    description: 'Rank a post on the first page of Google for a target keyword.',
    reward: '$100 Bonus',
    progress: 10,
    goal: 100,
  },
];

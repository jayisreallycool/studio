import { Timestamp } from 'firebase/firestore';

export type Post = {
  id: string;
  uid: string;
  title: string;
  content: string;
  author: string;
  avatarUrl: string;
  imageUrl?: string;
  imageHint?: string;
  upvotes: number;
  downvotes: number;
  comments: number;
  tags: string[];
  createdAt: Timestamp | string;
  affiliateLink?: string;
  affiliateLinkName?: string;
  aiResult?: {
    relevanceScore: number;
    reasoning: string;
    boostRecommendation: boolean;
  };
};

export type Challenge = {
  id: string;
  title: string;
  description: string;
  reward: string;
  progress: number;
  goal: number;
};

export type DashboardStats = {
  totalEarnings: { value: number; change: number };
  totalViews: { value: number; change: number };
  totalClicks: { value: number; change: number };
  avgConversionRate: { value: number; change: number };
};

export type EarningsData = {
  month: string;
  earnings: number;
}[];

export type RecentPostData = {
  id: string;
  title: string;
  views: number;
  clicks: number;
  conversions: number;
  earnings: number;
};

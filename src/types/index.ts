
import { Timestamp } from 'firebase/firestore';

export type PostRarity = 'Common' | 'Rare' | 'Epic' | 'Legendary';
export type HeroClass = 'Warrior' | 'Mage' | 'Rogue';
export type ItemType = 'Weapon' | 'Armor' | 'Material' | 'Relic';

export type PostAward = {
  type: 'Bronze' | 'Silver' | 'Gold';
  count: number;
};

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
  rarity?: PostRarity;
  awards?: PostAward[];
  aiResult?: {
    relevanceScore: number;
    reasoning: string;
    boostRecommendation: boolean;
  };
};

export type WorldEvent = {
  id: string;
  title: string;
  type: string;
  bossId: string;
  status: 'upcoming' | 'active' | 'concluded';
  startTime: Timestamp;
  endTime: Timestamp;
  globalHealth: number;
  maxHealth: number;
  participants: number;
};

export type Monster = {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  atk: number;
  level: number;
  imageUrl: string;
  imageHint: string;
  description: string;
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

export type UserProfile = {
  displayName: string;
  email: string;
  photoURL: string;
  inventory?: string[];
  level: number;
  karma: number;
  trophies?: string[];
  bossKills?: number;
  totalDamageDealt?: number;
  heroClass?: HeroClass;
};

export type LootItem = {
  name: string;
  type: ItemType;
  rarity: PostRarity;
  imageUrl: string;
};

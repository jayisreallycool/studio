export type Post = {
  id: string;
  title: string;
  content: string;
  author: string;
  avatarUrl: string;
  imageUrl: string;
  imageHint: string;
  upvotes: number;
  downvotes: number;
  comments: number;
  tags: string[];
  createdAt: string;
};

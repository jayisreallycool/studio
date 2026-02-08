import type { Post } from '@/types';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ArrowBigUp, ArrowBigDown, MessageCircle, Share2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Timestamp } from 'firebase/firestore';
import { formatDistanceToNow } from 'date-fns';


interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  const getCreatedAt = () => {
    if (!post.createdAt) return '';
    if (typeof post.createdAt === 'string') {
      return post.createdAt;
    }
    // Check if it's a Firestore Timestamp
    if (post.createdAt && typeof (post.createdAt as Timestamp).toDate === 'function') {
      return formatDistanceToNow((post.createdAt as Timestamp).toDate(), { addSuffix: true });
    }
    return '';
  };


  return (
    <Card className="overflow-hidden">
      <div className="flex">
        <div className="flex flex-col items-center p-2 bg-card/50">
          <Button variant="ghost" size="sm">
            <ArrowBigUp className="h-5 w-5" />
          </Button>
          <span className="text-sm font-bold">{post.upvotes - post.downvotes}</span>
          <Button variant="ghost" size="sm">
            <ArrowBigDown className="h-5 w-5" />
          </Button>
        </div>
        <div className="flex-1">
          <CardHeader className="p-4">
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <Avatar className="h-6 w-6">
                <AvatarImage src={post.avatarUrl} alt={post.author} />
                <AvatarFallback>{post.author.charAt(0)}</AvatarFallback>
              </Avatar>
              <span>Posted by {post.author}</span>
              <span>•</span>
              <span>{getCreatedAt()}</span>
            </div>
            <h2 className="text-xl font-semibold leading-tight pt-2">{post.title}</h2>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            {post.imageUrl && (
              <div className="relative aspect-video rounded-md overflow-hidden mb-4">
                <Image
                  src={post.imageUrl}
                  alt={post.title}
                  fill
                  className="object-cover"
                  data-ai-hint={post.imageHint}
                />
              </div>
            )}
            <p className="text-muted-foreground text-sm line-clamp-3">
              {post.content}
            </p>
          </CardContent>
          <CardFooter className="p-4 pt-0 space-x-2">
            <Button variant="outline" size="sm">
              <MessageCircle className="h-4 w-4 mr-2" />
              {post.comments} Comments
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <div className="flex-1 justify-end flex gap-2">
              {post.tags.map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>)}
            </div>
          </CardFooter>
        </div>
      </div>
    </Card>
  );
}

import type { Post } from '@/types';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ArrowBigUp, ArrowBigDown, MessageCircle, Share2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Timestamp, doc, updateDoc, increment } from 'firebase/firestore';
import { formatDistanceToNow } from 'date-fns';
import { useUser, useFirestore } from '@/firebase';
import { useToast } from '@/hooks/use-toast';

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

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

  const handleVote = async (voteType: 'up' | 'down') => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to vote.',
        variant: 'destructive',
      });
      return;
    }
    if (!firestore) return;

    const postRef = doc(firestore, 'posts', post.id);
    const fieldToUpdate = voteType === 'up' ? 'upvotes' : 'downvotes';

    // For this MVP, we're not tracking individual votes, so a user can vote multiple times.
    // A production app would add a subcollection to track which users have voted.
    await updateDoc(postRef, {
      [fieldToUpdate]: increment(1),
    }).catch((err) => {
      console.error('Vote failed', err);
      toast({
        title: 'Vote failed',
        description: 'Could not register your vote.',
        variant: 'destructive',
      });
    });
  };

  return (
    <Card className="overflow-hidden">
      <div className="flex-1">
        <CardHeader className="p-4 pb-2">
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
        <CardContent className="p-4 pt-2">
          {post.imageUrl && (
            <div className="relative aspect-video rounded-md overflow-hidden mb-4">
              <Image src={post.imageUrl} alt={post.title} fill className="object-cover" data-ai-hint={post.imageHint} />
            </div>
          )}
          <p className="text-muted-foreground text-sm line-clamp-3">{post.content}</p>
          <div className="flex flex-wrap gap-2 pt-4">
            {post.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-2 flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleVote('up')}>
              <ArrowBigUp className="h-5 w-5" />
            </Button>
            <span className="text-sm font-bold min-w-[2ch] text-center">{post.upvotes - post.downvotes}</span>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleVote('down')}>
              <ArrowBigDown className="h-5 w-5" />
            </Button>
          </div>
          <Button variant="ghost" size="sm" className="ml-auto">
            <MessageCircle className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">{post.comments} Comments</span>
            <span className="sm:hidden">{post.comments}</span>
          </Button>
          <Button variant="ghost" size="sm">
            <Share2 className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Share</span>
            <span className="sr-only sm:hidden">Share</span>
          </Button>
        </CardFooter>
      </div>
    </Card>
  );
}

import type { Post } from '@/types';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ArrowBigUp, ArrowBigDown, MessageCircle, Share2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Timestamp, doc, updateDoc, increment } from 'firebase/firestore';
import { formatDistanceToNow } from 'date-fns';
import { useUser, useFirestore } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

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
    const voteUpdate = { [fieldToUpdate]: increment(1) };
    updateDoc(postRef, voteUpdate).catch(async (serverError) => {
      const permissionError = new FirestorePermissionError({
        path: postRef.path,
        operation: 'update',
        requestResourceData: {
          field: fieldToUpdate,
          increment: 1,
        }
      });
      errorEmitter.emit('permission-error', permissionError);
    });
  };

  return (
    <Card className="flex flex-row overflow-hidden transition-colors duration-200 bg-card hover:border-primary/50">
      <div className="flex flex-col items-center w-10 p-1 space-y-1 bg-background">
        <Button variant="ghost" size="icon" className="w-8 h-8 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10" onClick={() => handleVote('up')}>
          <ArrowBigUp className="h-5 w-5" />
        </Button>
        <span className="text-xs font-bold text-foreground">{post.upvotes - post.downvotes}</span>
        <Button variant="ghost" size="icon" className="w-8 h-8 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10" onClick={() => handleVote('down')}>
          <ArrowBigDown className="h-5 w-5" />
        </Button>
      </div>
      <div className="flex-1 p-2 pl-3">
        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
          <Avatar className="w-5 h-5">
            <AvatarImage src={post.avatarUrl} alt={post.author} />
            <AvatarFallback>{post.author.charAt(0)}</AvatarFallback>
          </Avatar>
          <span className="font-semibold text-foreground">/r/affiliatemarketing</span>
          <span className="text-xs text-muted-foreground">•</span>
          <span>Posted by u/{post.author}</span>
          <span>{getCreatedAt()}</span>
        </div>
        <h2 className="mt-1 text-lg font-medium leading-tight text-foreground">{post.title}</h2>
        
        {post.imageUrl && (
            <div className="relative w-full mt-2 overflow-hidden border rounded-md aspect-video max-h-96">
              <Image src={post.imageUrl} alt={post.title} fill className="object-cover" data-ai-hint={post.imageHint} />
            </div>
        )}

        {!post.imageUrl && (
            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{post.content}</p>
        )}

        <div className="flex items-center gap-1 mt-2">
            <Button variant="ghost" size="sm" className="px-2 py-1 text-xs text-muted-foreground h-7">
              <MessageCircle className="w-4 h-4 mr-1.5" />
              <span>{post.comments} Comments</span>
            </Button>
            <Button variant="ghost" size="sm" className="px-2 py-1 text-xs text-muted-foreground h-7">
              <Share2 className="w-4 h-4 mr-1.5" />
              <span>Share</span>
            </Button>
            <div className="flex flex-wrap gap-1 ml-auto">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="px-2 py-0.5 text-xs font-normal">
                  {tag}
                </Badge>
              ))}
            </div>
        </div>
      </div>
    </Card>
  );
}

import type { Post } from '@/types';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ArrowBigUp, ArrowBigDown, MessageCircle, Share2, Sparkles, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Timestamp, doc, updateDoc, increment } from 'firebase/firestore';
import { formatDistanceToNow } from 'date-fns';
import { useUser, useFirestore } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface PostCardProps {
  post: Post;
  priority?: boolean;
}

export function PostCard({ post, priority = false }: PostCardProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const getCreatedAt = () => {
    if (!post.createdAt) return '';
    if (typeof post.createdAt === 'string') {
      return post.createdAt;
    }
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
    const voteUpdate = { [fieldToUpdate]: increment(1) };
    
    updateDoc(postRef, voteUpdate).catch(async (serverError) => {
      const permissionError = new FirestorePermissionError({
        path: postRef.path,
        operation: 'update',
        requestResourceData: voteUpdate,
      });
      errorEmitter.emit('permission-error', permissionError);
    });
  };

  return (
    <Card className="flex flex-row overflow-hidden transition-colors duration-200 bg-card hover:border-primary/50">
      <div className="flex flex-col items-center w-12 p-1 space-y-1 bg-background/50 border-r">
        <Button variant="ghost" size="icon" className="w-10 h-10 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10" onClick={() => handleVote('up')}>
          <ArrowBigUp className="h-6 w-6" />
        </Button>
        <span className="text-sm font-bold text-foreground">{post.upvotes - post.downvotes}</span>
        <Button variant="ghost" size="icon" className="w-10 h-10 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10" onClick={() => handleVote('down')}>
          <ArrowBigDown className="h-6 w-6" />
        </Button>
      </div>
      <div className="flex-1 p-3">
        <div className="flex items-center space-x-2 text-xs text-muted-foreground mb-2">
          <Avatar className="w-5 h-5">
            <AvatarImage src={post.avatarUrl} alt={post.author} />
            <AvatarFallback>{post.author.charAt(0)}</AvatarFallback>
          </Avatar>
          <span className="font-semibold text-foreground">/r/affiliatemarketing</span>
          <span className="text-xs text-muted-foreground">•</span>
          <span>Posted by u/{post.author}</span>
          <span>{getCreatedAt()}</span>
          
          {post.aiResult && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="outline" className="ml-auto flex items-center gap-1 border-primary/30 text-primary cursor-help">
                    <Sparkles className="w-3 h-3" />
                    SEO: {Math.round(post.aiResult.relevanceScore * 100)}%
                  </Badge>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="text-xs font-semibold mb-1">AI Analysis Result:</p>
                  <p className="text-xs opacity-90">{post.aiResult.reasoning}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        <h2 className="text-xl font-bold leading-tight text-foreground">{post.title}</h2>
        
        {post.imageUrl && (
            <div className="relative w-full mt-3 overflow-hidden border rounded-lg aspect-video max-h-96">
              <Image src={post.imageUrl} alt={post.title} fill className="object-cover" data-ai-hint={post.imageHint} priority={priority} />
            </div>
        )}

        <p className="mt-3 text-sm text-muted-foreground leading-relaxed line-clamp-3">
            {post.content}
        </p>

        {post.affiliateLink && (
          <div className="mt-4">
             <Button asChild variant="secondary" size="sm" className="gap-2">
                <a href={post.affiliateLink} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                  {post.affiliateLinkName || 'View Product'}
                </a>
             </Button>
          </div>
        )}

        <div className="flex items-center gap-2 mt-4">
            <Button variant="ghost" size="sm" className="px-2 py-1 text-xs text-muted-foreground h-8 hover:bg-accent/50">
              <MessageCircle className="w-4 h-4 mr-2" />
              <span>{post.comments} Comments</span>
            </Button>
            <Button variant="ghost" size="sm" className="px-2 py-1 text-xs text-muted-foreground h-8 hover:bg-accent/50">
              <Share2 className="w-4 h-4 mr-2" />
              <span>Share</span>
            </Button>
            <div className="flex flex-wrap gap-1 ml-auto">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="px-2 py-0.5 text-[10px] font-normal tracking-wide uppercase">
                  {tag}
                </Badge>
              ))}
            </div>
        </div>
      </div>
    </Card>
  );
}

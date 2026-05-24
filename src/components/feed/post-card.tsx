'use client';
import type { Post, PostRarity } from '@/types';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ArrowBigUp, ArrowBigDown, MessageCircle, Share2, Sparkles, ShieldCheck, Trophy, Medal, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Timestamp, doc, updateDoc, increment } from 'firebase/firestore';
import { formatDistanceToNow } from 'date-fns';
import { useUser, useFirestore } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useMemo } from 'react';

interface PostCardProps {
  post: Post;
  priority?: boolean;
}

export function PostCard({ post, priority = false }: PostCardProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const formattedDate = useMemo(() => {
    if (!post.createdAt) return '';
    if (typeof post.createdAt === 'string') return post.createdAt;
    if (post.createdAt && typeof (post.createdAt as Timestamp).toDate === 'function') {
      try {
        return formatDistanceToNow((post.createdAt as Timestamp).toDate(), { addSuffix: true });
      } catch (e) {
        return 'recently';
      }
    }
    return '';
  }, [post.createdAt]);

  const rarityStyles = useMemo(() => {
    switch (post.rarity) {
      case 'Legendary': return { color: 'text-yellow-400 border-yellow-400 bg-yellow-400/10', class: 'rarity-legendary' };
      case 'Epic': return { color: 'text-purple-400 border-purple-400 bg-purple-400/10', class: 'rarity-epic' };
      case 'Rare': return { color: 'text-blue-400 border-blue-400 bg-blue-400/10', class: 'rarity-rare' };
      default: return { color: 'text-zinc-500 border-zinc-700 bg-zinc-800/50', class: '' };
    }
  }, [post.rarity]);

  const handleVote = (voteType: 'up' | 'down') => {
    if (!user) {
      toast({ title: 'Operator ID Missing', description: 'Authenticate to cast votes.', variant: 'destructive' });
      return;
    }
    if (!firestore) return;

    const postRef = doc(firestore, 'posts', post.id);
    const fieldToUpdate = voteType === 'up' ? 'upvotes' : 'downvotes';
    const voteUpdate = { [fieldToUpdate]: increment(1) };
    
    updateDoc(postRef, voteUpdate).catch(async () => {
      const permissionError = new FirestorePermissionError({
        path: postRef.path,
        operation: 'update',
        requestResourceData: voteUpdate,
      });
      errorEmitter.emit('permission-error', permissionError);
    });
  };

  return (
    <Card className={cn("comic-card flex flex-col md:flex-row overflow-hidden border-4 border-black", rarityStyles.class)}>
      <div className="flex flex-row md:flex-col items-center justify-around md:justify-start md:w-16 p-2 md:space-y-2 bg-black border-b-4 md:border-b-0 md:border-r-4 border-black">
        <Button variant="ghost" size="icon" className="w-10 h-10 md:w-12 md:h-12 text-zinc-500 hover:text-primary transition-colors" onClick={() => handleVote('up')}>
          <ArrowBigUp className="h-8 w-8 md:h-10 md:w-10 fill-current" />
        </Button>
        <span className="text-lg md:text-xl font-black text-foreground leading-none comic-text-stroke">
          {(post.upvotes || 0) - (post.downvotes || 0)}
        </span>
        <Button variant="ghost" size="icon" className="w-10 h-10 md:w-12 md:h-12 text-zinc-500 hover:text-red-600 transition-colors" onClick={() => handleVote('down')}>
          <ArrowBigDown className="h-8 w-8 md:h-10 md:w-10 fill-current" />
        </Button>
      </div>
      <div className="flex-1 p-4 md:p-6 relative">
        <div className="halftone-bg absolute inset-0 opacity-5 pointer-events-none" />
        
        <div className="flex items-center space-x-3 text-[10px] text-zinc-500 mb-4 md:mb-6 font-black uppercase tracking-widest relative z-10">
          <Avatar className="w-6 h-6 md:w-8 md:h-8 border-2 border-black">
            <AvatarImage src={post.avatarUrl} alt={post.author} />
            <AvatarFallback>{post.author.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-primary font-black italic">/a/arena</span>
            <span className="text-foreground truncate max-w-[100px] md:max-w-none">{post.author} • {formattedDate}</span>
          </div>
          
          {post.rarity && (
            <Badge variant="outline" className={cn("hidden sm:inline-flex ml-2 font-black border-2 comic-text-stroke uppercase text-[9px] px-3", rarityStyles.color)}>
              {post.rarity}
            </Badge>
          )}

          {post.aiResult && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge className="ml-auto bg-black border-2 border-primary text-primary font-black flex items-center gap-1 cursor-help h-6 md:h-8 px-2 md:px-4">
                    <Zap className="w-3 h-3" />
                    <span className="hidden xs:inline">LVL:</span> {Math.round(post.aiResult.relevanceScore * 100)}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent className="bg-black border-4 border-black p-4 max-w-xs shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <p className="font-black uppercase tracking-widest text-primary mb-2 italic">Appraiser Scan:</p>
                  <p className="text-xs italic leading-relaxed text-zinc-300">"{post.aiResult.reasoning}"</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        
        <div className="flex justify-between items-start gap-4 mb-4 md:mb-6">
          <h2 className="text-2xl md:text-4xl font-black italic uppercase tracking-tighter leading-none text-foreground comic-text-stroke">{post.title}</h2>
        </div>
        
        {post.imageUrl && (
            <div className="relative w-full overflow-hidden border-4 border-black aspect-video max-h-[500px] group mb-4 md:mb-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.5)]">
              <Image 
                src={post.imageUrl} 
                alt={post.title} 
                fill 
                className="object-cover transition-transform duration-500 group-hover:scale-110" 
                priority={priority}
                data-ai-hint={post.imageHint || "fantasy artifact"}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
            </div>
        )}

        <p className="text-sm md:text-lg text-zinc-300 font-bold leading-relaxed italic border-l-4 md:border-l-8 border-primary pl-4 md:pl-6 mb-4 md:mb-8 bg-zinc-900/40 py-4 md:py-6">
            {post.content}
        </p>

        <div className="flex flex-wrap items-center gap-4 md:gap-6 border-t-4 border-black pt-4 md:pt-6">
          {post.affiliateLink && (
             <Button asChild className="comic-button bg-primary text-black hover:bg-primary/90 h-10 md:h-12 px-4 md:px-8 text-xs md:text-md">
                <a href={post.affiliateLink} target="_blank" rel="noopener noreferrer">
                  <ShieldCheck className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                  CLAIM LOOT
                </a>
             </Button>
          )}
          <Button variant="outline" className="comic-button bg-zinc-900 h-10 md:h-12 px-4 md:px-6 text-xs md:text-md">
            <Trophy className="h-4 w-4 md:h-5 md:w-5 mr-2 text-yellow-500" /> AWARD
          </Button>
          <div className="flex gap-2 md:gap-4 ml-auto">
              <Button variant="ghost" size="sm" className="font-black uppercase text-[10px] md:text-[12px] tracking-widest flex items-center gap-1 md:gap-2">
                <MessageCircle className="w-4 h-4 md:w-5 md:h-5 text-primary" /> {post.comments || 0}
              </Button>
              <Button variant="ghost" size="sm" className="font-black uppercase text-[10px] md:text-[12px] tracking-widest">
                <Share2 className="w-4 h-4 md:w-5 md:h-5" />
              </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

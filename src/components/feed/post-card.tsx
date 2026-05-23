'use client';
import type { Post, PostRarity } from '@/types';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ArrowBigUp, ArrowBigDown, MessageCircle, Share2, Sparkles, ShieldCheck, Trophy, Medal } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Timestamp, doc, updateDoc, increment } from 'firebase/firestore';
import { formatDistanceToNow } from 'date-fns';
import { useUser, useFirestore } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

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
    if (typeof post.createdAt === 'string') return post.createdAt;
    if (post.createdAt && typeof (post.createdAt as Timestamp).toDate === 'function') {
      return formatDistanceToNow((post.createdAt as Timestamp).toDate(), { addSuffix: true });
    }
    return '';
  };

  const getRarityColor = (rarity?: PostRarity) => {
    switch (rarity) {
      case 'Legendary': return 'text-yellow-400 border-yellow-400 bg-yellow-400/10';
      case 'Epic': return 'text-purple-400 border-purple-400 bg-purple-400/10';
      case 'Rare': return 'text-blue-400 border-blue-400 bg-blue-400/10';
      default: return 'text-muted-foreground border-muted bg-muted/10';
    }
  };

  const rarityClass = post.rarity === 'Legendary' ? 'rarity-legendary' : post.rarity === 'Epic' ? 'rarity-epic' : post.rarity === 'Rare' ? 'rarity-rare' : '';

  const handleVote = async (voteType: 'up' | 'down') => {
    if (!user) {
      toast({
        title: 'Operator ID Missing',
        description: 'Please identify yourself at the Command Center to interact.',
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
    <Card className={cn("flex flex-row overflow-hidden transition-all duration-300 bg-card/60 backdrop-blur-md hover:bg-card/80 border-white/5", rarityClass)}>
      <div className="flex flex-col items-center w-14 p-2 space-y-2 bg-black/40 border-r border-white/5">
        <Button variant="ghost" size="icon" className="w-10 h-10 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors" onClick={() => handleVote('up')}>
          <ArrowBigUp className="h-7 w-7" />
        </Button>
        <span className="text-sm font-black text-foreground">{post.upvotes - post.downvotes}</span>
        <Button variant="ghost" size="icon" className="w-10 h-10 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors" onClick={() => handleVote('down')}>
          <ArrowBigDown className="h-7 w-7" />
        </Button>
      </div>
      <div className="flex-1 p-5">
        <div className="flex items-center space-x-2 text-[10px] text-muted-foreground mb-3 font-bold uppercase tracking-widest">
          <Avatar className="w-5 h-5 border border-white/10">
            <AvatarImage src={post.avatarUrl} alt={post.author} />
            <AvatarFallback>{post.author.charAt(0)}</AvatarFallback>
          </Avatar>
          <span className="text-primary">/a/arena</span>
          <span>•</span>
          <span className="text-foreground/80">{post.author}</span>
          <span>•</span>
          <span>{getCreatedAt()}</span>
          
          {post.rarity && (
            <Badge variant="outline" className={cn("ml-2 font-black tracking-tighter uppercase text-[9px] px-2 py-0", getRarityColor(post.rarity))}>
              {post.rarity}
            </Badge>
          )}

          {post.aiResult && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="outline" className="ml-auto flex items-center gap-1 border-primary/30 text-primary cursor-help bg-primary/5 hover:bg-primary/10">
                    <Sparkles className="w-3 h-3" />
                    Pwr: {Math.round(post.aiResult.relevanceScore * 100)}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs bg-black/90 border-white/10 text-xs">
                  <p className="font-black uppercase tracking-widest text-primary mb-1">Appraiser Scan:</p>
                  <p className="opacity-90 italic">"{post.aiResult.reasoning}"</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        
        <div className="flex justify-between items-start gap-4">
          <h2 className="text-2xl font-black italic uppercase tracking-tighter leading-none text-foreground mb-2 group-hover:text-primary transition-colors">{post.title}</h2>
          <div className="flex gap-1 shrink-0">
             {post.awards?.map((award, i) => (
               <Badge key={i} variant="secondary" className="bg-yellow-500/20 text-yellow-500 border-yellow-500/50 flex items-center gap-1 px-1.5 py-0">
                 <Medal className="w-3 h-3" /> {award.count}
               </Badge>
             ))}
          </div>
        </div>
        
        {post.imageUrl && (
            <div className="relative w-full mt-4 overflow-hidden border border-white/10 rounded-xl aspect-video max-h-[400px] group shadow-2xl">
              <Image src={post.imageUrl} alt={post.title} fill className="object-cover transition-transform duration-700 group-hover:scale-110" priority={priority} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
              {post.rarity === 'Legendary' && <div className="absolute inset-0 bg-yellow-500/10 animate-pulse pointer-events-none" />}
            </div>
        )}

        <p className="mt-4 text-sm text-muted-foreground font-medium leading-relaxed line-clamp-4 italic border-l-2 border-white/10 pl-4">
            {post.content}
        </p>

        <div className="flex flex-wrap items-center gap-3 mt-6">
          {post.affiliateLink && (
             <Button asChild variant="default" className="gap-2 font-black uppercase tracking-widest text-xs h-10 px-6 shadow-xl shadow-accent/20 bg-accent text-accent-foreground hover:scale-105 active:scale-95 transition-all">
                <a href={post.affiliateLink} target="_blank" rel="noopener noreferrer">
                  <ShieldCheck className="h-4 w-4" />
                  Claim Loot: {post.affiliateLinkName || 'Rare Drop'}
                </a>
             </Button>
          )}
          <Button variant="outline" className="gap-2 font-black uppercase tracking-widest text-xs h-10 px-4 border-white/10 hover:bg-white/5">
            <Trophy className="h-4 w-4 text-yellow-500" /> Award
          </Button>
        </div>

        <div className="flex items-center gap-4 mt-8 border-t border-white/5 pt-4">
            <Button variant="ghost" size="sm" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground h-9 px-4 hover:bg-white/5">
              <MessageCircle className="w-4 h-4 mr-2" />
              <span>{post.comments} Comms</span>
            </Button>
            <Button variant="ghost" size="sm" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground h-9 px-4 hover:bg-white/5">
              <Share2 className="w-4 h-4 mr-2" />
              <span>Broadcast</span>
            </Button>
            <div className="flex flex-wrap gap-1 ml-auto">
              {post.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="secondary" className="px-2 py-0.5 text-[8px] font-black uppercase tracking-tighter bg-white/5 text-muted-foreground border-white/5">
                  #{tag}
                </Badge>
              ))}
            </div>
        </div>
      </div>
    </Card>
  );
}

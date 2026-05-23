'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Image from 'next/image';
import { User } from 'firebase/auth';
import { addDoc, collection, serverTimestamp, doc, updateDoc, increment } from 'firebase/firestore';
import { getDownloadURL, ref as storageRef, uploadBytes } from 'firebase/storage';

import { generateAltTextAction } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useStorage } from '@/firebase';
import { rankNewPost } from '@/ai/flows/rank-new-posts-with-ai';
import { PostRarity } from '@/types';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { BotMessageSquare, Sparkles, LoaderCircle, Link as LinkIcon, Zap, Hammer } from 'lucide-react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

const formSchema = z.object({
  title: z.string().min(10, 'Title must be at least 10 characters long.'),
  content: z.string().min(50, 'Content must be at least 50 characters long.'),
  tags: z.string().optional(),
  affiliateLink: z.string().url('Please enter a valid URL.').optional().or(z.literal('')),
  affiliateLinkName: z.string().optional(),
  altText: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export function CreatePostForm({ user }: { user: User }) {
  const { toast } = useToast();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const firestore = useFirestore();
  const storage = useStorage();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      content: '',
      tags: '',
      affiliateLink: '',
      affiliateLinkName: '',
      altText: '',
    },
  });

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const calculateRarity = (score: number): PostRarity => {
    if (score >= 0.9) return 'Legendary';
    if (score >= 0.75) return 'Epic';
    if (score >= 0.5) return 'Rare';
    return 'Common';
  };

  const onSubmit = async (data: FormData) => {
    if (!firestore || !user || !storage) return;

    setIsSubmitting(true);
    try {
      const tagsArray = (data.tags || '').split(',').map((tag) => tag.trim()).filter(Boolean);

      let imageUrl = '';
      if (imageFile) {
        const fileRef = storageRef(storage, `posts/${user.uid}/${Date.now()}_${imageFile.name}`);
        await uploadBytes(fileRef, imageFile);
        imageUrl = await getDownloadURL(fileRef);
      }
      
      const aiResult = await rankNewPost({
        title: data.title,
        content: data.content,
        tags: tagsArray,
        altText: data.altText,
      });

      const rarity = calculateRarity(aiResult.relevanceScore);

      const postData = {
        ...data,
        tags: tagsArray,
        uid: user.uid,
        author: user.displayName || 'Anonymous',
        avatarUrl: user.photoURL || '',
        createdAt: serverTimestamp(),
        upvotes: 0,
        downvotes: 0,
        comments: 0,
        imageUrl: imageUrl,
        aiResult,
        rarity,
      };

      const postsCollection = collection(firestore, 'posts');
      addDoc(postsCollection, postData).catch(async () => {
         // silent fail for rules
      });

      // Update User XP/Karma
      const userRef = doc(firestore, 'users', user.uid);
      updateDoc(userRef, {
        karma: increment(10),
        level: increment(0.1)
      }).catch(() => {});

      toast({
        title: `${rarity} Post Forged!`,
        description: `Power Level: ${Math.round(aiResult.relevanceScore * 100)}. You gained 10 XP!`,
      });
      
      form.reset();
      setImagePreview(null);
      setImageFile(null);
    } catch (error: any) {
      toast({
        title: 'Forge Failed',
        description: error.message || 'The AI rejected your draft.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card className="border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 uppercase tracking-tighter italic font-black">
              <Hammer className="text-primary h-5 w-5" /> The Forge
            </CardTitle>
            <CardDescription className="text-xs uppercase font-bold tracking-widest text-muted-foreground">Craft high-rarity content for maximum rewards.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase tracking-widest">Post Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter a powerful headline..." {...field} className="bg-secondary/30" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase tracking-widest">Masterpiece Content</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Inject value into the arena..." className="min-h-48 bg-secondary/30" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card className="border-2 border-accent/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 uppercase tracking-tighter italic font-black">
              <Zap className="text-accent h-5 w-5" /> Loot & SEO
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
             <FormField
              control={form.control}
              name="affiliateLink"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase tracking-widest">Affiliate Loot Link</FormLabel>
                  <FormControl>
                    <Input type="url" placeholder="https://..." {...field} className="bg-secondary/30" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase tracking-widest">Attribute Tags</FormLabel>
                  <FormControl>
                    <Input placeholder="SEO, Marketing, Rare" {...field} className="bg-secondary/30" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting} className="font-black uppercase tracking-widest px-8 shadow-xl shadow-primary/20">
            {isSubmitting ? <LoaderCircle className="animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
            {isSubmitting ? 'Forging...' : 'Forge & Rank'}
          </Button>
        </div>
      </form>
    </Form>
  );
}

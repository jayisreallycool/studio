
'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User } from 'firebase/auth';
import { addDoc, collection, serverTimestamp, doc, updateDoc, increment } from 'firebase/firestore';
import { getDownloadURL, ref as storageRef, uploadBytes } from 'firebase/storage';

import { useToast } from '@/hooks/use-toast';
import { useFirestore, useStorage } from '@/firebase';
import { rankNewPost } from '@/ai/flows/rank-new-posts-with-ai';
import { PostRarity } from '@/types';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Sparkles, LoaderCircle, Zap, Hammer, Coins } from 'lucide-react';

const formSchema = z.object({
  title: z.string().min(5, 'Name must be at least 5 characters long.'),
  content: z.string().min(20, 'Lore must be at least 20 characters long.'),
  tags: z.string().optional(),
  affiliateLink: z.string().url('Loot link must be a valid URL.').optional().or(z.literal('')),
  affiliateLinkName: z.string().optional(),
  altText: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export function CreatePostForm({ user }: { user: User }) {
  const { toast } = useToast();
  const [imageFile, setImageFile] = useState<File | null>(null);
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
    if (file) setImageFile(file);
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
        const fileRef = storageRef(storage, `artifacts/${user.uid}/${Date.now()}_${imageFile.name}`);
        await uploadBytes(fileRef, imageFile);
        imageUrl = await getDownloadURL(fileRef);
      }
      
      const appraisal = await rankNewPost({
        title: data.title,
        content: data.content,
        tags: tagsArray,
        altText: data.altText,
      });

      const rarity = calculateRarity(appraisal.relevanceScore);

      const artifactData = {
        ...data,
        tags: tagsArray,
        uid: user.uid,
        author: user.displayName || 'Unknown Operator',
        avatarUrl: user.photoURL || '',
        createdAt: serverTimestamp(),
        upvotes: 0,
        downvotes: 0,
        comments: 0,
        imageUrl: imageUrl,
        aiResult: appraisal,
        rarity,
      };

      const postsCollection = collection(firestore, 'posts');
      await addDoc(postsCollection, artifactData);

      const userRef = doc(firestore, 'users', user.uid);
      await updateDoc(userRef, {
        karma: increment(50),
        level: increment(0.2)
      });

      toast({
        title: `${rarity} Artifact Forged!`,
        description: `Power Level: ${Math.round(appraisal.relevanceScore * 100)}. You gained 50 XP!`,
      });
      
      form.reset();
      setImageFile(null);
    } catch (error: any) {
      toast({
        title: 'Forge Failed',
        description: error.message || 'The Forge rejected your materials.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card className="border-2 border-primary/20 bg-background/50 backdrop-blur-sm shadow-2xl shadow-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 uppercase tracking-tighter italic font-black text-2xl">
              <Hammer className="text-primary h-6 w-6" /> The Forge
            </CardTitle>
            <CardDescription className="text-xs uppercase font-bold tracking-widest text-muted-foreground italic">Combine lore and materials to create high-rarity artifacts.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase tracking-widest text-primary/80">Artifact Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Blade of Eternal Flux..." {...field} className="bg-secondary/20 border-white/5 focus:border-primary/50 transition-colors" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-primary/80">Visual Material (Image)</Label>
              <Input type="file" accept="image/*" onChange={handleImageChange} className="bg-secondary/20 border-white/5 cursor-pointer" />
            </div>
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase tracking-widest text-primary/80">Artifact Lore</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describe the origin and power of this artifact..." className="min-h-48 bg-secondary/20 border-white/5 focus:border-primary/50" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card className="border-2 border-accent/20 bg-background/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 uppercase tracking-tighter italic font-black text-xl text-accent">
              <Zap className="h-5 w-5" /> Loot & Attributes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
             <FormField
              control={form.control}
              name="affiliateLink"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase tracking-widest text-accent/80">Loot Drop Link (Optional)</FormLabel>
                  <FormControl>
                    <Input type="url" placeholder="https://external-loot.com/item..." {...field} className="bg-secondary/20 border-white/5 focus:border-accent/50" />
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
                  <FormLabel className="text-[10px] font-black uppercase tracking-widest text-accent/80">Attribute Tags (Comma separated)</FormLabel>
                  <FormControl>
                    <Input placeholder="Fire, Sharp, Ancient" {...field} className="bg-secondary/20 border-white/5 focus:border-accent/50" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={isSubmitting} className="font-black uppercase tracking-widest px-10 py-6 text-md shadow-2xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
            {isSubmitting ? <LoaderCircle className="animate-spin mr-2" /> : <Coins className="mr-2 h-5 w-5" />}
            {isSubmitting ? 'Forging...' : 'Forge Artifact'}
          </Button>
        </div>
      </form>
    </Form>
  );
}

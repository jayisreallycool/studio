'use client';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Image from 'next/image';
import { User } from 'firebase/auth';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

import { generateAltTextAction } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { useFirestore } from '@/firebase';
import { rankNewPost } from '@/ai/flows/rank-new-posts-with-ai';

import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { BotMessageSquare, Sparkles, LoaderCircle, Link as LinkIcon } from 'lucide-react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';


const formSchema = z.object({
  title: z.string().min(10, "Title must be at least 10 characters long."),
  content: z.string().min(50, "Content must be at least 50 characters long."),
  tags: z.string().optional(),
  affiliateLink: z.string().url("Please enter a valid URL.").optional().or(z.literal('')),
  affiliateLinkName: z.string().optional(),
  altText: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export function CreatePostForm({ user }: { user: User }) {
  const { toast } = useToast();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const firestore = useFirestore();

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
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const handleGenerateAltText = async () => {
    if (!imagePreview) {
      toast({
        title: "No Image Selected",
        description: "Please select an image first to generate alt text.",
        variant: "destructive",
      });
      return;
    }
    setIsGenerating(true);
    try {
      const result = await generateAltTextAction(imagePreview);
      if (result.altText) {
        form.setValue('altText', result.altText);
        toast({
          title: "Alt Text Generated!",
          description: "The AI-generated alt text has been added.",
        });
      } else {
        throw new Error(result.error || 'Unknown error');
      }
    } catch (error: any) {
      toast({
        title: "Generation Failed",
        description: error.message || "Could not generate alt text.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    if (!firestore || !user) return;

    setIsSubmitting(true);
    try {
      const tagsArray = (data.tags || '').split(',').map(tag => tag.trim()).filter(Boolean);

      const aiResult = await rankNewPost({
        title: data.title,
        content: data.content,
        tags: tagsArray,
        altText: data.altText,
      });

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
        imageUrl: imagePreview || '', // This is not ideal, you should upload the image to a storage bucket
        aiResult,
      };

      const postsCollection = collection(firestore, 'posts');
      addDoc(postsCollection, postData)
        .catch(async (serverError) => {
            const permissionError = new FirestorePermissionError({
                path: postsCollection.path,
                operation: 'create',
                requestResourceData: postData
            });
            errorEmitter.emit('permission-error', permissionError);
        });

      toast({
        title: "Post Created & Analyzed!",
        description: `Relevance: ${aiResult.relevanceScore.toFixed(2)}. ${aiResult.reasoning}`,
      });
      form.reset();
      setImagePreview(null);

    } catch (error: any) {
      toast({
        title: "Error Creating Post",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Post Details</CardTitle>
            <CardDescription>Craft your content here. The better the SEO, the higher the earnings.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Post Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., The Ultimate Guide to..." {...field} />
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
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Write your masterpiece..." className="min-h-48" {...field} />
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
                  <FormLabel>Tags</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., SEO, Marketing, Tech" {...field} />
                  </FormControl>
                  <FormDescription>
                    Comma-separated tags to improve discoverability.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Post Image</CardTitle>
            <CardDescription>Add a featured image for your post to improve engagement.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormItem>
              <FormLabel>Image Upload</FormLabel>
              <FormControl>
                <Input type="file" accept="image/*" onChange={handleImageChange} className="cursor-pointer" />
              </FormControl>
            </FormItem>

            {imagePreview && (
              <div className="relative aspect-video w-full overflow-hidden rounded-md border">
                <Image src={imagePreview} alt="Post preview" fill className="object-cover" />
              </div>
            )}

            <FormField
              control={form.control}
              name="altText"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Alt Text</FormLabel>
                  <div className="flex items-center gap-2">
                    <FormControl>
                      <Input placeholder="Descriptive alt text for the image..." {...field} />
                    </FormControl>
                    <Button type="button" onClick={handleGenerateAltText} disabled={!imagePreview || isGenerating} size="icon">
                      <span className="sr-only">Generate Alt Text</span>
                      {isGenerating ? <LoaderCircle className="animate-spin" /> : <Sparkles />}
                    </Button>
                  </div>
                  <FormDescription>
                    Good alt text is important for SEO and accessibility.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
              <CardTitle className="flex items-center gap-2"><LinkIcon className="h-5 w-5"/> Affiliate Link</CardTitle>
              <CardDescription>Add an affiliate link to monetize this post.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="affiliateLink"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Link URL</FormLabel>
                  <FormControl>
                    <Input type="url" placeholder="https://affiliate.example.com/product" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="affiliateLinkName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Link Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Buy Now, Check it out" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
        
        <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <LoaderCircle className="animate-spin" /> : <BotMessageSquare className="mr-2 h-4 w-4" />}
                {isSubmitting ? 'Submitting...' : 'Create & Analyze Post'}
            </Button>
        </div>
      </form>
    </Form>
  );
}

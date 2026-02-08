'use client';
import { useEffect, useActionState, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Image from 'next/image';

import { createPostAction, generateAltTextAction, type FormState } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';

import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { CheckCircle, Info, Link as LinkIcon, BotMessageSquare, Sparkles, LoaderCircle } from 'lucide-react';


const formSchema = z.object({
  title: z.string().min(10, "Title must be at least 10 characters long."),
  content: z.string().min(50, "Content must be at least 50 characters long."),
  tags: z.string().optional(),
  affiliateLink: z.string().url("Please enter a valid URL.").optional().or(z.literal('')),
  altText: z.string().optional(),
});

const initialState: FormState = {
  message: '',
};

export function CreatePostForm() {
  const [state, formAction] = useActionState(createPostAction, initialState);
  const { toast } = useToast();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      content: '',
      tags: '',
      affiliateLink: '',
      altText: '',
    },
  });

  useEffect(() => {
    if (state.success) {
      toast({
        title: "Post Analyzed!",
        description: (
          <div className="space-y-2">
            <p>{state.message}</p>
            {state.aiResult && (
              <div className="text-sm space-y-1">
                <p><strong>Relevance Score:</strong> {state.aiResult.relevanceScore.toFixed(2)}</p>
                <p><strong>Recommendation:</strong> {state.aiResult.boostRecommendation ? "Boost Recommended" : "No Boost"}</p>
                <p><strong>Reasoning:</strong> {state.aiResult.reasoning}</p>
              </div>
            )}
          </div>
        ),
        variant: "default",
      });
      form.reset();
      setImagePreview(null);
    } else if (state.message && state.issues) {
      toast({
        title: "Error",
        description: state.message,
        variant: "destructive",
      });
    }
  }, [state, toast, form]);


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


  return (
    <Form {...form}>
      <form action={formAction} className="space-y-6">
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
          <CardContent>
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
          </CardContent>
        </Card>
        
        <div className="flex justify-end">
            <Button type="submit">
                <BotMessageSquare className="mr-2 h-4 w-4" />
                Create & Analyze Post
            </Button>
        </div>
      </form>
    </Form>
  );
}

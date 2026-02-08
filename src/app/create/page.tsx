'use client';
import { CreatePostForm } from '@/components/create/create-post-form';
import { SeoTips } from '@/components/create/seo-tips';
import { useUser } from '@/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BotMessageSquare } from 'lucide-react';

export default function CreatePostPage() {
  const { user, loading } = useUser();

  if (loading) {
    return <div>Loading...</div>
  }

  if (!user) {
    return (
        <div className="flex items-center justify-center h-full">
            <Card className="w-full max-w-md text-center">
                <CardHeader>
                    <CardTitle className="flex items-center justify-center gap-2">
                        <BotMessageSquare /> Please Sign In
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <CardDescription>
                        You need to be signed in to create a post.
                    </CardDescription>
                </CardContent>
            </Card>
        </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">Create New Post</h1>
      <div className="grid gap-12 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <CreatePostForm user={user} />
        </div>
        <div className="lg:col-span-1">
          <SeoTips />
        </div>
      </div>
    </div>
  );
}

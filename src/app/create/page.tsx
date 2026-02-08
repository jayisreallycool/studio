import { CreatePostForm } from '@/components/create/create-post-form';
import { SeoTips } from '@/components/create/seo-tips';

export default function CreatePostPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">Create New Post</h1>
      <div className="grid gap-12 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <CreatePostForm />
        </div>
        <div className="lg:col-span-1">
          <SeoTips />
        </div>
      </div>
    </div>
  );
}

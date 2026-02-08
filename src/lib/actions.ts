'use server';

import { rankNewPost, RankNewPostInput, RankNewPostOutput } from '@/ai/flows/rank-new-posts-with-ai';
import { generateAltText as generateAltTextFlow } from '@/ai/flows/generate-alt-text-flow';
import { z } from 'zod';

const formSchema = z.object({
  title: z.string().min(10, "Title must be at least 10 characters."),
  content: z.string().min(50, "Content must be at least 50 characters."),
  tags: z.string().optional(),
  affiliateLink: z.string().url("Please enter a valid URL.").optional().or(z.literal('')),
  affiliateLinkName: z.string().optional(),
  altText: z.string().optional(),
});

export type FormState = {
  message: string;
  fields?: Record<string, string | undefined>;
  issues?: string[];
  aiResult?: RankNewPostOutput;
  success?: boolean;
};

export async function createPostAction(prevState: FormState, formData: FormData): Promise<FormState> {
  const validatedFields = formSchema.safeParse({
    title: formData.get('title'),
    content: formData.get('content'),
    tags: formData.get('tags'),
    affiliateLink: formData.get('affiliateLink'),
    affiliateLinkName: formData.get('affiliateLinkName'),
    altText: formData.get('altText'),
  });

  if (!validatedFields.success) {
    const { fieldErrors } = validatedFields.error.flatten();
    return {
      message: 'Error: Please check the fields.',
      fields: {
        title: validatedFields.data?.title,
        content: validatedFields.data?.content,
        tags: validatedFields.data?.tags,
        affiliateLink: validatedFields.data?.affiliateLink,
        affiliateLinkName: validatedFields.data?.affiliateLinkName,
        altText: validatedFields.data?.altText,
      },
      issues: validatedFields.error.flatten().formErrors,
    };
  }

  const { title, content, tags, altText } = validatedFields.data;
  const tagsArray = (tags || '').split(',').map(tag => tag.trim()).filter(Boolean);

  try {
    const aiInput: RankNewPostInput = {
      title,
      content,
      tags: tagsArray,
      altText,
    };

    const aiResult = await rankNewPost(aiInput);

    return {
      message: `Post "${title}" analyzed successfully!`,
      aiResult: aiResult,
      success: true,
    };

  } catch (error) {
    console.error(error);
    return {
      message: 'An error occurred while analyzing the post with AI. Please try again.'
    }
  }
}


export async function generateAltTextAction(
  photoDataUri: string
): Promise<{ altText?: string; error?: string }> {
  if (!photoDataUri) {
    return { error: 'No image provided to generate alt text from.' };
  }
  try {
    const result = await generateAltTextFlow({ photoDataUri });
    return { altText: result.altText };
  } catch (e) {
    console.error(e);
    return { error: 'Failed to generate alt text.' };
  }
}

'use server';

import { rankNewPost, RankNewPostInput, RankNewPostOutput } from '@/ai/flows/rank-new-posts-with-ai';
import { z } from 'zod';

const formSchema = z.object({
  title: z.string().min(10, "Title must be at least 10 characters."),
  content: z.string().min(50, "Content must be at least 50 characters."),
  tags: z.string(),
});

export type FormState = {
  message: string;
  fields?: Record<string, string>;
  issues?: string[];
  aiResult?: RankNewPostOutput;
  success?: boolean;
};

export async function createPostAction(prevState: FormState, formData: FormData): Promise<FormState> {
  const validatedFields = formSchema.safeParse({
    title: formData.get('title'),
    content: formData.get('content'),
    tags: formData.get('tags'),
  });

  if (!validatedFields.success) {
    const { fieldErrors } = validatedFields.error.flatten();
    return {
      message: 'Error: Please check the fields.',
      fields: {
        title: validatedFields.data?.title,
        content: validatedFields.data?.content,
        tags: validatedFields.data?.tags,
      },
      issues: validatedFields.error.flatten().formErrors,
    };
  }

  const { title, content, tags } = validatedFields.data;
  const tagsArray = tags.split(',').map(tag => tag.trim()).filter(Boolean);

  try {
    const aiInput: RankNewPostInput = {
      title,
      content,
      tags: tagsArray,
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

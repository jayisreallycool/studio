'use server';
import { generateAltText as generateAltTextFlow } from '@/ai/flows/generate-alt-text-flow';

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

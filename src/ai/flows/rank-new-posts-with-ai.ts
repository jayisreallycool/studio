'use server';
/**
 * @fileOverview AI flow for ranking new user-submitted posts based on relevance.
 *
 * - rankNewPost - A function that analyzes a new post and determines its relevance.
 * - RankNewPostInput - The input type for the rankNewPost function.
 * - RankNewPostOutput - The return type for the rankNewPost function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RankNewPostInputSchema = z.object({
  title: z.string().describe('The title of the post.'),
  content: z.string().describe('The main content of the post.'),
  tags: z.array(z.string()).describe('Keywords or tags associated with the post.'),
  altText: z.string().optional().describe('Alt text for the post image, if any.'),
});
export type RankNewPostInput = z.infer<typeof RankNewPostInputSchema>;

const RankNewPostOutputSchema = z.object({
  relevanceScore: z
    .number()
    .describe(
      'A score indicating the relevance of the post, higher values indicate greater relevance.'
    ),
  reasoning: z
    .string()
    .describe('The AI’s reasoning for the assigned relevance score.'),
  boostRecommendation: z
    .boolean()
    .describe(
      'A boolean value, true if the post should receive a ranking boost, false otherwise.'
    ),
});
export type RankNewPostOutput = z.infer<typeof RankNewPostOutputSchema>;

export async function rankNewPost(input: RankNewPostInput): Promise<RankNewPostOutput> {
  return rankNewPostFlow(input);
}

const rankNewPostPrompt = ai.definePrompt({
  name: 'rankNewPostPrompt',
  input: {schema: RankNewPostInputSchema},
  output: {schema: RankNewPostOutputSchema},
  prompt: `You are an AI assistant that analyzes user-submitted posts on a social content platform to determine their relevance and assign a ranking score. Good SEO is important, so consider the alt text for the image if it is provided.

Analyze the following post and provide a relevance score between 0 and 1, along with reasoning for the score. Additionally, recommend whether the post should receive a ranking boost based on its relevance.

Post Title: {{{title}}}
Post Content: {{{content}}}
Post Tags: {{#each tags}}{{{this}}} {{/each}}
{{#if altText}}Image Alt Text: {{{altText}}}{{/if}}

Provide your output as a JSON object with the keys: relevanceScore, reasoning, boostRecommendation.
`,
});

const rankNewPostFlow = ai.defineFlow(
  {
    name: 'rankNewPostFlow',
    inputSchema: RankNewPostInputSchema,
    outputSchema: RankNewPostOutputSchema,
  },
  async input => {
    const {output} = await rankNewPostPrompt(input);
    return output!;
  }
);

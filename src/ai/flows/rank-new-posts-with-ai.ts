
'use server';
/**
 * @fileOverview AI flow for appraising new artifacts in the Arena.
 *
 * - rankNewPost - A function that appraises a new artifact and determines its Power Level.
 * - RankNewPostInput - The input type for the rankNewPost function.
 * - RankNewPostOutput - The return type for the rankNewPost function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RankNewPostInputSchema = z.object({
  title: z.string().describe('The name of the artifact.'),
  content: z.string().describe('The lore or description of the artifact.'),
  tags: z.array(z.string()).describe('Attributes associated with the artifact.'),
  altText: z.string().optional().describe('Visual scan description of the artifact.'),
});
export type RankNewPostInput = z.infer<typeof RankNewPostInputSchema>;

const RankNewPostOutputSchema = z.object({
  relevanceScore: z
    .number()
    .describe(
      'A Power Level score between 0 and 1. High scores mean legendary artifacts.'
    ),
  reasoning: z
    .string()
    .describe('The AI appraisal for why this artifact has this power level.'),
  boostRecommendation: z
    .boolean()
    .describe(
      'True if the artifact is exceptional enough to be featured in the High Council.'
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
  prompt: `You are the High Appraiser of the Affluence Arena. Your job is to judge new "Artifacts" (posts) created by Operators.

Judge the artifact based on its lore (content), its name (title), and its attributes (tags). 
High-quality, immersive, and valuable artifacts get a higher Power Level (relevanceScore).

Artifact Name: {{{title}}}
Artifact Lore: {{{content}}}
Attributes: {{#each tags}}{{{this}}} {{/each}}
{{#if altText}}Visual Scan: {{{altText}}}{{/if}}

Provide your appraisal as a JSON object with: relevanceScore (0-1), reasoning, and boostRecommendation.
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

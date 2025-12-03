'use server';

/**
 * @fileOverview AI tool to analyze documentation links provided by students to assess credibility and relevance of activity submissions.
 *
 * - verifySubmissionCredibility - A function that handles the submission credibility verification process.
 * - VerifySubmissionCredibilityInput - The input type for the verifySubmissionCredibility function.
 * - VerifySubmissionCredibilityOutput - The return type for the verifySubmissionCredibility function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const VerifySubmissionCredibilityInputSchema = z.object({
  activityDescription: z.string().describe('The description of the activity submitted by the student.'),
  documentationLinks: z.array(z.string().url()).describe('An array of URLs linking to documentation supporting the activity.'),
  sdgGoals: z.string().describe('The Sustainable Development Goals (SDGs) that the activity is intended to support.'),
});
export type VerifySubmissionCredibilityInput = z.infer<typeof VerifySubmissionCredibilityInputSchema>;

const VerifySubmissionCredibilityOutputSchema = z.object({
  overallCredibility: z.string().describe('An overall assessment of the credibility of the submission, considering the activity description, documentation links, and SDG goals.'),
  relevanceToSdgGoals: z.string().describe('An evaluation of how relevant the provided documentation is to the stated SDG goals.'),
  recommendation: z.string().describe('A recommendation on whether to approve or reject the submission based on the credibility and relevance assessment.'),
  summaryOfLinks: z.array(z.object({
    url: z.string().url(),
    summary: z.string(),
  })).describe('Summaries of each documentation link and whether they support the submission.'),
});
export type VerifySubmissionCredibilityOutput = z.infer<typeof VerifySubmissionCredibilityOutputSchema>;

export async function verifySubmissionCredibility(input: VerifySubmissionCredibilityInput): Promise<VerifySubmissionCredibilityOutput> {
  return verifySubmissionCredibilityFlow(input);
}

const summarizeLink = ai.defineTool({
  name: 'summarizeLink',
  description: 'Retrieves content from a URL and summarizes it.',
  inputSchema: z.object({
    url: z.string().url().describe('The URL to summarize.'),
  }),
  outputSchema: z.string().describe('A summary of the content at the URL.'),
},
async (input) => {
    // Basic implementation of fetching and summarizing content from URL
    try {
      const response = await fetch(input.url);
      if (!response.ok) {
        return `Failed to fetch content from ${input.url}: ${response.status} ${response.statusText}`;
      }
      const text = await response.text();
      // Truncate if content is too large
      const truncatedText = text.substring(0, 2000); // Limit to 2000 characters to avoid excessive processing

      return `Summary of ${input.url}: ${truncatedText}`;
    } catch (error: any) {
      return `Error summarizing ${input.url}: ${error.message}`;
    }
  }
);

const prompt = ai.definePrompt({
  name: 'verifySubmissionCredibilityPrompt',
  input: {schema: VerifySubmissionCredibilityInputSchema},
  output: {schema: VerifySubmissionCredibilityOutputSchema},
  tools: [summarizeLink],
  prompt: `You are an expert in evaluating the credibility and relevance of student activity submissions related to Sustainable Development Goals (SDGs).

  You will receive the activity description, a list of documentation links provided by the student, and the SDGs that the activity is intended to support.

  Your task is to:
  1. Summarize each documentation link using the summarizeLink tool and determine if it is relevant to the activity description and the stated SDGs.
  2. Provide an overall assessment of the credibility of the submission.
  3. Evaluate how relevant the provided documentation is to the stated SDG goals.
  4. Provide a recommendation on whether to approve or reject the submission.

  Here is the information for the evaluation:
  Activity Description: {{{activityDescription}}}
  SDG Goals: {{{sdgGoals}}}
  Documentation Links: {{#each documentationLinks}} {{{this}}} {{/each}}

  Output your evaluation in the following JSON format:
  { 
    "overallCredibility": "...".
    "relevanceToSdgGoals": "...".
    "recommendation": "...".
    "summaryOfLinks": [
        {
            "url": "...",
            "summary": "..."
        }
    ]
  }
  `,
});

const verifySubmissionCredibilityFlow = ai.defineFlow(
  {
    name: 'verifySubmissionCredibilityFlow',
    inputSchema: VerifySubmissionCredibilityInputSchema,
    outputSchema: VerifySubmissionCredibilityOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

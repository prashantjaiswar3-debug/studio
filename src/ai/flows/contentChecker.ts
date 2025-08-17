'use server';

import { ai } from '../genkit';
import { z } from 'zod';

const ContentCheckInputSchema = z.object({ channelName: z.string() });
const ContentCheckOutputSchema = z.object({ isSafe: z.boolean(), reason: z.string() });

export const contentCheckFlow = ai.defineFlow(
  {
    name: 'contentCheckFlow',
    inputSchema: ContentCheckInputSchema,
    outputSchema: ContentCheckOutputSchema,
  },
  async ({ channelName }) => {
    // This is a mock implementation.
    // In a real-world scenario, this would use a content moderation model.
    const unsafeKeywords = ['adult', 'xxx', 'violate', 'offensive', 'explicit'];
    const lowerCaseName = channelName.toLowerCase();

    for (const keyword of unsafeKeywords) {
      if (lowerCaseName.includes(keyword)) {
        return {
          isSafe: false,
          reason: `Channel name contains potentially unsafe keyword: "${keyword}".`,
        };
      }
    }

    // Simulate some AI processing time
    await new Promise(resolve => setTimeout(resolve, 50));

    return {
      isSafe: true,
      reason: 'Channel name appears to be safe.',
    };
  }
);

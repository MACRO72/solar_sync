// SummarizePerformanceAnomalies
'use server';
/**
 * @fileOverview Summarizes performance anomalies detected in the system.
 *
 * - summarizePerformanceAnomalies - A function that takes anomaly data and returns a summarized explanation.
 * - SummarizePerformanceAnomaliesInput - The input type for the summarizePerformanceAnomalies function.
 * - SummarizePerformanceAnomaliesOutput - The return type for the summarizePerformanceAnomalies function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizePerformanceAnomaliesInputSchema = z.object({
  anomalyData: z.string().describe('The performance anomaly data as a string.'),
});
export type SummarizePerformanceAnomaliesInput = z.infer<typeof SummarizePerformanceAnomaliesInputSchema>;

const SummarizePerformanceAnomaliesOutputSchema = z.object({
  summary: z.string().describe('A summarized explanation of the performance anomalies.'),
});
export type SummarizePerformanceAnomaliesOutput = z.infer<typeof SummarizePerformanceAnomaliesOutputSchema>;

export async function summarizePerformanceAnomalies(input: SummarizePerformanceAnomaliesInput): Promise<SummarizePerformanceAnomaliesOutput> {
  return summarizePerformanceAnomaliesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizePerformanceAnomaliesPrompt',
  input: {schema: SummarizePerformanceAnomaliesInputSchema},
  output: {schema: SummarizePerformanceAnomaliesOutputSchema},
  prompt: `You are an AI assistant specializing in summarizing performance anomaly data for a solar energy system.
  Given the following anomaly data, provide a concise summary of the key issues and potential causes.
  Anomaly Data: {{{anomalyData}}}
  Summary: `,
});

const summarizePerformanceAnomaliesFlow = ai.defineFlow(
  {
    name: 'summarizePerformanceAnomaliesFlow',
    inputSchema: SummarizePerformanceAnomaliesInputSchema,
    outputSchema: SummarizePerformanceAnomaliesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

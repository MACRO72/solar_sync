'use server';

/**
 * @fileOverview An AI agent to analyze sensor data from a CSV file.
 *
 * - analyzeCsvData - A function that takes a CSV string, parses it, and returns an AI-generated analysis.
 * - AnalyzeCsvDataInput - The input type for the analyzeCsvData function.
 * - AnalyzeCsvDataOutput - The return type for the analyzeCsvData function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import Papa from 'papaparse';

const AnalyzeCsvDataInputSchema = z.object({
  csvData: z.string().describe('A string containing data in CSV format.'),
});
export type AnalyzeCsvDataInput = z.infer<typeof AnalyzeCsvDataInputSchema>;

const AnalyzeCsvDataOutputSchema = z.object({
  rowCount: z.number().describe('The total number of data rows analyzed.'),
  headers: z.array(z.string()).describe('The headers found in the CSV file.'),
  analysis: z.string().describe('An AI-generated summary and analysis of the data, highlighting key trends, anomalies, and insights.'),
  keyMetrics: z.record(z.string(), z.union([z.string(), z.number()])).describe('Key metrics extracted from the data, such as averages or totals.'),
});
export type AnalyzeCsvDataOutput = z.infer<typeof AnalyzeCsvDataOutputSchema>;

export async function analyzeCsvData(
  input: AnalyzeCsvDataInput
): Promise<AnalyzeCsvDataOutput> {
  return analyzeCsvDataFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeCsvDataPrompt',
  input: { schema: z.object({ jsonData: z.string(), rowCount: z.number() }) },
  output: { schema: AnalyzeCsvDataOutputSchema.pick({ analysis: true, keyMetrics: true }) },
  prompt: `You are a data analyst specializing in solar panel sensor data.
You have been provided with a JSON representation of sensor readings.

Your task is to:
1.  Analyze the provided data which contains {{{rowCount}}} rows.
2.  Identify key trends, significant events, or potential anomalies in the data. Look for correlations between metrics like temperature, irradiance, and power output.
3.  Calculate a few key metrics (e.g., average efficiency, peak power output, average temperature).
4.  Provide a concise, insightful "analysis" of the dataset in plain English.
5.  Return the calculated metrics in the "keyMetrics" object.

JSON Data:
{{{jsonData}}}
`,
});

const analyzeCsvDataFlow = ai.defineFlow(
  {
    name: 'analyzeCsvDataFlow',
    inputSchema: AnalyzeCsvDataInputSchema,
    outputSchema: AnalyzeCsvDataOutputSchema,
  },
  async ({ csvData }) => {
    // 1. Parse the CSV data
    const parsed = Papa.parse(csvData, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
    });

    if (parsed.errors.length > 0) {
      console.error('CSV Parsing errors:', parsed.errors);
      throw new Error('Failed to parse CSV data.');
    }

    const jsonData = JSON.stringify(parsed.data);
    const rowCount = parsed.data.length;
    const headers = parsed.meta.fields || [];

    // 2. Call the AI model to get analysis and key metrics
    const { output } = await prompt({ jsonData, rowCount });

    if (!output) {
      throw new Error('The AI model did not return a valid analysis.');
    }

    // 3. Combine parsing results with AI analysis
    return {
      rowCount,
      headers,
      analysis: output.analysis,
      keyMetrics: output.keyMetrics,
    };
  }
);

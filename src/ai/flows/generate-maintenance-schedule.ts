'use server';

/**
 * @fileOverview An AI agent to analyze historical data and sensor readings to predict potential system failures or efficiency drops, for proactive maintenance scheduling.
 *
 * - generateMaintenanceSchedule - A function that triggers the maintenance schedule generation process.
 * - GenerateMaintenanceScheduleInput - The input type for the generateMaintenanceSchedule function.
 * - GenerateMaintenanceScheduleOutput - The return type for the generateMaintenanceSchedule function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateMaintenanceScheduleInputSchema = z.object({
  historicalData: z
    .string()
    .describe('Historical sensor data and system performance logs.'),
  sensorReadings: z
    .string()
    .describe('Recent sensor readings from the solar system.'),
  systemDescription: z
    .string()
    .describe('Description of the solar system setup, including components and configurations.'),
});
export type GenerateMaintenanceScheduleInput = z.infer<
  typeof GenerateMaintenanceScheduleInputSchema
>;

const GenerateMaintenanceScheduleOutputSchema = z.object({
  predictedFailures: z
    .string()
    .describe('Predicted potential system failures or efficiency drops.'),
  maintenanceSchedule: z
    .string()
    .describe('Recommended maintenance schedule to prevent failures and optimize efficiency.'),
  confidenceScore: z
    .number()
    .describe('Confidence score for the predicted failures and maintenance schedule.'),
  actionableAdvice: z
    .string()
    .describe('Specific actionable advice for system administrators based on the analysis.'),
});
export type GenerateMaintenanceScheduleOutput = z.infer<
  typeof GenerateMaintenanceScheduleOutputSchema
>;

export async function generateMaintenanceSchedule(
  input: GenerateMaintenanceScheduleInput
): Promise<GenerateMaintenanceScheduleOutput> {
  return generateMaintenanceScheduleFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateMaintenanceSchedulePrompt',
  input: {schema: GenerateMaintenanceScheduleInputSchema},
  output: {schema: GenerateMaintenanceScheduleOutputSchema},
  prompt: `You are an AI expert in solar system maintenance and predictive analytics.

You will analyze the provided historical data, recent sensor readings, and system description to predict potential system failures or efficiency drops.
Based on your analysis, you will generate a maintenance schedule to prevent these failures and optimize efficiency.

Historical Data: {{{historicalData}}}
Sensor Readings: {{{sensorReadings}}}
System Description: {{{systemDescription}}}

Provide specific actionable advice for system administrators based on your analysis. Include a confidence score for your predictions and recommendations.
`,
});

const generateMaintenanceScheduleFlow = ai.defineFlow(
  {
    name: 'generateMaintenanceScheduleFlow',
    inputSchema: GenerateMaintenanceScheduleInputSchema,
    outputSchema: GenerateMaintenanceScheduleOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

'use server';

/**
 * @fileOverview An AI agent to predict solar panel efficiency based on weather forecasts using Gemini 2.0 Flash.
 *
 * - predictEfficiency - A function that takes location and returns an efficiency prediction.
 * - PredictEfficiencyInput - The input type for the predictEfficiency function.
 * - PredictEfficiencyOutput - The return type for the predictEfficiency function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getWeatherForecast } from '@/ai/tools/get-weather-forecast';

const PredictEfficiencyInputSchema = z.object({
  lat: z.number().describe('The latitude for the forecast.'),
  lng: z.number().describe('The longitude for the forecast.'),
});
export type PredictEfficiencyInput = z.infer<
  typeof PredictEfficiencyInputSchema
>;

const PredictEfficiencyOutputSchema = z.object({
  predictedEfficiency: z.number().describe('The predicted solar panel efficiency percentage (0-100).'),
  weatherSummary: z.string().describe('A brief summary of the weather conditions used for the prediction.'),
  confidence: z.number().describe('A confidence score (0-1) for the prediction.'),
  advice: z.string().describe('Actionable advice based on the prediction.'),
});
export type PredictEfficiencyOutput = z.infer<
  typeof PredictEfficiencyOutputSchema
>;

export async function predictEfficiency(
  input: PredictEfficiencyInput
): Promise<PredictEfficiencyOutput> {
  return predictEfficiencyFlow(input);
}

const prompt = ai.definePrompt({
  name: 'predictEfficiencyPrompt',
  input: { schema: z.object({ weather: z.any() }) },
  output: { schema: PredictEfficiencyOutputSchema },
  tools: [getWeatherForecast],
  prompt: `You are a solar energy analyst. Based on the provided weather forecast, predict the potential solar panel efficiency for the next 24 hours.

Consider factors like cloud cover, precipitation, and temperature. Higher cloud cover and precipitation will decrease efficiency, while extreme high temperatures can also slightly reduce panel performance.

- predictedEfficiency: A numerical percentage from 0 to 100.
- weatherSummary: A brief, human-readable summary of the key weather conditions (e.g., "Partly cloudy with a high of 28°C").
- confidence: Your confidence in this prediction, from 0.0 to 1.0.
- advice: A short piece of actionable advice (e.g., "Expect slightly lower output due to cloud cover." or "Optimal conditions for power generation.").

Weather Data:
{{{json weather}}}
`,
});

const predictEfficiencyFlow = ai.defineFlow(
  {
    name: 'predictEfficiencyFlow',
    inputSchema: PredictEfficiencyInputSchema,
    outputSchema: PredictEfficiencyOutputSchema,
  },
  async (input) => {
    const { output } = await prompt({ weather: input });
    return output!;
  }
);

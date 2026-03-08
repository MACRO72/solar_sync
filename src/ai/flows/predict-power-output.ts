'use server';

/**
 * @fileOverview An AI agent to predict solar panel power output based on weather forecasts using Gemini 2.0 Flash.
 *
 * - predictPowerOutput - A function that takes a location and returns a power output prediction.
 * - PredictPowerOutputInput - The input type for the predictPowerOutput function.
 * - PredictPowerOutputOutput - The return type for the predictPowerOutput function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getWeatherForecast } from '@/ai/tools/get-weather-forecast';

const PredictPowerOutputInputSchema = z.object({
  lat: z.number().describe('The latitude for the forecast.'),
  lng: z.number().describe('The longitude for the forecast.'),
});
export type PredictPowerOutputInput = z.infer<
  typeof PredictPowerOutputInputSchema
>;

const PredictPowerOutputOutputSchema = z.object({
  predictedPowerKWh: z.number().describe('The predicted total solar power output in kilowatt-hours (kWh) for the next 24 hours.'),
  weatherSummary: z.string().describe('A brief summary of the weather conditions used for the prediction.'),
  confidence: z.number().describe('A confidence score (0-1) for the prediction.'),
  advice: z.string().describe('Actionable advice based on the prediction, considering a standard 5kW residential solar panel system.'),
});
export type PredictPowerOutputOutput = z.infer<
  typeof PredictPowerOutputOutputSchema
>;

export async function predictPowerOutput(
  input: PredictPowerOutputInput
): Promise<PredictPowerOutputOutput> {
  return predictPowerOutputFlow(input);
}

const prompt = ai.definePrompt({
  name: 'predictPowerOutputPrompt',
  input: { schema: z.object({ weather: z.any() }) },
  output: { schema: PredictPowerOutputOutputSchema },
  tools: [getWeatherForecast],
  prompt: `You are a solar energy production analyst. Based on the provided weather forecast, predict the total power output in kilowatt-hours (kWh) for the next 24 hours for a standard residential 5kW solar panel system.

Consider factors like cloud cover, precipitation, and temperature. Higher cloud cover and precipitation will decrease power output.

- predictedPowerKWh: A numerical value for the total kWh expected.
- weatherSummary: A brief, human-readable summary of the key weather conditions (e.g., "Partly cloudy with a high of 28°C").
- confidence: Your confidence in this prediction, from 0.0 to 1.0.
- advice: A short piece of actionable advice related to energy usage (e.g., "Good day for high-energy tasks." or "Expect lower generation; consider shifting appliance usage.").

Weather Data:
{{{json weather}}}
`,
});

const predictPowerOutputFlow = ai.defineFlow(
  {
    name: 'predictPowerOutputFlow',
    inputSchema: PredictPowerOutputInputSchema,
    outputSchema: PredictPowerOutputOutputSchema,
  },
  async (input) => {
    const { output } = await prompt({ weather: input });
    return output!;
  }
);

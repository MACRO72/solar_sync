'use server';

/**
 * @fileOverview An AI flow to call an external model for efficiency predictions.
 *
 * - getEfficiencyPrediction - A function that calls the prediction flow.
 * - GetEfficiencyPredictionInput - The input type for the prediction function.
 * - GetEfficiencyPredictionOutput - The return type for the prediction function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GetEfficiencyPredictionInputSchema = z.object({
  temperature: z.number(),
  humidity: z.number(),
  solar_irradiance: z.number(),
  dust_density: z.number(),
});
export type GetEfficiencyPredictionInput = z.infer<typeof GetEfficiencyPredictionInputSchema>;

const GetEfficiencyPredictionOutputSchema = z.object({
  predicted_efficiency: z.number(),
});
export type GetEfficiencyPredictionOutput = z.infer<typeof GetEfficiencyPredictionOutputSchema>;


export async function getEfficiencyPrediction(
  input: GetEfficiencyPredictionInput
): Promise<GetEfficiencyPredictionOutput> {
  return getEfficiencyPredictionFlow(input);
}


const getEfficiencyPredictionFlow = ai.defineFlow(
  {
    name: 'getEfficiencyPredictionFlow',
    inputSchema: GetEfficiencyPredictionInputSchema,
    outputSchema: GetEfficiencyPredictionOutputSchema,
  },
  async (input) => {
    //
    // IMPORTANT: Replace this with the public URL of your deployed Flask/FastAPI model.
    //
    const FLASK_API_ENDPOINT = 'http://127.0.0.1:6000/predict'; // Example: 'https://your-model-api.run.app/predict'

    // Before proceeding, check if the placeholder URL is still being used.
    if (FLASK_API_ENDPOINT.includes('127.0.0.1')) {
        console.warn("Custom model endpoint is set to localhost. This will only work if your Flask server is running on the same machine. For production, deploy your model and use its public URL.");
    }
    
    try {
      const response = await fetch(FLASK_API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // The body should match the format your Flask API expects.
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error(`Model API request failed with status ${response.status}: ${errorBody}`);
        // Return a default/error value to avoid crashing the UI
        return { predicted_efficiency: 0 };
      }

      const modelResult = await response.json();

      // Ensure the key 'predicted_efficiency' matches your Flask API's response.
      return {
        predicted_efficiency: modelResult.predicted_efficiency ?? 0,
      };

    } catch (error: any) {
      console.error("Error calling custom model:", error);
      // In case of a network error or if the Flask server is down
      return { predicted_efficiency: 0 };
    }
  }
);

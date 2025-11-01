'use server';

/**
 * @fileOverview An AI agent to predict solar panel efficiency by calling a custom Flask API.
 *
 * - getEfficiencyPrediction - A function that takes real-time sensor inputs and returns a predicted efficiency score.
 * - GetEfficiencyPredictionInput - The input type for the getEfficiencyPrediction function.
 * - GetEfficiencyPredictionOutput - The return type for the getEfficiencyPrediction function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GetEfficiencyPredictionInputSchema = z.object({
  solar_irradiance: z.number().describe('Solar Irradiance (W/m²)'),
  temperature: z.number().describe('Ambient Temperature (°C)'),
  humidity: z.number().describe('Relative Humidity (%)'),
  dust_density: z.number().describe('Dust Density (μg/m³)'),
});
export type GetEfficiencyPredictionInput = z.infer<
  typeof GetEfficiencyPredictionInputSchema
>;

const GetEfficiencyPredictionOutputSchema = z.object({
  predicted_efficiency: z
    .number()
    .describe('The predicted efficiency score as a percentage.'),
});
export type GetEfficiencyPredictionOutput = z.infer<
  typeof GetEfficiencyPredictionOutputSchema
>;

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
    // INTEGRATION ENDPOINT:
    // This is the URL where your Python Flask server is running.
    //
    const FLASK_API_ENDPOINT = 'http://127.0.0.1:5000/predict'; // <<<<<<< CHANGE THIS

    try {
      const response = await fetch(FLASK_API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // The body is automatically created from the input schema.
        // Ensure your Flask API expects these exact field names.
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(
          `Flask API request failed with status ${response.status}: ${errorBody}`
        );
      }

      const result = await response.json();

      // Ensure the key 'predicted_efficiency' matches what your Flask API returns.
      if (typeof result.predicted_efficiency !== 'number') {
        throw new Error('Invalid response format from Flask API.');
      }
      
      return {
        predicted_efficiency: result.predicted_efficiency,
      };

    } catch (error: any) {
        // If the Flask API is not running or fails, return a mock value for demonstration.
        console.warn(`Could not connect to Flask API at ${FLASK_API_ENDPOINT}. Returning a mock value. Error: ${error.message}`);
        
        // Simple mock calculation: Higher irradiance and lower temp/dust = higher efficiency
        const mockEfficiency = Math.max(0, 
            (input.solar_irradiance / 10) - (input.temperature / 5) - (input.dust_density / 20)
        );

        return {
            predicted_efficiency: Math.min(100, mockEfficiency)
        };
    }
  }
);

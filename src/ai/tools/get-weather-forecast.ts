'use server';
/**
 * @fileOverview A Genkit tool for fetching weather forecast data.
 *
 * - getWeatherForecast - A tool that fetches weather data from the Google Weather API.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const WeatherInputSchema = z.object({
  lat: z.number().describe('The latitude for the forecast.'),
  lng: z.number().describe('The longitude for the forecast.'),
});

export const getWeatherForecast = ai.defineTool(
  {
    name: 'getWeatherForecast',
    description:
      'Fetches the daily weather forecast for a specific latitude and longitude.',
    inputSchema: WeatherInputSchema,
    outputSchema: z.any(),
  },
  async ({ lat, lng }) => {
    const apiKey = process.env.WEATHER_API_KEY;
    if (!apiKey) {
      throw new Error('WEATHER_API_KEY environment variable not set.');
    }

    const url = `https://weather.googleapis.com/v1/forecast?location.latitude=${lat}&location.longitude=${lng}&params=temperature&params=cloudCover&params=precipitation&key=${apiKey}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(
          `Weather API request failed with status ${response.status}: ${errorBody}`
        );
      }

      const data = await response.json();
      return data;
    } catch (e: any) {
      console.error('Failed to fetch weather data:', e);
      return { status: 'error', details: e.message || 'Unknown error' };
    }
  }
);

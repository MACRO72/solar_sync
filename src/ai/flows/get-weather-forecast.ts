'use server';

/**
 * @fileOverview An AI flow to retrieve weather forecast data from OpenWeatherMap.
 *
 * - getWeatherForecast - A function that returns a 5-day weather forecast for a given location.
 * - GetWeatherForecastInput - The input type for the getWeatherForecast function.
 * - GetWeatherForecastOutput - The return type for the getWeatherForecast function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GetWeatherForecastInputSchema = z.object({
  lat: z.number().describe('The latitude for the forecast.'),
  lng: z.number().describe('The longitude for the forecast.'),
});
export type GetWeatherForecastInput = z.infer<
  typeof GetWeatherForecastInputSchema
>;

const DailyForecastSchema = z.object({
  date: z.string().describe("The date of the forecast in 'YYYY-MM-DD' format."),
  temp_min: z.number().describe('The minimum temperature for the day in Celsius.'),
  temp_max: z.number().describe('The maximum temperature for the day in Celsius.'),
  main: z.string().describe('The main weather condition (e.g., "Clouds", "Clear", "Rain").'),
  description: z.string().describe('A more detailed weather description.'),
  icon: z.string().describe('The weather icon code from OpenWeatherMap.'),
});

const GetWeatherForecastOutputSchema = z.object({
  city: z.string().describe('The name of the city for the forecast.'),
  forecast: z.array(DailyForecastSchema).describe('An array of the next 5 days of weather forecast.'),
});
export type GetWeatherForecastOutput = z.infer<
  typeof GetWeatherForecastOutputSchema
>;

export async function getWeatherForecast(
  input: GetWeatherForecastInput
): Promise<GetWeatherForecastOutput> {
  return getWeatherForecastFlow(input);
}

const getWeatherForecastFlow = ai.defineFlow(
  {
    name: 'getWeatherForecastFlow',
    inputSchema: GetWeatherForecastInputSchema,
    outputSchema: GetWeatherForecastOutputSchema,
  },
  async ({ lat, lng }) => {
    const apiKey = process.env.OPENWEATHER_API_KEY;

    if (!apiKey || apiKey === 'YOUR_OPENWEATHER_API_KEY') {
      console.warn('OpenWeatherMap API key not configured. Returning mock data.');
      // Return a predictable mock response for development
      return {
        city: 'Mock City',
        forecast: Array.from({ length: 5 }).map((_, i) => ({
          date: new Date(Date.now() + i * 86400000).toISOString().split('T')[0],
          temp_min: 15 + i,
          temp_max: 25 + i,
          main: 'Clear',
          description: 'clear sky',
          icon: '01d',
        })),
      };
    }
    
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lng}&appid=${apiKey}&units=metric`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch weather data: ${response.statusText}`);
      }
      const data = await response.json();

      // Process the data to get a daily forecast
      const dailyForecasts: { [key: string]: any } = {};

      data.list.forEach((item: any) => {
        const date = item.dt_txt.split(' ')[0];
        if (!dailyForecasts[date]) {
          dailyForecasts[date] = {
            temps: [],
            weather: [],
          };
        }
        dailyForecasts[date].temps.push(item.main.temp);
        dailyForecasts[date].weather.push(item.weather[0]);
      });

      const forecast: GetWeatherForecastOutput['forecast'] = Object.entries(dailyForecasts)
        .slice(0, 5) // Limit to 5 days
        .map(([date, dayData]: [string, any]) => {
          const mainWeather = dayData.weather.reduce(
            (acc: any, curr: any) =>
              (dayData.weather.filter((v: any) => v.main === curr.main).length > acc.count ? { main: curr.main, count: dayData.weather.filter((v: any) => v.main === curr.main).length, icon: curr.icon.replace('n','d') } : acc),
            { main: '', count: 0, icon: '' }
          );

          return {
            date,
            temp_min: Math.min(...dayData.temps),
            temp_max: Math.max(...dayData.temps),
            main: mainWeather.main,
            description: mainWeather.main.toLowerCase(),
            icon: mainWeather.icon,
          };
        });

      return {
        city: data.city.name,
        forecast,
      };

    } catch (error: any) {
        console.error('Error fetching or processing weather data:', error);
        throw new Error('Could not retrieve weather forecast.');
    }
  }
);

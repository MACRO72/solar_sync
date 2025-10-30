'use server';

/**
 * @fileOverview An AI flow to retrieve location data for a device.
 *
 * - getDeviceLocation - A function that returns the location of a given device.
 * - GetDeviceLocationInput - The input type for the getDeviceLocation function.
 * - GetDeviceLocationOutput - The return type for the getDeviceLocation function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { devices } from '@/lib/data';

const GetDeviceLocationInputSchema = z.object({
  deviceId: z.string().describe('The ID of the device to locate.'),
});
export type GetDeviceLocationInput = z.infer<
  typeof GetDeviceLocationInputSchema
>;

const GetDeviceLocationOutputSchema = z.object({
  lat: z.number().describe('The latitude of the device.'),
  lng: z.number().describe('The longitude of the device.'),
  deviceName: z.string().describe('The name of the device.'),
});
export type GetDeviceLocationOutput = z.infer<
  typeof GetDeviceLocationOutputSchema
>;

export async function getDeviceLocation(
  input: GetDeviceLocationInput
): Promise<GetDeviceLocationOutput> {
  return getDeviceLocationFlow(input);
}

const getDeviceLocationFlow = ai.defineFlow(
  {
    name: 'getDeviceLocationFlow',
    inputSchema: GetDeviceLocationInputSchema,
    outputSchema: GetDeviceLocationOutputSchema,
  },
  async ({ deviceId }) => {
    // In a real application, you would fetch this from a database or an external API.
    // For now, we'll use the mock data.
    const device = devices.find(d => d.id === deviceId);

    if (!device) {
      throw new Error(`Device with ID "${deviceId}" not found.`);
    }

    return {
      lat: device.location.lat,
      lng: device.location.lng,
      deviceName: device.name,
    };
  }
);

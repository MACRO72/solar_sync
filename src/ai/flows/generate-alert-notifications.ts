
'use server';

/**
 * @fileOverview AI-powered alert notification generator.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { sendEmail } from '@/ai/tools/send-notification';
import { sendSms } from '@/ai/tools/send-sms';

const GenerateAlertNotificationsInputSchema = z.object({
  eventDescription: z.string().describe('Description of the AI-detected event.'),
  urgencyLevel: z.enum(['high', 'medium', 'low']).describe('Urgency level.'),
  affectedDevice: z.string().optional().describe('Affected device name.'),
  recipientEmail: z.string().optional().describe('User email.'),
  recipientPhone: z.string().optional().describe('User phone number.'),
});
export type GenerateAlertNotificationsInput = z.infer<typeof GenerateAlertNotificationsInputSchema>;

const GenerateAlertNotificationsOutputSchema = z.object({
  title: z.string().describe('Alert title for the dashboard.'),
  message: z.string().describe('Detailed message for the dashboard.'),
  priority: z.enum(['high', 'medium', 'low']).describe('Priority level.'),
  pushTitle: z.string().describe('Short push notification title.'),
  pushBody: z.string().describe('Short push notification body.'),
});
export type GenerateAlertNotificationsOutput = z.infer<typeof GenerateAlertNotificationsOutputSchema>;

const prompt = ai.definePrompt({
  name: 'generateAlertNotificationsPrompt',
  input: {schema: GenerateAlertNotificationsInputSchema},
  output: {schema: GenerateAlertNotificationsOutputSchema},
  tools: [sendEmail, sendSms],
  prompt: `You are an AI assistant for SolarSync, a solar panel monitoring system.
  
  Current System Event: {{{eventDescription}}}
  Urgency Level: {{{urgencyLevel}}}
  Affected Device: {{{affectedDevice}}}
  
  Your goal is to inform the user about this event using the appropriate communication channels.
  
  CRITICAL INSTRUCTIONS:
  1. If urgency is 'high' or 'medium', you MUST call the 'sendEmail' tool.
     - recipientEmail: {{{recipientEmail}}}
     - subject: Critical System Event: {{{affectedDevice}}}
     - message: A system event was detected on {{{affectedDevice}}}. Details: {{{eventDescription}}}
  
  2. If urgency is 'high' and a phone number is provided ({{{recipientPhone}}}), you MUST ALSO call the 'sendSms' tool.
     - phoneNumber: {{{recipientPhone}}}
     - message: SolarSync High Priority Alert: {{{eventDescription}}}
  
  3. You MUST provide the following fields in your output for the UI dashboard:
     - title: A short, descriptive title for the alert.
     - message: A detailed explanation for the dashboard.
     - priority: The priority level ('high', 'medium', or 'low').
     - pushTitle: A very short title for a simulated push notification toast.
     - pushBody: A very short summary for a simulated push notification body.
  `,
});

export async function generateAlertNotifications(input: GenerateAlertNotificationsInput): Promise<GenerateAlertNotificationsOutput> {
  let retries = 0;
  const maxRetries = 2;
  
  while (retries <= maxRetries) {
    try {
      const {output} = await prompt(input);
      return output!;
    } catch (error: any) {
      const isRateLimit = error.message?.includes('429') || error.message?.includes('Quota exceeded');
      if (isRateLimit && retries < maxRetries) {
        retries++;
        await new Promise(r => setTimeout(r, 2000 * retries));
        continue;
      }
      throw error;
    }
  }
  throw new Error('Alert generation failed after retries.');
}

'use server';

/**
 * @fileOverview AI-powered alert notification generator using Gemini 2.0 Flash.
 * This flow analyzes system events and generates multi-channel notifications
 * specifically optimized for mobile popups (Push, SMS, Email).
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { sendEmailInternal } from '@/ai/tools/send-notification';
import { sendSmsInternal } from '@/ai/tools/send-sms';

const GenerateAlertNotificationsInputSchema = z.object({
  eventDescription: z.string().describe('Description of the AI-detected event.'),
  urgencyLevel: z.enum(['high', 'medium', 'low']).describe('Urgency level.'),
  affectedDevice: z.string().optional().describe('Affected device name.'),
  recipientEmail: z.string().optional().describe('User email.'),
  recipientPhone: z.string().optional().describe('User phone number.'),
});
export type GenerateAlertNotificationsInput = z.infer<typeof GenerateAlertNotificationsInputSchema>;

const GenerateAlertNotificationsOutputSchema = z.object({
  title: z.string().describe('Alert title for the dashboard and email subject.'),
  message: z.string().describe('Detailed message for the dashboard and email body.'),
  priority: z.enum(['high', 'medium', 'low']).describe('Priority level.'),
  pushTitle: z.string().describe('Short, punchy title optimized for mobile notification popups (max 30 chars).'),
  pushBody: z.string().describe('Concise summary that fits entirely within a mobile notification preview (max 80 chars).'),
});
export type GenerateAlertNotificationsOutput = z.infer<typeof GenerateAlertNotificationsOutputSchema>;

const prompt = ai.definePrompt({
  name: 'generateAlertNotificationsPrompt',
  input: {schema: GenerateAlertNotificationsInputSchema},
  output: {schema: GenerateAlertNotificationsOutputSchema},
  prompt: `You are an AI assistant for SolarSync, a solar panel monitoring system.
  
  Current System Event: {{{eventDescription}}}
  Urgency Level: {{{urgencyLevel}}}
  Affected Device: {{{affectedDevice}}}
  
  Your goal is to inform the user about this event clearly and professionally.
  
  CRITICAL INSTRUCTIONS FOR MOBILE POPUPS:
  1. The "pushTitle" and "pushBody" are for mobile lock-screen notifications. They must be extremely concise so the user can understand the situation without opening the app.
  2. "pushTitle" should be short (e.g., "SolarSync Alert: Overheat").
  3. "pushBody" should be the most critical info (e.g., "Panel #4 reached 65°C. Cooling system engaged.").
  4. The "title" and "message" are for the dashboard and email where you have more space.
  
  OUTPUT REQUIREMENTS:
  - title: Professional subject line.
  - message: Detailed explanation with context.
  - priority: high, medium, or low.
  - pushTitle: Short mobile popup title (max 30 chars).
  - pushBody: Short mobile popup body (max 80 chars).
  `,
});

export async function generateAlertNotifications(input: GenerateAlertNotificationsInput): Promise<GenerateAlertNotificationsOutput> {
  let retries = 0;
  const maxRetries = 2;
  
  while (retries <= maxRetries) {
    try {
      const {output} = await prompt(input);
      if (!output) throw new Error('AI output was empty');

      // Execute the notifications based on the urgency
      if (input.urgencyLevel !== 'low' && input.recipientEmail) {
        await sendEmailInternal({
          subject: output.title,
          message: output.message,
          recipientEmail: input.recipientEmail,
        });
      }
      
      if (input.urgencyLevel !== 'low' && input.recipientPhone) {
        // SMS/Push content (Gemini generated content optimized for small screens)
        await sendSmsInternal({
          phoneNumber: input.recipientPhone,
          message: `SolarSync: ${output.pushBody}`,
        });
      }

      return output;
    } catch (error: any) {
      console.error('Alert Generation Error:', error);
      const isRateLimit = error.message?.includes('429') || error.message?.includes('Quota exceeded');
      if (isRateLimit && retries < maxRetries) {
        retries++;
        await new Promise(r => setTimeout(r, 2000 * (retries + 1)));
        continue;
      }
      throw error;
    }
  }
  throw new Error('Alert generation failed after multiple retries.');
}

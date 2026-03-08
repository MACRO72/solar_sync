'use server';

/**
 * @fileOverview AI-powered alert notification generator using Gemini.
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
  title: z.string().describe('Short, punchy alert title for email subjects (max 40 chars).'),
  message: z.string().describe('Detailed message for the dashboard and email body.'),
  priority: z.enum(['high', 'medium', 'low']).describe('Priority level.'),
  pushTitle: z.string().describe('Short title optimized for mobile notification popups (max 25 chars).'),
  pushBody: z.string().describe('Concise summary that fits entirely within a mobile notification preview (max 60 chars).'),
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
  
  Your goal is to inform the user about this event clearly.
  
  CRITICAL INSTRUCTIONS FOR MOBILE POPUPS:
  1. The "pushTitle" and "pushBody" are for mobile lock-screen notifications. They must be extremely short.
  2. "title" will be used as the Email Subject. Mobile email notifications only show the first few words of the subject. Make it punchy (e.g., "SolarSync: Critical Error").
  3. "pushTitle" (e.g., "SolarSync Alert").
  4. "pushBody" should be the most critical info (e.g., "Panel #4 Overheat: 65°C").
  
  OUTPUT REQUIREMENTS:
  - title: Professional subject line (Max 40 chars).
  - message: Detailed explanation.
  - priority: high, medium, or low.
  - pushTitle: Short mobile popup title (Max 25 chars).
  - pushBody: Short mobile popup body (Max 60 chars).
  `,
});

export async function generateAlertNotifications(input: GenerateAlertNotificationsInput): Promise<GenerateAlertNotificationsOutput> {
  let retries = 0;
  const maxRetries = 2;
  
  while (retries <= maxRetries) {
    try {
      const {output} = await prompt(input);
      if (!output) throw new Error('AI output was empty');

      // Parallel execution for notifications
      const notificationPromises = [];

      if (input.recipientEmail) {
        notificationPromises.push(
          sendEmailInternal({
            subject: output.title,
            message: output.message,
            recipientEmail: input.recipientEmail,
          })
        );
      }
      
      if (input.recipientPhone) {
        notificationPromises.push(
          sendSmsInternal({
            phoneNumber: input.recipientPhone,
            message: `SolarSync: ${output.pushBody}`,
          })
        );
      }

      // We await the notifications but don't block the AI response if they fail internally (they catch their own errors)
      await Promise.allSettled(notificationPromises);

      return output;
    } catch (error: any) {
      console.error('Alert Generation Flow Error:', error.message);
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

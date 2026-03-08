'use server';

/**
 * @fileOverview AI-powered alert notification generator.
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
  title: z.string().describe('Alert title for the dashboard.'),
  message: z.string().describe('Detailed message for the dashboard.'),
  priority: z.enum(['high', 'medium', 'low']).describe('Priority level.'),
  pushTitle: z.string().describe('Short push notification title.'),
  pushBody: z.string().describe('Short push notification body.'),
});
export type GenerateAlertNotificationsOutput = z.infer<typeof GenerateAlertNotificationsOutputSchema>;

const prompt = ai.definePrompt({
  name: 'generateAlertNotificationsPrompt',
  model: 'googleai/gemini-1.5-flash-latest',
  input: {schema: GenerateAlertNotificationsInputSchema},
  output: {schema: GenerateAlertNotificationsOutputSchema},
  prompt: `You are an AI assistant for SolarSync, a solar panel monitoring system.
  
  Current System Event: {{{eventDescription}}}
  Urgency Level: {{{urgencyLevel}}}
  Affected Device: {{{affectedDevice}}}
  
  Your goal is to inform the user about this event clearly and professionally.
  
  INSTRUCTIONS:
  1. Based on the event, generate a concise title and a detailed message for the user dashboard.
  2. If urgency is 'high' or 'medium' and recipient details are available, you will trigger notifications via the internal logic.
  
  3. You MUST provide the following fields in your output:
     - title: A short, descriptive title (e.g., "Critical Overheat Detected").
     - message: A detailed explanation including potential causes and recommended steps.
     - priority: The priority level ('high', 'medium', or 'low').
     - pushTitle: A very short title for a mobile push notification (max 30 chars).
     - pushBody: A very short summary for a mobile push notification (max 60 chars).
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
      
      if (input.urgencyLevel === 'high' && input.recipientPhone) {
        await sendSmsInternal({
          phoneNumber: input.recipientPhone,
          message: `SolarSync ALERT: ${output.pushBody}`,
        });
      }

      return output;
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
  throw new Error('Alert generation failed after multiple retries.');
}

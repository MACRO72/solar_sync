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
  title: z.string().describe('Alert title.'),
  message: z.string().describe('Detailed message.'),
  priority: z.enum(['high', 'medium', 'low']).describe('Priority level.'),
  pushTitle: z.string().describe('Short push notification title.'),
  pushBody: z.string().describe('Short push notification body.'),
});
export type GenerateAlertNotificationsOutput = z.infer<typeof GenerateAlertNotificationsOutputSchema>;

export async function generateAlertNotifications(input: GenerateAlertNotificationsInput): Promise<GenerateAlertNotificationsOutput> {
  return generateAlertNotificationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateAlertNotificationsPrompt',
  input: {schema: GenerateAlertNotificationsInputSchema},
  output: {schema: GenerateAlertNotificationsOutputSchema},
  tools: [sendEmail, sendSms],
  prompt: `You are an AI assistant for SolarSync.
  
  Event: {{{eventDescription}}}
  Urgency: {{{urgencyLevel}}}
  Device: {{{affectedDevice}}}
  
  CRITICAL:
  - If urgency is 'high' or 'medium', use 'sendEmail' to alert {{{recipientEmail}}}.
  - If urgency is 'high' and {{{recipientPhone}}} is provided, you MUST ALSO use 'sendSms'.
  - Provide content for a simulated Firebase Push Notification in 'pushTitle' and 'pushBody'.
  `,
});

const generateAlertNotificationsFlow = ai.defineFlow(
  {
    name: 'generateAlertNotificationsFlow',
    inputSchema: GenerateAlertNotificationsInputSchema,
    outputSchema: GenerateAlertNotificationsOutputSchema,
  },
  async input => {
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
          await new Promise(r => setTimeout(r, 2000));
          continue;
        }
        throw error;
      }
    }
    throw new Error('AI processing failed.');
  }
);

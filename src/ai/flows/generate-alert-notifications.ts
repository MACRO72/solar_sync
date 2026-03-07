'use server';

/**
 * @fileOverview AI-powered alert notification generator.
 *
 * - generateAlertNotifications - A function that generates alert notifications based on AI-detected events.
 * - GenerateAlertNotificationsInput - The input type for the generateAlertNotifications function.
 * - GenerateAlertNotificationsOutput - The return type for the generateAlertNotifications function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { sendEmail } from '@/ai/tools/send-notification';

const GenerateAlertNotificationsInputSchema = z.object({
  eventDescription: z
    .string()
    .describe('Description of the AI-detected event or maintenance reminder.'),
  urgencyLevel: z
    .enum(['high', 'medium', 'low'])
    .describe('Urgency level of the alert.'),
  affectedDevice: z
    .string()
    .optional()
    .describe('The name of the affected device, if applicable.'),
  recipientEmail: z.string().optional().describe('The email address to send the notification to.'),
});
export type GenerateAlertNotificationsInput = z.infer<
  typeof GenerateAlertNotificationsInputSchema
>;

const GenerateAlertNotificationsOutputSchema = z.object({
  title: z.string().describe('Title of the alert notification for dashboard display.'),
  message: z.string().describe('Detailed message of the alert notification for dashboard display.'),
  priority: z
    .enum(['high', 'medium', 'low'])
    .describe('The priority level of the alert.'),
  pushTitle: z.string().describe('A very short, concise title for a push notification (max 50 chars).'),
  pushBody: z.string().describe('A short, concise body for a push notification (max 150 chars).'),
});
export type GenerateAlertNotificationsOutput = z.infer<
  typeof GenerateAlertNotificationsOutputSchema
>;

export async function generateAlertNotifications(
  input: GenerateAlertNotificationsInput
): Promise<GenerateAlertNotificationsOutput> {
  return generateAlertNotificationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateAlertNotificationsPrompt',
  input: {schema: GenerateAlertNotificationsInputSchema},
  output: {schema: GenerateAlertNotificationsOutputSchema},
  tools: [sendEmail],
  prompt: `You are an AI assistant for a solar power system.

  Based on the event description, urgency level, and affected device, you will generate a notification.

  Event Description: {{{eventDescription}}}
  Urgency Level: {{{urgencyLevel}}}
  Affected Device: {{{affectedDevice}}}

  CRITICAL ACTIONS:
  - If urgency is 'high' or 'medium', you MUST use the 'sendEmail' tool to alert the user at {{{recipientEmail}}}.
  - NEVER use an SMS tool. Only use 'sendEmail'.
  - For 'low' urgency, just generate the notification content.

  Ensure the email message is clear and concise.
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
        const isNotFound = error.message?.includes('404');

        if (isRateLimit && retries < maxRetries) {
          retries++;
          await new Promise(resolve => setTimeout(resolve, 3000));
          continue;
        }
        
        // Log details if it's a 404 to help debugging, but don't retry 404s
        if (isNotFound) {
          console.error("AI Model Not Found (404). Please ensure the model identifier in genkit.ts is correct for your region.");
        }
        
        throw error;
      }
    }
    throw new Error('AI processing failed after retries.');
  }
);

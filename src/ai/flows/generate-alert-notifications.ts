
'use server';

/**
 * @fileOverview AI-powered alert notification generator.
 *
 * - generateAlertNotifications - A function that generates alert notifications based on AI-detected events and maintenance reminders.
 * - GenerateAlertNotificationsInput - The input type for the generateAlertNotifications function.
 * - GenerateAlertNotificationsOutput - The return type for the generateAlertNotifications function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { sendEmail } from '@/ai/tools/send-notification';
import { sendSms } from '@/ai/tools/send-sms';

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
  recipientEmail: z.string().optional().describe('An optional email address to send the notification to.'),
  recipientPhone: z.string().optional().describe('An optional phone number to send an SMS alert to.')
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
  tools: [sendEmail, sendSms],
  prompt: `You are an AI assistant that generates alert notifications for a solar power system.

  Based on the event description, urgency level, and affected device, you will generate two things:
  1. A standard alert notification with a 'title' and a detailed 'message' for display within a dashboard UI.
  2. A push notification with a very concise 'pushTitle' and 'pushBody'.

  Event Description: {{{eventDescription}}}
  Urgency Level: {{{urgencyLevel}}}
  Affected Device: {{{affectedDevice}}}

  CRITICAL ACTIONS:
  - If urgency is 'high' or 'medium', use 'sendEmail' to alert the administrator (using 'recipientEmail' if provided).
  - If urgency is 'high' AND a 'recipientPhone' is provided, use 'sendSms' to send a brief summary of the alert to the user's phone.
  - For 'low' urgency, just generate the notification content for the UI.
  `,
});

const generateAlertNotificationsFlow = ai.defineFlow(
  {
    name: 'generateAlertNotificationsFlow',
    inputSchema: GenerateAlertNotificationsInputSchema,
    outputSchema: GenerateAlertNotificationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

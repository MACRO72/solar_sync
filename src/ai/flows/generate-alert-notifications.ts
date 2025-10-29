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
});
export type GenerateAlertNotificationsInput = z.infer<
  typeof GenerateAlertNotificationsInputSchema
>;

const GenerateAlertNotificationsOutputSchema = z.object({
  title: z.string().describe('Title of the alert notification.'),
  message: z.string().describe('Detailed message of the alert notification.'),
  priority: z
    .enum(['high', 'medium', 'low'])
    .describe('The priority level of the alert.'),
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
  prompt: `You are an AI assistant that generates alert notifications for a solar power system.

  Based on the event description, urgency level, and affected device (if applicable), create a concise and informative alert notification.

  Event Description: {{{eventDescription}}}
  Urgency Level: {{{urgencyLevel}}}
  Affected Device: {{{affectedDevice}}}

  The alert notification should include a title, a detailed message, and a priority level (high, medium, or low).
  The priority level should align with the urgency level.

  Title:
  Message:
  Priority:`,
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

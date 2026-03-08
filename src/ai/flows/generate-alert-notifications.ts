'use server';

/**
 * @fileOverview Alert notification system.
 * Sends a static "alert message test via email" as requested to bypass AI generation errors
 * and ensure visibility in mobile popup windows.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { sendEmailInternal } from '@/ai/tools/send-notification';
import { sendSmsInternal } from '@/ai/tools/send-sms';

const GenerateAlertNotificationsInputSchema = z.object({
  eventDescription: z.string().describe('Description of the event.'),
  urgencyLevel: z.enum(['high', 'medium', 'low']).describe('Urgency level.'),
  affectedDevice: z.string().optional().describe('Affected device name.'),
  recipientEmail: z.string().optional().describe('User email.'),
  recipientPhone: z.string().optional().describe('User phone number.'),
});
export type GenerateAlertNotificationsInput = z.infer<typeof GenerateAlertNotificationsInputSchema>;

const GenerateAlertNotificationsOutputSchema = z.object({
  title: z.string().describe('Short, punchy alert title for email subjects.'),
  message: z.string().describe('Detailed message.'),
  priority: z.enum(['high', 'medium', 'low']).describe('Priority level.'),
  pushTitle: z.string().describe('Mobile notification title.'),
  pushBody: z.string().describe('Mobile notification body.'),
});
export type GenerateAlertNotificationsOutput = z.infer<typeof GenerateAlertNotificationsOutputSchema>;

/**
 * Standardizes the alert to the user's requested static message.
 * This ensures the message appears clearly in mobile popups.
 */
export async function generateAlertNotifications(input: GenerateAlertNotificationsInput): Promise<GenerateAlertNotificationsOutput> {
  const staticOutput: GenerateAlertNotificationsOutput = {
    // title is used as the Email Subject, which appears in mobile popups
    title: 'alert message test via email',
    message: 'alert message test via email',
    priority: input.urgencyLevel,
    pushTitle: 'SolarSync Alert',
    // pushBody is used for FCM/Push, which appears in mobile popups
    pushBody: 'alert message test via email',
  };

  try {
    const notificationPromises = [];

    if (input.recipientEmail) {
      notificationPromises.push(
        sendEmailInternal({
          subject: staticOutput.title,
          message: staticOutput.message,
          recipientEmail: input.recipientEmail,
        })
      );
    }
    
    if (input.recipientPhone) {
      notificationPromises.push(
        sendSmsInternal({
          phoneNumber: input.recipientPhone,
          message: `SolarSync: ${staticOutput.pushBody}`,
        })
      );
    }

    // Parallel execution for notifications
    await Promise.allSettled(notificationPromises);

    return staticOutput;
  } catch (error: any) {
    console.error('Alert Notification Flow Error:', error.message);
    throw error;
  }
}

// Register as a flow for compatibility with the AI dev environment and internal hooks
export const generateAlertNotificationsFlow = ai.defineFlow(
  {
    name: 'generateAlertNotificationsFlow',
    inputSchema: GenerateAlertNotificationsInputSchema,
    outputSchema: GenerateAlertNotificationsOutputSchema,
  },
  async (input) => generateAlertNotifications(input)
);

'use server';

/**
 * @fileOverview Formal Alert notification system.
 * Sends a structured, formal notification containing the static string:
 * "alert message test via email" as requested by the user.
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
  title: z.string().describe('Formal email subject.'),
  message: z.string().describe('Detailed formal message.'),
  priority: z.enum(['high', 'medium', 'low']).describe('Priority level.'),
  pushTitle: z.string().describe('Mobile notification title.'),
  pushBody: z.string().describe('Mobile notification body.'),
});
export type GenerateAlertNotificationsOutput = z.infer<typeof GenerateAlertNotificationsOutputSchema>;

/**
 * Constructs a formal notification containing the required test string.
 */
export async function generateAlertNotifications(input: GenerateAlertNotificationsInput): Promise<GenerateAlertNotificationsOutput> {
  const testString = 'alert message test via email';
  
  const staticOutput: GenerateAlertNotificationsOutput = {
    // Subject line for email - appears in mobile popups
    title: `SolarSync Official Alert: ${testString}`,
    // Formal body text
    message: `Dear User,\n\nThis is a formal notification from the SolarSync Monitoring System regarding your solar installation.\n\nStatus Update: ${testString}\nPriority Level: ${input.urgencyLevel.toUpperCase()}\nAffected Unit: ${input.affectedDevice || 'System Cluster'}\n\nPlease log in to your dashboard to review the full diagnostic data.\n\nBest Regards,\nSolarSync System Management`,
    priority: input.urgencyLevel,
    pushTitle: 'SolarSync System Alert',
    // Push body - appears in mobile popups
    pushBody: testString,
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
          message: `SolarSync Formal Alert: ${testString}`,
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

// Register as a flow
export const generateAlertNotificationsFlow = ai.defineFlow(
  {
    name: 'generateAlertNotificationsFlow',
    inputSchema: GenerateAlertNotificationsInputSchema,
    outputSchema: GenerateAlertNotificationsOutputSchema,
  },
  async (input) => generateAlertNotifications(input)
);

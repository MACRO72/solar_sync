'use server';

import {z} from 'zod';
import { sendEmailInternal } from '@/ai/tools/send-notification';
import { sendSmsInternal } from '@/ai/tools/send-sms';
import { callGeminiWithFallback } from '@/ai/gemini-handler';

// --- Types & Schemas ---

const GenerateAlertNotificationsInputSchema = z.object({
  eventDescription: z.string().describe('Base issue detected (e.g. "High dust accumulation").'),
  urgencyLevel: z.enum(['high', 'medium', 'low']).describe('Urgency level.'),
  affectedDevice: z.string().optional().describe('Affected device name.'),
  recipientEmail: z.string().optional().describe('User email.'),
  recipientPhone: z.string().optional().describe('User phone number.'),
  // Added telemetry for rule engine
  telemetry: z.object({
    dustLevel: z.number().optional(),
    tiltAngle: z.number().optional(),
    efficiency: z.number().optional(),
    temperature: z.number().optional(),
  }).optional(),
});
export type GenerateAlertNotificationsInput = z.infer<typeof GenerateAlertNotificationsInputSchema>;

const GenerateAlertNotificationsOutputSchema = z.object({
  title: z.string(),
  message: z.string(),
  priority: z.enum(['high', 'medium', 'low']),
  pushTitle: z.string(),
  pushBody: z.string(),
});
export type GenerateAlertNotificationsOutput = z.infer<typeof GenerateAlertNotificationsOutputSchema>;

// --- Module-level Cache & Rate Limiting ---

let lastGeminiCallTimestamp = 0;
let lastAlertIssue = "";
const AI_COOLDOWN_MS = 10 * 60 * 1000; // 10 minutes

/**
 * Generates an optimized alert using rule-based logic first, then optional Gemini enhancement.
 */
export async function generateAlertNotifications(input: GenerateAlertNotificationsInput): Promise<GenerateAlertNotificationsOutput> {
  let issue = input.eventDescription;
  const urgency = input.urgencyLevel;
  
  // 1. PRIMARY ALERT ENGINE (Rule-Based)
  if (input.telemetry) {
    const { dustLevel, tiltAngle, efficiency, temperature } = input.telemetry;
    if (dustLevel && dustLevel > 70) issue = "High dust accumulation";
    else if (tiltAngle && Math.abs(tiltAngle - 30) > 10) issue = "Panel misalignment detected";
    else if (efficiency && efficiency < 85) issue = "Efficiency drop detected";
    else if (temperature && temperature > 60) issue = "Critical panel overheat";
  }

  const baseMessage = `ALERT: ${issue}. Immediate inspection recommended.`;
  const baseTitle = `SolarSync Alert: ${issue}`;

  // Default Rule-Based Output
  let output: GenerateAlertNotificationsOutput = {
    title: baseTitle,
    message: baseMessage,
    priority: urgency,
    pushTitle: "Security Alert",
    pushBody: issue,
  };

  console.log("Rule-based alert generated:", issue);

  // 2 & 3 & 4. CONDITIONAL GEMINI ENHANCEMENT
  const now = Date.now();
  const shouldTryAI = 
    urgency === 'medium' &&                       // Rule 6: MEDIUM -> try Gemini
    (now - lastGeminiCallTimestamp > AI_COOLDOWN_MS) && // Rule 3: Max 1 per 10 mins
    issue !== lastAlertIssue;                     // Rule 4: Skip if repeating

  if (shouldTryAI) {
    try {
      const promptText = `Rewrite this alert professionally: "${baseMessage}" for a Solar Panel monitoring system. Return only a JSON object with: title, message, priority, pushTitle, pushBody.`;
      
      const aiResult = await callGeminiWithFallback(promptText);
      
      if (aiResult && typeof aiResult === 'object') {
        output = { ...output, ...aiResult };
        lastGeminiCallTimestamp = now;
        lastAlertIssue = issue;
        console.log("Gemini used for enhancement");
      }
    } catch (e) {
      console.warn("Gemini skipped (error/quota). Falling back to rule-based.");
    }
  } else {
      if (urgency === 'medium') {
          console.log("Gemini skipped (cooldown or redundant issue)");
      }
  }

  // 5. CRITICAL FALLBACK -> 'output' is already rule-based if AI fails

  // 7. PERFORM NOTIFICATIONS
  try {
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
    
    if (input.recipientPhone && output.priority === 'high') {
      notificationPromises.push(
        sendSmsInternal({
          phoneNumber: input.recipientPhone,
          message: `SolarSync ${output.priority.toUpperCase()}: ${output.pushBody}`,
        })
      );
    }
    await Promise.allSettled(notificationPromises);
  } catch (error) {
    console.error('Notification Delivery Error:', error);
  }

  return output;
}

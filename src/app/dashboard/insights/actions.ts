
'use server';

import { generateMaintenanceSchedule, type GenerateMaintenanceScheduleOutput } from "@/ai/flows/generate-maintenance-schedule";
import { sendEmailInternal } from "@/ai/tools/send-notification";
import { sendSmsInternal } from "@/ai/tools/send-sms";
import { z } from "zod";

// --- Maintenance Suggestion ---
const MaintenanceSchema = z.object({
  historicalData: z.string().min(10),
  sensorReadings: z.string().min(10),
  systemDescription: z.string().min(10),
});

type MaintenanceFormState = {
  errors: Record<string, string[]>;
  data: GenerateMaintenanceScheduleOutput | null;
}

export async function getMaintenanceSuggestion(prevState: MaintenanceFormState, formData: FormData) : Promise<MaintenanceFormState> {
  const validated = MaintenanceSchema.safeParse({ 
    historicalData: formData.get('historicalData'), 
    sensorReadings: formData.get('sensorReadings'), 
    systemDescription: formData.get('systemDescription') 
  });
  
  if (!validated.success) return { errors: validated.error.flatten().fieldErrors as any, data: null };
  
  try {
    const res = await generateMaintenanceSchedule(validated.data as any);
    return { errors: {}, data: res };
  } catch (e) {
    return { errors: { _form: ['Failed to generate insights.'] }, data: null };
  }
}

/**
 * Sends a literal "Test Alert" to the user's registered channels.
 */
export async function triggerTestAlert(email: string, phone?: string) {
  try {
    // Send literal "Test Alert" via Email
    await sendEmailInternal({
      subject: 'Test Alert',
      message: 'This is a literal Test Alert from your SolarSync dashboard.',
      recipientEmail: email,
    });
    
    // Send literal "Test Alert" via SMS if phone exists
    if (phone) {
      await sendSmsInternal({
        phoneNumber: phone,
        message: 'SolarSync: Test Alert',
      });
    }

    return { status: 'success' as const };
  } catch (error: any) {
    console.error('Literal Test Alert failed:', error);
    return { status: 'error' as const, details: error.message };
  }
}

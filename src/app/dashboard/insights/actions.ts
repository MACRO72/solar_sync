'use server';

import { generateMaintenanceSchedule, type GenerateMaintenanceScheduleInput, type GenerateMaintenanceScheduleOutput } from "@/ai/flows/generate-maintenance-schedule";
import { summarizePerformanceAnomalies, type SummarizePerformanceAnomaliesInput, type SummarizePerformanceAnomaliesOutput } from "@/ai/flows/summarize-performance-anomalies";
import { analyzeCsvData, type AnalyzeCsvDataInput, type AnalyzeCsvDataOutput } from "@/ai/flows/analyze-csv-data";
import { predictEfficiency, type PredictEfficiencyInput, type PredictEfficiencyOutput } from "@/ai/flows/predict-efficiency";
import { predictPowerOutput, type PredictPowerOutputInput, type PredictPowerOutputOutput } from "@/ai/flows/predict-power-output";
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
  const validated = MaintenanceSchema.safeParse({ historicalData: formData.get('historicalData'), sensorReadings: formData.get('sensorReadings'), systemDescription: formData.get('systemDescription') });
  if (!validated.success) return { errors: validated.error.flatten().fieldErrors as any, data: null };
  try {
    const res = await generateMaintenanceSchedule(validated.data as any);
    return { errors: {}, data: res };
  } catch (e) {
    return { errors: { _form: ['Failed to generate insights.'] }, data: null };
  }
}

// --- Raw Alert Trigger ---
export async function triggerTestAlert(email: string, phone?: string) {
  try {
    await sendEmailInternal({
      subject: 'Test Alert',
      message: 'This is a literal "Test Alert" sent from your SolarSync dashboard.',
      recipientEmail: email,
    });
    
    if (phone) {
      await sendSmsInternal({
        phoneNumber: phone,
        message: 'SolarSync: Test Alert. Your SMS configuration is active.',
      });
    }

    return { status: 'success' as const };
  } catch (error: any) {
    console.error('Failed to trigger test alert:', error);
    return { status: 'error' as const, details: error.message };
  }
}

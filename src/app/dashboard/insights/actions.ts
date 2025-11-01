'use server';

import { generateMaintenanceSchedule, type GenerateMaintenanceScheduleInput, type GenerateMaintenanceScheduleOutput } from "@/ai/flows/generate-maintenance-schedule";
import { summarizePerformanceAnomalies, type SummarizePerformanceAnomaliesInput, type SummarizePerformanceAnomaliesOutput } from "@/ai/flows/summarize-performance-anomalies";
import { z } from "zod";

// --- Maintenance Suggestion ---
const MaintenanceSchema = z.object({
  historicalData: z.string().min(10, { message: "Please provide more detailed historical data." }),
  sensorReadings: z.string().min(10, { message: "Please provide more detailed sensor readings." }),
  systemDescription: z.string().min(10, { message: "Please provide a more detailed system description." }),
});

type MaintenanceFormState = {
  errors: {
    historicalData?: string[];
    sensorReadings?: string[];
    systemDescription?: string[];
    _form?: string[];
  };
  data: GenerateMaintenanceScheduleOutput | null;
}

export async function getMaintenanceSuggestion(prevState: MaintenanceFormState, formData: FormData) : Promise<MaintenanceFormState> {
  const validatedFields = MaintenanceSchema.safeParse({
    historicalData: formData.get('historicalData'),
    sensorReadings: formData.get('sensorReadings'),
    systemDescription: formData.get('systemDescription'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      data: null,
    };
  }

  try {
    const result = await generateMaintenanceSchedule(validatedFields.data as GenerateMaintenanceScheduleInput);
    return {
      errors: {},
      data: result,
    };
  } catch (error) {
    return {
      errors: { _form: ['Failed to generate insights. Please try again later.'] },
      data: null,
    };
  }
}


// --- Anomaly Summarizer ---
const AnomalySchema = z.object({
  anomalyData: z.string().min(10, { message: "Please provide a more detailed anomaly description." }),
});

type AnomalyFormState = {
  errors: {
    anomalyData?: string[];
    _form?: string[];
  };
  data: SummarizePerformanceAnomaliesOutput | null;
};

export async function getAnomalySummary(prevState: AnomalyFormState, formData: FormData): Promise<AnomalyFormState> {
  const validatedFields = AnomalySchema.safeParse({
    anomalyData: formData.get('anomalyData'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      data: null,
    };
  }

  try {
    const result = await summarizePerformanceAnomalies(validatedFields.data as SummarizePerformanceAnomaliesInput);
    return {
      errors: {},
      data: result,
    };
  } catch (error) {
    console.error(error);
    return {
      errors: { _form: ['Failed to get summary. Please try again.'] },
      data: null,
    };
  }
}

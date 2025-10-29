'use server';

import { generateMaintenanceSchedule, type GenerateMaintenanceScheduleInput, type GenerateMaintenanceScheduleOutput } from "@/ai/flows/generate-maintenance-schedule";
import { z } from "zod";

const MaintenanceSchema = z.object({
  historicalData: z.string().min(10, { message: "Please provide more detailed historical data." }),
  sensorReadings: z.string().min(10, { message: "Please provide more detailed sensor readings." }),
  systemDescription: z.string().min(10, { message: "Please provide a more detailed system description." }),
});

type FormState = {
  errors: {
    historicalData?: string[];
    sensorReadings?: string[];
    systemDescription?: string[];
    _form?: string[];
  };
  data: GenerateMaintenanceScheduleOutput | null;
}

export async function getMaintenanceSuggestion(prevState: FormState, formData: FormData) : Promise<FormState> {
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

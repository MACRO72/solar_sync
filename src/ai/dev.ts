'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/generate-maintenance-schedule.ts';
import '@/ai/flows/summarize-performance-anomalies.ts';
import '@/ai/flows/generate-alert-notifications.ts';
import '@/ai/flows/get-device-location.ts';
import '@/ai/flows/analyze-csv-data.ts';
import '@/ai/tools/send-notification.ts';
import '@/ai/tools/send-sms.ts';
import '@/ai/tools/get-weather-forecast.ts';
import '@/ai/flows/predict-efficiency.ts';
import '@/ai/flows/predict-power-output.ts';

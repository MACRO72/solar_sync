'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/generate-maintenance-schedule.ts';
import '@/ai/flows/summarize-performance-anomalies.ts';
import '@/ai/flows/generate-alert-notifications.ts';
import '@/ai/flows/get-device-location.ts';
import '@/ai/flows/analyze-csv-data.ts';
import '@/ai/flows/get-efficiency-prediction.ts';

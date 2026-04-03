'use server';
import { config } from 'dotenv';
config();
import { callGeminiWithFallback } from '@/ai/gemini-handler';

/**
 * Simple test script to verify Gemini API integration using direct fetch.
 */
async function testGemini() {
  console.log("--- STARTING GEMINI TEST CALL (DIRECT FETCH) ---");
  
  try {
    const promptText = `
      You are a solar energy analyst. Generate a brief (1 sentence) summary of system health 
      based on 5.5kW power generation and 25°C temperature. 
      Output as JSON: {"analysis": "..."}
    `;

    // The new callGeminiWithFallback takes the prompt text directly
    const output = await callGeminiWithFallback(promptText);

    console.log("--- TEST SUCCESSFUL ---");
    console.log("Generated Output:", JSON.stringify(output, null, 2));
  } catch (error: any) {
    console.error("--- TEST FAILED ---");
    console.error("Error Detail:", error.message);
  }
}

// Execute if run via CLI
if (require.main === module) {
  testGemini();
}

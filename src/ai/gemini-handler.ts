/**
 * Robust handler for Gemini API calls using direct REST (fetch).
 * Bypasses Genkit/SDK abstractions for maximum control and compatibility with v1beta.
 */
export async function callGeminiWithFallback(

  promptText: string,
  primaryModel: string = 'gemini-2.0-flash',
  fallbackModel: string = 'gemini-2.0-flash-lite'
): Promise<any> {
  const apiKey = process.env.GEMINI_API_KEY;

  async function makeRequest(model: string, text: string): Promise<any> {
    console.log("Using model:", model);
    
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text }] }]
          })
        }
      );

      const data = await response.json();

      if (response.status === 429) {
        throw new Error("QUOTA_EXCEEDED");
      }

      if (!response.ok) {
        throw new Error(`Gemini API Error: ${response.status} ${JSON.stringify(data)}`);
      }

      if (!data.candidates || data.candidates.length === 0) {
        throw new Error("Gemini Error: No candidates returned.");
      }

      const outputText = data.candidates[0].content.parts[0].text;
      
      try {
          const cleanJson = outputText.replace(/```json\n?|```/g, '').trim();
          return JSON.parse(cleanJson);
      } catch (e) {
          return outputText;
      }
    } catch (error: any) {
      if (error.message === "QUOTA_EXCEEDED") {
        throw error;
      }
      console.error(`Gemini request failed: ${error.message}`);
      return null;
    }
  }

  try {
    const result = await makeRequest(primaryModel, promptText);
    if (result) return result;
    throw new Error("PRIMARY_FAILED");
  } catch (error: any) {
    console.warn(`Primary model failed or quota exceeded. Switching to fallback: ${fallbackModel}`);
    
    try {
      const fallbackResult = await makeRequest(fallbackModel, promptText);
      if (fallbackResult) return fallbackResult;
    } catch (fallbackError: any) {
      console.error("Fallback model also failed or quota exceeded.");
    }
  }

  // Use rule-based alert (fallback message) if both models fail
  console.warn("Returning rule-based alert due to API failures.");
  return {
    title: "SolarSync Intelligence Alert",
    message: "Live AI analysis is temporarily restricted due to higher-than-expected demand. Our rule-based monitoring engine is currently protecting your system.",
    priority: "medium",
    pushTitle: "System Security Alert",
    pushBody: "AI system fallback activated: monitoring active."
  };
}



import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

export const ai = genkit({
  plugins: [googleAI({ apiKey: "AIzaSyAdvICkOaL91i7bj3P-p1fFGbLJvXM73uI" })],
  model: 'googleai/gemini-1.5-flash-latest',
});

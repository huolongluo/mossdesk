import { GoogleGenAI } from "@google/genai";
import { GEMINI_MODEL, isVertex } from "@/lib/config";

let client: GoogleGenAI | null = null;

export function getGemini() {
  if (client) return client;
  if (isVertex()) {
    client = new GoogleGenAI({
      vertexai: true,
      project: process.env.GOOGLE_CLOUD_PROJECT,
      location: process.env.GOOGLE_CLOUD_LOCATION || "us-central1",
    });
    return client;
  }
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is not set. Get one at https://aistudio.google.com/apikey",
    );
  }
  client = new GoogleGenAI({ apiKey });
  return client;
}

export async function generateJson<T>(args: {
  system: string;
  user: string;
}): Promise<{ data: T; text: string; latencyMs: number; model: string }> {
  const ai = getGemini();
  const started = Date.now();
  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: `${args.system}\n\n---\n\n${args.user}`,
    config: {
      temperature: 0.35,
      responseMimeType: "application/json",
    },
  });
  const text = response.text ?? "";
  const latencyMs = Date.now() - started;
  let data: T;
  try {
    data = JSON.parse(extractJson(text)) as T;
  } catch {
    throw new Error(`Gemini returned non-JSON for ${GEMINI_MODEL}: ${text.slice(0, 400)}`);
  }
  return { data, text, latencyMs, model: GEMINI_MODEL };
}

function extractJson(text: string) {
  const trimmed = text.trim();
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) return trimmed;
  const match = trimmed.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("No JSON object in model output");
  return match[0];
}

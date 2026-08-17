import { ProxyAgent, setGlobalDispatcher } from "undici";
import { GoogleGenAI } from "@google/genai";
import { GEMINI_MODEL, isVertex } from "@/lib/config";

let client: GoogleGenAI | null = null;
let proxyInstalled = false;

function installOutboundProxy() {
  if (proxyInstalled) return;
  const proxy =
    process.env.MOSSDESK_PROXY?.trim() ||
    process.env.HTTPS_PROXY?.trim() ||
    process.env.https_proxy?.trim();
  if (!proxy) return;
  setGlobalDispatcher(new ProxyAgent(proxy));
  proxyInstalled = true;
}

export function getGemini() {
  installOutboundProxy();
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
  let lastError = "Gemini call failed";
  let text = "";
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: `${args.system}\n\n---\n\n${args.user}`,
        config: {
          temperature: 0.35,
          responseMimeType: "application/json",
        },
      });
      text = response.text ?? "";
      lastError = "";
      break;
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);
      const busy = lastError.includes("UNAVAILABLE") || lastError.includes("high demand") || lastError.includes("503");
      if (!busy || attempt === 4) throw err;
      await new Promise((r) => setTimeout(r, 1500 * attempt));
    }
  }
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

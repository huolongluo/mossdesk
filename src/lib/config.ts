export const APP_NAME = "MossDesk";
export const APP_TAGLINE =
  "Gemini agents that run a small-business front office.";

export const PRICE_FLOOR_USD = 29;
export const PRICE_CEILING_USD = 249;
export const ESCALATE_ABOVE_USD = 199;

export const GEMINI_MODEL =
  process.env.GEMINI_MODEL?.trim() || "gemini-2.5-flash";

export function appUrl(requestUrl?: string) {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  }
  if (requestUrl) return new URL(requestUrl).origin;
  return "http://localhost:3000";
}

export function hasGeminiKey() {
  return Boolean(process.env.GEMINI_API_KEY?.trim()) || isVertex();
}

export function isVertex() {
  return (
    process.env.GEMINI_PROVIDER === "vertex" &&
    Boolean(process.env.GOOGLE_CLOUD_PROJECT)
  );
}

export function hasStripe() {
  return Boolean(process.env.STRIPE_SECRET_KEY?.trim());
}

export const INDUSTRIES = [
  "Cafe / bakery / restaurant",
  "Trades (plumber, electrician, HVAC)",
  "Clinic / wellness / gym",
  "Retail shop",
  "Salon / barber",
  "Freelance / studio",
  "Cleaning / home services",
  "Other local service",
] as const;

import { chromium } from "playwright";
import { mkdirSync } from "fs";
import path from "path";

const base = process.env.APP_URL || "http://127.0.0.1:3000";
const outDir = path.join(process.cwd(), "evidence", "video");
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1280, height: 720 },
  recordVideo: { dir: outDir, size: { width: 1280, height: 720 } },
});
const page = await context.newPage();

async function linger(ms) {
  await page.waitForTimeout(ms);
}

await page.goto(base, { waitUntil: "networkidle" });
await linger(3500);

await page.goto(`${base}/job/d89f5bc2-c296-45de-9ad9-c6e0dc10439b`, {
  waitUntil: "networkidle",
});
await linger(2500);
await page.mouse.wheel(0, 700);
await linger(2500);
await page.mouse.wheel(0, 900);
await linger(2500);
await page.mouse.wheel(0, 900);
await linger(2500);

await page.goto(`${base}/ops`, { waitUntil: "networkidle" });
await linger(4000);

await page.goto(`${base}/pay/d89f5bc2-c296-45de-9ad9-c6e0dc10439b`, {
  waitUntil: "networkidle",
});
await linger(3500);

await page.goto(`${base}/api/health`, { waitUntil: "domcontentloaded" });
await linger(2500);

await context.close();
await browser.close();
console.log("recorded", outDir);

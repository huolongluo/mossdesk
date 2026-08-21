import "server-only";

import { promises as fs } from "fs";
import path from "path";
import { getDataDir } from "@/lib/data-dir";

import { LIVE_INVOICE_ADDRESS } from "@/lib/chain";

export type DeploymentRecord = {
  network: "xlayer-testnet";
  chainId: 1952;
  address: `0x${string}`;
  txHash: `0x${string}`;
  deployer: `0x${string}`;
  deployedAt: string;
};

function filePath() {
  return path.join(getDataDir(), "xlayer-deployment.json");
}

export async function getDeployedAddress(): Promise<`0x${string}` | null> {
  const env = process.env.NEXT_PUBLIC_XLAYER_INVOICE_ADDRESS?.trim();
  if (env && /^0x[a-fA-F0-9]{40}$/.test(env)) return env as `0x${string}`;
  try {
    const raw = await fs.readFile(filePath(), "utf8");
    const parsed = JSON.parse(raw) as DeploymentRecord;
    if (parsed.address && /^0x[a-fA-F0-9]{40}$/.test(parsed.address)) {
      return parsed.address;
    }
  } catch {
    /* not deployed yet */
  }
  return LIVE_INVOICE_ADDRESS;
}

export async function saveDeployment(record: DeploymentRecord) {
  await fs.mkdir(getDataDir(), { recursive: true });
  await fs.writeFile(filePath(), JSON.stringify(record, null, 2), "utf8");
}

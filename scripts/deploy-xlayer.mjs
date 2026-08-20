import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createPublicClient, createWalletClient, http } from "viem";
import { privateKeyToAccount, generatePrivateKey } from "viem/accounts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const artifactPath = join(root, "contracts/out/MossDeskInvoice.json");
if (!existsSync(artifactPath)) {
  console.error("Run `node scripts/compile-invoice.mjs` first.");
  process.exit(1);
}

const artifact = JSON.parse(readFileSync(artifactPath, "utf8"));
const rpc =
  process.env.XLAYER_RPC_URL?.trim() || "https://testrpc.xlayer.tech/terigon";
const chain = {
  id: 1952,
  name: "X Layer Testnet",
  nativeCurrency: { name: "OKB", symbol: "OKB", decimals: 18 },
  rpcUrls: { default: { http: [rpc] } },
};

let key = process.env.XLAYER_PRIVATE_KEY?.trim();
if (!key) {
  key = generatePrivateKey();
  console.log("Generated a fresh deployer key. Fund THIS address, then rerun:");
  console.log("  XLAYER_PRIVATE_KEY=" + key);
  const account = privateKeyToAccount(key);
  console.log("  address:", account.address);
  console.log("  faucet: https://web3.okx.com/xlayer/faucet");
  process.exit(2);
}

const account = privateKeyToAccount(
  /** @type {`0x${string}`} */ (key.startsWith("0x") ? key : `0x${key}`),
);
const publicClient = createPublicClient({ chain, transport: http(rpc) });
const wallet = createWalletClient({
  account,
  chain,
  transport: http(rpc),
});

const balance = await publicClient.getBalance({ address: account.address });
console.log("deployer", account.address);
console.log("balance wei", balance.toString());
if (balance === 0n) {
  console.error("No OKB. Claim testnet OKB at https://web3.okx.com/xlayer/faucet");
  process.exit(3);
}

const hash = await wallet.deployContract({
  abi: artifact.abi,
  bytecode: artifact.bytecode,
  account,
});
console.log("deploy tx", hash);
const receipt = await publicClient.waitForTransactionReceipt({ hash });
const address = receipt.contractAddress;
if (!address) {
  console.error("Deploy mined but no contract address", receipt);
  process.exit(1);
}

const record = {
  network: "xlayer-testnet",
  chainId: 1952,
  address,
  txHash: hash,
  deployer: account.address,
  blockNumber: receipt.blockNumber.toString(),
  explorer: `https://www.okx.com/web3/explorer/xlayer-test/address/${address}`,
  deployedAt: new Date().toISOString(),
};
writeFileSync(
  join(root, "contracts/out/deployment.json"),
  JSON.stringify(record, null, 2),
);
console.log(JSON.stringify(record, null, 2));
console.log("\nAdd to .env.local:");
console.log(`NEXT_PUBLIC_XLAYER_INVOICE_ADDRESS=${address}`);

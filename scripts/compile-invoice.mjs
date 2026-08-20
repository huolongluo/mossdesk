import { writeFileSync, mkdirSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const solc = require("solc");

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const source = readFileSync(join(root, "contracts/MossDeskInvoice.sol"), "utf8");

const input = {
  language: "Solidity",
  sources: { "MossDeskInvoice.sol": { content: source } },
  settings: {
    optimizer: { enabled: true, runs: 200 },
    outputSelection: {
      "*": { "*": ["abi", "evm.bytecode.object"] },
    },
  },
};

const output = JSON.parse(solc.compile(JSON.stringify(input)));
if (output.errors?.some((e) => e.severity === "error")) {
  console.error(output.errors);
  process.exit(1);
}

const artifact = output.contracts["MossDeskInvoice.sol"].MossDeskInvoice;
if (!artifact?.evm?.bytecode?.object) {
  console.error("Compile produced no bytecode");
  process.exit(1);
}

const dir = join(root, "contracts/out");
mkdirSync(dir, { recursive: true });
writeFileSync(
  join(dir, "MossDeskInvoice.json"),
  JSON.stringify(
    {
      contractName: "MossDeskInvoice",
      abi: artifact.abi,
      bytecode: `0x${artifact.evm.bytecode.object}`,
    },
    null,
    2,
  ),
);
console.log("wrote contracts/out/MossDeskInvoice.json");
console.log("bytecode bytes", artifact.evm.bytecode.object.length / 2);

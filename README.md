# MossDesk

**Gemini agents that mint invoices on X Layer.**  
They intake the mess, set the price, deliver a 7-day operating package, then issue that invoice as an **AI-written trade receivable (RWA)** and collect in OKB.

Built for [OKX Build X · AI Season](https://web3.okx.com/zh-hans/xlayer/build-x-series) · AI-RWA · [github.com/huolongluo/mossdesk](https://github.com/huolongluo/mossdesk)

---

## Why this can win

Judges score **AI application, product completeness, user value, X Layer integration, growth, ecosystem**.

MossDesk is not a chatbot with a token glued on. It is a firm:

| Agent | Binding decision |
| --- | --- |
| Scout | Operating picture |
| Pricer | Take/decline + USD price ($29–$249) |
| Operator | 7-day playbook (the product) |
| Collector | Terms + mint receivable on X Layer |
| Auditor | SHIP / ESCALATE / REJECT |

After SHIP, `MossDeskInvoice` stores `jobId`, amount, memo, and `keccak256` of the decision tape. The customer pays exact wei in OKB. `InvoiceSettled` is the receipt. Humans do not re-quote.

## X Layer

| | |
| --- | --- |
| Network | X Layer testnet |
| Chain ID | 1952 |
| Token | OKB |
| RPC | https://testrpc.xlayer.tech/terigon |
| Explorer | https://www.okx.com/web3/explorer/xlayer-test |
| Contract | `MossDeskInvoice` — see `contracts/out/deployment.json` after deploy |
| Faucet | https://web3.okx.com/xlayer/faucet |

Peg used in the demo: **0.0001 OKB per USD face value** so a faucet drop can settle real jobs. Mainnet later uses a market oracle; the contract does not care.

## Quick start

```bash
cd mossdesk
cp .env.example .env.local
# GEMINI_API_KEY from https://aistudio.google.com/apikey
pnpm install
pnpm chain:compile
# fund deployer with testnet OKB, then:
pnpm chain:deploy
# paste NEXT_PUBLIC_XLAYER_INVOICE_ADDRESS into .env.local
pnpm dev
```

1. Open `/start` or **Run live bakery job**
2. Watch Scout → Pricer → Operator → Collector → Auditor
3. `/pay/[id]` → Connect OKX Wallet / MetaMask → add X Layer testnet → pay OKB
4. Confirm `InvoiceSettled` on the explorer and on `/ops`

## Stack

- Gemini API (`gemini-3.5-flash-lite`) for every agent call
- Next.js app (Cloud Run / any Node host)
- Solidity `MossDeskInvoice` on X Layer
- viem for issue / pay / verify

## Submission

See [XLAYER_SUBMIT.md](./XLAYER_SUBMIT.md) for the Google Form paste, tweet, and remaining human steps.

## License

MIT

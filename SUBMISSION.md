# Devpost / form copy — MossDesk (Build X AI Season)

**Hackathon:** OKX Build X · AI Season  
**Track:** AI-RWA (invoice receivables on X Layer)  
**Project name:** MossDesk  
**Tagline:** Gemini agents that mint invoices on X Layer.

**Built with:** Gemini API (`gemini-3.5-flash-lite`), Next.js, Solidity, X Layer testnet (chain 1952), viem

---

## Elevator

Local shops drown in unpaid invoices and ghosted quotes. MossDesk is a Gemini-operated firm: five agents intake the mess, set a real USD price, ship a 7-day operating package, mint that invoice as a trade receivable on X Layer, and collect in OKB. Humans do not re-quote. The decision tape is hashed on-chain.

---

## What it does

1. **Scout** — operating picture, constraints, risk flags  
2. **Pricer** — take or decline; SKU; dollar price under a hard policy  
3. **Operator** — copy-paste scripts + 7-day sequence  
4. **Collector** — terms, dunning, receivable params  
5. **Auditor** — SHIP / ESCALATE / REJECT  
6. **X Layer** — `MossDeskInvoice.issue` / `issueAndPay` / `pay` in OKB  

The customer pays the price the Pricer set. Checkout cannot override it. Settlement is verified server-side against `InvoiceSettled`.

## Testing instructions

1. Open the public URL.  
2. Click **Run live bakery job** (30–90s) or `/start`.  
3. Watch the decision tape.  
4. `/pay/[id]` — connect OKX Wallet or MetaMask, switch to X Layer testnet (1952), pay OKB. Faucet: https://web3.okx.com/xlayer/faucet  
5. Open `/ops`, `/xlayer`, `/api/health`.  
6. Click the explorer link on the contract and the settle tx.

## Links

- **Website:** _(production URL)_  
- **GitHub:** https://github.com/huolongluo/mossdesk  
- **Contract:** _(contracts/out/deployment.json)_  
- **X post:** _(must @XLayerOfficial)_  

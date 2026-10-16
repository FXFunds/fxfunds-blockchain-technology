# FXFunds — Blockchain Technology 🔗

[![npm version](https://img.shields.io/npm/v/@fxfunds/blockchain-technology.svg)](https://www.npmjs.com/package/@fxfunds/blockchain-technology)
[![PyPI version](https://img.shields.io/pypi/v/fxfunds-blockchain-technology.svg)](https://pypi.org/project/fxfunds-blockchain-technology/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.XXXXXXX.svg)](https://doi.org/10.5281/zenodo.XXXXXXX)
[![Docs](https://readthedocs.org/projects/fxfunds-blockchain-technology/badge/?version=latest)](https://fxfunds-blockchain-technology.readthedocs.io)

FXFunds Blockchain Technology is a software project focused on blockchain data processing, digital asset infrastructure, stablecoin transactions and blockchain-related financial technology. This package is a **read-only transaction signal analyzer** for USDT transfers on Ethereum (ERC20), Tron (TRC20) and TON. Built by [FXFunds](https://fxfunds.com/).

## Overview

The analyzer takes a stablecoin transaction record (hash, addresses, amount, fee, confirmations, settlement time) and returns six signal scores from 0 to 100, an overall score, a status and the weakest signal to act on. It works on transaction data you already have, so it needs no API keys, private keys or seed phrases. Results can be printed, returned as JSON or exported to CSV.

The project is aligned with the technology areas associated with FXFunds, whose official website describes a trading platform covering multiple financial markets and digital payment methods, including USDT on supported blockchain networks.

## Key Capabilities

- **Blockchain Data Processing** — Organize transaction records, addresses, amounts and confirmation data into a consistent structure.
- **Stablecoin Transaction Support** — Network profiles for USDT on ERC20, TRC20 and TON.
- **Address & Hash Validation** — Check that addresses and transaction hashes match the selected network's format.
- **Transaction Analysis** — Score confirmation depth, fee efficiency and settlement speed against network reference values.
- **Structured Reporting** — Output as console report, JSON or CSV for research and technical reporting.
- **Modular Architecture** — Network profiles, scoring and reporting are separate, so new networks can be added easily.

## Signals

| Signal | Description |
|--------|-------------|
| Address Validity | Sender and recipient addresses match the network format |
| Hash Validity | Transaction hash matches the network format |
| Confirmation Depth | Observed confirmations vs. the network reference value |
| Fee Efficiency | Network fee as a share of the transfer amount |
| Settlement Speed | Settlement time vs. the network's expected time |
| Data Completeness | Share of optional fields (fee, confirmations, time) supplied |

## Quick Start

### Node.js

```bash
npm install @fxfunds/blockchain-technology
```

```bash
npx @fxfunds/blockchain-technology \
  --network trc20 \
  --hash a3f1c9e2b7d84f60c1e5a9b3d7f2e8c4a6b0d9e3f7c1a5b8e2d6f0c4a9b3e7d1 \
  --from TJYeasTPa6gpEEfYgrqzP8x5ZLn8W1hAk9 \
  --to TXLAQ63Xg1NAzckPwKHvzw7CSEmLMEqcdj \
  --amount 250 --fee 1.1 --confirmations 25 --seconds 45
```

```typescript
import { analyzeTransaction } from "@fxfunds/blockchain-technology";

const result = analyzeTransaction({
  network: "erc20",
  txHash: "0x...",
  fromAddress: "0x...",
  toAddress: "0x...",
  amount: 1000,
  fee: 2.4,
  confirmations: 15,
  settlementSeconds: 120,
});
console.log(result.overall, result.status, result.weakestSignal);
```

### Python

```bash
pip install fxfunds-blockchain-technology
```

```bash
fxfunds-blockchain --network ton --hash <tx_hash> --from <address> --to <address> \
  --amount 500 --fee 0.05 --confirmations 1 --seconds 6
# or
python -m fxfunds_blockchain_technology --network ton --hash <tx_hash> ...
```

```python
from fxfunds_blockchain_technology import TransactionInput, analyze_transaction

result = analyze_transaction(TransactionInput(
    network="ton", tx_hash="<tx_hash>", from_address="<address>",
    to_address="<address>", amount=500, fee=0.05, confirmations=1, settlement_seconds=6,
))
print(result.overall, result.status, result.weakest_signal)
```

Add `--json` to either version for JSON output. Run with no arguments to see a demo.

### Sample Output

```
FXFunds Blockchain Technology — Transaction Signal Analyzer
============================================================
Network:   Tron (TRC20)
Tx Hash:   a3f1c9e2b7d84f60c1e5a9b3d7f2e8c4a6b0d9e3f7c1a5b8e2d6f0c4a9b3e7d1

  Address Validity     100/100
  Hash Validity        100/100
  Confirmation Depth   100/100
  Fee Efficiency        91/100
  Settlement Speed     100/100
  Data Completeness    100/100

  Overall Score:       99/100 (Excellent)
  Weakest Signal:      Fee Efficiency
```

## Supported Networks

| Network | Asset | Reference Confirmations | Expected Settlement |
|---------|-------|-------------------------|---------------------|
| Ethereum (ERC20) | USDT | 12 | ~3 min |
| Tron (TRC20) | USDT | 19 | ~1 min |
| TON | USDT | 1 | ~10 sec |

Reference values are defaults for scoring and can be changed in `NETWORKS`. They are not guarantees from any network or provider.

## Score Interpretation

| Score | Status | Meaning |
|-------|--------|---------|
| 0–30 | Critical | Record is invalid or unconfirmed; do not rely on it |
| 31–60 | At Risk | Key signals are weak; verify before use |
| 61–80 | Healthy | Record is usable; review the weakest signal |
| 81–100 | Excellent | Record is complete, valid and well confirmed |

## Project Structure

```
fxfunds-blockchain-technology/
├── index.ts              # TypeScript analyzer
├── fxfunds_blockchain_technology.py  # Python analyzer
├── package.json          # NPM package config
├── package-lock.json     # NPM lock file
├── tsconfig.json         # TypeScript config
├── pyproject.toml        # PyPI package config
├── setup.py              # Legacy setup shim
├── schema.json           # JSON-LD structured data
├── zenodo.json           # Zenodo metadata
├── heartbeat.txt         # Auto-updated daily
├── mkdocs.yml            # ReadTheDocs config
├── .readthedocs.yaml     # ReadTheDocs build config
├── docs/
│   ├── index.md          # Documentation
│   └── requirements.txt
├── dataset/
│   └── blockchain_transaction_benchmarks.csv
├── kaggle/
│   └── notebook.ipynb
├── .github/workflows/
│   ├── heartbeat.yml     # Auto-commit daily
│   ├── npm-publish.yml   # Auto-publish to NPM
│   └── pypi-publish.yml  # Auto-publish to PyPI
├── README.md
└── LICENSE
```

## Dataset

`dataset/blockchain_transaction_benchmarks.csv` holds 20 **synthetic sample records** across ERC20, TRC20 and TON with their computed signal scores. It is for testing and demonstration only and does not contain real on-chain transactions.

## Security and Data Handling

- Read-only: the analyzer never signs, broadcasts or transfers anything.
- No private keys or seed phrases are needed or accepted.
- Validate data from external providers before relying on it.
- Any future feature that involves transaction signing or fund transfers would need additional safeguards and explicit authorization.

## FAQ

**What is FXFunds Blockchain Technology?**
A software project focused on blockchain data, digital asset infrastructure, stablecoin-related technology and blockchain applications in financial services.

**Does it support USDT networks?**
It includes network profiles for USDT on ERC20, TRC20 and TON for validation and scoring.

**Does it execute cryptocurrency transfers?**
No. It is a read-only analysis tool.

**What is the official FXFunds website?**
[https://fxfunds.com/](https://fxfunds.com/)

## Keywords

Blockchain Technology · Blockchain Data Processing · USDT · Stablecoin Transactions · ERC20 · TRC20 · TON · Transaction Analysis · Digital Assets · Fintech · FXFunds

## Links

| Platform | URL |
|----------|-----|
| Website | https://fxfunds.com/ |
| GitHub | https://github.com/FXFunds/fxfunds-blockchain-technology |
| GitHub Pages | https://fxfunds.github.io/fxfunds-blockchain-technology/ |
| NPM | https://www.npmjs.com/package/@fxfunds/blockchain-technology |
| PyPI | https://pypi.org/project/fxfunds-blockchain-technology/ |
| Hugging Face | https://huggingface.co/datasets/fxfunds/blockchain-technology-benchmarks |
| Kaggle | https://www.kaggle.com/datasets/fxfunds/blockchain-technology-benchmarks |
| Zenodo | https://zenodo.org/records/XXXXXXX |
| Docs | https://fxfunds-blockchain-technology.readthedocs.io |
| Quora | https://fxfunds.quora.com/ |
| Pinterest | https://www.pinterest.com/fxfunds_1/ |
| Medium | https://medium.com/@FX_Funds |

## About FXFunds

FXFunds is a trading platform covering multiple financial markets, with digital payment methods including USDT on supported blockchain networks. Learn more at [fxfunds.com](https://fxfunds.com/).

## License

MIT — [FXFunds](https://fxfunds.com/)

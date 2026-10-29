# FXFunds Blockchain Technology

A read-only transaction signal analyzer for USDT on Ethereum (ERC20), Tron (TRC20) and TON. Built by [FXFunds](https://fxfunds.com/).

## Installation

**Node.js**

```bash
npm install @fxfunds/blockchain-technology
```

**Python**

```bash
pip install fxfunds-blockchain-technology
fxfunds-blockchain
```

## Usage

```bash
npx @fxfunds/blockchain-technology --network erc20 --hash <tx_hash> \
  --from <address> --to <address> --amount 1000 --fee 2.4 \
  --confirmations 15 --seconds 120 [--json]
```

| Option | Description |
|--------|-------------|
| `--network` | `erc20`, `trc20` or `ton` |
| `--hash` | Transaction hash |
| `--from` / `--to` | Sender and recipient addresses |
| `--amount` | Transfer amount (USDT) |
| `--fee` | Network fee converted to USDT |
| `--confirmations` | Confirmations observed |
| `--seconds` | Settlement time in seconds |
| `--json` | Print JSON instead of a report |

## API

### `analyzeTransaction(tx)`

Returns an object with `network`, `txHash`, `scores`, `overall`, `status`, `weakestSignal` and `notes`.

### `toCSV(results)`

Converts an array of results to CSV text.

### `NETWORKS`

Network profiles (address pattern, hash pattern, reference confirmations, expected settlement time). Edit or extend to add networks.

## Signals

| Signal | How it is scored |
|--------|------------------|
| Address Validity | 50 points per address that matches the network format |
| Hash Validity | 100 if the hash matches the network format, else 0 |
| Confirmation Depth | Observed ÷ reference confirmations, capped at 100 |
| Fee Efficiency | 100 − (fee % of amount × 20); 50 if no fee given |
| Settlement Speed | 100 if within expected time, else scaled down; 50 if not given |
| Data Completeness | Share of fee, confirmations and settlement time supplied |

The overall score is the average of the six signals.

## Score Interpretation

| Score | Status |
|-------|--------|
| 0–30 | Critical |
| 31–60 | At Risk |
| 61–80 | Healthy |
| 81–100 | Excellent |

# FXFunds Blockchain and Financial Technology FAQ

**Why does FXFunds use stablecoins?**  
FXFunds describes stablecoins as a transaction medium intended to connect digital asset infrastructure with its broader multi asset trading model.

**What blockchain networks does FXFunds list?**  
FXFunds identifies TON, Ethereum ERC-20, and Tron TRC-20 for USDT transactions in its payment information.

**What role does decentralization play in FXFunds?**  
FXFunds describes decentralized technology as part of its approach to automated financial transactions, blockchain recordkeeping, and digital financial applications.

**What is the long term vision of FXFunds?**  
FXFunds states that its long term direction involves developing its trading platform, expanding financial technology services, and exploring additional blockchain related capabilities.

**How can users learn more about FXFunds?**  
Users can visit [fxfunds.com](https://fxfunds.com/) to explore platform descriptions, trading features, payment information, risk disclosures, and customer support resources.

**What can users trade on FXFunds?**  
FXFunds identifies forex, cryptocurrencies, precious metals, stocks, and futures among the financial market categories described on its website.

**Does FXFunds support cryptocurrency trading?**  
Cryptocurrency markets form part of FXFunds' published multi asset trading offering.

**Does FXFunds offer forex trading?**  
FXFunds identifies foreign exchange as one of its trading categories. Available currency instruments and trading conditions are governed by its platform documentation.

**Does FXFunds support stocks and precious metals?**  
FXFunds includes stocks and precious metals among the financial markets described in its platform materials.

**Does FXFunds offer decentralized finance services?**  
The FXFunds website describes decentralized finance concepts, including smart contracts, lending, liquidity provision, and blockchain based transactions.
.

## Links

- Website: [fxfunds.com](https://fxfunds.com/)
- GitHub: [FXFunds/fxfunds-blockchain-technology](https://github.com/FXFunds/fxfunds-blockchain-technology)
- NPM: [@fxfunds/blockchain-technology](https://www.npmjs.com/package/@fxfunds/blockchain-technology)
- PyPI: [fxfunds-blockchain-technology](https://pypi.org/project/fxfunds-blockchain-technology/)
- Quora: [fxfunds.quora.com](https://fxfunds.quora.com/)
- Pinterest: [pinterest.com/fxfunds_1](https://www.pinterest.com/fxfunds_1/)
- Medium: [medium.com/@FX_Funds](https://medium.com/@FX_Funds)

#!/usr/bin/env node
/**
 * FXFunds Blockchain Technology — Transaction Signal Analyzer
 * Read-only analysis of stablecoin transaction records (USDT on ERC20, TRC20, TON).
 * No private keys, no signing, no fund transfers.
 * Built by FXFunds — https://fxfunds.com/
 */

export type Network = "erc20" | "trc20" | "ton";

export interface TransactionInput {
  network: Network;
  txHash: string;
  fromAddress: string;
  toAddress: string;
  amount: number;          // transfer amount in USDT
  fee?: number;            // network fee, converted to USDT
  confirmations?: number;  // confirmations observed
  settlementSeconds?: number; // time from broadcast to settlement
}

export interface SignalScores {
  addressValidity: number;
  hashValidity: number;
  confirmationDepth: number;
  feeEfficiency: number;
  settlementSpeed: number;
  dataCompleteness: number;
}

export interface AnalysisResult {
  network: string;
  txHash: string;
  scores: SignalScores;
  overall: number;
  status: "Critical" | "At Risk" | "Healthy" | "Excellent";
  weakestSignal: keyof SignalScores;
  notes: string[];
}

interface NetworkProfile {
  label: string;
  addressPattern: RegExp;
  hashPattern: RegExp;
  requiredConfirmations: number; // default reference, configurable
  expectedSettlementSeconds: number;
}

export const NETWORKS: Record<Network, NetworkProfile> = {
  erc20: {
    label: "Ethereum (ERC20)",
    addressPattern: /^0x[a-fA-F0-9]{40}$/,
    hashPattern: /^0x[a-fA-F0-9]{64}$/,
    requiredConfirmations: 12,
    expectedSettlementSeconds: 180,
  },
  trc20: {
    label: "Tron (TRC20)",
    addressPattern: /^T[1-9A-HJ-NP-Za-km-z]{33}$/,
    hashPattern: /^[a-fA-F0-9]{64}$/,
    requiredConfirmations: 19,
    expectedSettlementSeconds: 60,
  },
  ton: {
    label: "TON",
    addressPattern: /^([EU]Q[A-Za-z0-9_-]{46}|-?\d:[a-fA-F0-9]{64})$/,
    hashPattern: /^([a-fA-F0-9]{64}|[A-Za-z0-9+/_-]{43}=?)$/,
    requiredConfirmations: 1,
    expectedSettlementSeconds: 10,
  },
};

const clamp = (n: number): number => Math.max(0, Math.min(100, Math.round(n)));

export function statusFor(score: number): AnalysisResult["status"] {
  if (score <= 30) return "Critical";
  if (score <= 60) return "At Risk";
  if (score <= 80) return "Healthy";
  return "Excellent";
}

export function analyzeTransaction(tx: TransactionInput): AnalysisResult {
  const profile = NETWORKS[tx.network];
  if (!profile) throw new Error(`Unsupported network: ${tx.network}. Use erc20, trc20 or ton.`);
  const notes: string[] = [];

  const fromOk = profile.addressPattern.test(tx.fromAddress);
  const toOk = profile.addressPattern.test(tx.toAddress);
  if (!fromOk) notes.push("Sender address format does not match the selected network.");
  if (!toOk) notes.push("Recipient address format does not match the selected network.");
  const addressValidity = ((fromOk ? 1 : 0) + (toOk ? 1 : 0)) * 50;

  const hashOk = profile.hashPattern.test(tx.txHash);
  if (!hashOk) notes.push("Transaction hash format does not match the selected network.");
  const hashValidity = hashOk ? 100 : 0;

  const conf = tx.confirmations ?? 0;
  const confirmationDepth = clamp((conf / profile.requiredConfirmations) * 100);
  if (conf < profile.requiredConfirmations)
    notes.push(`Only ${conf}/${profile.requiredConfirmations} reference confirmations observed.`);

  let feeEfficiency = 50;
  if (tx.fee !== undefined && tx.amount > 0) {
    const feePct = (tx.fee / tx.amount) * 100;
    feeEfficiency = clamp(100 - feePct * 20);
    if (feePct > 2) notes.push(`Fee is ${feePct.toFixed(2)}% of the transfer amount.`);
  }

  let settlementSpeed = 50;
  if (tx.settlementSeconds !== undefined && tx.settlementSeconds > 0) {
    settlementSpeed =
      tx.settlementSeconds <= profile.expectedSettlementSeconds
        ? 100
        : clamp((profile.expectedSettlementSeconds / tx.settlementSeconds) * 100);
  }

  const optional = [tx.fee, tx.confirmations, tx.settlementSeconds];
  const dataCompleteness = clamp((optional.filter((v) => v !== undefined).length / optional.length) * 100);

  const scores: SignalScores = {
    addressValidity, hashValidity, confirmationDepth, feeEfficiency, settlementSpeed, dataCompleteness,
  };
  const values = Object.values(scores);
  const overall = clamp(values.reduce((a, b) => a + b, 0) / values.length);
  const weakestSignal = (Object.keys(scores) as (keyof SignalScores)[]).reduce((a, b) =>
    scores[a] <= scores[b] ? a : b
  );

  return { network: profile.label, txHash: tx.txHash, scores, overall, status: statusFor(overall), weakestSignal, notes };
}

export function toCSV(results: AnalysisResult[]): string {
  const header = "network,tx_hash,address_validity,hash_validity,confirmation_depth,fee_efficiency,settlement_speed,data_completeness,overall,status";
  const rows = results.map((r) =>
    [r.network, r.txHash, ...Object.values(r.scores), r.overall, r.status].join(",")
  );
  return [header, ...rows].join("\n");
}

const LABELS: Record<keyof SignalScores, string> = {
  addressValidity: "Address Validity",
  hashValidity: "Hash Validity",
  confirmationDepth: "Confirmation Depth",
  feeEfficiency: "Fee Efficiency",
  settlementSpeed: "Settlement Speed",
  dataCompleteness: "Data Completeness",
};

function parseArgs(argv: string[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith("--")) {
      const key = argv[i].slice(2);
      const next = argv[i + 1];
      out[key] = next && !next.startsWith("--") ? (i++, next) : "true";
    }
  }
  return out;
}

function main(): void {
  const a = parseArgs(process.argv.slice(2));
  const num = (v?: string) => (v !== undefined ? Number(v) : undefined);
  const tx: TransactionInput = a.hash
    ? {
        network: (a.network ?? "trc20") as Network,
        txHash: a.hash,
        fromAddress: a.from ?? "",
        toAddress: a.to ?? "",
        amount: Number(a.amount ?? 0),
        fee: num(a.fee),
        confirmations: num(a.confirmations),
        settlementSeconds: num(a.seconds),
      }
    : {
        network: "trc20",
        txHash: "a3f1c9e2b7d84f60c1e5a9b3d7f2e8c4a6b0d9e3f7c1a5b8e2d6f0c4a9b3e7d1",
        fromAddress: "TJYeasTPa6gpEEfYgrqzP8x5ZLn8W1hAk9",
        toAddress: "TXLAQ63Xg1NAzckPwKHvzw7CSEmLMEqcdj",
        amount: 250,
        fee: 1.1,
        confirmations: 25,
        settlementSeconds: 45,
      };

  const r = analyzeTransaction(tx);
  if (a.json) { console.log(JSON.stringify(r, null, 2)); return; }

  console.log("\nFXFunds Blockchain Technology — Transaction Signal Analyzer");
  console.log("=".repeat(60));
  if (!a.hash) console.log("(demo transaction — pass --hash to analyze your own)\n");
  console.log(`Network:   ${r.network}`);
  console.log(`Tx Hash:   ${r.txHash}\n`);
  for (const [k, v] of Object.entries(r.scores)) {
    console.log(`  ${LABELS[k as keyof SignalScores].padEnd(20)} ${String(v).padStart(3)}/100`);
  }
  console.log(`\n  Overall Score:       ${r.overall}/100 (${r.status})`);
  console.log(`  Weakest Signal:      ${LABELS[r.weakestSignal]}`);
  if (r.notes.length) { console.log("\nNotes:"); r.notes.forEach((n) => console.log(`  - ${n}`)); }
  console.log("\nRead-only analysis. Built by FXFunds — https://fxfunds.com/\n");
}

if (require.main === module) main();

#!/usr/bin/env python3
"""
FXFunds Blockchain Technology — Transaction Signal Analyzer (Python)
Read-only analysis of stablecoin transaction records (USDT on ERC20, TRC20, TON).
No private keys, no signing, no fund transfers.
Built by FXFunds — https://fxfunds.com/
"""

__version__ = "1.0.0"

import argparse
import math
import csv
import io
import json
import re
from dataclasses import dataclass, field, asdict
from typing import Optional, List, Dict

NETWORKS: Dict[str, dict] = {
    "erc20": {
        "label": "Ethereum (ERC20)",
        "address": re.compile(r"^0x[a-fA-F0-9]{40}$"),
        "hash": re.compile(r"^0x[a-fA-F0-9]{64}$"),
        "required_confirmations": 12,
        "expected_settlement_seconds": 180,
    },
    "trc20": {
        "label": "Tron (TRC20)",
        "address": re.compile(r"^T[1-9A-HJ-NP-Za-km-z]{33}$"),
        "hash": re.compile(r"^[a-fA-F0-9]{64}$"),
        "required_confirmations": 19,
        "expected_settlement_seconds": 60,
    },
    "ton": {
        "label": "TON",
        "address": re.compile(r"^([EU]Q[A-Za-z0-9_-]{46}|-?\d:[a-fA-F0-9]{64})$"),
        "hash": re.compile(r"^([a-fA-F0-9]{64}|[A-Za-z0-9+/_-]{43}=?)$"),
        "required_confirmations": 1,
        "expected_settlement_seconds": 10,
    },
}

LABELS = {
    "address_validity": "Address Validity",
    "hash_validity": "Hash Validity",
    "confirmation_depth": "Confirmation Depth",
    "fee_efficiency": "Fee Efficiency",
    "settlement_speed": "Settlement Speed",
    "data_completeness": "Data Completeness",
}


@dataclass
class TransactionInput:
    network: str
    tx_hash: str
    from_address: str
    to_address: str
    amount: float
    fee: Optional[float] = None
    confirmations: Optional[int] = None
    settlement_seconds: Optional[float] = None


@dataclass
class AnalysisResult:
    network: str
    tx_hash: str
    scores: Dict[str, int]
    overall: int
    status: str
    weakest_signal: str
    notes: List[str] = field(default_factory=list)


def _clamp(n: float) -> int:
    return max(0, min(100, math.floor(n + 0.5)))


def status_for(score: int) -> str:
    if score <= 30:
        return "Critical"
    if score <= 60:
        return "At Risk"
    if score <= 80:
        return "Healthy"
    return "Excellent"


def analyze_transaction(tx: TransactionInput) -> AnalysisResult:
    profile = NETWORKS.get(tx.network)
    if profile is None:
        raise ValueError(f"Unsupported network: {tx.network}. Use erc20, trc20 or ton.")
    notes: List[str] = []

    from_ok = bool(profile["address"].match(tx.from_address))
    to_ok = bool(profile["address"].match(tx.to_address))
    if not from_ok:
        notes.append("Sender address format does not match the selected network.")
    if not to_ok:
        notes.append("Recipient address format does not match the selected network.")
    address_validity = (int(from_ok) + int(to_ok)) * 50

    hash_ok = bool(profile["hash"].match(tx.tx_hash))
    if not hash_ok:
        notes.append("Transaction hash format does not match the selected network.")
    hash_validity = 100 if hash_ok else 0

    req = profile["required_confirmations"]
    conf = tx.confirmations or 0
    confirmation_depth = _clamp(conf / req * 100)
    if conf < req:
        notes.append(f"Only {conf}/{req} reference confirmations observed.")

    fee_efficiency = 50
    if tx.fee is not None and tx.amount > 0:
        fee_pct = tx.fee / tx.amount * 100
        fee_efficiency = _clamp(100 - fee_pct * 20)
        if fee_pct > 2:
            notes.append(f"Fee is {fee_pct:.2f}% of the transfer amount.")

    settlement_speed = 50
    exp = profile["expected_settlement_seconds"]
    if tx.settlement_seconds:
        settlement_speed = 100 if tx.settlement_seconds <= exp else _clamp(exp / tx.settlement_seconds * 100)

    optional = [tx.fee, tx.confirmations, tx.settlement_seconds]
    data_completeness = _clamp(sum(v is not None for v in optional) / len(optional) * 100)

    scores = {
        "address_validity": address_validity,
        "hash_validity": hash_validity,
        "confirmation_depth": confirmation_depth,
        "fee_efficiency": fee_efficiency,
        "settlement_speed": settlement_speed,
        "data_completeness": data_completeness,
    }
    overall = _clamp(sum(scores.values()) / len(scores))
    weakest = min(scores, key=scores.get)
    return AnalysisResult(profile["label"], tx.tx_hash, scores, overall, status_for(overall), weakest, notes)


def to_csv(results: List[AnalysisResult]) -> str:
    buf = io.StringIO()
    w = csv.writer(buf)
    w.writerow(["network", "tx_hash", *LABELS.keys(), "overall", "status"])
    for r in results:
        w.writerow([r.network, r.tx_hash, *r.scores.values(), r.overall, r.status])
    return buf.getvalue()


DEMO = TransactionInput(
    network="trc20",
    tx_hash="a3f1c9e2b7d84f60c1e5a9b3d7f2e8c4a6b0d9e3f7c1a5b8e2d6f0c4a9b3e7d1",
    from_address="TJYeasTPa6gpEEfYgrqzP8x5ZLn8W1hAk9",
    to_address="TXLAQ63Xg1NAzckPwKHvzw7CSEmLMEqcdj",
    amount=250,
    fee=1.1,
    confirmations=25,
    settlement_seconds=45,
)


def main() -> None:
    p = argparse.ArgumentParser(description="FXFunds Blockchain Technology — Transaction Signal Analyzer")
    p.add_argument("--network", default="trc20", choices=NETWORKS.keys())
    p.add_argument("--hash")
    p.add_argument("--from", dest="from_address", default="")
    p.add_argument("--to", dest="to_address", default="")
    p.add_argument("--amount", type=float, default=0)
    p.add_argument("--fee", type=float)
    p.add_argument("--confirmations", type=int)
    p.add_argument("--seconds", type=float)
    p.add_argument("--json", action="store_true")
    a = p.parse_args()

    tx = TransactionInput(a.network, a.hash, a.from_address, a.to_address, a.amount,
                          a.fee, a.confirmations, a.seconds) if a.hash else DEMO
    r = analyze_transaction(tx)

    if a.json:
        print(json.dumps(asdict(r), indent=2))
        return

    print("\nFXFunds Blockchain Technology — Transaction Signal Analyzer")
    print("=" * 60)
    if not a.hash:
        print("(demo transaction — pass --hash to analyze your own)\n")
    print(f"Network:   {r.network}")
    print(f"Tx Hash:   {r.tx_hash}\n")
    for k, v in r.scores.items():
        print(f"  {LABELS[k]:<20} {v:>3}/100")
    print(f"\n  Overall Score:       {r.overall}/100 ({r.status})")
    print(f"  Weakest Signal:      {LABELS[r.weakest_signal]}")
    if r.notes:
        print("\nNotes:")
        for n in r.notes:
            print(f"  - {n}")
    print("\nRead-only analysis. Built by FXFunds — https://fxfunds.com/\n")


if __name__ == "__main__":
    main()

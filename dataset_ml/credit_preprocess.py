"""
Shared feature cleaning for credit scoring (train notebook + predict_credit.py).
"""
from __future__ import annotations

import re

import numpy as np
import pandas as pd

DROP_COLS = ["ID", "Customer_ID", "Name", "SSN"]

NUMERIC_COLS = [
    "Age",
    "Annual_Income",
    "Monthly_Inhand_Salary",
    "Num_Bank_Accounts",
    "Num_Credit_Card",
    "Interest_Rate",
    "Num_of_Loan",
    "Delay_from_due_date",
    "Num_of_Delayed_Payment",
    "Changed_Credit_Limit",
    "Num_Credit_Inquiries",
    "Outstanding_Debt",
    "Credit_Utilization_Ratio",
    "Total_EMI_per_month",
    "Amount_invested_monthly",
    "Monthly_Balance",
]

CAT_COLS = [
    "Month",
    "Occupation",
    "Type_of_Loan",
    "Credit_Mix",
    "Payment_of_Min_Amount",
    "Payment_Behaviour",
]

TARGET = "Credit_Score"


def _clean_scalar(x):
    if pd.isna(x):
        return np.nan
    s = str(x).strip().rstrip("_")
    if s.upper() in ("NA", "NM", "") or s in ("_", "______"):
        return np.nan
    if re.fullmatch(r"[!@#$%^&*0-9_]+", s):
        return np.nan
    if "__10000__" in s:
        return np.nan
    s = re.sub(r"[^0-9eE+\.\-]", "", s)
    if s in ("", "-", "+", "."):
        return np.nan
    try:
        return float(s)
    except ValueError:
        return np.nan


def parse_credit_history_age(val):
    if pd.isna(val):
        return np.nan
    s = str(val).strip()
    if s.upper() in ("NA", "NM") or s in ("_", ""):
        return np.nan
    y = re.search(r"(\d+)\s*Years?", s, re.I)
    m = re.search(r"(\d+)\s*Months?", s, re.I)
    years = int(y.group(1)) if y else 0
    months = int(m.group(1)) if m else 0
    return years * 12 + months


def clean_numeric_frame(df: pd.DataFrame) -> pd.DataFrame:
    out = df.copy()
    for c in NUMERIC_COLS:
        if c in out.columns:
            out[c] = out[c].map(_clean_scalar)
    if "Credit_History_Age" in out.columns:
        out["Credit_History_Age_months"] = out["Credit_History_Age"].map(parse_credit_history_age)
    return out


def prepare_features(df: pd.DataFrame, *, fit: bool = False) -> pd.DataFrame:
    """Drop PII / target, clean numerics, fill categoricals."""
    del fit  # reserved for API symmetry
    X = df.drop(columns=[c for c in DROP_COLS if c in df.columns], errors="ignore")
    if TARGET in X.columns:
        X = X.drop(columns=[TARGET])
    X = clean_numeric_frame(X)
    if "Credit_History_Age" in X.columns:
        X = X.drop(columns=["Credit_History_Age"])
    for c in CAT_COLS:
        if c in X.columns:
            X[c] = (
                X[c]
                .astype(str)
                .str.strip()
                .replace({"nan": np.nan, "NA": np.nan, "_": np.nan, "______": "Unknown"})
            )
            X[c] = X[c].fillna("Unknown")
    return X


def numeric_feature_names() -> list[str]:
    return [c for c in NUMERIC_COLS + ["Credit_History_Age_months"]]

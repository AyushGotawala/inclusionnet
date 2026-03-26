#!/usr/bin/env python3
"""
Load a Joblib credit model and predict from JSON on stdin.

Set CREDIT_MODEL_PATH to the bundle (default: backend/ml_models/credit_score_hgb.joblib
if present, else artifacts/credit_score_model.joblib).

Input rows should match raw CSV-style fields (same names as train.csv), including
optional ID/Name/SSN — they are dropped during cleaning.

Example:
  echo '[{"Age": 30, "Month": "January", "Occupation": "Scientist", ...}]' | python predict_credit.py

Output: JSON array of { "predicted_label": "Good"|"Standard"|"Poor", "class_index": int }
"""
from __future__ import annotations

import json
import os
import sys
from pathlib import Path

import joblib
import numpy as np
import pandas as pd

from credit_preprocess import prepare_features

ROOT = Path(__file__).resolve().parent
_DEFAULT_HGB = ROOT.parent / "backend" / "ml_models" / "credit_score_hgb.joblib"
_DEFAULT_ART = ROOT / "artifacts" / "credit_score_model.joblib"


def _resolve_artifact() -> Path:
    env = os.environ.get("CREDIT_MODEL_PATH")
    if env:
        return Path(env).expanduser().resolve()
    if _DEFAULT_HGB.is_file():
        return _DEFAULT_HGB
    return _DEFAULT_ART


ARTIFACT = _resolve_artifact()


def main() -> None:
    if not ARTIFACT.is_file():
        print(
            json.dumps(
                {
                    "error": f"Missing model file: {ARTIFACT}. Run dataset_ml/train_hgb_model.py or the notebook."
                }
            ),
            file=sys.stderr,
        )
        sys.exit(1)

    bundle = joblib.load(ARTIFACT)
    pipe = bundle["pipeline"]
    le = bundle["target_encoder"]
    feature_columns = bundle["feature_columns"]
    cat_cols = bundle.get("categorical_columns", [])

    raw = sys.stdin.read()
    rows = json.loads(raw)
    if isinstance(rows, dict):
        rows = [rows]
    X_raw = pd.DataFrame(rows)
    X = prepare_features(X_raw)
    X = X.reindex(columns=feature_columns, fill_value=np.nan)
    for c in cat_cols:
        if c in X.columns:
            X[c] = (
                X[c].astype(str).str.strip().replace({"nan": np.nan}).fillna("Unknown")
            )

    pred_enc = pipe.predict(X)
    labels = le.inverse_transform(pred_enc)
    out = [
        {"predicted_label": str(lab), "class_index": int(idx)}
        for lab, idx in zip(labels, pred_enc)
    ]
    print(json.dumps(out if len(out) > 1 else out[0]))


if __name__ == "__main__":
    main()

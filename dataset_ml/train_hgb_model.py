#!/usr/bin/env python3
"""
Train HistGradientBoostingClassifier only and save Joblib for backend (pickle-compatible).

Usage (from dataset_ml/):
  python train_hgb_model.py
  TRAIN_FULL=1 python train_hgb_model.py   # use all rows (slower)

Writes: ../backend/ml_models/credit_score_hgb.joblib
"""
from __future__ import annotations

import os
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.base import clone
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import HistGradientBoostingClassifier
from sklearn.impute import SimpleImputer
from sklearn.metrics import f1_score, classification_report
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import LabelEncoder, OrdinalEncoder

from credit_preprocess import CAT_COLS, TARGET, numeric_feature_names, prepare_features

BASE = Path(__file__).resolve().parent
OUT_DIR = BASE.parent / "backend" / "ml_models"
TRAIN_CSV = BASE / "train.csv"


def main() -> None:
    full = os.environ.get("TRAIN_FULL") == "1"
    df = pd.read_csv(TRAIN_CSV, low_memory=False)
    if not full and len(df) > 25000:
        df = df.sample(25000, random_state=42)
        print("Using 25k sample. Set TRAIN_FULL=1 to train on all rows.")

    y = df[TARGET].astype(str).str.strip()
    le_target = LabelEncoder()
    y_enc = le_target.fit_transform(y)

    X_full = prepare_features(df)
    num_features = [c for c in numeric_feature_names() if c in X_full.columns]
    cat_features = [c for c in CAT_COLS if c in X_full.columns]

    numeric_pipe = Pipeline([("imputer", SimpleImputer(strategy="median"))])
    categorical_pipe = Pipeline(
        [
            (
                "enc",
                OrdinalEncoder(
                    handle_unknown="use_encoded_value",
                    unknown_value=-1,
                ),
            ),
        ]
    )
    preprocess = ColumnTransformer(
        transformers=[
            ("num", numeric_pipe, num_features),
            ("cat", categorical_pipe, cat_features),
        ],
        remainder="drop",
    )

    clf = HistGradientBoostingClassifier(
        max_iter=400,
        learning_rate=0.06,
        max_depth=12,
        min_samples_leaf=20,
        l2_regularization=1.0,
        class_weight="balanced",
        random_state=42,
    )

    X_tr, X_val, y_tr, y_val = train_test_split(
        X_full, y_enc, test_size=0.2, random_state=42, stratify=y_enc
    )
    pipe = Pipeline([("prep", clone(preprocess)), ("clf", clone(clf))])
    pipe.fit(X_tr, y_tr)
    pred = pipe.predict(X_val)
    print("Validation macro-F1:", f1_score(y_val, pred, average="macro"))
    print(classification_report(y_val, pred, target_names=le_target.classes_))

    final = Pipeline([("prep", clone(preprocess)), ("clf", clone(clf))])
    final.fit(X_full, y_enc)

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    artifact = {
        "pipeline": final,
        "target_encoder": le_target,
        "feature_columns": list(X_full.columns),
        "numeric_columns": num_features,
        "categorical_columns": cat_features,
        "model_name": "HistGradientBoostingClassifier",
    }
    out_path = OUT_DIR / "credit_score_hgb.joblib"
    joblib.dump(artifact, out_path)
    print("Saved:", out_path)


if __name__ == "__main__":
    main()

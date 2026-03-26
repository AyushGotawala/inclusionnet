credit_score_hgb.joblib — HistGradientBoosting credit model (Joblib/pickle-compatible).

Train or refresh:
  cd ../dataset_ml && python3 train_hgb_model.py
  TRAIN_FULL=1 python3 train_hgb_model.py   # full training set (slower)

Requires Python 3 with pandas, scikit-learn, joblib (see ../dataset_ml/requirements-ml.txt).

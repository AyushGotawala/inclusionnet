import { spawnSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATASET_ML = path.join(__dirname, '..', '..', '..', 'dataset_ml');
const DEFAULT_MODEL = path.join(__dirname, '..', '..', 'ml_models', 'credit_score_hgb.joblib');

/**
 * Run Python predict_credit.py with one feature row (JSON array).
 * @param {Record<string, unknown>} mlRow
 * @returns {{ predicted_label: string, class_index: number } | null}
 */
export function predictCreditScore(mlRow) {
  const python = process.env.PYTHON_BIN || 'python3';
  const script = path.join(DATASET_ML, 'predict_credit.py');
  const modelPath = process.env.CREDIT_MODEL_PATH || DEFAULT_MODEL;

  const result = spawnSync(
    python,
    [script],
    {
      cwd: DATASET_ML,
      input: JSON.stringify([mlRow]),
      encoding: 'utf-8',
      maxBuffer: 32 * 1024 * 1024,
      env: {
        ...process.env,
        CREDIT_MODEL_PATH: modelPath,
      },
    },
  );

  if (result.error) {
    console.error('creditMlService spawn error:', result.error.message);
    return null;
  }
  if (result.status !== 0) {
    console.error('creditMlService stderr:', result.stderr);
    return null;
  }
  try {
    const out = JSON.parse(result.stdout.trim());
    return out;
  } catch (e) {
    console.error('creditMlService parse error:', e, result.stdout);
    return null;
  }
}

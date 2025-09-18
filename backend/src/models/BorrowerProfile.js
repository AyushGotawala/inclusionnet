import pool from "../config/db.js";
import path from "path";
import fs from 'fs/promises';

export const createBorrowerKYC = async ({
  userId,
  aadhar_number,
  pan_number,
  income,
  existing_loans,
  assets,
  aadharPath,
  panPath,
}) => {
  // Fetch any existing profile to possibly remove old files
  const existing = await pool.query(
    "SELECT aadhar_image_path, pan_image_path FROM borrower_profiles WHERE user_id = $1",
    [userId]
  );

  if (existing.rows.length) {
    const prev = existing.rows[0];

    if (
      aadharPath &&
      prev.aadhar_image_path &&
      prev.aadhar_image_path !== aadharPath
    ) {
      await safeDelete(prev.aadhar_image_path);
    }

    if (panPath && prev.pan_image_path && prev.pan_image_path !== panPath) {
      await safeDelete(prev.pan_image_path);
    }
  }

  const query = `
  INSERT INTO borrower_profiles 
    (user_id, aadhar_number, pan_number, aadhar_image_path, pan_image_path, income, existing_loans, assets, kyc_status) 
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending')
  ON CONFLICT (user_id)
  DO UPDATE SET
    aadhar_number      = COALESCE(EXCLUDED.aadhar_number, borrower_profiles.aadhar_number),
    pan_number         = COALESCE(EXCLUDED.pan_number, borrower_profiles.pan_number),
    aadhar_image_path  = COALESCE(EXCLUDED.aadhar_image_path, borrower_profiles.aadhar_image_path),
    pan_image_path     = COALESCE(EXCLUDED.pan_image_path, borrower_profiles.pan_image_path),
    income             = EXCLUDED.income,
    existing_loans     = EXCLUDED.existing_loans,
    assets             = EXCLUDED.assets,
    kyc_status         = 'pending',
    updated_at         = CURRENT_TIMESTAMP
  RETURNING *;
`;

  const { rows }  = await pool.query(query, [
    userId,
    aadhar_number,
    pan_number,
    aadharPath,
    panPath,
    income || null,
    existing_loans || null,
    assets || null,
  ]);

  return rows;
};

async function safeDelete(filePath) {
  try {
    const absolute = path.resolve(filePath);
    await fs.unlink(absolute);
  } catch (e) {
    // Ignore if file doesn’t exist or cannot be deleted
    console.warn(`Could not delete file ${filePath}:`, e.message);
  }
}

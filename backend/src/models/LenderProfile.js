import pool from "../config/db.js";
import path from "path";
import fs from 'fs/promises';

export const createLenderKYC = async ({
  userId,
  aadhar_number,
  pan_number,
  aadharPath,
  panPath,
  available_funds
}) => {
  // Fetch any existing profile to possibly remove old files
  const existing = await pool.query(
    "SELECT aadhar_image_path, pan_image_path FROM lender_profiles WHERE user_id = $1",
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
    INSERT INTO lender_profiles 
      (user_id, aadhar_number, pan_number, aadhar_image_path, pan_image_path, available_funds, kyc_status) 
    VALUES ($1, $2, $3, $4, $5, $6, 'pending')
    ON CONFLICT (user_id)
    DO UPDATE SET
      aadhar_number      = COALESCE(EXCLUDED.aadhar_number, lender_profiles.aadhar_number),
      pan_number         = COALESCE(EXCLUDED.pan_number, lender_profiles.pan_number),
      aadhar_image_path  = COALESCE(EXCLUDED.aadhar_image_path, lender_profiles.aadhar_image_path),
      pan_image_path     = COALESCE(EXCLUDED.pan_image_path, lender_profiles.pan_image_path),
      available_funds    = EXCLUDED.available_funds,
      kyc_status         = 'pending',
      updated_at         = CURRENT_TIMESTAMP
    RETURNING *;
  `;

  const { rows } = await pool.query(query, [
    userId,
    aadhar_number,
    pan_number,
    aadharPath,
    panPath,
    available_funds || null
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

export const getAllPendingLenderKYC = async() =>{
  const {rows} = await pool.query("SELECT * FROM lender_profiles WHERE kyc_status = $1",['pending']);

  return rows;
}

export const updateLenderKYC = async(id,status) =>{
  const update_time = new Date(Date.now());
  console.log(id,update_time,status)
  const {rows} = await pool.query("UPDATE lender_profiles SET kyc_status = $1,updated_at = $2 WHERE id = $3 RETURNING *",
    [status,update_time,id]
  );
  return rows;
}
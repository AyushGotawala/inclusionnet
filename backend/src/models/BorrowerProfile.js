import pool from "../config/db.js";
import path from "path";
import fs from 'fs/promises';

export const createBorrowerKYC = async ({
  userId,
  full_name,
  age,
  gender,
  contact_number,
  email,
  aadhaar_number,
  pan_number,
  aadhaar_image,
  pan_image,
  employment_type,
  monthly_income,
  years_of_job_stability,
  previous_loans,
  loan_type,
  total_loan_amount_taken,
  current_outstanding_loan,
  loan_defaults_last_12_months,
  average_emi_per_month,
  missed_emi_payments,
  credit_card_repayment_behavior,
  approx_monthly_expenses,
  major_spending_categories,
  maintains_savings_monthly,
  pays_bills,
  types_of_bills,
  missed_utility_payments,
}) => {
  // Fetch any existing profile to possibly remove old files
  const existing = await pool.query(
    "SELECT aadhaar_image, pan_image FROM borrower_profiles WHERE user_id = $1",
    [userId]
  );

  if (existing.rows.length) {
    const prev = existing.rows[0];

    if (aadhaar_image && prev.aadhaar_image && prev.aadhaar_image !== aadhaar_image) {
      await safeDelete(prev.aadhaar_image);
    }

    if (pan_image && prev.pan_image && prev.pan_image !== pan_image) {
      await safeDelete(prev.pan_image);
    }
  }

  const query = `
    INSERT INTO borrower_profiles (
      user_id,
      full_name,
      age,
      gender,
      contact_number,
      email,
      aadhaar_number,
      pan_number,
      aadhaar_image,
      pan_image,
      employment_type,
      monthly_income,
      years_of_job_stability,
      previous_loans,
      loan_type,
      total_loan_amount_taken,
      current_outstanding_loan,
      loan_defaults_last_12_months,
      average_emi_per_month,
      missed_emi_payments,
      credit_card_repayment_behavior,
      approx_monthly_expenses,
      major_spending_categories,
      maintains_savings_monthly,
      pays_bills,
      types_of_bills,
      missed_utility_payments,
      kyc_status
    )
    VALUES (
      $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28
    )
    ON CONFLICT (user_id)
    DO UPDATE SET
      full_name                   = EXCLUDED.full_name,
      age                         = EXCLUDED.age,
      gender                      = EXCLUDED.gender,
      contact_number              = EXCLUDED.contact_number,
      email                       = EXCLUDED.email,
      aadhaar_number              = EXCLUDED.aadhaar_number,
      pan_number                  = EXCLUDED.pan_number,
      aadhaar_image               = COALESCE(EXCLUDED.aadhaar_image, borrower_profiles.aadhaar_image),
      pan_image                   = COALESCE(EXCLUDED.pan_image, borrower_profiles.pan_image),
      employment_type             = EXCLUDED.employment_type,
      monthly_income              = EXCLUDED.monthly_income,
      years_of_job_stability      = EXCLUDED.years_of_job_stability,
      previous_loans              = EXCLUDED.previous_loans,
      loan_type                   = EXCLUDED.loan_type,
      total_loan_amount_taken     = EXCLUDED.total_loan_amount_taken,
      current_outstanding_loan    = EXCLUDED.current_outstanding_loan,
      loan_defaults_last_12_months = EXCLUDED.loan_defaults_last_12_months,
      average_emi_per_month       = EXCLUDED.average_emi_per_month,
      missed_emi_payments         = EXCLUDED.missed_emi_payments,
      credit_card_repayment_behavior = EXCLUDED.credit_card_repayment_behavior,
      approx_monthly_expenses     = EXCLUDED.approx_monthly_expenses,
      major_spending_categories   = EXCLUDED.major_spending_categories,
      maintains_savings_monthly   = EXCLUDED.maintains_savings_monthly,
      pays_bills                  = EXCLUDED.pays_bills,
      types_of_bills              = EXCLUDED.types_of_bills,
      missed_utility_payments     = EXCLUDED.missed_utility_payments,
      kyc_status                  = 'pending',
      updated_at                  = CURRENT_TIMESTAMP
    RETURNING *;
  `;

  const values = [
    userId,
    full_name,
    age,
    gender,
    contact_number,
    email,
    aadhaar_number,
    pan_number,
    aadhaar_image,
    pan_image,
    employment_type,
    monthly_income,
    years_of_job_stability,
    previous_loans,
    loan_type,
    total_loan_amount_taken,
    current_outstanding_loan,
    loan_defaults_last_12_months,
    average_emi_per_month,
    missed_emi_payments,
    credit_card_repayment_behavior,
    approx_monthly_expenses,
    major_spending_categories,
    maintains_savings_monthly,
    pays_bills,
    types_of_bills,
    missed_utility_payments,
    'pending', // kyc_status
  ];

  const { rows } = await pool.query(query, values);
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


export const getAllPendingBorrowerKYC = async() =>{
  const {rows} = await pool.query("SELECT * FROM borrower_profiles WHERE kyc_status = $1",['pending']);

  return rows;
}

export const updateBorrowerKYC = async(id,status) =>{
  const update_time = new Date(Date.now());
  console.log(id,update_time,status)
  const {rows} = await pool.query("UPDATE borrower_profiles SET kyc_status = $1,updated_at = $2 WHERE id = $3 RETURNING *",
    [status,update_time,id]
  );
  return rows;
}
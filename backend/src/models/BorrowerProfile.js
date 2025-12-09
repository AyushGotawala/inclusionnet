import prisma from '../lib/prisma.js';
import path from "path";
import fs from "fs/promises";

function toNumber(val) {
  if (val === undefined || val === null || val === "") return null;
  const n = Number(val);
  return Number.isFinite(n) ? n : null;
}

function toBool(val) {
  if (val === undefined || val === null || val === "") return null;
  if (typeof val === "boolean") return val;
  if (typeof val === "string") {
    const s = val.toLowerCase();
    if (s === "true") return true;
    if (s === "false") return false;
  }
  return null;
}

function toStringOrJson(val) {
  if (val === undefined || val === null) return null;
  if (Array.isArray(val)) return JSON.stringify(val);
  return String(val);
}

async function safeDelete(filePath) {
  try {
    const absolute = path.resolve(filePath);
    await fs.unlink(absolute);
  } catch (e) {
    console.warn(`Could not delete file ${filePath}:`, e.message);
  }
}

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
  const existing = await prisma.borrowerProfile.findUnique({
    where: { userId },
    select: { aadhaar_image: true, pan_image: true },
  });

  if (existing) {
    if (aadhaar_image && existing.aadhaar_image && existing.aadhaar_image !== aadhaar_image) {
      await safeDelete(existing.aadhaar_image);
    }
    if (pan_image && existing.pan_image && existing.pan_image !== pan_image) {
      await safeDelete(existing.pan_image);
    }
  }

  const data = {
    userId,
    full_name: full_name ?? null,
    age: toNumber(age),
    gender: gender ?? null,
    contact_number: contact_number ?? null,
    email: email ?? null,
    aadhaar_number: aadhaar_number ?? null,
    pan_number: pan_number ?? null,
    aadhaar_image: aadhaar_image ?? null,
    pan_image: pan_image ?? null,
    employment_type: employment_type ?? null,
    monthly_income: toNumber(monthly_income),
    years_of_job_stability: toNumber(years_of_job_stability),
    previous_loans: previous_loans !== undefined ? String(previous_loans) : null,
    loan_type: loan_type ?? null,
    total_loan_amount_taken: toNumber(total_loan_amount_taken),
    current_outstanding_loan: toNumber(current_outstanding_loan),
    loan_defaults_last_12_months: toNumber(loan_defaults_last_12_months),
    average_emi_per_month: toNumber(average_emi_per_month),
    missed_emi_payments: toNumber(missed_emi_payments),
    credit_card_repayment_behavior: credit_card_repayment_behavior ?? null,
    approx_monthly_expenses: toNumber(approx_monthly_expenses),
    major_spending_categories: toStringOrJson(major_spending_categories),
    maintains_savings_monthly: toBool(maintains_savings_monthly),
    pays_bills: toBool(pays_bills),
    types_of_bills: toStringOrJson(types_of_bills),
    missed_utility_payments: toNumber(missed_utility_payments),
    kyc_status: "pending",
  };

  const record = await prisma.borrowerProfile.upsert({
    where: { userId },
    create: data,
    update: {
      ...data,
      aadhaar_image: data.aadhaar_image ?? undefined,
      pan_image: data.pan_image ?? undefined,
      updated_at: new Date(),
      kyc_status: "pending",
    },
  });

  return [record];
};

export const getAllPendingBorrowerKYC = async () => {
  const rows = await prisma.borrowerProfile.findMany({
    where: { kyc_status: "pending" },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
        }
      }
    },
    orderBy: { created_at: 'desc' }
  });
  
  // Flatten the response to include user fields directly
  return rows.map(row => ({
    ...row,
    userId: row.userId,
    email: row.email || row.user?.email || '',
    contact_number: row.contact_number || row.user?.phone || '',
    full_name: row.full_name || row.user?.name || '',
    // Ensure document paths are included
    aadhaar_image: row.aadhaar_image || '',
    pan_image: row.pan_image || '',
  }));
};

export const updateBorrowerKYC = async ({ userId, kyc_status }) => {
  const record = await prisma.borrowerProfile.update({
    where: { userId: Number(userId) },
    data: { kyc_status, updated_at: new Date() },
  });
  return [record];
};
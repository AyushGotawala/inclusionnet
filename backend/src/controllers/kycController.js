import {
  createBorrowerKYC,
  getAllPendingBorrowerKYC,
  updateBorrowerKYC,
} from "../models/BorrowerProfile.js";

export const uploadBorrowerKYC = async (req, res, next) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Destructure all incoming fields from req.body
    const {
      full_name,
      age,
      gender,
      contact_number,
      email,
      aadhaar_number,
      pan_number,
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
      major_spending_categories, // should come as array
      maintains_savings_monthly,
      pays_bills,
      types_of_bills, // should come as array
      missed_utility_payments,
    } = req.body;

    // Get uploaded files (Aadhaar and PAN) - Fixed field names
    const aadhaar_image = req.files?.["aadhar"]?.[0]?.path || null;
    const pan_image = req.files?.["pan"]?.[0]?.path || null;

    // Call your service function to create/update the KYC record
    const rows = await createBorrowerKYC({
      userId,
      full_name,
      age,
      gender,
      contact_number,
      email,
      aadhaar_number,
      aadhaar_image,
      pan_number,
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
    });

    return res.status(201).json({
      message: "Borrower KYC submitted successfully",
      rows: rows[0], 
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const uploadLenderKYC = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { aadhar_number, pan_number, available_funds } = req.body;
    const aadharPath = req.files?.["aadhar"]?.[0]?.path || null;
    const panPath = req.files?.["pan"]?.[0]?.path || null;

    const rows = await createLenderKYC({
      userId,
      aadhar_number,
      pan_number,
      aadharPath,
      panPath,
      available_funds,
    });

    return res.status(201).json({
      message: "Lenders KYC submitted successfully",
      rows: rows[0],
    });
  } catch (error) {
    return res.status(500).json({
      message: "internal server error",
      error: error.message,
    });
  }
};

export const getBorrowerKYCList = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const rows = await getAllPendingBorrowerKYC();

    return res.status(201).json({
      rows: rows[0],
    });
  } catch (error) {
    return res.status(500).json({
      message: "internal server error",
      error: error.message,
    });
  }
};

export const verifyBorrowerKYC = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { id, updatedStatus } = req.body;

    const rows = await updateBorrowerKYC(id, updatedStatus);

    if (rows.length === 0) {
      // no record updated
      return res.status(404).json({ message: "Borrower KYC Record not found" });
    }

    const { kyc_status } = rows[0];

    return res.status(200).json({
      kyc_status: kyc_status,
      rows: rows[0],
    });
  } catch (error) {
    return res.status(500).json({
      message: "internal server error",
      error: error.message,
    });
  }
};

export const getLenderKYCList = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const rows = await getAllPendingLenderKYC();

    return res.status(201).json({
      rows: rows[0],
    });
  } catch (error) {
    return res.status(500).json({
      message: "internal server error",
      error: error.message,
    });
  }
};

export const verifyLenderKYC = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { id, updatedStatus } = req.body;

    const rows = await updateLenderKYC(id, updatedStatus);

    if (rows.length === 0) {
      // no record updated
      return res.status(404).json({ message: "Lender KYC Record not found" });
    }

    const { kyc_status } = rows[0];

    return res.status(200).json({
      kyc_status: kyc_status,
      rows: rows[0],
    });
  } catch (error) {
    return res.status(500).json({
      message: "internal server error",
      error: error.message,
    });
  }
};

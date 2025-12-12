import {
  createBorrowerKYC,
  getAllPendingBorrowerKYC,
  updateBorrowerKYC,
} from "../models/BorrowerProfile.js";

import {
  createLenderKYC,
  getAllPendingLenderKYC,
  updateLenderKYC,
} from "../models/LenderProfile.js";

import prisma from '../lib/prisma.js';

export const uploadBorrowerKYC = async (req, res, next) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ 
        success: false,
        message: "Unauthorized" 
      });
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
      major_spending_categories, // should come as stringified array or array
      maintains_savings_monthly,
      pays_bills,
      types_of_bills, // should come as stringified array or array
      missed_utility_payments,
    } = req.body;

    // Parse JSON strings if they come as strings
    let parsedMajorSpendingCategories = major_spending_categories;
    if (typeof major_spending_categories === 'string') {
      try {
        parsedMajorSpendingCategories = JSON.parse(major_spending_categories);
      } catch (e) {
        parsedMajorSpendingCategories = [];
      }
    }

    let parsedTypesOfBills = types_of_bills;
    if (typeof types_of_bills === 'string') {
      try {
        parsedTypesOfBills = JSON.parse(types_of_bills);
      } catch (e) {
        parsedTypesOfBills = [];
      }
    }

    // Get uploaded files (Aadhaar and PAN) - Fixed field names
    const aadhaar_image = req.files?.["aadhar"]?.[0]?.filename || null;
    const pan_image = req.files?.["pan"]?.[0]?.filename || null;

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
      major_spending_categories: parsedMajorSpendingCategories,
      maintains_savings_monthly,
      pays_bills,
      types_of_bills: parsedTypesOfBills,
      missed_utility_payments,
    });

    return res.status(201).json({
      success: true,
      message: "Borrower KYC submitted successfully",
      data: rows[0], 
    });
  } catch (error) {
    console.error('Upload Borrower KYC Error:', error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const uploadLenderKYC = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ 
        success: false,
        message: "Unauthorized" 
      });
    }

    // Accept both spellings: aadhar_number and aadhaar_number
    const aadhar_number = req.body.aadhar_number || req.body.aadhaar_number;
    const { pan_number, available_funds, interest_rate } = req.body;
    
    // Use filename instead of path for consistency with borrower KYC
    const aadharPath = req.files?.["aadhar"]?.[0]?.filename || null;
    const panPath = req.files?.["pan"]?.[0]?.filename || null;

    console.log('📋 Lender KYC Upload:', { 
      userId, 
      aadhar_number, 
      pan_number, 
      available_funds,
      hasAadharFile: !!aadharPath,
      hasPanFile: !!panPath
    });

    const rows = await createLenderKYC({
      userId,
      aadhar_number,
      pan_number,
      aadharPath,
      panPath,
      available_funds,
      interest_rate,
    });

    return res.status(201).json({
      success: true,
      message: "Lender KYC submitted successfully",
      data: rows[0],
    });
  } catch (error) {
    console.error('Upload Lender KYC Error:', error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const getBorrowerKYCList = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ 
        success: false,
        message: "Unauthorized" 
      });
    }

    // Check if user is admin
    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({ 
        success: false,
        message: "Access denied. Admin privileges required." 
      });
    }

    const rows = await getAllPendingBorrowerKYC();

    return res.status(200).json({
      success: true,
      message: "Borrower KYC list retrieved successfully",
      data: rows,
    });
  } catch (error) {
    console.error('Get Borrower KYC List Error:', error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const verifyBorrowerKYC = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ 
        success: false,
        message: "Unauthorized" 
      });
    }

    // Check if user is admin
    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({ 
        success: false,
        message: "Access denied. Admin privileges required." 
      });
    }

    const { userId: borrowerUserId, status } = req.body;

    if (!borrowerUserId || !status) {
      return res.status(400).json({ 
        success: false,
        message: "userId and status are required" 
      });
    }

    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid status. Must be 'approved', 'rejected', or 'pending'" 
      });
    }

    const rows = await updateBorrowerKYC({ userId: borrowerUserId, kyc_status: status });

    if (!rows || rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: "Borrower KYC Record not found" 
      });
    }

    return res.status(200).json({
      success: true,
      message: "Borrower KYC status updated successfully",
      data: rows[0],
    });
  } catch (error) {
    console.error('Verify Borrower KYC Error:', error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const getLenderKYCList = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ 
        success: false,
        message: "Unauthorized" 
      });
    }

    // Check if user is admin
    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({ 
        success: false,
        message: "Access denied. Admin privileges required." 
      });
    }

    const rows = await getAllPendingLenderKYC();

    return res.status(200).json({
      success: true,
      message: "Lender KYC list retrieved successfully",
      data: rows,
    });
  } catch (error) {
    console.error('Get Lender KYC List Error:', error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const verifyLenderKYC = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ 
        success: false,
        message: "Unauthorized" 
      });
    }

    // Check if user is admin
    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({ 
        success: false,
        message: "Access denied. Admin privileges required." 
      });
    }

    const { userId: lenderUserId, status } = req.body;

    if (!lenderUserId || !status) {
      return res.status(400).json({ 
        success: false,
        message: "userId and status are required" 
      });
    }

    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid status. Must be 'approved', 'rejected', or 'pending'" 
      });
    }

    // Update lender KYC by userId directly
    const lenderProfile = await prisma.lenderProfile.findUnique({
      where: { userId: Number(lenderUserId) }
    });

    if (!lenderProfile) {
      return res.status(404).json({ 
        success: false,
        message: "Lender KYC Record not found" 
      });
    }

    const rows = await updateLenderKYC(lenderProfile.id, status);

    if (!rows || rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: "Lender KYC Record not found" 
      });
    }

    return res.status(200).json({
      success: true,
      message: "Lender KYC status updated successfully",
      data: rows[0],
    });
  } catch (error) {
    console.error('Verify Lender KYC Error:', error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get individual user's KYC status
export const getBorrowerKYCStatus = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const borrowerKYC = await prisma.borrowerProfile.findUnique({
      where: { userId },
      select: {
        kyc_status: true,
        created_at: true,
        updated_at: true,
      }
    });

    if (!borrowerKYC) {
      return res.status(200).json({
        kyc_status: "not_submitted",
        message: "KYC not submitted yet"
      });
    }

    return res.status(200).json({
      kyc_status: borrowerKYC.kyc_status,
      created_at: borrowerKYC.created_at,
      updated_at: borrowerKYC.updated_at,
    });
  } catch (error) {
    console.error('Get Borrower KYC Status Error:', error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const getLenderKYCStatus = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const lenderKYC = await prisma.lenderProfile.findUnique({
      where: { userId },
      select: {
        kyc_status: true,
        created_at: true,
        updated_at: true,
      }
    });

    if (!lenderKYC) {
      return res.status(200).json({
        kyc_status: "not_submitted",
        message: "KYC not submitted yet"
      });
    }

    return res.status(200).json({
      kyc_status: lenderKYC.kyc_status,
      created_at: lenderKYC.created_at,
      updated_at: lenderKYC.updated_at,
    });
  } catch (error) {
    console.error('Get Lender KYC Status Error:', error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get borrower profile for editing
export const getBorrowerProfile = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ 
        success: false,
        message: "Unauthorized" 
      });
    }

    const profile = await prisma.borrowerProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      // Return empty profile structure instead of 404
      // This allows frontend to show the form for creating a new profile
      return res.status(200).json({
        id: null,
        userId: userId,
        full_name: '',
        age: null,
        gender: null,
        contact_number: null,
        email: null,
        aadhaar_number: null,
        pan_number: null,
        employment_type: null,
        monthly_income: null,
        years_of_job_stability: null,
        current_outstanding_loan: null,
        average_emi_per_month: null,
        credit_card_repayment_behavior: null,
        approx_monthly_expenses: null,
        maintains_savings_monthly: false,
        pays_bills: false,
        kyc_status: 'not_submitted',
      });
    }

    return res.status(200).json(profile);
  } catch (error) {
    console.error('Get Borrower Profile Error:', error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Update borrower profile
export const updateBorrowerProfile = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

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
      current_outstanding_loan,
      average_emi_per_month,
      credit_card_repayment_behavior,
      approx_monthly_expenses,
      maintains_savings_monthly,
      pays_bills,
    } = req.body;

    // Check if full_name is provided (required field)
    if (!full_name || full_name.trim() === '') {
      return res.status(400).json({
        success: false,
        message: "Full name is required"
      });
    }

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

    // Use upsert to create if doesn't exist, or update if exists
    const updatedProfile = await prisma.borrowerProfile.upsert({
      where: { userId },
      update: {
        full_name: full_name,
        age: toNumber(age),
        gender: gender ?? null,
        contact_number: contact_number ?? null,
        email: email ?? null,
        aadhaar_number: aadhaar_number ?? null,
        pan_number: pan_number ?? null,
        employment_type: employment_type ?? null,
        monthly_income: toNumber(monthly_income),
        years_of_job_stability: toNumber(years_of_job_stability),
        current_outstanding_loan: toNumber(current_outstanding_loan),
        average_emi_per_month: toNumber(average_emi_per_month),
        credit_card_repayment_behavior: credit_card_repayment_behavior ?? null,
        approx_monthly_expenses: toNumber(approx_monthly_expenses),
        maintains_savings_monthly: toBool(maintains_savings_monthly),
        pays_bills: toBool(pays_bills),
        updated_at: new Date(),
      },
      create: {
        userId: userId,
        full_name: full_name,
        age: toNumber(age),
        gender: gender ?? null,
        contact_number: contact_number ?? null,
        email: email ?? null,
        aadhaar_number: aadhaar_number ?? null,
        pan_number: pan_number ?? null,
        employment_type: employment_type ?? null,
        monthly_income: toNumber(monthly_income),
        years_of_job_stability: toNumber(years_of_job_stability),
        current_outstanding_loan: toNumber(current_outstanding_loan),
        average_emi_per_month: toNumber(average_emi_per_month),
        credit_card_repayment_behavior: credit_card_repayment_behavior ?? null,
        approx_monthly_expenses: toNumber(approx_monthly_expenses),
        maintains_savings_monthly: toBool(maintains_savings_monthly),
        pays_bills: toBool(pays_bills),
        kyc_status: 'pending',
      },
    });

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updatedProfile,
    });
  } catch (error) {
    console.error('Update Borrower Profile Error:', error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get lender profile for editing
export const getLenderProfile = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ 
        success: false,
        message: "Unauthorized" 
      });
    }

    const profile = await prisma.lenderProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      // Return empty profile structure instead of 404
      // This allows frontend to show the form for creating a new profile
      return res.status(200).json({
        id: null,
        userId: userId,
        aadhar_number: null,
        pan_number: null,
        available_funds: null,
        kyc_status: 'not_submitted',
      });
    }

    return res.status(200).json(profile);
  } catch (error) {
    console.error('Get Lender Profile Error:', error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Update lender profile
export const updateLenderProfile = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ 
        success: false,
        message: "Unauthorized" 
      });
    }

    const {
      aadhar_number,
      pan_number,
      available_funds,
    } = req.body;

    function toNumber(val) {
      if (val === undefined || val === null || val === "") return null;
      const n = Number(val);
      return Number.isFinite(n) ? n : null;
    }

    // Use upsert to create if doesn't exist, or update if exists
    const updatedProfile = await prisma.lenderProfile.upsert({
      where: { userId },
      update: {
        aadhar_number: aadhar_number !== undefined ? (aadhar_number || null) : undefined,
        pan_number: pan_number !== undefined ? (pan_number || null) : undefined,
        available_funds: available_funds !== undefined ? toNumber(available_funds) : undefined,
        updated_at: new Date(),
      },
      create: {
        userId: userId,
        aadhar_number: aadhar_number || null,
        pan_number: pan_number || null,
        available_funds: toNumber(available_funds) ?? null,
        kyc_status: 'pending',
      },
    });

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updatedProfile,
    });
  } catch (error) {
    console.error('Update Lender Profile Error:', error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

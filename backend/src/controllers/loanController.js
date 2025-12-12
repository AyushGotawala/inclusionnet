import {
  createLoanApplication,
  getBorrowerLoanApplications,
  getAllLoanApplications,
  getLoanApplicationById,
  updateLoanApplicationStatus,
  hasPendingLoanApplications,
} from '../models/LoanApplication.js';
import prisma from '../lib/prisma.js';
import { calculateMaxLoanAmount, calculateDTI, getDTIRiskLevel, calculateEMI } from '../utils/loanEligibility.js';
import { getMatchingLendersForLoan, getMatchingLoansForLender } from '../utils/loanMatching.js';

/**
 * Submit a new loan application
 */
export const submitLoanApplication = async (req, res, next) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    // Check if user has a borrower profile
    const borrowerProfile = await prisma.borrowerProfile.findUnique({
      where: { userId },
    });

    if (!borrowerProfile) {
      return res.status(400).json({
        success: false,
        message: 'Borrower profile not found. Please complete KYC first.',
      });
    }

    // Check if KYC is approved
    if (borrowerProfile.kyc_status !== 'approved') {
      return res.status(400).json({
        success: false,
        message: 'KYC must be approved before submitting a loan application.',
      });
    }

    // Check if borrower has any pending loan applications
    const hasPendingLoans = await hasPendingLoanApplications(borrowerProfile.id);
    if (hasPendingLoans) {
      return res.status(400).json({
        success: false,
        message: 'You cannot apply for a new loan while you have pending loan applications. Please wait for your existing applications to be reviewed.',
      });
    }

    const {
      loanAmount,
      loanPurpose,
      loanTenureMonths,
    } = req.body;

    // Validate that all required fields are present
    if (!loanAmount || !loanPurpose || !loanTenureMonths) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: loanAmount, loanPurpose, loanTenureMonths',
      });
    }

    // Calculate maximum eligible loan amount using FOIR rule
    const monthlyIncome = borrowerProfile.monthly_income || 0;
    const existingEMI = borrowerProfile.average_emi_per_month || 0;
    const tenureMonths = Number(loanTenureMonths);
    const requestedLoanAmount = Number(loanAmount);
    const riskCategory = borrowerProfile.creditScore ? 
      (borrowerProfile.creditScore >= 750 ? 'Low' : 
       borrowerProfile.creditScore >= 650 ? 'Medium' : 'High') : null;

    const maxEligibleLoan = calculateMaxLoanAmount(
      monthlyIncome,
      existingEMI,
      tenureMonths,
      12, // 12% annual interest rate
      0.40, // 40% FOIR
      riskCategory
    );

    // Check if requested loan amount exceeds eligibility
    if (requestedLoanAmount > maxEligibleLoan) {
      return res.status(400).json({
        success: false,
        message: `Loan amount exceeds your eligibility. Maximum eligible loan amount: ₹${maxEligibleLoan.toLocaleString('en-IN')}`,
        maxEligibleLoan,
        requestedLoanAmount,
      });
    }

    // Calculate DTI for risk assessment
    const totalMonthlyDebt = existingEMI + (requestedLoanAmount > 0 ? 
      calculateEMI(requestedLoanAmount, tenureMonths) : 0);
    const dti = calculateDTI(totalMonthlyDebt, monthlyIncome);
    const dtiRiskLevel = getDTIRiskLevel(dti);

    // Warn if DTI is high (but don't block)
    if (dtiRiskLevel === 'high') {
      console.warn(`High DTI detected for borrower ${borrowerProfile.id}: ${dti.toFixed(2)}%`);
    }

    const application = await createLoanApplication({
      borrowerId: borrowerProfile.id,
      loanAmount: requestedLoanAmount,
      loanPurpose: String(loanPurpose).trim(),
      loanTenureMonths: tenureMonths,
    });

    return res.status(201).json({
      success: true,
      message: 'Loan application submitted successfully',
      data: application,
    });
  } catch (error) {
    console.error('Submit Loan Application Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

/**
 * Get all loan applications for the logged-in borrower
 */
export const getMyLoanApplications = async (req, res, next) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const borrowerProfile = await prisma.borrowerProfile.findUnique({
      where: { userId },
    });

    if (!borrowerProfile) {
      return res.status(404).json({
        success: false,
        message: 'Borrower profile not found',
      });
    }

    const applications = await getBorrowerLoanApplications(borrowerProfile.id);

    return res.status(200).json({
      success: true,
      data: applications,
    });
  } catch (error) {
    console.error('Get My Loan Applications Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

/**
 * Get all loan applications (Admin only)
 */
export const getAllApplications = async (req, res, next) => {
  try {
    const { status } = req.query;

    const filters = {};
    if (status) {
      filters.status = status;
    }

    const applications = await getAllLoanApplications(filters);

    return res.status(200).json({
      success: true,
      data: applications,
    });
  } catch (error) {
    console.error('Get All Loan Applications Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

/**
 * Get a single loan application by ID
 */
export const getApplicationById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const application = await getLoanApplicationById(Number(id));

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Loan application not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: application,
    });
  } catch (error) {
    console.error('Get Loan Application Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

/**
 * Update loan application status (Admin only)
 */
export const updateApplicationStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, adminRemarks, creditScore } = req.body;

    // Validate status
    const validStatuses = ['PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const application = await updateLoanApplicationStatus({
      applicationId: Number(id),
      status,
      adminRemarks,
      creditScore,
    });

    return res.status(200).json({
      success: true,
      message: 'Loan application updated successfully',
      data: application,
    });
  } catch (error) {
    console.error('Update Loan Application Error:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Loan application not found',
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

/**
 * Get matching lenders for a borrower's loan application
 */
export const getMatchingLenders = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const { loanApplicationId } = req.params;
    const { take, cursorId, maxInterestRate } = req.query;

    console.log('📋 Get Matching Lenders Request:', {
      userId,
      loanApplicationId,
      take,
      cursorId,
      maxInterestRate,
    });

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    if (!loanApplicationId) {
      return res.status(400).json({
        success: false,
        message: 'Loan application ID is required',
      });
    }

    // Verify the loan application belongs to the borrower
    const loan = await prisma.loanApplication.findUnique({
      where: { id: Number(loanApplicationId) },
      include: {
        borrower: {
          select: { userId: true },
        },
      },
    });

    if (!loan) {
      console.log('❌ Loan application not found:', loanApplicationId);
      return res.status(404).json({
        success: false,
        message: 'Loan application not found',
      });
    }

    if (loan.borrower.userId !== userId) {
      console.log('❌ Unauthorized access attempt:', { loanUserId: loan.borrower.userId, requestUserId: userId });
      return res.status(403).json({
        success: false,
        message: 'You can only view matches for your own loan applications',
      });
    }

    console.log('✅ Fetching matching lenders for loan:', loanApplicationId);
    const result = await getMatchingLendersForLoan({
      loanApplicationId: Number(loanApplicationId),
      take: take ? Number(take) : 10,
      cursorId: cursorId ? Number(cursorId) : undefined,
      maxInterestRate: maxInterestRate ? Number(maxInterestRate) : undefined,
    });

    console.log('✅ Matching lenders found:', result.items?.length || 0);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('❌ Get Matching Lenders Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

/**
 * Get matching loan applications for a lender
 */
export const getMatchingLoans = async (req, res, next) => {
  try {
    const userId = req.user?.id;

    console.log('📋 Get Matching Loans Request:', {
      userId,
      query: req.query,
    });

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    // Get lender profile
    const lenderProfile = await prisma.lenderProfile.findUnique({
      where: { userId },
    });

    if (!lenderProfile) {
      console.log('❌ Lender profile not found for userId:', userId);
      return res.status(404).json({
        success: false,
        message: 'Lender profile not found. Please complete KYC first.',
      });
    }

    console.log('✅ Lender profile found:', {
      id: lenderProfile.id,
      available_funds: lenderProfile.available_funds,
      kyc_status: lenderProfile.kyc_status,
    });

    const { take, cursorId, minCreditScore, maxTenureMonths, minTenureMonths } = req.query;

    console.log('📋 Query params:', { take, cursorId, minCreditScore, maxTenureMonths, minTenureMonths });

    const result = await getMatchingLoansForLender({
      lenderId: lenderProfile.id,
      take: take ? Number(take) : 10,
      cursorId: cursorId ? Number(cursorId) : undefined,
      minCreditScore: minCreditScore && !isNaN(Number(minCreditScore)) ? Number(minCreditScore) : undefined,
      maxTenureMonths: maxTenureMonths && !isNaN(Number(maxTenureMonths)) ? Number(maxTenureMonths) : undefined,
      minTenureMonths: minTenureMonths && !isNaN(Number(minTenureMonths)) ? Number(minTenureMonths) : undefined,
    });

    console.log('✅ Matching loans found:', result.items?.length || 0);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('❌ Get Matching Loans Error:', error);
    console.error('❌ Error stack:', error.stack);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

/**
 * Get borrower profile for lenders (with loan statistics)
 */
export const getBorrowerProfileForLender = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const { borrowerId } = req.params;

    console.log('📋 Get Borrower Profile for Lender:', { userId, borrowerId });

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    // Verify user is a lender
    const lenderProfile = await prisma.lenderProfile.findUnique({
      where: { userId },
    });

    if (!lenderProfile) {
      return res.status(403).json({
        success: false,
        message: 'Only lenders can view borrower profiles',
      });
    }

    // Get borrower profile
    const borrowerProfile = await prisma.borrowerProfile.findUnique({
      where: { id: Number(borrowerId) },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            createdAt: true,
          },
        },
        loanApplications: {
          select: {
            id: true,
            loanAmount: true,
            loanPurpose: true,
            loanTenureMonths: true,
            status: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!borrowerProfile) {
      return res.status(404).json({
        success: false,
        message: 'Borrower profile not found',
      });
    }

    // Calculate loan statistics
    const totalLoans = borrowerProfile.loanApplications.length;
    const activeLoans = borrowerProfile.loanApplications.filter(
      loan => loan.status === 'PENDING' || loan.status === 'APPROVED'
    ).length;
    const totalLoanAmount = borrowerProfile.loanApplications.reduce(
      (sum, loan) => sum + loan.loanAmount, 0
    );
    const pendingLoans = borrowerProfile.loanApplications.filter(
      loan => loan.status === 'PENDING'
    ).length;

    // Mask sensitive information (don't expose Aadhaar/PAN numbers)
    const profileData = {
      id: borrowerProfile.id,
      full_name: borrowerProfile.full_name,
      age: borrowerProfile.age,
      gender: borrowerProfile.gender,
      contact_number: borrowerProfile.contact_number,
      email: borrowerProfile.email || borrowerProfile.user?.email,
      employment_type: borrowerProfile.employment_type,
      monthly_income: borrowerProfile.monthly_income,
      years_of_job_stability: borrowerProfile.years_of_job_stability,
      creditScore: borrowerProfile.creditScore,
      kyc_status: borrowerProfile.kyc_status,
      created_at: borrowerProfile.created_at,
      // Loan statistics
      loanStatistics: {
        totalLoans,
        activeLoans,
        pendingLoans,
        totalLoanAmount,
        completedLoans: borrowerProfile.loanApplications.filter(
          loan => loan.status === 'APPROVED'
        ).length,
      },
      // Recent loan applications (last 5)
      recentLoans: borrowerProfile.loanApplications.slice(0, 5),
    };

    return res.status(200).json({
      success: true,
      data: profileData,
    });
  } catch (error) {
    console.error('❌ Get Borrower Profile for Lender Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

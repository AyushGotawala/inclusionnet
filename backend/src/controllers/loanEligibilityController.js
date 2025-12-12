import prisma from '../lib/prisma.js';
import { calculateMaxLoanAmount, calculateDTI, getDTIRiskLevel, calculateEMI } from '../utils/loanEligibility.js';

/**
 * Get loan eligibility for the logged-in borrower
 */
export const getLoanEligibility = async (req, res, next) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    // Get borrower profile
    const borrowerProfile = await prisma.borrowerProfile.findUnique({
      where: { userId },
    });

    if (!borrowerProfile) {
      return res.status(404).json({
        success: false,
        message: 'Borrower profile not found. Please complete KYC first.',
      });
    }

    // Check if KYC is approved
    if (borrowerProfile.kyc_status !== 'approved') {
      return res.status(400).json({
        success: false,
        message: 'KYC must be approved to check loan eligibility.',
      });
    }

    const monthlyIncome = borrowerProfile.monthly_income || 0;
    const existingEMI = borrowerProfile.average_emi_per_month || 0;

    // If no monthly income, return zero eligibility
    if (monthlyIncome <= 0) {
      return res.status(200).json({
        success: true,
        data: {
          maxEligibleLoan: 0,
          monthlyIncome,
          existingEMI,
          message: 'Please update your monthly income in your profile to check eligibility.',
        },
      });
    }

    // Calculate eligibility for different tenures (6, 12, 24, 36, 48, 60 months)
    const tenures = [6, 12, 24, 36, 48, 60];
    const eligibilityByTenure = {};

    // Determine risk category based on credit score if available
    const riskCategory = borrowerProfile.creditScore ? 
      (borrowerProfile.creditScore >= 750 ? 'Low' : 
       borrowerProfile.creditScore >= 650 ? 'Medium' : 'High') : null;

    tenures.forEach(tenure => {
      const maxLoan = calculateMaxLoanAmount(
        monthlyIncome,
        existingEMI,
        tenure,
        12, // 12% annual interest rate
        0.40, // 40% FOIR
        riskCategory
      );
      
      // Cap at maximum allowed loan amount of ₹5,00,000
      const cappedMaxLoan = Math.min(maxLoan, 500000);

      eligibilityByTenure[tenure] = {
        maxEligibleLoan: cappedMaxLoan,
        tenureMonths: tenure,
        estimatedEMI: cappedMaxLoan > 0 ? calculateEMI(cappedMaxLoan, tenure) : 0,
      };
    });

    // Calculate DTI
    const dti = calculateDTI(existingEMI, monthlyIncome);
    const dtiRiskLevel = getDTIRiskLevel(dti);

    // Get maximum eligible loan for 24 months (most common tenure)
    const maxEligibleLoan24Months = eligibilityByTenure[24]?.maxEligibleLoan || 0;

    return res.status(200).json({
      success: true,
      data: {
        maxEligibleLoan: maxEligibleLoan24Months, // Default to 24 months
        monthlyIncome,
        existingEMI,
        dti: parseFloat(dti.toFixed(2)),
        dtiRiskLevel,
        creditScore: borrowerProfile.creditScore || null,
        riskCategory,
        eligibilityByTenure,
        message: maxEligibleLoan24Months > 0 
          ? `You are eligible for a loan up to ₹${maxEligibleLoan24Months.toLocaleString('en-IN')}`
          : 'You are not currently eligible for a loan. Please update your income or reduce existing EMIs.',
      },
    });
  } catch (error) {
    console.error('Get Loan Eligibility Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};


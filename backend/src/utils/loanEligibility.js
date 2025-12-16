/**
 * Calculate Maximum Loan Amount based on FOIR (Fixed Obligations to Income Ratio)
 * 
 * Formula:
 * - Max EMI = (Monthly Income * FOIR) - Existing EMI
 * - Convert EMI to Loan Amount using reverse EMI formula
 * 
 * @param {number} monthlyIncome - Borrower's monthly income
 * @param {number} existingEMI - Existing EMI payments (default: 0)
 * @param {number} tenureMonths - Loan tenure in months
 * @param {number} annualInterestRate - Annual interest rate (default: 12%)
 * @param {number} foir - FOIR percentage (default: 0.40 = 40%)
 * @param {string} riskCategory - Risk category (Low, Medium, High) for multiplier
 * @returns {number} Maximum eligible loan amount
 */
export function calculateMaxLoanAmount(
  monthlyIncome,
  existingEMI = 0,
  tenureMonths,
  annualInterestRate = 12,
  foir = 0.40,
  riskCategory = null
) {
  // Validate inputs
  if (!monthlyIncome || monthlyIncome <= 0) {
    return 0;
  }

  if (!tenureMonths || tenureMonths <= 0) {
    return 0;
  }

  // Calculate maximum affordable EMI using FOIR
  const maxAffordableEMI = (monthlyIncome * foir) - (existingEMI || 0);

  // If max EMI is negative or zero, borrower is not eligible
  if (maxAffordableEMI <= 0) {
    return 0;
  }

  // Calculate monthly interest rate
  const R = (annualInterestRate / 12) / 100; // monthly rate as decimal

  // Calculate maximum loan amount using reverse EMI formula
  // P = EMI * ((1+R)^N - 1) / (R * (1+R)^N)
  const N = tenureMonths;
  const numerator = maxAffordableEMI * (Math.pow(1 + R, N) - 1);
  const denominator = R * Math.pow(1 + R, N);

  let maxLoanAmount = numerator / denominator;

  // Apply risk-based multiplier if risk category is provided
  if (riskCategory) {
    const riskMultipliers = {
      'Low': 1.2,
      'low': 1.2,
      'Medium': 1.0,
      'medium': 1.0,
      'High': 0.7,
      'high': 0.7,
    };

    const multiplier = riskMultipliers[riskCategory] || 1.0;
    maxLoanAmount = maxLoanAmount * multiplier;
  }

  // Cap at maximum allowed loan amount of ₹5,00,000
  // Return floor value (round down to nearest integer)
  return Math.min(Math.floor(maxLoanAmount), 500000);
}

/**
 * Calculate Debt-to-Income Ratio (DTI)
 * 
 * @param {number} totalMonthlyDebt - Total monthly debt payments
 * @param {number} monthlyIncome - Monthly income
 * @returns {number} DTI as percentage (0-100)
 */
export function calculateDTI(totalMonthlyDebt, monthlyIncome) {
  if (!monthlyIncome || monthlyIncome <= 0) {
    return 0;
  }

  return (totalMonthlyDebt / monthlyIncome) * 100;
}

/**
 * Get DTI risk level
 * 
 * @param {number} dti - Debt-to-Income ratio percentage
 * @returns {string} Risk level: 'safe', 'moderate', 'high'
 */
export function getDTIRiskLevel(dti) {
  if (dti < 35) {
    return 'safe';
  } else if (dti <= 45) {
    return 'moderate';
  } else {
    return 'high';
  }
}

/**
 * Calculate estimated EMI for a given loan amount
 * 
 * @param {number} loanAmount - Loan principal
 * @param {number} tenureMonths - Loan tenure in months
 * @param {number} annualInterestRate - Annual interest rate (default: 12%)
 * @returns {number} Estimated monthly EMI
 */
export function calculateEMI(loanAmount, tenureMonths, annualInterestRate = 12) {
  if (!loanAmount || loanAmount <= 0 || !tenureMonths || tenureMonths <= 0) {
    return 0;
  }

  const R = (annualInterestRate / 12) / 100; // monthly rate
  const N = tenureMonths;

  const emi = (loanAmount * R * Math.pow(1 + R, N)) / (Math.pow(1 + R, N) - 1);

  return Math.ceil(emi); // Round up to nearest integer
}


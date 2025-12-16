import { body, validationResult } from "express-validator";

/**
 * Validator for loan application submission
 */
export const loanApplicationValidator = [
  // Loan Amount - required, must be between 10,000 and 5,00,000
  body('loanAmount')
    .notEmpty().withMessage('Loan amount is required')
    .isInt({ min: 10000, max: 500000 })
    .withMessage('Loan amount must be between ₹10,000 and ₹5,00,000')
    .toInt(),

  // Loan Purpose - required, minimum 10 characters, maximum 500 characters
  body('loanPurpose')
    .notEmpty().withMessage('Loan purpose is required')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Loan purpose must be between 10 and 500 characters')
    .matches(/^[a-zA-Z0-9\s.,!?()-]+$/)
    .withMessage('Loan purpose contains invalid characters'),

  // Loan Tenure - required, must be between 6 and 60 months
  body('loanTenureMonths')
    .notEmpty().withMessage('Loan tenure is required')
    .isInt({ min: 6, max: 60 })
    .withMessage('Loan tenure must be between 6 and 60 months')
    .toInt(),

  // Validation result handler
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(err => ({
        field: err.path || err.param,
        message: err.msg,
        value: err.value
      }));
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errorMessages
      });
    }
    next();
  }
];

/**
 * Validator for updating loan application status (Admin)
 */
export const updateLoanStatusValidator = [
  // Status - required, must be valid LoanStatus enum value
  body('status')
    .optional()
    .isIn(['PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'])
    .withMessage('Status must be one of: PENDING, UNDER_REVIEW, APPROVED, REJECTED'),

  // Admin Remarks - optional, max 1000 characters
  body('adminRemarks')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Admin remarks cannot exceed 1000 characters'),

  // Credit Score - optional, must be between 300 and 900
  body('creditScore')
    .optional()
    .isInt({ min: 300, max: 900 })
    .withMessage('Credit score must be between 300 and 900')
    .toInt(),

  // Validation result handler
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(err => ({
        field: err.path || err.param,
        message: err.msg,
        value: err.value
      }));
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errorMessages
      });
    }
    
    // Check if at least one field is provided for update
    const { status, adminRemarks, creditScore } = req.body;
    if (!status && !adminRemarks && creditScore === undefined) {
      return res.status(400).json({
        success: false,
        message: 'At least one field (status, adminRemarks, or creditScore) must be provided for update'
      });
    }
    
    next();
  }
];


import { body, validationResult } from "express-validator";

const aadhaarRegex = /^\d{12}$/;
const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

export const borrowerKycValidator = [
  // Personal Info
  body("full_name")
    .notEmpty().withMessage("Full name is required")
    .isLength({ max: 100 }).withMessage("Full name cannot exceed 100 characters"),

  body("age")
    .isInt({ min: 18, max: 100 }).withMessage("Age must be between 18 and 100"),

  body("gender")
    .isIn(["male", "female", "other", "Male", "Female", "Other"]).withMessage("Gender must be male, female, or other"),

  body("contact_number")
    .isMobilePhone("en-IN").withMessage("Invalid contact number"),

  body("email")
    .isEmail().withMessage("Invalid email address"),

  // Aadhaar & PAN
  body("aadhaar_number")
    .matches(aadhaarRegex).withMessage("Invalid Aadhaar number (must be 12 digits)"),

  body("pan_number")
    .matches(panRegex).withMessage("Invalid PAN number (e.g. ABCDE1234F)"),

  body("aadhaar_image").custom((value, { req }) => {
    if (!req.files || !req.files["aadhar"]) {
      throw new Error("Aadhaar file is required");
    }
    return true;
  }),

  body("pan_image").custom((value, { req }) => {
    if (!req.files || !req.files["pan"]) {
      throw new Error("PAN file is required");
    }
    return true;
  }),

  // Employment Info
  body("employment_type")
    .isIn(["salaried", "self_employed", "business_owner", "freelancer", "unemployed", "Salaried", "Self-employed", "Self_employed", "Business Owner", "Freelancer", "Unemployed"])
    .withMessage("Employment type must be salaried, self_employed, business_owner, freelancer, or unemployed"),

  body("monthly_income")
    .isNumeric().withMessage("Monthly income must be numeric")
    .custom(val => Number(val) > 0).withMessage("Monthly income must be greater than 0"),

  body("years_of_job_stability")
    .isInt({ min: 0 }).withMessage("Years of job stability must be 0 or greater"),

  // Loan & Credit History
  body("previous_loans")
    .optional()
    .custom((val) => {
      if (val === undefined || val === null || val === '') return true;
      if (typeof val === 'boolean') return true;
      if (typeof val === 'string') {
        const lower = val.toLowerCase();
        return lower === 'true' || lower === 'false' || lower === 'yes' || lower === 'no';
      }
      return false;
    })
    .withMessage("Previous loans must be true, false, yes, or no"),

  body("loan_type")
    .optional()
    .custom((val) => {
      if (val === undefined || val === null || val === '') return true;
      return ["personal", "education", "home", "credit_card", "none", "Personal", "Education", "Home", "Credit Card", "None"].includes(val);
    })
    .withMessage("Invalid loan type. Must be personal, education, home, credit_card, or none"),

  body("total_loan_amount_taken")
    .optional()
    .custom((val) => {
      if (val === undefined || val === null || val === '') return true;
      return !isNaN(Number(val)) && Number(val) >= 0;
    })
    .withMessage("Total loan amount must be numeric and >= 0"),

  body("current_outstanding_loan")
    .optional()
    .custom((val) => {
      if (val === undefined || val === null || val === '') return true;
      return !isNaN(Number(val)) && Number(val) >= 0;
    })
    .withMessage("Current outstanding loan must be numeric and >= 0"),

  body("loan_defaults_last_12_months")
    .optional()
    .custom((val) => {
      if (val === undefined || val === null || val === '') return true;
      if (typeof val === 'boolean') return true;
      if (typeof val === 'string') {
        const lower = val.toLowerCase();
        return lower === 'true' || lower === 'false' || lower === 'yes' || lower === 'no';
      }
      return false;
    })
    .withMessage("Loan defaults must be true, false, yes, or no"),

  body("average_emi_per_month")
    .optional()
    .custom((val) => {
      if (val === undefined || val === null || val === '') return true;
      return !isNaN(Number(val)) && Number(val) >= 0;
    })
    .withMessage("Average EMI must be numeric and >= 0"),

  body("missed_emi_payments")
    .optional()
    .custom((val) => {
      if (val === undefined || val === null || val === '') return true;
      if (typeof val === 'boolean') return true;
      if (typeof val === 'string') {
        const lower = val.toLowerCase();
        return lower === 'true' || lower === 'false' || lower === 'yes' || lower === 'no';
      }
      return false;
    })
    .withMessage("Missed EMI payments must be true, false, yes, or no"),

  body("credit_card_repayment_behavior")
    .optional()
    .isIn(["always_full", "minimum", "partial", "no_credit_card", "Full", "Minimum", "Late", "Always pay full amount", "Pay minimum amount", "Pay partial amount", "No credit card"])
    .withMessage("Credit card repayment behavior must be always_full, minimum, partial, or no_credit_card"),

  // Spending & Expenses
  body("approx_monthly_expenses")
    .optional()
    .custom((val) => {
      if (val === undefined || val === null || val === '') return true;
      return !isNaN(Number(val)) && Number(val) >= 0;
    })
    .withMessage("Monthly expenses must be numeric and >= 0"),

  body("major_spending_categories")
    .optional()
    .custom((val) => {
      if (val === undefined || val === null || val === '') return true;
      if (typeof val === 'string') {
        try {
          const parsed = JSON.parse(val);
          return Array.isArray(parsed);
        } catch {
          return false;
        }
      }
      return Array.isArray(val);
    })
    .withMessage("Major spending categories must be an array"),

  body("maintains_savings_monthly")
    .optional()
    .custom((val) => {
      if (val === undefined || val === null || val === '') return true;
      if (typeof val === 'boolean') return true;
      if (typeof val === 'string') {
        const lower = val.toLowerCase();
        return lower === 'true' || lower === 'false' || lower === 'yes' || lower === 'no';
      }
      return false;
    })
    .withMessage("Maintains savings must be true or false"),

  // Utility Payments
  body("pays_bills")
    .optional()
    .custom((val) => {
      if (val === undefined || val === null || val === '') return true;
      if (typeof val === 'boolean') return true;
      if (typeof val === 'string') {
        const lower = val.toLowerCase();
        return lower === 'true' || lower === 'false' || lower === 'yes' || lower === 'no';
      }
      return false;
    })
    .withMessage("Pays bills must be true or false"),

  body("types_of_bills")
    .optional()
    .custom((val) => {
      if (val === undefined || val === null || val === '') return true;
      if (typeof val === 'string') {
        try {
          const parsed = JSON.parse(val);
          return Array.isArray(parsed);
        } catch {
          return false;
        }
      }
      return Array.isArray(val);
    })
    .withMessage("Types of bills must be an array"),

  body("missed_utility_payments")
    .optional()
    .custom((val) => {
      if (val === undefined || val === null || val === '') return true;
      // Handle number (from form input)
      if (typeof val === 'number') {
        return Number.isInteger(val) && val >= 0;
      }
      // Handle string numbers
      if (typeof val === 'string') {
        const trimmed = val.trim();
        if (trimmed === '') return true;
        const num = Number(trimmed);
        if (!isNaN(num) && Number.isInteger(num) && num >= 0) return true;
        // Also accept boolean strings
        const lower = trimmed.toLowerCase();
        if (lower === 'true' || lower === 'false' || lower === 'yes' || lower === 'no') return true;
      }
      // Handle boolean
      if (typeof val === 'boolean') return true;
      return false;
    })
    .withMessage("Missed utility payments must be a number >= 0"),

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


export const lenderKYCValidator = [
  // Available Funds - make optional and handle empty strings
  body("available_funds")
    .optional({ values: 'falsy' })
    .custom((val) => {
      if (val === '' || val === null || val === undefined) return true;
      const num = Number(val);
      return !isNaN(num) && num >= 0;
    }).withMessage("Available funds must be numeric and >= 0"),

  // Aadhaar Number - accept both spellings
  body("aadhar_number")
    .optional()
    .matches(aadhaarRegex).withMessage("Invalid Aadhaar number (must be 12 digits)"),
  body("aadhaar_number")
    .optional()
    .matches(aadhaarRegex).withMessage("Invalid Aadhaar number (must be 12 digits)"),

  // PAN Number
  body("pan_number")
    .matches(panRegex).withMessage("Invalid PAN number (e.g. ABCDE1234F)"),

  // Aadhaar File
  body("aadhar").custom((value, { req }) => {
    if (!req.files || !req.files["aadhar"]) {
      throw new Error("Aadhaar file is required");
    }
    return true;
  }),

  // PAN File
  body("pan").custom((value, { req }) => {
    if (!req.files || !req.files["pan"]) {
      throw new Error("PAN file is required");
    }
    return true;
  }),
  (req,res,next)=>{

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

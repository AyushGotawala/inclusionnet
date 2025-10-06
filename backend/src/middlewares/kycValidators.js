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
    .isIn(["Male", "Female", "Other"]).withMessage("Gender must be Male, Female, or Other"),

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
    .isIn(["Salaried", "Self-employed", "Student", "Unemployed"])
    .withMessage("Employment type must be Salaried, Self-employed, Student, or Unemployed"),

  body("monthly_income")
    .isNumeric().withMessage("Monthly income must be numeric")
    .custom(val => Number(val) > 0).withMessage("Monthly income must be greater than 0"),

  body("years_of_job_stability")
    .isInt({ min: 0 }).withMessage("Years of job stability must be 0 or greater"),

  // Loan & Credit History
  body("previous_loans")
    .isBoolean().withMessage("Previous loans must be true or false"),

  body("loan_type")
    .optional()
    .isIn(["Personal", "Education", "Home", "Credit Card", "None"])
    .withMessage("Invalid loan type"),

  body("total_loan_amount_taken")
    .optional()
    .isNumeric().withMessage("Total loan amount must be numeric")
    .custom(val => Number(val) >= 0).withMessage("Total loan amount cannot be negative"),

  body("current_outstanding_loan")
    .optional()
    .isNumeric().withMessage("Current outstanding loan must be numeric")
    .custom(val => Number(val) >= 0).withMessage("Current outstanding loan cannot be negative"),

  body("loan_defaults_last_12_months")
    .isBoolean().withMessage("Loan defaults last 12 months must be true or false"),

  body("average_emi_per_month")
    .optional()
    .isNumeric().withMessage("Average EMI must be numeric")
    .custom(val => Number(val) >= 0).withMessage("Average EMI cannot be negative"),

  body("missed_emi_payments")
    .isBoolean().withMessage("Missed EMI payments must be true or false"),

  body("credit_card_repayment_behavior")
    .isIn(["Full", "Minimum", "Late"])
    .withMessage("Credit card repayment behavior must be Full, Minimum, or Late"),

  // Spending & Expenses
  body("approx_monthly_expenses")
    .isIn(["<₹20k", "₹20–50k", "₹50–100k", ">₹100k"])
    .withMessage("Invalid monthly expenses range"),

  body("major_spending_categories")
    .isArray({ min: 1 }).withMessage("At least one spending category is required"),

  body("maintains_savings_monthly")
    .isBoolean().withMessage("Maintains savings must be true or false"),

  // Utility Payments
  body("pays_bills")
    .isBoolean().withMessage("Pays bills must be true or false"),

  body("types_of_bills")
    .optional()
    .isArray().withMessage("Types of bills must be an array"),

  body("missed_utility_payments")
    .isBoolean().withMessage("Missed utility payments must be true or false"),

  // Validation result handler
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];


export const lenderKYCValidator = [
  // Available Funds
  body("available_funds")
    .isNumeric().withMessage("Available funds must be numeric")
    .custom((val) => Number(val) >= 0).withMessage("Available funds must be >= 0"),

  // Aadhaar Number
  body("aadhar_number")
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

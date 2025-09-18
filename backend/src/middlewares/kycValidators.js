import { body, validationResult } from "express-validator"

// Aadhaar & PAN regex
const aadhaarRegex = /^\d{12}$/;
const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

export const borrowerKycValidator = [
  // Income
  body("income")
    .isNumeric().withMessage("Income must be numeric")
    .custom((val) => Number(val) > 0).withMessage("Income must be greater than 0"),

  // Existing loans
  body("existing_loans")
    .isNumeric().withMessage("Existing loans must be numeric")
    .custom((val) => Number(val) >= 0).withMessage("Existing loans must be >= 0"),

  // Assets
  body("assets")
    .isNumeric().withMessage("Assets must be numeric")
    .custom((val) => Number(val) >= 0).withMessage("Assets must be >= 0"),

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

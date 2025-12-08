import { body ,validationResult } from "express-validator";

const namePattern = /^[a-zA-Z\s.-]{2,50}$/;
const passwordPattern = /^.{6,20}$/; // Simplified for now

const phoneRegex = /^[6-9]\d{9}$/; // Indian numbers

export const validateSignUp = [
    body('name')
    .notEmpty().withMessage('Name is required')
    .isLength({min:2}).withMessage('Name must be at least 2 characters')
    .matches(namePattern).withMessage('Please Enter Valid name'),
    body('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please Enter Valide Email'),
    body("phone")
    .notEmpty().withMessage('phone is required')
    .matches(phoneRegex).withMessage("Invalid phone number"),
    body('password')
    .notEmpty().withMessage('Password is Required')
    .isLength({min : 6}).withMessage('Password must be at least 6 characters')
    .matches(passwordPattern).withMessage('Password must be 6-20 characters'),
    body('role')
    .notEmpty().withMessage('Role is Required')
    .isIn(['BORROWER', 'LENDER', 'ADMIN'])
    .withMessage('Role must be BORROWER, LENDER, or ADMIN'),
    (req,res,next)=>{
        const errors = validationResult(req);
        
        if(!errors.isEmpty()){
            return res.status(422).json({ errors: errors.array() });
        }
        next();
    }
]

export const validateLogin = [
    body('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please Enter Valide Email'),
    body('password')
    .notEmpty().withMessage('Password is Required')
    .isLength({min : 6}).withMessage('Password must be at least 6 characters')
    .matches(passwordPattern).withMessage('Password must be 6-20 characters'),
    (req,res,next)=>{
        const errors = validationResult(req);
        
        if(!errors.isEmpty()){
            return res.status(422).json({ errors: errors.array() });
        }
        next();
    }
]
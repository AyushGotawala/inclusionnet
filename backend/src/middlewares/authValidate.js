import { body ,validationResult } from "express-validator";

const namePattern = /^[a-zA-Z\s.-]{2,50}$/;
const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,20}$/;

const phoneRegex = /^[6-9]\d{9}$/; // Indian numbers

export const validateSignUp = [
    body('name')
    .notEmpty().withMessage('Name is required')
    .isLength({min:5}).withMessage('Name must be at least 5 characters')
    .matches(namePattern).withMessage('Please Enter Valide name'),
    body('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please Enter Valide Email'),
    body("phone")
    .notEmpty().withMessage('phone is required')
    .matches(phoneRegex).withMessage("Invalid phone number"),
    body('password')
    .notEmpty().withMessage('Password is Required')
    .isLength({min : 5}).withMessage('Password must be at least 5 characters')
    .matches(passwordPattern).withMessage('Please Enter Valide Password'),
    body('role')
    .notEmpty().withMessage('Role is Required')
    .isIn(['borrower', 'lender'])
    .withMessage('Role must be either borrower or lender'),
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
    .isLength({min : 5}).withMessage('Password must be at least 5 characters')
    .matches(passwordPattern).withMessage('Please Enter Valide Password'),
    (req,res,next)=>{
        const errors = validationResult(req);
        
        if(!errors.isEmpty()){
            return res.status(422).json({ errors: errors.array() });
        }
        next();
    }
]
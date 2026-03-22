import { body ,validationResult } from "express-validator";

// Letters, spaces, dot, hyphen, apostrophe (e.g. O'Brien)
const namePattern = /^[a-zA-Z\s.'-]{2,50}$/;
const passwordPattern = /^.{6,20}$/; // Simplified for now

const phoneRegex = /^[6-9]\d{9}$/; // Indian numbers (10 digits, after normalization)

/** Normalize signup body before validation (phone +91 / spaces, email trim, role case) */
export const normalizeSignUpBody = (req, res, next) => {
    if (!req.body || typeof req.body !== 'object') return next();
    const b = req.body;
    if (typeof b.email === 'string') b.email = b.email.trim().toLowerCase();
    if (typeof b.name === 'string') b.name = b.name.trim();
    if (typeof b.role === 'string') b.role = b.role.trim().toUpperCase();
    if (typeof b.phone === 'string') {
        let digits = b.phone.replace(/\D/g, '');
        if (digits.length === 12 && digits.startsWith('91')) digits = digits.slice(2);
        if (digits.length === 11 && digits.startsWith('0')) digits = digits.slice(1);
        b.phone = digits;
    }
    next();
};

export const validateSignUp = [
    body('name')
    .notEmpty().withMessage('Name is required')
    .isLength({min:2}).withMessage('Name must be at least 2 characters')
    .matches(namePattern).withMessage('Please Enter Valid name'),
    body('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please Enter Valide Email'),
    body("phone")
    .notEmpty().withMessage('Phone is required (10-digit Indian mobile, e.g. 9876543210)')
    .matches(phoneRegex).withMessage('Invalid phone: use 10 digits starting with 6–9 (no country code needed)'),
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
            const msgs = errors.array().map((e) => e.msg);
            return res.status(422).json({
                success: false,
                message: msgs.join(' '),
                errors: errors.array(),
            });
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
            const msgs = errors.array().map((e) => e.msg);
            return res.status(422).json({
                success: false,
                message: msgs.join(' '),
                errors: errors.array(),
            });
        }
        next();
    }
]

// Admin middleware - must be used after authMiddleware
export const isAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required'
        });
    }

    if (req.user.role !== 'ADMIN') {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Admin privileges required.'
        });
    }

    next();
};
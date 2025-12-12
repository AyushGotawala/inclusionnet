import express from 'express';
import {
  submitLoanApplication,
  getMyLoanApplications,
  getAllApplications,
  getApplicationById,
  updateApplicationStatus,
  getMatchingLenders,
  getMatchingLoans,
  getBorrowerProfileForLender,
} from '../controllers/loanController.js';
import { getLoanEligibility } from '../controllers/loanEligibilityController.js';
import { authMiddleware } from '../middlewares/auth.js';
import { isAdmin } from '../middlewares/authValidate.js';
import { loanApplicationValidator, updateLoanStatusValidator } from '../middlewares/loanValidators.js';

const router = express.Router();

// Borrower routes
router.get('/eligibility', authMiddleware, getLoanEligibility);
router.post('/apply', authMiddleware, loanApplicationValidator, submitLoanApplication);
router.get('/my-applications', authMiddleware, getMyLoanApplications);
// Matching lenders route - must come before /:id to avoid route conflicts
router.get('/:loanApplicationId/matching-lenders', authMiddleware, getMatchingLenders);

// Lender routes - MUST come before /:id route to avoid conflicts
router.get('/matching-loans', authMiddleware, getMatchingLoans);
router.get('/borrowers/:borrowerId/profile', authMiddleware, getBorrowerProfileForLender);

// Generic routes - must come last
router.get('/:id', authMiddleware, getApplicationById);

// Admin routes
router.get('/admin/all', authMiddleware, isAdmin, getAllApplications);
router.patch('/admin/:id/status', authMiddleware, isAdmin, updateLoanStatusValidator, updateApplicationStatus);

export default router;


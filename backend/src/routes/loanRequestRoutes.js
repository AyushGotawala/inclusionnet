import express from 'express';
import {
  createLoanRequest,
  createLoanOfferRequest,
  acceptLoanRequest,
  rejectLoanRequest,
  getBorrowerLoanRequests,
  getLenderLoanRequests,
} from '../controllers/loanRequestController.js';
import { authMiddleware } from '../middlewares/auth.js';

const router = express.Router();

// Create loan request (borrower to lender)
router.post('/borrower/request', authMiddleware, createLoanRequest);

// Create loan offer request (lender to borrower)
router.post('/lender/offer', authMiddleware, createLoanOfferRequest);

// Accept/Reject loan request
router.patch('/:loanRequestId/accept', authMiddleware, acceptLoanRequest);
router.patch('/:loanRequestId/reject', authMiddleware, rejectLoanRequest);

// Get loan requests
router.get('/borrower/requests', authMiddleware, getBorrowerLoanRequests);
router.get('/lender/requests', authMiddleware, getLenderLoanRequests);

export default router;

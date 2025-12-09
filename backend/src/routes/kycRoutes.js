import express from 'express';
import { getBorrowerKYCList, getLenderKYCList, uploadBorrowerKYC, uploadLenderKYC, verifyBorrowerKYC, verifyLenderKYC, getBorrowerKYCStatus, getLenderKYCStatus, getBorrowerProfile, updateBorrowerProfile, getLenderProfile, updateLenderProfile } from '../controllers/kycController.js';
import { getAllBorrowerKYC, updateBorrowerKYCStatus, getAllLenderKYC, updateLenderKYCStatus } from '../controllers/adminKycController.js';
import { authMiddleware } from '../middlewares/auth.js';
import { upload } from '../middlewares/kycUplaod.js';
import { borrowerKycValidator, lenderKYCValidator } from '../middlewares/kycValidators.js';
const kycRouter = express.Router();

// User KYC routes
kycRouter.post('/borrowers/kyc',authMiddleware,upload.fields([{name : 'aadhar'},{name:'pan'}]),borrowerKycValidator,uploadBorrowerKYC);
kycRouter.post('/lenders/kyc',authMiddleware,upload.fields([{name : 'aadhar'},{name:'pan'}]),lenderKYCValidator,uploadLenderKYC);
kycRouter.get('/borrowers/status',authMiddleware, getBorrowerKYCStatus);
kycRouter.get('/lenders/status',authMiddleware, getLenderKYCStatus);

// Profile management routes
kycRouter.get('/borrowers/profile',authMiddleware, getBorrowerProfile);
kycRouter.put('/borrowers/profile',authMiddleware, updateBorrowerProfile);
kycRouter.get('/lenders/profile',authMiddleware, getLenderProfile);
kycRouter.put('/lenders/profile',authMiddleware, updateLenderProfile);

kycRouter.get('/borrowers/pendingKYC',authMiddleware,getBorrowerKYCList);
kycRouter.post('/borrowers/verifyKYC',authMiddleware,verifyBorrowerKYC);
kycRouter.get('/lenders/pendingKYC',authMiddleware,getLenderKYCList);
kycRouter.post('/lenders/verifyKYC',authMiddleware,verifyLenderKYC);

// Admin KYC routes
kycRouter.get('/admin/borrowers/all',authMiddleware, getAllBorrowerKYC);
kycRouter.put('/admin/borrowers/:userId/status',authMiddleware, updateBorrowerKYCStatus);
kycRouter.get('/admin/lenders/all',authMiddleware, getAllLenderKYC);
kycRouter.put('/admin/lenders/:userId/status',authMiddleware, updateLenderKYCStatus);

export default kycRouter;
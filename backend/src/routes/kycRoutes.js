import express from 'express';
import { uploadBorrowerKYC, uploadLenderKYC } from '../controllers/kycController.js';
import { authMiddleware } from '../middlewares/auth.js';
import { upload } from '../middlewares/kycUplaod.js';
import { borrowerKycValidator, lenderKYCValidator } from '../middlewares/kycValidators.js';
const kycRouter = express.Router();

kycRouter.post('/borrowers/kyc',authMiddleware,upload.fields([{name : 'aadhar'},{name:'pan'}]),borrowerKycValidator,uploadBorrowerKYC);
kycRouter.post('/lenders/kyc',authMiddleware,upload.fields([{name : 'aadhar'},{name:'pan'}]),lenderKYCValidator,uploadLenderKYC);

export default kycRouter;
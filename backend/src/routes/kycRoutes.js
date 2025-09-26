import express from 'express';
import { getBorrowerKYCList, getLenderKYCList, uploadBorrowerKYC, uploadLenderKYC, verifyBorrowerKYC, verifyLenderKYC } from '../controllers/kycController.js';
import { authMiddleware } from '../middlewares/auth.js';
import { upload } from '../middlewares/kycUplaod.js';
import { borrowerKycValidator, lenderKYCValidator } from '../middlewares/kycValidators.js';
const kycRouter = express.Router();

kycRouter.post('/borrowers/kyc',authMiddleware,upload.fields([{name : 'aadhar'},{name:'pan'}]),borrowerKycValidator,uploadBorrowerKYC);
kycRouter.post('/lenders/kyc',authMiddleware,upload.fields([{name : 'aadhar'},{name:'pan'}]),lenderKYCValidator,uploadLenderKYC);
kycRouter.get('/borrowers/pendingKYC',authMiddleware,getBorrowerKYCList);
kycRouter.post('/borrowers/verifyKYC',authMiddleware,verifyBorrowerKYC);
kycRouter.get('/lenders/pendingKYC',authMiddleware,getLenderKYCList);
kycRouter.post('/lenders/verifyKYC',authMiddleware,verifyLenderKYC);

export default kycRouter;
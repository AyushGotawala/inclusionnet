import express from 'express';
import { Login, SignUp } from '../controllers/authController.js';
import { normalizeSignUpBody, validateLogin, validateSignUp } from '../middlewares/authValidate.js';
const authRouter = express.Router();

authRouter.post('/SignUp', normalizeSignUpBody, validateSignUp, SignUp);
authRouter.post('/Login',validateLogin,Login);

export default authRouter;
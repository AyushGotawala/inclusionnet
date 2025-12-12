import express from 'express';
import { authMiddleware } from '../middlewares/auth.js';
import { uploadProfilePicture as uploadMiddleware } from '../middlewares/profilePictureUpload.js';
import { 
  getUserProfile, 
  updateUserProfile,
  uploadProfilePicture,
  changePassword, 
  resetPasswordRequest, 
  resetPasswordConfirm,
  deleteUserAccount 
} from '../controllers/userController.js';

const userRouter = express.Router();

// Get current user profile
userRouter.get('/profile', authMiddleware, getUserProfile);

// Upload profile picture
userRouter.post('/profile/picture', authMiddleware, uploadMiddleware.single('profilePicture'), uploadProfilePicture);

// Update user profile
userRouter.put('/profile', authMiddleware, updateUserProfile);

// Change password (authenticated user)
userRouter.put('/change-password', authMiddleware, changePassword);

// Request password reset (public)
userRouter.post('/reset-password-request', resetPasswordRequest);

// Confirm password reset with token (public)
userRouter.post('/reset-password-confirm', resetPasswordConfirm);

// Delete user account
userRouter.delete('/account', authMiddleware, deleteUserAccount);

export default userRouter;
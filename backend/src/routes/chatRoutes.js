import express from 'express';
import {
  getChatMessages,
  getUnreadMessageCount,
  getUserActiveChats,
} from '../controllers/chatController.js';
import { authMiddleware } from '../middlewares/auth.js';

const router = express.Router();

// Get chat messages for a loan request
router.get('/:loanRequestId/messages', authMiddleware, getChatMessages);

// Get unread message count
router.get('/unread-count', authMiddleware, getUnreadMessageCount);

// Get active chats
router.get('/active', authMiddleware, getUserActiveChats);

export default router;

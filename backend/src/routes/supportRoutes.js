import express from 'express';
import { authMiddleware } from '../middlewares/auth.js';
import { 
  createSupportTicket, 
  getUserTickets, 
  getTicketById,
  updateTicketStatus,
  getAllTickets,
  addTicketReply
} from '../controllers/supportController.js';

const supportRouter = express.Router();

// User routes
supportRouter.post('/report-issue', authMiddleware, createSupportTicket);
supportRouter.get('/tickets', authMiddleware, getUserTickets);
supportRouter.get('/tickets/:ticketId', authMiddleware, getTicketById);
supportRouter.post('/tickets/:ticketId/reply', authMiddleware, addTicketReply);

// Admin routes
supportRouter.get('/admin/tickets', authMiddleware, getAllTickets);
supportRouter.put('/admin/tickets/:ticketId/status', authMiddleware, updateTicketStatus);

export default supportRouter;
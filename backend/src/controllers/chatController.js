import prisma from '../lib/prisma.js';
import { getChatHistory, getUnreadCount, getActiveChats } from '../socket/socketHandlers.js';

/**
 * Get chat history for a loan request
 */
export const getChatMessages = async (req, res) => {
  try {
    const userId = req.user.id;
    const { loanRequestId } = req.params;

    const chatData = await getChatHistory(Number(loanRequestId), userId);

    res.status(200).json({
      success: true,
      data: chatData
    });
  } catch (error) {
    console.error('Error getting chat messages:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error'
    });
  }
};

/**
 * Get unread message count
 */
export const getUnreadMessageCount = async (req, res) => {
  try {
    const userId = req.user.id;
    const count = await getUnreadCount(userId);

    res.status(200).json({
      success: true,
      data: { unreadCount: count }
    });
  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get active chats for user
 */
export const getUserActiveChats = async (req, res) => {
  try {
    const userId = req.user.id;
    const chats = await getActiveChats(userId);

    res.status(200).json({
      success: true,
      data: chats
    });
  } catch (error) {
    console.error('Error getting active chats:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

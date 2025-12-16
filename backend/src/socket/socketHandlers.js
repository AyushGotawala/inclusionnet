/**
 * Socket event handlers for different chat operations
 * This file contains helper functions for socket operations
 */

import prisma from '../lib/prisma.js';

/**
 * Get chat history for a loan request
 */
export const getChatHistory = async (loanRequestId, userId) => {
  try {
    const loanRequest = await prisma.loanRequest.findUnique({
      where: { id: loanRequestId },
      include: {
        borrower: {
          select: {
            id: true,
            name: true,
            profilePicture: true,
            role: true
          }
        },
        lender: {
          select: {
            id: true,
            name: true,
            profilePicture: true,
            role: true
          }
        }
      }
    });

    if (!loanRequest) {
      throw new Error('Loan request not found');
    }

    // Verify user has access
    if (loanRequest.borrowerId !== userId && loanRequest.lenderId !== userId) {
      throw new Error('Access denied');
    }

    // Only allow if request is accepted
    if (loanRequest.status !== 'ACCEPTED') {
      throw new Error('Chat is only available for accepted loan requests');
    }

    // Get messages
    const messages = await prisma.chatMessage.findMany({
      where: {
        loanRequestId
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            profilePicture: true,
            role: true
          }
        },
        receiver: {
          select: {
            id: true,
            name: true,
            profilePicture: true,
            role: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    return {
      loanRequest,
      messages
    };
  } catch (error) {
    console.error('Error getting chat history:', error);
    throw error;
  }
};

/**
 * Get unread message count for a user
 */
export const getUnreadCount = async (userId) => {
  try {
    const count = await prisma.chatMessage.count({
      where: {
        receiverId: userId,
        isRead: false
      }
    });

    return count;
  } catch (error) {
    console.error('Error getting unread count:', error);
    return 0;
  }
};

/**
 * Get all active chats for a user
 */
export const getActiveChats = async (userId) => {
  try {
    // Get all accepted loan requests where user is borrower or lender
    const loanRequests = await prisma.loanRequest.findMany({
      where: {
        status: 'ACCEPTED',
        OR: [
          { borrowerId: userId },
          { lenderId: userId }
        ]
      },
      include: {
        borrower: {
          select: {
            id: true,
            name: true,
            profilePicture: true,
            role: true
          }
        },
        lender: {
          select: {
            id: true,
            name: true,
            profilePicture: true,
            role: true
          }
        },
        loanApplication: {
          select: {
            id: true,
            loanAmount: true,
            loanPurpose: true,
            loanTenureMonths: true
          }
        },
        messages: {
          take: 1,
          orderBy: {
            createdAt: 'desc'
          },
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                profilePicture: true
              }
            }
          }
        },
        _count: {
          select: {
            messages: {
              where: {
                receiverId: userId,
                isRead: false
              }
            }
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    // Format response
    const chats = loanRequests.map(request => {
      const otherUser = request.borrowerId === userId 
        ? request.lender 
        : request.borrower;
      
      const lastMessage = request.messages[0] || null;
      const unreadCount = request._count.messages;

      // Ensure otherUser has all required fields
      const formattedOtherUser = otherUser ? {
        id: otherUser.id,
        name: otherUser.name || 'Unknown User',
        profilePicture: otherUser.profilePicture || null,
        role: otherUser.role
      } : null;

      return {
        loanRequestId: request.id,
        loanApplicationId: request.loanApplicationId,
        otherUser: formattedOtherUser,
        borrower: request.borrower, // Keep for backward compatibility
        lender: request.lender, // Keep for backward compatibility
        loanApplication: request.loanApplication,
        lastMessage,
        unreadCount,
        createdAt: request.createdAt,
        updatedAt: request.updatedAt
      };
    });

    return chats;
  } catch (error) {
    console.error('Error getting active chats:', error);
    throw error;
  }
};

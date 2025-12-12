import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma.js';

// Store active connections: userId -> socketId
const activeUsers = new Map();
// Store socketId -> userId mapping for quick lookup
const socketToUser = new Map();

/**
 * Authenticate socket connection using JWT token
 */
const authenticateSocket = (socket, next) => {
  try {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;
    socket.userRole = decoded.role;
    next();
  } catch (error) {
    console.error('Socket authentication error:', error);
    next(new Error('Authentication error: Invalid token'));
  }
};

/**
 * Initialize Socket.io server
 */
export const initializeSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:5174",
      methods: ["GET", "POST"],
      credentials: true
    },
    transports: ['websocket', 'polling']
  });

  // Authentication middleware
  io.use(authenticateSocket);

  io.on('connection', (socket) => {
    const userId = socket.userId;
    const userRole = socket.userRole;

    console.log(`✅ User ${userId} (${userRole}) connected with socket ID: ${socket.id}`);

    // Store user connection
    activeUsers.set(userId, socket.id);
    socketToUser.set(socket.id, userId);

    // Join user's personal room for direct messaging
    socket.join(`user_${userId}`);

    // Emit connection success
    socket.emit('connected', {
      message: 'Connected to chat server',
      userId,
      userRole
    });

    // Notify all users who have active chats with this user that they're now online
    // We need to find all loan requests where this user is involved
    prisma.loanRequest.findMany({
      where: {
        OR: [
          { borrowerId: userId },
          { lenderId: userId }
        ],
        status: 'ACCEPTED'
      },
      select: {
        id: true,
        borrowerId: true,
        lenderId: true
      }
    }).then(loanRequests => {
      loanRequests.forEach(loanRequest => {
        const otherUserId = loanRequest.borrowerId === userId 
          ? loanRequest.lenderId 
          : loanRequest.borrowerId;
        
        // Notify the other user that this user is online
        const otherUserSocketId = activeUsers.get(otherUserId);
        if (otherUserSocketId) {
          io.to(`user_${otherUserId}`).emit('user_online', {
            userId,
            isOnline: true
          });
        }
      });
    }).catch(err => {
      console.error('Error notifying users of online status:', err);
    });

    /**
     * Join a chat room (for borrower-lender communication)
     * Room format: chat_borrowerId_lenderId or chat_lenderId_borrowerId
     */
    socket.on('join_chat_room', async ({ borrowerId, lenderId, loanRequestId }) => {
      try {
        // Verify user has access to this chat
        const hasAccess = await verifyChatAccess(userId, borrowerId, lenderId, loanRequestId);
        
        if (!hasAccess) {
          socket.emit('error', { message: 'Access denied to this chat room' });
          return;
        }

        // Create consistent room name (always use smaller ID first)
        const roomId = getChatRoomId(borrowerId, lenderId, loanRequestId);
        socket.join(roomId);

        console.log(`📨 User ${userId} joined chat room: ${roomId}`);

        socket.emit('joined_room', {
          roomId,
          borrowerId,
          lenderId,
          loanRequestId
        });

        // Notify other user in the room
        socket.to(roomId).emit('user_joined', {
          userId,
          message: 'User joined the chat'
        });

        // Check and notify online status of the other user
        const otherUserId = borrowerId === userId ? lenderId : borrowerId;
        const otherUserIsOnline = activeUsers.has(otherUserId);
        socket.emit('online_status', {
          userId: otherUserId,
          isOnline: otherUserIsOnline
        });
      } catch (error) {
        console.error('Error joining chat room:', error);
        socket.emit('error', { message: 'Failed to join chat room' });
      }
    });

    /**
     * Leave a chat room
     */
    socket.on('leave_chat_room', ({ borrowerId, lenderId, loanRequestId }) => {
      const roomId = getChatRoomId(borrowerId, lenderId, loanRequestId);
      socket.leave(roomId);
      console.log(`👋 User ${userId} left chat room: ${roomId}`);
    });

    /**
     * Send a message
     */
    socket.on('send_message', async (data) => {
      try {
        const { borrowerId, lenderId, loanRequestId, message, messageType = 'text' } = data;

        if (!message || !message.trim()) {
          socket.emit('error', { message: 'Message cannot be empty' });
          return;
        }

        // Verify access
        const hasAccess = await verifyChatAccess(userId, borrowerId, lenderId, loanRequestId);
        if (!hasAccess) {
          socket.emit('error', { message: 'Access denied' });
          return;
        }

        // Determine sender and receiver
        const isBorrower = userId === borrowerId;
        const senderId = userId;
        const receiverId = isBorrower ? lenderId : borrowerId;

        // Save message to database
        const savedMessage = await prisma.chatMessage.create({
          data: {
            loanRequestId,
            senderId,
            receiverId,
            message: message.trim(),
            messageType,
            isRead: false
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
          }
        });

        // Create room ID
        const roomId = getChatRoomId(borrowerId, lenderId, loanRequestId);

        // Check if receiver is online
        const receiverIsOnline = activeUsers.has(receiverId);

        // Emit message to all users in the room
        const messageData = {
          id: savedMessage.id,
          loanRequestId: savedMessage.loanRequestId,
          senderId: savedMessage.senderId,
          receiverId: savedMessage.receiverId,
          message: savedMessage.message,
          messageType: savedMessage.messageType,
          isRead: savedMessage.isRead,
          receiverIsOnline, // Include receiver's online status
          createdAt: savedMessage.createdAt,
          sender: savedMessage.sender,
          receiver: savedMessage.receiver
        };

        io.to(roomId).emit('new_message', messageData);

        // Also emit to sender's personal room for status updates
        io.to(`user_${senderId}`).emit('message_sent', {
          ...messageData,
          status: receiverIsOnline ? 'delivered' : 'sent'
        });

        // Always send notification to receiver's personal room (even if they're not in the chat room)
        // This ensures they get notifications on dashboard/navbar
        io.to(`user_${receiverId}`).emit('message_notification', {
          loanRequestId,
          senderId,
          senderName: savedMessage.sender.name,
          message: savedMessage.message,
          roomId
        });

        console.log(`💬 Message sent in room ${roomId} by user ${userId}`);
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    /**
     * Mark messages as read
     */
    socket.on('mark_as_read', async ({ borrowerId, lenderId, loanRequestId }) => {
      try {
        const hasAccess = await verifyChatAccess(userId, borrowerId, lenderId, loanRequestId);
        if (!hasAccess) {
          return;
        }

        // First, get the IDs of messages that will be marked as read
        const unreadMessages = await prisma.chatMessage.findMany({
          where: {
            loanRequestId,
            receiverId: userId,
            isRead: false
          },
          select: {
            id: true
          }
        });

        const messageIdsToMark = unreadMessages.map(m => m.id);

        // Only proceed if there are messages to mark as read
        if (messageIdsToMark.length > 0) {
          // Mark all unread messages as read
          await prisma.chatMessage.updateMany({
            where: {
              loanRequestId,
              receiverId: userId,
              isRead: false
            },
            data: {
              isRead: true,
              readAt: new Date()
            }
          });

          const roomId = getChatRoomId(borrowerId, lenderId, loanRequestId);
          
          // Determine the sender (the other user in the chat)
          const senderId = borrowerId === userId ? lenderId : borrowerId;
          
          // Emit to the room (for users in the chat)
          io.to(roomId).emit('messages_read', {
            userId,
            loanRequestId,
            messageIds: messageIdsToMark // Send IDs of messages that were just read
          });
          
          // Also emit to sender's personal room to ensure they receive the update
          // This is important if the sender is not currently in the chat room
          io.to(`user_${senderId}`).emit('messages_read', {
            userId,
            loanRequestId,
            messageIds: messageIdsToMark
          });
          
          console.log(`✅ Messages marked as read by user ${userId} in room ${roomId}. Notifying sender ${senderId} with ${messageIdsToMark.length} message(s)`);
        } else {
          console.log(`ℹ️ No unread messages to mark for user ${userId} in loan request ${loanRequestId}`);
        }
      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
    });

    /**
     * Typing indicator
     */
    socket.on('typing', ({ borrowerId, lenderId, loanRequestId, isTyping }) => {
      const roomId = getChatRoomId(borrowerId, lenderId, loanRequestId);
      socket.to(roomId).emit('user_typing', {
        userId,
        isTyping,
        loanRequestId
      });
    });

    /**
     * Get online status
     */
    socket.on('check_online_status', ({ userId: checkUserId }) => {
      const isOnline = activeUsers.has(checkUserId);
      socket.emit('online_status', {
        userId: checkUserId,
        isOnline
      });
    });

    /**
     * Disconnect handler
     */
    socket.on('disconnect', () => {
      console.log(`❌ User ${userId} disconnected (socket ID: ${socket.id})`);
      
      // Remove from active users
      activeUsers.delete(userId);
      socketToUser.delete(socket.id);

      // Notify all users who have active chats with this user that they're now offline
      prisma.loanRequest.findMany({
        where: {
          OR: [
            { borrowerId: userId },
            { lenderId: userId }
          ],
          status: 'ACCEPTED'
        },
        select: {
          id: true,
          borrowerId: true,
          lenderId: true
        }
      }).then(loanRequests => {
        loanRequests.forEach(loanRequest => {
          const otherUserId = loanRequest.borrowerId === userId 
            ? loanRequest.lenderId 
            : loanRequest.borrowerId;
          
          // Notify the other user that this user is offline
          const otherUserSocketId = activeUsers.get(otherUserId);
          if (otherUserSocketId) {
            io.to(`user_${otherUserId}`).emit('user_offline', {
              userId,
              isOnline: false
            });
          }
        });
      }).catch(err => {
        console.error('Error notifying users of offline status:', err);
      });
    });

    /**
     * Error handler
     */
    socket.on('error', (error) => {
      console.error(`Socket error for user ${userId}:`, error);
    });
  });

  return io;
};

/**
 * Generate consistent chat room ID
 */
const getChatRoomId = (borrowerId, lenderId, loanRequestId) => {
  // Always use smaller ID first for consistency
  const ids = [borrowerId, lenderId].sort((a, b) => a - b);
  return `chat_${ids[0]}_${ids[1]}_${loanRequestId}`;
};

/**
 * Verify user has access to chat room
 */
const verifyChatAccess = async (userId, borrowerId, lenderId, loanRequestId) => {
  try {
    // User must be either borrower or lender
    if (userId !== borrowerId && userId !== lenderId) {
      return false;
    }

    // Check if loan request exists and is accepted
    const loanRequest = await prisma.loanRequest.findUnique({
      where: { id: loanRequestId },
      select: {
        id: true,
        borrowerId: true,
        lenderId: true,
        status: true
      }
    });

    if (!loanRequest) {
      return false;
    }

    // Verify IDs match
    if (loanRequest.borrowerId !== borrowerId || loanRequest.lenderId !== lenderId) {
      return false;
    }

    // Only allow chat if request is accepted
    if (loanRequest.status !== 'ACCEPTED') {
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error verifying chat access:', error);
    return false;
  }
};

/**
 * Get online users count
 */
export const getOnlineUsersCount = () => {
  return activeUsers.size;
};

/**
 * Get user socket ID
 */
export const getUserSocketId = (userId) => {
  return activeUsers.get(userId);
};

/**
 * Send notification to user
 */
export const sendNotificationToUser = (io, userId, event, data) => {
  const socketId = activeUsers.get(userId);
  if (socketId) {
    io.to(`user_${userId}`).emit(event, data);
    return true;
  }
  return false;
};

/**
 * Socket.io module exports
 * Main entry point for socket functionality
 */

export { initializeSocket, getOnlineUsersCount, getUserSocketId, sendNotificationToUser } from './socketServer.js';
export { getChatHistory, getUnreadCount, getActiveChats } from './socketHandlers.js';

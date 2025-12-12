import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:4000';

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Get chat messages
export const getChatMessages = createAsyncThunk(
  'chat/getMessages',
  async (loanRequestId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/chat/${loanRequestId}/messages`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch messages');
    }
  }
);

// Get active chats
export const getActiveChats = createAsyncThunk(
  'chat/getActiveChats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/chat/active');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch chats');
    }
  }
);

// Get unread count
export const getUnreadCount = createAsyncThunk(
  'chat/getUnreadCount',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/chat/unread-count');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch unread count');
    }
  }
);

const initialState = {
  activeChats: [],
  currentChat: null,
  messages: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
  socketConnected: false,
  notifications: [], // Array of notification objects
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setSocketConnected: (state, action) => {
      state.socketConnected = action.payload;
    },
    addMessage: (state, action) => {
      const message = action.payload;
      // Add message if not already present, or update if it exists
      const existingIndex = state.messages.findIndex(m => m.id === message.id);
      if (existingIndex === -1) {
        // New message - add it with all its properties
        state.messages.push(message);
      } else {
        // Update existing message - preserve isRead and receiverIsOnline if they're not in the new message
        const existingMessage = state.messages[existingIndex];
        state.messages[existingIndex] = {
          ...existingMessage,
          ...message,
          // Preserve read status and receiverIsOnline if not provided in new message
          isRead: message.isRead !== undefined ? message.isRead : existingMessage.isRead,
          receiverIsOnline: message.receiverIsOnline !== undefined ? message.receiverIsOnline : existingMessage.receiverIsOnline
        };
      }
    },
    updateMessageStatus: (state, action) => {
      const { messageId, isRead, receiverIsOnline } = action.payload;
      const messageIndex = state.messages.findIndex(m => m.id === messageId);
      if (messageIndex !== -1) {
        // Create a new object to ensure React detects the change
        const updatedMessage = { ...state.messages[messageIndex] };
        if (isRead !== undefined) updatedMessage.isRead = isRead;
        if (receiverIsOnline !== undefined) updatedMessage.receiverIsOnline = receiverIsOnline;
        state.messages[messageIndex] = updatedMessage;
      }
    },
    setMessages: (state, action) => {
      state.messages = action.payload;
    },
    setCurrentChat: (state, action) => {
      state.currentChat = action.payload;
    },
    clearCurrentChat: (state) => {
      state.currentChat = null;
      state.messages = [];
    },
    updateUnreadCount: (state, action) => {
      state.unreadCount = action.payload;
    },
    markMessagesAsRead: (state, action) => {
      const { loanRequestId, messageIds } = action.payload;
      if (messageIds && messageIds.length > 0) {
        // Update specific messages by ID - create new objects to ensure React detects changes
        state.messages = state.messages.map(msg => {
          if (messageIds.includes(msg.id)) {
            return { ...msg, isRead: true };
          }
          return msg;
        });
      } else if (loanRequestId) {
        // Fallback: mark all unread messages in the chat (only if no specific IDs provided)
        state.messages = state.messages.map(msg => {
          if (msg.loanRequestId === loanRequestId && !msg.isRead) {
            return { ...msg, isRead: true };
          }
          return msg;
        });
      }
    },
    updateMessageReadStatus: (state, action) => {
      const { messageIds, loanRequestId } = action.payload;
      if (!messageIds || messageIds.length === 0) return;
      
      // Only update messages that are in the messageIds array
      state.messages = state.messages.map(msg => {
        if (messageIds.includes(msg.id)) {
          // Create a new object to ensure React detects the change
          return { ...msg, isRead: true };
        }
        return msg;
      });
      
      // Update unread count in activeChats for the specific chat
      if (loanRequestId) {
        state.activeChats = state.activeChats.map(chat => {
          if (chat.loanRequestId === loanRequestId) {
            // Decrease unread count by the number of messages that were read
            const newUnreadCount = Math.max(0, (chat.unreadCount || 0) - messageIds.length);
            return { ...chat, unreadCount: newUnreadCount };
          }
          return chat;
        });
        // Also decrease global unread count
        state.unreadCount = Math.max(0, state.unreadCount - messageIds.length);
      }
    },
    clearError: (state) => {
      state.error = null;
    },
    addNotification: (state, action) => {
      const notification = action.payload;
      // Add notification if not already present (check by id or by loanRequestId + senderId + message to prevent duplicates)
      const isDuplicate = state.notifications.find(n => 
        n.id === notification.id || 
        (n.loanRequestId === notification.loanRequestId && 
         n.senderId === notification.senderId && 
         n.message === notification.message &&
         Math.abs(new Date(n.timestamp) - new Date(notification.timestamp)) < 1000) // Within 1 second
      );
      
      if (!isDuplicate) {
        state.notifications.unshift(notification); // Add to beginning
        // Keep only last 50 notifications
        if (state.notifications.length > 50) {
          state.notifications = state.notifications.slice(0, 50);
        }
        // Increment unread count only if it's a new notification
        state.unreadCount += 1;
      }
    },
    removeNotification: (state, action) => {
      const notificationId = action.payload;
      state.notifications = state.notifications.filter(n => n.id !== notificationId);
    },
    clearNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
    },
    incrementUnreadCount: (state, action) => {
      state.unreadCount += action.payload || 1;
    },
    decrementUnreadCount: (state, action) => {
      state.unreadCount = Math.max(0, state.unreadCount - (action.payload || 1));
    },
    setUnreadCount: (state, action) => {
      state.unreadCount = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get chat messages
      .addCase(getChatMessages.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getChatMessages.fulfilled, (state, action) => {
        state.isLoading = false;
        const loadedMessages = action.payload.data.messages || [];
        // Preserve receiverIsOnline and isRead status for messages that already have them
        // This ensures that real-time updates are not lost when reloading
        state.messages = loadedMessages.map(loadedMsg => {
          const existingMsg = state.messages.find(m => m.id === loadedMsg.id);
          if (existingMsg) {
            // Preserve status fields from existing message if they exist
            return {
              ...loadedMsg,
              receiverIsOnline: existingMsg.receiverIsOnline !== undefined 
                ? existingMsg.receiverIsOnline 
                : loadedMsg.receiverIsOnline,
              isRead: existingMsg.isRead !== undefined 
                ? existingMsg.isRead 
                : loadedMsg.isRead
            };
          }
          // New message from DB - preserve isRead from DB, and don't set receiverIsOnline
          // receiverIsOnline is only set when messages are sent in real-time
          // For old messages, we'll use the isRead status to determine the check mark
          return {
            ...loadedMsg,
            // Don't set receiverIsOnline to false - leave it undefined
            // The rendering logic will handle undefined by checking isRead first
          };
        });
        state.currentChat = action.payload.data.loanRequest || null;
      })
      .addCase(getChatMessages.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Get active chats
      .addCase(getActiveChats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getActiveChats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.activeChats = action.payload.data || [];
        // Calculate total unread count from all chats
        const totalUnread = state.activeChats.reduce((sum, chat) => sum + (chat.unreadCount || 0), 0);
        state.unreadCount = totalUnread;
      })
      .addCase(getActiveChats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Get unread count
      .addCase(getUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload.data.unreadCount || 0;
      });
  },
});

export const {
  setSocketConnected,
  addMessage,
  setMessages,
  setCurrentChat,
  clearCurrentChat,
  updateUnreadCount,
  markMessagesAsRead,
  updateMessageReadStatus,
  updateMessageStatus,
  addNotification,
  removeNotification,
  clearNotifications,
  incrementUnreadCount,
  decrementUnreadCount,
  setUnreadCount,
  clearError,
} = chatSlice.actions;
export default chatSlice.reducer;

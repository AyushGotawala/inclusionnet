import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { getChatMessages, addMessage, setSocketConnected, markMessagesAsRead, setCurrentChat, updateMessageReadStatus, updateMessageStatus } from '../../store/slices/chatSlice';
import Layout from '../Layout';
import { Send, ArrowLeft, Loader, AlertCircle, User, Check, CheckCheck, Circle, Smile } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';

const ChatInterface = ({ loanRequestId: propLoanRequestId, embedded = false }) => {
  const { loanRequestId: urlLoanRequestId } = useParams();
  const loanRequestId = propLoanRequestId || urlLoanRequestId;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { messages, currentChat, isLoading, socketConnected } = useSelector((state) => state.chat);
  
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [socket, setSocket] = useState(null);
  const [otherUserOnline, setOtherUserOnline] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const isTypingRef = useRef(false); // Use ref to avoid re-renders
  const emojiPickerRef = useRef(null);

  // Initialize socket connection
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const newSocket = io('http://localhost:4000', {
      auth: {
        token: token
      },
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      console.log('✅ Connected to chat server');
      dispatch(setSocketConnected(true));
    });

    newSocket.on('connected', (data) => {
      console.log('Socket connected:', data);
    });

    newSocket.on('disconnect', () => {
      console.log('❌ Disconnected from chat server');
      dispatch(setSocketConnected(false));
    });

    newSocket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [dispatch, navigate]);

  // Load chat messages and join room
  useEffect(() => {
    if (!loanRequestId || !socket || !socketConnected) return;

    const loadChat = async () => {
      try {
        const result = await dispatch(getChatMessages(Number(loanRequestId))).unwrap();
        
        if (result.data?.loanRequest) {
          const loanRequest = result.data.loanRequest;
          const borrowerId = loanRequest.borrowerId;
          const lenderId = loanRequest.lenderId;

          // Join chat room
          socket.emit('join_chat_room', {
            borrowerId,
            lenderId,
            loanRequestId: Number(loanRequestId)
          });

          dispatch(setCurrentChat({
            loanRequestId: Number(loanRequestId),
            borrowerId,
            lenderId,
            otherUser: borrowerId === user.id ? loanRequest.lender : loanRequest.borrower
          }));

          // Check online status of other user
          const otherUserId = borrowerId === user.id ? lenderId : borrowerId;
          socket.emit('check_online_status', { userId: otherUserId });

          // Mark messages as read
          socket.emit('mark_as_read', {
            borrowerId,
            lenderId,
            loanRequestId: Number(loanRequestId)
          });
        }
      } catch (error) {
        console.error('Error loading chat:', error);
      }
    };

    loadChat();
  }, [loanRequestId, socket, socketConnected, dispatch, user.id]);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (newMessage) => {
      // Update other user's online status if included in message
      if (newMessage.receiverIsOnline !== undefined && newMessage.senderId === currentChat?.otherUser?.id) {
        setOtherUserOnline(newMessage.receiverIsOnline);
      }
      
      // Add the message first (it already has receiverIsOnline if it's our message)
      dispatch(addMessage(newMessage));
      
      // Only update status separately if it's our message and we need to update it
      // But since addMessage already handles the receiverIsOnline, we don't need to do it again
      
      scrollToBottom();
      
      // Mark as read if it's for current user
      if (newMessage.receiverId === user.id) {
        socket.emit('mark_as_read', {
          borrowerId: currentChat?.borrowerId,
          lenderId: currentChat?.lenderId,
          loanRequestId: Number(loanRequestId)
        });
      }
    };

    const handleMessageSent = (data) => {
      // Update message status when it's sent - only for the specific message
      // This event is received separately from new_message, so we update the specific message
      if (data.senderId === user.id && data.id) {
        dispatch(updateMessageStatus({
          messageId: data.id,
          receiverIsOnline: data.receiverIsOnline
        }));
      }
    };

    const handleUserTyping = (data) => {
      if (data.userId !== user.id) {
        setOtherUserTyping(data.isTyping);
        if (data.isTyping) {
          setTimeout(() => setOtherUserTyping(false), 3000);
        }
      }
    };

    const handleMessagesRead = (data) => {
      // Update read status for specific messages
      // Update messages regardless of which chat is currently open
      // The Redux store will handle updating the correct messages
      if (data.messageIds && data.messageIds.length > 0) {
        dispatch(updateMessageReadStatus({ 
          messageIds: data.messageIds,
          loanRequestId: data.loanRequestId 
        }));
      }
    };

    const handleUserOnline = (data) => {
      if (data.userId === currentChat?.otherUser?.id) {
        setOtherUserOnline(true);
        // Note: We don't update messages here anymore to avoid stale closure issues
        // Messages will get their status when they're sent or loaded
      }
    };

    const handleUserOffline = (data) => {
      if (data.userId === currentChat?.otherUser?.id) {
        setOtherUserOnline(false);
        // Note: We don't update messages here anymore to avoid stale closure issues
        // Messages will get their status when they're sent or loaded
      }
    };

    // Check online status when joining room
    const checkOnlineStatus = () => {
      if (currentChat?.otherUser?.id) {
        socket.emit('check_online_status', { userId: currentChat.otherUser.id });
      }
    };

    socket.on('new_message', handleNewMessage);
    socket.on('message_sent', handleMessageSent);
    socket.on('user_typing', handleUserTyping);
    socket.on('messages_read', handleMessagesRead);
    socket.on('user_online', handleUserOnline);
    socket.on('user_offline', handleUserOffline);
    socket.on('online_status', (data) => {
      if (data.userId === currentChat?.otherUser?.id) {
        setOtherUserOnline(data.isOnline);
        // Note: We don't update messages here anymore to avoid stale closure issues
        // Messages will get their status when they're sent or loaded
      }
    });

    // Check online status on mount
    checkOnlineStatus();

    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('message_sent', handleMessageSent);
      socket.off('user_typing', handleUserTyping);
      socket.off('messages_read', handleMessagesRead);
      socket.off('user_online', handleUserOnline);
      socket.off('user_offline', handleUserOffline);
      socket.off('online_status');
    };
  }, [socket, user.id, currentChat, loanRequestId, dispatch]);

  // Scroll to bottom when messages change (but not on initial load)
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const messagesContainerRef = useRef(null);
  const inputRef = useRef(null);
  
  useEffect(() => {
    if (messages.length > 0 && messagesEndRef.current) {
      // Use instant scroll on initial load, smooth scroll for new messages
      if (isInitialLoad) {
        // Wait for DOM to update, then scroll instantly
        requestAnimationFrame(() => {
          if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'auto', block: 'end' });
            setIsInitialLoad(false);
          }
        });
      } else {
        // Only scroll if user is near bottom (within 150px) or if it's a new message from current user
        const container = messagesContainerRef.current;
        if (container) {
          const scrollHeight = container.scrollHeight;
          const scrollTop = container.scrollTop;
          const clientHeight = container.clientHeight;
          const isNearBottom = scrollHeight - scrollTop - clientHeight < 150;
          
          if (isNearBottom) {
            requestAnimationFrame(() => {
              if (messagesEndRef.current) {
                messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
              }
            });
          }
        }
      }
    }
  }, [messages, isInitialLoad]);

  // Reset initial load flag when chat changes
  useEffect(() => {
    setIsInitialLoad(true);
    // Only clear message when actually switching to a different chat
    const currentLoanRequestId = propLoanRequestId || urlLoanRequestId;
    if (currentLoanRequestId && currentLoanRequestId !== loanRequestId) {
      setMessage('');
    }
  }, [loanRequestId, propLoanRequestId, urlLoanRequestId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Handle emoji selection
  const onEmojiClick = (emojiData) => {
    setMessage(prev => prev + emojiData.emoji);
    // Keep picker open so user can add multiple emojis
  };

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        // Check if click is not on the emoji button
        const emojiButton = event.target.closest('[data-emoji-button]');
        if (!emojiButton) {
          setShowEmojiPicker(false);
        }
      }
    };

    if (showEmojiPicker) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showEmojiPicker]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const messageToSend = message.trim();
    if (!messageToSend || !socket || !currentChat) return;

    socket.emit('send_message', {
      borrowerId: currentChat.borrowerId,
      lenderId: currentChat.lenderId,
      loanRequestId: Number(loanRequestId),
      message: messageToSend,
      messageType: 'text'
    });

    // Clear message after sending
    setMessage('');
    setShowEmojiPicker(false); // Close emoji picker when sending
    isTypingRef.current = false;
    setIsTyping(false);
    
    // Re-focus input after sending
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
    
    // Clear typing indicator
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
    
    socket.emit('typing', {
      borrowerId: currentChat.borrowerId,
      lenderId: currentChat.lenderId,
      loanRequestId: Number(loanRequestId),
      isTyping: false
    });
    
    // Refocus input after sending
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };

  const handleTyping = useCallback((e) => {
    const newValue = e.target.value;
    setMessage(newValue);
    
    if (!socket || !currentChat) return;

    // Use ref to track typing state to minimize re-renders
    if (!isTypingRef.current && newValue.trim().length > 0) {
      isTypingRef.current = true;
      setIsTyping(true);
      socket.emit('typing', {
        borrowerId: currentChat.borrowerId,
        lenderId: currentChat.lenderId,
        loanRequestId: Number(loanRequestId),
        isTyping: true
      });
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing indicator
    if (newValue.trim().length > 0) {
      typingTimeoutRef.current = setTimeout(() => {
        isTypingRef.current = false;
        setIsTyping(false);
        if (socket && currentChat) {
          socket.emit('typing', {
            borrowerId: currentChat.borrowerId,
            lenderId: currentChat.lenderId,
            loanRequestId: Number(loanRequestId),
            isTyping: false
          });
        }
      }, 1000);
    } else {
      // Stop typing immediately if input is empty
      isTypingRef.current = false;
      setIsTyping(false);
      if (socket && currentChat) {
        socket.emit('typing', {
          borrowerId: currentChat.borrowerId,
          lenderId: currentChat.lenderId,
          loanRequestId: Number(loanRequestId),
          isTyping: false
        });
      }
    }
  }, [socket, currentChat, loanRequestId]);

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    // Today - show time only
    if (days === 0) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    }
    
    // Yesterday
    if (days === 1) {
      return 'Yesterday';
    }
    
    // This week - show day name
    if (days < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    }
    
    // Older - show date
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getProfilePictureUrl = (profilePicture) => {
    if (!profilePicture) return null;
    if (profilePicture.startsWith('http')) return profilePicture;
    return `http://localhost:4000${profilePicture}`;
  };

  // If embedded, don't wrap in Layout
  if (embedded) {
    if (!currentChat) {
      return (
        <div className="h-full flex items-center justify-center bg-white">
          <div className="text-center">
            <Loader className="h-8 w-8 animate-spin text-primary-600 mx-auto mb-4" />
            <p className="text-gray-500">Loading chat...</p>
          </div>
        </div>
      );
    }

    return (
      <div className="h-full w-full flex flex-col bg-gray-50 overflow-hidden">
        {/* Chat Header - Platform Primary */}
        <div className="flex-shrink-0 bg-gradient-to-r from-primary-600 to-primary-700 px-4 py-3 shadow-md z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {!embedded && (
                <button
                  onClick={() => navigate(-1)}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors mr-1"
                  title="Go back"
                >
                  <ArrowLeft className="h-5 w-5 text-white" />
                </button>
              )}
              <div className="relative">
                {getProfilePictureUrl(currentChat.otherUser?.profilePicture) ? (
                  <img
                    src={getProfilePictureUrl(currentChat.otherUser.profilePicture)}
                    alt={currentChat.otherUser.name}
                    className="h-10 w-10 rounded-full object-cover border-2 border-white/30"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center border-2 border-white/30">
                    <User className="h-5 w-5 text-white" />
                  </div>
                )}
                {socketConnected && (
                  <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 border-2 border-white rounded-full"></div>
                )}
              </div>
              <div>
                <h3 className="font-semibold text-white text-base">{currentChat.otherUser?.name}</h3>
                <p className="text-xs text-white/90 flex items-center">
                  {otherUserOnline ? (
                    <>
                      <span className="h-2 w-2 bg-green-400 rounded-full mr-1.5"></span>
                      Online
                    </>
                  ) : (
                    <>
                      <span className="h-2 w-2 bg-gray-400 rounded-full mr-1.5"></span>
                      Offline
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Messages Area - Platform Style */}
        <div className="flex-1 bg-gray-50 overflow-hidden min-h-0">
          <div 
            ref={messagesContainerRef}
            className="h-full overflow-y-auto px-4 py-4 space-y-3 custom-scrollbar"
          >
            {isLoading && messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Loader className="h-8 w-8 animate-spin text-primary-600 mx-auto mb-3" />
                  <p className="text-gray-500">Loading messages...</p>
                </div>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center max-w-md px-4">
                  <div className="h-16 w-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Send className="h-8 w-8 text-primary-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No messages yet</h3>
                  <p className="text-gray-600">Start the conversation by sending a message!</p>
                </div>
              </div>
            ) : (
              messages.map((msg, index) => {
                const isOwnMessage = msg.senderId === user.id;
                const showAvatar = !isOwnMessage && (
                  index === 0 || 
                  messages[index - 1].senderId !== msg.senderId
                );
                const showTime = index === messages.length - 1 || 
                  new Date(msg.createdAt).getTime() - new Date(messages[index + 1].createdAt).getTime() > 300000; // 5 minutes
                
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} group`}
                  >
                    <div className={`flex items-end space-x-1 ${isOwnMessage ? 'flex-row-reverse space-x-reverse' : ''}`}>
                      {!isOwnMessage && (
                        <div className="flex-shrink-0 mb-1">
                          {showAvatar ? (
                            getProfilePictureUrl(msg.sender?.profilePicture) ? (
                              <img
                                src={getProfilePictureUrl(msg.sender.profilePicture)}
                                alt={msg.sender.name}
                                className="h-8 w-8 rounded-full object-cover border-2 border-white shadow-sm"
                              />
                            ) : (
                              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-sm border-2 border-white">
                                <User className="h-4 w-4 text-white" />
                              </div>
                            )
                          ) : (
                            <div className="h-8 w-8"></div>
                          )}
                        </div>
                      )}
                      <div className={`relative px-4 py-2.5 rounded-2xl shadow-sm ${
                        isOwnMessage 
                          ? 'bg-gradient-to-br from-primary-600 to-primary-700 text-white rounded-br-md' 
                          : 'bg-white text-gray-900 border border-gray-200 rounded-bl-md'
                      }`}>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{msg.message}</p>
                        <div className={`flex items-center justify-end mt-1.5 space-x-1 ${
                          isOwnMessage ? 'text-primary-100' : 'text-gray-500'
                        }`}>
                          <span className="text-xs">{formatTime(msg.createdAt)}</span>
                          {isOwnMessage && (
                            <span className="ml-1">
                              {(() => {
                                // Priority: isRead > receiverIsOnline
                                // If message is read, always show double blue check (regardless of receiverIsOnline)
                                if (msg.isRead) {
                                  return <CheckCheck className="h-3.5 w-3.5 text-blue-400" />;
                                }
                                
                                // Message is not read - check receiver's online status
                                // If receiverIsOnline is undefined, check current online status
                                const receiverOnline = msg.receiverIsOnline !== undefined 
                                  ? msg.receiverIsOnline 
                                  : otherUserOnline;
                                
                                // If receiver is online but message not read, show double gray check
                                if (receiverOnline) {
                                  return <CheckCheck className="h-3.5 w-3.5 text-gray-400" />;
                                }
                                
                                // If receiver is offline and message not read, show single gray check
                                return <Check className="h-3.5 w-3.5 text-gray-400" />;
                              })()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            {otherUserTyping && (
              <div className="flex justify-start">
                <div className="bg-white rounded-lg rounded-tl-none px-3 py-2 shadow-sm">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms', animationDuration: '1.4s' }}></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '200ms', animationDuration: '1.4s' }}></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '400ms', animationDuration: '1.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Message Input - Platform Style */}
        <div className="flex-shrink-0 bg-white px-4 py-3 border-t border-gray-200 shadow-sm">
          {!socketConnected && (
            <div className="mb-2 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
              <p className="text-sm text-red-700">Not connected. Please refresh the page.</p>
            </div>
          )}
            <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
              <div className="flex-1 relative">
                <input
                  ref={inputRef}
                  key={`input-${loanRequestId}`}
                  type="text"
                  value={message}
                  onChange={handleTyping}
                  placeholder="Type a message..."
                  className="w-full px-4 py-3 pr-20 rounded-xl bg-gray-50 border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm text-gray-900 placeholder-gray-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition-all"
                  disabled={!socketConnected}
                  autoComplete="off"
                  autoFocus={false}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(e);
                    }
                  }}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-2">
                  <button
                    type="button"
                    data-emoji-button
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                    title="Add emoji"
                  >
                    <Smile className="h-5 w-5" />
                  </button>
                  {message.trim() && (
                    <button
                      type="button"
                      onClick={() => {
                        setMessage('');
                        inputRef.current?.focus();
                      }}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <span className="text-lg">×</span>
                    </button>
                  )}
                </div>
                {/* Emoji Picker */}
                {showEmojiPicker && (
                  <div ref={emojiPickerRef} className="absolute bottom-full right-0 mb-2 z-50">
                    <EmojiPicker
                      onEmojiClick={onEmojiClick}
                      autoFocusSearch={false}
                      theme="light"
                      width={350}
                      height={400}
                      previewConfig={{
                        showPreview: false
                      }}
                    />
                  </div>
                )}
              </div>
            <button
              type="submit"
              disabled={!message.trim() || !socketConnected}
              className="h-11 w-11 rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transform hover:scale-105 disabled:hover:scale-100"
              title="Send message"
            >
              <Send className="h-5 w-5" />
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Otherwise, wrap in Layout for standalone use
  if (!currentChat) {
    return (
      <Layout>
        <div className="max-w-5xl mx-auto h-[calc(100vh-120px)] flex flex-col">
          <div className="h-full flex items-center justify-center bg-white">
            <div className="text-center">
              <Loader className="h-8 w-8 animate-spin text-primary-600 mx-auto mb-4" />
              <p className="text-gray-500">Loading chat...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-5xl mx-auto h-[calc(100vh-120px)] flex flex-col">
        <div className="h-full w-full flex flex-col bg-gray-50 overflow-hidden">
          {/* Chat Header - Platform Primary */}
          <div className="flex-shrink-0 bg-gradient-to-r from-primary-600 to-primary-700 px-4 py-3 shadow-md z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {!embedded && (
                  <button
                    onClick={() => navigate(-1)}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors mr-1"
                    title="Go back"
                  >
                    <ArrowLeft className="h-5 w-5 text-white" />
                  </button>
                )}
                <div className="relative">
                  {getProfilePictureUrl(currentChat.otherUser?.profilePicture) ? (
                    <img
                      src={getProfilePictureUrl(currentChat.otherUser.profilePicture)}
                      alt={currentChat.otherUser.name}
                      className="h-10 w-10 rounded-full object-cover border-2 border-white/30"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center border-2 border-white/30">
                      <User className="h-5 w-5 text-white" />
                    </div>
                  )}
                  {socketConnected && (
                    <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 border-2 border-white rounded-full"></div>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-white text-base">{currentChat.otherUser?.name}</h3>
                  <p className="text-xs text-white/90 flex items-center">
                  {otherUserOnline ? (
                    <>
                      <span className="h-2 w-2 bg-green-400 rounded-full mr-1.5"></span>
                      Online
                    </>
                  ) : (
                    <>
                      <span className="h-2 w-2 bg-gray-400 rounded-full mr-1.5"></span>
                      Offline
                    </>
                  )}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Messages Area - Platform Style */}
          <div className="flex-1 bg-gray-50 overflow-hidden min-h-0">
            <div 
              ref={messagesContainerRef}
              className="h-full overflow-y-auto px-4 py-4 space-y-3 custom-scrollbar"
            >
              {isLoading && messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <Loader className="h-8 w-8 animate-spin text-primary-600 mx-auto mb-3" />
                    <p className="text-gray-500">Loading messages...</p>
                  </div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center max-w-md px-4">
                    <div className="h-16 w-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Send className="h-8 w-8 text-primary-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No messages yet</h3>
                    <p className="text-gray-600">Start the conversation by sending a message!</p>
                  </div>
                </div>
              ) : (
                messages.map((msg, index) => {
                  const isOwnMessage = msg.senderId === user.id;
                  const showAvatar = !isOwnMessage && (
                    index === 0 || 
                    messages[index - 1].senderId !== msg.senderId
                  );
                  
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} group`}
                    >
                      <div className={`flex items-end space-x-1 ${isOwnMessage ? 'flex-row-reverse space-x-reverse' : ''}`}>
                        {!isOwnMessage && (
                          <div className="flex-shrink-0 mb-1">
                            {showAvatar ? (
                              getProfilePictureUrl(msg.sender?.profilePicture) ? (
                                <img
                                  src={getProfilePictureUrl(msg.sender.profilePicture)}
                                  alt={msg.sender.name}
                                  className="h-8 w-8 rounded-full object-cover border-2 border-white shadow-sm"
                                />
                              ) : (
                                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-sm border-2 border-white">
                                  <User className="h-4 w-4 text-white" />
                                </div>
                              )
                            ) : (
                              <div className="h-8 w-8"></div>
                            )}
                          </div>
                        )}
                        <div className={`relative px-4 py-2.5 rounded-2xl shadow-sm ${
                          isOwnMessage 
                            ? 'bg-gradient-to-br from-primary-600 to-primary-700 text-white rounded-br-md' 
                            : 'bg-white text-gray-900 border border-gray-200 rounded-bl-md'
                        }`}>
                          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{msg.message}</p>
                          <div className={`flex items-center justify-end mt-1.5 space-x-1 ${
                            isOwnMessage ? 'text-primary-100' : 'text-gray-500'
                          }`}>
                            <span className="text-xs">{formatTime(msg.createdAt)}</span>
                            {isOwnMessage && (
                              <span className="ml-1">
                                {(() => {
                                  // Priority: isRead > receiverIsOnline
                                  // If message is read, always show double blue check (regardless of receiverIsOnline)
                                  if (msg.isRead) {
                                    return <CheckCheck className="h-3.5 w-3.5 text-blue-400" />;
                                  }
                                  
                                  // Message is not read - check receiver's online status
                                  // If receiverIsOnline is undefined, check current online status
                                  const receiverOnline = msg.receiverIsOnline !== undefined 
                                    ? msg.receiverIsOnline 
                                    : otherUserOnline;
                                  
                                  // If receiver is online but message not read, show double gray check
                                  if (receiverOnline) {
                                    return <CheckCheck className="h-3.5 w-3.5 text-gray-400" />;
                                  }
                                  
                                  // If receiver is offline and message not read, show single gray check
                                  return <Check className="h-3.5 w-3.5 text-gray-400" />;
                                })()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              {otherUserTyping && (
                <div className="flex justify-start">
                  <div className="bg-white rounded-lg rounded-tl-none px-3 py-2 shadow-sm">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms', animationDuration: '1.4s' }}></div>
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '200ms', animationDuration: '1.4s' }}></div>
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '400ms', animationDuration: '1.4s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Message Input - Platform Style */}
          <div className="flex-shrink-0 bg-white px-4 py-3 border-t border-gray-200 shadow-sm">
            {!socketConnected && (
              <div className="mb-2 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                <p className="text-sm text-red-700">Not connected. Please refresh the page.</p>
              </div>
            )}
            <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
              <div className="flex-1 relative">
                <input
                  ref={inputRef}
                  key={`input-${loanRequestId}`}
                  type="text"
                  value={message}
                  onChange={handleTyping}
                  placeholder="Type a message..."
                  className="w-full px-4 py-3 pr-20 rounded-xl bg-gray-50 border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm text-gray-900 placeholder-gray-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition-all"
                  disabled={!socketConnected}
                  autoComplete="off"
                  autoFocus={false}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(e);
                    }
                  }}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-2">
                  <button
                    type="button"
                    data-emoji-button
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                    title="Add emoji"
                  >
                    <Smile className="h-5 w-5" />
                  </button>
                  {message.trim() && (
                    <button
                      type="button"
                      onClick={() => {
                        setMessage('');
                        inputRef.current?.focus();
                      }}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <span className="text-lg">×</span>
                    </button>
                  )}
                </div>
                {/* Emoji Picker */}
                {showEmojiPicker && (
                  <div ref={emojiPickerRef} className="absolute bottom-full right-0 mb-2 z-50">
                    <EmojiPicker
                      onEmojiClick={onEmojiClick}
                      autoFocusSearch={false}
                      theme="light"
                      width={350}
                      height={400}
                      previewConfig={{
                        showPreview: false
                      }}
                    />
                  </div>
                )}
              </div>
              <button
                type="submit"
                disabled={!message.trim() || !socketConnected}
                className="h-11 w-11 rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transform hover:scale-105 disabled:hover:scale-100"
                title="Send message"
              >
                <Send className="h-5 w-5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ChatInterface;

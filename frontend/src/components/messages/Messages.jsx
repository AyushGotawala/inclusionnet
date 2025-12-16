import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { getActiveChats, updateMessageReadStatus } from '../../store/slices/chatSlice';
import ChatInterface from '../chat/ChatInterface';
import Layout from '../Layout';
import { MessageSquare, Search, User, Loader, AlertCircle, ArrowLeft } from 'lucide-react';
import { io } from 'socket.io-client';

const Messages = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loanRequestId } = useParams();
  const { user } = useSelector((state) => state.auth);
  const { activeChats, isLoading } = useSelector((state) => state.chat);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChat, setSelectedChat] = useState(null);

  // Load active chats on mount
  useEffect(() => {
    dispatch(getActiveChats());
  }, [dispatch]);

  // Listen for messages_read events to update unread count in real-time
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const socket = io('http://localhost:4000', {
      auth: {
        token: token
      },
      transports: ['websocket', 'polling']
    });

    socket.on('connect', () => {
      console.log('✅ Messages component connected to socket');
    });

    socket.on('messages_read', (data) => {
      // Update unread count when messages are read
      if (data.messageIds && data.messageIds.length > 0) {
        dispatch(updateMessageReadStatus({ 
          messageIds: data.messageIds,
          loanRequestId: data.loanRequestId 
        }));
      }
    });

    return () => {
      socket.close();
    };
  }, [dispatch]);

  // Set selected chat from URL param
  useEffect(() => {
    if (loanRequestId && activeChats.length > 0) {
      const chat = activeChats.find(c => c.loanRequestId === Number(loanRequestId));
      if (chat) {
        setSelectedChat(chat);
      } else {
        // If chat not found in active chats, still allow viewing (might be loading)
        setSelectedChat({ loanRequestId: Number(loanRequestId) });
      }
    } else if (!loanRequestId) {
      setSelectedChat(null);
    }
  }, [loanRequestId, activeChats]);

  const getProfilePictureUrl = (profilePicture) => {
    if (!profilePicture) return null;
    if (profilePicture.startsWith('http')) return profilePicture;
    return `http://localhost:4000${profilePicture}`;
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
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

  const getOtherUser = (chat) => {
    // Backend already provides otherUser, use it directly
    return chat.otherUser || (user?.role === 'BORROWER' ? chat.lender : chat.borrower);
  };

  const getLastMessage = (chat) => {
    if (chat.lastMessage) {
      return chat.lastMessage.message;
    }
    return 'No messages yet';
  };

  const filteredChats = activeChats.filter(chat => {
    if (!searchQuery) return true;
    const otherUser = getOtherUser(chat);
    const searchLower = searchQuery.toLowerCase();
    return (
      otherUser?.name?.toLowerCase().includes(searchLower) ||
      getLastMessage(chat).toLowerCase().includes(searchLower)
    );
  });

  const handleChatSelect = (chat) => {
    setSelectedChat(chat);
    navigate(`/messages/${chat.loanRequestId}`);
  };

  return (
    <Layout>
      <div className="h-full flex bg-white overflow-hidden" style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        {/* Left Sidebar - Chat List */}
        <div className={`w-full md:w-96 lg:w-[420px] border-r border-gray-300 flex flex-col bg-white transition-transform duration-300 ${
          selectedChat ? 'hidden md:flex' : 'flex'
        }`}>
          {/* Sidebar Header - Platform Primary */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-4 py-3 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-white flex items-center">
                <MessageSquare className="h-5 w-5 mr-2" />
                Messages
              </h2>
            </div>
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/95 backdrop-blur-sm text-gray-900 placeholder-gray-500 text-sm border-0 focus:outline-none focus:ring-2 focus:ring-white/50 shadow-sm"
              />
            </div>
          </div>

          {/* Chat List */}
          <div className="flex-1 overflow-y-auto custom-scrollbar bg-white">
            {isLoading && activeChats.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Loader className="h-8 w-8 animate-spin text-[#00A884] mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">Loading conversations...</p>
                </div>
              </div>
            ) : filteredChats.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center max-w-xs px-4">
                  <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-base font-medium text-gray-900 mb-1">
                    {searchQuery ? 'No conversations found' : 'No conversations yet'}
                  </h3>
                  <p className="text-gray-500 text-sm">
                    {searchQuery 
                      ? 'Try a different search term' 
                      : 'Start a conversation by accepting a loan request'}
                  </p>
                </div>
              </div>
            ) : (
              <div>
                {filteredChats.map((chat) => {
                  const otherUser = getOtherUser(chat);
                  const isSelected = selectedChat?.loanRequestId === chat.loanRequestId;
                  const unreadCount = chat.unreadCount || 0;

                  return (
                    <div
                      key={chat.loanRequestId}
                      onClick={() => handleChatSelect(chat)}
                      className={`px-4 py-2.5 cursor-pointer transition-colors duration-150 border-b border-gray-100 ${
                        isSelected 
                          ? 'bg-[#F0F2F5]' 
                          : 'hover:bg-gray-50 active:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        {/* Profile Picture */}
                        <div className="relative flex-shrink-0">
                          {getProfilePictureUrl(otherUser?.profilePicture) ? (
                            <img
                              src={getProfilePictureUrl(otherUser.profilePicture)}
                              alt={otherUser?.name || 'User'}
                              className="h-12 w-12 rounded-full object-cover"
                              onError={(e) => {
                                console.error('Image load error:', e);
                                e.target.style.display = 'none';
                                e.target.nextElementSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div className={`h-12 w-12 rounded-full bg-[#DFE5E9] flex items-center justify-center ${getProfilePictureUrl(otherUser?.profilePicture) ? 'hidden' : ''}`}>
                            {otherUser?.name ? (
                              <span className="text-lg font-semibold text-gray-700">
                                {otherUser.name.charAt(0).toUpperCase()}
                              </span>
                            ) : (
                              <User className="h-6 w-6 text-gray-600" />
                            )}
                          </div>
                        </div>

                        {/* Chat Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5">
                            <h3 className="text-base font-medium text-gray-900 truncate">
                              {otherUser?.name || 'Unknown User'}
                            </h3>
                            {chat.lastMessage && (
                              <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                                {formatTime(chat.lastMessage.createdAt)}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center justify-between">
                            <p className={`text-sm truncate ${
                              unreadCount > 0 ? 'text-gray-900 font-medium' : 'text-gray-600'
                            }`}>
                              {getLastMessage(chat)}
                            </p>
                            {unreadCount > 0 && (
                              <div className="ml-2 h-5 w-5 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                                <span className="text-xs font-semibold text-white">{unreadCount > 9 ? '9+' : unreadCount}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Side - Chat Interface */}
        <div className={`flex-1 flex flex-col bg-gray-50 overflow-hidden min-h-0 ${selectedChat ? 'flex' : 'hidden md:flex'}`}>
          {selectedChat && selectedChat.loanRequestId ? (
            <div className="flex-1 flex flex-col overflow-hidden min-h-0 relative">
              {/* Back button for mobile */}
              <button
                onClick={() => {
                  setSelectedChat(null);
                  navigate('/messages');
                }}
                className="md:hidden absolute top-4 left-4 z-10 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <ChatInterface loanRequestId={selectedChat.loanRequestId} embedded={true} />
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
              <div className="text-center max-w-md px-4">
                <div className="h-20 w-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <MessageSquare className="h-10 w-10 text-primary-600" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-3">Select a conversation</h3>
                <p className="text-gray-600">
                  Choose a conversation from the sidebar to start chatting
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Messages;

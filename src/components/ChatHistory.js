import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getChatList, deleteChat, clearAllChats, setCurrentChatId } from '../utils/chatDatabase';
import './ChatHistory.css';

const ChatHistory = ({ isOpen, onClose, onSelectHistoryChat }) => {
  const [chatList, setChatList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load chat list when the component mounts or when isOpen changes
  useEffect(() => {
    if (isOpen) {
      loadChatList();
    }
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  // Function to load chat list
  const loadChatList = useCallback(async () => {
    try {
      setLoading(true);
      const chats = await getChatList();
      console.log(`ChatHistory: Loaded ${chats.length} chats`);
      setChatList(chats);
      setError(null);
    } catch (err) {
      console.error('Error loading chat list:', err);
      setError('Failed to load chat history. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Function to delete a specific chat
  const handleDeleteChat = async (chatId, e) => {
    e.stopPropagation(); // Prevent triggering the chat selection
    try {
      await deleteChat(chatId);
      setChatList(prevList => prevList.filter(chat => chat.chatId !== chatId));
    } catch (err) {
      console.error('Error deleting chat:', err);
      setError('Failed to delete chat. Please try again.');
    }
  };

  // Function to clear all chats
  const handleClearAllChats = async () => {
    try {
      await clearAllChats();
      setChatList([]);
    } catch (err) {
      console.error('Error clearing all chats:', err);
      setError('Failed to clear chat history. Please try again.');
    }
  };

  // Function to handle chat selection
  const handleSelectChat = (chatId) => {
    console.log(`ChatHistory: Selected chat with ID ${chatId}`);
    
    // First set the current chat ID in localStorage
    setCurrentChatId(chatId);
    
    // Then call the onSelectHistoryChat callback directly with the chatId
    if (typeof onSelectHistoryChat === 'function') {
      onSelectHistoryChat(chatId);
    } else {
      console.error('ChatHistory: onSelectHistoryChat is not a function', onSelectHistoryChat);
    }
    
    // Close the history panel
    if (typeof onClose === 'function') {
      onClose();
    }
  };

  // Format date for display
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      
      if (date.toDateString() === yesterday.toDateString()) {
        return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
      } else {
        return date.toLocaleDateString([], { 
          month: 'short', 
          day: 'numeric',
          year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
        });
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="chat-history-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div 
            className="chat-history-modal"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
          >
            <div className="chat-history-header">
              <h2><i className="fas fa-history"></i> Chat History</h2>
              <div className="chat-history-actions">
                <button 
                  className="clear-history-btn"
                  onClick={handleClearAllChats}
                  disabled={chatList.length === 0}
                >
                  <i className="fas fa-trash"></i> Clear All
                </button>
                <button className="close-history-btn" onClick={onClose}>
                  <i className="fas fa-times"></i>
                </button>
              </div>
            </div>
            
            <div className="chat-history-content">
              {loading ? (
                <div className="chat-history-loading">
                  <div className="loading-spinner"></div>
                  <p>Loading chat history...</p>
                </div>
              ) : error ? (
                <div className="chat-history-error">
                  <i className="fas fa-exclamation-circle"></i>
                  <p>{error}</p>
                  <button onClick={loadChatList} className="retry-button">
                    <i className="fas fa-redo"></i> Retry
                  </button>
                </div>
              ) : chatList.length === 0 ? (
                <div className="chat-history-empty">
                  <i className="fas fa-comments"></i>
                  <p>No chat history yet. Start a conversation with the AI assistant!</p>
                </div>
              ) : (
                <div className="chat-list">
                  {chatList.map((chat) => (
                    <motion.div 
                      key={chat.chatId} 
                      className="chat-list-item"
                      onClick={() => handleSelectChat(chat.chatId)}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                      whileHover={{ x: 5 }}
                    >
                      <div className="chat-info">
                        <div className="chat-title">{chat.title}</div>
                        <div className="chat-meta">
                          <span className="chat-date">{formatDate(chat.updatedAt)}</span>
                          <span className="chat-message-count">{chat.messageCount} messages</span>
                        </div>
                      </div>
                      <button 
                        className="delete-chat-btn" 
                        onClick={(e) => handleDeleteChat(chat.chatId, e)}
                        title="Delete chat"
                      >
                        <i className="fas fa-trash-alt"></i>
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ChatHistory;
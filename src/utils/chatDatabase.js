import CryptoJS from 'crypto-js';

// Generate a unique session ID for the current browser session
const generateSessionId = () => {
  if (!localStorage.getItem('chatSessionId')) {
    const sessionId = Math.random().toString(36).substring(2, 15) + 
                     Math.random().toString(36).substring(2, 15);
    localStorage.setItem('chatSessionId', sessionId);
    console.log(`Generated new session ID: ${sessionId.substring(0, 5)}...`);
  }
  return localStorage.getItem('chatSessionId');
};

// Generate a unique chat ID
export const generateChatId = () => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

// Get current active chat ID
export const getCurrentChatId = () => {
  const currentId = localStorage.getItem('currentChatId');
  
  if (!currentId) {
    const chatId = generateChatId();
    console.log(`getCurrentChatId: No chat ID found, generating new one: ${chatId}`);
    localStorage.setItem('currentChatId', chatId);
    return chatId;
  }
  
  console.log(`getCurrentChatId: Retrieved existing chat ID: ${currentId}`);
  return currentId;
};

// Set current active chat ID
export const setCurrentChatId = (chatId) => {
  console.log(`setCurrentChatId: Setting current chat ID to ${chatId}`);
  localStorage.setItem('currentChatId', chatId);
};

// Encrypt data with session-specific key
const encryptData = (data) => {
  const sessionId = generateSessionId();
  return CryptoJS.AES.encrypt(JSON.stringify(data), sessionId).toString();
};

// Decrypt data with session-specific key
const decryptData = (encryptedData) => {
  try {
    const sessionId = generateSessionId();
    const bytes = CryptoJS.AES.decrypt(encryptedData, sessionId);
    const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
    
    if (!decryptedString) {
      throw new Error('Decryption resulted in empty string');
    }
    
    return JSON.parse(decryptedString);
  } catch (error) {
    console.error('Error decrypting data:', error);
    throw error;
  }
};

// Initialize IndexedDB for chat storage
const initDatabase = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('CurtisChatDB', 2);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // Create chats object store
      if (!db.objectStoreNames.contains('chats')) {
        const chatStore = db.createObjectStore('chats', { keyPath: 'id', autoIncrement: true });
        chatStore.createIndex('sessionId', 'sessionId', { unique: false });
        chatStore.createIndex('chatId', 'chatId', { unique: false });
        chatStore.createIndex('timestamp', 'timestamp', { unique: false });
      }
      
      // Create chat metadata store
      if (!db.objectStoreNames.contains('chatMetadata')) {
        const metadataStore = db.createObjectStore('chatMetadata', { keyPath: 'chatId' });
        metadataStore.createIndex('sessionId', 'sessionId', { unique: false });
        metadataStore.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
    
    request.onsuccess = (event) => {
      const db = event.target.result;
      resolve(db);
    };
    
    request.onerror = (event) => {
      console.error('IndexedDB error:', event.target.error);
      reject(event.target.error);
    };
  });
};

// Save a chat message to the database
export const saveChatMessage = async (message, isUser, chatId = getCurrentChatId()) => {
  try {
    const db = await initDatabase();
    const sessionId = generateSessionId();
    
    return new Promise(async (resolve, reject) => {
      const transaction = db.transaction(['chats', 'chatMetadata'], 'readwrite');
      const chatStore = transaction.objectStore('chats');
      const metadataStore = transaction.objectStore('chatMetadata');
      
      const encryptedMessage = encryptData({
        message,
        isUser,
        timestamp: new Date().toISOString()
      });
      
      const messageRequest = chatStore.add({
        sessionId,
        chatId,
        encryptedData: encryptedMessage,
        timestamp: new Date().getTime()
      });
      
      messageRequest.onsuccess = async () => {
        // Update or create chat metadata
        try {
          const metadataRequest = metadataStore.get(chatId);
          
          metadataRequest.onsuccess = () => {
            const metadata = metadataRequest.result;
            const now = new Date().getTime();
            
            if (!metadata) {
              // Create new metadata if this is the first message in the chat
              // Always use "New Chat" as the initial title
              // The title will be updated with the first user message later
              const title = "New Chat";
              const encryptedTitle = encryptData({ title });
              
              metadataStore.add({
                chatId,
                sessionId,
                encryptedTitle,
                messageCount: 1,
                createdAt: now,
                updatedAt: now
              });
            } else {
              // Update existing metadata
              metadata.messageCount = (metadata.messageCount || 0) + 1;
              metadata.updatedAt = now;
              
              // If this is a user message and either:
              // 1. The title is still "New Chat"
              // 2. This is the first user message (messageCount is 2 because AI greeting is first)
              // Then update the title with this user message
              if (isUser) {
                try {
                  const decryptedTitle = decryptData(metadata.encryptedTitle);
                  if (decryptedTitle.title === "New Chat" || metadata.messageCount === 2) {
                    metadata.encryptedTitle = encryptData({ title: message });
                  }
                } catch (e) {
                  console.error('Error updating chat title:', e);
                }
              }
              
              metadataStore.put(metadata);
            }
            
            resolve(messageRequest.result);
          };
          
          metadataRequest.onerror = () => reject(metadataRequest.error);
        } catch (error) {
          console.error('Error updating chat metadata:', error);
          reject(error);
        }
      };
      
      messageRequest.onerror = () => reject(messageRequest.error);
    });
  } catch (error) {
    console.error('Error saving chat message:', error);
    throw error;
  }
};

// Get all chat messages for a specific chat
export const getChatMessages = async (chatId = getCurrentChatId()) => {
  try {
    console.log(`getChatMessages: Retrieving messages for chat ID ${chatId}`);
    const db = await initDatabase();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['chats'], 'readonly');
      const chatStore = transaction.objectStore('chats');
      const chatIndex = chatStore.index('chatId');
      
      // Verify the chatId is valid before proceeding
      if (!chatId || typeof chatId !== 'string' || chatId.trim() === '') {
        console.error('getChatMessages: Invalid chatId provided:', chatId);
        resolve([]);
        return;
      }
      
      console.log(`getChatMessages: Using index to get messages for ${chatId}`);
      const request = chatIndex.getAll(chatId);
      
      request.onsuccess = () => {
        const encryptedChats = request.result;
        console.log(`getChatMessages: Found ${encryptedChats.length} encrypted messages`);
        
        if (encryptedChats.length === 0) {
          console.log(`getChatMessages: No messages found for chat ID ${chatId}`);
          resolve([]);
          return;
        }
        
        try {
          const decryptedChats = encryptedChats.map(chat => {
            try {
              const decryptedData = decryptData(chat.encryptedData);
              return {
                id: chat.id,
                chatId: chat.chatId,
                ...decryptedData
              };
            } catch (e) {
              console.error('Error decrypting chat message:', e);
              return null;
            }
          }).filter(chat => chat !== null);
          
          // Sort by timestamp
          decryptedChats.sort((a, b) => 
            new Date(a.timestamp) - new Date(b.timestamp)
          );
          
          console.log(`getChatMessages: Successfully decrypted ${decryptedChats.length} messages`);
          resolve(decryptedChats);
        } catch (e) {
          console.error('Error processing chat messages:', e);
          resolve([]);
        }
      };
      
      request.onerror = (error) => {
        console.error('Error in getChatMessages request:', error);
        reject(request.error);
      };
    });
  } catch (error) {
    console.error('Error getting chat messages:', error);
    return [];
  }
};

// Get all chat metadata (list of chats)
export const getChatList = async () => {
  try {
    const db = await initDatabase();
    const sessionId = generateSessionId();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['chatMetadata'], 'readonly');
      const metadataStore = transaction.objectStore('chatMetadata');
      const sessionIndex = metadataStore.index('sessionId');
      
      const request = sessionIndex.getAll(sessionId);
      
      request.onsuccess = () => {
        const encryptedMetadata = request.result;
        console.log(`getChatList: Found ${encryptedMetadata.length} chats for session`);
        
        try {
          // Decrypt and process metadata
          const decryptedList = encryptedMetadata.map(metadata => {
            try {
              const decryptedTitle = decryptData(metadata.encryptedTitle);
              return {
                chatId: metadata.chatId,
                title: decryptedTitle.title,
                messageCount: metadata.messageCount || 0,
                createdAt: metadata.createdAt,
                updatedAt: metadata.updatedAt
              };
            } catch (e) {
              console.error('Error decrypting chat metadata:', e);
              return {
                chatId: metadata.chatId,
                title: 'Chat ' + metadata.chatId.substring(0, 5),
                messageCount: metadata.messageCount || 0,
                createdAt: metadata.createdAt,
                updatedAt: metadata.updatedAt
              };
            }
          });
          
          // Sort by updated timestamp (newest first)
          decryptedList.sort((a, b) => b.updatedAt - a.updatedAt);
          
          console.log(`getChatList: Successfully processed ${decryptedList.length} chats`);
          resolve(decryptedList);
        } catch (e) {
          console.error('Error processing chat list:', e);
          resolve([]);
        }
      };
      
      request.onerror = () => {
        console.error('Error in getChatList request:', request.error);
        reject(request.error);
      };
    });
  } catch (error) {
    console.error('Error getting chat list:', error);
    return [];
  }
};

// Delete a specific chat
export const deleteChat = async (chatId) => {
  try {
    const db = await initDatabase();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['chats', 'chatMetadata'], 'readwrite');
      const chatStore = transaction.objectStore('chats');
      const metadataStore = transaction.objectStore('chatMetadata');
      const chatIndex = chatStore.index('chatId');
      
      // Delete metadata
      metadataStore.delete(chatId);
      
      // Delete all messages for this chat
      const messagesRequest = chatIndex.openKeyCursor(chatId);
      
      messagesRequest.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          chatStore.delete(cursor.primaryKey);
          cursor.continue();
        } else {
          resolve();
        }
      };
      
      messagesRequest.onerror = () => reject(messagesRequest.error);
    });
  } catch (error) {
    console.error('Error deleting chat:', error);
    throw error;
  }
};

// Delete all chats for the current session
export const clearAllChats = async () => {
  try {
    const db = await initDatabase();
    const sessionId = generateSessionId();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['chats', 'chatMetadata'], 'readwrite');
      const chatStore = transaction.objectStore('chats');
      const metadataStore = transaction.objectStore('chatMetadata');
      
      const sessionChatIndex = chatStore.index('sessionId');
      const sessionMetadataIndex = metadataStore.index('sessionId');
      
      // Delete all messages
      const messagesRequest = sessionChatIndex.openKeyCursor(sessionId);
      messagesRequest.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          chatStore.delete(cursor.primaryKey);
          cursor.continue();
        }
      };
      
      // Delete all metadata
      const metadataRequest = sessionMetadataIndex.openKeyCursor(sessionId);
      metadataRequest.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          metadataStore.delete(cursor.primaryKey);
          cursor.continue();
        } else {
          resolve();
        }
      };
      
      messagesRequest.onerror = () => reject(messagesRequest.error);
      metadataRequest.onerror = () => reject(metadataRequest.error);
    });
  } catch (error) {
    console.error('Error clearing all chats:', error);
    throw error;
  }
}; 
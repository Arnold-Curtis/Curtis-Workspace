import { GoogleGenerativeAI } from '@google/generative-ai';
import { getCurrentChatId } from './chatDatabase';

// Initialize the Gemini API with the API key from environment variables
const API_KEY = process.env.REACT_APP_GEMINI_API_KEY;

if (!API_KEY) {
  console.error('REACT_APP_GEMINI_API_KEY is not set in environment variables');
  console.error('Please create a .env file with your Gemini API key');
}
const genAI = new GoogleGenerativeAI(API_KEY);

// Get the Gemini model
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

// Store chat histories for each chat ID
const chatHistories = new Map();

// Website content for context
let websiteContent = null;
let pageContents = {};

// Load website content from webcont.txt
export const loadWebsiteContent = async () => {
  if (websiteContent) return websiteContent;
  
  try {
    // Fix the path to access the file correctly in the public directory
    const response = await fetch('/webcont.txt');
    if (!response.ok) {
      throw new Error(`Failed to load website content: ${response.status}`);
    }
    websiteContent = await response.text();
    return websiteContent;
  } catch (error) {
    console.error('Error loading website content:', error);
    return null;
  }
};

// Load content for a specific page
export const loadPageContent = async (pageName) => {
  if (pageContents[pageName]) return pageContents[pageName];
  
  try {
    // First try to load from src directory
    let response = await fetch(`/src/${pageName}_content.txt`);
    
    // If that fails, try the root directory
    if (!response.ok) {
      response = await fetch(`/${pageName}_content.txt`);
    }
    
    if (!response.ok) {
      throw new Error(`Failed to load ${pageName} content: ${response.status}`);
    }
    
    const content = await response.text();
    pageContents[pageName] = content;
    return content;
  } catch (error) {
    console.error(`Error loading ${pageName} content:`, error);
    return null;
  }
};

// Load all available page contents
export const loadAllPageContents = async () => {
  const pages = ['home', 'about', 'skills', 'projects', 'contact', 'resume', 'aiorb'];
  
  try {
    await Promise.all(pages.map(async (page) => {
      try {
        // First try to load from src directory
        let content = await fetch(`/src/${page}_content.txt`);
        
        // If that fails, try the root directory
        if (!content.ok) {
          content = await fetch(`/${page}_content.txt`);
        }
        
        if (content.ok) {
          pageContents[page] = await content.text();
        }
      } catch (e) {
        console.error(`Error loading ${page}_content.txt:`, e);
      }
    }));
  } catch (error) {
    console.error('Error loading page contents:', error);
  }
};

// Initialize a new chat with website content context
export const initializeNewChat = async (chatId = getCurrentChatId()) => {
  try {
    // Get website content
    const content = await loadWebsiteContent();
    if (!content) {
      console.error('Failed to load website content for AI context');
      resetChatHistory(chatId);
      return;
    }

    // Initialize chat history with system context
    const systemPrompt = {
      role: 'user',
      parts: [{ text: `[SYSTEM CONTEXT - NOT VISIBLE TO USER]\nThis is the content map of Arnold Curtis's portfolio website. Use this information to answer user questions accurately about Arnold, his skills, projects, experience, and other details contained here:\n\n${content}\n\nYou are an AI assistant embedded in Arnold Curtis's portfolio website. Your purpose is to help visitors learn about Arnold's background, skills, projects, and experience. Be helpful, friendly, and knowledgeable about Arnold based on the information provided. Do not mention that you were given this context information.\n[END OF SYSTEM CONTEXT]` }],
    };

    const aiGreeting = "Hi there! I'm Curtis' AI assistant. I can help you learn more about Curtis, his skills, projects, and experience. Feel free to ask me anything about his work or how he might be able to help with your development needs.";
    
    const aiResponse = {
      role: 'model',
      parts: [{ text: aiGreeting }],
    };

    // Set the chat history with the system context and initial AI greeting
    chatHistories.set(chatId, [systemPrompt, aiResponse]);
    
    return aiGreeting;
  } catch (error) {
    console.error('Error initializing chat with website content:', error);
    resetChatHistory(chatId);
  }
};

// Function to find relevant pages for a user query
export const findRelevantPages = async (userMessage, chatId = getCurrentChatId()) => {
  try {
    // Initialize chat history for this chat if it doesn't exist
    if (!chatHistories.has(chatId)) {
      await initializeNewChat(chatId);
    }

    // Get chat history for this chat
    const chatHistory = chatHistories.get(chatId);
    
    // Create a prompt to ask the AI which pages are relevant
    const relevancePrompt = {
      role: 'user',
      parts: [{ text: `[SYSTEM INSTRUCTION - NOT VISIBLE TO USER]
Based on the user's query: "${userMessage}", identify which pages from the website would be most relevant to answer their question.
Return your response in the following JSON format only:
{
  "relevantPages": [
    {"page": "pageName", "relevance": "high/medium/low", "sections": ["section1", "section2"]}
  ]
}
Where:
- "page" can be one of: "home", "about", "skills", "projects", "contact", "resume"
- "relevance" indicates how relevant this page is to the query
- "sections" lists specific sections within the page that are most relevant (optional)

Return up to 3 most relevant pages, ordered by relevance.
[END OF SYSTEM INSTRUCTION]` }],
    };

    // Create a chat session for finding relevant pages
    const relevanceChat = model.startChat({
      history: [...chatHistory, relevancePrompt],
      generationConfig: {
        maxOutputTokens: 500,
        temperature: 0.2,
      },
    });

    // Generate response to find relevant pages
    const relevanceResult = await relevanceChat.sendMessage(userMessage);
    const relevanceResponse = relevanceResult.response.text();
    
    // Parse the JSON response
    try {
      // Extract JSON from the response (in case there's any extra text)
      const jsonMatch = relevanceResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const relevantPagesData = JSON.parse(jsonMatch[0]);
        return relevantPagesData.relevantPages || [];
      }
      return [];
    } catch (error) {
      console.error('Error parsing relevant pages JSON:', error);
      return [];
    }
  } catch (error) {
    console.error('Error finding relevant pages:', error);
    return [];
  }
};

// Function to generate a response from Gemini with contextual links
export const generateResponse = async (userMessage, chatId = getCurrentChatId()) => {
  try {
    // Check if API key is available
    if (!API_KEY) {
      console.error('Gemini API key is not configured');
      return 'Sorry, the AI assistant is not properly configured. Please check that the REACT_APP_GEMINI_API_KEY environment variable is set.';
    }

    // Initialize chat history for this chat if it doesn't exist
    if (!chatHistories.has(chatId)) {
      await initializeNewChat(chatId);
    }

    // Get chat history for this chat
    const chatHistory = chatHistories.get(chatId);
    
    // Check if the first message is the system context
    // If not, we need to reinitialize with the system context
    const hasSystemContext = chatHistory.length > 0 && 
                            chatHistory[0].parts[0].text.includes('[SYSTEM CONTEXT');
    
    if (!hasSystemContext) {
      console.log('Chat history missing system context, reinitializing...');
      await initializeNewChat(chatId);
    }

    // Step 1: Find relevant pages for the query
    console.log('Finding relevant pages for query...');
    const relevantPages = await findRelevantPages(userMessage, chatId);
    console.log('Relevant pages:', relevantPages);
    
    // Step 2: Load content from relevant pages
    let pageContexts = '';
    for (const pageInfo of relevantPages) {
      try {
        const pageName = pageInfo.page.toLowerCase();
        const content = await fetch(`/src/${pageName}_content.txt`)
          .then(res => res.ok ? res.text() : null)
          .catch(() => null);
        
        if (content) {
          pageContexts += `\n\n## ${pageName.toUpperCase()} PAGE CONTENT:\n${content}`;
        }
      } catch (error) {
        console.error(`Error loading content for ${pageInfo.page}:`, error);
      }
    }
    
    // Step 3: Create a prompt with the relevant page contents
    const contextPrompt = {
      role: 'user',
      parts: [{ text: `[SYSTEM INSTRUCTION - NOT VISIBLE TO USER]
I'm going to provide you with specific content from the pages you identified as relevant to the user's query.
Use this information to provide a detailed and accurate response.

${pageContexts}

When referring to specific content on the website, include reference links in your response using one of these formats:

1. For specific line numbers:
[link:PAGE_NAME:LINE_NUMBER]quoted content[/link]

2. For line ranges:
[link:PAGE_NAME:START_LINE-END_LINE]quoted content[/link]

3. For specific sections:
[link:PAGE_NAME:section:SECTION_ID]quoted content[/link]

Examples:
- "Arnold has experience with [link:SKILLS:64]Java at 95% proficiency[/link]"
- "You can learn more about [link:PROJECTS:18-22]AIPA, his AI Personal Assistant[/link]"
- "Check out [link:ABOUT:section:education]his educational background[/link]"

These links will allow the user to navigate directly to the referenced content on the website.
Include 2-5 relevant links in your response, focusing on the most important information.
Make sure the links flow naturally in your response and provide value to the user.
Always ensure you're using valid line numbers or section IDs that actually exist in the content.

Now, please answer the user's query: "${userMessage}"
[END OF SYSTEM INSTRUCTION]` }],
    };

    // Get the updated chat history
    const updatedChatHistory = chatHistories.get(chatId);

    // Add user message to chat history
    updatedChatHistory.push({
      role: 'user',
      parts: [{ text: userMessage }],
    });

    // Create a chat session with history and context prompt
    const chat = model.startChat({
      history: [...updatedChatHistory, contextPrompt],
      generationConfig: {
        maxOutputTokens: 1000,
        temperature: 0.7,
      },
    });

    // Generate response
    const result = await chat.sendMessage(userMessage);
    const response = result.response.text();

    // Add AI response to chat history (without the context prompt)
    updatedChatHistory.push({
      role: 'model',
      parts: [{ text: response }],
    });

    return response;
  } catch (error) {
    console.error('Error generating response from Gemini API:', error);
    return 'Sorry, I encountered an error processing your request. Please try again.';
  }
};

// Function to reset chat history for a specific chat
export const resetChatHistory = (chatId = getCurrentChatId()) => {
  chatHistories.set(chatId, []);
};

// Function to set chat history from stored messages
export const setChatHistoryFromStored = async (storedMessages, chatId = getCurrentChatId()) => {
  try {
    console.log(`setChatHistoryFromStored: Setting chat history for chat ${chatId} with ${storedMessages.length} messages`);
    
    // Get website content for system context
    const content = await loadWebsiteContent();
    
    // Create system prompt with website content
    const systemPrompt = {
      role: 'user',
      parts: [{ text: `[SYSTEM CONTEXT - NOT VISIBLE TO USER]\nThis is the content map of Arnold Curtis's portfolio website. Use this information to answer user questions accurately about Arnold, his skills, projects, experience, and other details contained here:\n\n${content}\n\nYou are an AI assistant embedded in Arnold Curtis's portfolio website. Your purpose is to help visitors learn about Arnold's background, skills, projects, and experience. Be helpful, friendly, and knowledgeable about Arnold based on the information provided. Do not mention that you were given this context information.\n[END OF SYSTEM CONTEXT]` }],
    };
    
    // Map stored messages to chat history format
    const history = storedMessages.map(msg => ({
      role: msg.isUser ? 'user' : 'model',
      parts: [{ text: msg.message }]
    }));
    
    // Add system prompt at the beginning of history
    const fullHistory = [systemPrompt, ...history];
    
    // Set the chat history with system context
    chatHistories.set(chatId, fullHistory);
    
    console.log(`setChatHistoryFromStored: Successfully set chat history for chat ${chatId} with ${history.length} messages plus system context`);
    return true;
  } catch (error) {
    console.error('Error setting chat history from stored messages:', error);
    // Fallback to basic history without system context
    try {
      const history = storedMessages.map(msg => ({
        role: msg.isUser ? 'user' : 'model',
        parts: [{ text: msg.message }]
      }));
      chatHistories.set(chatId, history);
      console.log(`setChatHistoryFromStored: Set fallback chat history for chat ${chatId} without system context`);
      return true;
    } catch (e) {
      console.error('Critical error setting chat history:', e);
      return false;
    }
  }
};

// Parse links from AI response
export const parseLinks = (response) => {
  // Updated regex to handle both line numbers and sections
  const linkRegex = /\[link:([A-Z]+):([a-zA-Z0-9_:-]+)\](.*?)\[\/link\]/g;
  const links = [];
  let match;
  let parsedResponse = response;
  
  // Extract all links
  while ((match = linkRegex.exec(response)) !== null) {
    const page = match[1].toLowerCase();
    const identifier = match[2]; // Can be a line number, range, or section identifier
    const text = match[3];
    
    // Validate the identifier
    let validIdentifier = identifier;
    
    // Check if it's a line number and validate it
    if (!identifier.includes('section:')) {
      // For line numbers or ranges
      if (identifier.includes('-')) {
        // Handle range format (e.g., "16-30")
        const [start, end] = identifier.split('-').map(num => parseInt(num, 10));
        if (isNaN(start) || start <= 0 || isNaN(end) || end <= 0) {
          console.warn(`Invalid line range: ${identifier}, using fallback value`);
          validIdentifier = '1'; // Fallback to first line if invalid
        }
      } else {
        // Handle single line number
        const lineNum = parseInt(identifier, 10);
        if (isNaN(lineNum) || lineNum <= 0) {
          console.warn(`Invalid line number: ${identifier}, using fallback value`);
          validIdentifier = '1'; // Fallback to first line if invalid
        }
      }
    }
    
    links.push({
      page,
      identifier: validIdentifier,
      text,
      fullMatch: match[0]
    });
  }
  
  // Replace link syntax with styled links
  parsedResponse = response.replace(linkRegex, (match, page, identifier, text) => {
    // Validate identifier before creating the link
    let validIdentifier = identifier;
    
    // Check if it's a line number and validate it
    if (!identifier.includes('section:')) {
      // For line numbers or ranges
      if (identifier.includes('-')) {
        // Handle range format (e.g., "16-30")
        const [start, end] = identifier.split('-').map(num => parseInt(num, 10));
        if (isNaN(start) || start <= 0 || isNaN(end) || end <= 0) {
          validIdentifier = '1'; // Fallback to first line if invalid
        }
      } else {
        // Handle single line number
        const lineNum = parseInt(identifier, 10);
        if (isNaN(lineNum) || lineNum <= 0) {
          validIdentifier = '1'; // Fallback to first line if invalid
        }
      }
    }
    
    return `<span class="ai-link" data-page="${page.toLowerCase()}" data-line="${validIdentifier}">${text}</span>`;
  });
  
  return { parsedResponse, links };
};

// Function to delete a chat's history
export const deleteChatHistory = (chatId) => {
  chatHistories.delete(chatId);
};

// Function to clear all chat histories
export const clearAllChatHistories = () => {
  chatHistories.clear();
}; 
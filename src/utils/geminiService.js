import { GoogleGenerativeAI } from '@google/generative-ai';
import { getCurrentChatId } from './chatDatabase';
import { getContentForAI, getAllSectionIds, isValidSectionId, getPageForSection } from './contentRegistry';

// Initialize the Gemini API with the API key from environment variables
const API_KEY = process.env.REACT_APP_GEMINI_API_KEY;

if (!API_KEY) {
  console.error('REACT_APP_GEMINI_API_KEY is not set in environment variables');
  console.error('Please create a .env file with your Gemini API key');
}
const genAI = new GoogleGenerativeAI(API_KEY);

// Get the Gemini model
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

// Store chat histories for each chat ID
const chatHistories = new Map();

// Cached content for AI
let cachedAIContent = null;

/**
 * Get website content for AI context
 * Uses the new contentRegistry instead of text files
 */
const getWebsiteContent = () => {
  if (!cachedAIContent) {
    cachedAIContent = getContentForAI();
  }
  return cachedAIContent;
};

/**
 * Build the system prompt with available section references
 */
const buildSystemPrompt = () => {
  const content = getWebsiteContent();
  const sectionIds = getAllSectionIds();

  const sectionList = sectionIds.map(id => {
    const parts = id.split('.');
    const page = parts[0];
    const section = parts.slice(1).join('.');
    return `  - ${id} (${page} page - ${section})`;
  }).join('\n');

  return `[SYSTEM CONTEXT - NOT VISIBLE TO USER]
You are Arnold Curtis's portfolio AI assistant. You help visitors learn about Arnold's background, skills, projects, and experience.

CONTENT OVERVIEW:
${content}

REFERENCE FORMAT:
When referring to specific content, use clickable references in this format:
[ref:SECTION_ID]text to display[/ref]

Available section IDs you can reference:
${sectionList}

EXAMPLES:
- "Arnold has [ref:skills.languages]strong expertise in Java at 95% proficiency[/ref]"
- "Check out [ref:projects.aipa]AIPA, his AI Personal Assistant[/ref]"
- "Learn about [ref:about.experience]his work experience[/ref]"
- "See [ref:about.education]his educational background[/ref]"

REFERENCE GUIDELINES:
1. Include 2-4 relevant references per response
2. Only use section IDs from the list above
3. Make references flow naturally in your response
4. Reference the most relevant sections for the user's query
5. The text inside [ref:...] tags will be clickable - make it descriptive

TONE:
- Be helpful, friendly, and professional
- Answer questions accurately based on the content provided
- Do not mention that you were given this context information
- If asked about something not in the content, politely say you don't have that information

[END OF SYSTEM CONTEXT]`;
};

/**
 * Initialize a new chat with website content context
 */
export const initializeNewChat = async (chatId = getCurrentChatId()) => {
  try {
    const systemPrompt = buildSystemPrompt();

    // Initialize chat history with system context
    const systemMessage = {
      role: 'user',
      parts: [{ text: systemPrompt }],
    };

    const aiGreeting = "Hi there! I'm Curtis' AI assistant. I can help you learn more about Curtis, his skills, projects, and experience. Feel free to ask me anything about his work or how he might be able to help with your development needs.";

    const aiResponse = {
      role: 'model',
      parts: [{ text: aiGreeting }],
    };

    // Set the chat history with the system context and initial AI greeting
    chatHistories.set(chatId, [systemMessage, aiResponse]);

    return aiGreeting;
  } catch (error) {
    console.error('Error initializing chat with website content:', error);
    resetChatHistory(chatId);
  }
};

/**
 * Generate a response from Gemini with contextual references
 */
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
    const hasSystemContext = chatHistory.length > 0 &&
      chatHistory[0].parts[0].text.includes('[SYSTEM CONTEXT');

    if (!hasSystemContext) {
      console.log('Chat history missing system context, reinitializing...');
      await initializeNewChat(chatId);
    }

    // Get the updated chat history
    const updatedChatHistory = chatHistories.get(chatId);

    // Add user message to chat history
    updatedChatHistory.push({
      role: 'user',
      parts: [{ text: userMessage }],
    });

    // Create a chat session with history
    const chat = model.startChat({
      history: updatedChatHistory,
      generationConfig: {
        maxOutputTokens: 1000,
        temperature: 0.7,
      },
    });

    // Generate response
    const result = await chat.sendMessage(userMessage);
    const response = result.response.text();

    // Add AI response to chat history
    updatedChatHistory.push({
      role: 'model',
      parts: [{ text: response }],
    });

    return response;
  } catch (error) {
    console.error('Error generating response from Gemini API:', error);
    // Provide more specific error messages
    if (error.message?.includes('429') || error.message?.includes('quota')) {
      return 'The AI service has reached its daily limit. Please try again later or contact the site owner to upgrade the API plan.';
    } else if (error.message?.includes('401') || error.message?.includes('API key')) {
      return 'There is an issue with the AI configuration. Please contact the site owner.';
    } else if (error.message?.includes('404')) {
      return 'The AI model is temporarily unavailable. Please try again later.';
    }
    return 'Sorry, I encountered an error processing your request. Please try again.';
  }
};

/**
 * Reset chat history for a specific chat
 */
export const resetChatHistory = (chatId = getCurrentChatId()) => {
  chatHistories.set(chatId, []);
};

/**
 * Set chat history from stored messages
 */
export const setChatHistoryFromStored = async (storedMessages, chatId = getCurrentChatId()) => {
  try {
    console.log(`setChatHistoryFromStored: Setting chat history for chat ${chatId} with ${storedMessages.length} messages`);

    // Build system prompt
    const systemPrompt = buildSystemPrompt();

    // Create system message
    const systemMessage = {
      role: 'user',
      parts: [{ text: systemPrompt }],
    };

    // Map stored messages to chat history format
    const history = storedMessages.map(msg => ({
      role: msg.isUser ? 'user' : 'model',
      parts: [{ text: msg.message }]
    }));

    // Add system prompt at the beginning of history
    const fullHistory = [systemMessage, ...history];

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

/**
 * Parse references from AI response
 * Converts [ref:section.id]text[/ref] to clickable HTML spans
 * Also supports legacy [link:PAGE:LINE]text[/link] format for backward compatibility
 */
export const parseLinks = (response) => {
  const links = [];
  let parsedResponse = response;

  // NEW FORMAT: [ref:section.id]text[/ref]
  const refRegex = /\[ref:([a-z]+\.[a-zA-Z]+)\](.*?)\[\/ref\]/g;
  let match;

  while ((match = refRegex.exec(response)) !== null) {
    const sectionId = match[1];
    const text = match[2];
    const page = getPageForSection(sectionId);

    links.push({
      sectionId,
      page,
      text,
      fullMatch: match[0],
      isNewFormat: true
    });
  }

  // Replace new format references with HTML
  parsedResponse = parsedResponse.replace(refRegex, (match, sectionId, text) => {
    const page = getPageForSection(sectionId);
    const isValid = isValidSectionId(sectionId);

    if (!isValid) {
      console.warn(`Invalid section reference: ${sectionId}`);
      // Still create the link, but log the warning
    }

    return `<span class="ai-ref" data-section="${sectionId}" data-page="${page || sectionId.split('.')[0]}">${text}</span>`;
  });

  // LEGACY FORMAT: [link:PAGE:LINE]text[/link] for backward compatibility
  const legacyLinkRegex = /\[link:([A-Z]+):([a-zA-Z0-9_:-]+)\](.*?)\[\/link\]/g;

  while ((match = legacyLinkRegex.exec(response)) !== null) {
    const page = match[1].toLowerCase();
    const identifier = match[2];
    const text = match[3];

    // Convert legacy format to section ID if possible
    let sectionId = convertLegacyToSection(page, identifier);

    links.push({
      page,
      identifier,
      sectionId,
      text,
      fullMatch: match[0],
      isNewFormat: false
    });
  }

  // Replace legacy format with HTML
  parsedResponse = parsedResponse.replace(legacyLinkRegex, (match, page, identifier, text) => {
    const pageLower = page.toLowerCase();
    const sectionId = convertLegacyToSection(pageLower, identifier);

    if (sectionId) {
      // Use new format if we can convert
      return `<span class="ai-ref" data-section="${sectionId}" data-page="${pageLower}">${text}</span>`;
    } else {
      // Fallback to legacy format
      return `<span class="ai-link" data-page="${pageLower}" data-line="${identifier}">${text}</span>`;
    }
  });

  return { parsedResponse, links };
};

/**
 * Convert legacy line-based reference to section ID
 * This provides backward compatibility for old chat histories
 */
const convertLegacyToSection = (page, identifier) => {
  // Map common legacy references to section IDs
  const legacyMappings = {
    'home': {
      '1-15': 'home.hero',
      '16-25': 'home.buttons'
    },
    'about': {
      '1-10': 'about.bio',
      '11-25': 'about.experience',
      '26-45': 'about.education',
      '46-65': 'about.interests',
      '66-80': 'about.journey',
      '81-95': 'about.philosophy'
    },
    'skills': {
      '16-30': 'skills.technical',
      '31-45': 'skills.frameworks',
      '46-60': 'skills.tools',
      '61-76': 'skills.languages',
      '77-91': 'skills.softSkills'
    },
    'projects': {
      '1-15': 'projects.explorer',
      '16-50': 'projects.aipa',
      '51-85': 'projects.nlrs'
    },
    'contact': {
      '1-20': 'contact.info',
      '21-50': 'contact.form'
    },
    'resume': {
      '1-10': 'resume.header',
      '11-30': 'resume.experience',
      '31-50': 'resume.education',
      '51-75': 'resume.skills'
    }
  };

  // Check for section: prefix
  if (identifier.startsWith('section:')) {
    const sectionName = identifier.replace('section:', '');
    return `${page}.${sectionName}`;
  }

  // Try exact match first
  const pageMappings = legacyMappings[page];
  if (pageMappings && pageMappings[identifier]) {
    return pageMappings[identifier];
  }

  // Try to find a matching range
  if (pageMappings) {
    const lineNum = parseInt(identifier, 10);
    if (!isNaN(lineNum)) {
      for (const [range, sectionId] of Object.entries(pageMappings)) {
        const [start, end] = range.split('-').map(n => parseInt(n, 10));
        if (lineNum >= start && lineNum <= end) {
          return sectionId;
        }
      }
    }
  }

  // Default to first section of page if nothing matches
  const defaultSections = {
    'home': 'home.hero',
    'about': 'about.bio',
    'skills': 'skills.technical',
    'projects': 'projects.explorer',
    'contact': 'contact.info',
    'resume': 'resume.header'
  };

  return defaultSections[page] || null;
};

/**
 * Delete a chat's history
 */
export const deleteChatHistory = (chatId) => {
  chatHistories.delete(chatId);
};

/**
 * Clear all chat histories
 */
export const clearAllChatHistories = () => {
  chatHistories.clear();
};

// Legacy exports for backward compatibility
export const loadWebsiteContent = async () => getWebsiteContent();
export const loadPageContent = async (pageName) => getWebsiteContent();
export const loadAllPageContents = async () => getWebsiteContent();
export const findRelevantPages = async (userMessage, chatId) => [];
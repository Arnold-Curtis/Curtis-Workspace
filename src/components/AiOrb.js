import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { generateResponse, resetChatHistory, setChatHistoryFromStored, initializeNewChat, parseLinks } from '../utils/geminiService';
import {
  saveChatMessage,
  getChatMessages,
  generateChatId,
  getCurrentChatId,
  setCurrentChatId
} from '../utils/chatDatabase';
import { useWindowManager } from './WindowManager';
import ChatHistory from './ChatHistory';
import './AiOrb.css';

// Separate component for AI response content to handle link clicks reliably
// Uses EVENT DELEGATION for maximum reliability - single handler on container
// Supports both new semantic references (.ai-ref) and legacy links (.ai-link)
const AiResponseContent = ({ html, onLinkClick }) => {
  const containerRef = useRef(null);

  // Use event delegation - single click handler on container
  // This eliminates all cleanup/stale reference issues
  const handleContainerClick = useCallback((e) => {
    // Use closest() for reliable element detection - more robust than manual bubbling
    const aiRef = e.target.closest('.ai-ref');
    const aiLink = e.target.closest('.ai-link');

    if (aiRef) {
      e.preventDefault();
      e.stopPropagation();

      const sectionId = aiRef.getAttribute('data-target-section');
      const page = aiRef.getAttribute('data-page');

      console.log(`[AiResponseContent] ai-ref clicked: section=${sectionId}, page=${page}`);

      if (sectionId && onLinkClick) {
        onLinkClick(page || sectionId.split('.')[0], sectionId);
      }
      return;
    }

    if (aiLink) {
      e.preventDefault();
      e.stopPropagation();

      const page = aiLink.getAttribute('data-page');
      const line = aiLink.getAttribute('data-line');

      console.log(`[AiResponseContent] ai-link clicked: page=${page}, line=${line}`);

      if (page && onLinkClick) {
        onLinkClick(page, line);
      }
      return;
    }
  }, [onLinkClick]);

  // Handle touch feedback separately (visual only)
  useEffect(() => {
    if (!containerRef.current) return;

    const handleTouchStart = (e) => {
      const target = e.target.closest('.ai-ref, .ai-link');
      if (target) {
        target.style.transform = 'scale(0.95)';
        target.style.opacity = '0.8';
      }
    };

    const handleTouchEnd = (e) => {
      const target = e.target.closest('.ai-ref, .ai-link');
      if (target) {
        target.style.transform = 'scale(1)';
        target.style.opacity = '1';
      }
    };

    const container = containerRef.current;
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });
    container.addEventListener('touchcancel', handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchend', handleTouchEnd);
      container.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [html]); // Only re-run when html changes (new content)

  return (
    <div
      ref={containerRef}
      className="ai-response"
      onClick={handleContainerClick}
      dangerouslySetInnerHTML={{ __html: html }}
      style={{ cursor: 'default' }}
    />
  );
};

const AiOrb = () => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [initialGreetingShown, setInitialGreetingShown] = useState(false);
  const [dragConstraints, setDragConstraints] = useState({});
  const [isMobile, setIsMobile] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showChatHistory, setShowChatHistory] = useState(false);
  const [currentChatId, setCurrentChat] = useState(getCurrentChatId());
  const [orbPosition, setOrbPosition] = useState({ x: 0, y: 0 });
  const chatRef = useRef(null);
  const inputRef = useRef(null);
  const constraintsRef = useRef(null);
  const messagesEndRef = useRef(null);
  const orbRef = useRef(null);
  // Ref to access current messages without adding to callback dependencies
  const messagesRef = useRef(messages);

  // Drag controls for the chat window header
  const dragControls = useDragControls();

  // Access window manager context and navigation
  const windowManager = useWindowManager();
  const navigate = useNavigate();

  // Log window manager for debugging
  useEffect(() => {
    console.log('AiOrb: WindowManager context initialized:', windowManager);
  }, [windowManager]);

  // Make window manager available globally for use in event handlers
  useEffect(() => {
    window.windowManagerContext = windowManager;
    console.log('AiOrb: WindowManager context set globally');
  }, [windowManager]);

  // Keep messagesRef in sync with messages state
  // This allows handleLinkClickInternal to access current messages without re-creating
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // Check if we're on a mobile device
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth <= 768);

      // Force the orb to be visible on mobile
      if (window.innerWidth <= 768) {
        // Get references to navigation elements
        const topBar = document.querySelector('.TopBar, .top-nav, header');
        const mobileNav = document.querySelector('.MobileNav, .bottom-nav, .footer-mobile');

        // Adjust z-index for navigation elements
        if (mobileNav) {
          mobileNav.style.zIndex = '1000'; // Ensure nav is below orb
        }

        if (topBar) {
          topBar.style.zIndex = '1001'; // Ensure top bar is visible
        }

        // Adjust any overlapping elements
        const adjustMobileLayout = () => {
          const bottomElements = document.querySelectorAll('.MobileNav, .bottom-nav, .footer-mobile');
          bottomElements.forEach(element => {
            if (element) {
              element.style.zIndex = '999';
            }
          });
        };

        adjustMobileLayout();
      }
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);

    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  // NEW ANIMATION SYSTEM: Clean and smooth chat snapping (moved here for correct dependencies)
  const snapChatToSide = useCallback(() => {
    if (!chatRef.current || isMobile) return Promise.resolve();

    return new Promise((resolve) => {
      console.log('Starting new smooth snap animation');

      // Get current position and calculate target position
      const rect = chatRef.current.getBoundingClientRect();
      const topBar = document.querySelector('.TopBar, .top-nav, header');
      const topBarHeight = topBar ? topBar.offsetHeight : 60;

      // Disable drag during animation to prevent conflicts
      const motionDiv = chatRef.current.closest('.drag-area > div');
      if (motionDiv) {
        motionDiv.style.pointerEvents = 'none';
      }

      // Set current position as fixed to prevent any jumps
      const initialStyles = {
        position: 'fixed',
        left: `${rect.left}px`,
        top: `${rect.top}px`,
        width: `${rect.width}px`,
        height: `${rect.height}px`,
        transform: 'none',
        transition: 'none',
        zIndex: '1500'
      };

      Object.assign(chatRef.current.style, initialStyles);

      // Force a reflow to ensure styles are applied
      void chatRef.current.offsetWidth;

      // Add smooth, visible transition with perfect timing - longer duration for sleek movement
      chatRef.current.style.transition = 'all 0.8s cubic-bezier(0.25, 0.1, 0.25, 1)';

      // Small delay to ensure the transition is applied, then animate
      setTimeout(() => {
        const targetStyles = {
          right: '10px',
          left: 'auto',
          top: `${topBarHeight + 20}px`,
          width: '40vw',
          height: `calc(100vh - ${topBarHeight + 88}px)` // +88 = 20px top padding + 48px taskbar + 20px bottom padding
        };

        Object.assign(chatRef.current.style, targetStyles);
        chatRef.current.classList.add('snapped-chat');

        // Re-enable interactions after animation completes
        setTimeout(() => {
          if (motionDiv) {
            motionDiv.style.pointerEvents = '';
          }
          resolve();
        }, 800); // Match the transition duration
      }, 50); // Small delay for smooth transition start
    });
  }, [isMobile]); // No other dependencies needed

  // COMPLETELY REWRITTEN: Handle clicks on AI links WITHOUT page reloads
  const handleLinkClick = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();

    const link = e.currentTarget;
    const page = link.getAttribute('data-page').toLowerCase();
    const lineNumber = link.getAttribute('data-line');

    console.log(`AI Link clicked: page=${page}, line=${lineNumber}, isMobile=${isMobile}`);

    // Mobile handling - simplified and more reliable
    if (isMobile) {
      console.log('Mobile navigation triggered');
      const pageUrl = `/${page === 'home' ? '' : page}`;
      sessionStorage.setItem('highlightLine', lineNumber);

      // Close the chat first on mobile for better UX
      setShowChat(false);

      // Use a small delay to ensure state updates
      setTimeout(() => {
        console.log(`Navigating to: ${pageUrl}`);
        navigate(pageUrl);
      }, 100);
      return;
    }

    // Store chat state and line for preservation
    const currentChatState = {
      messages: messages,
      chatId: currentChatId
    };
    sessionStorage.setItem('preservedChatState', JSON.stringify(currentChatState));
    sessionStorage.setItem('highlightLine', lineNumber);

    // Desktop handling - check if already in snapped mode
    const isAlreadySnapped = windowManager && windowManager.isAiSnapped;

    if (isAlreadySnapped) {
      // Already in snapped mode
      if (windowManager.snappedWindowId === page) {
        // Same page - just update highlight
        const event = new CustomEvent('ai-highlight-request', {
          detail: { lineNumber }
        });
        document.dispatchEvent(event);
        if (inputRef.current) {
          inputRef.current.focus();
        }
        return;
      } else {
        // Different page - use window manager and navigate smoothly
        windowManager.snapWithAi(page);
        const pageUrl = `/${page === 'home' ? '' : page}`;
        navigate(pageUrl);
        return;
      }
    }

    // NOT in snapped mode - need to set up split view and navigate
    const performSplitViewSetup = async () => {
      try {
        console.log('Setting up split view without page reload');

        // 1. IMMEDIATELY set up the window manager split view
        windowManager.snapWithAi(page);

        // 2. Animate the chat to the side
        await snapChatToSide();

        // 3. Navigate using React Router (no page reload!)
        const pageUrl = `/${page === 'home' ? '' : page}`;
        navigate(pageUrl);

        console.log('Split view setup complete - no page reload!');
      } catch (error) {
        console.error('Error during split view setup:', error);
        // Fallback navigation
        const pageUrl = `/${page === 'home' ? '' : page}`;
        navigate(pageUrl);
      }
    };

    if (!showChat) {
      // Chat not open - open it first
      setShowChat(true);
      setTimeout(() => {
        performSplitViewSetup();
      }, 150); // Wait for chat to render
    } else {
      // Chat already open - perform split view immediately
      performSplitViewSetup();
    }
  }, [isMobile, windowManager, showChat, messages, currentChatId, snapChatToSide, navigate]);

  // Simplified handler for AiResponseContent - supports both new semantic refs and legacy line numbers
  const handleLinkClickInternal = useCallback((page, identifier) => {
    const pageLower = page.toLowerCase();

    // Determine if this is a semantic section ID or legacy line number
    const isSectionId = identifier && identifier.includes('.');
    const sectionId = isSectionId ? identifier : null;
    const lineNumber = !isSectionId ? identifier : null;

    console.log(`handleLinkClickInternal: page=${pageLower}, identifier=${identifier}, isSectionId=${isSectionId}, isMobile=${isMobile}`);

    // Mobile handling
    if (isMobile) {
      console.log('Mobile navigation triggered');
      const pageUrl = `/${pageLower === 'home' ? '' : pageLower}`;

      // Store appropriate highlight request
      if (sectionId) {
        sessionStorage.setItem('highlightSection', sectionId);
      } else if (lineNumber) {
        sessionStorage.setItem('highlightLine', lineNumber);
      }

      setShowChat(false);
      setTimeout(() => {
        navigate(pageUrl);
      }, 100);
      return;
    }

    // Desktop: Special case for home - show desktop and exit snap mode
    if (pageLower === 'home') {
      console.log('Home link clicked - showing desktop');
      if (windowManager?.isAiSnapped) {
        // Use global reference to avoid circular dependency
        if (window.exitSnappedModeRef) {
          window.exitSnappedModeRef();
        }
      }
      windowManager?.minimizeAllWindows();
      return;
    }

    // Store chat state - use ref to avoid dependency on messages array
    const currentChatState = { messages: messagesRef.current, chatId: currentChatId };
    sessionStorage.setItem('preservedChatState', JSON.stringify(currentChatState));

    // Store appropriate highlight request
    if (sectionId) {
      sessionStorage.setItem('highlightSection', sectionId);
    } else if (lineNumber) {
      sessionStorage.setItem('highlightLine', lineNumber);
    }

    // Desktop handling
    const isAlreadySnapped = windowManager && windowManager.isAiSnapped;

    if (isAlreadySnapped) {
      if (windowManager.snappedWindowId === pageLower) {
        // Same page - just highlight using the new event format
        const event = new CustomEvent('ai-section-highlight', {
          detail: { sectionId: sectionId, lineNumber: lineNumber }
        });
        document.dispatchEvent(event);

        // Also dispatch legacy event for backward compatibility
        if (lineNumber) {
          const legacyEvent = new CustomEvent('ai-highlight-request', { detail: { lineNumber } });
          document.dispatchEvent(legacyEvent);
        }

        if (inputRef.current) inputRef.current.focus();
        return;
      } else {
        // Different page - switch to it and then trigger highlight
        console.log('Switching to different page in snap mode:', pageLower);
        windowManager.snapWithAi(pageLower);

        // Dispatch highlight event AFTER page has time to render
        // Using longer delay (1200ms) to ensure page is fully loaded
        setTimeout(() => {
          if (sectionId) {
            console.log('=== AI HIGHLIGHT DEBUG ===');
            console.log('Dispatching ai-section-highlight event');
            console.log('Target section:', sectionId);
            console.log('Target page:', pageLower);
            console.log('Document has listeners:', document.hasOwnProperty('addEventListener'));

            const event = new CustomEvent('ai-section-highlight', {
              detail: { sectionId: sectionId },
              bubbles: true
            });
            document.dispatchEvent(event);
            console.log('Event dispatched successfully');
          } else if (lineNumber) {
            console.log('Dispatching legacy highlight for line:', lineNumber);
            const event = new CustomEvent('ai-highlight-request', {
              detail: { lineNumber: lineNumber },
              bubbles: true
            });
            document.dispatchEvent(event);
          }
        }, 1200); // Increased delay for page to fully render
        return;
      }
    }

    // Set up split view - snapWithAi now opens the window
    const performSplitView = async () => {
      try {
        console.log('Setting up split view for:', pageLower);
        windowManager.snapWithAi(pageLower);
        await snapChatToSide();
        console.log('Split view setup complete');

        // Dispatch highlight event AFTER split view is set up
        // Using longer delay (1200ms) to ensure page is fully loaded
        setTimeout(() => {
          if (sectionId) {
            console.log('=== AI HIGHLIGHT DEBUG (Split View) ===');
            console.log('Dispatching ai-section-highlight event');
            console.log('Target section:', sectionId);
            console.log('Target page:', pageLower);

            const event = new CustomEvent('ai-section-highlight', {
              detail: { sectionId: sectionId },
              bubbles: true
            });
            document.dispatchEvent(event);
            console.log('Event dispatched successfully (split view path)');
          } else if (lineNumber) {
            console.log('Dispatching legacy highlight for line:', lineNumber);
            const event = new CustomEvent('ai-highlight-request', {
              detail: { lineNumber: lineNumber },
              bubbles: true
            });
            document.dispatchEvent(event);
          }
        }, 1200); // Increased delay for page to fully render
      } catch (error) {
        console.error('Split view setup error:', error);
      }
    };

    if (!showChat) {
      setShowChat(true);
      setTimeout(performSplitView, 150);
    } else {
      performSplitView();
    }
  }, [isMobile, windowManager, showChat, currentChatId, snapChatToSide, navigate]);

  // COMPLETELY REWRITTEN: Clean exit from snapped mode with full cleanup
  const exitSnappedMode = useCallback(() => {
    if (!chatRef.current) return;

    console.log('EXIT SPLIT VIEW: Starting complete cleanup and exit');

    // Get current position before animation
    const rect = chatRef.current.getBoundingClientRect();

    // Set current position as fixed to maintain position during transition
    chatRef.current.style.position = 'fixed';
    chatRef.current.style.left = `${rect.left}px`;
    chatRef.current.style.top = `${rect.top}px`;
    chatRef.current.style.width = `${rect.width}px`;
    chatRef.current.style.height = `${rect.height}px`;
    chatRef.current.style.right = 'auto';
    chatRef.current.style.transform = 'none';

    // Force reflow
    void chatRef.current.offsetWidth;

    // Add smooth, visible transition for exit animation - longer duration for sleek movement
    chatRef.current.style.transition = 'all 0.8s cubic-bezier(0.25, 0.1, 0.25, 1)';

    // Remove snapped class first
    chatRef.current.classList.remove('snapped-chat');

    // Animate back to center by removing positioning
    setTimeout(() => {
      if (chatRef.current) {
        chatRef.current.style.position = '';
        chatRef.current.style.left = '';
        chatRef.current.style.right = '';
        chatRef.current.style.top = '';
        chatRef.current.style.width = '';
        chatRef.current.style.height = '';
        chatRef.current.style.zIndex = '';
        chatRef.current.style.transform = '';

        // Clean up transition after animation
        setTimeout(() => {
          if (chatRef.current) {
            chatRef.current.style.transition = '';
          }
        }, 800); // Match the transition duration
      }
    }, 50); // Small delay for smooth transition start

    // Note: Minimize button is now React-rendered, no need to remove it manually

    // Exit snapped mode in window manager
    if (windowManager && windowManager.exitSnappedMode) {
      console.log('EXIT SPLIT VIEW: Calling windowManager.exitSnappedMode()');
      windowManager.exitSnappedMode();
    }

    // Clear session storage
    sessionStorage.removeItem('preservedChatState');
    sessionStorage.removeItem('highlightLine');

    // Dispatch refresh event to re-attach link handlers via React
    // No DOM manipulation needed - React will handle the re-render
    setTimeout(() => {
      const event = new CustomEvent('ai-links-need-refresh');
      document.dispatchEvent(event);
      console.log('EXIT SPLIT VIEW: Triggered link refresh event');
    }, 800); // After animation completes

    console.log('EXIT SPLIT VIEW: Complete cleanup finished');
  }, [windowManager]); // Remove handleLinkClick dependency to avoid circular reference

  // Set up global reference for exitSnappedMode to avoid dependency issues
  React.useEffect(() => {
    window.exitSnappedModeRef = exitSnappedMode;
    return () => {
      window.exitSnappedModeRef = null;
    };
  }, [exitSnappedMode]);

  // Check for snapped state on component mount - restore snap position if needed
  useEffect(() => {
    // Check if we need to restore snapped state
    if (windowManager && windowManager.isAiSnapped && !isMobile) {
      setShowChat(true);

      // Small delay to ensure chat window is rendered
      setTimeout(() => {
        if (chatRef.current) {
          console.log('Restoring snapped state');

          const topBar = document.querySelector('.TopBar, .top-nav, header');
          const topBarHeight = topBar ? topBar.offsetHeight : 60;

          // Directly apply snapped position without animation on restore
          const snappedPosition = {
            position: 'fixed',
            right: '10px',
            top: `${topBarHeight + 20}px`,
            width: '40vw',
            height: `calc(100vh - ${topBarHeight + 40}px)`,
            left: 'auto',
            transform: 'none',
            zIndex: '1500',
            transition: 'none' // No animation on restore
          };

          Object.assign(chatRef.current.style, snappedPosition);
          chatRef.current.classList.add('snapped-chat');
          // Note: Minimize button is now rendered by React, no need to add dynamically
        }
      }, 300);
    }
  }, [windowManager, isMobile]);

  // Load chat messages when chat is opened or current chat changes
  useEffect(() => {
    if (showChat) {
      console.log(`AiOrb useEffect: Loading messages for chat ID: ${currentChatId}`);

      // Check if we have a preserved chat state from navigation
      const preservedChatState = sessionStorage.getItem('preservedChatState');
      if (preservedChatState) {
        try {
          const { messages: preservedMessages, chatId: preservedChatId } = JSON.parse(preservedChatState);

          // Only restore if we have messages and a valid chat ID
          if (preservedMessages && preservedMessages.length > 0 && preservedChatId) {
            console.log(`Restoring preserved chat state with ${preservedMessages.length} messages`);
            setMessages(preservedMessages);
            setCurrentChat(preservedChatId);
            setCurrentChatId(preservedChatId);

            // Clear the preserved state after restoring
            sessionStorage.removeItem('preservedChatState');
            return; // Skip loading messages since we restored from session
          }
        } catch (error) {
          console.error('Error restoring preserved chat state:', error);
          sessionStorage.removeItem('preservedChatState');
        }
      }

      // If no preserved state, load messages normally
      const loadMessages = async () => {
        try {
          // Use the currentChatId from state for fetching messages
          const chatIdToLoad = currentChatId;
          console.log(`loadChatMessages: Loading messages for chat ID: ${chatIdToLoad}`);
          setIsLoading(true);

          const chatMessages = await getChatMessages(chatIdToLoad);
          console.log(`loadChatMessages: Retrieved ${chatMessages.length} messages for ${chatIdToLoad}`);

          if (chatMessages && chatMessages.length > 0) {
            // Update UI with messages
            const formattedMessages = chatMessages.map(msg => {
              if (msg.isUser) {
                return {
                  text: msg.message,
                  isUser: msg.isUser
                };
              } else {
                // Parse links in AI messages
                const { parsedResponse } = parseLinks(msg.message);
                return {
                  text: parsedResponse,
                  isUser: msg.isUser,
                  hasLinks: parsedResponse !== msg.message
                };
              }
            });

            console.log(`loadChatMessages: Setting ${formattedMessages.length} messages in UI for ${chatIdToLoad}`);
            setMessages(formattedMessages);

            // Set the Gemini chat history from stored messages using the same chatId
            await setChatHistoryFromStored(chatMessages, chatIdToLoad);
            console.log(`loadChatMessages: Chat history set for chat ${chatIdToLoad}`);
          } else {
            // If this is an empty chat (no messages), initialize it with website content
            console.log(`loadChatMessages: No messages found for ${chatIdToLoad}, initializing new chat with website content`);
            const initialResponse = await initializeNewChat(chatIdToLoad);
            if (initialResponse) {
              await saveChatMessage(initialResponse, false, chatIdToLoad);
              setMessages([{ text: initialResponse, isUser: false }]);
            }
          }
        } catch (error) {
          console.error('Error loading chat messages:', error);
        } finally {
          setIsLoading(false);

          // Final scroll to bottom
          setTimeout(() => {
            scrollToBottom();
          }, 200);

          // Re-focus the input field after loading messages
          if (inputRef.current) {
            setTimeout(() => {
              inputRef.current.focus();
            }, 250);
          }
        }
      };

      loadMessages();
    }
  }, [showChat, currentChatId]); // Remove loadChatMessages from dependencies

  // Show initial greeting after 3 seconds, but only if chat is not open
  useEffect(() => {
    if (!showChat) {
      const timer = setTimeout(() => {
        setInitialGreetingShown(true);

        // Auto-hide greeting after 5 seconds
        const hideTimer = setTimeout(() => {
          setInitialGreetingShown(false);
        }, 5000);

        return () => clearTimeout(hideTimer);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [showChat]);

  // Set drag constraints when chat window opens
  useEffect(() => {
    if (showChat && !isMobile) {
      const updateConstraints = () => {
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        setDragConstraints({
          top: -windowHeight / 2 + 50,
          left: -windowWidth / 2 + 50,
          right: windowWidth / 2 - 50,
          bottom: windowHeight / 2 - 50
        });
      };

      updateConstraints();
      window.addEventListener('resize', updateConstraints);
      return () => window.removeEventListener('resize', updateConstraints);
    }
  }, [showChat, isMobile]);

  // Handle mobile navigation when chat is open
  useEffect(() => {
    if (isMobile && showChat) {
      // Get references to navigation elements
      const topBar = document.querySelector('.TopBar, .top-nav, header');

      // Adjust top bar
      if (topBar) {
        topBar.style.zIndex = '1006'; // Keep top bar above chat window
      }

      // Add class to body
      document.body.classList.add('chat-open');

      // Focus on input when chat opens
      if (inputRef.current) {
        setTimeout(() => {
          inputRef.current.focus();
        }, 300);
      }

      return () => {
        // Restore top bar z-index
        if (topBar) {
          topBar.style.zIndex = '1001';
        }

        // Remove class from body
        document.body.classList.remove('chat-open');
      };
    }
  }, [isMobile, showChat]);

  // Focus input when chat opens or when loading finishes
  useEffect(() => {
    if (showChat && inputRef.current && !isLoading) {
      setTimeout(() => {
        inputRef.current.focus();
      }, 100); // Small delay to ensure input is rendered after state updates
    }
  }, [showChat, isLoading]);

  // Close chat when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if the click is outside the chat window and not on the orb itself
      // Don't close if in snapped mode
      if (
        showChat &&
        chatRef.current &&
        !chatRef.current.contains(event.target) &&
        !event.target.closest('.ai-orb-container') &&
        !(windowManager && windowManager.isAiSnapped)
      ) {
        // Don't close chat if in snapped mode
        if (!(windowManager && windowManager.isAiSnapped)) {
          setShowChat(false);
        }
      }
    };

    // Add event listener for both mouse and touch events
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [showChat, windowManager]); // Remove handleChatClose from dependencies

  // Scroll to bottom when messages change
  useEffect(() => {
    if (showChat) {
      scrollToBottom();
    }
  }, [messages, showChat]);

  // Additional effect to scroll to bottom when chat is opened
  useEffect(() => {
    if (showChat) {
      // Small delay to ensure the chat window is rendered
      setTimeout(() => {
        scrollToBottom();
      }, 300);
    }
  }, [showChat]);

  // Store orb position when component mounts or window resizes
  useEffect(() => {
    const updateOrbPosition = () => {
      if (orbRef.current) {
        const rect = orbRef.current.getBoundingClientRect();
        setOrbPosition({
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2
        });
      }
    };

    updateOrbPosition();
    window.addEventListener('resize', updateOrbPosition);

    return () => {
      window.removeEventListener('resize', updateOrbPosition);
    };
  }, []);

  // Add event listeners to links after messages update + handle refresh events
  useEffect(() => {
    const addLinkEventListeners = () => {
      const links = document.querySelectorAll('.ai-link');
      console.log(`Found ${links.length} AI links to attach listeners to`);

      links.forEach((link, index) => {
        // Remove existing listeners to prevent duplicates
        link.removeEventListener('click', handleLinkClick);

        // For mobile, also try touch events
        if (isMobile) {
          link.removeEventListener('touchend', handleLinkClick);
        }

        // Add click event listener
        link.addEventListener('click', handleLinkClick, { passive: false });

        // For mobile, also add touch event as backup
        if (isMobile) {
          link.addEventListener('touchend', handleLinkClick, { passive: false });
        }

        // Add the page and line information as a tooltip
        const page = link.getAttribute('data-page');
        const line = link.getAttribute('data-line');

        console.log(`Link ${index}: page=${page}, line=${line}`);

        if (page && line) {
          // Format the tooltip text
          let tooltipText = `${page.charAt(0).toUpperCase() + page.slice(1)}`;

          if (line.includes('section:')) {
            tooltipText += ` • ${line.replace('section:', 'Section: ')}`;
          } else {
            tooltipText += ` • Line ${line}`;
          }

          // Set tooltip attribute for accessibility
          link.setAttribute('title', tooltipText);
        }
      });

      console.log(`Added event listeners to ${links.length} AI links (mobile: ${isMobile})`);
    };

    // Listen for custom refresh events from exitSnappedMode
    const handleLinkRefresh = () => {
      console.log('Received link refresh event, re-attaching listeners');
      setTimeout(() => {
        addLinkEventListeners();
      }, 100);
    };

    // Add custom event listener
    document.addEventListener('ai-links-need-refresh', handleLinkRefresh);

    if (showChat) {
      // Small delay to ensure DOM is updated
      setTimeout(() => {
        addLinkEventListeners();
      }, 200);
    }

    return () => {
      document.removeEventListener('ai-links-need-refresh', handleLinkRefresh);
    };
  }, [messages, showChat, handleLinkClick, isMobile]); // Add isMobile as dependency

  const handleOrbClick = () => {
    if (orbRef.current) {
      const rect = orbRef.current.getBoundingClientRect();
      setOrbPosition({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      });
    }

    // Toggle chat visibility and reset related states
    setShowChat(prevShowChat => !prevShowChat);
    setShowTooltip(false);
    setInitialGreetingShown(false);

    // Always attempt to focus the input field when the orb is clicked and chat is open
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleChatClose = useCallback(() => {
    // If in snapped mode, exit snapped mode first, then close
    if (windowManager && windowManager.isAiSnapped) {
      exitSnappedMode();
    }

    setShowChat(false);
  }, [windowManager, exitSnappedMode]);

  // Improved scroll to bottom function with requestAnimationFrame for reliable timing
  const scrollToBottom = useCallback(() => {
    // Use requestAnimationFrame to ensure DOM is fully updated
    requestAnimationFrame(() => {
      if (messagesEndRef.current) {
        try {
          // First, try direct scroll for immediate positioning
          const container = messagesEndRef.current.closest('.ai-chat-content');
          if (container) {
            container.scrollTop = container.scrollHeight;
          }

          // Then apply smooth scroll for visual polish
          setTimeout(() => {
            if (messagesEndRef.current) {
              messagesEndRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'end'
              });
            }
          }, 50);
        } catch (error) {
          console.error('Error scrolling to bottom:', error);
          // Fallback method
          if (messagesEndRef.current.parentElement) {
            messagesEndRef.current.parentElement.scrollTop =
              messagesEndRef.current.parentElement.scrollHeight;
          }
        }
      }
    });
  }, []);

  // Toggle chat history
  const toggleChatHistory = () => {
    setShowChatHistory(!showChatHistory);
  };

  // Handle selecting a chat from history
  const onSelectHistoryChat = async (selectedChatId) => {
    console.log(`AiOrb: History selection callback with chat ID ${selectedChatId}`);

    // This ensures we have the latest chat ID before proceeding
    if (!selectedChatId || typeof selectedChatId !== 'string' || selectedChatId.trim() === '') {
      console.error('Invalid chat ID provided to onSelectHistoryChat:', selectedChatId);
      return;
    }

    // First close the history panel with a slight delay to avoid UI glitches
    setTimeout(() => {
      setShowChatHistory(false);
    }, 100);

    // Then handle the chat selection
    await handleSelectChat(selectedChatId);
  };

  // Start a new chat
  const startNewChat = async () => {
    const newChatId = generateChatId();
    setCurrentChatId(newChatId);
    setCurrentChat(newChatId);
    setMessages([]);

    // Initialize the chat with website content
    setIsLoading(true);
    try {
      const initialResponse = await initializeNewChat(newChatId);

      // Save the AI's initial greeting to the database
      if (initialResponse) {
        // Save the AI response as the first message
        await saveChatMessage(initialResponse, false, newChatId);

        // Update the UI with the initial message
        setMessages([{ text: initialResponse, isUser: false }]);
      }
    } catch (error) {
      console.error('Error initializing new chat:', error);
      resetChatHistory(newChatId);
    } finally {
      setIsLoading(false);
    }

    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Handle selecting a chat from history
  const handleSelectChat = async (chatId) => {
    console.log(`AiOrb: Selecting chat with ID ${chatId}`);

    // Set the current chat ID in both local state and localStorage
    setCurrentChat(chatId);
    setCurrentChatId(chatId); // This is the utility function for localStorage
    setShowChat(true); // Ensure chat window is open
    setShowChatHistory(false); // Close the history panel

    // Clear current messages and set loading state.
    // The useEffect hook listening to currentChatId and showChat will handle loading.
    setMessages([]);
    setIsLoading(true);

    // The actual loading (getChatMessages, setChatHistoryFromStored, initializeNewChat if needed)
    // will now be handled by the useEffect hook that calls loadChatMessages
    // when currentChatId or showChat changes.
  };

  // Handle input change
  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  // Handle sending a message
  const handleSendMessage = async () => {
    if (inputValue.trim() === '') return;

    const userMessage = inputValue.trim();
    setInputValue('');

    // Add user message to state
    setMessages(prevMessages => [...prevMessages, { text: userMessage, isUser: true }]);

    // Save user message to database
    await saveChatMessage(userMessage, true, currentChatId);

    // Scroll to bottom after user message is added
    setTimeout(() => {
      scrollToBottom();
    }, 150);

    // Set loading state
    setIsLoading(true);

    try {
      // Get AI response
      const aiResponse = await generateResponse(userMessage, currentChatId);

      // Parse links in the AI response
      const { parsedResponse, links } = parseLinks(aiResponse);

      // Add AI response to state with parsed links
      setMessages(prevMessages => [
        ...prevMessages,
        {
          text: parsedResponse,
          isUser: false,
          hasLinks: links.length > 0
        }
      ]);

      // Save original AI response to database (with link markup)
      await saveChatMessage(aiResponse, false, currentChatId);

      // Scroll to bottom after AI response is added
      setTimeout(() => {
        scrollToBottom();
      }, 150);
    } catch (error) {
      console.error('Error getting AI response:', error);

      // Add error message
      const errorMessage = 'Sorry, I encountered an error. Please try again.';
      setMessages(prevMessages => [...prevMessages, { text: errorMessage, isUser: false }]);

      // Save error message to database
      await saveChatMessage(errorMessage, false, currentChatId);
    } finally {
      setIsLoading(false);



      // Final scroll to bottom
      setTimeout(() => {
        scrollToBottom();
      }, 300);
    }
  };

  // Handle key press (Enter to send)
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Animation variants for the chat window
  const chatVariants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
      x: isMobile ? 0 : orbPosition.x - window.innerWidth / 2,
      y: isMobile ? 100 : orbPosition.y - window.innerHeight / 2,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 30
      }
    },
    visible: {
      opacity: 1,
      scale: 1,
      x: 0,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 30,
        duration: 0.3
      }
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      x: isMobile ? 0 : orbPosition.x - window.innerWidth / 2,
      y: isMobile ? 100 : orbPosition.y - window.innerHeight / 2,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 35,
        duration: 0.3
      }
    }
  };

  // Initialize a new chat when the component is first mounted if no chat exists
  useEffect(() => {
    const initializeChat = async () => {
      const currentId = localStorage.getItem('currentChatId');

      if (!currentId) {
        console.log('AiOrb: No current chat ID found, initializing a new chat');
        await startNewChat();
      } else {
        console.log(`AiOrb: Found existing chat ID ${currentId}`);
        setCurrentChat(currentId);
      }
    };

    initializeChat();
  }, []); // Run only once on component mount

  return (
    <>
      {/* Show the orb always - with accessibility attributes for mobile */}
      <div
        className={`ai-orb-container ${isMobile ? 'mobile-orb' : ''} ${windowManager && windowManager.isFullscreen ? 'fullscreen-mode' : ''}`}
        ref={orbRef}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={handleOrbClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleOrbClick(e);
          }
        }}
        role="button"
        aria-label={showChat ? "Close AI Assistant" : "Open AI Assistant"}
        aria-expanded={showChat}
        tabIndex={0}
      >
        <div className="ai-orb">
          <div className="orb-inner"></div>
          <div className="orb-glow"></div>
          <div className="orb-particles"></div>
        </div>

        <AnimatePresence>
          {(initialGreetingShown || showTooltip) && !showChat && (
            <motion.div
              className={`ai-greeting ${initialGreetingShown && !showTooltip ? 'initial' : 'tooltip'}`}
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 10 }}
              transition={{ duration: 0.3 }}
            >
              <div className="greeting-bubble">
                <p>{initialGreetingShown && !showTooltip ? "Hey, can I help?" : "AI Assistant - I know everything about Curtis!"}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Transparent area that will close the chat when clicked */}
      <div
        ref={constraintsRef}
        className={`drag-area ${showChat ? 'chat-open' : ''} ${windowManager && windowManager.isAiSnapped ? 'snapped' : ''}`}
        style={{ background: 'transparent', pointerEvents: (windowManager && windowManager.isAiSnapped) ? 'none' : (showChat ? 'auto' : 'none') }}
        /* The 'snapped' class in AiOrb.css also sets pointer-events: none !important, which should take precedence */
        onClick={(e) => {
          // Only close if clicking directly on the drag area (not on its children)
          if (e.target === e.currentTarget && showChat) {
            handleChatClose();
          }
        }}
      >
        <AnimatePresence>
          {showChat && (
            <motion.div
              className="ai-chat-window"
              ref={chatRef}
              variants={chatVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              drag={!isMobile}
              dragControls={dragControls}
              dragListener={false}
              dragConstraints={dragConstraints}
              dragElastic={0.1}
              dragMomentum={false}
              onDragEnd={(e, info) => {
                // If dragged significantly when snapped, exit snap mode
                if (windowManager?.isAiSnapped) {
                  const dragDistance = Math.abs(info.offset.x) + Math.abs(info.offset.y);
                  if (dragDistance > 50) {
                    console.log('AI Chat: Drag-to-exit triggered, distance:', dragDistance);
                    exitSnappedMode();
                  }
                }
              }}
              onClick={(e) => e.stopPropagation()} // Prevent clicks from bubbling to the drag area
            >
              <div
                className="ai-chat-header"
                onPointerDown={(e) => {
                  // Allow drag on desktop (including when snapped for drag-to-exit)
                  if (!isMobile) {
                    dragControls.start(e);
                  }
                }}
                style={{
                  cursor: !isMobile ? 'grab' : 'default'
                }}
              >
                <div className="ai-chat-orb">
                  <div className="orb-inner-small"></div>
                </div>
                <h3>Curtis' AI Assistant</h3>
                <div className="ai-chat-actions">
                  {/* Exit split view button - only shown when snapped */}
                  {windowManager?.isAiSnapped && (
                    <button
                      className="chat-minimize-btn"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('EXIT SPLIT VIEW: React button clicked');
                        exitSnappedMode();
                      }}
                      title="Exit split view"
                    >
                      <i className="fas fa-compress"></i>
                    </button>
                  )}
                  <button className="new-chat-btn" onClick={startNewChat} title="Start a new chat">
                    <i className="fas fa-plus"></i>
                  </button>
                  <button className="chat-history-btn" onClick={toggleChatHistory} title="View chat history">
                    <i className="fas fa-history"></i>
                  </button>
                  <button className="close-chat" onClick={handleChatClose} title="Close chat">
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              </div>

              <div className="ai-chat-content">
                {messages.length === 0 ? (
                  <p className="ai-intro-message">
                    Hi there! I'm Curtis' AI assistant. I can help you learn more about Curtis,
                    his skills, projects, and experience. Feel free to ask me anything about his
                    work or how he might be able to help with your development needs.
                  </p>
                ) : (
                  <div className="ai-messages">
                    {messages.map((message, index) => (
                      <div
                        key={index}
                        className={`ai-message ${message.isUser ? 'user' : 'assistant'}`}
                      >
                        <div className="message-avatar">
                          {message.isUser ? (
                            <i className="fas fa-user"></i>
                          ) : (
                            <div className="ai-avatar-orb">
                              <div className="orb-inner-tiny"></div>
                            </div>
                          )}
                        </div>
                        <div className="message-content">
                          {message.isUser ? (
                            <p>{message.text}</p>
                          ) : (
                            <AiResponseContent
                              html={message.text}
                              onLinkClick={handleLinkClickInternal}
                            />
                          )}
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                )}

                {isLoading && (
                  <div className="ai-typing">
                    <div className="ai-avatar-orb">
                      <div className="orb-inner-tiny"></div>
                    </div>
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                )}
              </div>

              <div className="ai-chat-input">
                <textarea
                  ref={inputRef}
                  value={inputValue}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything about Curtis..."
                  disabled={isLoading}
                />
                <button
                  className="send-message"
                  onClick={handleSendMessage}
                  disabled={inputValue.trim() === '' || isLoading}
                >
                  <i className="fas fa-paper-plane"></i>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <ChatHistory
        isOpen={showChatHistory}
        onClose={toggleChatHistory}
        onSelectHistoryChat={onSelectHistoryChat}
      />
    </>
  );
};

export default AiOrb;    // Debug function to test AI link behavior
window.debugAiLinks = () => {
  const links = document.querySelectorAll('.ai-link');
  console.log(`Found ${links.length} AI links`);
  links.forEach((link, index) => {
    const page = link.getAttribute('data-page');
    const line = link.getAttribute('data-line');
    console.log(`Link ${index}: page=${page}, line=${line}, text="${link.textContent}"`);

    // Test if event listeners are attached
    const events = window.getEventListeners ? window.getEventListeners(link) : 'DevTools required';
    console.log(`Events on link ${index}:`, events);
  });
};

console.log('Debug functions available: window.debugAiLinks()');
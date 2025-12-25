import React, { createContext, useContext, useState, useEffect } from 'react';

// Create context for the window manager
const WindowManagerContext = createContext();

// Window manager provider component
export const WindowManagerProvider = ({ children }) => {
  // State for tracking windows - using arrays for better tracking instead of objects
  const [windows, setWindows] = useState([]);
  const [activeWindowId, setActiveWindowId] = useState(null);
  const [minimizedWindows, setMinimizedWindows] = useState([]);
  // State for snapped layout
  const [isAiSnapped, setIsAiSnapped] = useState(false);
  const [snappedWindowId, setSnappedWindowId] = useState(null);
  const [previousWindowState, setPreviousWindowState] = useState(null);
  // State for fullscreen
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fullscreenWindowId, setFullscreenWindowId] = useState(null);

  // Check if we should restore snapped state on page load
  useEffect(() => {
    const savedSnappedState = sessionStorage.getItem('aiSnappedState');
    if (savedSnappedState) {
      try {
        const { isSnapped, windowId } = JSON.parse(savedSnappedState);
        if (isSnapped && windowId) {
          setIsAiSnapped(isSnapped);
          setSnappedWindowId(windowId);
          console.log(`WindowManager: Restored snapped state with window ID ${windowId}`);
        }
      } catch (error) {
        console.error('Error parsing saved snapped state:', error);
        sessionStorage.removeItem('aiSnappedState');
      }
    }
  }, []);

  // Register a new window
  const registerWindow = (windowId, windowProps) => {
    setWindows(prevWindows => {
      // Check if window already exists
      const exists = prevWindows.find(w => w.id === windowId);
      if (exists) {
        return prevWindows;
      }
      return [...prevWindows, { id: windowId, ...windowProps, isOpen: true }];
    });
    
    // Set as active window when registering
    setActiveWindowId(windowId);
  };

  // Close a window
  const closeWindow = (windowId) => {
    setWindows(prevWindows => prevWindows.filter(w => w.id !== windowId));

    // If active window is closed, set active to null
    if (activeWindowId === windowId) {
      setActiveWindowId(null);
    }

    // Remove from minimized windows if it was minimized
    setMinimizedWindows(prev => prev.filter(id => id !== windowId));

    // If snapped window is closed, exit snapped mode
    if (snappedWindowId === windowId) {
      setSnappedWindowId(null);
      setIsAiSnapped(false);
      sessionStorage.removeItem('aiSnappedState');
    }
  };

  // Minimize a window
  const minimizeWindow = (windowId) => {
    // Add to minimized windows
    setMinimizedWindows(prev => {
      if (!prev.includes(windowId)) {
        return [...prev, windowId];
      }
      return prev;
    });

    // Set active to null if minimizing active window
    if (activeWindowId === windowId) {
      setActiveWindowId(null);
    }

    // If snapped window is minimized, exit snapped mode
    if (snappedWindowId === windowId) {
      setSnappedWindowId(null);
      setIsAiSnapped(false);
      sessionStorage.removeItem('aiSnappedState');
    }
  };

  // Restore a minimized window
  const restoreWindow = (windowId) => {
    // Remove from minimized windows
    setMinimizedWindows(prev => prev.filter(id => id !== windowId));

    // Set as active window
    setActiveWindowId(windowId);
  };

  // Set active window
  const setActiveWindow = (windowId) => {
    setActiveWindowId(windowId);
  };

  // Set fullscreen mode for a window
  const setWindowFullscreen = (windowId, fullscreen) => {
    setIsFullscreen(fullscreen);
    setFullscreenWindowId(fullscreen ? windowId : null);
  };

  // Snap window with AI assistant
  const snapWithAi = (windowId) => {
    // Save the previous state before snapping
    if (!isAiSnapped) {
      setPreviousWindowState({
        activeWindowId,
        minimizedWindows: [...minimizedWindows]
      });
    }
    
    // Set the window as active and snapped
    setSnappedWindowId(windowId);
    setIsAiSnapped(true);
    setActiveWindowId(windowId);
    
    // Save snapped state to session storage for persistence across page loads
    sessionStorage.setItem('aiSnappedState', JSON.stringify({
      isSnapped: true,
      windowId
    }));
    
    // Apply split view animation to content with a small delay
    setTimeout(() => {
      const contentElement = document.querySelector('.content');
      if (contentElement) {
        // Ensure smooth animation
        contentElement.style.transition = 'width 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275), transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        contentElement.classList.add('content-split-animation');
      }
    }, 50);
    
    return true;
  };

  // Exit snapped mode
  const exitSnappedMode = () => {
    // Remove split view animation from content with a smooth transition
    const contentElement = document.querySelector('.content');
    if (contentElement) {
      // Ensure smooth animation
      contentElement.style.transition = 'width 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275), transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
      
      // First change transform to create a smooth animation
      contentElement.style.transform = 'translateX(0)';
      
      // Then remove the class after the animation completes
      setTimeout(() => {
        contentElement.classList.remove('content-split-animation');
        // Clear the transition after animation completes
        contentElement.style.transition = '';
      }, 500); // Match the transition duration
    }
    
    // Restore previous window state if available
    if (previousWindowState) {
      setActiveWindowId(previousWindowState.activeWindowId);
      setMinimizedWindows(previousWindowState.minimizedWindows);
      setPreviousWindowState(null);
    }
    
    // Exit snapped mode
    setIsAiSnapped(false);
    setSnappedWindowId(null);
    
    // Remove saved state from session storage
    sessionStorage.removeItem('aiSnappedState');
    
    // Clear any lingering highlight states
    sessionStorage.removeItem('highlightLine');
    sessionStorage.removeItem('preservedChatState');
    
    return true;
  };

  // Window manager context value
  const value = {
    windows,
    activeWindowId,
    minimizedWindows,
    isAiSnapped,
    snappedWindowId,
    isFullscreen,
    fullscreenWindowId,
    registerWindow,
    closeWindow,
    minimizeWindow,
    restoreWindow,
    setActiveWindow,
    setWindowFullscreen,
    snapWithAi,
    exitSnappedMode
  };

  return (
    <WindowManagerContext.Provider value={value}>
      {children}
    </WindowManagerContext.Provider>
  );
};

// Hook for consuming window manager context
export const useWindowManager = () => {
  const context = useContext(WindowManagerContext);
  if (context === undefined) {
    throw new Error('useWindowManager must be used within a WindowManagerProvider');
  }
  return context;
};
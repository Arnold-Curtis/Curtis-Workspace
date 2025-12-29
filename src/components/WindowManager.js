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

  // NEW: Taskbar state variables
  const [showDesktop, setShowDesktop] = useState(false);
  const [preShowDesktopState, setPreShowDesktopState] = useState(null);
  const [startMenuOpen, setStartMenuOpen] = useState(false);
  const [snapZone, setSnapZone] = useState(null); // 'left', 'right', 'top-left', 'top-right', 'top'
  const [windowOrder, setWindowOrder] = useState([]); // Track z-index order

  // Helper function to get window configuration from page ID
  const getWindowConfigForPage = (pageId) => {
    const pageConfigs = {
      'about': { id: 'about', title: 'About.js', icon: 'fas fa-user', component: 'about' },
      'projects': { id: 'projects', title: 'Projects.js', icon: 'fas fa-code', component: 'projects' },
      'skills': { id: 'skills', title: 'Skills.js', icon: 'fas fa-cogs', component: 'skills' },
      'resume': { id: 'resume', title: 'Resume.js', icon: 'fas fa-file-alt', component: 'resume' },
      'contact': { id: 'contact', title: 'Contact.js', icon: 'fas fa-envelope', component: 'contact' },
      'guestbook': { id: 'guestbook', title: 'Guestbook.js', icon: 'fas fa-book', component: 'guestbook' },
      'book-call': { id: 'book-call', title: 'BookCall.js', icon: 'fas fa-calendar', component: 'book-call' },
      'admin': { id: 'admin', title: 'Admin Panel', icon: 'fas fa-lock', component: 'admin' },
    };
    return pageConfigs[pageId] || null;
  };

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

  // Register a new window (called internally when window mounts)
  const registerWindow = (windowId, windowProps) => {
    setWindows(prevWindows => {
      // Check if window already exists
      const exists = prevWindows.find(w => w.id === windowId);
      if (exists) {
        // Update existing window properties
        return prevWindows.map(w =>
          w.id === windowId ? { ...w, ...windowProps, isOpen: true } : w
        );
      }
      return [...prevWindows, { id: windowId, ...windowProps, isOpen: true }];
    });

    // Add to window order (bringing to front)
    setWindowOrder(prev => {
      if (!prev.includes(windowId)) {
        return [...prev, windowId];
      }
      return prev;
    });

    // Set as active window when registering
    setActiveWindowId(windowId);

    // Close start menu when opening a window
    setStartMenuOpen(false);
  };

  // NEW: Open a window (or bring to front if already open)
  const openWindow = (windowConfig) => {
    const { id, title, icon, component } = windowConfig;

    // Exit show desktop mode when opening a window
    setShowDesktop(false);

    // Use functional update to access the most recent state (prevents duplicates)
    setWindows(prevWindows => {
      // Check if window already exists in the LATEST state
      const windowExists = prevWindows.some(w => w.id === id);

      if (windowExists) {
        console.log('WindowManager: Window already exists, bringing to front:', id);
        // Window exists - don't add it again, just return same state
        return prevWindows;
      } else {
        console.log('WindowManager: Creating new window:', id);
        // Add new window
        return [...prevWindows, { id, title, icon, component, isOpen: true }];
      }
    });

    // Always bring to front and set active (whether new or existing)
    setWindowOrder(prev => {
      const newOrder = prev.filter(wId => wId !== id);
      return [...newOrder, id];
    });
    setActiveWindowId(id);

    // If minimized, restore it
    setMinimizedWindows(prev => prev.filter(wId => wId !== id));

    // Close start menu when opening a window
    setStartMenuOpen(false);
  };


  // Close a window
  const closeWindow = (windowId) => {
    // Remove from windows array
    setWindows(prevWindows => prevWindows.filter(w => w.id !== windowId));

    // Remove from window order and update active window
    setWindowOrder(prev => {
      const newOrder = prev.filter(id => id !== windowId);
      // If the closed window was active, set new active to topmost remaining
      if (activeWindowId === windowId) {
        const newActiveId = newOrder.length > 0 ? newOrder[newOrder.length - 1] : null;
        setActiveWindowId(newActiveId);
      }
      return newOrder;
    });

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
    // Special case: 'home' should not open a window, just show desktop
    if (windowId === 'home') {
      console.log('WindowManager: Home requested, showing desktop instead of snapping');
      minimizeAllWindows();
      return false;
    }

    // First, ensure the window is opened via openWindow
    const windowConfig = getWindowConfigForPage(windowId);
    if (windowConfig) {
      console.log('WindowManager: Opening window for snap:', windowConfig);
      openWindow(windowConfig);
    } else {
      console.warn('WindowManager: No window config found for:', windowId);
      return false;
    }

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

  // NEW: Minimize all windows (Show Desktop functionality)
  const minimizeAllWindows = () => {
    // Save current state before minimizing all
    const nonMinimizedWindows = windows
      .filter(w => !minimizedWindows.includes(w.id))
      .map(w => w.id);

    setPreShowDesktopState({
      activeWindowId,
      nonMinimizedWindows
    });

    // Minimize all non-minimized windows
    setMinimizedWindows(prev => {
      const allWindowIds = windows.map(w => w.id);
      return [...new Set([...prev, ...allWindowIds])];
    });

    setActiveWindowId(null);
    setShowDesktop(true);
  };

  // NEW: Restore windows from show desktop state
  const restoreAllWindows = () => {
    if (preShowDesktopState) {
      // Restore only the windows that were open before show desktop
      setMinimizedWindows(prev =>
        prev.filter(id => !preShowDesktopState.nonMinimizedWindows.includes(id))
      );
      setActiveWindowId(preShowDesktopState.activeWindowId);
      setPreShowDesktopState(null);
    }
    setShowDesktop(false);
  };

  // NEW: Toggle show desktop
  const toggleShowDesktop = () => {
    if (showDesktop) {
      restoreAllWindows();
    } else {
      minimizeAllWindows();
    }
  };

  // NEW: Bring a window to the front (for z-index ordering only)
  const bringWindowToFront = (windowId) => {
    // Exit show desktop mode when interacting with a window
    setShowDesktop(false);

    setWindowOrder(prev => {
      const newOrder = prev.filter(id => id !== windowId);
      const finalOrder = [...newOrder, windowId];
      return finalOrder;
    });
    setActiveWindowId(windowId);
  };

  // NEW: Toggle start menu
  const toggleStartMenu = () => {
    setStartMenuOpen(prev => !prev);
  };

  // NEW: Close start menu
  const closeStartMenu = () => {
    setStartMenuOpen(false);
  };

  // NEW: Set current snap zone (for preview overlay)
  const setCurrentSnapZone = (zone) => {
    setSnapZone(zone);
  };

  // NEW: Get window z-index based on order
  const getWindowZIndex = (windowId) => {
    const index = windowOrder.indexOf(windowId);
    return index === -1 ? 1000 : 1000 + index;
  };

  // Window manager context value
  const value = {
    // Existing
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
    exitSnappedMode,

    // NEW - Taskbar functionality
    showDesktop,
    startMenuOpen,
    snapZone,
    windowOrder,
    openWindow,
    minimizeAllWindows,
    restoreAllWindows,
    toggleShowDesktop,
    bringWindowToFront,
    toggleStartMenu,
    closeStartMenu,
    setCurrentSnapZone,
    getWindowZIndex
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
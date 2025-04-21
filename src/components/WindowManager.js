import React, { createContext, useContext, useState, useEffect } from 'react';

// Create context for the window manager
const WindowManagerContext = createContext();

// Window manager provider component
export const WindowManagerProvider = ({ children }) => {
  // State for tracking windows - using arrays for better tracking instead of objects
  const [windows, setWindows] = useState([]);
  const [activeWindowId, setActiveWindowId] = useState(null);
  const [minimizedWindows, setMinimizedWindows] = useState([]);

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

  // Window manager context value
  const value = {
    windows,
    activeWindowId,
    minimizedWindows,
    registerWindow,
    closeWindow,
    minimizeWindow,
    restoreWindow,
    setActiveWindow
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
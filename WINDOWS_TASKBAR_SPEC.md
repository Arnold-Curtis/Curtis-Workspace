# Windows 11 Taskbar - Complete Technical Specification

> **Document Purpose**: Step-by-step implementation guide with complete code snippets for building a Windows 11-style taskbar in the Curtis portfolio workspace.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [WindowManager Context Updates](#2-windowmanager-context-updates)
3. [Taskbar Component](#3-taskbar-component)
4. [Start Menu Component](#4-start-menu-component)
5. [Window Snapping System](#5-window-snapping-system)
6. [Snap Preview Overlay](#6-snap-preview-overlay)
7. [DraggableWindow Updates](#7-draggablewindow-updates)
8. [App.js Integration](#8-appjs-integration)
9. [CSS Styling](#9-css-styling)
10. [Testing Checklist](#10-testing-checklist)

---

## 1. Architecture Overview

### Component Hierarchy

```
App.js
├── WindowManagerProvider (Context)
│   ├── TopBar
│   ├── AiOrb
│   ├── main-content
│   │   ├── Sidebar
│   │   └── content
│   │       ├── SnapPreviewOverlay (NEW)
│   │       └── Routes (with DraggableWindows)
│   ├── Taskbar (REDESIGNED)
│   │   ├── StartButton
│   │   ├── TaskbarCenter (window icons)
│   │   └── ShowDesktopButton
│   └── StartMenu (NEW - conditional)
```

### State Flow

```
User clicks sidebar link → registerWindow() → Window appears → Taskbar shows icon
   ↓
User clicks minimize → minimizeWindow() → Window hidden → Taskbar icon shows small indicator
   ↓
User clicks taskbar icon → restoreWindow() → Window visible → Taskbar icon shows large indicator
   ↓
User clicks X → closeWindow() → Window removed → Taskbar icon removed
```

---

## 2. WindowManager Context Updates

### File: `src/components/WindowManager.js`

Add the following state and functions to the existing `WindowManagerProvider`:

### New State Variables

```javascript
// Add these after existing state declarations (around line 17)
const [showDesktop, setShowDesktop] = useState(false);
const [preShowDesktopState, setPreShowDesktopState] = useState(null);
const [startMenuOpen, setStartMenuOpen] = useState(false);
const [snapZone, setSnapZone] = useState(null); // 'left', 'right', 'top-left', 'top-right', 'top'
const [windowOrder, setWindowOrder] = useState([]); // Track z-index order
```

### New Functions

```javascript
// Minimize all windows (Show Desktop functionality)
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

// Restore windows from show desktop state
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

// Toggle show desktop
const toggleShowDesktop = () => {
  if (showDesktop) {
    restoreAllWindows();
  } else {
    minimizeAllWindows();
  }
};

// Bring a window to the front
const bringWindowToFront = (windowId) => {
  setWindowOrder(prev => {
    const newOrder = prev.filter(id => id !== windowId);
    return [...newOrder, windowId];
  });
  setActiveWindowId(windowId);
  
  // If the window was minimized, restore it
  if (minimizedWindows.includes(windowId)) {
    restoreWindow(windowId);
  }
  
  // Exit show desktop mode if active
  if (showDesktop) {
    setShowDesktop(false);
    setPreShowDesktopState(null);
  }
};

// Toggle start menu
const toggleStartMenu = () => {
  setStartMenuOpen(prev => !prev);
};

// Close start menu
const closeStartMenu = () => {
  setStartMenuOpen(false);
};

// Set current snap zone (for preview overlay)
const setCurrentSnapZone = (zone) => {
  setSnapZone(zone);
};

// Get window z-index based on order
const getWindowZIndex = (windowId) => {
  const index = windowOrder.indexOf(windowId);
  return index === -1 ? 1000 : 1000 + index;
};
```

### Updated Context Value

```javascript
// Replace the existing value object (around line 191)
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
  
  // NEW - Add these
  showDesktop,
  startMenuOpen,
  snapZone,
  windowOrder,
  minimizeAllWindows,
  restoreAllWindows,
  toggleShowDesktop,
  bringWindowToFront,
  toggleStartMenu,
  closeStartMenu,
  setCurrentSnapZone,
  getWindowZIndex
};
```

### Update registerWindow Function

```javascript
// Modify the existing registerWindow function to also track window order
const registerWindow = (windowId, windowProps) => {
  setWindows(prevWindows => {
    const exists = prevWindows.find(w => w.id === windowId);
    if (exists) {
      return prevWindows;
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
  
  setActiveWindowId(windowId);
  
  // Close start menu when opening a window
  setStartMenuOpen(false);
};
```

### Update closeWindow Function

```javascript
// Modify the existing closeWindow function to also update window order
const closeWindow = (windowId) => {
  setWindows(prevWindows => prevWindows.filter(w => w.id !== windowId));
  
  // Remove from window order
  setWindowOrder(prev => prev.filter(id => id !== windowId));

  if (activeWindowId === windowId) {
    // Set active to the topmost remaining window
    setActiveWindowId(prevOrder => {
      const remaining = windowOrder.filter(id => id !== windowId);
      return remaining.length > 0 ? remaining[remaining.length - 1] : null;
    });
  }

  setMinimizedWindows(prev => prev.filter(id => id !== windowId));

  if (snappedWindowId === windowId) {
    setSnappedWindowId(null);
    setIsAiSnapped(false);
    sessionStorage.removeItem('aiSnappedState');
  }
};
```

---

## 3. Taskbar Component

### File: `src/components/Taskbar.js` (Complete Rewrite)

```javascript
import React from 'react';
import { useWindowManager } from './WindowManager';
import './Taskbar.css';

const Taskbar = () => {
  const { 
    windows, 
    minimizedWindows, 
    activeWindowId,
    showDesktop,
    startMenuOpen,
    bringWindowToFront,
    toggleShowDesktop,
    toggleStartMenu
  } = useWindowManager();

  // Handle taskbar item click
  const handleTaskbarItemClick = (windowId) => {
    bringWindowToFront(windowId);
  };

  return (
    <div className="taskbar">
      {/* Left section - Start Button */}
      <div className="taskbar-left">
        <button 
          className={`start-button ${startMenuOpen ? 'active' : ''}`}
          onClick={toggleStartMenu}
          title="Start"
        >
          <img 
            src="/favicon.ico" 
            alt="Start" 
            className="start-icon"
          />
        </button>
      </div>

      {/* Center section - Window Icons */}
      <div className="taskbar-center">
        {windows.map(window => {
          const isMinimized = minimizedWindows.includes(window.id);
          const isActive = activeWindowId === window.id && !isMinimized;
          
          return (
            <button 
              key={window.id}
              className={`taskbar-item ${isActive ? 'active' : ''} ${isMinimized ? 'minimized' : ''}`}
              onClick={() => handleTaskbarItemClick(window.id)}
              title={window.title}
            >
              <i className={`${window.icon} taskbar-item-icon`}></i>
              
              {/* Indicator bar */}
              <div className={`taskbar-indicator ${isMinimized ? 'minimized' : 'open'} ${isActive ? 'active' : ''}`}></div>
            </button>
          );
        })}
      </div>

      {/* Right section - Show Desktop Button */}
      <div className="taskbar-right">
        <button 
          className={`show-desktop-button ${showDesktop ? 'active' : ''}`}
          onClick={toggleShowDesktop}
          title={showDesktop ? 'Restore Windows' : 'Show Desktop'}
        >
          <div className="show-desktop-line"></div>
        </button>
      </div>
    </div>
  );
};

export default Taskbar;
```

---

## 4. Start Menu Component

### File: `src/components/StartMenu.js` (NEW FILE)

```javascript
import React, { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useWindowManager } from './WindowManager';
import './StartMenu.css';

const StartMenu = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { startMenuOpen, closeStartMenu } = useWindowManager();
  const menuRef = useRef(null);

  // Page definitions with icons
  const pages = [
    { id: 'home', path: '/', title: 'Home.exe', icon: 'fas fa-home', color: '#4fc3f7' },
    { id: 'about', path: '/about', title: 'About.exe', icon: 'fas fa-user', color: '#81c784' },
    { id: 'projects', path: '/projects', title: 'Projects.exe', icon: 'fas fa-folder-open', color: '#ffb74d' },
    { id: 'skills', path: '/skills', title: 'Skills.exe', icon: 'fas fa-code', color: '#ba68c8' },
    { id: 'resume', path: '/resume', title: 'Resume.exe', icon: 'fas fa-file-alt', color: '#4db6ac' },
    { id: 'contact', path: '/contact', title: 'Contact.exe', icon: 'fas fa-envelope', color: '#f06292' },
    { id: 'guestbook', path: '/guestbook', title: 'Guestbook.exe', icon: 'fas fa-comments', color: '#aed581' },
    { id: 'book-call', path: '/book-call', title: 'BookCall.exe', icon: 'fas fa-phone-alt', color: '#64b5f6' },
  ];

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        // Check if click was on start button
        if (!event.target.closest('.start-button')) {
          closeStartMenu();
        }
      }
    };

    if (startMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [startMenuOpen, closeStartMenu]);

  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && startMenuOpen) {
        closeStartMenu();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [startMenuOpen, closeStartMenu]);

  // Handle page click
  const handlePageClick = (path) => {
    navigate(path);
    closeStartMenu();
  };

  if (!startMenuOpen) return null;

  return (
    <div className="start-menu-overlay">
      <div className="start-menu" ref={menuRef}>
        {/* Header */}
        <div className="start-menu-header">
          <span className="start-menu-title">Curtis Workspace</span>
        </div>

        {/* Search bar (decorative) */}
        <div className="start-menu-search">
          <i className="fas fa-search search-icon"></i>
          <input 
            type="text" 
            placeholder="Type here to search" 
            className="search-input"
            disabled
          />
        </div>

        {/* Pinned apps section */}
        <div className="start-menu-section">
          <div className="section-header">
            <span>Pinned</span>
          </div>
          <div className="apps-grid">
            {pages.map(page => (
              <button
                key={page.id}
                className={`app-item ${location.pathname === page.path ? 'current' : ''}`}
                onClick={() => handlePageClick(page.path)}
              >
                <div 
                  className="app-icon-wrapper"
                  style={{ backgroundColor: `${page.color}20` }}
                >
                  <i 
                    className={`${page.icon} app-icon`}
                    style={{ color: page.color }}
                  ></i>
                </div>
                <span className="app-title">{page.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="start-menu-footer">
          <div className="user-profile">
            <div className="user-avatar">
              <i className="fas fa-user"></i>
            </div>
            <span className="user-name">Curtis</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StartMenu;
```

### File: `src/components/StartMenu.css` (NEW FILE)

```css
/* Start Menu Overlay */
.start-menu-overlay {
  position: fixed;
  bottom: 58px; /* Above taskbar (48px + 10px gap) */
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  z-index: 2000;
  pointer-events: none;
}

/* Start Menu Container */
.start-menu {
  width: 600px;
  max-width: calc(100vw - 40px);
  background: rgba(32, 32, 32, 0.95);
  backdrop-filter: blur(30px);
  -webkit-backdrop-filter: blur(30px);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 
    0 32px 64px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(255, 255, 255, 0.05) inset;
  overflow: hidden;
  pointer-events: auto;
  
  /* Animation */
  animation: startMenuSlideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes startMenuSlideUp {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Header */
.start-menu-header {
  padding: 20px 24px 12px;
}

.start-menu-title {
  font-size: 14px;
  font-weight: 600;
  color: #ffffff;
  letter-spacing: 0.5px;
}

/* Search Bar */
.start-menu-search {
  margin: 0 16px 16px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  display: flex;
  align-items: center;
  padding: 10px 14px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.2s ease;
}

.start-menu-search:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.1);
}

.search-icon {
  color: rgba(255, 255, 255, 0.5);
  font-size: 14px;
  margin-right: 10px;
}

.search-input {
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  width: 100%;
  outline: none;
}

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

/* Section */
.start-menu-section {
  padding: 0 16px 16px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 8px 12px;
}

.section-header span {
  font-size: 13px;
  font-weight: 600;
  color: #ffffff;
}

/* Apps Grid */
.apps-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 4px;
}

/* App Item */
.app-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 8px;
  background: transparent;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.app-item:hover {
  background: rgba(255, 255, 255, 0.08);
}

.app-item:active {
  background: rgba(255, 255, 255, 0.05);
  transform: scale(0.97);
}

.app-item.current {
  background: rgba(96, 205, 255, 0.15);
}

.app-item.current:hover {
  background: rgba(96, 205, 255, 0.2);
}

/* App Icon Wrapper */
.app-icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
  transition: transform 0.2s ease;
}

.app-item:hover .app-icon-wrapper {
  transform: scale(1.05);
}

.app-icon {
  font-size: 22px;
}

/* App Title */
.app-title {
  font-size: 11px;
  color: #ffffff;
  text-align: center;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Footer */
.start-menu-footer {
  background: rgba(0, 0, 0, 0.2);
  padding: 12px 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(96, 205, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #60cdff;
  font-size: 14px;
}

.user-name {
  font-size: 13px;
  color: #ffffff;
  font-weight: 500;
}
```

---

## 5. Window Snapping System

### Snap Zones Diagram

```
┌─────────────────────────────────────────────────────────┐
│  TOP-LEFT      │        TOP (Fullscreen)       │ TOP-RIGHT     │
│  (Quarter)     │                               │ (Quarter)     │
│  ↖             │            ↑                  │      ↗        │
├────────────────┼───────────────────────────────┼───────────────┤
│                │                               │               │
│  LEFT          │       (No snap zone)          │    RIGHT      │
│  (Half)   ←    │                               │      →  (Half)│
│                │                               │               │
│                │                               │               │
├────────────────┴───────────────────────────────┴───────────────┤
│                          TASKBAR                                │
└─────────────────────────────────────────────────────────────────┘
```

### Snap Zone Detection Logic

```javascript
// Constants for snap detection
const SNAP_EDGE_THRESHOLD = 20;   // Pixels from edge to trigger snap
const SNAP_CORNER_THRESHOLD = 50; // Pixels from corner to trigger corner snap

/**
 * Detect which snap zone the mouse is in
 * @param {number} mouseX - Mouse X position relative to viewport
 * @param {number} mouseY - Mouse Y position relative to viewport
 * @param {DOMRect} contentRect - Bounding rect of the content area
 * @returns {string|null} - Snap zone identifier or null
 */
const detectSnapZone = (mouseX, mouseY, contentRect) => {
  const { left, right, top, bottom } = contentRect;
  
  const nearLeft = mouseX <= left + SNAP_EDGE_THRESHOLD;
  const nearRight = mouseX >= right - SNAP_EDGE_THRESHOLD;
  const nearTop = mouseY <= top + SNAP_EDGE_THRESHOLD;
  
  // Corner detection (takes priority)
  if (nearTop && nearLeft) {
    return 'top-left';    // Quarter screen - top left
  }
  if (nearTop && nearRight) {
    return 'top-right';   // Quarter screen - top right
  }
  if (nearTop && !nearLeft && !nearRight) {
    return 'top';         // Fullscreen
  }
  
  // Edge detection
  if (nearLeft) {
    return 'left';        // Left half
  }
  if (nearRight) {
    return 'right';       // Right half
  }
  
  return null;            // No snap
};
```

### Snap Position Calculations

```javascript
/**
 * Calculate window position and size for a snap zone
 * @param {string} snapZone - The snap zone identifier
 * @param {DOMRect} contentRect - Content area bounding rect
 * @returns {{ position: {x, y}, size: {width, height} }}
 */
const calculateSnapPosition = (snapZone, contentRect) => {
  const padding = 5; // Gap from edges
  const topBarHeight = 60; // Top bar height
  const taskbarHeight = 48; // Taskbar height
  
  const availableWidth = contentRect.width - (padding * 2);
  const availableHeight = contentRect.height - (padding * 2);
  
  const halfWidth = (availableWidth - padding) / 2;
  const halfHeight = (availableHeight - padding) / 2;

  switch (snapZone) {
    case 'left':
      return {
        position: { x: padding, y: padding },
        size: { width: halfWidth, height: availableHeight }
      };
      
    case 'right':
      return {
        position: { x: padding + halfWidth + padding, y: padding },
        size: { width: halfWidth, height: availableHeight }
      };
      
    case 'top': // Fullscreen
      return {
        position: { x: 0, y: 0 },
        size: { width: contentRect.width, height: contentRect.height }
      };
      
    case 'top-left':
      return {
        position: { x: padding, y: padding },
        size: { width: halfWidth, height: halfHeight }
      };
      
    case 'top-right':
      return {
        position: { x: padding + halfWidth + padding, y: padding },
        size: { width: halfWidth, height: halfHeight }
      };
      
    default:
      return null;
  }
};
```

---

## 6. Snap Preview Overlay

### File: `src/components/SnapPreviewOverlay.js` (NEW FILE)

```javascript
import React from 'react';
import { useWindowManager } from './WindowManager';
import './SnapPreviewOverlay.css';

const SnapPreviewOverlay = () => {
  const { snapZone } = useWindowManager();

  if (!snapZone) return null;

  return (
    <div className={`snap-preview-overlay snap-${snapZone}`}>
      <div className="snap-preview-inner"></div>
    </div>
  );
};

export default SnapPreviewOverlay;
```

### File: `src/components/SnapPreviewOverlay.css` (NEW FILE)

```css
/* Snap Preview Overlay */
.snap-preview-overlay {
  position: absolute;
  z-index: 9998;
  pointer-events: none;
  padding: 5px;
  
  /* Animation */
  animation: snapPreviewFadeIn 0.15s ease-out;
}

@keyframes snapPreviewFadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.snap-preview-inner {
  width: 100%;
  height: 100%;
  background: rgba(96, 205, 255, 0.15);
  border: 2px solid rgba(96, 205, 255, 0.6);
  border-radius: 12px;
  box-shadow: 
    0 0 20px rgba(96, 205, 255, 0.2),
    inset 0 0 30px rgba(96, 205, 255, 0.05);
}

/* Left Half */
.snap-preview-overlay.snap-left {
  top: 5px;
  left: 5px;
  width: calc(50% - 10px);
  height: calc(100% - 10px);
}

/* Right Half */
.snap-preview-overlay.snap-right {
  top: 5px;
  right: 5px;
  width: calc(50% - 10px);
  height: calc(100% - 10px);
}

/* Fullscreen (Top) */
.snap-preview-overlay.snap-top {
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  padding: 0;
}

.snap-preview-overlay.snap-top .snap-preview-inner {
  border-radius: 0;
}

/* Top Left Quarter */
.snap-preview-overlay.snap-top-left {
  top: 5px;
  left: 5px;
  width: calc(50% - 10px);
  height: calc(50% - 10px);
}

/* Top Right Quarter */
.snap-preview-overlay.snap-top-right {
  top: 5px;
  right: 5px;
  width: calc(50% - 10px);
  height: calc(50% - 10px);
}
```

---

## 7. DraggableWindow Updates

### File: `src/components/DraggableWindow.js`

Add the following modifications:

### Import WindowManager Hook

```javascript
// Update imports at top
import { useWindowManager } from './WindowManager';
```

### Add Snap State

```javascript
// Add these state variables (around line 29)
const [isEdgeSnapped, setIsEdgeSnapped] = useState(false);
const [preSnapState, setPreSnapState] = useState(null);
```

### Get Context Functions

```javascript
// Update the destructured values from useWindowManager (around line 12)
const {
  closeWindow,
  minimizeWindow,
  activeWindowId,
  setActiveWindow,
  isAiSnapped,
  snappedWindowId,
  setWindowFullscreen,
  bringWindowToFront,
  setCurrentSnapZone,
  getWindowZIndex
} = useWindowManager();
```

### Update Z-Index Handling

```javascript
// Replace the local zIndex state with context-based zIndex
// Remove: const [zIndex, setZIndex] = useState(globalZIndex++);
// Use: const zIndex = getWindowZIndex(windowId);
```

### Updated handleDrag Function

```javascript
const handleDrag = useCallback((e, data) => {
  if (!isResizing && !isFullscreen && !isSnapped) {
    setPosition({ x: data.x, y: data.y });
    
    // Snap zone detection
    const contentElement = document.querySelector('.content');
    if (contentElement) {
      const contentRect = contentElement.getBoundingClientRect();
      
      const EDGE_THRESHOLD = 20;
      const CORNER_THRESHOLD = 50;
      
      const mouseX = e.clientX;
      const mouseY = e.clientY;
      
      const nearLeft = mouseX <= contentRect.left + EDGE_THRESHOLD;
      const nearRight = mouseX >= contentRect.right - EDGE_THRESHOLD;
      const nearTop = mouseY <= contentRect.top + CORNER_THRESHOLD;
      
      let snapZone = null;
      
      // Corner detection (priority)
      if (nearTop && nearLeft) {
        snapZone = 'top-left';
      } else if (nearTop && nearRight) {
        snapZone = 'top-right';
      } else if (nearTop && !nearLeft && !nearRight) {
        snapZone = 'top';
      } else if (nearLeft) {
        snapZone = 'left';
      } else if (nearRight) {
        snapZone = 'right';
      }
      
      setCurrentSnapZone(snapZone);
    }
  }
}, [isResizing, isFullscreen, isSnapped, setCurrentSnapZone]);
```

### Updated handleDragStop Function

```javascript
const handleDragStop = useCallback((e, data) => {
  if (!isResizing && !isFullscreen && !isSnapped) {
    const contentElement = document.querySelector('.content');
    if (contentElement) {
      const contentRect = contentElement.getBoundingClientRect();
      
      const EDGE_THRESHOLD = 20;
      const CORNER_THRESHOLD = 50;
      
      const mouseX = e.clientX;
      const mouseY = e.clientY;
      
      const nearLeft = mouseX <= contentRect.left + EDGE_THRESHOLD;
      const nearRight = mouseX >= contentRect.right - EDGE_THRESHOLD;
      const nearTop = mouseY <= contentRect.top + CORNER_THRESHOLD;
      
      let snapZone = null;
      
      if (nearTop && nearLeft) {
        snapZone = 'top-left';
      } else if (nearTop && nearRight) {
        snapZone = 'top-right';
      } else if (nearTop && !nearLeft && !nearRight) {
        snapZone = 'top';
      } else if (nearLeft) {
        snapZone = 'left';
      } else if (nearRight) {
        snapZone = 'right';
      }
      
      if (snapZone) {
        // Save pre-snap state for restoration
        if (!isEdgeSnapped) {
          setPreSnapState({
            position: { ...position },
            size: { ...size }
          });
        }
        
        const padding = 5;
        const availableWidth = contentRect.width - (padding * 2);
        const availableHeight = contentRect.height - (padding * 2);
        const halfWidth = (availableWidth - padding) / 2;
        const halfHeight = (availableHeight - padding) / 2;
        
        switch (snapZone) {
          case 'left':
            setPosition({ x: padding, y: padding });
            setSize({ width: halfWidth, height: availableHeight });
            break;
          case 'right':
            setPosition({ x: padding + halfWidth + padding, y: padding });
            setSize({ width: halfWidth, height: availableHeight });
            break;
          case 'top':
            // Fullscreen via snap
            toggleFullscreen();
            break;
          case 'top-left':
            setPosition({ x: padding, y: padding });
            setSize({ width: halfWidth, height: halfHeight });
            break;
          case 'top-right':
            setPosition({ x: padding + halfWidth + padding, y: padding });
            setSize({ width: halfWidth, height: halfHeight });
            break;
          default:
            break;
        }
        
        setIsEdgeSnapped(true);
      } else {
        setPosition({ x: data.x, y: data.y });
        
        // If was edge snapped and dragged away, restore size
        if (isEdgeSnapped && preSnapState) {
          setSize(preSnapState.size);
          setIsEdgeSnapped(false);
          setPreSnapState(null);
        }
      }
    }
    
    // Clear snap zone preview
    setCurrentSnapZone(null);
    
    setTimeout(() => setIsDragging(false), 0);
  }
}, [isResizing, isFullscreen, isSnapped, position, size, isEdgeSnapped, preSnapState, setCurrentSnapZone, toggleFullscreen]);
```

### Update handleWindowClick

```javascript
const handleWindowClick = useCallback((e) => {
  if (!isResizing && !isDragging) {
    bringWindowToFront(windowId);
  }
}, [bringWindowToFront, windowId, isResizing, isDragging]);
```

---

## 8. App.js Integration

### File: `src/App.js`

Add imports and integrate new components:

### Update Imports

```javascript
// Add these imports at the top
import StartMenu from './components/StartMenu';
import SnapPreviewOverlay from './components/SnapPreviewOverlay';
```

### Update AppWithRoutes Function

```javascript
function AppWithRoutes() {
  const { windows } = useWindowManager();
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);
  
  return (
    <div className="App">
      <MobileOrientationOverlay />
      <TopBar />
      <AiOrb />
      <div className="main-content">
        {!isMobile && <Sidebar />}
        <div className="content">
          {/* Add snap preview overlay */}
          {!isMobile && <SnapPreviewOverlay />}
          
          <Routes>
            {/* ... existing routes ... */}
          </Routes>
        </div>
      </div>
      
      {/* Always render taskbar on desktop (even with no windows) */}
      {!isMobile && <Taskbar />}
      
      {/* Add Start Menu */}
      {!isMobile && <StartMenu />}
      
      {isMobile && <MobileNav />}
    </div>
  );
}
```

---

## 9. CSS Styling

### File: `src/components/Taskbar.css` (Complete Rewrite)

```css
/* ===================================
   Windows 11 Style Taskbar
   =================================== */

.taskbar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 48px;
  
  /* Glass-morphism effect */
  background: rgba(30, 30, 30, 0.85);
  backdrop-filter: blur(30px);
  -webkit-backdrop-filter: blur(30px);
  
  /* Layout */
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
  
  /* Border & Shadow */
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 -2px 20px rgba(0, 0, 0, 0.3);
  
  z-index: 1500;
}

/* ===================================
   Taskbar Left (Start Button)
   =================================== */

.taskbar-left {
  display: flex;
  align-items: center;
}

.start-button {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
  position: relative;
}

.start-button:hover {
  background: rgba(255, 255, 255, 0.1);
}

.start-button:active,
.start-button.active {
  background: rgba(255, 255, 255, 0.15);
}

.start-icon {
  width: 22px;
  height: 22px;
  object-fit: contain;
  transition: transform 0.2s ease;
}

.start-button:hover .start-icon {
  transform: scale(1.05);
}

/* ===================================
   Taskbar Center (Window Icons)
   =================================== */

.taskbar-center {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  flex: 1;
}

.taskbar-item {
  width: 44px;
  height: 40px;
  border-radius: 8px;
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  transition: all 0.15s ease;
}

.taskbar-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.taskbar-item:active {
  background: rgba(255, 255, 255, 0.15);
  transform: scale(0.95);
}

.taskbar-item.active {
  background: rgba(255, 255, 255, 0.08);
}

.taskbar-item-icon {
  font-size: 18px;
  color: #ffffff;
  transition: transform 0.2s ease;
}

.taskbar-item:hover .taskbar-item-icon {
  transform: scale(1.1);
}

.taskbar-item.minimized .taskbar-item-icon {
  opacity: 0.7;
}

/* ===================================
   Taskbar Indicator (Open/Minimized)
   =================================== */

.taskbar-indicator {
  position: absolute;
  bottom: 4px;
  height: 3px;
  border-radius: 2px;
  background: #60cdff;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

/* Open window - larger indicator */
.taskbar-indicator.open {
  width: 16px;
  opacity: 1;
}

/* Active window - brightest indicator */
.taskbar-indicator.open.active {
  width: 20px;
  background: #60cdff;
  box-shadow: 0 0 8px rgba(96, 205, 255, 0.5);
}

/* Minimized window - smaller indicator */
.taskbar-indicator.minimized {
  width: 6px;
  opacity: 0.6;
}

/* ===================================
   Taskbar Right (Show Desktop)
   =================================== */

.taskbar-right {
  display: flex;
  align-items: center;
}

.show-desktop-button {
  width: 6px;
  height: 40px;
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  margin-left: 8px;
  border-radius: 2px;
  transition: all 0.2s ease;
}

.show-desktop-button:hover {
  background: rgba(255, 255, 255, 0.2);
}

.show-desktop-button.active {
  background: rgba(96, 205, 255, 0.3);
}

.show-desktop-line {
  width: 2px;
  height: 20px;
  background: rgba(255, 255, 255, 0.4);
  border-radius: 1px;
  transition: all 0.2s ease;
}

.show-desktop-button:hover .show-desktop-line {
  background: rgba(255, 255, 255, 0.7);
}

/* ===================================
   Hover Animation for Items
   =================================== */

.taskbar-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 8px;
  background: radial-gradient(
    circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
    rgba(255, 255, 255, 0.1) 0%,
    transparent 50%
  );
  opacity: 0;
  transition: opacity 0.15s ease;
  pointer-events: none;
}

.taskbar-item:hover::before {
  opacity: 1;
}

/* ===================================
   Mobile - Hide Taskbar
   =================================== */

@media (max-width: 768px) {
  .taskbar {
    display: none;
  }
}
```

### File: `src/App.css` - Updates Needed

Add this to the main-content section (modify existing):

```css
/* Update the main-content padding for taskbar */
.main-content {
  display: flex;
  flex: 1;
  width: 100%;
  height: calc(100% - 60px - 48px); /* TopBar + Taskbar */
  overflow: hidden;
  position: relative;
  background-color: #0a192f;
  padding-bottom: 0; /* Taskbar is fixed, no padding needed */
}
```

---

## 10. Testing Checklist

### Taskbar Visibility
- [ ] Taskbar appears at bottom on page load (even with no windows)
- [ ] Taskbar is hidden on mobile (< 768px)
- [ ] Glass-morphism effect is visible

### Start Menu
- [ ] Click favicon opens start menu
- [ ] Start menu appears centered above taskbar
- [ ] All 8 page icons are displayed
- [ ] Clicking a page navigates and closes menu
- [ ] Clicking outside closes menu
- [ ] Escape key closes menu
- [ ] Current page has highlight indicator

### Window Icons
- [ ] Opening a page adds icon to taskbar center
- [ ] Icon shows correct file icon
- [ ] Active window has bright indicator
- [ ] Multiple windows show multiple icons

### Minimize/Restore
- [ ] Minimize button hides window
- [ ] Minimized window shows small indicator
- [ ] Clicking minimized icon restores window
- [ ] Restored window shows large indicator

### Show Desktop
- [ ] Click show desktop minimizes all windows
- [ ] All indicators become small
- [ ] Click again restores all windows
- [ ] Indicators return to previous states

### Click-to-Front
- [ ] Click background window brings to front
- [ ] Click taskbar icon of background window brings to front
- [ ] Active indicator updates correctly

### Window Snapping
- [ ] Drag to left edge shows left-half preview
- [ ] Release snaps to left half
- [ ] Drag to right edge shows right-half preview
- [ ] Release snaps to right half
- [ ] Drag to top-left corner shows quarter preview
- [ ] Release snaps to top-left quarter
- [ ] Drag to top-right corner shows quarter preview
- [ ] Release snaps to top-right quarter
- [ ] Drag to top center (not corner) shows fullscreen preview
- [ ] Release maximizes window
- [ ] Preview has glass effect and animation
- [ ] Dragging snapped window away restores original size

### Animations
- [ ] Start menu slides up smoothly
- [ ] Snap preview fades in smoothly
- [ ] Taskbar icons have hover effects
- [ ] Indicators animate size changes
- [ ] Window snap transitions are smooth

---

## Quick Reference: File Changes Summary

| File | Action | Lines Changed (Approx) |
|------|--------|------------------------|
| `WindowManager.js` | MODIFY | +80 lines |
| `Taskbar.js` | REWRITE | ~80 lines |
| `Taskbar.css` | REWRITE | ~200 lines |
| `StartMenu.js` | NEW | ~120 lines |
| `StartMenu.css` | NEW | ~180 lines |
| `SnapPreviewOverlay.js` | NEW | ~15 lines |
| `SnapPreviewOverlay.css` | NEW | ~80 lines |
| `DraggableWindow.js` | MODIFY | +100 lines |
| `App.js` | MODIFY | +10 lines |
| `App.css` | MODIFY | +5 lines |

**Total new code: ~870 lines**

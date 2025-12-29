import React, { useState, useRef, useEffect, useCallback } from 'react';
import './DraggableWindow.css';
import 'react-resizable/css/styles.css';
import { useWindowManager } from './WindowManager';
import DraggableWrapper from './DraggableWrapper';
import ResizableWrapper from './ResizableWrapper';

// Global z-index counter to manage window stacking
let globalZIndex = 1000;

// Track window count for offset positioning
let windowCount = 0;

const DraggableWindow = ({ children, title, icon, windowId }) => {
  const {
    registerWindow,
    closeWindow,
    minimizeWindow,
    minimizedWindows,
    activeWindowId,
    setActiveWindow,
    isAiSnapped,
    snappedWindowId,
    setWindowFullscreen,
    bringWindowToFront,
    setCurrentSnapZone,
    getWindowZIndex,
    windowOrder // CRITICAL: include this to trigger re-render when z-index order changes
  } = useWindowManager();

  // Calculate offset for window stacking
  const [windowOffset] = useState(() => {
    const offset = (windowCount % 5) * 30; // Max 5 levels, then reset
    windowCount++;
    return offset;
  });

  const [position, setPosition] = useState({ x: 50 + windowOffset, y: 50 + windowOffset });
  const [size, setSize] = useState({ width: 900, height: 600 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [previousState, setPreviousState] = useState({ position: { x: 50 + windowOffset, y: 50 + windowOffset }, size: { width: 900, height: 600 } });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [bounds, setBounds] = useState({ left: 0, top: 0, right: 0, bottom: 0 });

  // NEW: Edge snap state
  const [isEdgeSnapped, setIsEdgeSnapped] = useState(false);
  const [preSnapState, setPreSnapState] = useState(null);

  // Use context-based z-index instead of local state
  const zIndex = getWindowZIndex(windowId);

  const windowRef = useRef(null);
  const draggableRef = useRef(null);
  const resizableRef = useRef(null);

  // Check if this window is active
  const isActive = activeWindowId === windowId;

  // Check if this window is in snapped mode
  const isSnapped = isAiSnapped && snappedWindowId === windowId;

  // Check if this window is minimized
  const isMinimized = minimizedWindows && minimizedWindows.includes(windowId);

  // Calculate bounds to allow free window movement within content area
  useEffect(() => {
    const updateBounds = () => {
      const contentElement = document.querySelector('.content');

      if (contentElement) {
        const contentRect = contentElement.getBoundingClientRect();

        // Allow windows to move freely within reasonable bounds
        // Leave some room to grab the title bar even if window is near edges
        setBounds({
          left: -size.width + 100, // Allow dragging mostly off-screen but keep some grabbable
          top: 0,
          right: contentRect.width - 100,
          bottom: contentRect.height - 50 // Keep title bar visible
        });
      }
    };

    updateBounds();
    window.addEventListener('resize', updateBounds);

    return () => window.removeEventListener('resize', updateBounds);
  }, [size.width, size.height]);

  // Note: Window is registered via openWindow() in Sidebar/StartMenu
  // No need to call registerWindow here as it would duplicate/conflict

  // Force fullscreen positioning - use the window-wrapper as reference since it fills the content area
  useEffect(() => {
    const updateFullscreenPosition = () => {
      if (isFullscreen && windowRef.current) {
        const draggableElement = windowRef.current.closest('.draggable-window');
        const windowWrapper = document.querySelector('.window-wrapper');

        if (draggableElement && windowWrapper) {
          const wrapperRect = windowWrapper.getBoundingClientRect();

          // Position absolutely within window-wrapper, filling it completely
          // Account for the 20px padding of window-wrapper
          draggableElement.style.position = 'absolute';
          draggableElement.style.top = '0';
          draggableElement.style.left = '0';
          draggableElement.style.width = '100%';
          draggableElement.style.height = '100%';
          draggableElement.style.transform = 'none';
          draggableElement.style.margin = '0';
          draggableElement.style.padding = '0';
          draggableElement.style.right = 'auto';
          draggableElement.style.bottom = 'auto';
          draggableElement.style.borderRadius = '0';
        }
      } else if (!isFullscreen && windowRef.current) {
        // Clear inline styles when exiting fullscreen
        const draggableElement = windowRef.current.closest('.draggable-window');
        if (draggableElement) {
          draggableElement.style.position = '';
          draggableElement.style.top = '';
          draggableElement.style.left = '';
          draggableElement.style.right = '';
          draggableElement.style.bottom = '';
          draggableElement.style.width = '';
          draggableElement.style.height = '';
          draggableElement.style.transform = '';
          draggableElement.style.margin = '';
          draggableElement.style.padding = '';
          draggableElement.style.borderRadius = '';
        }
      }
    };

    // Use requestAnimationFrame to ensure DOM is ready
    requestAnimationFrame(updateFullscreenPosition);

    // Update position on window resize
    if (isFullscreen) {
      window.addEventListener('resize', updateFullscreenPosition);
      return () => window.removeEventListener('resize', updateFullscreenPosition);
    }
  }, [isFullscreen]);

  // Handle window resize when the browser window resizes
  useEffect(() => {
    const handleResize = () => {
      if (isFullscreen) {
        // Update fullscreen dimensions to match content area
        const contentElement = document.querySelector('.content');
        if (contentElement) {
          const contentRect = contentElement.getBoundingClientRect();
          setSize({
            width: contentRect.width,
            height: contentRect.height
          });
        }
      } else if (isSnapped) {
        // Calculate dimensions for snapped window - half of available space
        const contentSpace = document.querySelector('.content');
        if (contentSpace) {
          const contentWidth = contentSpace.offsetWidth;
          const contentHeight = contentSpace.offsetHeight;

          setSize({
            width: Math.floor(contentWidth * 0.45), // 45% of content space
            height: contentHeight - 40 // Full height minus padding
          });

          // Position at the left side of content area
          setPosition({ x: 10, y: 10 });
        }
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isFullscreen, isSnapped]);

  // Update window position and size when snapped state changes
  useEffect(() => {
    if (isSnapped) {
      console.log('DraggableWindow: Entering snap mode for window:', windowId);

      // Exit fullscreen if we're entering snapped mode
      if (isFullscreen) {
        setIsFullscreen(false);
        if (setWindowFullscreen && windowId) {
          setWindowFullscreen(windowId, false);
        }
      }

      // Save current position and size before snapping
      setPreviousState({
        position: { ...position },
        size: { ...size }
      });

      // Apply snapped positioning with a delay to allow CSS animation to start
      const applySnapPosition = () => {
        // Calculate dimensions for snapped window - use viewport percentages
        // AI chat takes ~40% on right, content (with window) takes ~55% on left
        // Account for sidebar width (~200px) and some padding
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const topBarHeight = 60; // Top bar height
        const taskbarHeight = 40; // Taskbar height
        const sidebarWidth = 200; // Sidebar width

        // Window should fill the left 55% minus sidebar
        const availableWidth = (viewportWidth * 0.55) - sidebarWidth - 40; // 40px padding
        const availableHeight = viewportHeight - topBarHeight - taskbarHeight - 40; // 40px padding

        console.log('DraggableWindow: Snap dimensions - width:', availableWidth, 'height:', availableHeight);

        // Position at top-left of content area  
        setPosition({ x: 10, y: 10 });

        // Size to fill the split area
        setSize({
          width: Math.max(400, availableWidth),
          height: Math.max(300, availableHeight)
        });
      };

      // Small delay to ensure CSS split-animation has started
      setTimeout(applySnapPosition, 100);
    } else if (previousState && previousState.position && !isFullscreen) {
      // If exiting snapped mode and not going to fullscreen, restore previous state
      console.log('DraggableWindow: Exiting snap mode, restoring previous state');
      setPosition(previousState.position);
      setSize(previousState.size);
    }
  }, [isSnapped]);

  // Bring window to front - now uses context
  const bringToFront = useCallback(() => {
    if (windowId) {
      bringWindowToFront(windowId);
    }
  }, [windowId, bringWindowToFront]);

  // Toggle fullscreen mode
  const toggleFullscreen = useCallback(() => {
    if (!isFullscreen) {
      // Save current position and size before going fullscreen
      setPreviousState({
        position: { ...position },
        size: { ...size }
      });

      // Set position to (0,0) - the useEffect will handle actual positioning
      setPosition({ x: 0, y: 0 });

      // Get the window-wrapper dimensions (which fills the content area)
      const windowWrapper = document.querySelector('.window-wrapper');
      if (windowWrapper) {
        const wrapperRect = windowWrapper.getBoundingClientRect();
        // Set size to fill the window-wrapper
        setSize({
          width: wrapperRect.width,
          height: wrapperRect.height
        });
      }

      // Set to fullscreen - CSS will handle the actual dimensions
      setIsFullscreen(true);
      // Notify window manager
      if (setWindowFullscreen && windowId) {
        setWindowFullscreen(windowId, true);
      }
    } else {
      // Restore previous position and size
      setPosition(previousState.position);
      setSize(previousState.size);
      setIsFullscreen(false);
      // Notify window manager
      if (setWindowFullscreen && windowId) {
        setWindowFullscreen(windowId, false);
      }
    }

    // Always bring to front when toggling fullscreen
    bringToFront();
  }, [isFullscreen, position, size, previousState, setWindowFullscreen, windowId, bringToFront]);

  // Handle drag start - includes exit from fullscreen/snapped mode on drag
  const handleDragStart = useCallback((e, data) => {
    // If window is fullscreen and user tries to drag, restore it to normal size
    if (isFullscreen) {
      // Get the wrapper element to calculate relative positions
      const windowWrapper = document.querySelector('.window-wrapper');
      if (!windowWrapper) return;

      const wrapperRect = windowWrapper.getBoundingClientRect();

      // Calculate mouse position relative to the wrapper area
      const mouseX = e.clientX - wrapperRect.left;
      const mouseY = e.clientY - wrapperRect.top;

      // Restore to previous size
      const restoredWidth = previousState.size.width;
      const restoredHeight = previousState.size.height;

      // Position the window so the mouse is at the same relative position on the title bar
      // Center the window horizontally under the cursor
      let newX = mouseX - (restoredWidth / 2);
      let newY = mouseY - 15; // 15px is roughly half the title bar height

      // Ensure the window stays within bounds (accounting for the 10px buffer)
      const maxX = wrapperRect.width - restoredWidth - 10;
      const maxY = wrapperRect.height - restoredHeight - 10;
      newX = Math.max(0, Math.min(newX, maxX));
      newY = Math.max(0, Math.min(newY, maxY));

      setPosition({ x: newX, y: newY });
      setSize(previousState.size);
      setIsFullscreen(false);
      // Notify window manager
      if (setWindowFullscreen && windowId) {
        setWindowFullscreen(windowId, false);
      }
      setIsDragging(true);
      bringToFront();
      return;
    }

    // If window is snapped with AI, exit snap mode when dragging starts
    if (isSnapped && previousState) {
      console.log('DraggableWindow: Exiting snap mode via drag');

      // Restore to previous size and center under cursor
      const restoredWidth = previousState.size.width || 900;
      const restoredHeight = previousState.size.height || 600;

      // Calculate position based on mouse
      const mouseX = e.clientX;
      const mouseY = e.clientY;
      const contentElement = document.querySelector('.content');
      const contentRect = contentElement ? contentElement.getBoundingClientRect() : { left: 200, top: 60 };

      let newX = mouseX - contentRect.left - (restoredWidth / 2);
      let newY = mouseY - contentRect.top - 15;

      // Ensure within bounds
      newX = Math.max(0, newX);
      newY = Math.max(0, newY);

      setPosition({ x: newX, y: newY });
      setSize({ width: restoredWidth, height: restoredHeight });

      // Call the global exit function to update WindowManager state
      if (window.exitSnappedModeRef) {
        window.exitSnappedModeRef();
      }

      setIsDragging(true);
      bringToFront();
      return;
    }

    // Only set dragging state if not already resizing
    if (!isResizing) {
      setIsDragging(true);
      bringToFront();
    }
  }, [bringToFront, isResizing, isFullscreen, isSnapped, previousState, setWindowFullscreen, windowId]);

  // Handle drag - with snap zone detection
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

        let detectedSnapZone = null;

        // Corner detection (priority)
        if (nearTop && nearLeft) {
          detectedSnapZone = 'top-left';
        } else if (nearTop && nearRight) {
          detectedSnapZone = 'top-right';
        } else if (nearTop && !nearLeft && !nearRight) {
          detectedSnapZone = 'top';
        } else if (nearLeft) {
          detectedSnapZone = 'left';
        } else if (nearRight) {
          detectedSnapZone = 'right';
        }

        setCurrentSnapZone(detectedSnapZone);
      }
    }
  }, [isResizing, isFullscreen, isSnapped, setCurrentSnapZone]);

  // Handle drag end - with snap positioning
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

        let detectedSnapZone = null;

        if (nearTop && nearLeft) {
          detectedSnapZone = 'top-left';
        } else if (nearTop && nearRight) {
          detectedSnapZone = 'top-right';
        } else if (nearTop && !nearLeft && !nearRight) {
          detectedSnapZone = 'top';
        } else if (nearLeft) {
          detectedSnapZone = 'left';
        } else if (nearRight) {
          detectedSnapZone = 'right';
        }

        if (detectedSnapZone) {
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

          switch (detectedSnapZone) {
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

  // Handle resize start
  const handleResizeStart = useCallback((e, data) => {
    setIsResizing(true);
    bringToFront();
  }, [bringToFront]);

  // Handle resize
  const handleResize = useCallback((e, data) => {
    if (!isFullscreen && !isSnapped) {
      setSize({
        width: data.size.width,
        height: data.size.height
      });
    }
  }, [isFullscreen, isSnapped]);

  // Handle resize stop
  const handleResizeStop = useCallback((e, data) => {
    if (!isFullscreen && !isSnapped) {
      setSize({
        width: data.size.width,
        height: data.size.height
      });
    }

    setTimeout(() => setIsResizing(false), 50);
  }, [isFullscreen, isSnapped]);

  // Close window
  const handleClose = useCallback(() => {
    if (windowId && closeWindow) {
      closeWindow(windowId);
    } else if (windowRef.current) {
      // Fallback for non-managed windows
      windowRef.current.style.display = 'none';
    }
  }, [windowId, closeWindow]);

  // Minimize window
  const handleMinimize = useCallback(() => {
    if (windowId && minimizeWindow) {
      minimizeWindow(windowId);
    }
  }, [windowId, minimizeWindow]);

  // Handle window click - bring to front
  const handleWindowClick = useCallback((e) => {
    // Only bring to front if not clicking on controls
    if (!e.target.closest('.window-controls')) {
      bringToFront();
    }
  }, [bringToFront]);

  return (
    <DraggableWrapper
      handle=".window-title-bar"
      position={position}
      onStart={handleDragStart}
      onDrag={handleDrag}
      onStop={handleDragStop}
      disabled={false}
      isFullscreen={isFullscreen}
      bounds={bounds}
      cancel=".window-controls *, .resize-handle"
      ref={draggableRef}
      style={{ zIndex }} // z-index on wrapper for proper stacking context
    >
      <div
        className={`draggable-window ${isFullscreen ? 'fullscreen' : ''} 
                  ${isDragging ? 'dragging' : ''} 
                  ${isActive ? 'active' : ''}
                  ${isSnapped ? 'snapped' : ''}
                  ${isMinimized ? 'minimized' : ''}`}
        style={{
          display: isMinimized ? 'none' : 'block'
        }}
        onMouseDown={handleWindowClick}
      >
        <ResizableWrapper
          width={size.width}
          height={size.height}
          onResize={handleResize}
          onResizeStart={handleResizeStart}
          onResizeStop={handleResizeStop}
          minConstraints={[400, 300]}
          maxConstraints={[window.innerWidth - 20, window.innerHeight - 20]}
          resizeHandles={['se', 'sw', 'ne', 'nw', 'e', 's', 'w', 'n']}
          disabled={isFullscreen || isDragging || isSnapped}
          style={isFullscreen ? { width: '100%', height: '100%' } : {}}
          ref={resizableRef}
        >
          <div
            className="window-container"
            style={{
              width: '100%',
              height: '100%'
            }}
            ref={windowRef}
            onClick={handleWindowClick}
          >
            <div className="window-title-bar">
              <div className="window-title">
                {icon && <i className={`${icon} window-icon`}></i>}
                <span>{title || 'Window'}</span>
              </div>
              <div className="window-controls">
                <button className="window-control minimize" onClick={handleMinimize}>
                  <i className="fas fa-minus"></i>
                </button>
                <button
                  className={`window-control ${isFullscreen ? 'restore' : 'maximize'}`}
                  onClick={toggleFullscreen}
                >
                  {isFullscreen
                    ? <i className="fas fa-compress"></i>
                    : <i className="fas fa-expand"></i>
                  }
                </button>
                <button className="window-control close" onClick={handleClose}>
                  <i className="fas fa-times"></i>
                </button>
              </div>
            </div>
            <div className="window-content">
              {children}
            </div>
          </div>
        </ResizableWrapper>
      </div>
    </DraggableWrapper>
  );
};

export default DraggableWindow;
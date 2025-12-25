import React, { useState, useRef, useEffect, useCallback } from 'react';
import './DraggableWindow.css';
import 'react-resizable/css/styles.css';
import { useWindowManager } from './WindowManager';
import DraggableWrapper from './DraggableWrapper';
import ResizableWrapper from './ResizableWrapper';

// Global z-index counter to manage window stacking
let globalZIndex = 1000;

const DraggableWindow = ({ children, title, icon, windowId }) => {
  const { 
    closeWindow, 
    minimizeWindow, 
    activeWindowId, 
    setActiveWindow, 
    isAiSnapped, 
    snappedWindowId,
    setWindowFullscreen 
  } = useWindowManager();
  
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [size, setSize] = useState({ width: 900, height: 600 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [previousState, setPreviousState] = useState({ position: { x: 50, y: 50 }, size: { width: 900, height: 600 } });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [zIndex, setZIndex] = useState(globalZIndex++);
  const [bounds, setBounds] = useState({ left: 0, top: 0, right: 0, bottom: 0 });
  
  const windowRef = useRef(null);
  const draggableRef = useRef(null);
  const resizableRef = useRef(null);
  
  // Check if this window is active
  const isActive = activeWindowId === windowId;
  
  // Check if this window is in snapped mode
  const isSnapped = isAiSnapped && snappedWindowId === windowId;
  
  // Calculate bounds to keep window within the content area
  useEffect(() => {
    const updateBounds = () => {
      const windowWrapper = document.querySelector('.window-wrapper');
      
      if (windowWrapper) {
        const wrapperRect = windowWrapper.getBoundingClientRect();
        
        // Calculate the actual available space accounting for wrapper padding
        const availableWidth = wrapperRect.width;
        const availableHeight = wrapperRect.height;
        
        // Set bounds to keep entire window visible
        // Subtract 10px from right/bottom to ensure window doesn't get cut off
        setBounds({
          left: 0,
          top: 0,
          right: Math.max(0, availableWidth - size.width - 10),
          bottom: Math.max(0, availableHeight - size.height - 10)
        });
      }
    };

    updateBounds();
    window.addEventListener('resize', updateBounds);
    
    return () => window.removeEventListener('resize', updateBounds);
  }, [size.width, size.height]);
  
  // Register with window manager when mounted
  useEffect(() => {
    if (windowId && setActiveWindow) {
      setActiveWindow(windowId);
    }
  }, [windowId, setActiveWindow]);

  // Set this window as active when clicked
  useEffect(() => {
    if (isActive) {
      bringToFront();
    }
  }, [isActive]);

  // Force fullscreen positioning to override react-draggable transforms
  useEffect(() => {
    const updateFullscreenPosition = () => {
      if (isFullscreen && windowRef.current) {
        const draggableElement = windowRef.current.closest('.draggable-window');
        const contentElement = document.querySelector('.content');
        
        if (draggableElement && contentElement) {
          const contentRect = contentElement.getBoundingClientRect();
          
          // Position fixed relative to viewport, but aligned with content area
          draggableElement.style.position = 'fixed';
          draggableElement.style.top = `${contentRect.top}px`;
          draggableElement.style.left = `${contentRect.left}px`;
          draggableElement.style.width = `${contentRect.width}px`;
          draggableElement.style.height = `${contentRect.height}px`;
          draggableElement.style.transform = 'none';
          draggableElement.style.margin = '0';
          draggableElement.style.padding = '0';
          draggableElement.style.right = 'auto';
          draggableElement.style.bottom = 'auto';
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
        }
      }
    };

    updateFullscreenPosition();
    
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
      // Save current position and size before snapping
      setPreviousState({
        position: { ...position },
        size: { ...size }
      });
      
      // Calculate dimensions for snapped window
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
    } else if (previousState && previousState.position && !isFullscreen) {
      // If exiting snapped mode and not going to fullscreen, restore previous state
      setPosition(previousState.position);
      setSize(previousState.size);
    }
  }, [isSnapped]);

  // Bring window to front
  const bringToFront = useCallback(() => {
    setZIndex(globalZIndex++);
    if (windowId && !isActive && setActiveWindow) {
      setActiveWindow(windowId);
    }
  }, [windowId, isActive, setActiveWindow]);

  // Toggle fullscreen mode
  const toggleFullscreen = useCallback(() => {
    if (!isFullscreen) {
      // Save current position and size before going fullscreen
      setPreviousState({
        position: { ...position },
        size: { ...size }
      });
      
      // Set position to (0,0) relative to content area
      setPosition({ x: 0, y: 0 });
      
      // Get the content area dimensions
      const contentElement = document.querySelector('.content');
      if (contentElement) {
        const contentRect = contentElement.getBoundingClientRect();
        // Set size to fill the content area
        setSize({
          width: contentRect.width,
          height: contentRect.height
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

  // Handle window click to bring to front
  const handleWindowClick = useCallback((e) => {
    if (!isResizing && !isDragging) {
      bringToFront();
    }
  }, [bringToFront, isResizing, isDragging]);

  // Handle drag start
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
    
    // Only set dragging state if not already resizing
    if (!isResizing) {
      setIsDragging(true);
      bringToFront();
    }
  }, [bringToFront, isResizing, isFullscreen, previousState, setWindowFullscreen, windowId]);

  // Handle drag
  const handleDrag = useCallback((e, data) => {
    if (!isResizing && !isFullscreen && !isSnapped) {
      // Update position continuously during drag for smooth movement
      setPosition({ x: data.x, y: data.y });
    }
  }, [isResizing, isFullscreen, isSnapped]);

  // Handle drag end
  const handleDragStop = useCallback((e, data) => {
    if (!isResizing && !isFullscreen && !isSnapped) {
      setPosition({ x: data.x, y: data.y });
      // Small delay before unsetting drag state to prevent immediate click events
      setTimeout(() => setIsDragging(false), 0);
    }
  }, [isResizing, isFullscreen, isSnapped]);

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

  return (
    <DraggableWrapper
      handle=".window-title-bar"
      position={position}
      onStart={handleDragStart}
      onDrag={handleDrag}
      onStop={handleDragStop}
      disabled={isSnapped}
      bounds={bounds}
      cancel=".window-controls *, .resize-handle"
      ref={draggableRef}
    >
      <div
        className={`draggable-window ${isFullscreen ? 'fullscreen' : ''} 
                  ${isDragging ? 'dragging' : ''} 
                  ${isActive ? 'active' : ''}
                  ${isSnapped ? 'snapped' : ''}`}
        style={{ 
          zIndex
        }}
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
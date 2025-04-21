import React, { useState, useRef, useEffect, useCallback } from 'react';
import './DraggableWindow.css';
import 'react-resizable/css/styles.css';
import { useWindowManager } from './WindowManager';
import DraggableWrapper from './DraggableWrapper';
import ResizableWrapper from './ResizableWrapper';

// Global z-index counter to manage window stacking
let globalZIndex = 1000;

const DraggableWindow = ({ children, title, icon, windowId }) => {
  const { closeWindow, minimizeWindow, activeWindowId, setActiveWindow } = useWindowManager();
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [size, setSize] = useState({ width: 900, height: 600 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [previousState, setPreviousState] = useState({ position: { x: 50, y: 50 }, size: { width: 900, height: 600 } });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [zIndex, setZIndex] = useState(globalZIndex++);
  
  const windowRef = useRef(null);
  const draggableRef = useRef(null);
  const resizableRef = useRef(null);
  
  // Check if this window is active
  const isActive = activeWindowId === windowId;
  
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

  // Handle window resize when the browser window resizes
  useEffect(() => {
    const handleResize = () => {
      if (isFullscreen) {
        setSize({
          width: window.innerWidth - 100,
          height: window.innerHeight - 100
        });
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isFullscreen]);

  // Toggle fullscreen mode
  const toggleFullscreen = useCallback(() => {
    if (!isFullscreen) {
      // Save current position and size before going fullscreen
      setPreviousState({
        position: { ...position },
        size: { ...size }
      });
      
      // Calculate dimensions for fullscreen - ensuring it stays visible
      const newWidth = Math.min(window.innerWidth - 20, 2000);
      const newHeight = Math.min(window.innerHeight - 20, 1200);
      
      // Set to fullscreen
      setPosition({ x: 10, y: 10 });
      setSize({
        width: newWidth,
        height: newHeight
      });
      setIsFullscreen(true);
    } else {
      // Restore previous position and size
      setPosition(previousState.position);
      setSize(previousState.size);
      setIsFullscreen(false);
    }
    
    // Always bring to front when toggling fullscreen
    bringToFront();
  }, [isFullscreen, position, size, previousState]);

  // Bring window to front
  const bringToFront = useCallback(() => {
    setZIndex(globalZIndex++);
    if (windowId && !isActive && setActiveWindow) {
      setActiveWindow(windowId);
    }
  }, [windowId, isActive, setActiveWindow]);

  // Handle window click to bring to front
  const handleWindowClick = useCallback((e) => {
    if (!isResizing && !isDragging) {
      bringToFront();
    }
  }, [bringToFront, isResizing, isDragging]);

  // Handle drag start
  const handleDragStart = useCallback((e, data) => {
    // Only set dragging state if not already resizing
    if (!isResizing) {
      setIsDragging(true);
      bringToFront();
    }
  }, [bringToFront, isResizing]);

  // Handle drag
  const handleDrag = useCallback((e, data) => {
    if (!isResizing && !isFullscreen) {
      // Update position continuously during drag for smooth movement
      setPosition({ x: data.x, y: data.y });
    }
  }, [isResizing, isFullscreen]);

  // Handle drag end
  const handleDragStop = useCallback((e, data) => {
    if (!isResizing && !isFullscreen) {
      setPosition({ x: data.x, y: data.y });
      // Small delay before unsetting drag state to prevent immediate click events
      setTimeout(() => setIsDragging(false), 0);
    }
  }, [isResizing, isFullscreen]);

  // Handle resize start
  const handleResizeStart = useCallback((e, data) => {
    setIsResizing(true);
    bringToFront();
  }, [bringToFront]);

  // Handle resize
  const handleResize = useCallback((e, data) => {
    if (!isFullscreen) {
      setSize({ 
        width: data.size.width, 
        height: data.size.height 
      });
    }
  }, [isFullscreen]);

  // Handle resize stop
  const handleResizeStop = useCallback((e, data) => {
    if (!isFullscreen) {
      setSize({ 
        width: data.size.width, 
        height: data.size.height 
      });
    }
    
    setTimeout(() => setIsResizing(false), 50);
  }, [isFullscreen]);

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
      disabled={isFullscreen}
      bounds="parent"
      cancel=".window-controls *, .resize-handle"
      ref={draggableRef}
    >
      <div
        className={`draggable-window ${isFullscreen ? 'fullscreen' : ''} 
                  ${isDragging ? 'dragging' : ''} 
                  ${isActive ? 'active' : ''}`}
        style={{ 
          zIndex,
          // Ensure these styles don't override the fullscreen class
          ...(isFullscreen ? {} : {})
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
          disabled={isFullscreen || isDragging}
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
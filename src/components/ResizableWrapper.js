import React, { forwardRef, useRef, useImperativeHandle } from 'react';
import { Resizable } from 'react-resizable';
import 'react-resizable/css/styles.css';

// This wrapper component solves the findDOMNode deprecation issue in React 19
// by using refs instead of directly accessing DOM nodes
const ResizableWrapper = forwardRef((props, ref) => {
  const nodeRef = useRef(null);
  const resizableRef = useRef(null);
  
  useImperativeHandle(ref, () => ({
    getDOMNode: () => nodeRef.current,
    getResizableNode: () => resizableRef.current
  }));

  // Extract props specifically used by Resizable
  const {
    width,
    height,
    onResize,
    onResizeStart,
    onResizeStop,
    minConstraints,
    maxConstraints,
    resizeHandles,
    disabled,
    style,
    children,
    className,
    ...restProps
  } = props;

  // Don't render resize handles if component is disabled
  const handles = disabled ? [] : (resizeHandles || ['se', 'sw', 'ne', 'nw', 'e', 'w', 's', 'n']);

  // Simple component to render as resize handle
  const renderHandle = (resizeHandle) => {
    // Determine cursor style based on resize handle
    let cursor;
    switch(resizeHandle) {
      case 'se': cursor = 'nwse-resize'; break;
      case 'sw': cursor = 'nesw-resize'; break;
      case 'ne': cursor = 'nesw-resize'; break;
      case 'nw': cursor = 'nwse-resize'; break;
      case 'e':
      case 'w': cursor = 'ew-resize'; break;
      case 'n':
      case 's': cursor = 'ns-resize'; break;
      default: cursor = 'pointer';
    }

    // Calculate dimensions and position for the handle
    let handleStyle = {
      position: 'absolute',
      zIndex: 10,
      cursor,
      // Use background color with opacity to make handles visible
      backgroundColor: 'rgba(97, 218, 251, 0.2)',
      // Set appropriate positioning
      top: resizeHandle.includes('n') ? 0 : 'auto',
      bottom: resizeHandle.includes('s') ? 0 : 'auto',
      left: resizeHandle.includes('w') ? 0 : 'auto',
      right: resizeHandle.includes('e') ? 0 : 'auto',
      // Prevent text selection
      userSelect: 'none',
      WebkitUserSelect: 'none',
      MozUserSelect: 'none',
      msUserSelect: 'none'
    };
    
    // Set appropriate size for each handle
    if (resizeHandle.includes('n') || resizeHandle.includes('s')) {
      // For top and bottom handles
      if (resizeHandle === 'n' || resizeHandle === 's') {
        handleStyle = {
          ...handleStyle,
          height: 8, 
          width: 'calc(100% - 16px)',
          left: 8,
          right: 8
        };
      } 
      // For corner handles (nw, ne, sw, se)
      else {
        handleStyle = {
          ...handleStyle,
          height: 12, 
          width: 12
        };
      }
    } else {
      // For side handles (e, w)
      handleStyle = {
        ...handleStyle,
        width: 8, 
        height: 'calc(100% - 16px)',
        top: 8,
        bottom: 8
      };
    }

    return (
      <div 
        className={`resize-handle resize-handle-${resizeHandle}`}
        style={handleStyle}
      />
    );
  };

  const handleResizeStart = (e, data) => {
    // Prevent events from bubbling to parent DraggableCore
    if (e && e.stopPropagation) {
      e.stopPropagation();
    }
    
    // Call the original onResizeStart if provided
    if (onResizeStart) {
      onResizeStart(e, data);
    }
  };

  // Use a stable ref object for the handle function to avoid re-renders causing ref issues
  const handleRef = useRef(renderHandle);
  
  // Create a direct ResizableBox instead of using Resizable with handle prop
  // This prevents the DraggableCore mount/unmount issues
  return (
    <div 
      ref={nodeRef}
      className={className}
      style={{
        position: 'relative',
        width: `${width}px`,
        height: `${height}px`,
        ...style
      }}
      {...restProps}
    >
      {children}
      
      {/* Render custom resize handles directly instead of using Resizable's handle prop */}
      {!disabled && handles.map(handle => {
        const handleElement = renderHandle(handle);
        
        // Attach the resize event handlers directly to our custom handles
        return (
          <div 
            key={`handle-${handle}`} 
            className={`custom-resize-handle handle-${handle}`}
            style={handleElement.props.style}
            onMouseDown={(e) => {
              // Prevent propagation to stop dragging events
              e.stopPropagation();
              
              // Get the exact offset from the edge of the handle where the user clicked
              // This ensures the resize follows the cursor exactly from the click point
              const handleRect = e.currentTarget.getBoundingClientRect();
              
              // Calculate offset from the appropriate edge based on handle type
              const offsetX = handle.includes('e') ? handleRect.right - e.clientX : 
                             handle.includes('w') ? e.clientX - handleRect.left : 0;
              
              const offsetY = handle.includes('n') ? e.clientY - handleRect.top : 
                             handle.includes('s') ? handleRect.bottom - e.clientY : 0;
              
              // Adjust start positions by the offset to align with the window edge
              const startXAdjusted = e.clientX - offsetX;
              const startYAdjusted = e.clientY - offsetY;
              
              // Store initial mouse position and element size
              const startWidth = width;
              const startHeight = height;
              
              // Get initial position from the parent element (DraggableWrapper)
              // Using getBoundingClientRect for accurate positioning
              const parentNode = nodeRef.current?.parentNode;
              const parentRect = parentNode?.getBoundingClientRect();
              const startLeft = parentRect ? parentRect.left : 0;  // Store initial absolute position
              const startTop = parentRect ? parentRect.top : 0;    // instead of parsing style values
              
              // Add class to body to prevent text selection
              document.body.classList.add('no-select');
              
              // Call resize start handler
              if (onResizeStart) {
                onResizeStart(e, { handle, node: nodeRef.current, size: { width, height } });
              }
              
              // Handle mouse move for resizing
              const handleMouseMove = (moveEvent) => {
                moveEvent.preventDefault();
                
                // Calculate delta movement relative to the adjusted start positions
                const deltaX = moveEvent.clientX - startXAdjusted;
                const deltaY = moveEvent.clientY - startYAdjusted;
                
                // Calculate new dimensions based on the handle type
                let newWidth = startWidth;
                let newHeight = startHeight;
                let newLeft = startLeft;
                let newTop = startTop;
                
                // Adjust dimensions and position based on handle position
                if (handle.includes('e')) {
                  newWidth = startWidth + deltaX;
                }
                if (handle.includes('w')) {
                  newWidth = startWidth - deltaX;
                  newLeft = startLeft + deltaX;
                }
                if (handle.includes('s')) {
                  newHeight = startHeight + deltaY;
                }
                if (handle.includes('n')) {
                  newHeight = startHeight - deltaY;
                  newTop = startTop + deltaY;
                }
                
                // Apply width constraint and adjust position accordingly
                if (minConstraints) {
                  if (handle.includes('w')) {
                    if (newWidth < minConstraints[0]) {
                      const constraintDelta = minConstraints[0] - newWidth;
                      newWidth = minConstraints[0];
                      newLeft -= constraintDelta;
                    }
                  } else {
                    newWidth = Math.max(newWidth, minConstraints[0]);
                  }
                  
                  if (handle.includes('n')) {
                    if (newHeight < minConstraints[1]) {
                      const constraintDelta = minConstraints[1] - newHeight;
                      newHeight = minConstraints[1];
                      newTop -= constraintDelta;
                    }
                  } else {
                    newHeight = Math.max(newHeight, minConstraints[1]);
                  }
                }
                
                if (maxConstraints) {
                  if (handle.includes('w')) {
                    if (newWidth > maxConstraints[0]) {
                      const constraintDelta = newWidth - maxConstraints[0];
                      newWidth = maxConstraints[0];
                      newLeft += constraintDelta;
                    }
                  } else {
                    newWidth = Math.min(newWidth, maxConstraints[0]);
                  }
                  
                  if (handle.includes('n')) {
                    if (newHeight > maxConstraints[1]) {
                      const constraintDelta = newHeight - maxConstraints[1];
                      newHeight = maxConstraints[1];
                      newTop += constraintDelta;
                    }
                  } else {
                    newHeight = Math.min(newHeight, maxConstraints[1]);
                  }
                }
                
                // Update position for parent (DraggableWrapper)
                if (parentNode) {
                  // Only update position if we're resizing from left or top edge
                  if (handle.includes('w') || handle.includes('n')) {
                    const currentTransform = parentNode.style.transform || '';
                    const translateRegex = /translate\((-?\d+\.?\d*)px, (-?\d+\.?\d*)px\)/;
                    const match = currentTransform.match(translateRegex);
                    
                    let currentTranslateX = 0;
                    let currentTranslateY = 0;
                    
                    if (match) {
                      currentTranslateX = parseFloat(match[1]) || 0;
                      currentTranslateY = parseFloat(match[2]) || 0;
                    }

                    if (handle.includes('w')) {
                      const translateX = newLeft - startLeft;
                      parentNode.style.transform = `translate(${translateX}px, ${currentTranslateY}px)`;
                    }
                    
                    if (handle.includes('n')) {
                      const translateY = newTop - startTop;
                      parentNode.style.transform = `translate(${currentTranslateX}px, ${translateY}px)`;
                    }
                  }
                }
                
                // Call resize handler
                if (onResize) {
                  onResize(moveEvent, { 
                    handle, 
                    node: nodeRef.current, 
                    size: { width: newWidth, height: newHeight },
                    position: { left: newLeft, top: newTop }
                  });
                }
              };
              
              // Handle mouse up to stop resizing
              const handleMouseUp = (upEvent) => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
                document.body.classList.remove('no-select');
                
                // Calculate final dimensions - similar logic to handleMouseMove
                const deltaX = upEvent.clientX - startXAdjusted;
                const deltaY = upEvent.clientY - startYAdjusted;
                
                let finalWidth = startWidth;
                let finalHeight = startHeight;
                let finalLeft = startLeft;
                let finalTop = startTop;
                
                // Adjust dimensions and position based on handle position
                if (handle.includes('e')) {
                  finalWidth = startWidth + deltaX;
                }
                if (handle.includes('w')) {
                  finalWidth = startWidth - deltaX;
                  finalLeft = startLeft + deltaX;
                }
                if (handle.includes('s')) {
                  finalHeight = startHeight + deltaY;
                }
                if (handle.includes('n')) {
                  finalHeight = startHeight - deltaY;
                  finalTop = startTop + deltaY;
                }
                
                // Apply constraints
                if (minConstraints) {
                  if (handle.includes('w')) {
                    if (finalWidth < minConstraints[0]) {
                      const constraintDelta = minConstraints[0] - finalWidth;
                      finalWidth = minConstraints[0];
                      finalLeft -= constraintDelta;
                    }
                  } else {
                    finalWidth = Math.max(finalWidth, minConstraints[0]);
                  }
                  
                  if (handle.includes('n')) {
                    if (finalHeight < minConstraints[1]) {
                      const constraintDelta = minConstraints[1] - finalHeight;
                      finalHeight = minConstraints[1];
                      finalTop -= constraintDelta;
                    }
                  } else {
                    finalHeight = Math.max(finalHeight, minConstraints[1]);
                  }
                }
                
                if (maxConstraints) {
                  if (handle.includes('w')) {
                    if (finalWidth > maxConstraints[0]) {
                      const constraintDelta = finalWidth - maxConstraints[0];
                      finalWidth = maxConstraints[0];
                      finalLeft += constraintDelta;
                    }
                  } else {
                    finalWidth = Math.min(finalWidth, maxConstraints[0]);
                  }
                  
                  if (handle.includes('n')) {
                    if (finalHeight > maxConstraints[1]) {
                      const constraintDelta = finalHeight - maxConstraints[1];
                      finalHeight = maxConstraints[1];
                      finalTop += constraintDelta;
                    }
                  } else {
                    finalHeight = Math.min(finalHeight, maxConstraints[1]);
                  }
                }
                
                // Call resize stop handler
                if (onResizeStop) {
                  onResizeStop(upEvent, { 
                    handle, 
                    node: nodeRef.current, 
                    size: { width: finalWidth, height: finalHeight },
                    position: { left: finalLeft, top: finalTop }
                  });
                }
              };
              
              // Add global event listeners for dragging
              document.addEventListener('mousemove', handleMouseMove);
              document.addEventListener('mouseup', handleMouseUp);
            }}
          />
        );
      })}
    </div>
  );
});

ResizableWrapper.displayName = 'ResizableWrapper';

export default ResizableWrapper;
import React, { forwardRef, useRef, useImperativeHandle } from 'react';
import Draggable from 'react-draggable';

// This wrapper component solves the findDOMNode deprecation issue in React 19
// by using refs instead of directly accessing DOM nodes
const DraggableWrapper = forwardRef((props, ref) => {
  const nodeRef = useRef(null);
  const draggableRef = useRef(null);

  useImperativeHandle(ref, () => ({
    getDOMNode: () => nodeRef.current,
    getDraggableNode: () => draggableRef.current
  }));

  const {
    onDrag,
    onStart,
    onStop,
    handle,
    cancel,
    allowAnyClick,
    disabled,
    grid,
    scale,
    bounds,
    position,
    defaultPosition,
    children,
    className,
    style,
    isFullscreen,
    ...rest
  } = props;

  // If dragging is disabled, just render the children directly
  if (disabled) {
    // When in fullscreen mode, fill the parent container
    const disabledStyle = isFullscreen
      ? {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        ...style
      }
      : {
        position: 'absolute',
        left: position?.x || defaultPosition?.x || 0,
        top: position?.y || defaultPosition?.y || 0,
        ...style
      };

    return (
      <div
        ref={nodeRef}
        className={className}
        style={disabledStyle}
        {...rest}
      >
        {children}
      </div>
    );
  }

  // Calculate style based on fullscreen state
  const draggableStyle = isFullscreen
    ? {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      ...style
    }
    : {
      position: 'absolute',
      ...style
    };

  return (
    <Draggable
      nodeRef={nodeRef}
      onDrag={onDrag}
      onStart={onStart}
      onStop={onStop}
      handle={handle || '.window-header'}
      cancel={cancel || '.resize-handle, .window-controls *'}
      allowAnyClick={allowAnyClick}
      grid={grid}
      scale={scale}
      bounds={isFullscreen ? undefined : bounds}
      position={isFullscreen ? { x: 0, y: 0 } : position}
      defaultPosition={defaultPosition}
      ref={draggableRef}
    >
      <div
        ref={nodeRef}
        className={className}
        style={draggableStyle}
        {...rest}
      >
        {children}
      </div>
    </Draggable>
  );
});

DraggableWrapper.displayName = 'DraggableWrapper';

export default DraggableWrapper;
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
    ...rest
  } = props;

  // If dragging is disabled, just render the children directly
  if (disabled) {
    return (
      <div
        ref={nodeRef}
        className={className}
        style={{
          position: 'absolute',
          left: position?.x || defaultPosition?.x || 0,
          top: position?.y || defaultPosition?.y || 0,
          ...style
        }}
        {...rest}
      >
        {children}
      </div>
    );
  }

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
      bounds={bounds}
      position={position}
      defaultPosition={defaultPosition}
      ref={draggableRef}
    >
      <div
        ref={nodeRef}
        className={className}
        style={{
          position: 'absolute',
          ...style
        }}
        {...rest}
      >
        {children}
      </div>
    </Draggable>
  );
});

DraggableWrapper.displayName = 'DraggableWrapper';

export default DraggableWrapper;
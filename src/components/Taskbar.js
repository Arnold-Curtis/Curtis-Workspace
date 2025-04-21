import React from 'react';
import { useWindowManager } from './WindowManager';
import './Taskbar.css';

const Taskbar = () => {
  const { 
    windows, 
    minimizedWindows, 
    activeWindowId, 
    restoreWindow, 
    setActiveWindow 
  } = useWindowManager();

  // Only render if there are windows to display
  if (windows.length === 0) {
    return null;
  }

  return (
    <div className="taskbar">
      {windows.map(window => (
        <div 
          key={window.id}
          className={`taskbar-item ${minimizedWindows.includes(window.id) ? 'minimized' : ''} ${activeWindowId === window.id ? 'active' : ''}`}
          onClick={() => {
            if (minimizedWindows.includes(window.id)) {
              restoreWindow(window.id);
            } else {
              setActiveWindow(window.id);
            }
          }}
          title={window.title}
        >
          {window.icon && <i className={`${window.icon} taskbar-icon`}></i>}
          <span className="taskbar-title">{window.title}</span>
        </div>
      ))}
    </div>
  );
};

export default Taskbar;
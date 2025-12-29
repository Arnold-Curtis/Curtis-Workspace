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
    restoreWindow,
    toggleShowDesktop,
    toggleStartMenu
  } = useWindowManager();

  // Handle taskbar item click - restore if minimized, otherwise bring to front
  const handleTaskbarItemClick = (windowId) => {
    if (minimizedWindows.includes(windowId)) {
      // Restore the minimized window
      restoreWindow(windowId);
    }
    // Always bring to front for z-index ordering
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
            src="/logo.png"
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
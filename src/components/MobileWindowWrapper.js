import React from 'react';
import './MobileWindowWrapper.css';

// This component replaces the regular WindowWrapper on mobile devices
// Instead of creating a draggable, resizable window, it simply renders
// the content fullscreen for better mobile experience
const MobileWindowWrapper = ({ children, title, icon }) => {
  return (
    <div className="mobile-window-wrapper">
      <div className="mobile-window-header">
        {icon && <i className={`${icon} mobile-window-icon`}></i>}
        <span className="mobile-window-title">{title || 'Window'}</span>
      </div>
      <div className="mobile-window-content">
        {children}
      </div>
    </div>
  );
};

export default MobileWindowWrapper;
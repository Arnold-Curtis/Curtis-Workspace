import React, { useState, useEffect } from 'react';
import { useWindowManager } from './WindowManager';
import './Sidebar.css';

// Window configurations for each page (Home is excluded - it's always the background)
const windowConfigs = {
  about: { id: 'about', title: 'About', icon: 'fas fa-user', component: 'about' },
  projects: { id: 'projects', title: 'Projects', icon: 'fas fa-folder-open', component: 'projects' },
  skills: { id: 'skills', title: 'Skills', icon: 'fas fa-code', component: 'skills' },
  resume: { id: 'resume', title: 'Resume', icon: 'fas fa-file-alt', component: 'resume' },
  contact: { id: 'contact', title: 'Contact', icon: 'fas fa-envelope', component: 'contact' },
  guestbook: { id: 'guestbook', title: 'Guestbook', icon: 'fas fa-comments', component: 'guestbook' },
};

function Sidebar() {
  const { openWindow, windows, activeWindowId, toggleShowDesktop, showDesktop } = useWindowManager();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if we're on a mobile device
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

  // Export the toggle function so it can be called from other components
  window.toggleMobileSidebar = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  // Handle sidebar item click
  const handleItemClick = (config) => {
    openWindow(config);
    setShowMobileMenu(false);
  };

  // Handle Home click - show desktop (minimize all) or restore
  const handleHomeClick = () => {
    toggleShowDesktop();
    setShowMobileMenu(false);
  };

  // Check if a window is currently open
  const isWindowOpen = (id) => windows.some(w => w.id === id);
  const isWindowActive = (id) => activeWindowId === id;

  // Check if all windows are minimized (showing desktop)
  const isShowingDesktop = showDesktop || windows.length === 0;

  return (
    <>
      {/* Mobile backdrop */}
      {isMobile && (
        <div
          className={`mobile-backdrop ${showMobileMenu ? 'show' : ''}`}
          onClick={() => setShowMobileMenu(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`Sidebar ${showMobileMenu ? 'show-mobile-menu' : ''}`}>
        <div className="sidebar-header">
          <span className="sidebar-title">EXPLORER</span>
        </div>
        <div className="sidebar-section">
          <div className="section-header">
            <i className="fas fa-chevron-down section-icon"></i>
            <span className="section-title">PORTFOLIO</span>
          </div>
          <ul className="sidebar-list">
            <li className={`sidebar-item ${isShowingDesktop ? 'active' : ''}`}>
              <button className="sidebar-link" onClick={handleHomeClick}>
                <i className="fas fa-file-code file-icon"></i> Home.js
              </button>
            </li>
            <li className={`sidebar-item ${isWindowActive('about') ? 'active' : ''} ${isWindowOpen('about') ? 'open' : ''}`}>
              <button className="sidebar-link" onClick={() => handleItemClick(windowConfigs.about)}>
                <i className="fas fa-file-code file-icon"></i> About.js
              </button>
            </li>
            <li className={`sidebar-item ${isWindowActive('projects') ? 'active' : ''} ${isWindowOpen('projects') ? 'open' : ''}`}>
              <button className="sidebar-link" onClick={() => handleItemClick(windowConfigs.projects)}>
                <i className="fas fa-file-code file-icon"></i> Projects.js
              </button>
            </li>
            <li className={`sidebar-item ${isWindowActive('skills') ? 'active' : ''} ${isWindowOpen('skills') ? 'open' : ''}`}>
              <button className="sidebar-link" onClick={() => handleItemClick(windowConfigs.skills)}>
                <i className="fas fa-file-code file-icon"></i> Skills.js
              </button>
            </li>
            <li className={`sidebar-item ${isWindowActive('resume') ? 'active' : ''} ${isWindowOpen('resume') ? 'open' : ''}`}>
              <button className="sidebar-link" onClick={() => handleItemClick(windowConfigs.resume)}>
                <i className="fas fa-file-code file-icon"></i> Resume.js
              </button>
            </li>
            <li className={`sidebar-item ${isWindowActive('contact') ? 'active' : ''} ${isWindowOpen('contact') ? 'open' : ''}`}>
              <button className="sidebar-link" onClick={() => handleItemClick(windowConfigs.contact)}>
                <i className="fas fa-file-code file-icon"></i> Contact.js
              </button>
            </li>
            <li className={`sidebar-item ${isWindowActive('guestbook') ? 'active' : ''} ${isWindowOpen('guestbook') ? 'open' : ''}`}>
              <button className="sidebar-link" onClick={() => handleItemClick(windowConfigs.guestbook)}>
                <i className="fas fa-comments file-icon"></i> Guestbook.js
              </button>
            </li>
          </ul>
        </div>
        <div className="sidebar-section">
          <div className="section-header">
            <i className="fas fa-chevron-right section-icon"></i>
            <span className="section-title">DEPENDENCIES</span>
          </div>
        </div>
        <div className="sidebar-section">
          <div className="section-header">
            <i className="fas fa-chevron-right section-icon"></i>
            <span className="section-title">NODE_MODULES</span>
          </div>
        </div>
      </div>
    </>
  );
}

export default Sidebar;
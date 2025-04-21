import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css';

function Sidebar() {
  const location = useLocation();
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
  
  // Close mobile menu when route changes
  useEffect(() => {
    setShowMobileMenu(false);
  }, [location]);
  
  // Export the toggle function so it can be called from other components
  window.toggleMobileSidebar = () => {
    setShowMobileMenu(!showMobileMenu);
  };
  
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
            <li className={`sidebar-item ${location.pathname === '/' ? 'active' : ''}`}>
              <Link to="/" className="sidebar-link">
                <i className="fas fa-file-code file-icon"></i> Home.js
              </Link>
            </li>
            <li className={`sidebar-item ${location.pathname === '/about' ? 'active' : ''}`}>
              <Link to="/about" className="sidebar-link">
                <i className="fas fa-file-code file-icon"></i> About.js
              </Link>
            </li>
            <li className={`sidebar-item ${location.pathname === '/projects' ? 'active' : ''}`}>
              <Link to="/projects" className="sidebar-link">
                <i className="fas fa-file-code file-icon"></i> Projects.js
              </Link>
            </li>
            <li className={`sidebar-item ${location.pathname === '/skills' ? 'active' : ''}`}>
              <Link to="/skills" className="sidebar-link">
                <i className="fas fa-file-code file-icon"></i> Skills.js
              </Link>
            </li>
            <li className={`sidebar-item ${location.pathname === '/resume' ? 'active' : ''}`}>
              <Link to="/resume" className="sidebar-link">
                <i className="fas fa-file-code file-icon"></i> Resume.js
              </Link>
            </li>
            <li className={`sidebar-item ${location.pathname === '/contact' ? 'active' : ''}`}>
              <Link to="/contact" className="sidebar-link">
                <i className="fas fa-file-code file-icon"></i> Contact.js
              </Link>
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
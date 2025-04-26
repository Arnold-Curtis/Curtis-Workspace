import React, { useState, useEffect } from 'react';
import './TopBar.css';
import { Link } from 'react-router-dom'; // Import Link from react-router-dom

function TopBar() {
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  
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
  
  // Toggle the sidebar menu on mobile
  const toggleSidebar = () => {
    if (window.toggleMobileSidebar) {
      window.toggleMobileSidebar();
    }
  };

  // Toggle mobile nav menu
  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };
  
  return (
    <div className="TopBar">
      {isMobile && (
        <button className="mobile-menu-toggle" onClick={toggleSidebar}>
          <i className="fas fa-bars"></i>
        </button>
      )}
      
      <img src="/VisualStudioCode.png" alt="Logo" className="logo" />
      
      {isMobile ? (
        <>
          <div className="curtisworkspace">
            <p className="curtis">Curtis' Workspace</p>
          </div>
          <button className="mobile-nav-toggle" onClick={toggleMobileMenu}>
            <i className={`fas ${showMobileMenu ? 'fa-times' : 'fa-ellipsis-h'}`}></i>
          </button>
          
          <div className={`mobile-nav-menu ${showMobileMenu ? 'show' : ''}`}>
            <Link to="/" className="menu-link">
              <i className="fas fa-home menu-icon"></i> Home
            </Link>
            <Link to="/about" className="menu-link">
              <i className="fas fa-user menu-icon"></i> About Me
            </Link>
            <Link to="/projects" className="menu-link">
              <i className="fas fa-code-branch menu-icon"></i> Projects
            </Link>
            <Link to="/skills" className="menu-link">
              <i className="fas fa-chart-bar menu-icon"></i> Skills
            </Link>
            <Link to="/resume" className="menu-link">
              <i className="fas fa-file-alt menu-icon"></i> Resume
            </Link>
            <Link to="/contact" className="menu-link">
              <i className="fas fa-envelope menu-icon"></i> Contact
            </Link>
            <Link to="/book-call" className="book-call-btn mobile">Book a Call</Link>
          </div>
        </>
      ) : (
        <>
          <div className="menu">
            <Link to="/" className="menu-link">
              <i className="fas fa-home menu-icon"></i> Home
            </Link>
            <Link to="/about" className="menu-link">
              <i className="fas fa-user menu-icon"></i> About Me
            </Link>
            <Link to="/projects" className="menu-link">
              <i className="fas fa-code-branch menu-icon"></i> Projects
            </Link>
            <Link to="/skills" className="menu-link">
              <i className="fas fa-chart-bar menu-icon"></i> Skills
            </Link>
            <Link to="/resume" className="menu-link">
              <i className="fas fa-file-alt menu-icon"></i> Resume
            </Link>
            <Link to="/contact" className="menu-link">
              <i className="fas fa-envelope menu-icon"></i> Contact
            </Link>
          </div>
          
          <div className="curtisworkspace">
            <p className="curtis">Curtis' Workspace</p>
          </div>
          
          <div className="actions">
            <button className="action-button">
              <i className="fas fa-arrow-left action-icon"></i>
            </button>
            <button className="action-button">
              <i className="fas fa-arrow-right action-icon"></i>
            </button>
            <input type="text" placeholder="Search..." className="search-bar" />
            <Link to="/book-call" className="book-call-btn">Book a Call</Link>
            <button className="window-button">_</button>
            <button className="window-button">□</button>
            <button className="window-button">×</button>
          </div>
        </>
      )}
    </div>
  );
}

export default TopBar;
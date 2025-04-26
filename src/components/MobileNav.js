import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './MobileNav.css';

const MobileNav = () => {
  const location = useLocation();
  
  // Define navigation items with icons and labels
  const navItems = [
    { path: '/', label: 'Home', icon: 'fas fa-home' },
    { path: '/about', label: 'About', icon: 'fas fa-user' },
    { path: '/projects', label: 'Projects', icon: 'fas fa-code-branch' },
    { path: '/skills', label: 'Skills', icon: 'fas fa-tools' },
    { path: '/contact', label: 'Contact', icon: 'fas fa-envelope' }
  ];
  
  return (
    <nav className="mobile-nav">
      {navItems.map((item) => (
        <Link 
          key={item.path}
          to={item.path} 
          className={`mobile-nav-item ${location.pathname === item.path ? 'active' : ''}`}
        >
          <i className={item.icon}></i>
          <span className="mobile-nav-label">{item.label}</span>
          {location.pathname === item.path && <div className="mobile-nav-highlight"></div>}
        </Link>
      ))}
    </nav>
  );
};

export default MobileNav;
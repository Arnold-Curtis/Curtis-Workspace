import React, { useEffect, useRef } from 'react';
import { useWindowManager } from './WindowManager';
import './StartMenu.css';

const StartMenu = () => {
    const { startMenuOpen, closeStartMenu, openWindow, windows, activeWindowId } = useWindowManager();
    const menuRef = useRef(null);

    // Page definitions with icons and component keys (Home excluded - it's always background)
    const pages = [
        { id: 'about', title: 'About', icon: 'fas fa-user', color: '#81c784', component: 'about' },
        { id: 'projects', title: 'Projects', icon: 'fas fa-folder-open', color: '#ffb74d', component: 'projects' },
        { id: 'skills', title: 'Skills', icon: 'fas fa-code', color: '#ba68c8', component: 'skills' },
        { id: 'resume', title: 'Resume', icon: 'fas fa-file-alt', color: '#4db6ac', component: 'resume' },
        { id: 'contact', title: 'Contact', icon: 'fas fa-envelope', color: '#f06292', component: 'contact' },
        { id: 'guestbook', title: 'Guestbook', icon: 'fas fa-comments', color: '#aed581', component: 'guestbook' },
        { id: 'book-call', title: 'Book a Call', icon: 'fas fa-phone-alt', color: '#64b5f6', component: 'book-call' },
    ];

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                // Check if click was on start button
                if (!event.target.closest('.start-button')) {
                    closeStartMenu();
                }
            }
        };

        if (startMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [startMenuOpen, closeStartMenu]);

    // Close menu on escape key
    useEffect(() => {
        const handleEscape = (event) => {
            if (event.key === 'Escape' && startMenuOpen) {
                closeStartMenu();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [startMenuOpen, closeStartMenu]);

    // Handle page click - now uses openWindow
    const handlePageClick = (page) => {
        openWindow({
            id: page.id,
            title: page.title,
            icon: page.icon,
            component: page.component
        });
        // closeStartMenu is called inside openWindow
    };

    // Check if a window is currently active
    const isWindowActive = (id) => activeWindowId === id;
    const isWindowOpen = (id) => windows.some(w => w.id === id);

    if (!startMenuOpen) return null;

    return (
        <div className="start-menu-overlay">
            <div className="start-menu" ref={menuRef}>
                {/* Header */}
                <div className="start-menu-header">
                    <span className="start-menu-title">Curtis Workspace</span>
                </div>

                {/* Search bar (decorative) */}
                <div className="start-menu-search">
                    <i className="fas fa-search search-icon"></i>
                    <input
                        type="text"
                        placeholder="Type here to search"
                        className="search-input"
                        disabled
                    />
                </div>

                {/* Pinned apps section */}
                <div className="start-menu-section">
                    <div className="section-header">
                        <span>Pinned</span>
                    </div>
                    <div className="apps-grid">
                        {pages.map(page => (
                            <button
                                key={page.id}
                                className={`app-item ${isWindowActive(page.id) ? 'active' : ''} ${isWindowOpen(page.id) ? 'open' : ''}`}
                                onClick={() => handlePageClick(page)}
                            >
                                <div
                                    className="app-icon-wrapper"
                                    style={{ backgroundColor: `${page.color}20` }}
                                >
                                    <i
                                        className={`${page.icon} app-icon`}
                                        style={{ color: page.color }}
                                    ></i>
                                </div>
                                <span className="app-title">{page.title}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="start-menu-footer">
                    <div className="user-profile">
                        <div className="user-avatar">
                            <i className="fas fa-user"></i>
                        </div>
                        <span className="user-name">Curtis</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StartMenu;

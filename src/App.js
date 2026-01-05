import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import TopBar from './components/TopBar';
import Sidebar from './components/Sidebar';
import MobileNav from './components/MobileNav';
import { WindowManagerProvider, useWindowManager } from './components/WindowManager';
import WindowRenderer from './components/WindowRenderer';
import Taskbar from './components/Taskbar';
import StartMenu from './components/StartMenu';
import SnapPreviewOverlay from './components/SnapPreviewOverlay';
import MobileOrientationOverlay from './components/MobileOrientationOverlay';
import AiOrb from './components/AiOrb';
import Home from './pages/Home';
import About from './pages/About';
import Projects from './pages/Projects';
import { Skills } from './pages/Skills';
import Resume from './pages/Resume';
import Contact from './pages/Contact';
import Guestbook from './pages/Guestbook';
import AdminMessages from './pages/AdminMessages';
import BookCall from './pages/BookCall';
import withHighlighting from './hoc/withHighlighting';
import { initPostHog, trackPageView } from './utils/posthogService';
import './App.css';

// Apply the highlighting HOC to all page components
const HighlightedHome = withHighlighting(Home);
const HighlightedAbout = withHighlighting(About);
const HighlightedProjects = withHighlighting(Projects);
// Skills already has highlighting functionality
const HighlightedResume = withHighlighting(Resume);
const HighlightedContact = withHighlighting(Contact);
const HighlightedGuestbook = withHighlighting(Guestbook);
const HighlightedBookCall = withHighlighting(BookCall);
const HighlightedAdminMessages = withHighlighting(AdminMessages);

// Desktop home - ALWAYS renders the Home component as the background (like Windows desktop)
const DesktopBackground = () => {
  return (
    <div className="desktop-background">
      <HighlightedHome />
    </div>
  );
};

// WindowWrapper is no longer needed - using WindowRenderer for desktop and Routes for mobile

// The main application with routes
function AppWithRoutes() {
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();
  const { openWindow } = useWindowManager();

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

  // Initialize PostHog analytics
  useEffect(() => {
    initPostHog();
  }, []);

  // Track page views on route changes
  useEffect(() => {
    trackPageView(location.pathname);
  }, [location.pathname]);

  // Check for admin URL parameter or path to open admin panel on desktop
  useEffect(() => {
    if (isMobile) return; // Skip on mobile - mobile uses routes

    const params = new URLSearchParams(location.search);
    const isAdminPath = location.pathname === '/admin10@10';
    const hasAdminParam = params.get('admin') === 'true';

    if (isAdminPath || hasAdminParam) {
      // Open admin window on desktop
      openWindow({
        id: 'admin',
        title: 'Admin Panel',
        icon: 'fas fa-lock',
        component: 'admin'
      });
    }
  }, [location, isMobile, openWindow]);

  return (
    <div className="App">
      <MobileOrientationOverlay />
      <TopBar />
      <AiOrb />
      <div className="main-content">
        {/* Removed SidebarIcons component */}
        {!isMobile && <Sidebar />}
        <div className="content">
          {/* Snap preview overlay for window snapping */}
          {!isMobile && <SnapPreviewOverlay />}

          {/* Desktop background - Home component renders as background, always visible */}
          {!isMobile && <DesktopBackground />}

          {/* WindowRenderer renders all open windows from state - enables multi-window stacking */}
          {!isMobile && <WindowRenderer />}

          {/* Routes now only for URL state - mobile will still use routes directly */}
          {isMobile && (
            <Routes>
              <Route path="/" element={<HighlightedHome />} />
              <Route path="/about" element={<HighlightedAbout />} />
              <Route path="/projects" element={<HighlightedProjects />} />
              <Route path="/skills" element={<Skills />} />
              <Route path="/resume" element={<HighlightedResume />} />
              <Route path="/contact" element={<HighlightedContact />} />
              <Route path="/guestbook" element={<HighlightedGuestbook />} />
              <Route path="/book-call" element={<HighlightedBookCall />} />
              <Route path="/admin10@10" element={<HighlightedAdminMessages />} />
            </Routes>
          )}
        </div>
      </div>

      {/* Always render taskbar on desktop (even with no windows) */}
      {!isMobile && <Taskbar />}

      {/* Start Menu */}
      {!isMobile && <StartMenu />}

      {/* Render mobile nav on mobile devices */}
      {isMobile && <MobileNav />}
    </div>
  );
}

// Root component wrapped with providers
function App() {
  return (
    <Router>
      <WindowManagerProvider>
        <AppWithRoutes />
      </WindowManagerProvider>
    </Router>
  );
}

export default App;
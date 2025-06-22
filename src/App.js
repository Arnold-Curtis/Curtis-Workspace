import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import TopBar from './components/TopBar';
import Sidebar from './components/Sidebar';
// Removed SidebarIcons import
import DraggableWindow from './components/DraggableWindow';
import MobileWindowWrapper from './components/MobileWindowWrapper';
import MobileNav from './components/MobileNav';
import { WindowManagerProvider, useWindowManager } from './components/WindowManager';
import Taskbar from './components/Taskbar';
import MobileOrientationOverlay from './components/MobileOrientationOverlay';
import AiOrb from './components/AiOrb';
import Home from './pages/Home';
import About from './pages/About';
import Projects from './pages/Projects';
import { Skills } from './pages/Skills';
import Resume from './pages/Resume';
import Contact from './pages/Contact';
import AdminMessages from './pages/AdminMessages';
import BookCall from './pages/BookCall';
import withHighlighting from './hoc/withHighlighting';
import './App.css';

// Apply the highlighting HOC to all page components
const HighlightedHome = withHighlighting(Home);
const HighlightedAbout = withHighlighting(About);
const HighlightedProjects = withHighlighting(Projects);
// Skills already has highlighting functionality
const HighlightedResume = withHighlighting(Resume);
const HighlightedContact = withHighlighting(Contact);
const HighlightedBookCall = withHighlighting(BookCall);
const HighlightedAdminMessages = withHighlighting(AdminMessages);

// Wrapper component for pages that should use DraggableWindow
const WindowWrapper = ({ children, title, icon, windowId }) => {
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
  
  // For mobile devices, use a different wrapper
  if (isMobile) {
    return (
      <div className="mobile-full-wrapper">
        <MobileWindowWrapper title={title} icon={icon}>
          {children}
        </MobileWindowWrapper>
      </div>
    );
  }
  
  // For desktop, use the regular draggable window
  return (
    <div className="window-wrapper">
      <DraggableWindow title={title} icon={icon} windowId={windowId}>
        {children}
      </DraggableWindow>
    </div>
  );
};

// Removed ContentWrapper as it's no longer used

// The main application with routes
function AppWithRoutes() {
  // Use the window manager to access window state
  const { windows } = useWindowManager();
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
  
  return (
    <div className="App">
      <MobileOrientationOverlay />
      <TopBar />
      <AiOrb />
      <div className="main-content">
        {/* Removed SidebarIcons component */}
        {!isMobile && <Sidebar />}
        <div className="content">
          <Routes>
            <Route path="/" element={<HighlightedHome />} />
            <Route 
              path="/about" 
              element={
                <WindowWrapper title="About.js" icon="fas fa-file-code" windowId="about">
                  <HighlightedAbout />
                </WindowWrapper>
              } 
            />
            <Route 
              path="/projects" 
              element={
                <WindowWrapper title="Projects.js" icon="fas fa-file-code" windowId="projects">
                  <HighlightedProjects />
                </WindowWrapper>
              } 
            />
            <Route 
              path="/skills" 
              element={
                <WindowWrapper title="Skills.js" icon="fas fa-file-code" windowId="skills">
                  <Skills />
                </WindowWrapper>
              } 
            />
            <Route 
              path="/resume" 
              element={
                <WindowWrapper title="Resume.js" icon="fas fa-file-alt" windowId="resume">
                  <HighlightedResume />
                </WindowWrapper>
              } 
            />
            <Route 
              path="/contact" 
              element={
                <WindowWrapper title="Contact.js" icon="fas fa-file-code" windowId="contact">
                  <HighlightedContact />
                </WindowWrapper>
              } 
            />
            <Route 
              path="/book-call" 
              element={
                <WindowWrapper title="BookCall.js" icon="fas fa-phone-alt" windowId="book-call">
                  <HighlightedBookCall />
                </WindowWrapper>
              } 
            />
            {/* Hidden admin route with custom URL */}
            <Route path="/admin10@10" element={<HighlightedAdminMessages />} />
          </Routes>
        </div>
      </div>
      
      {/* Only render taskbar if there are windows open and not on mobile */}
      {windows && windows.length > 0 && !isMobile && <Taskbar />}
      
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
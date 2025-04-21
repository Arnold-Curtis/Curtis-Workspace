import React from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import TopBar from './components/TopBar';
import Sidebar from './components/Sidebar';
import SidebarIcons from './components/SidebarIcons';
import DraggableWindow from './components/DraggableWindow';
import { WindowManagerProvider, useWindowManager } from './components/WindowManager';
import Taskbar from './components/Taskbar';
import MobileOrientationOverlay from './components/MobileOrientationOverlay';
import Home from './pages/Home';
import About from './pages/About';
import Projects from './pages/Projects';
import { Skills } from './pages/Skills';
import Resume from './pages/Resume';
import Contact from './pages/Contact';
import './App.css';

// Wrapper component for pages that should use DraggableWindow
const WindowWrapper = ({ children, title, icon, windowId }) => {
  return (
    <div className="window-wrapper">
      <DraggableWindow title={title} icon={icon} windowId={windowId}>
        {children}
      </DraggableWindow>
    </div>
  );
};

// Regular wrapper component for other pages
const ContentWrapper = ({ children }) => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const contentClass = isHomePage ? 'home-content' : 'centered-content';

  return (
    <div className={`content-container ${contentClass}`}>
      {children}
    </div>
  );
};

// The main application with routes
function AppWithRoutes() {
  // Use the window manager to access window state
  const { windows } = useWindowManager();
  
  return (
    <div className="App">
      <MobileOrientationOverlay />
      <TopBar />
      <div className="main-content">
        <SidebarIcons />
        <Sidebar />
        <div className="content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route 
              path="/about" 
              element={
                <WindowWrapper title="About.js" icon="fas fa-file-code" windowId="about">
                  <About />
                </WindowWrapper>
              } 
            />
            <Route 
              path="/projects" 
              element={
                <WindowWrapper title="Projects.js" icon="fas fa-file-code" windowId="projects">
                  <Projects />
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
            <Route path="/resume" element={<ContentWrapper><Resume /></ContentWrapper>} />
            <Route 
              path="/contact" 
              element={
                <WindowWrapper title="Contact.js" icon="fas fa-file-code" windowId="contact">
                  <Contact />
                </WindowWrapper>
              } 
            />
          </Routes>
        </div>
      </div>
      
      {/* Only render taskbar if there are windows open */}
      {windows && windows.length > 0 && <Taskbar />}
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
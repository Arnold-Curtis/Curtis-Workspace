import React, { useState, useEffect } from 'react';
import './MobileOrientationOverlay.css';

const MobileOrientationOverlay = () => {
  const [showOverlay, setShowOverlay] = useState(false);
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  const [orientation, setOrientation] = useState('landscape');
  const [dismissed, setDismissed] = useState(false);
  
  // Check if device is mobile and determine orientation
  useEffect(() => {
    const checkMobileAndOrientation = () => {
      // Check if device is mobile (based on screen size and user agent)
      const isMobile = 
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
        window.innerWidth <= 768;
      
      setIsMobileDevice(isMobile);
      
      // Determine orientation
      const isPortrait = window.innerHeight > window.innerWidth;
      setOrientation(isPortrait ? 'portrait' : 'landscape');
      
      // Only show overlay if it's a mobile device in portrait mode and not dismissed
      setShowOverlay(isMobile && isPortrait && !dismissed);
      
      // Add orientation-specific class to body
      document.body.classList.remove('portrait-mode', 'landscape-mode', 'mobile-device');
      if (isMobile) {
        document.body.classList.add('mobile-device');
        document.body.classList.add(isPortrait ? 'portrait-mode' : 'landscape-mode');
      }
    };
    
    // Run initial check
    checkMobileAndOrientation();
    
    // Add event listeners
    window.addEventListener('resize', checkMobileAndOrientation);
    window.addEventListener('orientationchange', checkMobileAndOrientation);
    
    return () => {
      window.removeEventListener('resize', checkMobileAndOrientation);
      window.removeEventListener('orientationchange', checkMobileAndOrientation);
    };
  }, [dismissed]);
  
  // Dismiss overlay
  const dismissOverlay = () => {
    setDismissed(true);
    setShowOverlay(false);
  };
  
  if (!showOverlay) return null;
  
  return (
    <div className="orientation-overlay">
      <div className="overlay-content">
        <h2>Please Rotate Your Device</h2>
        <p>For the best experience, use landscape orientation</p>
        <div className="phone-animation-container">
          <div className="phone-animation">
            <div className="phone">
              <div className="phone-screen"></div>
            </div>
          </div>
        </div>
        <button className="dismiss-button" onClick={dismissOverlay}>
          <i className="fas fa-times"></i> Continue in Portrait Mode
        </button>
      </div>
    </div>
  );
};

export default MobileOrientationOverlay;
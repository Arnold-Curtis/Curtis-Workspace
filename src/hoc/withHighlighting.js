import React, { useEffect } from 'react';
import { 
  checkForHighlightRequest, 
  highlightElement, 
  injectHighlightStyles, 
  setupHighlightEventListener 
} from '../utils/highlightService';

/**
 * Higher-order component that adds highlighting functionality to pages
 * This allows any page to respond to highlight requests from AI links
 * 
 * @param {React.ComponentType} WrappedComponent - The component to wrap with highlighting functionality
 * @returns {React.ComponentType} - The enhanced component with highlighting capability
 */
const withHighlighting = (WrappedComponent) => {
  // Return a new component with highlighting functionality
  const WithHighlighting = (props) => {
    useEffect(() => {
      console.log('withHighlighting: Component mounted, checking for highlight requests');
      
      // Inject highlight styles
      injectHighlightStyles();
      
      // Set up event listener for highlight requests
      setupHighlightEventListener();
      
      // Check if there's a highlight request
      const highlightLine = checkForHighlightRequest();
      console.log('withHighlighting: Highlight request found:', highlightLine);
      
      if (highlightLine) {
        // Wait for the page to fully render before attempting to highlight
        const initialTimer = setTimeout(() => {
          console.log('withHighlighting: Attempting to highlight element');
          const success = highlightElement(highlightLine);
          
          // If first attempt fails, try again with increasing delays
          if (!success) {
            console.log('withHighlighting: First highlight attempt failed, trying again');
            const retryTimers = [500, 1000, 2000]; // Multiple retry times
            
            retryTimers.forEach((delay, index) => {
              const retryTimer = setTimeout(() => {
                console.log(`withHighlighting: Retry attempt ${index + 1}`);
                const retrySuccess = highlightElement(highlightLine);
                if (retrySuccess) {
                  console.log(`withHighlighting: Successfully highlighted on retry ${index + 1}`);
                }
              }, delay);
              
              // Clean up timers on unmount
              return () => clearTimeout(retryTimer);
            });
          }
        }, 800); // Increased initial delay for better reliability
        
        return () => clearTimeout(initialTimer);
      }
    }, []);
    
    // Render the original component with all props
    return <WrappedComponent {...props} />;
  };
  
  // Set display name for debugging
  WithHighlighting.displayName = `WithHighlighting(${getDisplayName(WrappedComponent)})`;
  
  return WithHighlighting;
};

// Helper function to get component display name
function getDisplayName(WrappedComponent) {
  return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}

export default withHighlighting; 
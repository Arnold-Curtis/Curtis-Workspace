/**
 * Utility functions for highlighting content referenced by AI links
 */

// Check if there's a highlight request in session storage
export const checkForHighlightRequest = () => {
  const highlightLine = sessionStorage.getItem('highlightLine');
  console.log('checkForHighlightRequest: Checking for highlight request:', highlightLine);
  
  if (highlightLine) {
    // Clear the session storage to prevent highlighting on subsequent page loads
    sessionStorage.removeItem('highlightLine');
    return highlightLine;
  }
  return null;
};

// Highlight a specific element or line range
export const highlightElement = (lineNumber) => {
  console.log(`Attempting to highlight: ${lineNumber}`);
  
  // Handle range format (e.g., "16-30")
  let startLine, endLine;
  
  // Check if this is a section reference (e.g., "section:about")
  if (lineNumber.includes('section:')) {
    const sectionId = lineNumber.replace('section:', '');
    console.log(`Looking for section: ${sectionId}`);
    
    // Find section by ID, class, or data attribute with multiple selectors
    const selectors = [
      `#${sectionId}`,
      `.${sectionId}`,
      `[data-section="${sectionId}"]`,
      `[data-id="${sectionId}"]`,
      `[id*="${sectionId}"]`,
      `[class*="${sectionId}"]`,
      `h1:contains("${sectionId}")`,
      `h2:contains("${sectionId}")`,
      `h3:contains("${sectionId}")`
    ];
    
    // Try each selector
    let section = null;
    for (const selector of selectors) {
      try {
        const elements = document.querySelectorAll(selector);
        if (elements && elements.length > 0) {
          section = elements[0];
          break;
        }
      } catch (error) {
        console.warn(`Error with selector ${selector}:`, error);
      }
    }
    
    // If still not found, try a more flexible approach with textContent
    if (!section) {
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6, .section-title');
      for (const heading of headings) {
        if (heading.textContent.toLowerCase().includes(sectionId.toLowerCase())) {
          section = heading.closest('section') || heading.parentElement || heading;
          break;
        }
      }
    }
    
    if (section) {
      console.log(`Found section element:`, section);
      applyHighlightEffect([section]);
      return true;
    }
    console.warn(`Section not found: ${sectionId}`);
    return false;
  }
  
  // Handle line number or range
  if (lineNumber.includes('-')) {
    const [start, end] = lineNumber.split('-');
    startLine = parseInt(start, 10);
    endLine = parseInt(end, 10);
    console.log(`Looking for line range: ${startLine}-${endLine}`);
  } else {
    startLine = parseInt(lineNumber, 10);
    endLine = startLine;
    console.log(`Looking for line: ${startLine}`);
  }
  
  // Check for invalid line numbers
  if (isNaN(startLine) || startLine <= 0) {
    console.error(`Invalid line number: ${lineNumber}`);
    return false;
  }
  
  // Find elements with matching data-line attributes
  const elements = document.querySelectorAll(`[data-line]`);
  console.log(`Found ${elements.length} elements with data-line attributes`);
  
  let foundElements = [];
  
  elements.forEach(element => {
    const elementLine = element.getAttribute('data-line');
    
    // Check if element has a specific line number
    if (elementLine && !elementLine.includes('-')) {
      const line = parseInt(elementLine, 10);
      if (line >= startLine && line <= endLine) {
        console.log(`Found matching element for line ${line}:`, element);
        foundElements.push(element);
      }
    } 
    // Check if element has a line range
    else if (elementLine && elementLine.includes('-')) {
      const [elemStart, elemEnd] = elementLine.split('-').map(num => parseInt(num, 10));
      
      // Check if ranges overlap
      if (
        (elemStart <= startLine && elemEnd >= startLine) || // Element range contains start line
        (elemStart <= endLine && elemEnd >= endLine) || // Element range contains end line
        (startLine <= elemStart && endLine >= elemEnd) // Highlight range contains element range
      ) {
        console.log(`Found matching element for range ${elemStart}-${elemEnd}:`, element);
        foundElements.push(element);
      }
    }
  });
  
  // If no elements found with data-line, try finding by line number in the content
  if (foundElements.length === 0) {
    console.log('No elements found with matching data-line, trying fallback method');
    
    // Try to find elements with IDs that might correspond to line numbers
    const elementsWithIds = document.querySelectorAll('[id]');
    for (const element of elementsWithIds) {
      const id = element.id;
      if (/^line-\d+$/.test(id)) {
        const lineNum = parseInt(id.replace('line-', ''), 10);
        if (lineNum >= startLine && lineNum <= endLine) {
          foundElements.push(element);
        }
      }
    }
    
    // If still no elements found, look for elements that might correspond to the line numbers
    if (foundElements.length === 0) {
      // Look for elements that might correspond to the line numbers
      // This is a fallback for content that doesn't have explicit data-line attributes
      const contentSections = document.querySelectorAll(
        '.section-content, .skill-bar, .project-item, .terminal-result, .content-section, ' +
        'p, li, .code-block, .skill-item, .project-card, .experience-item'
      );
      console.log(`Found ${contentSections.length} content sections to check`);
      
      contentSections.forEach((section, index) => {
        // Use index + 1 as an approximate line number
        if (index + 1 >= startLine && index + 1 <= endLine) {
          console.log(`Found matching section by index ${index + 1}:`, section);
          foundElements.push(section);
        }
      });
      
      // If still no elements found, try to find any relevant content
      if (foundElements.length === 0) {
        console.log('Still no elements found, trying to find any content sections');
        // Just highlight the first few content sections as a last resort
        const allContentSections = document.querySelectorAll(
          '.content-section, .section-content, p, h1, h2, h3, .skill-item, .project-card'
        );
        if (allContentSections.length > 0) {
          // Take the first element as a fallback
          console.log('Using first content section as fallback');
          foundElements.push(allContentSections[0]);
        }
      }
    }
  }
  
  // Apply highlight effect to found elements
  if (foundElements.length > 0) {
    console.log(`Applying highlight to ${foundElements.length} elements`);
    applyHighlightEffect(foundElements);
    return true;
  }
  
  console.warn('No elements found to highlight');
  return false;
};

// Apply highlight effect to elements
const applyHighlightEffect = (elements) => {
  elements.forEach(element => {
    // First scroll to the element with a smooth animation
    try {
      // Use scrollIntoView with a smooth behavior
      element.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center',
        inline: 'nearest'
      });
      
      // Small delay before applying the highlight to ensure scrolling is complete
      setTimeout(() => {
        // Add highlight class
        element.classList.add('ai-highlight');
        
        // Remove highlight after animation completes
        setTimeout(() => {
          element.classList.remove('ai-highlight');
          // Add a persistent subtle highlight
          element.classList.add('ai-highlight-persistent');
          
          // Remove persistent highlight after some time
          setTimeout(() => {
            // Fade out the highlight
            element.style.transition = 'all 1s ease';
            element.classList.add('ai-highlight-fade');
            
            setTimeout(() => {
              element.classList.remove('ai-highlight-persistent');
              element.classList.remove('ai-highlight-fade');
            }, 1000);
          }, 5000); // Persistent highlight lasts 5 seconds
        }, 3000); // Initial highlight lasts 3 seconds
      }, 500);
    } catch (error) {
      console.error('Error scrolling to element:', error);
      // Fallback method if smooth scrolling fails
      const rect = element.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const elementTop = rect.top + scrollTop;
      window.scrollTo({
        top: elementTop - (window.innerHeight / 2),
        behavior: 'smooth'
      });
      
      // Apply highlight after fallback scrolling
      setTimeout(() => {
        element.classList.add('ai-highlight');
        
        setTimeout(() => {
          element.classList.remove('ai-highlight');
          element.classList.add('ai-highlight-persistent');
          
          setTimeout(() => {
            element.style.transition = 'all 1s ease';
            element.classList.add('ai-highlight-fade');
            
            setTimeout(() => {
              element.classList.remove('ai-highlight-persistent');
              element.classList.remove('ai-highlight-fade');
            }, 1000);
          }, 5000);
        }, 3000);
      }, 500);
    }
  });
};

// Add CSS for highlighting
export const injectHighlightStyles = () => {
  if (!document.getElementById('highlight-styles')) {
    const styleElement = document.createElement('style');
    styleElement.id = 'highlight-styles';
    styleElement.textContent = `
      .ai-highlight {
        animation: pulse-highlight 3s ease;
        box-shadow: 0 0 0 2px rgba(114, 137, 218, 0.8);
        position: relative;
        z-index: 100;
        background-color: rgba(114, 137, 218, 0.15);
      }
      
      .ai-highlight-persistent {
        box-shadow: 0 0 0 2px rgba(114, 137, 218, 0.3);
        background-color: rgba(114, 137, 218, 0.05);
        transition: all 0.3s ease;
      }
      
      .ai-highlight-fade {
        box-shadow: 0 0 0 0 rgba(114, 137, 218, 0);
        background-color: rgba(114, 137, 218, 0);
      }
      
      @keyframes pulse-highlight {
        0% {
          box-shadow: 0 0 0 0 rgba(114, 137, 218, 0.8);
          background-color: rgba(114, 137, 218, 0.1);
        }
        30% {
          box-shadow: 0 0 0 10px rgba(114, 137, 218, 0.3);
          background-color: rgba(114, 137, 218, 0.25);
        }
        70% {
          box-shadow: 0 0 0 8px rgba(114, 137, 218, 0.2);
          background-color: rgba(114, 137, 218, 0.2);
        }
        100% {
          box-shadow: 0 0 0 0 rgba(114, 137, 218, 0);
          background-color: rgba(114, 137, 218, 0.05);
        }
      }
    `;
    document.head.appendChild(styleElement);
  }
};

// Set up event listener for highlight requests
export const setupHighlightEventListener = () => {
  document.addEventListener('ai-highlight-request', (event) => {
    const { lineNumber } = event.detail;
    if (lineNumber) {
      highlightElement(lineNumber);
    }
  });
};
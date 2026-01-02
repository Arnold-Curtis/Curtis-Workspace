/**
 * Enhanced Highlight Service - Uses semantic section IDs for reliable element targeting
 * Replaces the old line-number-based highlighting system
 */

import { getSelectorsForSection, findSectionById, getPageForSection } from './contentRegistry';

/**
 * Check if there's a highlight request in session storage
 * Now supports both section IDs and legacy line numbers
 * NOTE: Does NOT remove the item - removal happens after successful highlight
 */
export const checkForHighlightRequest = () => {
  // Check for new section-based highlight
  const highlightSection = sessionStorage.getItem('highlightSection');
  if (highlightSection) {
    // DON'T remove here - let highlightSection() remove after success
    console.log('checkForHighlightRequest: Found section highlight request:', highlightSection);
    return { type: 'section', value: highlightSection };
  }

  // Check for legacy line-based highlight (backward compatibility)
  const highlightLine = sessionStorage.getItem('highlightLine');
  if (highlightLine) {
    // DON'T remove here - let highlightElement() remove after success
    console.log('checkForHighlightRequest: Found legacy line highlight request:', highlightLine);
    return { type: 'line', value: highlightLine };
  }

  return null;
};

/**
 * Highlight a section by its semantic ID
 * @param {string} sectionId - e.g., "about.bio", "skills.languages"
 * @returns {boolean} true if element was found and highlighted
 */
export const highlightSection = (sectionId) => {
  console.log(`[HighlightService] Attempting to highlight section: ${sectionId}`);

  // Get all selectors for this section in priority order
  const selectors = getSelectorsForSection(sectionId);
  console.log(`[HighlightService] Trying selectors:`, selectors);

  // Try to find main content area first (to avoid accidentally selecting chat elements)
  const mainContentSelectors = [
    '.content',
    '.main-content',
    '.about-page-container',
    '.skills-page-container',
    '.projects-page-container',
    '.resume-page-container',
    '.contact-page-container',
    '.page-container',
    'main',
    '[class*="-page"]'
  ];

  let mainContent = null;
  for (const mainSel of mainContentSelectors) {
    mainContent = document.querySelector(mainSel);
    if (mainContent) break;
  }

  // Try each selector until we find an element
  for (const selector of selectors) {
    try {
      // SAFETY: Add exclusion for chat elements to prevent highlighting links in chat
      const safeSelector = `${selector}:not(.ai-ref):not(.ai-link):not([class*="ai-chat"]):not([class*="ai-message"])`;

      // First try within main content area
      let element = mainContent?.querySelector(safeSelector);

      // Fallback to document-wide search with safety exclusions
      if (!element) {
        element = document.querySelector(safeSelector);
      }

      if (element) {
        console.log(`[HighlightService] Found element with selector "${selector}":`, element.tagName, element.className);
        applyHighlightEffect([element]);
        // Clear the pending request after successful highlight
        sessionStorage.removeItem('highlightSection');
        return true;
      }
    } catch (error) {
      console.warn(`[HighlightService] Error with selector "${selector}":`, error);
    }
  }

  // Special fallback for projects: Try data-project attribute
  // e.g., sectionId "projects.audioglass" -> try data-project="audioglass"
  if (sectionId.startsWith('projects.')) {
    const projectKey = sectionId.replace('projects.', '');
    const projectSelectors = [
      `[data-project="${projectKey}"]`,
      `[data-section="${sectionId}"]`,
      `.project-item[data-project="${projectKey}"]`
    ];

    for (const projSel of projectSelectors) {
      const element = document.querySelector(projSel);
      if (element) {
        console.log(`[HighlightService] Found project element with selector "${projSel}"`);
        applyHighlightEffect([element]);
        return true;
      }
    }
  }

  // Fallback: Try content-based matching (only in main content area)
  console.log('[HighlightService] No element found with selectors, trying content-based fallback');
  const section = findSectionById(sectionId);
  if (section && section.title) {
    const element = findElementByContent(section.title, mainContent);
    if (element) {
      console.log('[HighlightService] Found element by content matching:', element.tagName);
      applyHighlightEffect([element]);
      return true;
    }
  }

  console.warn(`[HighlightService] Could not find element for section: ${sectionId}`);
  return false;
};

/**
 * Highlight an element using legacy line number (backward compatibility)
 * @param {string} lineNumber - Line number or range (e.g., "16", "16-30", "section:bio")
 * @returns {boolean}
 */
export const highlightElement = (lineNumber) => {
  console.log(`highlightElement: Attempting to highlight: ${lineNumber}`);

  // Check if this is a section reference (e.g., "section:about.bio" or "section:bio")
  if (lineNumber.includes('section:')) {
    const sectionId = lineNumber.replace('section:', '');
    // If it's already a full section ID
    if (sectionId.includes('.')) {
      return highlightSection(sectionId);
    }
    // Otherwise try to find it as a partial match
    return highlightSectionByPartialId(sectionId);
  }

  // Handle line number or range - try to find elements with data-line
  let startLine, endLine;

  if (lineNumber.includes('-')) {
    const [start, end] = lineNumber.split('-');
    startLine = parseInt(start, 10);
    endLine = parseInt(end, 10);
  } else {
    startLine = parseInt(lineNumber, 10);
    endLine = startLine;
  }

  if (isNaN(startLine) || startLine <= 0) {
    console.error(`highlightElement: Invalid line number: ${lineNumber}`);
    return false;
  }

  // Try to find elements with data-line attributes
  const elements = document.querySelectorAll(`[data-line]`);
  let foundElements = [];

  elements.forEach(element => {
    const elementLine = element.getAttribute('data-line');

    if (elementLine && !elementLine.includes('-')) {
      const line = parseInt(elementLine, 10);
      if (line >= startLine && line <= endLine) {
        foundElements.push(element);
      }
    } else if (elementLine && elementLine.includes('-')) {
      const [elemStart, elemEnd] = elementLine.split('-').map(num => parseInt(num, 10));
      if (
        (elemStart <= startLine && elemEnd >= startLine) ||
        (elemStart <= endLine && elemEnd >= endLine) ||
        (startLine <= elemStart && endLine >= elemEnd)
      ) {
        foundElements.push(element);
      }
    }
  });

  if (foundElements.length > 0) {
    console.log(`highlightElement: Found ${foundElements.length} elements with matching data-line`);
    applyHighlightEffect(foundElements);
    return true;
  }

  // Fallback: Try to find any content sections
  console.log('highlightElement: No data-line elements found, trying fallback selectors');
  const fallbackSelectors = [
    '.section-content',
    '.content-section',
    '.skill-bar',
    '.project-item',
    '.experience-item',
    'section',
    '.card'
  ];

  for (const selector of fallbackSelectors) {
    const elements = document.querySelectorAll(selector);
    if (elements.length > 0) {
      // Highlight the first matching element
      console.log(`highlightElement: Using fallback - highlighting first ${selector}`);
      applyHighlightEffect([elements[0]]);
      return true;
    }
  }

  console.warn('highlightElement: No elements found to highlight');
  return false;
};

/**
 * Find section by partial ID (e.g., "bio" matches "about.bio")
 */
const highlightSectionByPartialId = (partialId) => {
  console.log(`[HighlightService] Looking for partial ID: ${partialId}`);

  // Safety exclusion suffix to prevent matching chat elements
  const excludeChat = ':not(.ai-ref):not(.ai-link):not([class*="ai-chat"]):not([class*="ai-message"])';

  // Try as-is first
  const selectors = [
    `[data-section*="${partialId}"]${excludeChat}`,
    `#${partialId}${excludeChat}`,
    `.${partialId}${excludeChat}`,
    `#${partialId}-section${excludeChat}`,
    `.${partialId}-section${excludeChat}`,
    `[id*="${partialId}"]${excludeChat}`,
    `[class*="${partialId}"]${excludeChat}`
  ];

  for (const selector of selectors) {
    try {
      const element = document.querySelector(selector);
      if (element) {
        // Double-check: skip if inside AI chat
        if (element.closest('.ai-chat-window, .ai-chat-content, .ai-message')) continue;

        console.log(`[HighlightService] Found element with selector for partial ID "${partialId}"`);
        applyHighlightEffect([element]);
        return true;
      }
    } catch (error) {
      // Ignore invalid selectors
    }
  }

  // Try heading-based matching
  const element = findElementByContent(partialId);
  if (element) {
    applyHighlightEffect([element]);
    return true;
  }

  return false;
};

/**
 * Find element by matching content (heading text, title, etc.)
 * @param {string} searchText - Text to search for
 * @param {Element|null} container - Optional container to search within
 */
const findElementByContent = (searchText, container = null) => {
  if (!searchText) return null;

  const searchLower = searchText.toLowerCase();
  const searchRoot = container || document;

  // Look for headings that match (exclude chat elements)
  const headings = searchRoot.querySelectorAll('h1:not(.ai-ref), h2:not(.ai-ref), h3:not(.ai-ref), h4:not(.ai-ref), h5:not(.ai-ref), h6:not(.ai-ref), .section-title:not(.ai-ref), .card-title:not(.ai-ref)');
  for (const heading of headings) {
    // Skip if inside AI chat
    if (heading.closest('.ai-chat-window, .ai-chat-content, .ai-message')) continue;

    if (heading.textContent.toLowerCase().includes(searchLower)) {
      // Return the parent section if available
      const section = heading.closest('section') ||
        heading.closest('.section') ||
        heading.closest('.section-container') ||
        heading.closest('.card') ||
        heading.parentElement;
      return section || heading;
    }
  }

  return null;
};

/**
 * Apply highlight effect to elements with smooth scrolling and animation
 */
const applyHighlightEffect = (elements) => {
  if (!elements || elements.length === 0) return;

  // Inject styles if not already done
  injectHighlightStyles();

  elements.forEach((element, index) => {
    // Small delay between multiple elements for visual effect
    const delay = index * 100;

    setTimeout(() => {
      try {
        // Scroll to element smoothly
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'nearest'
        });

        // Wait for scroll to complete, then apply highlight
        setTimeout(() => {
          // Add the highlight class
          element.classList.add('ai-highlight');

          // Remove initial highlight after animation, add persistent subtle highlight
          setTimeout(() => {
            element.classList.remove('ai-highlight');
            element.classList.add('ai-highlight-persistent');

            // Fade out persistent highlight after a few seconds
            setTimeout(() => {
              element.classList.add('ai-highlight-fade');

              setTimeout(() => {
                element.classList.remove('ai-highlight-persistent');
                element.classList.remove('ai-highlight-fade');
              }, 1000);
            }, 5000);
          }, 3000);
        }, 500);
      } catch (error) {
        console.error('applyHighlightEffect: Error applying highlight:', error);
      }
    }, delay);
  });
};

/**
 * Inject CSS styles for highlighting
 */
export const injectHighlightStyles = () => {
  if (document.getElementById('ai-highlight-styles')) return;

  const styleElement = document.createElement('style');
  styleElement.id = 'ai-highlight-styles';
  styleElement.textContent = `
    /* Main pulsing highlight animation */
    .ai-highlight {
      animation: ai-pulse-highlight 3s ease;
      box-shadow: 0 0 0 3px rgba(97, 218, 251, 0.8), 0 0 20px rgba(97, 218, 251, 0.4);
      position: relative;
      z-index: 100;
      background-color: rgba(97, 218, 251, 0.15);
      border-radius: 8px;
      transition: all 0.3s ease;
    }

    /* Persistent subtle highlight after main animation */
    .ai-highlight-persistent {
      box-shadow: 0 0 0 2px rgba(97, 218, 251, 0.4), 0 0 10px rgba(97, 218, 251, 0.2);
      background-color: rgba(97, 218, 251, 0.08);
      border-radius: 8px;
      transition: all 0.5s ease;
    }

    /* Fade out animation */
    .ai-highlight-fade {
      box-shadow: 0 0 0 0 rgba(97, 218, 251, 0);
      background-color: rgba(97, 218, 251, 0);
      transition: all 1s ease;
    }

    /* Pulsing animation keyframes */
    @keyframes ai-pulse-highlight {
      0% {
        box-shadow: 0 0 0 0 rgba(97, 218, 251, 0.8), 0 0 0 rgba(97, 218, 251, 0.4);
        background-color: rgba(97, 218, 251, 0.1);
      }
      15% {
        box-shadow: 0 0 0 8px rgba(97, 218, 251, 0.6), 0 0 30px rgba(97, 218, 251, 0.5);
        background-color: rgba(97, 218, 251, 0.25);
      }
      30% {
        box-shadow: 0 0 0 4px rgba(97, 218, 251, 0.4), 0 0 20px rgba(97, 218, 251, 0.3);
        background-color: rgba(97, 218, 251, 0.2);
      }
      50% {
        box-shadow: 0 0 0 6px rgba(97, 218, 251, 0.5), 0 0 25px rgba(97, 218, 251, 0.4);
        background-color: rgba(97, 218, 251, 0.22);
      }
      70% {
        box-shadow: 0 0 0 4px rgba(97, 218, 251, 0.3), 0 0 15px rgba(97, 218, 251, 0.2);
        background-color: rgba(97, 218, 251, 0.15);
      }
      100% {
        box-shadow: 0 0 0 2px rgba(97, 218, 251, 0.2), 0 0 10px rgba(97, 218, 251, 0.1);
        background-color: rgba(97, 218, 251, 0.08);
      }
    }

    /* Ensure highlighted elements are visible above other content */
    .ai-highlight,
    .ai-highlight-persistent {
      isolation: isolate;
    }
  `;
  document.head.appendChild(styleElement);
};

/**
 * Set up event listener for highlight requests from AI components
 */
export const setupHighlightEventListener = () => {
  // Listen for new section-based highlight requests
  document.addEventListener('ai-section-highlight', (event) => {
    const { sectionId } = event.detail;
    if (sectionId) {
      highlightSection(sectionId);
    }
  });

  // Listen for legacy line-based highlight requests (backward compatibility)
  document.addEventListener('ai-highlight-request', (event) => {
    const { lineNumber, sectionId } = event.detail;

    if (sectionId) {
      highlightSection(sectionId);
    } else if (lineNumber) {
      highlightElement(lineNumber);
    }
  });
};

/**
 * Trigger a highlight for a section from anywhere in the app
 */
export const triggerSectionHighlight = (sectionId) => {
  const event = new CustomEvent('ai-section-highlight', {
    detail: { sectionId }
  });
  document.dispatchEvent(event);
};

/**
 * Store a highlight request for after navigation
 * @param {string} sectionId - The section ID to highlight
 */
export const storeHighlightRequest = (sectionId) => {
  sessionStorage.setItem('highlightSection', sectionId);
};

/**
 * Process any pending highlight requests (call after page load)
 * Now with improved timing for mobile devices
 */
export const processPendingHighlight = () => {
  const request = checkForHighlightRequest();

  if (!request) return false;

  console.log('[HighlightService] Processing pending highlight:', request);

  // Initial attempt with delay for DOM render
  const attemptHighlight = (attempt = 1) => {
    setTimeout(() => {
      let success = false;

      if (request.type === 'section') {
        success = highlightSection(request.value);
      } else if (request.type === 'line') {
        success = highlightElement(request.value);
      }

      // Retry once if first attempt fails (mobile may need more time)
      if (!success && attempt < 3) {
        console.log(`[HighlightService] Highlight attempt ${attempt} failed, retrying...`);
        attemptHighlight(attempt + 1);
      }
    }, attempt === 1 ? 600 : 400); // First attempt 600ms, retries 400ms apart
  };

  attemptHighlight();
  return true;
};
/**
 * PostHog Analytics Service
 * Handles PostHog SDK initialization and event tracking for React frontend
 */

// PostHog API configuration
const POSTHOG_KEY = process.env.REACT_APP_POSTHOG_KEY || '';
const POSTHOG_HOST = process.env.REACT_APP_POSTHOG_HOST || 'https://us.i.posthog.com';

// Check if PostHog is available (dynamically loaded)
let posthogInstance = null;

/**
 * Initialize PostHog SDK
 * Should be called once when the app loads
 */
export const initPostHog = async () => {
    if (!POSTHOG_KEY) {
        console.warn('PostHog: API key not configured (REACT_APP_POSTHOG_KEY)');
        return false;
    }

    try {
        // Dynamically import posthog-js to avoid build errors if not installed
        const posthog = await import('posthog-js');
        posthogInstance = posthog.default;

        posthogInstance.init(POSTHOG_KEY, {
            api_host: POSTHOG_HOST,

            // Auto-capture settings
            autocapture: true,
            capture_pageview: false, // We'll manually track with React Router
            capture_pageleave: true,

            // Session recording with privacy masking
            session_recording: {
                maskAllInputs: true,
                maskTextSelector: '[data-ph-mask]',
                maskInputOptions: {
                    password: true,
                    email: false, // Allow email for identification
                }
            },

            // Performance settings
            loaded: (ph) => {
                // Log successful initialization in dev
                if (process.env.NODE_ENV === 'development') {
                    console.log('PostHog initialized:', ph.get_distinct_id());
                }
            },

            // Disable in development if needed
            // disable_session_recording: process.env.NODE_ENV === 'development',
        });

        return true;
    } catch (error) {
        console.warn('PostHog SDK not installed. Run: npm install posthog-js');
        return false;
    }
};

/**
 * Get the current distinct ID
 * Essential for identity handover to PHP backend
 */
export const getDistinctId = () => {
    if (!posthogInstance) {
        // Generate a fallback ID for when PostHog isn't loaded
        const storedId = sessionStorage.getItem('ph_fallback_id');
        if (storedId) return storedId;

        const fallbackId = 'anon_' + Math.random().toString(36).substring(2, 15);
        sessionStorage.setItem('ph_fallback_id', fallbackId);
        return fallbackId;
    }

    return posthogInstance.get_distinct_id();
};

/**
 * Track a page view
 * Call this on route changes
 */
export const trackPageView = (path, title) => {
    if (!posthogInstance) return;

    posthogInstance.capture('$pageview', {
        $current_url: window.location.href,
        $pathname: path || window.location.pathname,
        $title: title || document.title
    });
};

/**
 * Track a custom event
 * @param {string} eventName - Name of the event
 * @param {object} properties - Event properties
 */
export const trackEvent = (eventName, properties = {}) => {
    if (!posthogInstance) {
        console.log(`PostHog (disabled): ${eventName}`, properties);
        return;
    }

    posthogInstance.capture(eventName, properties);
};

/**
 * Identify a user (set user properties)
 * Call this when user provides their info (e.g., contact form)
 */
export const identifyUser = (userId, properties = {}) => {
    if (!posthogInstance) return;

    posthogInstance.identify(userId, properties);
};

/**
 * Set user properties without changing identity
 */
export const setUserProperties = (properties) => {
    if (!posthogInstance) return;

    posthogInstance.people.set(properties);
};

/**
 * Reset the user (for logout scenarios)
 */
export const resetUser = () => {
    if (!posthogInstance) return;

    posthogInstance.reset();
};

/**
 * Check if PostHog is enabled and initialized
 */
export const isPostHogEnabled = () => {
    return posthogInstance !== null && POSTHOG_KEY !== '';
};

/**
 * Get PostHog instance for advanced usage
 */
export const getPostHog = () => posthogInstance;

// Export as default object for convenience
const posthogService = {
    initPostHog,
    getDistinctId,
    trackPageView,
    trackEvent,
    identifyUser,
    setUserProperties,
    resetUser,
    isPostHogEnabled,
    getPostHog
};

export default posthogService;

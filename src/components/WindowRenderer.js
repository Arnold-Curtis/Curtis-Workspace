import React from 'react';
import { useWindowManager } from './WindowManager';
import DraggableWindow from './DraggableWindow';

// Page component imports
import Home from '../pages/Home';
import About from '../pages/About';
import Projects from '../pages/Projects';
import { Skills } from '../pages/Skills';
import Resume from '../pages/Resume';
import Contact from '../pages/Contact';
import Guestbook from '../pages/Guestbook';
import BookCall from '../pages/BookCall';
import AdminMessages from '../pages/AdminMessages';
import withHighlighting from '../hoc/withHighlighting';

// Apply highlighting HOC to components
const HighlightedAbout = withHighlighting(About);
const HighlightedProjects = withHighlighting(Projects);
const HighlightedResume = withHighlighting(Resume);
const HighlightedContact = withHighlighting(Contact);
const HighlightedGuestbook = withHighlighting(Guestbook);
const HighlightedBookCall = withHighlighting(BookCall);
const HighlightedAdminMessages = withHighlighting(AdminMessages);

// Component registry - maps component keys to actual components
const componentRegistry = {
    'home': Home,
    'about': HighlightedAbout,
    'projects': HighlightedProjects,
    'skills': Skills,
    'resume': HighlightedResume,
    'contact': HighlightedContact,
    'guestbook': HighlightedGuestbook,
    'book-call': HighlightedBookCall,
    'admin': HighlightedAdminMessages,
};

/**
 * WindowRenderer renders all open windows from the WindowManager state.
 * This enables true multi-window stacking where multiple windows can be
 * visible simultaneously and stack on top of each other.
 */
const WindowRenderer = () => {
    const { windows, minimizedWindows } = useWindowManager();

    // Get the component for a window
    const getComponent = (componentKey) => {
        const Component = componentRegistry[componentKey];
        if (!Component) {
            console.warn(`No component found for key: ${componentKey}`);
            return null;
        }
        return <Component />;
    };

    return (
        <>
            {windows.map(win => {
                // Skip if window doesn't have a component (shouldn't happen)
                if (!win.component) return null;

                return (
                    <DraggableWindow
                        key={win.id}
                        windowId={win.id}
                        title={win.title}
                        icon={win.icon}
                    >
                        {getComponent(win.component)}
                    </DraggableWindow>
                );
            })}
        </>
    );
};

export default WindowRenderer;

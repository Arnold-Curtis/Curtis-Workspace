import React, { useState, useEffect } from 'react';
import '../stylings/Projects.css';
import { motion } from 'framer-motion';
import { processPendingHighlight, highlightSection, injectHighlightStyles } from '../utils/highlightService';

const Projects = () => {
  // Project data - Updated with comprehensive descriptions from GitHub summary
  const projectsData = [
    {
      id: 1,
      key: 'aipa',
      title: "AI Personal Assistant (AIPA)",
      description:
        "AIPA is a full-stack AI-powered personal assistant that combines a modern React 19 frontend with a robust Spring Boot 3.4 backend. Integrated with Google's Gemini 2.0 Flash API, it provides intelligent, context-aware responses, automatic calendar event detection from natural language, persistent memory capabilities, and dynamic plan generation. The system features sophisticated input routing that determines whether user input requires planning, calendar events, or simple responses.",
      technologies: [
        "React 19",
        "Spring Boot 3.4",
        "Java",
        "SQLite",
        "Google Gemini 2.0 Flash",
        "Spring Security",
        "JWT Authentication",
        "REST APIs",
        "FullCalendar"
      ],
      image: "https://via.placeholder.com/600x350/252526/61dafb?text=AI+Personal+Assistant",
      github: "https://github.com/Arnold-Curtis/AI-Personal-Assistant",
      demo: null,
      features: [
        "Gemini 2.0 Flash integration for fast, high-quality AI responses",
        "Multi-tier prompt system with sophisticated AI behavior templates",
        "Natural language event detection — phrases like 'meeting tomorrow at 3pm' auto-create calendar events",
        "Persistent memory system that stores and retrieves user preferences and facts",
        "Dynamic plan generation that breaks complex goals into time-bound action steps",
        "JWT-based authentication with refresh capability and role-based access",
        "Customizable themes (10 color schemes) with font size and animation controls",
        "FullCalendar integration with day, week, and list views",
        "Session memory tracking for contextual awareness within conversations",
        "Profile management with photo upload and password updates"
      ]
    },
    {
      id: 2,
      key: 'nlrs',
      title: "Natural Language Review System (NLRS)",
      description:
        "NLRS is a JavaFX desktop application designed for educational institutions to manage lecturer feedback. Students submit open-ended reviews which are automatically analyzed using Stanford CoreNLP for sentiment analysis (1-9 scale). Lecturers view aggregated sentiment scores, and administrators manage users and generate performance reports. The system replaces rigid survey forms with intelligent natural language processing.",
      technologies: [
        "Java",
        "JavaFX 17",
        "FXML",
        "Stanford CoreNLP 4.5.6",
        "MySQL 8.0",
        "JDBC",
        "FormsFX",
        "Maven"
      ],
      image: "https://via.placeholder.com/600x350/252526/61dafb?text=NLP+Review+System",
      github: "https://github.com/Arnold-Curtis/NaturalLanguageReviewSystem",
      demo: null,
      features: [
        "Stanford CoreNLP pipeline for sentiment analysis (tokenize → parse → sentiment)",
        "Sentiment scoring from 1 (Very Negative) to 9 (Very Positive)",
        "Role-based dashboards for students, lecturers, and administrators",
        "Anonymous review submission protecting student privacy",
        "Unit/course-based filtering for targeted feedback analysis",
        "Comprehensive performance reports with aggregated sentiment data",
        "Authentication system preventing fake reviews",
        "Lecturer profiles with contact management and password updates",
        "User management console for admin onboarding and account control"
      ]
    },
    {
      id: 3,
      key: 'audioglass',
      title: "AudioGlass — Transparency Mode",
      description:
        "AudioGlass is a Windows desktop application providing real-time audio passthrough from microphone to headphones, emulating the 'transparency mode' found in premium ANC headphones like AirPods Pro. Designed for ultra-low latency (sub-15ms), the application runs its audio hot path in native C code to bypass .NET garbage collection pauses, achieving performance impossible with managed code alone.",
      technologies: [
        "C# .NET",
        "Windows Forms",
        "Miniaudio (C library)",
        "Custom C++ Wrapper",
        "WASAPI",
        "P/Invoke",
        "NAudio",
        "PowerShell"
      ],
      image: "https://via.placeholder.com/600x350/252526/61dafb?text=AudioGlass+Transparency",
      github: "https://github.com/Arnold-Curtis/AudioGlass",
      demo: null,
      features: [
        "Sub-15ms latency achieved via native (unmanaged) audio processing",
        "GC-immune audio loop bypasses .NET garbage collection pauses",
        "System tray application with minimal footprint and quick toggle",
        "Configurable buffer sizes (128-frame ~2.6ms or 256-frame ~5.3ms)",
        "Input/output device selection with hot-swap and auto-reconnection",
        "Adjustable passthrough volume (0-100%)",
        "Persistent settings saved across restarts",
        "Callback marshaling with GCHandle to prevent delegate collection",
        "SynchronizationContext for thread-safe UI updates from native code"
      ]
    },
    {
      id: 4,
      key: 'workspace',
      title: "Curtis-Workspace — Interactive Portfolio",
      description:
        "This portfolio website reimagined as a fully interactive Windows 11-style desktop environment. Instead of traditional scrolling, visitors experience a multi-window operating system simulation with draggable windows, a centered taskbar, snap zones, and an AI-powered assistant orb integrated with Google Gemini. The design creates a memorable first impression while demonstrating advanced frontend skills.",
      technologies: [
        "React 19",
        "React Router 6",
        "Framer Motion",
        "Google Generative AI (Gemini)",
        "react-draggable",
        "react-resizable",
        "CSS3 Variables",
        "Netlify Functions",
        "PHP Backend"
      ],
      image: "https://via.placeholder.com/600x350/252526/61dafb?text=Interactive+Portfolio",
      github: "https://github.com/Arnold-Curtis/Curtis-Workspace",
      demo: null,
      features: [
        "Multi-window architecture with independent, stacking windows",
        "Draggable windows with momentum, bounds checking, and resize handles",
        "Windows 11-style centered taskbar with open window indicators",
        "Snap zones for half-screen, quarter-screen, and fullscreen layouts",
        "Elastic animations matching Windows 11 behavior",
        "AI Assistant Orb with Google Gemini integration and portfolio context",
        "Split-view mode — AI chat snaps beside referenced content",
        "Glassmorphism design with dark theme and custom cursor effects",
        "Responsive design with mobile-specific navigation and touch optimization"
      ]
    }
  ];

  const [selectedProject, setSelectedProject] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [expandedCard, setExpandedCard] = useState(null);

  // Handle window resize for mobile detection
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const openProject = (project) => {
    setSelectedProject(project);
  };

  const closeProject = () => {
    setSelectedProject(null);
  };

  // Toggle mobile card expansion
  const toggleCard = (projectKey) => {
    setExpandedCard(expandedCard === projectKey ? null : projectKey);
  };

  const redirectToGitHub = () => {
    window.open('https://github.com/Arnold-Curtis', '_blank');
  };

  // Check for highlight requests when component mounts
  // For mobile: Also expand the target card
  useEffect(() => {
    injectHighlightStyles();

    // Check sessionStorage for pending highlight
    const highlightSection = sessionStorage.getItem('highlightSection');

    if (highlightSection && highlightSection.startsWith('projects.')) {
      const projectKey = highlightSection.replace('projects.', '');

      console.log(`[Projects] Pending highlight found: ${highlightSection}, key: ${projectKey}, isMobile: ${isMobile}`);

      // On mobile, expand the target card first
      if (isMobile) {
        setExpandedCard(projectKey);
      }

      // Wait for DOM to render, then scroll and highlight
      setTimeout(() => {
        // Find the element with data-section or data-project
        const element = document.querySelector(
          `[data-section="${highlightSection}"], [data-project="${projectKey}"]`
        );

        if (element) {
          console.log('[Projects] Found element, scrolling and highlighting');

          // Scroll to element
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });

          // Add highlight class
          element.classList.add('ai-highlight');

          // Remove highlight after 3 seconds
          setTimeout(() => {
            element.classList.remove('ai-highlight');
            element.classList.add('ai-highlight-persistent');

            setTimeout(() => {
              element.classList.remove('ai-highlight-persistent');
            }, 5000);
          }, 3000);

          // Clear the sessionStorage
          sessionStorage.removeItem('highlightSection');
        } else {
          console.warn('[Projects] Element not found for:', highlightSection);
          // Still call processPendingHighlight as fallback
          processPendingHighlight();
        }
      }, isMobile ? 800 : 500);
    } else {
      // No project-specific highlight, use normal processing
      setTimeout(() => {
        processPendingHighlight();
      }, 500);
    }
  }, [isMobile]);

  // Listen for section highlight events to auto-select the project
  useEffect(() => {
    const handleSectionHighlight = (event) => {
      const { sectionId } = event.detail;
      if (sectionId && sectionId.startsWith('projects.')) {
        const projectKey = sectionId.replace('projects.', '');
        const project = projectsData.find(p => p.key === projectKey);
        if (project && (!selectedProject || selectedProject.key !== projectKey)) {
          setSelectedProject(project);
          // Highlight after project is selected
          setTimeout(() => {
            highlightSection(sectionId);
          }, 500);
        }
      }
    };

    document.addEventListener('ai-section-highlight', handleSectionHighlight);
    return () => {
      document.removeEventListener('ai-section-highlight', handleSectionHighlight);
    };
  }, [selectedProject, projectsData]);

  return (
    <div className="projects-container">
      <div className="projects-header" id="projects-header">
        <div className="file-tab">
          <i className="fas fa-file-code tab-icon"></i>
          <span>Projects.js</span>
          <i className="fas fa-times close-icon"></i>
        </div>
        <div className="github-redirect-button" onClick={redirectToGitHub}>
          <i className="fas fa-external-link-alt redirect-icon"></i>
          <i className="fab fa-github github-icon"></i>
          <span className="redirect-text">Explore My Work</span>
        </div>
      </div>

      {/* Mobile Card View */}
      {isMobile ? (
        <div className="mobile-projects-grid">
          {projectsData.map((project) => (
            <motion.div
              key={project.id}
              className={`mobile-project-card ${expandedCard === project.key ? 'expanded' : ''}`}
              onClick={() => toggleCard(project.key)}
              data-project={project.key}
              data-section={`projects.${project.key}`}
              initial={false}
              animate={{ height: 'auto' }}
            >
              <div className="card-header">
                <div className="card-title-section">
                  <i className="fas fa-code-branch card-icon"></i>
                  <h3 className="card-title">{project.title}</h3>
                </div>
                <i className={`fas fa-chevron-down card-expand-icon ${expandedCard === project.key ? 'rotated' : ''}`}></i>
              </div>

              <div className="card-tech-preview">
                {project.technologies.slice(0, 4).map((tech, index) => (
                  <span key={index} className="tech-tag-mini">{tech}</span>
                ))}
                {project.technologies.length > 4 && (
                  <span className="tech-tag-more">+{project.technologies.length - 4}</span>
                )}
              </div>

              {/* Expandable Content - CSS handles display toggle */}
              <div className="card-content">
                <div className="card-description">
                  <p>{project.description}</p>
                </div>

                <div className="card-technologies">
                  <h4><i className="fas fa-tools"></i> Technologies</h4>
                  <div className="card-tech-tags">
                    {project.technologies.map((tech, index) => (
                      <span key={index} className="tech-tag">{tech}</span>
                    ))}
                  </div>
                </div>

                <div className="card-features">
                  <h4><i className="fas fa-star"></i> Key Features</h4>
                  <ul>
                    {project.features.slice(0, 5).map((feature, index) => (
                      <li key={index}>
                        <i className="fas fa-check"></i>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="card-links" onClick={(e) => e.stopPropagation()}>
                  <a
                    href={project.github}
                    className="card-link github-btn"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <i className="fab fa-github"></i> GitHub
                  </a>
                  {project.demo ? (
                    <a
                      href={project.demo}
                      className="card-link demo-btn"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <i className="fas fa-external-link-alt"></i> Live Demo
                    </a>
                  ) : (
                    <span className="card-link demo-btn disabled">
                      <i className="fas fa-external-link-alt"></i> No Demo
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        /* Desktop Split View */
        <div className="projects-content">
          <div
            className="explorer-section"
            id="explorer-section"
            data-section="projects.explorer"
          >
            <div className="explorer-header">
              <span>PROJECTS EXPLORER</span>
            </div>
            <div className="project-list">
              {projectsData.map((project) => (
                <div
                  key={project.id}
                  className={`project-item ${selectedProject?.id === project.id ? 'active' : ''}`}
                  onClick={() => openProject(project)}
                  data-project={project.key}
                  data-section={`projects.${project.key}`}
                >
                  <i className="fas fa-code-branch"></i>
                  <span>{project.title}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="project-display">
            {selectedProject ? (
              <motion.div
                className={`project-details project-${selectedProject.key}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                id={`project-details-${selectedProject.id}`}
                data-section={`projects.${selectedProject.key}`}
                data-project={selectedProject.key}
              >
                <div className="project-header">
                  <h2>{selectedProject.title}</h2>
                  <button className="close-btn" onClick={closeProject}>
                    <i className="fas fa-times"></i>
                  </button>
                </div>

                <div className="project-image">
                  <img src={selectedProject.image} alt={selectedProject.title} />
                </div>

                <div className="project-info">
                  <div className="info-section">
                    <h3>
                      <i className="fas fa-info-circle section-icon"></i>
                      Description
                    </h3>
                    <p>{selectedProject.description}</p>
                  </div>

                  <div className="info-section">
                    <h3>
                      <i className="fas fa-tools section-icon"></i>
                      Technologies
                    </h3>
                    <div className="tech-tags">
                      {selectedProject.technologies.map((tech, index) => (
                        <span key={index} className="tech-tag">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="info-section">
                    <h3>
                      <i className="fas fa-star section-icon"></i>
                      Key Features
                    </h3>
                    <ul className="feature-list">
                      {selectedProject.features.map((feature, index) => (
                        <li key={index} className="feature-item">
                          <i className="fas fa-check-circle feature-icon"></i>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="project-links">
                    <a
                      href={selectedProject.github}
                      className="project-link github-link"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <i className="fab fa-github"></i> View Code
                    </a>
                    {selectedProject.demo ? (
                      <a
                        href={selectedProject.demo}
                        className="project-link demo-link"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <i className="fas fa-external-link-alt"></i> Live Demo
                      </a>
                    ) : (
                      <button className="project-link demo-link disabled" disabled>
                        <i className="fas fa-external-link-alt"></i> Live Demo
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="no-selection">
                <div className="placeholder-content">
                  <i className="fas fa-laptop-code placeholder-icon"></i>
                  <h3>Select a project from the sidebar to view details</h3>
                  <p>Browse through my portfolio of web applications, machine learning projects, and more</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )
      }
    </div >
  );
};

export default Projects;
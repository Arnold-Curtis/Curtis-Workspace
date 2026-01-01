/**
 * Content Registry - Centralized content with semantic IDs for AI referencing
 * Replaces the old line-number-based content files (webcont.txt, *_content.txt)
 */

export const contentRegistry = {
    home: {
        id: 'home',
        title: 'Home Page',
        sections: {
            hero: {
                id: 'home.hero',
                title: 'Hero Section',
                selector: '#main, .main, .hero-section',
                content: {
                    greeting: "Hello👋, my name is",
                    name: "Arnold Curtis",
                    role: "Full-Stack Engineer & Machine Learning Innovator",
                    description: "I'm a passionate software engineer who loves building seamless applications, from intuitive front-end interfaces to robust back-end systems, integrating machine learning, and creating impactful solutions. Programming is my true passion, and I'm always excited for new challenges."
                }
            },
            buttons: {
                id: 'home.buttons',
                title: 'Call to Action Buttons',
                selector: '.button-container, #button-container',
                content: {
                    aboutButton: "Discover My Journey!",
                    skillsButton: "What I Bring to the Table?"
                }
            }
        }
    },
    about: {
        id: 'about',
        title: 'About Page',
        sections: {
            bio: {
                id: 'about.bio',
                title: 'Biography',
                selector: '#bio-section, .bio-section, .bio-code',
                content: {
                    summary: "I'm a passionate software engineer with expertise in full-stack development and machine learning.",
                    details: "With a strong foundation in computer engineering and hands-on experience, I create elegant, efficient, and impactful solutions to complex problems. My approach combines technical precision with creative problem-solving, allowing me to build applications that not only function flawlessly but also provide exceptional user experiences."
                }
            },
            experience: {
                id: 'about.experience',
                title: 'Work Experience',
                selector: '#experience-timeline, .experience-section, .experience-card',
                content: {
                    role: "Full Stack Developer",
                    company: "Self-employed",
                    period: "2024 - Present",
                    description: "Full stack developer building robust applications and exploring AI-powered solutions. Skilled in both front-end and back-end technologies, with a strong foundation in software engineering and a growing focus on intelligent systems.",
                    technologies: ["Java", "JavaScript", "React", "Node.js", "MongoDB", "MySQL", "SQLite", "Python", "Flutter"]
                }
            },
            education: {
                id: 'about.education',
                title: 'Education',
                selector: '#education-section, .education-section, .education-card',
                content: {
                    entries: [
                        { degree: "Bachelor of Business Information Technology", institution: "Strathmore University", period: "July 2024 - Present" },
                        { degree: "Certificate in Programming Languages", institution: "St Nicholas College", period: "January 2023 - July 2023", specialization: "C# Programming Language" }
                    ]
                }
            },
            interests: {
                id: 'about.interests',
                title: 'Personal Interests',
                selector: '#interests-container, .interests-section, .interests-container',
                content: {
                    items: ["Open Source Contribution", "Machine Learning Innovations", "Cars and Driving", "Gyming", "Gaming", "Competitive Programming"]
                }
            },
            journey: {
                id: 'about.journey',
                title: 'Technical Journey',
                selector: '#technical-journey, .journey-section, .technical-journey',
                content: {
                    summary: "I began programming in 2022, and in that time, I've evolved from writing basic code to engineering intelligent systems. My strength lies in designing full-stack applications that go beyond functionality — I specialize in embedding machine learning to create software that's not only usable, but smart, intuitive, and impactful."
                }
            },
            philosophy: {
                id: 'about.philosophy',
                title: 'Learning Philosophy',
                selector: '#learning-philosophy, .philosophy-section, .learning-philosophy',
                content: {
                    summary: "I believe true growth comes from staying curious. I'm constantly building, exploring, and refining my craft. I hold a foundational certification in C# from a bootcamp that sparked my journey into tech, and since then, I've taught myself technologies like Flutter, JavaScript, React, and backend Java frameworks through hands-on projects and practice."
                }
            }
        }
    },
    skills: {
        id: 'skills',
        title: 'Skills Page',
        sections: {
            technical: {
                id: 'skills.technical',
                title: 'Technical Skills',
                selector: '[data-category="technical"], .technical-skills, [data-section="skills.technical"]',
                content: {
                    items: [
                        { name: "Frontend Development", level: 60 },
                        { name: "Backend Development", level: 70 },
                        { name: "Machine Learning Incorporation", level: 70 },
                        { name: "Database Design", level: 50 },
                        { name: "Prompt Engineering", level: 80 }
                    ]
                }
            },
            frameworks: {
                id: 'skills.frameworks',
                title: 'Frameworks',
                selector: '[data-category="frameworks"], .frameworks-skills, [data-section="skills.frameworks"]',
                content: {
                    items: [
                        { name: "React", level: 80 },
                        { name: "Node.js", level: 80 },
                        { name: "TensorFlow", level: 60 },
                        { name: "Flutter", level: 50 },
                        { name: "Spring Framework", level: 70 },
                        { name: "Framer Motion", level: 75 }
                    ]
                }
            },
            languages: {
                id: 'skills.languages',
                title: 'Programming Languages',
                selector: '[data-category="languages"], .languages-skills, [data-section="skills.languages"]',
                content: {
                    items: [
                        { name: "JavaScript", level: 75 },
                        { name: "Python", level: 80 },
                        { name: "C#", level: 85 },
                        { name: "Java", level: 95 },
                        { name: "C++", level: 70 },
                        { name: "SQL", level: 60 }
                    ]
                }
            },
            tools: {
                id: 'skills.tools',
                title: 'Tools',
                selector: '[data-category="tools"], .tools-skills, [data-section="skills.tools"]',
                content: {
                    items: [
                        { name: "Git", level: 60 },
                        { name: "MySQL", level: 80 },
                        { name: "LLMs", level: 78 },
                        { name: "VS Code", level: 95 },
                        { name: "Premiere Pro", level: 72 }
                    ]
                }
            },
            softSkills: {
                id: 'skills.softSkills',
                title: 'Soft Skills',
                selector: '[data-category="softSkills"], .soft-skills, [data-section="skills.softSkills"]',
                content: {
                    items: [
                        { name: "Problem Solving", level: 95 },
                        { name: "Communication", level: 90 },
                        { name: "Team Collaboration", level: 92 },
                        { name: "Project Management", level: 85 },
                        { name: "Willingness to Learn", level: 88 }
                    ]
                }
            }
        }
    },
    projects: {
        id: 'projects',
        title: 'Projects Page',
        sections: {
            explorer: {
                id: 'projects.explorer',
                title: 'Project Explorer',
                selector: '#explorer-section, .explorer-section',
                content: {
                    description: "IDE-style project explorer with sidebar navigation",
                    emptyState: "Select a project from the sidebar to view details.",
                    github: "github.com/Arnold-Curtis"
                }
            },
            aipa: {
                id: 'projects.aipa',
                title: 'AI Personal Assistant (AIPA)',
                selector: '[data-project="aipa"], .project-aipa, [data-section="projects.aipa"]',
                content: {
                    description: "AIPA is a full-stack AI-powered personal assistant that combines a modern React 19 frontend with a robust Spring Boot 3.4 backend. Integrated with Google's Gemini 2.0 Flash API, it provides intelligent, context-aware responses, automatic calendar event detection from natural language, persistent memory capabilities, and dynamic plan generation.",
                    technologies: ["React 19", "Spring Boot 3.4", "Java", "SQLite", "Google Gemini 2.0 Flash", "Spring Security", "JWT Authentication", "REST APIs", "FullCalendar"],
                    features: [
                        "Gemini 2.0 Flash integration for fast, high-quality AI responses",
                        "Multi-tier prompt system with sophisticated AI behavior templates",
                        "Natural language event detection — auto-creates calendar events",
                        "Persistent memory system that stores and retrieves user preferences",
                        "Dynamic plan generation breaking complex goals into time-bound steps",
                        "JWT-based authentication with refresh capability",
                        "Customizable themes (10 color schemes)",
                        "FullCalendar integration with day, week, and list views"
                    ],
                    github: "github.com/Arnold-Curtis/AI-Personal-Assistant"
                }
            },
            nlrs: {
                id: 'projects.nlrs',
                title: 'Natural Language Review System (NLRS)',
                selector: '[data-project="nlrs"], .project-nlrs, [data-section="projects.nlrs"]',
                content: {
                    description: "NLRS is a JavaFX desktop application designed for educational institutions to manage lecturer feedback. Students submit open-ended reviews which are automatically analyzed using Stanford CoreNLP for sentiment analysis (1-9 scale). Lecturers view aggregated sentiment scores, and administrators manage users and generate performance reports.",
                    technologies: ["Java", "JavaFX 17", "FXML", "Stanford CoreNLP 4.5.6", "MySQL 8.0", "JDBC", "FormsFX", "Maven"],
                    features: [
                        "Stanford CoreNLP pipeline for sentiment analysis",
                        "Sentiment scoring from 1 (Very Negative) to 9 (Very Positive)",
                        "Role-based dashboards for students, lecturers, and administrators",
                        "Anonymous review submission protecting student privacy",
                        "Comprehensive performance reports with aggregated sentiment data",
                        "Authentication system preventing fake reviews"
                    ],
                    github: "github.com/Arnold-Curtis/NaturalLanguageReviewSystem"
                }
            },
            audioglass: {
                id: 'projects.audioglass',
                title: 'AudioGlass — Transparency Mode',
                selector: '[data-project="audioglass"], .project-audioglass, [data-section="projects.audioglass"]',
                content: {
                    description: "AudioGlass is a Windows desktop application providing real-time audio passthrough from microphone to headphones, emulating the 'transparency mode' found in premium ANC headphones like AirPods Pro. Designed for ultra-low latency (sub-15ms), the application runs its audio hot path in native C code to bypass .NET garbage collection pauses.",
                    technologies: ["C# .NET", "Windows Forms", "Miniaudio (C library)", "Custom C++ Wrapper", "WASAPI", "P/Invoke", "NAudio", "PowerShell"],
                    features: [
                        "Sub-15ms latency via native (unmanaged) audio processing",
                        "GC-immune audio loop bypasses .NET garbage collection",
                        "System tray application with minimal footprint",
                        "Configurable buffer sizes (128-frame or 256-frame)",
                        "Input/output device selection with hot-swap",
                        "Adjustable passthrough volume (0-100%)",
                        "Persistent settings saved across restarts"
                    ],
                    github: "github.com/Arnold-Curtis/AudioGlass"
                }
            },
            workspace: {
                id: 'projects.workspace',
                title: 'Curtis-Workspace — Interactive Portfolio',
                selector: '[data-project="workspace"], .project-workspace, [data-section="projects.workspace"]',
                content: {
                    description: "This portfolio website reimagined as a fully interactive Windows 11-style desktop environment. Instead of traditional scrolling, visitors experience a multi-window operating system simulation with draggable windows, a centered taskbar, snap zones, and an AI-powered assistant orb integrated with Google Gemini.",
                    technologies: ["React 19", "React Router 6", "Framer Motion", "Google Generative AI (Gemini)", "react-draggable", "react-resizable", "CSS3 Variables", "Netlify Functions", "PHP Backend"],
                    features: [
                        "Multi-window architecture with independent, stacking windows",
                        "Draggable windows with momentum and resize handles",
                        "Windows 11-style centered taskbar",
                        "Snap zones for half-screen, quarter-screen, and fullscreen",
                        "AI Assistant Orb with Google Gemini integration",
                        "Split-view mode — AI chat snaps beside referenced content",
                        "Glassmorphism design with dark theme",
                        "Responsive design with mobile-specific navigation"
                    ],
                    demo: "arnoldcurtis.netlify.app",
                    github: "github.com/Arnold-Curtis/Curtis-Workspace"
                }
            }
        }
    },
    contact: {
        id: 'contact',
        title: 'Contact Page',
        sections: {
            info: {
                id: 'contact.info',
                title: 'Contact Information',
                selector: '#contact-info, .contact-info, .contact-container',
                content: {
                    email: "mbicidev@gmail.com",
                    phone: "+254723393075",
                    github: "github.com/Arnold-Curtis",
                    linkedin: "linkedin.com/in/arnold-curtis"
                }
            },
            form: {
                id: 'contact.form',
                title: 'Contact Form',
                selector: '#contact-form, .contact-form, .form-container',
                content: {
                    title: "Get in Touch",
                    description: "Have a project in mind or want to discuss potential opportunities? I'd love to hear from you!",
                    responseTime: "Average response time: 1 hour"
                }
            }
        }
    },
    resume: {
        id: 'resume',
        title: 'Resume Page',
        sections: {
            header: {
                id: 'resume.header',
                title: 'Resume Header',
                selector: '#resume-header, .resume-header',
                content: {
                    name: "Arnold Curtis",
                    role: "Full-Stack Engineer & Machine Learning Innovator",
                    location: "Nairobi, Kenya"
                }
            },
            experience: {
                id: 'resume.experience',
                title: 'Professional Experience',
                selector: '#resume-experience, .resume-experience, .experience-section',
                content: {
                    role: "Full Stack Developer",
                    company: "Self-employed",
                    period: "2024 - Present",
                    achievements: [
                        "Full stack developer building robust applications and exploring AI-powered solutions",
                        "Developed the AI Personal Assistant (AIPA/PLANAZ) using React.js, Spring Boot, and Java",
                        "Created a Natural Language Review System for academic evaluations using Java and NLP",
                        "Skilled in both front-end and back-end technologies with a focus on intelligent systems",
                        "Implemented database designs and optimized queries for MySQL, MongoDB, and SQLite"
                    ]
                }
            },
            education: {
                id: 'resume.education',
                title: 'Education',
                selector: '#resume-education, .resume-education, .education-section',
                content: {
                    entries: [
                        { degree: "Bachelor of Business Information Technology", institution: "Strathmore University", period: "July 2024 - Present" },
                        { degree: "Certificate in Programming Languages", institution: "St Nicholas College", period: "January 2023 - July 2023", specialization: "C# Programming Language" }
                    ]
                }
            },
            skills: {
                id: 'resume.skills',
                title: 'Skills Summary',
                selector: '#resume-skills, .resume-skills, .skills-section',
                content: {
                    categories: {
                        programmingLanguages: "JavaScript, Python, Java, C#, SQL",
                        frontend: "React.js, Flutter, HTML5/CSS3, JavaFX",
                        backend: "Node.js, Express, Spring Boot, REST APIs",
                        databases: "MySQL, MongoDB, SQLite, PostgreSQL",
                        ai: "TensorFlow, PyTorch, NLP, Large Language Models (LLMs)",
                        tools: "Git, GitHub, Agile-Scrum"
                    }
                }
            },
            requestForm: {
                id: 'resume.requestForm',
                title: 'Resume Request Form',
                selector: '#resume-request, .resume-modal, .resume-request-form',
                content: {
                    title: "Request Official Resume",
                    description: "Please provide your details to receive my official resume with verified certifications."
                }
            }
        }
    }
};

/**
 * Get all content formatted for AI context
 * This replaces the old webcont.txt loading
 */
export const getContentForAI = () => {
    let content = "# ARNOLD CURTIS PORTFOLIO CONTENT\n\n";
    content += "## METADATA\n";
    content += "- OWNER: Arnold Curtis\n";
    content += "- ROLE: Full-Stack Engineer & Machine Learning Innovator\n";
    content += "- LOCATION: Nairobi, Kenya\n";
    content += "- EMAIL: mbicidev@gmail.com\n";
    content += "- GITHUB: github.com/Arnold-Curtis\n";
    content += "- LINKEDIN: linkedin.com/in/arnold-curtis\n\n";

    Object.entries(contentRegistry).forEach(([pageId, page]) => {
        content += `## ${page.title.toUpperCase()}\n\n`;

        Object.entries(page.sections).forEach(([sectionKey, section]) => {
            content += `### ${section.title} [ID: ${section.id}]\n`;

            // Format content based on type
            if (section.content) {
                if (section.content.description) {
                    content += `${section.content.description}\n`;
                }
                if (section.content.summary) {
                    content += `${section.content.summary}\n`;
                }
                if (section.content.details) {
                    content += `${section.content.details}\n`;
                }
                if (section.content.technologies) {
                    content += `Technologies: ${section.content.technologies.join(', ')}\n`;
                }
                if (section.content.features) {
                    content += `Key Features:\n`;
                    section.content.features.forEach(f => {
                        content += `- ${f}\n`;
                    });
                }
                if (section.content.items) {
                    if (Array.isArray(section.content.items) && section.content.items[0]?.name) {
                        // Skills with levels
                        section.content.items.forEach(item => {
                            content += `- ${item.name}: ${item.level}%\n`;
                        });
                    } else {
                        // Simple list
                        section.content.items.forEach(item => {
                            content += `- ${item}\n`;
                        });
                    }
                }
                if (section.content.entries) {
                    section.content.entries.forEach(entry => {
                        content += `- ${entry.degree || entry.role} at ${entry.institution || entry.company} (${entry.period})\n`;
                    });
                }
                if (section.content.github) {
                    content += `GitHub: ${section.content.github}\n`;
                }
                if (section.content.demo) {
                    content += `Live Demo: ${section.content.demo}\n`;
                }
            }
            content += "\n";
        });
    });

    return content;
};

/**
 * Find a section by its semantic ID
 * @param {string} sectionId - e.g., "about.bio", "skills.languages"
 * @returns {object|null} The section object or null if not found
 */
export const findSectionById = (sectionId) => {
    if (!sectionId || typeof sectionId !== 'string') return null;

    const parts = sectionId.split('.');
    if (parts.length < 2) return null;

    const pageId = parts[0];
    const sectionKey = parts.slice(1).join('.');

    const page = contentRegistry[pageId];
    if (!page) return null;

    const section = page.sections[sectionKey];
    return section || null;
};

/**
 * Get the page ID for a section
 * @param {string} sectionId - e.g., "about.bio"
 * @returns {string|null} The page ID or null
 */
export const getPageForSection = (sectionId) => {
    if (!sectionId || typeof sectionId !== 'string') return null;
    const parts = sectionId.split('.');
    return parts[0] || null;
};

/**
 * Get all selectors for finding a section element
 * Returns an array of CSS selectors in priority order
 * @param {string} sectionId - e.g., "about.bio"
 * @returns {string[]} Array of CSS selectors
 */
export const getSelectorsForSection = (sectionId) => {
    const section = findSectionById(sectionId);
    if (!section) {
        // Return fallback selectors based on the section ID
        return [
            `[data-section="${sectionId}"]`,
            `#${sectionId.replace('.', '-')}`,
            `.${sectionId.replace('.', '-')}`
        ];
    }

    // Primary selector from registry
    const registrySelectors = section.selector.split(',').map(s => s.trim());

    // Add data-section as highest priority
    const dataAttrSelector = `[data-section="${sectionId}"]`;

    // Combine with data-section first
    return [dataAttrSelector, ...registrySelectors];
};

/**
 * Get all available section IDs for AI reference
 * @returns {string[]} Array of all section IDs
 */
export const getAllSectionIds = () => {
    const ids = [];

    Object.entries(contentRegistry).forEach(([pageId, page]) => {
        Object.entries(page.sections).forEach(([sectionKey, section]) => {
            ids.push(section.id);
        });
    });

    return ids;
};

/**
 * Validate if a section ID exists
 * @param {string} sectionId - e.g., "about.bio"
 * @returns {boolean}
 */
export const isValidSectionId = (sectionId) => {
    return findSectionById(sectionId) !== null;
};

/**
 * Get section display information for generating links
 * @param {string} sectionId - e.g., "about.bio"
 * @returns {object|null}
 */
export const getSectionDisplayInfo = (sectionId) => {
    const section = findSectionById(sectionId);
    if (!section) return null;

    const page = getPageForSection(sectionId);

    return {
        id: section.id,
        title: section.title,
        page: page,
        pageTitle: contentRegistry[page]?.title || page
    };
};

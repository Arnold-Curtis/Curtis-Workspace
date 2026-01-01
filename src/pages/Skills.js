import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import '../stylings/Skills.css';
import { processPendingHighlight, highlightSection, injectHighlightStyles } from '../utils/highlightService';

export const Skills = () => {
  const [terminalActive, setTerminalActive] = useState(true);
  const [typedText, setTypedText] = useState('');
  const [currentLine, setCurrentLine] = useState(0);
  const [animationComplete, setAnimationComplete] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const typeIntervalRef = useRef(null);

  // Terminal interaction strings - wrapped in useMemo to prevent recreation on each render
  const terminalLines = useMemo(() => [
    { command: "skills.show('technical')", delay: 30 },
    { command: "skills.show('frameworks')", delay: 1500 },
    { command: "skills.show('tools')", delay: 1500 },
    { command: "skills.show('languages')", delay: 1500 },
    { command: "skills.show('softSkills')", delay: 1500 }
  ], []);

  // All skills data
  const skillsData = {
    technical: [
      { name: 'Frontend Development', level: 60 },
      { name: 'Backend Development', level: 70 },
      { name: 'Machine Learning Incorporation', level: 70 },
      { name: 'Database Design', level: 50 },
      { name: 'Prompt Engineering', level: 80 }
    ],
    frameworks: [
      { name: 'React', level: 80 },
      { name: 'Node.js', level: 80 },
      { name: 'TensorFlow', level: 60 },
      { name: 'Flutter', level: 50 },
      { name: ' Spring Framework', level: 70 }
    ],
    tools: [
      { name: 'Git', level: 60 },
      { name: 'mySQL', level: 80 },
      { name: 'LLMs', level: 78 },
      { name: 'VS Code', level: 95 },
      { name: 'Premiere Pro', level: 72 }
    ],
    languages: [
      { name: 'JavaScript', level: 75 },
      { name: 'Python', level: 80 },
      { name: 'C#', level: 85 },
      { name: 'Java', level: 95 },
      { name: 'C++', level: 70 },
      { name: 'SQL', level: 60 }
    ],
    softSkills: [
      { name: 'Problem Solving', level: 95 },
      { name: 'Communication', level: 90 },
      { name: 'Team Collaboration', level: 92 },
      { name: 'Project Management', level: 85 },
      { name: 'Willingness to Learn', level: 88 }
    ]
  };

  // Current category being displayed
  const [currentCategory, setCurrentCategory] = useState(null);

  // Function to animate typing in the terminal - wrapped in useCallback to prevent recreation on each render
  const animateTyping = useCallback((command, onComplete) => {
    if (isTyping) {
      // Clear existing typing animation if one is in progress
      clearInterval(typeIntervalRef.current);
    }

    setIsTyping(true);
    let index = 0;
    setTypedText('');

    typeIntervalRef.current = setInterval(() => {
      setTypedText(command.substring(0, index));
      index++;

      if (index > command.length) {
        clearInterval(typeIntervalRef.current);
        setIsTyping(false);
        if (onComplete) onComplete();
      }
    }, 50); // Faster typing speed for better UX when manually selecting
  }, [isTyping, typeIntervalRef, setTypedText, setIsTyping]);

  // Typing animation for initial sequence
  useEffect(() => {
    if (currentLine < terminalLines.length) {
      const command = terminalLines[currentLine].command;
      const delay = terminalLines[currentLine].delay;

      const timeout = setTimeout(() => {
        animateTyping(command, () => {
          // Extract category from command
          const category = command.match(/'(.*?)'/)[1];

          setTimeout(() => {
            setCurrentCategory(category);

            setTimeout(() => {
              setCurrentLine(prevLine => prevLine + 1);
              // Check if this is the last animation
              if (currentLine === terminalLines.length - 1) {
                setAnimationComplete(true);
              }
            }, 1500); // Wait before moving to next command
          }, 300); // Show result right after typing
        });
      }, currentLine === 0 ? 500 : delay); // Delay before starting to type

      return () => {
        clearTimeout(timeout);
        clearInterval(typeIntervalRef.current);
      };
    }
  }, [currentLine, terminalLines.length, animateTyping, terminalLines]);

  // Handle category selection
  const handleCategorySelect = (category) => {
    if (category === currentCategory) return; // Don't re-animate if it's the same category

    // Create the command string that would show this category
    const command = `skills.show('${category}')`;

    // Animate typing the command
    animateTyping(command, () => {
      // After typing animation completes, update the category
      setTimeout(() => {
        setCurrentCategory(category);
      }, 300);
    });
  };

  const toggleTerminal = () => {
    setTerminalActive(!terminalActive);
  };

  // Check for highlight requests when component mounts
  useEffect(() => {
    // Inject highlight styles
    injectHighlightStyles();

    // Process pending highlights after animation completes
    if (animationComplete) {
      setTimeout(() => {
        processPendingHighlight();
      }, 500);
    }
  }, [animationComplete]);

  // Listen for section highlight events
  useEffect(() => {
    const handleSectionHighlight = (event) => {
      const { sectionId } = event.detail;
      if (sectionId && sectionId.startsWith('skills.')) {
        // Extract the category from the section ID
        const category = sectionId.replace('skills.', '');
        if (skillsData[category]) {
          // First switch to that category
          handleCategorySelect(category);
          // Then highlight after a short delay
          setTimeout(() => {
            highlightSection(sectionId);
          }, 800);
        }
      }
    };

    document.addEventListener('ai-section-highlight', handleSectionHighlight);
    return () => {
      document.removeEventListener('ai-section-highlight', handleSectionHighlight);
    };
  }, [currentCategory]);

  return (
    <div className="skills-page">
      <div className="skills-content">
        <div className="vs-panel-container">
          <div className="vs-panel-tabs">
            <div className="vs-panel-tab">PROBLEMS</div>
            <div className="vs-panel-tab">OUTPUT</div>
            <div className="vs-panel-tab active">TERMINAL</div>
            <div className="vs-panel-tab">DEBUG CONSOLE</div>
            <div className="terminal-actions">
              <button className="terminal-action" onClick={toggleTerminal}>
                <i className={`fas ${terminalActive ? 'fa-chevron-down' : 'fa-chevron-up'}`}></i>
              </button>
              <button className="terminal-action">
                <i className="fas fa-times"></i>
              </button>
            </div>
          </div>

          {terminalActive && (
            <div className="terminal-container" id="terminal-container">
              <div className="terminal-header">
                <span className="terminal-title">
                  <i className="fas fa-terminal"></i> bash
                </span>
              </div>
              <div className="terminal-body">
                <div className="terminal-line">
                  <span className="terminal-prompt">curtis@workspace:</span>
                  <span className="terminal-path">~/skills$</span>
                  <span className="terminal-command"> {typedText}</span>
                  {(isTyping || typedText.length === terminalLines[currentLine]?.command.length) && <span className="cursor">▋</span>}
                </div>

                {currentCategory && (
                  <div
                    className="terminal-result"
                    data-section={`skills.${currentCategory}`}
                    data-category={currentCategory}
                  >
                    <div className="result-title">
                      {currentCategory.charAt(0).toUpperCase() + currentCategory.slice(1)} Skills:
                    </div>
                    {skillsData[currentCategory].map((skill, index) => (
                      <div key={index} className="skill-bar">
                        <span className="skill-name">{skill.name}</span>
                        <div className="skill-progress">
                          <div
                            className="skill-fill"
                            style={{ width: `${skill.level}%` }}
                          ></div>
                        </div>
                        <span className="skill-level">{skill.level}%</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Category Selector - appears after animation completes */}
        {animationComplete && (
          <div className="category-selector" id="category-selector">
            <div className="selector-container">
              {Object.keys(skillsData).map((category) => (
                <button
                  key={category}
                  className={`category-button ${currentCategory === category ? 'active' : ''}`}
                  onClick={() => handleCategorySelect(category)}
                  data-category={category}
                >
                  <i className={`fas ${category === 'technical' ? 'fa-cogs' :
                      category === 'frameworks' ? 'fa-layer-group' :
                        category === 'tools' ? 'fa-tools' :
                          category === 'languages' ? 'fa-code' :
                            category === 'softSkills' ? 'fa-users' : 'fa-star'
                    }`}></i>
                  <span>{category.charAt(0).toUpperCase() + category.slice(1)}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="skills-description">
          <div className="description-content">
            <h2>Technical Proficiencies</h2>
            <p>
              I began programming in 2022, and in that time, I've evolved from writing basic code to engineering intelligent systems. My strength lies in designing full-stack applications that go beyond functionality — I specialize in embedding machine learning to create software that's not only usable, but smart, intuitive, and impactful. With a solid foundation in Java, React, Spring Boot, and SQLite, I focus on making systems feel effortless and intelligent by integrating cloud and local AI services. Every line of code I write is driven by curiosity, continuous learning, and a desire to innovate through automation and intelligence.
            </p>

            <h3>Specializations</h3>
            <ul className="specializations">
              <li>
                <i className="fas fa-brain spec-icon"></i>
                <span>Adaptive Machine Learning Integration</span>
              </li>
              <li>
                <i className="fas fa-code spec-icon"></i>
                <span>Full Stack Development (React & Java Spring Boot)</span>
              </li>
              <li>
                <i className="fas fa-network-wired spec-icon"></i>
                <span>Cloud AI Integration & RESTful APIs</span>
              </li>
              <li>
                <i className="fas fa-microchip spec-icon"></i>
                <span>Applied Machine Learning & Prompt Engineering</span>
              </li>
            </ul>

            <h3>Continuous Learning</h3>
            <p>
              I believe true growth comes from staying curious. I'm constantly building, exploring, and refining my craft. I hold a foundational certification in C# from a bootcamp that sparked my journey into tech, and since then, I've taught myself technologies like Flutter, JavaScript, React, and backend Java frameworks through hands-on projects and practice. While I'm confident in my ability to build and deliver, I continue sharpening my skills daily — from deepening my understanding of Java through LeetCode, to mastering the dynamics of neural networks in Python to truly grasp AI from the ground up.
            </p>

            <div className="learning-status">
              <div className="status-item">
                <span className="status-label">Current Focus:</span>
                <span className="status-value">Neural Networks in Python</span>
              </div>
              <div className="status-item">
                <span className="status-label">Latest Certification:</span>
                <span className="status-value">C# Programming – Fundamentals (Bootcamp)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
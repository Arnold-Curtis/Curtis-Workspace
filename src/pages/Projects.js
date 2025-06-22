import React, { useState } from 'react';
import '../stylings/Projects.css';
import { motion } from 'framer-motion';

const Projects = () => {
  // Dummy project data
  const projectsData = [
    {
      id: 1,
      title: "AI Personal Assistant (AIPA) (PLANAZ)",
      description:
        "AIPA, also known as PLANAZ, is an intelligent AI-powered personal assistant built to help users seamlessly manage their daily lives through natural conversation and smart automation. It leverages large language models (LLMs), both locally and via cloud-based APIs, to comprehend user input, generate personalized plans, and intelligently handle events. With a modern React frontend and a robust Spring Boot + SQLite backend, AIPA offers a powerful combination of conversational AI and practical productivity tools, making it more than just a task manager—it's a true personal assistant.",
      technologies: [
        "React.js",
        "Spring Boot",
        "Java",
        "SQLite",
        "Large Language Models (LLMs)",
        "Cloud & Local AI Integration",
        "REST APIs"
      ],
      image: "https://via.placeholder.com/600x350/252526/61dafb?text=Task+Manager+App",
      github: "https://github.com/Arnold-Curtis/AI-Personal-Assistant",
      demo: "https://demo.com",
      features: [
        "Natural language understanding using large language models (LLMs)",
        "Seamless integration with both cloud-based and local LLMs",
        "Fully integrated calendar system for managing events and schedules",
        "Context-aware event creation: understands when and what to schedule",
        "Smart planning function that breaks down goals into achievable tasks",
        "Auto-assignment of subtasks to specific dates, times, and descriptions",
        "Dynamic reminder system to keep users on track with their goals",
        "Conversational interface for intuitive interaction with the assistant",
        "React-based responsive UI with smooth user experience",
        "Robust Spring Boot backend with SQLite for lightweight data persistence"
      ]
    }, 
    {
      id: 2,
      title: "Natural Language Review System",
      description:
        "A Java-based desktop application that revolutionizes academic evaluations by leveraging Natural Language Processing (NLP) to analyze student feedback. It replaces traditional, rigid survey forms with open-ended natural language input, providing administrators and lecturers with deeper, unbiased insights into performance.",
      technologies: [
        "Java",
        "JavaFX",
        "Scene Builder",
        "MySQL",
        "NLP (Natural Language Processing)",
        "JUnit",
        "TestNG",
        "Agile-Scrum",
        "Object-Oriented Design"
      ],
      image: "https://via.placeholder.com/600x350/252526/61dafb?text=Natural+Language+Review+System",
      github: "https://github.com/Arnold-Curtis/NaturalLanguageReviewSystem",
      demo: "https://demo.com",
      features: [
        "Accepts open-ended, natural language reviews from students",
        "Processes and analyzes textual feedback using NLP",
        "Reduces bias by removing rigid rating scales and predefined options",
        "Provides role-based access for students, lecturers, and administrators",
        "Generates comprehensive performance reports and sentiment summaries",
        "Implements authentication and security to prevent fake reviews",
        "Allows lecturers to respond to or challenge reviews",
        "Built with modular, object-oriented design for scalability",
        "Tested using JUnit and TestNG frameworks"
      ]
    },    
    // {
    //   id: 2,
    //   title: "E-Commerce Platform",
    //   description: "A full-featured e-commerce platform with real-time inventory management, secure payment processing, and personalized recommendations.",
    //   technologies: ["Vue.js", "Express", "PostgreSQL", "Stripe API"],
    //   image: "https://via.placeholder.com/600x350/252526/61dafb?text=E-Commerce+Platform",
    //   github: "https://github.com",
    //   demo: "https://demo.com",
    //   features: [
    //     "Product search and filtering",
    //     "User authentication",
    //     "Order tracking",
    //     "Admin dashboard"
    //   ]
    // },
    // {
    //   id: 3,
    //   title: "Real-time Data Visualization Dashboard",
    //   description: "A responsive dashboard that visualizes complex data sets in real-time, with customizable views and interactive elements for data exploration.",
    //   technologies: ["React", "D3.js", "Socket.IO", "Node.js"],
    //   image: "https://via.placeholder.com/600x350/252526/61dafb?text=Data+Visualization",
    //   github: "https://github.com",
    //   demo: "https://demo.com",
    //   features: [
    //     "Interactive charts",
    //     "Real-time updates",
    //     "Data filtering",
    //     "Export capabilities"
    //   ]
    // },
    // {
    //   id: 4,
    //   title: "AI Image Generator",
    //   description: "A web application that leverages machine learning to generate unique images based on text descriptions provided by users.",
    //   technologies: ["Python", "TensorFlow", "Flask", "React"],
    //   image: "https://via.placeholder.com/600x350/252526/61dafb?text=AI+Image+Generator",
    //   github: "https://github.com",
    //   demo: "https://demo.com",
    //   features: [
    //     "Text-to-image generation",
    //     "Style transfer options",
    //     "Image editing tools",
    //     "Gallery storage"
    //   ]
    // }
  ];

  const [selectedProject, setSelectedProject] = useState(null);

  const openProject = (project) => {
    setSelectedProject(project);
  };

  const closeProject = () => {
    setSelectedProject(null);
  };
  
  const redirectToGitHub = () => {
    window.open('https://github.com/Arnold-Curtis', '_blank');
  };

  return (
    <div className="projects-container">
      <div className="projects-header" id="projects-header" data-line="86-95">
        <div className="file-tab" data-line="86">
          <i className="fas fa-file-code tab-icon"></i>
          <span>Projects.js</span>
          <i className="fas fa-times close-icon"></i>
        </div>
        <div className="github-redirect-button" onClick={redirectToGitHub} data-line="87">
          <i className="fas fa-external-link-alt redirect-icon"></i>
          <i className="fab fa-github github-icon"></i>
          <span className="redirect-text">Explore My Work</span>
        </div>
      </div>
      
      <div className="projects-content">
        <div className="explorer-section" id="explorer-section" data-line="1-15">
          <div className="explorer-header" data-line="1">
            <span>PROJECTS EXPLORER</span>
          </div>
          <div className="project-list">
            {projectsData.map((project, index) => (
              <div 
                key={project.id} 
                className={`project-item ${selectedProject?.id === project.id ? 'active' : ''}`}
                onClick={() => openProject(project)}
                data-line={2 + index}
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
              className="project-details"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              id={`project-details-${selectedProject.id}`}
              data-line={selectedProject.id === 1 ? "16-50" : "51-85"}
            >
              <div className="project-header">
                <h2 data-line={selectedProject.id === 1 ? 16 : 51}>{selectedProject.title}</h2>
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
                  <p data-line={selectedProject.id === 1 ? "18-23" : "53-55"}>
                    {selectedProject.description}
                  </p>
                </div>
                
                <div className="info-section">
                  <h3>
                    <i className="fas fa-tools section-icon"></i>
                    Technologies
                  </h3>
                  <div className="tech-tags">
                    {selectedProject.technologies.map((tech, index) => (
                      <span 
                        key={index} 
                        className="tech-tag"
                        data-line={selectedProject.id === 1 ? (26 + index) : (58 + index)}
                      >
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
                      <li 
                        key={index} 
                        className="feature-item"
                        data-line={selectedProject.id === 1 ? (35 + index) : (69 + index)}
                      >
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
                    data-line={selectedProject.id === 1 ? 49 : 83}
                  >
                    <i className="fab fa-github"></i> View Code
                  </a>
                  <a className="project-link demo-link disabled">
                    <i className="fas fa-external-link-alt"></i> Live Demo
                  </a>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="no-selection">
              <div className="placeholder-content" data-line="12-13">
                <i className="fas fa-laptop-code placeholder-icon"></i>
                <h3>Select a project from the sidebar to view details</h3>
                <p>Browse through my portfolio of web applications, machine learning projects, and more</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Projects;
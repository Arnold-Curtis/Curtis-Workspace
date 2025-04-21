import React from 'react';
import '../stylings/About.css';
import { motion } from 'framer-motion';

const About = () => {
  // Experience data with dummy content
  const experiences = [
    {
      "role": "Full Stack Developer",
      "company": "Self-employed",
      "date": "2023 - Present",
      "description": "Full stack developer building robust applications and exploring AI-powered solutions. Skilled in both front-end and back-end technologies, with a strong foundation in software engineering and a growing focus on intelligent systems.",
      "technologies": [
        "Java", "JavaScript", "React", "Node.js", "MongoDB",
        "MySQL", "SQLite", "Python", "Flutter"
      ]
    },
    // {
    //   role: "Frontend Developer",
    //   company: "WebCraft Studios",
    //   date: "2018 - 2020",
    //   description: "Built responsive web applications with modern JavaScript frameworks. Implemented CI/CD pipelines that reduced deployment time by 60%.",
    //   technologies: ["JavaScript", "React", "Vue.js", "Webpack", "Jest"]
    // }
  ];

  return (
    <div className="about-page-container">
      <div className="about-header">
        <div className="file-tab">
          <i className="fas fa-file-code tab-icon"></i>
          <span>About.js</span>
          <i className="fas fa-times close-icon"></i>
        </div>
      </div>
      
      <div className="about-content">
        <motion.div 
          className="code-line-numbers"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {Array.from({ length: 50 }, (_, i) => (
            <div key={i} className="line-number">{i + 1}</div>
          ))}
        </motion.div>
        
        <div className="about-main">
          <motion.div 
            className="code-comment"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {`/**
 * About.js
 * 
 * This component represents Arnold Curtis's professional journey,
 * skills, and personal background.
 */`}
          </motion.div>
          
          <motion.div 
            className="section-container"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h2 className="section-title">
              <span className="keyword">const</span> <span className="variable">Bio</span> = () =&gt; &#123;
            </h2>
            <div className="section-content">
              <p>I'm a passionate software engineer with expertise in full-stack development and machine learning. With a strong foundation in computer engineering and years of hands-on experience, I create elegant, efficient, and impactful solutions to complex problems.</p>
              
              <p>My approach combines technical precision with creative problem-solving, allowing me to build applications that not only function flawlessly but also provide exceptional user experiences.</p>
            </div>
            <div className="code-line">&#125;;</div>
          </motion.div>
          
          <motion.div 
            className="section-container"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <h2 className="section-title">
              <span className="keyword">const</span> <span className="variable">Experience</span> = () =&gt; &#123;
            </h2>
            <div className="section-content">
              <div className="experience-timeline">
                {experiences.map((exp, index) => (
                  <div key={index} className="experience-card">
                    <div className="experience-header">
                      <h3 className="role">{exp.role}</h3>
                      <span className="company">{exp.company}</span>
                      <span className="date">{exp.date}</span>
                    </div>
                    <p className="description">{exp.description}</p>
                    <div className="technologies">
                      {exp.technologies.map((tech, techIndex) => (
                        <span key={techIndex} className="tech-tag">{tech}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="code-line">&#125;;</div>
          </motion.div>
          
          <motion.div 
            className="section-container"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <h2 className="section-title">
              <span className="keyword">const</span> <span className="variable">Education</span> = () =&gt; &#123;
            </h2>
            <div className="section-content">
              <div className="education-card">
                <h3>Bachelor of Business Information Technology</h3>
                <p className="institution">Strathmore University</p>
                <p className="edu-date">July 2024 - Date</p>
                <p className="specialization"></p>
              </div>
              <div className="education-card">
                <h3>Diploma in Business Information Technology</h3>
                <p className="institution">Strathmore University</p>
                <p className="edu-date">March 2023 - December 2024</p>
                <p className="specialization"></p>
              </div>
              <div className="education-card">
                <h3>Certificate in Programming Languages</h3>
                <p className="institution">St Nicholas College</p>
                <p className="edu-date">January 2023 - March 2023</p>
                <p className="specialization">C# Programming Language</p>
              </div>
            </div>
            <div className="code-line">&#125;;</div>
          </motion.div>
          
          <motion.div 
            className="section-container"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
          >
            <h2 className="section-title">
              <span className="keyword">const</span> <span className="variable">Interests</span> = () =&gt; &#123;
            </h2>
            <div className="section-content">
              <div className="interests-container">
                <div className="interest-item">
                  <i className="fas fa-code-branch interest-icon"></i>
                  <span>Open Source Contribution</span>
                </div>
                <div className="interest-item">
                  <i className="fas fa-brain interest-icon"></i>
                  <span>Machine Learning Innovations</span>
                </div>
                <div className="interest-item">
                  <i className="fas fa-car interest-icon"></i>
                  <span>Cars and Driving</span>
                </div>
                <div className="interest-item">
                  <i className="fas fa-dumbbell interest-icon"></i>
                  <span>Gyming</span>
                </div>
                <div className="interest-item">
                  <i className="fas fa-gamepad interest-icon"></i>
                  <span>Gaming</span>
                </div>
                <div className="interest-item">
                  <i className="fas fa-code interest-icon"></i>
                  <span>Competitive Programming</span>
                </div>
              </div>
            </div>
            <div className="code-line">&#125;;</div>
          </motion.div>
          
          <motion.div 
            className="section-container export-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3 }}
          >
            <div className="code-line">
              <span className="keyword">export default</span> <span className="function-call">() =&gt; (</span>
            </div>
            <div className="export-content">
              <div className="export-line">&lt;<span className="component">Bio</span> /&gt;</div>
              <div className="export-line">&lt;<span className="component">Experience</span> /&gt;</div>
              <div className="export-line">&lt;<span className="component">Education</span> /&gt;</div>
              <div className="export-line">&lt;<span className="component">Interests</span> /&gt;</div>
            </div>
            <div className="code-line"><span className="function-call">)</span>;</div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default About;
import React, { useEffect } from 'react';
import '../stylings/About.css';
import { motion } from 'framer-motion';
import { processPendingHighlight, injectHighlightStyles } from '../utils/highlightService';

const About = () => {
  // Experience data with dummy content
  const experiences = [
    {
      "role": "Full Stack Developer",
      "company": "Self-employed",
      "date": "2024 - Present",
      "description": "Full stack developer building robust applications and exploring AI-powered solutions. Skilled in both front-end and back-end technologies, with a strong foundation in software engineering and a growing focus on intelligent systems.",
      "technologies": [
        "Java", "JavaScript", "React", "Node.js", "MongoDB",
        "MySQL", "SQLite", "Python", "Flutter"
      ]
    },
  ];

  // Check for highlight requests when component mounts
  useEffect(() => {
    injectHighlightStyles();
    // Small delay to ensure DOM is ready
    setTimeout(() => {
      processPendingHighlight();
    }, 500);
  }, []);

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
            className="section-container bio-section"
            id="bio-section"
            data-section="about.bio"
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
            className="section-container experience-section"
            id="experience-timeline"
            data-section="about.experience"
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
            className="section-container education-section"
            id="education-section"
            data-section="about.education"
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
                <h3>Certificate in Programming Languages</h3>
                <p className="institution">St Nicholas College</p>
                <p className="edu-date">January 2023 - July 2023</p>
                <p className="specialization">C# Programming Language</p>
              </div>
            </div>
            <div className="code-line">&#125;;</div>
          </motion.div>

          <motion.div
            className="section-container interests-section"
            id="interests-container"
            data-section="about.interests"
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
            className="section-container journey-section"
            id="technical-journey"
            data-section="about.journey"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3 }}
          >
            <h2 className="section-title">
              <span className="keyword">const</span> <span className="variable">TechnicalJourney</span> = () =&gt; &#123;
            </h2>
            <div className="section-content">
              <div className="code-comment-block">
                <p>I began programming in 2022, and in that time, I've evolved from writing basic code to engineering intelligent systems.</p>
                <p>My strength lies in designing full-stack applications that go beyond functionality — I specialize in embedding machine learning to create software that's not only usable, but smart, intuitive, and impactful.</p>
                <p>With a solid foundation in Java, React, Spring Boot, and SQLite, I focus on making systems feel effortless and intelligent by integrating cloud and local AI services. Every line of code I write is driven by curiosity, continuous learning, and a desire to innovate through automation and intelligence.</p>
              </div>
            </div>
            <div className="code-line">&#125;;</div>
          </motion.div>

          <motion.div
            className="section-container philosophy-section"
            id="learning-philosophy"
            data-section="about.philosophy"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5 }}
          >
            <h2 className="section-title">
              <span className="keyword">const</span> <span className="variable">LearningPhilosophy</span> = () =&gt; &#123;
            </h2>
            <div className="section-content">
              <div className="code-comment-block">
                <p>I believe true growth comes from staying curious. I'm constantly building, exploring, and refining my craft.</p>
                <p>I hold a foundational certification in C# from a bootcamp that sparked my journey into tech, and since then, I've taught myself technologies like Flutter, JavaScript, React, and backend Java frameworks through hands-on projects and practice.</p>
                <p>While I'm confident in my ability to build and deliver, I continue sharpening my skills daily — from deepening my understanding of Java through LeetCode, to mastering the dynamics of neural networks in Python to truly grasp AI from the ground up.</p>
              </div>
              <div className="current-focus">
                <span className="keyword">const</span> <span className="variable">currentFocus</span> = <span className="string">"Neural Networks in Python"</span>;
              </div>
            </div>
            <div className="code-line">&#125;;</div>
          </motion.div>

          <motion.div
            className="section-container export-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.7 }}
          >
            <div className="code-line">
              <span className="keyword">export default</span> <span className="function-call">() =&gt; (</span>
            </div>
            <div className="export-content">
              <div className="export-line">&lt;<span className="component">Bio</span> /&gt;</div>
              <div className="export-line">&lt;<span className="component">Experience</span> /&gt;</div>
              <div className="export-line">&lt;<span className="component">Education</span> /&gt;</div>
              <div className="export-line">&lt;<span className="component">Interests</span> /&gt;</div>
              <div className="export-line">&lt;<span className="component">TechnicalJourney</span> /&gt;</div>
              <div className="export-line">&lt;<span className="component">LearningPhilosophy</span> /&gt;</div>
            </div>
            <div className="code-line"><span className="function-call">)</span>;</div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default About;
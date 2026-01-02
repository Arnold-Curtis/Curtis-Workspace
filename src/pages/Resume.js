import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import '../stylings/Resume.css';
import { submitResumeRequest } from '../utils/apiService';
import { processPendingHighlight, highlightSection, injectHighlightStyles } from '../utils/highlightService';

const Resume = () => {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    position: '',
    message: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Check for highlight requests when component mounts
  useEffect(() => {
    injectHighlightStyles();
    setTimeout(() => {
      processPendingHighlight();
    }, 500);

    // Listen for highlight events from AI link clicks
    const handleSectionHighlight = (event) => {
      const { sectionId } = event.detail;
      if (sectionId && sectionId.startsWith('resume.')) {
        console.log('Resume: Received highlight request for section:', sectionId);
        highlightSection(sectionId);
      }
    };

    document.addEventListener('ai-section-highlight', handleSectionHighlight);
    return () => {
      document.removeEventListener('ai-section-highlight', handleSectionHighlight);
    };
  }, []);

  const openResumeModal = () => {
    setShowModal(true);
  };

  const closeResumeModal = () => {
    setShowModal(false);
    // Reset form if closed without submitting successfully
    if (!isSubmitted) {
      setFormData({
        name: '',
        email: '',
        company: '',
        position: '',
        message: ''
      });
      setFormErrors({});
    }
    // Reset submission status when closing
    setIsSubmitted(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    // Clear error for this field when user types
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = "Name is required";
    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Email is invalid";
    }
    if (!formData.company.trim()) errors.company = "Company name is required";
    if (!formData.position.trim()) errors.position = "Position is required";

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    const errors = validateForm();

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);

    try {
      // Submit to backend API
      const result = await submitResumeRequest({
        name: formData.name,
        email: formData.email,
        company: formData.company,
        reason: `Position: ${formData.position}. ${formData.message || ''}`
      });

      if (result.success) {
        setIsSubmitted(true);
        setTimeout(() => {
          closeResumeModal();
        }, 3000);
      } else {
        // Fallback to localStorage if API fails
        const existingRequests = JSON.parse(localStorage.getItem('resumeRequests') || '[]');
        const newRequest = {
          ...formData,
          id: Date.now(),
          date: new Date().toISOString(),
          status: 'pending'
        };
        existingRequests.push(newRequest);
        localStorage.setItem('resumeRequests', JSON.stringify(existingRequests));

        setIsSubmitted(true);
        setTimeout(() => {
          closeResumeModal();
        }, 3000);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      // Fallback to localStorage on error
      const existingRequests = JSON.parse(localStorage.getItem('resumeRequests') || '[]');
      const newRequest = {
        ...formData,
        id: Date.now(),
        date: new Date().toISOString(),
        status: 'pending'
      };
      existingRequests.push(newRequest);
      localStorage.setItem('resumeRequests', JSON.stringify(existingRequests));

      setIsSubmitted(true);
      setTimeout(() => {
        closeResumeModal();
      }, 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="resume-page-container">
      {/* Modal overlay */}
      {showModal && (
        <div className="resume-modal-overlay" onClick={closeResumeModal}>
          <div
            className="resume-modal"
            onClick={(e) => e.stopPropagation()}
            id="resume-modal"
            data-section="resume.requestForm"
          >
            <div className="resume-modal-header">
              <h3>Request Official Resume</h3>
              <button className="modal-close" onClick={closeResumeModal}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            {!isSubmitted ? (
              <form className="resume-request-form" onSubmit={handleSubmit}>
                <p className="form-description">
                  Please provide your details to receive my official resume with verified certifications.
                  This helps me ensure my resume is shared with genuine opportunities.
                </p>

                <div className="form-group">
                  <label htmlFor="name">Name <span className="required">*</span></label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Your full name"
                    className={formErrors.name ? 'error' : ''}
                  />
                  {formErrors.name && <div className="error-message">{formErrors.name}</div>}
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email <span className="required">*</span></label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Your work email"
                    className={formErrors.email ? 'error' : ''}
                  />
                  {formErrors.email && <div className="error-message">{formErrors.email}</div>}
                </div>

                <div className="form-group">
                  <label htmlFor="company">Company <span className="required">*</span></label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    placeholder="Your company name"
                    className={formErrors.company ? 'error' : ''}
                  />
                  {formErrors.company && <div className="error-message">{formErrors.company}</div>}
                </div>

                <div className="form-group">
                  <label htmlFor="position">Position <span className="required">*</span></label>
                  <input
                    type="text"
                    id="position"
                    name="position"
                    value={formData.position}
                    onChange={handleInputChange}
                    placeholder="Your position at the company"
                    className={formErrors.position ? 'error' : ''}
                  />
                  {formErrors.position && <div className="error-message">{formErrors.position}</div>}
                </div>

                <div className="form-group">
                  <label htmlFor="message">Additional Information (Optional)</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Any specific information you'd like to know or why you're interested"
                    rows="3"
                  />
                </div>

                {formErrors.submit && <div className="error-message submit-error">{formErrors.submit}</div>}

                <button
                  type="submit"
                  className="resume-submit-button"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Sending Request...' : 'Submit Request'}
                </button>
              </form>
            ) : (
              <div className="success-message">
                <i className="fas fa-check-circle"></i>
                <h4>Request Submitted!</h4>
                <p>Thank you for your interest. I'll review your request and send my official resume to your email shortly.</p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="resume-header">
        <div className="file-tab">
          <i className="fas fa-file-alt tab-icon"></i>
          <span>Resume.js</span>
          <i className="fas fa-times close-icon"></i>
        </div>
      </div>

      <div className="resume-content">
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

        <div className="resume-main">
          <motion.div
            className="code-comment"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {`/**
 * Resume.js
 * 
 * This component displays Arnold Curtis's professional resume
 * including education, work experience, skills, and achievements.
 */`}
          </motion.div>

          {/* Resume Header Section */}
          <motion.div
            className="section-container header-section"
            id="resume-header"
            data-section="resume.header"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h2 className="section-title">
              <span className="keyword">const</span> <span className="variable">ResumeHeader</span> = () =&gt; &#123;
            </h2>
            <div className="resume-header-content">
              <div className="resume-name resume-title">Arnold Curtis</div>
              <div className="resume-title resume-subtitle">Full-Stack Engineer & Machine Learning Innovator</div>
              <div className="resume-contact-info">
                <div className="contact-item">
                  <i className="fas fa-envelope"></i> mbicidev@gmail.com
                </div>
                <div className="contact-item">
                  <i className="fas fa-phone"></i> +254723393075
                </div>
                <div className="contact-item resume-location">
                  <i className="fas fa-map-marker-alt"></i> Nairobi, Kenya
                </div>
                <div className="contact-item">
                  <i className="fab fa-linkedin"></i> linkedin.com/in/arnold-curtis
                </div>
                <div className="contact-item">
                  <i className="fab fa-github"></i> github.com/Arnold-Curtis
                </div>
              </div>
            </div>
            <div className="code-line">&#125;;</div>
          </motion.div>

          {/* Experience Section */}
          <motion.div
            className="section-container experience-section"
            id="resume-experience"
            data-section="resume.experience"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <h2 className="section-title">
              <span className="keyword">const</span> <span className="variable">Experience</span> = () =&gt; &#123;
            </h2>
            <div className="resume-section">
              <div className="resume-entry role-entry">
                <div className="entry-header">
                  <div className="position role-title">Full Stack Developer</div>
                  <div className="company-date company-period">
                    <span className="company">Self-employed</span>
                    <span className="date">2024 - Present</span>
                  </div>
                </div>
                <ul className="responsibilities">
                  <li className="achievement-item">Full stack developer building robust applications and exploring AI-powered solutions</li>
                  <li className="achievement-item">Developed the AI Personal Assistant (AIPA/PLANAZ) using React.js, Spring Boot, and Java</li>
                  <li className="achievement-item">Created a Natural Language Review System for academic evaluations using Java and NLP</li>
                  <li className="achievement-item">Skilled in both front-end and back-end technologies with a focus on intelligent systems</li>
                  <li className="achievement-item">Implemented database designs and optimized queries for MySQL, MongoDB and SQLite</li>
                </ul>
              </div>
            </div>
            <div className="code-line">&#125;;</div>
          </motion.div>

          {/* Education Section */}
          <motion.div
            className="section-container education-section"
            id="resume-education"
            data-section="resume.education"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <h2 className="section-title">
              <span className="keyword">const</span> <span className="variable">Education</span> = () =&gt; &#123;
            </h2>
            <div className="resume-section">
              <div className="resume-entry education-entry">
                <div className="entry-header">
                  <div className="degree">Bachelor of Business Information Technology</div>
                  <div className="school-date institution-period">
                    <span className="school">Strathmore University</span>
                    <span className="date">July 2024 - Present</span>
                  </div>
                </div>
              </div>

              <div className="resume-entry education-entry">
                <div className="entry-header">
                  <div className="degree">Certificate in Programming Languages</div>
                  <div className="school-date institution-period">
                    <span className="school">St Nicholas College</span>
                    <span className="date">January 2023 - July 2023</span>
                  </div>
                </div>
                <div className="specialization">Specialization: C# Programming Language</div>
              </div>
            </div>
            <div className="code-line">&#125;;</div>
          </motion.div>

          {/* Skills Section */}
          <motion.div
            className="section-container skills-section"
            id="resume-skills"
            data-section="resume.skills"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
          >
            <h2 className="section-title">
              <span className="keyword">const</span> <span className="variable">Skills</span> = () =&gt; &#123;
            </h2>
            <div className="resume-section">
              <div className="skills-category skill-category">
                <h3 className="category-name">Programming Languages</h3>
                <div className="skill-tags">
                  <span className="skill-tag advanced">JavaScript</span>
                  <span className="skill-tag advanced">Python</span>
                  <span className="skill-tag advanced">Java</span>
                  <span className="skill-tag intermediate">C#</span>
                  <span className="skill-tag intermediate">SQL</span>
                </div>
              </div>

              <div className="skills-category skill-category">
                <h3 className="category-name">Frontend Technologies</h3>
                <div className="skill-tags">
                  <span className="skill-tag advanced">React.js</span>
                  <span className="skill-tag intermediate">Flutter</span>
                  <span className="skill-tag advanced">HTML5/CSS3</span>
                  <span className="skill-tag intermediate">JavaFX</span>
                </div>
              </div>

              <div className="skills-category skill-category">
                <h3 className="category-name">Backend Technologies</h3>
                <div className="skill-tags">
                  <span className="skill-tag advanced">Node.js</span>
                  <span className="skill-tag advanced">Express</span>
                  <span className="skill-tag advanced">Spring Boot</span>
                  <span className="skill-tag intermediate">REST APIs</span>
                  <span className="skill-tag intermediate">JavaFX</span>
                </div>
              </div>

              <div className="skills-category skill-category">
                <h3 className="category-name">Databases & Storage</h3>
                <div className="skill-tags">
                  <span className="skill-tag advanced">MySQL</span>
                  <span className="skill-tag intermediate">MongoDB</span>
                  <span className="skill-tag advanced">SQLite</span>
                  <span className="skill-tag intermediate">PostgreSQL</span>
                </div>
              </div>

              <div className="skills-category skill-category">
                <h3 className="category-name">Machine Learning & AI</h3>
                <div className="skill-tags">
                  <span className="skill-tag advanced">TensorFlow</span>
                  <span className="skill-tag intermediate">PyTorch</span>
                  <span className="skill-tag advanced">NLP</span>
                  <span className="skill-tag intermediate">Large Language Models (LLMs)</span>
                </div>
              </div>

              <div className="skills-category skill-category">
                <h3 className="category-name">DevOps & Tools</h3>
                <div className="skill-tags">
                  <span className="skill-tag advanced">Git</span>
                  <span className="skill-tag advanced">GitHub</span>
                  <span className="skill-tag intermediate">Agile-Scrum</span>
                </div>
              </div>
            </div>
            <div className="code-line">&#125;;</div>
          </motion.div>

          {/* Projects Section */}
          <motion.div
            className="section-container"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3 }}
          >
            <h2 className="section-title">
              <span className="keyword">const</span> <span className="variable">Projects</span> = () =&gt; &#123;
            </h2>
            <div className="resume-section">
              <div className="resume-entry">
                <div className="entry-header">
                  <div className="position">AI Personal Assistant (AIPA/PLANAZ)</div>
                  <div className="company-date">
                    <span className="company"><a href="https://github.com/Arnold-Curtis/AI-Personal-Assistant" target="_blank" rel="noopener noreferrer">GitHub Repository</a></span>
                  </div>
                </div>
                <ul className="responsibilities">
                  <li>Developed an intelligent AI-powered personal assistant using React.js, Spring Boot, and Java</li>
                  <li>Implemented natural language processing capabilities using both cloud and local LLMs</li>
                  <li>Created a fully integrated calendar system with context-aware event scheduling</li>
                  <li>Built a smart planning function to break down goals into achievable tasks</li>
                </ul>
              </div>

              <div className="resume-entry">
                <div className="entry-header">
                  <div className="position">Natural Language Review System</div>
                  <div className="company-date">
                    <span className="company"><a href="https://github.com/Arnold-Curtis/NaturalLanguageReviewSystem" target="_blank" rel="noopener noreferrer">GitHub Repository</a></span>
                  </div>
                </div>
                <ul className="responsibilities">
                  <li>Created a Java-based desktop application using JavaFX and Scene Builder</li>
                  <li>Integrated NLP capabilities to analyze open-ended student feedback on academic evaluations</li>
                  <li>Developed a role-based access system for students, lecturers, and administrators</li>
                  <li>Implemented comprehensive performance reports with sentiment analysis</li>
                </ul>
              </div>
            </div>
            <div className="code-line">&#125;;</div>
          </motion.div>

          {/* Certifications Section */}
          <motion.div
            className="section-container"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5 }}
          >
            <h2 className="section-title">
              <span className="keyword">const</span> <span className="variable">Certifications</span> = () =&gt; &#123;
            </h2>
            <div className="resume-section">
              {/* <div className="resume-entry">
                <div className="entry-header">
                  <div className="certification">AWS Certified Solutions Architect</div>
                  <div className="cert-date">2023</div>
                </div>
              </div>
              
              <div className="resume-entry">
                <div className="entry-header">
                  <div className="certification">TensorFlow Developer Certificate</div>
                  <div className="cert-date">2022</div>
                </div>
              </div>
              
              <div className="resume-entry">
                <div className="entry-header">
                  <div className="certification">Oracle Certified Java Programmer</div>
                  <div className="cert-date">2019</div>
                </div>
              </div> */}
            </div>
            <div className="code-line">&#125;;</div>
          </motion.div>

          {/* Export Section */}
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
              <div className="export-line">&lt;<span className="component">ResumeHeader</span> /&gt;</div>
              <div className="export-line">&lt;<span className="component">Experience</span> /&gt;</div>
              <div className="export-line">&lt;<span className="component">Education</span> /&gt;</div>
              <div className="export-line">&lt;<span className="component">Skills</span> /&gt;</div>
              <div className="export-line">&lt;<span className="component">Projects</span> /&gt;</div>
              <div className="export-line">&lt;<span className="component">Certifications</span> /&gt;</div>
            </div>
            <div className="code-line"><span className="function-call">)</span>;</div>
          </motion.div>

          {/* Download Resume Button - REPLACED with Get Official Resume */}
          <motion.div
            className="resume-download"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.9 }}
          >
            <button type="button" className="download-button" onClick={openResumeModal}>
              <i className="fas fa-file-certificate"></i> Get Official Resume
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Resume;
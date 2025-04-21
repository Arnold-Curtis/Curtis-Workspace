import React, { useState } from 'react';
import '../stylings/Contact.css';
import { motion } from 'framer-motion';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    // Simulate form submission
    setTimeout(() => {
      // In a real app, you would send the data to a server here
      console.log('Form submitted:', formData);
      setSubmitting(false);
      setSubmitted(true);
      setFormData({ name: '', email: '', message: '' });
      
      // Reset the success message after 5 seconds
      setTimeout(() => {
        setSubmitted(false);
      }, 5000);
    }, 1500);
  };

  return (
    <div className="contact-page-container">
      <div className="contact-content">
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
        
        <div className="contact-main">
          <motion.div 
            className="code-comment"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {`/**
 * Contact.js
 * 
 * This component provides contact information and a form
 * for reaching out to Arnold Curtis.
 */`}
          </motion.div>
          
          <motion.div 
            className="section-container"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h2 className="section-title">
              <span className="keyword">const</span> <span className="variable">ContactInfo</span> = () =&gt; &#123;
            </h2>
            <div className="contact-info-grid">
              <div className="contact-card">
                <div className="contact-icon">
                  <i className="fas fa-envelope"></i>
                </div>
                <div className="contact-details">
                  <h3 className="contact-type">Email</h3>
                  <p className="contact-value">mbicidev@gmail.com</p>
                </div>
              </div>
              
              <div className="contact-card">
                <div className="contact-icon">
                  <i className="fas fa-phone-alt"></i>
                </div>
                <div className="contact-details">
                  <h3 className="contact-type">Phone</h3>
                  <p className="contact-value"> +254723393075 </p>
                </div>
              </div>
              
              <div className="contact-card">
                <div className="contact-icon">
                  <i className="fab fa-github"></i>
                </div>
                <div className="contact-details">
                  <h3 className="contact-type">GitHub</h3>
                  <a href="https://github.com/Arnold-Curtis" target="_blank" rel="noopener noreferrer" className="contact-value link">github.com/Arnold-Curtis</a>
                </div>
              </div>
              
              <div className="contact-card">
                <div className="contact-icon">
                  <i className="fab fa-linkedin"></i>
                </div>
                <div className="contact-details">
                  <h3 className="contact-type">LinkedIn</h3>
                  <a href="https://linkedin.com/in/arnold-curtis" target="_blank" rel="noopener noreferrer" className="contact-value link">linkedin.com/in/arnold-curtis</a>
                </div>
              </div>
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
              <span className="keyword">const</span> <span className="variable">ContactForm</span> = () =&gt; &#123;
            </h2>
            <div className="terminal-like-container">
              <div className="terminal-header">
                <span className="terminal-title">
                  <i className="fas fa-terminal"></i> message.send
                </span>
              </div>
              <div className="terminal-body">
                <div className="contact-form-wrapper">
                  <div className="get-in-touch">
                    <h2>Get in Touch</h2>
                    <p>
                      Have a project in mind or want to discuss potential opportunities? 
                      I'd love to hear from you! Fill out the form, and I'll get back to you as soon as possible.
                    </p>
                    <div className="response-time">
                      <i className="fas fa-clock"></i>
                      <span>Average response time: <strong>1 hour</strong></span>
                    </div>
                  </div>
                  
                  <form className="contact-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                      <label htmlFor="name">
                        <i className="fas fa-user"></i> Name
                      </label>
                      <input 
                        id="name"
                        name="name"
                        type="text" 
                        className="input-field" 
                        placeholder="Your Name" 
                        value={formData.name}
                        onChange={handleChange}
                        required 
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="email">
                        <i className="fas fa-envelope"></i> Email
                      </label>
                      <input 
                        id="email"
                        name="email"
                        type="email" 
                        className="input-field" 
                        placeholder="your.email@example.com" 
                        value={formData.email}
                        onChange={handleChange}
                        required 
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="message">
                        <i className="fas fa-comment-alt"></i> Message
                      </label>
                      <textarea 
                        id="message"
                        name="message"
                        className="input-field" 
                        placeholder="Your message here..." 
                        rows="5" 
                        value={formData.message}
                        onChange={handleChange}
                        required
                      ></textarea>
                    </div>
                    
                    <button 
                      type="submit" 
                      className={`submit-button ${submitting ? 'submitting' : ''}`}
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <i className="fas fa-spinner fa-spin"></i> Sending...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-paper-plane"></i> Submit
                        </>
                      )}
                    </button>
                    
                    {submitted && (
                      <div className="success-message">
                        <i className="fas fa-check-circle"></i>
                        <span>Your message has been sent successfully!</span>
                      </div>
                    )}
                    
                    {error && (
                      <div className="error-message">
                        <i className="fas fa-exclamation-circle"></i>
                        <span>{error}</span>
                      </div>
                    )}
                  </form>
                </div>
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
              <span className="keyword">const</span> <span className="variable">Availability</span> = () =&gt; &#123;
            </h2>
            <div className="availability-container">
              <div className="availability-header">
                <i className="fas fa-calendar-check"></i>
                <h3>Current Availability</h3>
              </div>
              <div className="status-indicators">
                <div className="status-item">
                  <span className="status-label">Status:</span>
                  <span className="status-value available">
                    <span className="status-dot"></span>
                    Available for Freelance
                  </span>
                </div>
                <div className="status-item">
                  <span className="status-label">Open to:</span>
                  <span className="status-value">Full-time, Contract, Remote</span>
                </div>
                <div className="status-item">
                  <span className="status-label">Preferred Contact:</span>
                  <span className="status-value">Email or Form Submission</span>
                </div>
              </div>
            </div>
            <div className="code-line">&#125;;</div>
          </motion.div>
          
          <motion.div 
            className="section-container export-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
          >
            <div className="code-line">
              <span className="keyword">export default</span> <span className="function-call">() =&gt; (</span>
            </div>
            <div className="export-content">
              <div className="export-line">&lt;<span className="component">ContactInfo</span> /&gt;</div>
              <div className="export-line">&lt;<span className="component">ContactForm</span> /&gt;</div>
              <div className="export-line">&lt;<span className="component">Availability</span> /&gt;</div>
            </div>
            <div className="code-line"><span className="function-call">)</span>;</div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Contact;

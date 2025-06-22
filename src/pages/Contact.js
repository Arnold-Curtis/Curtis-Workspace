import React, { useState, useEffect } from 'react';
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

    // Create submission object with timestamp
    const submissionData = {
      ...formData,
      timestamp: new Date().toISOString(),
      id: Date.now()
    };

    // Save to localStorage
    const savedSubmissions = JSON.parse(localStorage.getItem('contactSubmissions') || '[]');
    const updatedSubmissions = [submissionData, ...savedSubmissions];
    localStorage.setItem('contactSubmissions', JSON.stringify(updatedSubmissions));

    // Simulate form submission
    setTimeout(() => {
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
            data-line="51-60"
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
            data-line="1-20"
          >
            <h2 className="section-title">
              <span className="keyword">const</span> <span className="variable">ContactInfo</span> = () =&gt; &#123;
            </h2>
            <div className="contact-info-grid" id="contact-info-grid">
              <div className="contact-card">
                <div className="contact-icon">
                  <i className="fas fa-envelope"></i>
                </div>
                <div className="contact-details">
                  <h3 className="contact-type" data-line="1">Email</h3>
                  <p className="contact-value" data-line="2">mbicidev@gmail.com</p>
                </div>
              </div>
              
              <div className="contact-card">
                <div className="contact-icon">
                  <i className="fas fa-phone-alt"></i>
                </div>
                <div className="contact-details">
                  <h3 className="contact-type" data-line="4">Phone</h3>
                  <p className="contact-value" data-line="5"> +254723393075 </p>
                </div>
              </div>
              
              <div className="contact-card">
                <div className="contact-icon">
                  <i className="fab fa-github"></i>
                </div>
                <div className="contact-details">
                  <h3 className="contact-type" data-line="7">GitHub</h3>
                  <a href="https://github.com/Arnold-Curtis" target="_blank" rel="noopener noreferrer" className="contact-value link" data-line="8">github.com/Arnold-Curtis</a>
                </div>
              </div>
              
              <div className="contact-card">
                <div className="contact-icon">
                  <i className="fab fa-linkedin"></i>
                </div>
                <div className="contact-details">
                  <h3 className="contact-type" data-line="10">LinkedIn</h3>
                  <a href="https://linkedin.com/in/arnold-curtis" target="_blank" rel="noopener noreferrer" className="contact-value link" data-line="11">linkedin.com/in/arnold-curtis</a>
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
            data-line="21-50"
          >
            <h2 className="section-title">
              <span className="keyword">const</span> <span className="variable">ContactForm</span> = () =&gt; &#123;
            </h2>
            <div className="terminal-like-container">
              <div className="terminal-header" data-line="44">
                <span className="terminal-title">
                  <i className="fas fa-terminal"></i> message.send
                </span>
              </div>
              <div className="terminal-body">
                <div className="contact-form-wrapper" id="contact-form-wrapper">
                  <div className="get-in-touch">
                    <h2 data-line="21">Get in Touch</h2>
                    <p data-line="23-24">
                      Have a project in mind or want to discuss potential opportunities? 
                      I'd love to hear from you! Fill out the form, and I'll get back to you as soon as possible.
                    </p>
                    <div className="response-time" data-line="26">
                      <i className="fas fa-clock"></i>
                      <span>Average response time: <strong>1 hour</strong></span>
                    </div>
                  </div>
                  
                  <form className="contact-form" onSubmit={handleSubmit}>
                    <div className="form-group" data-line="28-29">
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
                    
                    <div className="form-group" data-line="31-32">
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
                    
                    <div className="form-group" data-line="34-35">
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
                      data-line="37"
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
                      <div className="success-message" data-line="39">
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
            className="section-container export-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <div className="code-line">
              <span className="keyword">export default</span> <span className="function-call">() =&gt; (</span>
            </div>
            <div className="export-content">
              <div className="export-line">&lt;<span className="component">ContactInfo</span> /&gt;</div>
              <div className="export-line">&lt;<span className="component">ContactForm</span> /&gt;</div>
            </div>
            <div className="code-line"><span className="function-call">)</span>;</div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Contact;

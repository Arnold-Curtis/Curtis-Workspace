import React, { useState, useEffect } from 'react';
import '../stylings/Guestbook.css';
import { motion } from 'framer-motion';
import { submitGuestbookEntry, getApprovedGuestbookEntries } from '../utils/apiService';

const Guestbook = () => {
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    message: ''
  });
  const [testimonials, setTestimonials] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  // Load testimonials on mount
  useEffect(() => {
    const loadTestimonials = async () => {
      try {
        const result = await getApprovedGuestbookEntries();
        if (result.success) {
          setTestimonials(result.data || []);
        }
      } catch (err) {
        console.error('Error loading testimonials:', err);
      }
    };
    loadTestimonials();
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const result = await submitGuestbookEntry({
        name: formData.name,
        message: formData.message,
        company: '',
        role: formData.role
      });

      if (result.success) {
        setSubmitted(true);
        setFormData({ name: '', role: '', message: '' });
        setTimeout(() => {
          setSubmitted(false);
        }, 5000);
      } else {
        setError('Failed to submit entry. Please try again.');
      }
    } catch (err) {
      console.error('Error submitting guestbook entry:', err);
      setError('Failed to submit entry. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="guestbook-page-container">
      <div className="guestbook-content">
        <motion.div
          className="code-line-numbers"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {Array.from({ length: 100 }, (_, i) => (
            <div key={i} className="line-number">{i + 1}</div>
          ))}
        </motion.div>

        <div className="guestbook-main">
          <motion.div
            className="code-comment"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {`/**
 * Guestbook.js
 *
 * A place for visitors to leave feedback, testimonials,
 * or just say hello. All submissions are moderated.
 */`}
          </motion.div>

          <motion.div
            className="section-container"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h2 className="section-title">
              <span className="keyword">const</span> <span className="variable">LeaveMessage</span> = () =&gt; &#123;
            </h2>

            <div className="terminal-like-container">
              <div className="terminal-header">
                <span className="terminal-title">
                  <i className="fas fa-terminal"></i> guestbook.write
                </span>
              </div>
              <div className="terminal-body">
                <div className="guestbook-form-wrapper">
                  <div className="guestbook-intro">
                    <h2>Sign the Guestbook</h2>
                    <p>
                      Worked with me? Found my content helpful? Or just want to leave a note?
                      I'd love to hear from you. Your message will appear below after approval.
                    </p>
                  </div>

                  <form className="guestbook-form" onSubmit={handleSubmit}>
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
                      <label htmlFor="role">
                        <i className="fas fa-briefcase"></i> Role / Relation (Optional)
                      </label>
                      <input
                        id="role"
                        name="role"
                        type="text"
                        className="input-field"
                        placeholder="e.g. Client, Developer, Recruiter"
                        value={formData.role}
                        onChange={handleChange}
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
                        placeholder="Share your thoughts..."
                        rows="4"
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
                          <i className="fas fa-spinner fa-spin"></i> Submitting...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-paper-plane"></i> Sign Guestbook
                        </>
                      )}
                    </button>

                    {submitted && (
                      <div className="success-message">
                        <i className="fas fa-check-circle"></i>
                        <span>Thanks! Your message has been submitted for review.</span>
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
            transition={{ delay: 0.7 }}
          >
            <h2 className="section-title">
              <span className="keyword">const</span> <span className="variable">CommunityVoices</span> = () =&gt; &#123;
            </h2>

            <div className="testimonials-list">
              {testimonials.length > 0 ? (
                <div className="testimonials-grid">
                  {testimonials.map((entry) => (
                    <div key={entry.id} className="testimonial-card">
                      <div className="testimonial-header">
                        <div className="testimonial-avatar">
                          {entry.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="testimonial-info">
                          <h4>{entry.name}</h4>
                          {entry.role && <p className="testimonial-role">{entry.role}</p>}
                        </div>
                      </div>
                      <div className="testimonial-body">
                        {entry.message}
                      </div>
                      <div className="testimonial-date">
                        {new Date(entry.timestamp).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-testimonials">
                  <i className="fas fa-comments"></i>
                  <p>No testimonials yet. Be the first to write one!</p>
                </div>
              )}
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
              <div className="export-line">&lt;<span className="component">LeaveMessage</span> /&gt;</div>
              <div className="export-line">&lt;<span className="component">CommunityVoices</span> /&gt;</div>
            </div>
            <div className="code-line"><span className="function-call">)</span>;</div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Guestbook;

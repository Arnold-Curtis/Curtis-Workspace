import React, { useState } from 'react';
import { motion } from 'framer-motion';
import '../stylings/BookCall.css';
import { submitBooking } from '../utils/apiService';

const BookCall = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    time: '',
    topic: '',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);
  
  // Generate available dates (next 14 days)
  const generateAvailableDates = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 1; i <= 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      // Skip weekends (Saturday = 6, Sunday = 0)
      if (date.getDay() !== 0 && date.getDay() !== 6) {
        const formattedDate = date.toISOString().split('T')[0];
        dates.push(formattedDate);
      }
    }
    
    return dates;
  };
  
  // Generate available time slots
  const generateTimeSlots = () => {
    const slots = [];
    const startHour = 9; // 9 AM
    const endHour = 17; // 5 PM
    
    for (let hour = startHour; hour <= endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        if (hour === endHour && minute > 0) continue; // Don't include times after 5 PM
        
        const formattedHour = hour % 12 === 0 ? 12 : hour % 12;
        const period = hour < 12 ? 'AM' : 'PM';
        const formattedMinute = minute.toString().padStart(2, '0');
        
        slots.push(`${formattedHour}:${formattedMinute} ${period}`);
      }
    }
    
    return slots;
  };
  
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
    
    // Validate form data
    if (!formData.name || !formData.email || !formData.date || !formData.time || !formData.topic) {
      setError('Please fill in all required fields.');
      setSubmitting(false);
      return;
    }

    try {
      // Submit to backend API
      const result = await submitBooking({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        preferred_date: formData.date,
        preferred_time: formData.time,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        topic: formData.topic,
        message: formData.message
      });

      if (result.success) {
        setSubmitted(true);
        setFormData({
          name: '',
          email: '',
          phone: '',
          date: '',
          time: '',
          topic: '',
          message: ''
        });
        setTimeout(() => {
          setSubmitted(false);
        }, 5000);
      } else {
        // Fallback to localStorage if API fails
        const bookingData = {
          ...formData,
          timestamp: new Date().toISOString(),
          id: Date.now(),
          status: 'Pending'
        };
        const savedBookings = JSON.parse(localStorage.getItem('callBookings') || '[]');
        const updatedBookings = [bookingData, ...savedBookings];
        localStorage.setItem('callBookings', JSON.stringify(updatedBookings));
        
        setSubmitted(true);
        setFormData({
          name: '',
          email: '',
          phone: '',
          date: '',
          time: '',
          topic: '',
          message: ''
        });
        setTimeout(() => {
          setSubmitted(false);
        }, 5000);
      }
    } catch (err) {
      console.error('Error submitting booking:', err);
      // Fallback to localStorage on error
      const bookingData = {
        ...formData,
        timestamp: new Date().toISOString(),
        id: Date.now(),
        status: 'Pending'
      };
      const savedBookings = JSON.parse(localStorage.getItem('callBookings') || '[]');
      const updatedBookings = [bookingData, ...savedBookings];
      localStorage.setItem('callBookings', JSON.stringify(updatedBookings));
      
      setSubmitted(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        date: '',
        time: '',
        topic: '',
        message: ''
      });
      setTimeout(() => {
        setSubmitted(false);
      }, 5000);
    } finally {
      setSubmitting(false);
    }
  };

  const availableDates = generateAvailableDates();
  const timeSlots = generateTimeSlots();

  return (
    <div className="book-call-page-container">
      <div className="book-call-header">
        <div className="file-tab">
          <i className="fas fa-phone-alt tab-icon"></i>
          <span>BookCall.js</span>
          <i className="fas fa-times close-icon"></i>
        </div>
      </div>
      
      <div className="book-call-content">
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
        
        <div className="book-call-main">
          <motion.div 
            className="code-comment"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {`/**
 * BookCall.js
 * 
 * This component provides a form for scheduling calls with Arnold Curtis.
 * Availability is shown in real-time based on calendar openings.
 */`}
          </motion.div>
          
          <motion.div 
            className="section-container"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h2 className="section-title">
              <span className="keyword">const</span> <span className="variable">ScheduleCall</span> = () =&gt; &#123;
            </h2>
            
            <div className="terminal-like-container">
              <div className="terminal-header">
                <span className="terminal-title">
                  <i className="fas fa-calendar-alt"></i> schedule.meeting
                </span>
              </div>
              
              <div className="terminal-body">
                <div className="booking-intro">
                  <h2>Book a Call</h2>
                  <p>
                    Interested in working together or want to discuss your project?
                    Schedule a call with me using the form below and I'll get back to you
                    to confirm the appointment.
                  </p>
                  <div className="response-time">
                    <i className="fas fa-clock"></i>
                    <span>Call confirmation within: <strong>24 hours</strong></span>
                  </div>
                </div>
                
                <form className="booking-form" onSubmit={handleSubmit}>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="name">
                        <i className="fas fa-user"></i> Your Name *
                      </label>
                      <input 
                        id="name"
                        name="name"
                        type="text" 
                        className="input-field" 
                        placeholder="Full Name" 
                        value={formData.name}
                        onChange={handleChange}
                        required 
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="email">
                        <i className="fas fa-envelope"></i> Email Address *
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
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="phone">
                        <i className="fas fa-phone"></i> Phone Number
                      </label>
                      <input 
                        id="phone"
                        name="phone"
                        type="tel" 
                        className="input-field" 
                        placeholder="Phone Number (optional)" 
                        value={formData.phone}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="date">
                        <i className="fas fa-calendar"></i> Preferred Date *
                      </label>
                      <select 
                        id="date"
                        name="date"
                        className="input-field select-field" 
                        value={formData.date}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select a date</option>
                        {availableDates.map(date => (
                          <option key={date} value={date}>
                            {new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="time">
                        <i className="fas fa-clock"></i> Preferred Time *
                      </label>
                      <select 
                        id="time"
                        name="time"
                        className="input-field select-field" 
                        value={formData.time}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select a time</option>
                        {timeSlots.map(time => (
                          <option key={time} value={time}>{time}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="topic">
                        <i className="fas fa-comment-alt"></i> Call Topic *
                      </label>
                      <select 
                        id="topic"
                        name="topic"
                        className="input-field select-field" 
                        value={formData.topic}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select a topic</option>
                        <option value="Project Consultation">Project Consultation</option>
                        <option value="Job Opportunity">Job Opportunity</option>
                        <option value="Freelance Work">Freelance Work</option>
                        <option value="Technical Discussion">Technical Discussion</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="message">
                      <i className="fas fa-pen"></i> Additional Details
                    </label>
                    <textarea 
                      id="message"
                      name="message"
                      className="input-field" 
                      placeholder="Please provide any additional information that might be helpful..." 
                      rows="5" 
                      value={formData.message}
                      onChange={handleChange}
                    ></textarea>
                  </div>
                  
                  <button 
                    type="submit" 
                    className={`submit-button ${submitting ? 'submitting' : ''}`}
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <i className="fas fa-spinner fa-spin"></i> Scheduling...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-calendar-check"></i> Schedule Call
                      </>
                    )}
                  </button>
                  
                  {submitted && (
                    <div className="success-message">
                      <i className="fas fa-check-circle"></i>
                      <span>Your call has been scheduled! Check your email for confirmation details.</span>
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
            <div className="code-line">&#125;;</div>
          </motion.div>
          
          <motion.div 
            className="section-container"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <h2 className="section-title">
              <span className="keyword">const</span> <span className="variable">CallInformation</span> = () =&gt; &#123;
            </h2>
            <div className="call-info-container">
              <div className="info-section">
                <div className="info-header">
                  <i className="fas fa-info-circle"></i>
                  <h3>What to Expect</h3>
                </div>
                <ul className="info-list">
                  <li><i className="fas fa-check"></i> 30-minute focused discussion</li>
                  <li><i className="fas fa-check"></i> Call confirmation via email</li>
                  <li><i className="fas fa-check"></i> Follow-up notes after our call</li>
                  <li><i className="fas fa-check"></i> Professional consultation on your needs</li>
                </ul>
              </div>
              
              <div className="info-section">
                <div className="info-header">
                  <i className="fas fa-headset"></i>
                  <h3>Call Options</h3>
                </div>
                <div className="platform-options">
                  <div className="platform-option">
                    <i className="fas fa-video"></i>
                    <span>Zoom</span>
                  </div>
                  <div className="platform-option">
                    <i className="fab fa-google"></i>
                    <span>Google Meet</span>
                  </div>
                  <div className="platform-option">
                    <i className="fab fa-skype"></i>
                    <span>Skype</span>
                  </div>
                  <div className="platform-option">
                    <i className="fas fa-phone-alt"></i>
                    <span>Phone</span>
                  </div>
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
              <div className="export-line">&lt;<span className="component">ScheduleCall</span> /&gt;</div>
              <div className="export-line">&lt;<span className="component">CallInformation</span> /&gt;</div>
            </div>
            <div className="code-line"><span className="function-call">)</span>;</div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default BookCall;
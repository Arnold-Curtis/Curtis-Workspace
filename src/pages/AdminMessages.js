import React, { useState, useEffect } from 'react';
import '../stylings/AdminMessages.css';

const AdminMessages = () => {
  const [submissions, setSubmissions] = useState([]);
  const [callBookings, setCallBookings] = useState([]);
  const [resumeRequests, setResumeRequests] = useState([]);
  const [guestbookEntries, setGuestbookEntries] = useState([]);
  const [accessGranted, setAccessGranted] = useState(false);
  const [accessCode, setAccessCode] = useState('');
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('messages');
  const [showCallDetails, setShowCallDetails] = useState(null);
  const [showRequestDetails, setShowRequestDetails] = useState(null);

  // Load data from API
  const fetchData = async () => {
    try {
        const contactsRes = await fetch('/api/contacts');
        if (contactsRes.ok) setSubmissions(await contactsRes.json());

        const bookingsRes = await fetch('/api/bookings');
        if (bookingsRes.ok) setCallBookings(await bookingsRes.json());

        const guestbookRes = await fetch('/api/admin/guestbook');
        if (guestbookRes.ok) setGuestbookEntries(await guestbookRes.json());

        // Resume requests might not be implemented in backend yet based on instructions,
        // but let's keep it for now as empty or fetch if exists.
        // The instructions didn't explicitly ask for resume requests API, but they are in the component.
        // I will assume for now they are not refactored or part of the requirement to be refactored fully
        // OR I should use localStorage for them if not in scope?
        // The prompt says: "Refactor the current client-side React application into a monolithic Node.js application ... The goal is to replace the current localStorage implementation with a shared database"
        // But only specified endpoints for contacts, bookings, and guestbook.
        // I'll leave resume requests as is (localStorage) or empty if not critical, or better,
        // I'll check if I should persist them. The prompt says "Refactor the current client-side React application...".
        // However, I only created tables for contacts, bookings, and guestbook_entries.
        // I will keep resume requests on localStorage for now to avoid breaking it completely, or just empty if not used.
        // Wait, "Resume.js" is in pages, maybe it uses localStorage too.
        // Let's check if I missed Resume requests in the plan.
        // The prompt only listed API routes for contacts, bookings, guestbook.
        // So I will only fetch what is available.

        const savedResumeRequests = localStorage.getItem('resumeRequests');
        if (savedResumeRequests) {
            setResumeRequests(JSON.parse(savedResumeRequests));
        }
    } catch (err) {
        console.error("Error fetching data", err);
    }
  };

  useEffect(() => {
    if (accessGranted) {
        fetchData();
    }
  }, [accessGranted]);

  // Handle code verification
  const verifyAccessCode = (e) => {
    e.preventDefault();
    // Updated secret access code
    if (accessCode === 'Curtis12@12') {
      setAccessGranted(true);
      setError(null);
    } else {
      setError('Access denied');
      setTimeout(() => setError(null), 3000);
    }
  };

  // Download submissions as JSON file
  const downloadSubmissions = () => {
    const dataStr = JSON.stringify(submissions, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `contact_submissions_${new Date().toLocaleDateString().replace(/\//g, '-')}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  // Clear all submissions
  const clearSubmissions = async () => {
    if (window.confirm('Are you sure you want to delete all submissions? This action cannot be undone.')) {
      try {
          const res = await fetch('/api/admin/contacts', { method: 'DELETE' });
          if (res.ok) {
              setSubmissions([]);
          } else {
              alert("Failed to delete contacts");
          }
      } catch (err) {
          console.error(err);
      }
    }
  };
  
  // Download call bookings as JSON file
  const downloadBookings = () => {
    const dataStr = JSON.stringify(callBookings, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `call_bookings_${new Date().toLocaleDateString().replace(/\//g, '-')}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  // Download resume requests as JSON file
  const downloadResumeRequests = () => {
    const dataStr = JSON.stringify(resumeRequests, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `resume_requests_${new Date().toLocaleDateString().replace(/\//g, '-')}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  // Clear all call bookings
  const clearBookings = async () => {
    if (window.confirm('Are you sure you want to delete all call bookings? This action cannot be undone.')) {
        try {
            const res = await fetch('/api/admin/bookings', { method: 'DELETE' });
            if (res.ok) {
                setCallBookings([]);
            } else {
                alert("Failed to delete bookings");
            }
        } catch (err) {
            console.error(err);
        }
    }
  };
  
  // Clear all resume requests
  const clearResumeRequests = () => {
    if (window.confirm('Are you sure you want to delete all resume requests? This action cannot be undone.')) {
      localStorage.setItem('resumeRequests', '[]');
      setResumeRequests([]);
    }
  };

  // Clear all guestbook entries
  const clearGuestbookEntries = async () => {
    if (window.confirm('Are you sure you want to delete all guestbook entries? This action cannot be undone.')) {
        try {
            const res = await fetch('/api/admin/guestbook', { method: 'DELETE' });
            if (res.ok) {
                setGuestbookEntries([]);
            } else {
                alert("Failed to delete guestbook entries");
            }
        } catch (err) {
            console.error(err);
        }
    }
  };
  
  // Update call status
  const updateCallStatus = async (id, newStatus) => {
    try {
        const res = await fetch(`/api/bookings/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });

        if (res.ok) {
            const updatedBookings = callBookings.map(booking => {
              if (booking.id === id) {
                return { ...booking, status: newStatus };
              }
              return booking;
            });
            setCallBookings(updatedBookings);
        }
    } catch (err) {
        console.error(err);
    }
  };
  
  // Update resume request status
  const updateResumeStatus = (id, newStatus) => {
    const updatedRequests = resumeRequests.map(request => {
      if (request.id === id) {
        return { ...request, status: newStatus };
      }
      return request;
    });
    
    localStorage.setItem('resumeRequests', JSON.stringify(updatedRequests));
    setResumeRequests(updatedRequests);
  };

  // Update guestbook entry status
  const updateGuestbookStatus = async (id, newStatus) => {
    try {
        const res = await fetch(`/api/admin/guestbook/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });

        if (res.ok) {
            const updatedEntries = guestbookEntries.map(entry => {
              if (entry.id === id) {
                return { ...entry, status: newStatus };
              }
              return entry;
            });
            setGuestbookEntries(updatedEntries);
        }
    } catch (err) {
        console.error(err);
    }
  };
  
  // Delete a specific call booking
  const deleteCallBooking = async (id) => {
    if (window.confirm('Are you sure you want to delete this booking?')) {
        try {
            const res = await fetch(`/api/bookings/${id}`, { method: 'DELETE' });
            if (res.ok) {
                const updatedBookings = callBookings.filter(booking => booking.id !== id);
                setCallBookings(updatedBookings);
                if (showCallDetails === id) {
                  setShowCallDetails(null);
                }
            }
        } catch (err) {
            console.error(err);
        }
    }
  };
  
  // Delete a specific resume request
  const deleteResumeRequest = (id) => {
    if (window.confirm('Are you sure you want to delete this resume request?')) {
      const updatedRequests = resumeRequests.filter(request => request.id !== id);
      localStorage.setItem('resumeRequests', JSON.stringify(updatedRequests));
      setResumeRequests(updatedRequests);
      
      if (showRequestDetails === id) {
        setShowRequestDetails(null);
      }
    }
  };

  // Delete a specific guestbook entry
  const deleteGuestbookEntry = async (id) => {
    if (window.confirm('Are you sure you want to delete this guestbook entry?')) {
        try {
            const res = await fetch(`/api/admin/guestbook/${id}`, { method: 'DELETE' });
            if (res.ok) {
                const updatedEntries = guestbookEntries.filter(entry => entry.id !== id);
                setGuestbookEntries(updatedEntries);
            }
        } catch (err) {
            console.error(err);
        }
    }
  };
  
  // View call details
  const toggleCallDetails = (id) => {
    if (showCallDetails === id) {
      setShowCallDetails(null);
    } else {
      setShowCallDetails(id);
    }
  };
  
  // View resume request details
  const toggleRequestDetails = (id) => {
    if (showRequestDetails === id) {
      setShowRequestDetails(null);
    } else {
      setShowRequestDetails(id);
    }
  };
  
  // Get status class for styling
  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
      case 'approved':
        return 'status-confirmed';
      case 'completed':
      case 'sent':
        return 'status-completed';
      case 'cancelled':
      case 'rejected':
        return 'status-cancelled';
      default:
        return 'status-pending';
    }
  };

  // Handle sending resume
  const handleSendResume = (request) => {
    // In a real implementation, you would integrate with an email service
    // For now, just open a mail client with pre-filled details
    const subject = encodeURIComponent('Your Requested Resume - Arnold Curtis');
    const body = encodeURIComponent(
      `Dear ${request.name},\n\n` +
      `Thank you for your interest in my professional profile. As requested, please find attached my official resume with verified certifications.\n\n` +
      `If you have any questions or would like to discuss potential opportunities, please don't hesitate to contact me.\n\n` +
      `Best regards,\nArnold Curtis`
    );
    
    window.open(`mailto:${request.email}?subject=${subject}&body=${body}`);
    updateResumeStatus(request.id, 'sent');
  };

  return (
    <div className="admin-page-container">
      {!accessGranted ? (
        <div className="admin-login-container">
          <div className="admin-login-card">
            <h2>Restricted Access</h2>
            <p>This page is restricted to administrators only.</p>
            
            <form onSubmit={verifyAccessCode} className="admin-login-form">
              <div className="admin-form-group">
                <label htmlFor="accessCode">Access Code</label>
                <input 
                  id="accessCode"
                  type="password" 
                  className="admin-input-field" 
                  placeholder="Enter access code" 
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  required 
                />
              </div>
              
              {error && (
                <div className="admin-error-message">
                  {error}
                </div>
              )}
              
              <button type="submit" className="admin-button">
                Access Dashboard
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="admin-content">
          <div className="admin-tabs">
            <button 
              className={`admin-tab ${activeTab === 'messages' ? 'active' : ''}`}
              onClick={() => setActiveTab('messages')}
            >
              <i className="fas fa-envelope"></i> Contact Messages
              <span className="tab-counter">{submissions.length}</span>
            </button>
            <button 
              className={`admin-tab ${activeTab === 'calls' ? 'active' : ''}`}
              onClick={() => setActiveTab('calls')}
            >
              <i className="fas fa-phone-alt"></i> Call Bookings
              <span className="tab-counter">{callBookings.length}</span>
            </button>
            <button 
              className={`admin-tab ${activeTab === 'resumes' ? 'active' : ''}`}
              onClick={() => setActiveTab('resumes')}
            >
              <i className="fas fa-file-alt"></i> Resume Requests
              <span className="tab-counter">{resumeRequests.length}</span>
            </button>
            <button
              className={`admin-tab ${activeTab === 'guestbook' ? 'active' : ''}`}
              onClick={() => setActiveTab('guestbook')}
            >
              <i className="fas fa-comments"></i> Guestbook
              <span className="tab-counter">{guestbookEntries.length}</span>
            </button>
          </div>
          
          {activeTab === 'messages' && (
            <>
              <div className="admin-header">
                <h1>Contact Form Submissions</h1>
                <div className="admin-actions">
                  <button 
                    onClick={downloadSubmissions} 
                    className="admin-button download-button"
                    disabled={submissions.length === 0}
                  >
                    <i className="fas fa-download"></i> Export to JSON
                  </button>
                  <button 
                    onClick={clearSubmissions} 
                    className="admin-button delete-button"
                    disabled={submissions.length === 0}
                  >
                    <i className="fas fa-trash-alt"></i> Clear All
                  </button>
                </div>
              </div>
              
              {submissions.length > 0 ? (
                <div className="submissions-table-container">
                  <table className="submissions-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Message</th>
                      </tr>
                    </thead>
                    <tbody>
                      {submissions.map((submission) => (
                        <tr key={submission.id}>
                          <td>
                            {new Date(submission.timestamp).toLocaleDateString()} <br />
                            <span className="time-text">
                              {new Date(submission.timestamp).toLocaleTimeString()}
                            </span>
                          </td>
                          <td>{submission.name}</td>
                          <td>
                            <a href={`mailto:${submission.email}`} className="email-link">
                              {submission.email}
                            </a>
                          </td>
                          <td className="message-cell">{submission.message}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="no-submissions-message">
                  <i className="fas fa-inbox"></i>
                  <p>No contact form submissions yet</p>
                </div>
              )}
            </>
          )}

          {activeTab === 'guestbook' && (
            <>
              <div className="admin-header">
                <h1>Guestbook Entries</h1>
                <div className="admin-actions">
                  <button
                    onClick={clearGuestbookEntries}
                    className="admin-button delete-button"
                    disabled={guestbookEntries.length === 0}
                  >
                    <i className="fas fa-trash-alt"></i> Clear All
                  </button>
                </div>
              </div>

              {guestbookEntries.length > 0 ? (
                <div className="resume-requests-container">
                  {guestbookEntries.map((entry) => (
                    <div key={entry.id} className="request-card">
                      <div className="request-header">
                        <div className="request-info">
                          <h3>{entry.name}</h3>
                          {entry.role && <p className="company-position">{entry.role}</p>}
                        </div>
                        <div className={`request-status ${getStatusClass(entry.status)}`}>
                          <i className="fas fa-circle status-indicator"></i>
                          {entry.status ? entry.status.charAt(0).toUpperCase() + entry.status.slice(1) : 'Pending'}
                        </div>
                      </div>

                      <div className="request-contact">
                        <div className="contact-item">
                          <i className="fas fa-calendar"></i>
                          <span>{new Date(entry.timestamp).toLocaleDateString()} at {new Date(entry.timestamp).toLocaleTimeString()}</span>
                        </div>
                      </div>

                      <div className="request-details" style={{display: 'block', margin: '15px 0'}}>
                        <div className="details-content">
                          <p>{entry.message}</p>
                        </div>
                      </div>

                      <div className="request-actions">
                        <div className="status-actions">
                          <button
                            className={`status-button approve-button ${entry.status === 'approved' ? 'active' : ''}`}
                            onClick={() => updateGuestbookStatus(entry.id, 'approved')}
                            disabled={entry.status === 'approved'}
                          >
                            <i className="fas fa-check"></i>
                            Approve
                          </button>
                          <button
                            className={`status-button reject-button ${entry.status === 'rejected' ? 'active' : ''}`}
                            onClick={() => updateGuestbookStatus(entry.id, 'rejected')}
                            disabled={entry.status === 'rejected'}
                          >
                            <i className="fas fa-times"></i>
                            Reject
                          </button>
                        </div>

                        <button
                          className="action-button delete-button"
                          onClick={() => deleteGuestbookEntry(entry.id)}
                        >
                          <i className="fas fa-trash"></i>
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-submissions-message">
                  <i className="fas fa-comments"></i>
                  <p>No guestbook entries yet</p>
                </div>
              )}
            </>
          )}
          
          {activeTab === 'calls' && (
            <>
              <div className="admin-header">
                <h1>Call Bookings</h1>
                <div className="admin-actions">
                  <button 
                    onClick={downloadBookings} 
                    className="admin-button download-button"
                    disabled={callBookings.length === 0}
                  >
                    <i className="fas fa-download"></i> Export to JSON
                  </button>
                  <button 
                    onClick={clearBookings} 
                    className="admin-button delete-button"
                    disabled={callBookings.length === 0}
                  >
                    <i className="fas fa-trash-alt"></i> Clear All
                  </button>
                </div>
              </div>
              
              {callBookings.length > 0 ? (
                <div className="call-bookings-container">
                  {callBookings.map((booking) => (
                    <div key={booking.id} className="booking-card">
                      <div className="booking-header">
                        <div className="booking-date">
                          <i className="fas fa-calendar-alt"></i>
                          <span>{new Date(booking.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
                          <span className="booking-time">{booking.time}</span>
                        </div>
                        <div className={`booking-status ${getStatusClass(booking.status)}`}>
                          <i className="fas fa-circle status-indicator"></i>
                          {booking.status}
                        </div>
                      </div>
                      
                      <div className="booking-info">
                        <div className="contact-info">
                          <div className="info-row">
                            <i className="fas fa-user"></i>
                            <span>{booking.name}</span>
                          </div>
                          <div className="info-row">
                            <i className="fas fa-envelope"></i>
                            <a href={`mailto:${booking.email}`}>{booking.email}</a>
                          </div>
                          {booking.phone && (
                            <div className="info-row">
                              <i className="fas fa-phone"></i>
                              <a href={`tel:${booking.phone}`}>{booking.phone}</a>
                            </div>
                          )}
                        </div>
                        
                        <div className="topic-info">
                          <div className="topic-badge">{booking.topic}</div>
                        </div>
                      </div>
                      
                      <div className="booking-actions">
                        <button 
                          className="action-button details-button"
                          onClick={() => toggleCallDetails(booking.id)}
                        >
                          <i className={`fas ${showCallDetails === booking.id ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i>
                          {showCallDetails === booking.id ? 'Hide Details' : 'Show Details'} 
                        </button>
                        
                        <div className="status-actions">
                          <button 
                            className={`status-button confirm-button ${booking.status === 'Confirmed' ? 'active' : ''}`}
                            onClick={() => updateCallStatus(booking.id, 'Confirmed')}
                            disabled={booking.status === 'Confirmed'}
                          >
                            <i className="fas fa-check"></i>
                            Confirm
                          </button>
                          <button 
                            className={`status-button complete-button ${booking.status === 'Completed' ? 'active' : ''}`}
                            onClick={() => updateCallStatus(booking.id, 'Completed')}
                            disabled={booking.status === 'Completed'}
                          >
                            <i className="fas fa-check-double"></i>
                            Complete
                          </button>
                          <button 
                            className={`status-button cancel-button ${booking.status === 'Cancelled' ? 'active' : ''}`}
                            onClick={() => updateCallStatus(booking.id, 'Cancelled')}
                            disabled={booking.status === 'Cancelled'}
                          >
                            <i className="fas fa-times"></i>
                            Cancel
                          </button>
                        </div>
                        
                        <button 
                          className="action-button delete-button"
                          onClick={() => deleteCallBooking(booking.id)}
                        >
                          <i className="fas fa-trash"></i>
                          Delete
                        </button>
                      </div>
                      
                      {showCallDetails === booking.id && (
                        <div className="booking-details">
                          <div className="details-header">Additional Information</div>
                          <div className="details-content">
                            {booking.message ? (
                              <p>{booking.message}</p>
                            ) : (
                              <p className="no-details">No additional details provided.</p>
                            )}
                          </div>
                          <div className="details-footer">
                            <span className="booking-timestamp">
                              Booked on: {new Date(booking.timestamp).toLocaleDateString()} at {new Date(booking.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-submissions-message">
                  <i className="fas fa-calendar-alt"></i>
                  <p>No call bookings yet</p>
                </div>
              )}
            </>
          )}
          
          {activeTab === 'resumes' && (
            <>
              <div className="admin-header">
                <h1>Resume Requests</h1>
                <div className="admin-actions">
                  <button 
                    onClick={downloadResumeRequests} 
                    className="admin-button download-button"
                    disabled={resumeRequests.length === 0}
                  >
                    <i className="fas fa-download"></i> Export to JSON
                  </button>
                  <button 
                    onClick={clearResumeRequests} 
                    className="admin-button delete-button"
                    disabled={resumeRequests.length === 0}
                  >
                    <i className="fas fa-trash-alt"></i> Clear All
                  </button>
                </div>
              </div>
              
              {resumeRequests.length > 0 ? (
                <div className="resume-requests-container">
                  {resumeRequests.map((request) => (
                    <div key={request.id} className="request-card">
                      <div className="request-header">
                        <div className="request-info">
                          <h3>{request.name}</h3>
                          <p className="company-position">{request.position} at {request.company}</p>
                        </div>
                        <div className={`request-status ${getStatusClass(request.status)}`}>
                          <i className="fas fa-circle status-indicator"></i>
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </div>
                      </div>
                      
                      <div className="request-contact">
                        <div className="contact-item">
                          <i className="fas fa-envelope"></i>
                          <a href={`mailto:${request.email}`}>{request.email}</a>
                        </div>
                        <div className="contact-item">
                          <i className="fas fa-calendar"></i>
                          <span>{new Date(request.date).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      <div className="request-actions">
                        <button 
                          className="action-button details-button"
                          onClick={() => toggleRequestDetails(request.id)}
                        >
                          <i className={`fas ${showRequestDetails === request.id ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i>
                          {showRequestDetails === request.id ? 'Hide Message' : 'View Message'} 
                        </button>
                        
                        <div className="status-actions">
                          <button 
                            className={`status-button approve-button ${request.status === 'approved' ? 'active' : ''}`}
                            onClick={() => updateResumeStatus(request.id, 'approved')}
                            disabled={request.status === 'approved' || request.status === 'sent'}
                          >
                            <i className="fas fa-check"></i>
                            Approve
                          </button>
                          <button 
                            className={`status-button send-button ${request.status === 'sent' ? 'active' : ''}`}
                            onClick={() => handleSendResume(request)}
                            disabled={request.status === 'sent' || request.status === 'rejected'}
                          >
                            <i className="fas fa-paper-plane"></i>
                            Send Resume
                          </button>
                          <button 
                            className={`status-button reject-button ${request.status === 'rejected' ? 'active' : ''}`}
                            onClick={() => updateResumeStatus(request.id, 'rejected')}
                            disabled={request.status === 'rejected' || request.status === 'sent'}
                          >
                            <i className="fas fa-times"></i>
                            Reject
                          </button>
                        </div>
                        
                        <button 
                          className="action-button delete-button"
                          onClick={() => deleteResumeRequest(request.id)}
                        >
                          <i className="fas fa-trash"></i>
                          Delete
                        </button>
                      </div>
                      
                      {showRequestDetails === request.id && (
                        <div className="request-details">
                          <div className="details-header">Additional Information</div>
                          <div className="details-content">
                            {request.message ? (
                              <p>{request.message}</p>
                            ) : (
                              <p className="no-details">No additional message provided.</p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-submissions-message">
                  <i className="fas fa-file-alt"></i>
                  <p>No resume requests yet</p>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminMessages;

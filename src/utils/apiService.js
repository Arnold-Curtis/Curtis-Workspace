/**
 * API Service - Centralized API communication for form submissions and admin data retrieval
 * 
 * Connects to PHP + MySQL backend hosted on InfinityFree (or any PHP host)
 * All data is stored in the MySQL database on the server
 */

// API Base URL - points to the PHP API folder
// For local development: use PHP dev server at port 8080
// For production: relative path to api folder
const isDevelopment = window.location.hostname === 'localhost' && window.location.port === '3000';
const API_BASE_URL = isDevelopment ? 'http://localhost:8080' : '/api';

/**
 * Helper function to make API requests with error handling
 */
const apiRequest = async (endpoint, options = {}) => {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    console.log(`API Request: ${options.method || 'GET'} ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'API request failed');
    }

    return { success: true, data };
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    return { success: false, error: error.message };
  }
};

// ============ CONTACT API ============

/**
 * Submit a contact form
 * @param {Object} contactData - { name, email, subject, message }
 */
export const submitContact = async (contactData) => {
  return apiRequest('/contacts.php', {
    method: 'POST',
    body: JSON.stringify(contactData),
  });
};

/**
 * Get all contacts (admin)
 */
export const getContacts = async () => {
  return apiRequest('/contacts.php');
};

/**
 * Mark a contact as read
 * @param {number} id - Contact ID
 */
export const markContactRead = async (id) => {
  return apiRequest(`/contacts.php?id=${id}&action=read`, {
    method: 'PATCH',
  });
};

/**
 * Delete a contact
 * @param {number} id - Contact ID
 */
export const deleteContact = async (id) => {
  return apiRequest(`/contacts.php?id=${id}`, {
    method: 'DELETE',
  });
};

// ============ GUESTBOOK API ============

/**
 * Submit a guestbook entry
 * @param {Object} entryData - { name, message, company, role }
 */
export const submitGuestbookEntry = async (entryData) => {
  return apiRequest('/guestbook.php', {
    method: 'POST',
    body: JSON.stringify(entryData),
  });
};

/**
 * Get all guestbook entries (admin)
 */
export const getGuestbookEntries = async () => {
  return apiRequest('/guestbook.php');
};

/**
 * Get approved guestbook entries (public)
 */
export const getApprovedGuestbookEntries = async () => {
  return apiRequest('/guestbook.php?approved=true');
};

/**
 * Approve a guestbook entry
 * @param {number} id - Entry ID
 */
export const approveGuestbookEntry = async (id) => {
  return apiRequest(`/guestbook.php?id=${id}&action=approve`, {
    method: 'PATCH',
  });
};

/**
 * Delete a guestbook entry
 * @param {number} id - Entry ID
 */
export const deleteGuestbookEntry = async (id) => {
  return apiRequest(`/guestbook.php?id=${id}`, {
    method: 'DELETE',
  });
};

// ============ BOOKING API ============

/**
 * Submit a call booking
 * @param {Object} bookingData - { name, email, phone, preferred_date, preferred_time, timezone, topic, message }
 */
export const submitBooking = async (bookingData) => {
  return apiRequest('/bookings.php', {
    method: 'POST',
    body: JSON.stringify(bookingData),
  });
};

/**
 * Get all bookings (admin)
 */
export const getBookings = async () => {
  return apiRequest('/bookings.php');
};

/**
 * Update booking status
 * @param {number} id - Booking ID
 * @param {string} status - New status ('pending', 'confirmed', 'completed', 'cancelled')
 */
export const updateBookingStatus = async (id, status) => {
  return apiRequest(`/bookings.php?id=${id}&action=status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
};

/**
 * Delete a booking
 * @param {number} id - Booking ID
 */
export const deleteBooking = async (id) => {
  return apiRequest(`/bookings.php?id=${id}`, {
    method: 'DELETE',
  });
};

// ============ RESUME REQUEST API ============

/**
 * Submit a resume request
 * @param {Object} requestData - { name, email, company, reason }
 */
export const submitResumeRequest = async (requestData) => {
  return apiRequest('/resume-requests.php', {
    method: 'POST',
    body: JSON.stringify(requestData),
  });
};

/**
 * Get all resume requests (admin)
 */
export const getResumeRequests = async () => {
  return apiRequest('/resume-requests.php');
};

/**
 * Mark a resume request as fulfilled
 * @param {number} id - Request ID
 */
export const fulfillResumeRequest = async (id) => {
  return apiRequest(`/resume-requests.php?id=${id}&action=fulfill`, {
    method: 'PATCH',
  });
};

/**
 * Delete a resume request
 * @param {number} id - Request ID
 */
export const deleteResumeRequest = async (id) => {
  return apiRequest(`/resume-requests.php?id=${id}`, {
    method: 'DELETE',
  });
};

// ============ ADMIN API ============

/**
 * Get admin dashboard stats
 */
export const getAdminStats = async () => {
  return apiRequest('/admin-stats.php');
};

/**
 * Get all admin data at once (for initial load)
 */
export const getAllAdminData = async () => {
  const [contacts, guestbook, bookings, resumeRequests, stats] = await Promise.all([
    getContacts(),
    getGuestbookEntries(),
    getBookings(),
    getResumeRequests(),
    getAdminStats(),
  ]);

  return {
    contacts: contacts.success ? contacts.data : [],
    guestbook: guestbook.success ? guestbook.data : [],
    bookings: bookings.success ? bookings.data : [],
    resumeRequests: resumeRequests.success ? resumeRequests.data : [],
    stats: stats.success ? stats.data : null,
  };
};

// Export named object
const apiService = {
  // Contact
  submitContact,
  getContacts,
  markContactRead,
  deleteContact,
  // Guestbook
  submitGuestbookEntry,
  getGuestbookEntries,
  getApprovedGuestbookEntries,
  approveGuestbookEntry,
  deleteGuestbookEntry,
  // Booking
  submitBooking,
  getBookings,
  updateBookingStatus,
  deleteBooking,
  // Resume
  submitResumeRequest,
  getResumeRequests,
  fulfillResumeRequest,
  deleteResumeRequest,
  // Admin
  getAdminStats,
  getAllAdminData,
};

export default apiService;

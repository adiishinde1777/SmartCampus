// SmartCampus API Client connecting to Express/MySQL Backend

const API_BASE = '/api';

async function request(endpoint, options = {}) {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    ...options
  };

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, config);
    const contentType = response.headers.get('content-type') || '';

    let data = null;
    if (contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const rawText = await response.text();
      try {
        data = rawText ? JSON.parse(rawText) : null;
      } catch {
        // Not a JSON response (e.g., HTML fallback or empty body)
        data = null;
      }
    }

    if (!response.ok) {
      const errMsg = data?.message || `Request failed with status ${response.status}`;
      throw new Error(errMsg);
    }

    return data || { success: true };
  } catch (error) {
    console.warn(`[API] ${endpoint}:`, error.message);
    throw error;
  }
}

export const api = {
  // System bootstrap (loads live users, departments, subjects, etc. from MySQL)
  getBootstrap: () => request('/bootstrap'),

  // Role Authentication
  login: (credentials) => request('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials)
  }),

  // User Management
  getUsers: () => request('/users'),
  addUser: (userData) => request('/users', {
    method: 'POST',
    body: JSON.stringify(userData)
  }),
  updateUser: (id, userData) => request(`/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(userData)
  }),
  deleteUser: (id) => request(`/users/${id}`, {
    method: 'DELETE'
  }),

  // Student Registration Shareable Link Flow
  createRegistrationLink: (data) => request('/registration-links', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  submitStudentRegistration: (studentData) => request('/register-student', {
    method: 'POST',
    body: JSON.stringify(studentData)
  }),

  // Attendance & SMS Flow
  submitAttendance: (attendanceData) => request('/attendance', {
    method: 'POST',
    body: JSON.stringify(attendanceData)
  }),
  getSmsLogs: () => request('/sms-logs'),

  // Academic Entities
  addDepartment: (deptData) => request('/departments', {
    method: 'POST',
    body: JSON.stringify(deptData)
  }),
  addSubject: (subjectData) => request('/subjects', {
    method: 'POST',
    body: JSON.stringify(subjectData)
  }),
  submitMarks: (marksData) => request('/marks', {
    method: 'POST',
    body: JSON.stringify(marksData)
  }),
  createNotice: (noticeData) => request('/notices', {
    method: 'POST',
    body: JSON.stringify(noticeData)
  })
};

export default api;

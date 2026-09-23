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

  // Student & Faculty Registration Shareable Link Flow
  createRegistrationLink: (data) => request('/registration-links', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  submitStudentRegistration: (studentData) => request('/register-student', {
    method: 'POST',
    body: JSON.stringify(studentData)
  }),
  submitFacultyRegistration: (facultyData) => request('/register-faculty', {
    method: 'POST',
    body: JSON.stringify(facultyData)
  }),
  setParentPassword: (data) => request('/parent-password', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  sendSms: (smsData) => request('/sms/send', {
    method: 'POST',
    body: JSON.stringify(smsData)
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
  updateDepartment: (id, deptData) => request(`/departments/${id}`, {
    method: 'PUT',
    body: JSON.stringify(deptData)
  }),
  deleteDepartment: (id) => request(`/departments/${id}`, {
    method: 'DELETE'
  }),
  addSubject: (subjectData) => request('/subjects', {
    method: 'POST',
    body: JSON.stringify(subjectData)
  }),
  updateSubject: (id, subjectData) => request(`/subjects/${id}`, {
    method: 'PUT',
    body: JSON.stringify(subjectData)
  }),
  deleteSubject: (id) => request(`/subjects/${id}`, {
    method: 'DELETE'
  }),
  submitMarks: (marksData) => request('/marks', {
    method: 'POST',
    body: JSON.stringify(marksData)
  }),
  createNotice: (noticeData) => request('/notices', {
    method: 'POST',
    body: JSON.stringify(noticeData)
  }),

  // Full-state synchronization
  syncState: (stateData) => request('/sync-state', {
    method: 'POST',
    body: JSON.stringify(stateData)
  })
};

export default api;

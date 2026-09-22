-- SmartCampus ERP Database Schema for MySQL
CREATE DATABASE IF NOT EXISTS smartcampus_db;
USE smartcampus_db;

-- 1. Departments Table
CREATE TABLE IF NOT EXISTS departments (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  code VARCHAR(30) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Users Table (Admin, Principal, HOD, Teacher, Student, Parent)
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(64) PRIMARY KEY,
  role ENUM('admin', 'principal', 'hod', 'teacher', 'student', 'parent') NOT NULL,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NULL,
  phone VARCHAR(25) NULL,
  prn VARCHAR(60) NULL,
  dob VARCHAR(30) NULL,
  password VARCHAR(255) NULL,
  department_id VARCHAR(64) NULL,
  department_name VARCHAR(150) NULL,
  semester INT NULL,
  year VARCHAR(50) NULL,
  division VARCHAR(10) NULL,
  batch VARCHAR(20) NULL,
  roll_no VARCHAR(40) NULL,
  gender VARCHAR(20) NULL,
  blood_group VARCHAR(10) NULL,
  address TEXT NULL,
  parent_id VARCHAR(64) NULL,
  parent_name VARCHAR(150) NULL,
  parent_phone VARCHAR(25) NULL,
  parent_email VARCHAR(150) NULL,
  parent_occupation VARCHAR(100) NULL,
  designation VARCHAR(100) NULL,
  assigned_divisions TEXT NULL,
  mentor VARCHAR(150) NULL,
  is_verified BOOLEAN DEFAULT TRUE,
  avatar TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_role (role),
  INDEX idx_prn (prn),
  INDEX idx_phone (phone),
  INDEX idx_parent_phone (parent_phone)
);

-- 3. Subjects Table
CREATE TABLE IF NOT EXISTS subjects (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  code VARCHAR(40) NOT NULL,
  department_id VARCHAR(64) NOT NULL,
  semester INT NOT NULL DEFAULT 1,
  credits INT NOT NULL DEFAULT 4,
  teacher_id VARCHAR(64) NULL,
  teacher_name VARCHAR(150) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Timetables Table
CREATE TABLE IF NOT EXISTS timetables (
  id VARCHAR(64) PRIMARY KEY,
  department_id VARCHAR(64) NOT NULL,
  semester INT NOT NULL,
  division VARCHAR(10) NULL,
  day VARCHAR(20) NOT NULL,
  time_slot VARCHAR(50) NOT NULL,
  subject_id VARCHAR(64) NULL,
  subject_name VARCHAR(150) NULL,
  teacher_id VARCHAR(64) NULL,
  teacher_name VARCHAR(150) NULL,
  room VARCHAR(50) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Attendance Records Table
CREATE TABLE IF NOT EXISTS attendance (
  id VARCHAR(64) PRIMARY KEY,
  student_id VARCHAR(64) NOT NULL,
  student_name VARCHAR(150) NOT NULL,
  subject_id VARCHAR(64) NOT NULL,
  subject_name VARCHAR(150) NOT NULL,
  teacher_id VARCHAR(64) NULL,
  marked_by VARCHAR(150) NULL,
  date VARCHAR(30) NOT NULL,
  time VARCHAR(30) NOT NULL,
  session_type VARCHAR(30) DEFAULT 'Theory',
  lecture_num INT DEFAULT 1,
  status ENUM('Present', 'Absent') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_att_student (student_id),
  INDEX idx_att_date (date)
);

-- 6. Real-time SMS Dispatch Logs Table
CREATE TABLE IF NOT EXISTS sms_logs (
  id VARCHAR(64) PRIMARY KEY,
  recipient_role VARCHAR(30) NOT NULL,
  recipient_phone VARCHAR(25) NOT NULL,
  student_id VARCHAR(64) NULL,
  student_name VARCHAR(150) NULL,
  message TEXT NOT NULL,
  gateway_provider VARCHAR(50) DEFAULT 'Fast2SMS',
  gateway_status ENUM('Delivered', 'Failed', 'Simulated_Sent') NOT NULL DEFAULT 'Simulated_Sent',
  response_payload TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_sms_phone (recipient_phone)
);

-- 7. Marks Records Table
CREATE TABLE IF NOT EXISTS marks (
  id VARCHAR(64) PRIMARY KEY,
  student_id VARCHAR(64) NOT NULL,
  student_name VARCHAR(150) NOT NULL,
  subject_id VARCHAR(64) NOT NULL,
  subject_name VARCHAR(150) NOT NULL,
  exam_type VARCHAR(80) NOT NULL,
  category VARCHAR(40) DEFAULT 'Theory',
  marks_obtained DECIMAL(5,2) NOT NULL,
  max_marks DECIMAL(5,2) NOT NULL,
  graded_by VARCHAR(150) NULL,
  remarks TEXT NULL,
  date VARCHAR(30) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_marks_student (student_id)
);

-- 8. Assignments Table
CREATE TABLE IF NOT EXISTS assignments (
  id VARCHAR(64) PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT NULL,
  subject_id VARCHAR(64) NOT NULL,
  subject_name VARCHAR(150) NULL,
  teacher_id VARCHAR(64) NULL,
  teacher_name VARCHAR(150) NULL,
  due_date VARCHAR(30) NOT NULL,
  max_marks INT DEFAULT 20,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. Notices Table
CREATE TABLE IF NOT EXISTS notices (
  id VARCHAR(64) PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  target_audience VARCHAR(50) DEFAULT 'all',
  department_id VARCHAR(64) NULL,
  posted_by VARCHAR(150) NOT NULL,
  role VARCHAR(50) NOT NULL,
  priority VARCHAR(20) DEFAULT 'normal',
  date VARCHAR(30) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 10. Leaves Table
CREATE TABLE IF NOT EXISTS leaves (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL,
  user_name VARCHAR(150) NOT NULL,
  user_role VARCHAR(30) NOT NULL,
  leave_type VARCHAR(50) NOT NULL,
  start_date VARCHAR(30) NOT NULL,
  end_date VARCHAR(30) NOT NULL,
  reason TEXT NOT NULL,
  status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
  approved_by VARCHAR(150) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 11. Complaints Table
CREATE TABLE IF NOT EXISTS complaints (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL,
  user_name VARCHAR(150) NOT NULL,
  user_role VARCHAR(30) NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(50) DEFAULT 'General',
  status ENUM('Pending', 'In Review', 'Resolved') DEFAULT 'Pending',
  resolved_by VARCHAR(150) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 12. Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
  id VARCHAR(64) PRIMARY KEY,
  timestamp VARCHAR(50) NOT NULL,
  user VARCHAR(150) NOT NULL,
  role VARCHAR(50) NOT NULL,
  action VARCHAR(100) NOT NULL,
  details TEXT NULL,
  module VARCHAR(60) DEFAULT 'General',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 13. System Settings Table
CREATE TABLE IF NOT EXISTS system_settings (
  setting_key VARCHAR(64) PRIMARY KEY,
  setting_value TEXT NOT NULL
);

-- 14. Student Registration Shareable Links
CREATE TABLE IF NOT EXISTS registration_links (
  token VARCHAR(64) PRIMARY KEY,
  department_id VARCHAR(64) NOT NULL,
  semester INT NOT NULL DEFAULT 1,
  division VARCHAR(10) DEFAULT 'A',
  batch VARCHAR(20) DEFAULT 'All',
  created_by VARCHAR(150) NOT NULL,
  created_by_id VARCHAR(64) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ====================================================================
-- SEED INITIAL BASELINE CONFIG (ZERO DUMMY STUDENTS / PURE CLEAN STATE)
-- ====================================================================

-- 1. Default Admin Account
INSERT IGNORE INTO users (
  id, role, name, email, phone, prn, dob, password, designation, is_verified
) VALUES (
  'adm-1',
  'admin',
  'System Administrator',
  'admin@campus.edu',
  '9876543210',
  'admin',
  '1985-01-01',
  'admin123',
  'System Administrator',
  TRUE
);

-- 2. Baseline Departments
INSERT IGNORE INTO departments (id, name, code) VALUES
  ('dept-vlsi', 'Electronic Engineering (VLSI Design And Technology)', 'VLSI'),
  ('dept-cs', 'Computer Science and Engineering', 'CSE'),
  ('dept-mech', 'Mechanical Engineering', 'MECH'),
  ('dept-civil', 'Civil Engineering', 'CIVIL'),
  ('dept-ee', 'Electrical Engineering', 'EE');

-- 3. Default System Settings
INSERT IGNORE INTO system_settings (setting_key, setting_value) VALUES
  ('attendanceThreshold', '75'),
  ('collegeName', 'CSMSS Chh. Shahu College of Engineering'),
  ('academicYear', '2026-27'),
  ('currentSemester', '5');

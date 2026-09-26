// SmartCampus ERP Baseline Data Store
// Clean zero-dummy database state (Admin only)

export const CLEAN_BASELINE_ADMIN = {
  id: "adm-1",
  role: "admin",
  name: "System Administrator",
  email: "admin@campus.edu",
  phone: "7378535499",
  prn: "admin",
  dob: "1985-01-01",
  password: "admin123",
  designation: "System Administrator",
  isVerified: true
};

export const ADITYA_SHINDE_STUDENT = {
  id: "stu-1",
  role: "student",
  name: "Aditya Shinde",
  displayName: "Aditya Shinde",
  email: "aditya.shinde@campus.edu",
  phone: "7378535499",
  prn: "24025331378056",
  rollNo: "VL3152",
  dob: "2004-05-15",
  password: "password123",
  gender: "Male",
  bloodGroup: "O+",
  departmentId: "dept-vlsi",
  departmentName: "Electronic Engineering (VLSI Design And Technology)",
  semester: 5,
  year: "Third Year",
  division: "A",
  batch: "TA2",
  avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
  address: "Rohit Complex Chitegaon tq Paithan Dis. Chh. Sambhajinagar",
  parentName: "Santosh Shinde",
  parentPhone: "7378535499",
  parentEmail: "santosh.shinde@gmail.com",
  isVerified: true,
  canLogin: true
};

export const INITIAL_USERS = [
  CLEAN_BASELINE_ADMIN,
  ADITYA_SHINDE_STUDENT
];

export const DEPARTMENTS = [
  {
    id: "dept-vlsi",
    name: "Electronic Engineering (VLSI Design And Technology)",
    code: "VLSI",
    divisions: ["A", "B"],
    yearDivisions: {
      "1st Year": ["A", "B"],
      "2nd Year": ["A"],
      "3rd Year": ["A"],
      "4th Year": ["A"]
    },
    hod: "Dr. Shrikant Honade",
    firstYearHod: "Dr. R. S. Pawar"
  }
];

export const INITIAL_SUBJECTS = [];
export const INITIAL_TIMETABLES = [];
export const INITIAL_ATTENDANCE = [];
export const INITIAL_ATTENDANCE_LOGS = [];
export const INITIAL_SMS_LOGS = [];
export const INITIAL_MARKS = [];
export const INITIAL_ASSIGNMENTS = [];
export const INITIAL_NOTICES = [];
export const INITIAL_LEAVE_REQUESTS = [];
export const INITIAL_COMPLAINTS = [];
export const INITIAL_STUDY_MATERIAL = [];
export const INITIAL_NOTIFICATIONS = [];
export const INITIAL_AUDIT_LOGS = [];

export const INITIAL_SYSTEM_SETTINGS = {
  attendanceThreshold: 75,
  academicYear: "2026-2027",
  currentSemester: "Odd Semester",
  firstYearHod: "Dr. R. S. Pawar (HOD First Year / Applied Science & Humanities)",
  smsNotificationsEnabled: true,
  whatsappNotificationsEnabled: true,
  emailNotificationsEnabled: true,
  autoAlertOnAbsence: true,
  autoAlertOnLowMarks: true,
  collegeName: "CSMSS Chh. Shahu College of Engineering",
  tagline: "Track → Alert → Analyse → Act"
};

export const VLSI_CLASS_METADATA = {
  department: "Electronic Engineering (VLSI Design And Technology)",
  classTeacher: "Not Assigned",
  totalStudents: 0
};

export function getStudentBatchInfo(rollNo) {
  return { batch: "A1", division: "A" };
}

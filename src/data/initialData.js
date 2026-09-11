// SMART CAMPUS: Academic, Attendance & Parent Communication System
// Initial Central Database Seed Data

export const INITIAL_USERS = [
  // 1. STUDENTS
  {
    id: "stu-1",
    role: "student",
    name: "Rahul Patil",
    email: "rahul.patil@campus.edu",
    password: "password123",
    rollNo: "CE-2024-042",
    departmentId: "dept-ce",
    departmentName: "Computer Engineering",
    semester: 5,
    division: "A",
    avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
    phone: "+91 98765 43210",
    parentName: "Suresh Patil",
    parentId: "par-1",
    parentPhone: "+91 98765 11223",
    parentEmail: "suresh.patil@gmail.com",
    address: "Flat 402, Greenfield Residency, Pune",
    bloodGroup: "O+",
    mentor: "Prof. R. K. Patil",
    cgpa: 7.8,
  },
  {
    id: "stu-2",
    role: "student",
    name: "Sneha Sharma",
    email: "sneha.sharma@campus.edu",
    password: "password123",
    rollNo: "CE-2024-055",
    departmentId: "dept-ce",
    departmentName: "Computer Engineering",
    semester: 5,
    division: "A",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    phone: "+91 98234 56781",
    parentName: "Sunita Sharma",
    parentId: "par-2",
    parentPhone: "+91 98234 88776",
    parentEmail: "sunita.sharma@gmail.com",
    address: "Plot 12, Kothrud, Pune",
    bloodGroup: "B+",
    mentor: "Prof. R. K. Patil",
    cgpa: 9.1,
  },
  {
    id: "stu-3",
    role: "student",
    name: "Amit Joshi",
    email: "amit.joshi@campus.edu",
    password: "password123",
    rollNo: "CE-2024-018",
    departmentId: "dept-ce",
    departmentName: "Computer Engineering",
    semester: 5,
    division: "A",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    phone: "+91 98111 22334",
    parentName: "Manish Joshi",
    parentId: "par-3",
    parentPhone: "+91 98111 99887",
    parentEmail: "manish.joshi@gmail.com",
    address: "A-10 Baner Heights, Pune",
    bloodGroup: "A+",
    mentor: "Prof. R. K. Patil",
    cgpa: 8.4,
  },
  {
    id: "stu-4",
    role: "student",
    name: "Priya Deshmukh",
    email: "priya.deshmukh@campus.edu",
    password: "password123",
    rollNo: "CE-2024-029",
    departmentId: "dept-ce",
    departmentName: "Computer Engineering",
    semester: 5,
    division: "A",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
    phone: "+91 98333 44556",
    parentName: "Anand Deshmukh",
    parentId: "par-4",
    parentPhone: "+91 98333 77665",
    parentEmail: "anand.deshmukh@gmail.com",
    address: "C-301 Shivaji Nagar, Pune",
    bloodGroup: "AB+",
    mentor: "Prof. R. K. Patil",
    cgpa: 8.9,
  },
  {
    id: "stu-5",
    role: "student",
    name: "Aditya Kulkarni",
    email: "aditya.kulkarni@campus.edu",
    password: "password123",
    rollNo: "CE-2024-007",
    departmentId: "dept-ce",
    departmentName: "Computer Engineering",
    semester: 5,
    division: "A",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    phone: "+91 98555 66778",
    parentName: "Vijay Kulkarni",
    parentId: "par-5",
    parentPhone: "+91 98555 33221",
    parentEmail: "vijay.kulkarni@gmail.com",
    address: "B-504 Viman Nagar, Pune",
    bloodGroup: "O-",
    mentor: "Prof. R. K. Patil",
    cgpa: 6.9,
  },

  // 2. TEACHERS
  {
    id: "tea-1",
    role: "teacher",
    name: "Prof. R. K. Patil",
    email: "rk.patil@campus.edu",
    password: "password123",
    designation: "Associate Professor",
    departmentId: "dept-ce",
    departmentName: "Computer Engineering",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    phone: "+91 98900 12345",
    assignedSubjects: [
      { id: "sub-dbms", name: "Database Management Systems", code: "CE501", semester: 5, division: "A" },
      { id: "sub-os", name: "Operating Systems", code: "CE502", semester: 5, division: "A" }
    ],
    assignedDivisions: ["Sem 5 - Div A", "Sem 5 - Div B"]
  },
  {
    id: "tea-2",
    role: "teacher",
    name: "Prof. Anjali Sharma",
    email: "anjali.sharma@campus.edu",
    password: "password123",
    designation: "Assistant Professor",
    departmentId: "dept-ce",
    departmentName: "Computer Engineering",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    phone: "+91 98900 67890",
    assignedSubjects: [
      { id: "sub-cn", name: "Computer Networks", code: "CE503", semester: 5, division: "A" },
      { id: "sub-wt", name: "Web Technology", code: "CE505", semester: 5, division: "A" }
    ],
    assignedDivisions: ["Sem 5 - Div A"]
  },

  // 3. PARENTS
  {
    id: "par-1",
    role: "parent",
    name: "Suresh Patil",
    email: "suresh.patil@gmail.com",
    password: "password123",
    phone: "+91 98765 11223",
    studentId: "stu-1",
    studentName: "Rahul Patil",
    relation: "Father",
    occupation: "Civil Engineer",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80"
  },
  {
    id: "par-2",
    role: "parent",
    name: "Sunita Sharma",
    email: "sunita.sharma@gmail.com",
    password: "password123",
    phone: "+91 98234 88776",
    studentId: "stu-2",
    studentName: "Sneha Sharma",
    relation: "Mother",
    occupation: "Senior Architect",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80"
  },

  // 4. HOD
  {
    id: "hod-1",
    role: "hod",
    name: "Dr. V. S. Rao",
    email: "hod.ce@campus.edu",
    password: "password123",
    designation: "Head of Department (Computer Engg)",
    departmentId: "dept-ce",
    departmentName: "Computer Engineering",
    avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80",
    phone: "+91 98900 99999"
  },

  // 5. PRINCIPAL
  {
    id: "prin-1",
    role: "principal",
    name: "Dr. S. K. Mehta",
    email: "principal@campus.edu",
    password: "password123",
    designation: "Principal & Academic Director",
    collegeName: "ABC Institute of Technology",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80",
    phone: "+91 98900 00001"
  },

  // 6. ADMIN
  {
    id: "adm-1",
    role: "admin",
    name: "Admin Officer (System Manager)",
    email: "admin@campus.edu",
    password: "password123",
    designation: "ERP & Systems Administrator",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
    phone: "+91 98900 55555"
  }
];

export const DEPARTMENTS = [
  { id: "dept-ce", name: "Computer Engineering", code: "CE", hod: "Dr. V. S. Rao", studentCount: 240, facultyCount: 16, avgAttendance: 79.4, avgMarks: 74.2 },
  { id: "dept-it", name: "Information Technology", code: "IT", hod: "Dr. M. K. Iyer", studentCount: 180, facultyCount: 12, avgAttendance: 82.1, avgMarks: 76.8 },
  { id: "dept-extc", name: "Electronics & Telecom", code: "EXTC", hod: "Dr. P. N. Joshi", studentCount: 210, facultyCount: 14, avgAttendance: 76.5, avgMarks: 69.5 },
  { id: "dept-mech", name: "Mechanical Engineering", code: "MECH", hod: "Dr. R. B. Verma", studentCount: 220, facultyCount: 15, avgAttendance: 74.8, avgMarks: 67.2 }
];

export const SUBJECTS = [
  // ==========================================
  // COMPUTER ENGINEERING (dept-ce) - 8 SEMESTERS
  // ==========================================
  // SEMESTER 1 (Year 1)
  { id: "sub-ce101", name: "Engineering Mathematics I", code: "CE101", teacherId: "tea-1", teacherName: "Prof. R. K. Patil", semester: 1, credits: 4, departmentId: "dept-ce", type: "Theory", weeklyHours: 4 },
  { id: "sub-ce102", name: "Engineering Physics", code: "CE102", teacherId: "tea-2", teacherName: "Prof. Anjali Sharma", semester: 1, credits: 3, departmentId: "dept-ce", type: "Theory", weeklyHours: 3 },
  { id: "sub-ce103", name: "Basics of Electrical & Electronics", code: "CE103", teacherId: "tea-1", teacherName: "Prof. R. K. Patil", semester: 1, credits: 3, departmentId: "dept-ce", type: "Theory", weeklyHours: 3 },
  { id: "sub-ce104", name: "Programming in C & Problem Solving", code: "CE104", teacherId: "tea-2", teacherName: "Prof. Anjali Sharma", semester: 1, credits: 4, departmentId: "dept-ce", type: "Lab", weeklyHours: 4 },
  { id: "sub-ce105", name: "Engineering Graphics & CAD", code: "CE105", teacherId: "tea-1", teacherName: "Prof. R. K. Patil", semester: 1, credits: 3, departmentId: "dept-ce", type: "Lab", weeklyHours: 3 },

  // SEMESTER 2 (Year 1)
  { id: "sub-ce201", name: "Engineering Mathematics II", code: "CE201", teacherId: "tea-1", teacherName: "Prof. R. K. Patil", semester: 2, credits: 4, departmentId: "dept-ce", type: "Theory", weeklyHours: 4 },
  { id: "sub-ce202", name: "Engineering Chemistry & Environmental", code: "CE202", teacherId: "tea-2", teacherName: "Prof. Anjali Sharma", semester: 2, credits: 3, departmentId: "dept-ce", type: "Theory", weeklyHours: 3 },
  { id: "sub-ce203", name: "Object Oriented Programming (C++)", code: "CE203", teacherId: "tea-2", teacherName: "Prof. Anjali Sharma", semester: 2, credits: 4, departmentId: "dept-ce", type: "Lab", weeklyHours: 4 },
  { id: "sub-ce204", name: "Data Structures Fundamentals", code: "CE204", teacherId: "tea-1", teacherName: "Prof. R. K. Patil", semester: 2, credits: 4, departmentId: "dept-ce", type: "Theory", weeklyHours: 4 },
  { id: "sub-ce205", name: "Professional Communication & Ethics", code: "CE205", teacherId: "tea-2", teacherName: "Prof. Anjali Sharma", semester: 2, credits: 2, departmentId: "dept-ce", type: "Theory", weeklyHours: 2 },

  // SEMESTER 3 (Year 2)
  { id: "sub-ce301", name: "Discrete Mathematics & Graph Theory", code: "CE301", teacherId: "tea-1", teacherName: "Prof. R. K. Patil", semester: 3, credits: 4, departmentId: "dept-ce", type: "Theory", weeklyHours: 4 },
  { id: "sub-ce302", name: "Data Structures & Algorithms", code: "CE302", teacherId: "tea-2", teacherName: "Prof. Anjali Sharma", semester: 3, credits: 4, departmentId: "dept-ce", type: "Theory", weeklyHours: 4 },
  { id: "sub-ce303", name: "Digital Logic & Computer Organization", code: "CE303", teacherId: "tea-1", teacherName: "Prof. R. K. Patil", semester: 3, credits: 4, departmentId: "dept-ce", type: "Theory", weeklyHours: 4 },
  { id: "sub-ce304", name: "Java Enterprise Programming", code: "CE304", teacherId: "tea-2", teacherName: "Prof. Anjali Sharma", semester: 3, credits: 4, departmentId: "dept-ce", type: "Lab", weeklyHours: 4 },
  { id: "sub-ce305", name: "Principles of Programming Languages", code: "CE305", teacherId: "tea-1", teacherName: "Prof. R. K. Patil", semester: 3, credits: 3, departmentId: "dept-ce", type: "Theory", weeklyHours: 3 },

  // SEMESTER 4 (Year 2)
  { id: "sub-ce401", name: "Design & Analysis of Algorithms", code: "CE401", teacherId: "tea-2", teacherName: "Prof. Anjali Sharma", semester: 4, credits: 4, departmentId: "dept-ce", type: "Theory", weeklyHours: 4 },
  { id: "sub-ce402", name: "Theory of Computation & Automata", code: "CE402", teacherId: "tea-1", teacherName: "Prof. R. K. Patil", semester: 4, credits: 4, departmentId: "dept-ce", type: "Theory", weeklyHours: 4 },
  { id: "sub-ce403", name: "Software Engineering & Agile Methodologies", code: "CE403", teacherId: "tea-2", teacherName: "Prof. Anjali Sharma", semester: 4, credits: 3, departmentId: "dept-ce", type: "Theory", weeklyHours: 3 },
  { id: "sub-ce404", name: "Microprocessors & Embedded Systems", code: "CE404", teacherId: "tea-1", teacherName: "Prof. R. K. Patil", semester: 4, credits: 4, departmentId: "dept-ce", type: "Lab", weeklyHours: 4 },
  { id: "sub-ce405", name: "Python for Data Analytics", code: "CE405", teacherId: "tea-2", teacherName: "Prof. Anjali Sharma", semester: 4, credits: 3, departmentId: "dept-ce", type: "Lab", weeklyHours: 3 },

  // SEMESTER 5 (Year 3) - Active Core Semester
  { id: "sub-dbms", name: "Database Management Systems", code: "CE501", teacherId: "tea-1", teacherName: "Prof. R. K. Patil", semester: 5, credits: 4, departmentId: "dept-ce", type: "Theory", weeklyHours: 4 },
  { id: "sub-os", name: "Operating Systems", code: "CE502", teacherId: "tea-1", teacherName: "Prof. R. K. Patil", semester: 5, credits: 4, departmentId: "dept-ce", type: "Theory", weeklyHours: 4 },
  { id: "sub-cn", name: "Computer Networks", code: "CE503", teacherId: "tea-2", teacherName: "Prof. Anjali Sharma", semester: 5, credits: 4, departmentId: "dept-ce", type: "Theory", weeklyHours: 4 },
  { id: "sub-math", name: "Applied Mathematics", code: "CE504", teacherId: "tea-1", teacherName: "Prof. R. K. Patil", semester: 5, credits: 3, departmentId: "dept-ce", type: "Theory", weeklyHours: 3 },
  { id: "sub-wt", name: "Web Technology & Full Stack", code: "CE505", teacherId: "tea-2", teacherName: "Prof. Anjali Sharma", semester: 5, credits: 3, departmentId: "dept-ce", type: "Lab", weeklyHours: 4 },

  // SEMESTER 6 (Year 3)
  { id: "sub-ce601", name: "Artificial Intelligence & Machine Learning", code: "CE601", teacherId: "tea-2", teacherName: "Prof. Anjali Sharma", semester: 6, credits: 4, departmentId: "dept-ce", type: "Theory", weeklyHours: 4 },
  { id: "sub-ce602", name: "Compiler Design & Language Processors", code: "CE602", teacherId: "tea-1", teacherName: "Prof. R. K. Patil", semester: 6, credits: 4, departmentId: "dept-ce", type: "Theory", weeklyHours: 4 },
  { id: "sub-ce603", name: "Cloud Computing & DevOps Architecture", code: "CE603", teacherId: "tea-2", teacherName: "Prof. Anjali Sharma", semester: 6, credits: 3, departmentId: "dept-ce", type: "Theory", weeklyHours: 3 },
  { id: "sub-ce604", name: "Information & Network Cyber Security", code: "CE604", teacherId: "tea-1", teacherName: "Prof. R. K. Patil", semester: 6, credits: 3, departmentId: "dept-ce", type: "Theory", weeklyHours: 3 },
  { id: "sub-ce605", name: "Mobile Application Dev (Flutter/React Native)", code: "CE605", teacherId: "tea-2", teacherName: "Prof. Anjali Sharma", semester: 6, credits: 3, departmentId: "dept-ce", type: "Lab", weeklyHours: 3 },

  // SEMESTER 7 (Year 4)
  { id: "sub-ce701", name: "Big Data Analytics & High Performance Computing", code: "CE701", teacherId: "tea-1", teacherName: "Prof. R. K. Patil", semester: 7, credits: 4, departmentId: "dept-ce", type: "Theory", weeklyHours: 4 },
  { id: "sub-ce702", name: "Internet of Things (IoT) & Embedded AI", code: "CE702", teacherId: "tea-2", teacherName: "Prof. Anjali Sharma", semester: 7, credits: 4, departmentId: "dept-ce", type: "Lab", weeklyHours: 4 },
  { id: "sub-ce703", name: "Deep Learning & Generative AI", code: "CE703", teacherId: "tea-1", teacherName: "Prof. R. K. Patil", semester: 7, credits: 4, departmentId: "dept-ce", type: "Theory", weeklyHours: 4 },
  { id: "sub-ce704", name: "Elective I: Blockchain & Smart Contracts", code: "CE704", teacherId: "tea-2", teacherName: "Prof. Anjali Sharma", semester: 7, credits: 3, departmentId: "dept-ce", type: "Elective", weeklyHours: 3 },
  { id: "sub-ce705", name: "Major Project / Capstone Phase I", code: "CE705", teacherId: "tea-1", teacherName: "Prof. R. K. Patil", semester: 7, credits: 4, departmentId: "dept-ce", type: "Project", weeklyHours: 6 },

  // SEMESTER 8 (Year 4)
  { id: "sub-ce801", name: "Distributed Systems & Microservices", code: "CE801", teacherId: "tea-1", teacherName: "Prof. R. K. Patil", semester: 8, credits: 4, departmentId: "dept-ce", type: "Theory", weeklyHours: 4 },
  { id: "sub-ce802", name: "Natural Language Processing (NLP)", code: "CE802", teacherId: "tea-2", teacherName: "Prof. Anjali Sharma", semester: 8, credits: 4, departmentId: "dept-ce", type: "Theory", weeklyHours: 4 },
  { id: "sub-ce803", name: "Elective II: Quantum Computing & Cryptography", code: "CE803", teacherId: "tea-1", teacherName: "Prof. R. K. Patil", semester: 8, credits: 3, departmentId: "dept-ce", type: "Elective", weeklyHours: 3 },
  { id: "sub-ce804", name: "Industry Internship & Capstone Project Phase II", code: "CE804", teacherId: "tea-2", teacherName: "Prof. Anjali Sharma", semester: 8, credits: 8, departmentId: "dept-ce", type: "Project", weeklyHours: 12 },

  // ==========================================
  // INFORMATION TECHNOLOGY (dept-it) - 8 SEMESTERS
  // ==========================================
  { id: "sub-it101", name: "Fundamentals of IT & Programming", code: "IT101", teacherId: "tea-2", teacherName: "Prof. Anjali Sharma", semester: 1, credits: 4, departmentId: "dept-it", type: "Theory", weeklyHours: 4 },
  { id: "sub-it201", name: "Object Oriented Tech & Web Fundamentals", code: "IT201", teacherId: "tea-2", teacherName: "Prof. Anjali Sharma", semester: 2, credits: 4, departmentId: "dept-it", type: "Lab", weeklyHours: 4 },
  { id: "sub-it301", name: "Data Structures & Java Programming", code: "IT301", teacherId: "tea-1", teacherName: "Prof. R. K. Patil", semester: 3, credits: 4, departmentId: "dept-it", type: "Theory", weeklyHours: 4 },
  { id: "sub-it401", name: "Database Engineering & NOSQL", code: "IT401", teacherId: "tea-1", teacherName: "Prof. R. K. Patil", semester: 4, credits: 4, departmentId: "dept-it", type: "Theory", weeklyHours: 4 },
  { id: "sub-it501", name: "Full-Stack Web Architectures", code: "IT501", teacherId: "tea-2", teacherName: "Prof. Anjali Sharma", semester: 5, credits: 4, departmentId: "dept-it", type: "Theory", weeklyHours: 4 },
  { id: "sub-it601", name: "Cloud Infrastructure & Containerization", code: "IT601", teacherId: "tea-2", teacherName: "Prof. Anjali Sharma", semester: 6, credits: 4, departmentId: "dept-it", type: "Lab", weeklyHours: 4 },
  { id: "sub-it701", name: "Cyber Forensics & Threat Hunting", code: "IT701", teacherId: "tea-1", teacherName: "Prof. R. K. Patil", semester: 7, credits: 4, departmentId: "dept-it", type: "Theory", weeklyHours: 4 },
  { id: "sub-it801", name: "IT Project & Industry Capstone", code: "IT801", teacherId: "tea-2", teacherName: "Prof. Anjali Sharma", semester: 8, credits: 8, departmentId: "dept-it", type: "Project", weeklyHours: 12 },

  // ==========================================
  // ELECTRONICS & TELECOM (dept-extc) - 8 SEMESTERS
  // ==========================================
  { id: "sub-extc101", name: "Basic Electrical & Circuit Theory", code: "EX101", teacherId: "tea-1", teacherName: "Prof. R. K. Patil", semester: 1, credits: 4, departmentId: "dept-extc", type: "Theory", weeklyHours: 4 },
  { id: "sub-extc201", name: "Electronic Devices & Digital Circuits", code: "EX201", teacherId: "tea-2", teacherName: "Prof. Anjali Sharma", semester: 2, credits: 4, departmentId: "dept-extc", type: "Lab", weeklyHours: 4 },
  { id: "sub-extc301", name: "Analog Circuits & Linear ICs", code: "EX301", teacherId: "tea-1", teacherName: "Prof. R. K. Patil", semester: 3, credits: 4, departmentId: "dept-extc", type: "Theory", weeklyHours: 4 },
  { id: "sub-extc401", name: "Signals & Systems Analysis", code: "EX401", teacherId: "tea-1", teacherName: "Prof. R. K. Patil", semester: 4, credits: 4, departmentId: "dept-extc", type: "Theory", weeklyHours: 4 },
  { id: "sub-extc501", name: "Digital Signal Processing (DSP)", code: "EX501", teacherId: "tea-2", teacherName: "Prof. Anjali Sharma", semester: 5, credits: 4, departmentId: "dept-extc", type: "Theory", weeklyHours: 4 },
  { id: "sub-extc601", name: "VLSI Design & Embedded Controllers", code: "EX601", teacherId: "tea-1", teacherName: "Prof. R. K. Patil", semester: 6, credits: 4, departmentId: "dept-extc", type: "Lab", weeklyHours: 4 },
  { id: "sub-extc701", name: "Wireless & 5G Cellular Networks", code: "EX701", teacherId: "tea-2", teacherName: "Prof. Anjali Sharma", semester: 7, credits: 4, departmentId: "dept-extc", type: "Theory", weeklyHours: 4 },
  { id: "sub-extc801", name: "Satellite Communication & Radar Systems", code: "EX801", teacherId: "tea-1", teacherName: "Prof. R. K. Patil", semester: 8, credits: 6, departmentId: "dept-extc", type: "Theory", weeklyHours: 4 },

  // ==========================================
  // MECHANICAL ENGINEERING (dept-mech) - 8 SEMESTERS
  // ==========================================
  { id: "sub-me101", name: "Engineering Mechanics & Statics", code: "ME101", teacherId: "tea-1", teacherName: "Prof. R. K. Patil", semester: 1, credits: 4, departmentId: "dept-mech", type: "Theory", weeklyHours: 4 },
  { id: "sub-me201", name: "Material Science & Metallurgy", code: "ME201", teacherId: "tea-2", teacherName: "Prof. Anjali Sharma", semester: 2, credits: 3, departmentId: "dept-mech", type: "Theory", weeklyHours: 3 },
  { id: "sub-me301", name: "Thermodynamics & Thermal Power", code: "ME301", teacherId: "tea-1", teacherName: "Prof. R. K. Patil", semester: 3, credits: 4, departmentId: "dept-mech", type: "Theory", weeklyHours: 4 },
  { id: "sub-me401", name: "Fluid Mechanics & Hydraulic Machinery", code: "ME401", teacherId: "tea-1", teacherName: "Prof. R. K. Patil", semester: 4, credits: 4, departmentId: "dept-mech", type: "Theory", weeklyHours: 4 },
  { id: "sub-me501", name: "Theory of Machines & Kinematics", code: "ME501", teacherId: "tea-2", teacherName: "Prof. Anjali Sharma", semester: 5, credits: 4, departmentId: "dept-mech", type: "Theory", weeklyHours: 4 },
  { id: "sub-me601", name: "Heat Transfer & Refrigeration Systems", code: "ME601", teacherId: "tea-1", teacherName: "Prof. R. K. Patil", semester: 6, credits: 4, departmentId: "dept-mech", type: "Lab", weeklyHours: 4 },
  { id: "sub-me701", name: "CAD/CAM & Automation Manufacturing", code: "ME701", teacherId: "tea-2", teacherName: "Prof. Anjali Sharma", semester: 7, credits: 4, departmentId: "dept-mech", type: "Lab", weeklyHours: 4 },
  { id: "sub-me801", name: "Robotics & Industrial Mechatronics", code: "ME801", teacherId: "tea-1", teacherName: "Prof. R. K. Patil", semester: 8, credits: 6, departmentId: "dept-mech", type: "Theory", weeklyHours: 4 }
];

// Comprehensive Master Timetable Slots (Department, Semester 1-8, Division A & B, Day Monday-Saturday)
export const INITIAL_TIMETABLES = [
  // Computer Engineering - Sem 5 - Div A (Monday to Friday)
  { id: "slot-ce5a-mon-1", departmentId: "dept-ce", semester: 5, division: "A", day: "Monday", time: "09:00 AM - 10:00 AM", subjectId: "sub-dbms", subjectName: "Database Management Systems", subjectCode: "CE501", teacherId: "tea-1", teacherName: "Prof. R. K. Patil", room: "Room B-204", type: "Theory" },
  { id: "slot-ce5a-mon-2", departmentId: "dept-ce", semester: 5, division: "A", day: "Monday", time: "10:00 AM - 11:00 AM", subjectId: "sub-os", subjectName: "Operating Systems", subjectCode: "CE502", teacherId: "tea-1", teacherName: "Prof. R. K. Patil", room: "Room B-204", type: "Theory" },
  { id: "slot-ce5a-mon-3", departmentId: "dept-ce", semester: 5, division: "A", day: "Monday", time: "11:15 AM - 12:15 PM", subjectId: "sub-cn", subjectName: "Computer Networks", subjectCode: "CE503", teacherId: "tea-2", teacherName: "Prof. Anjali Sharma", room: "Lab-3", type: "Lab" },
  { id: "slot-ce5a-mon-4", departmentId: "dept-ce", semester: 5, division: "A", day: "Monday", time: "01:00 PM - 02:00 PM", subjectId: "sub-math", subjectName: "Applied Mathematics", subjectCode: "CE504", teacherId: "tea-1", teacherName: "Prof. R. K. Patil", room: "Room B-204", type: "Theory" },
  { id: "slot-ce5a-mon-5", departmentId: "dept-ce", semester: 5, division: "A", day: "Monday", time: "02:00 PM - 03:00 PM", subjectId: "sub-wt", subjectName: "Web Technology & Full Stack", subjectCode: "CE505", teacherId: "tea-2", teacherName: "Prof. Anjali Sharma", room: "Lab-2", type: "Lab" },

  // Tuesday
  { id: "slot-ce5a-tue-1", departmentId: "dept-ce", semester: 5, division: "A", day: "Tuesday", time: "09:00 AM - 10:00 AM", subjectId: "sub-dbms", subjectName: "Database Management Systems", subjectCode: "CE501", teacherId: "tea-1", teacherName: "Prof. R. K. Patil", room: "Room B-204", type: "Theory" },
  { id: "slot-ce5a-tue-2", departmentId: "dept-ce", semester: 5, division: "A", day: "Tuesday", time: "10:00 AM - 11:00 AM", subjectId: "sub-os", subjectName: "Operating Systems", subjectCode: "CE502", teacherId: "tea-1", teacherName: "Prof. R. K. Patil", room: "Room B-204", type: "Theory" },
  { id: "slot-ce5a-tue-3", departmentId: "dept-ce", semester: 5, division: "A", day: "Tuesday", time: "11:15 AM - 12:15 PM", subjectId: "sub-cn", subjectName: "Computer Networks", subjectCode: "CE503", teacherId: "tea-2", teacherName: "Prof. Anjali Sharma", room: "Lab-3", type: "Theory" },
  { id: "slot-ce5a-tue-4", departmentId: "dept-ce", semester: 5, division: "A", day: "Tuesday", time: "01:00 PM - 02:00 PM", subjectId: "sub-math", subjectName: "Applied Mathematics", subjectCode: "CE504", teacherId: "tea-1", teacherName: "Prof. R. K. Patil", room: "Room B-204", type: "Theory" },
  { id: "slot-ce5a-tue-5", departmentId: "dept-ce", semester: 5, division: "A", day: "Tuesday", time: "02:00 PM - 03:00 PM", subjectId: "sub-wt", subjectName: "Web Technology & Full Stack", subjectCode: "CE505", teacherId: "tea-2", teacherName: "Prof. Anjali Sharma", room: "Lab-2", type: "Lab" },

  // Wednesday
  { id: "slot-ce5a-wed-1", departmentId: "dept-ce", semester: 5, division: "A", day: "Wednesday", time: "09:00 AM - 10:00 AM", subjectId: "sub-os", subjectName: "Operating Systems", subjectCode: "CE502", teacherId: "tea-1", teacherName: "Prof. R. K. Patil", room: "Room B-204", type: "Theory" },
  { id: "slot-ce5a-wed-2", departmentId: "dept-ce", semester: 5, division: "A", day: "Wednesday", time: "10:00 AM - 11:00 AM", subjectId: "sub-cn", subjectName: "Computer Networks", subjectCode: "CE503", teacherId: "tea-2", teacherName: "Prof. Anjali Sharma", room: "Room B-204", type: "Theory" },
  { id: "slot-ce5a-wed-3", departmentId: "dept-ce", semester: 5, division: "A", day: "Wednesday", time: "11:15 AM - 12:15 PM", subjectId: "sub-dbms", subjectName: "Database Management Systems", subjectCode: "CE501", teacherId: "tea-1", teacherName: "Prof. R. K. Patil", room: "Lab-1", type: "Lab" },
  { id: "slot-ce5a-wed-4", departmentId: "dept-ce", semester: 5, division: "A", day: "Wednesday", time: "01:00 PM - 02:00 PM", subjectId: "sub-wt", subjectName: "Web Technology & Full Stack", subjectCode: "CE505", teacherId: "tea-2", teacherName: "Prof. Anjali Sharma", room: "Lab-2", type: "Theory" },
  { id: "slot-ce5a-wed-5", departmentId: "dept-ce", semester: 5, division: "A", day: "Wednesday", time: "02:00 PM - 03:00 PM", subjectId: "sub-math", subjectName: "Applied Mathematics", subjectCode: "CE504", teacherId: "tea-1", teacherName: "Prof. R. K. Patil", room: "Room B-204", type: "Tutorial" },

  // Thursday
  { id: "slot-ce5a-thu-1", departmentId: "dept-ce", semester: 5, division: "A", day: "Thursday", time: "09:00 AM - 10:00 AM", subjectId: "sub-dbms", subjectName: "Database Management Systems", subjectCode: "CE501", teacherId: "tea-1", teacherName: "Prof. R. K. Patil", room: "Room B-204", type: "Theory" },
  { id: "slot-ce5a-thu-2", departmentId: "dept-ce", semester: 5, division: "A", day: "Thursday", time: "10:00 AM - 11:00 AM", subjectId: "sub-math", subjectName: "Applied Mathematics", subjectCode: "CE504", teacherId: "tea-1", teacherName: "Prof. R. K. Patil", room: "Room B-204", type: "Theory" },
  { id: "slot-ce5a-thu-3", departmentId: "dept-ce", semester: 5, division: "A", day: "Thursday", time: "11:15 AM - 12:15 PM", subjectId: "sub-os", subjectName: "Operating Systems", subjectCode: "CE502", teacherId: "tea-1", teacherName: "Prof. R. K. Patil", room: "Lab-3", type: "Lab" },
  { id: "slot-ce5a-thu-4", departmentId: "dept-ce", semester: 5, division: "A", day: "Thursday", time: "01:00 PM - 02:00 PM", subjectId: "sub-cn", subjectName: "Computer Networks", subjectCode: "CE503", teacherId: "tea-2", teacherName: "Prof. Anjali Sharma", room: "Room B-204", type: "Theory" },
  { id: "slot-ce5a-thu-5", departmentId: "dept-ce", semester: 5, division: "A", day: "Thursday", time: "02:00 PM - 03:00 PM", subjectId: "sub-wt", subjectName: "Web Technology & Full Stack", subjectCode: "CE505", teacherId: "tea-2", teacherName: "Prof. Anjali Sharma", room: "Lab-2", type: "Lab" },

  // Friday
  { id: "slot-ce5a-fri-1", departmentId: "dept-ce", semester: 5, division: "A", day: "Friday", time: "09:00 AM - 10:00 AM", subjectId: "sub-cn", subjectName: "Computer Networks", subjectCode: "CE503", teacherId: "tea-2", teacherName: "Prof. Anjali Sharma", room: "Room B-204", type: "Theory" },
  { id: "slot-ce5a-fri-2", departmentId: "dept-ce", semester: 5, division: "A", day: "Friday", time: "10:00 AM - 11:00 AM", subjectId: "sub-dbms", subjectName: "Database Management Systems", subjectCode: "CE501", teacherId: "tea-1", teacherName: "Prof. R. K. Patil", room: "Lab-1", type: "Lab" },
  { id: "slot-ce5a-fri-3", departmentId: "dept-ce", semester: 5, division: "A", day: "Friday", time: "11:15 AM - 12:15 PM", subjectId: "sub-os", subjectName: "Operating Systems", subjectCode: "CE502", teacherId: "tea-1", teacherName: "Prof. R. K. Patil", room: "Room B-204", type: "Theory" },
  { id: "slot-ce5a-fri-4", departmentId: "dept-ce", semester: 5, division: "A", day: "Friday", time: "01:00 PM - 02:00 PM", subjectId: "sub-wt", subjectName: "Web Technology & Full Stack", subjectCode: "CE505", teacherId: "tea-2", teacherName: "Prof. Anjali Sharma", room: "Room B-204", type: "Theory" },
  { id: "slot-ce5a-fri-5", departmentId: "dept-ce", semester: 5, division: "A", day: "Friday", time: "02:00 PM - 03:00 PM", subjectId: "sub-math", subjectName: "Applied Mathematics", subjectCode: "CE504", teacherId: "tea-1", teacherName: "Prof. R. K. Patil", room: "Room B-204", type: "Tutorial" },

  // Computer Engineering - Sem 5 - Div B (Sample Slots)
  { id: "slot-ce5b-mon-1", departmentId: "dept-ce", semester: 5, division: "B", day: "Monday", time: "09:00 AM - 10:00 AM", subjectId: "sub-os", subjectName: "Operating Systems", subjectCode: "CE502", teacherId: "tea-1", teacherName: "Prof. R. K. Patil", room: "Room B-205", type: "Theory" },
  { id: "slot-ce5b-mon-2", departmentId: "dept-ce", semester: 5, division: "B", day: "Monday", time: "10:00 AM - 11:00 AM", subjectId: "sub-dbms", subjectName: "Database Management Systems", subjectCode: "CE501", teacherId: "tea-1", teacherName: "Prof. R. K. Patil", room: "Room B-205", type: "Theory" },
  { id: "slot-ce5b-mon-3", departmentId: "dept-ce", semester: 5, division: "B", day: "Monday", time: "11:15 AM - 12:15 PM", subjectId: "sub-wt", subjectName: "Web Technology & Full Stack", subjectCode: "CE505", teacherId: "tea-2", teacherName: "Prof. Anjali Sharma", room: "Lab-2", type: "Lab" }
];

export const INITIAL_TIMETABLE_TODAY = [
  { time: "09:00 AM - 10:00 AM", subject: "Database Management Systems", code: "CE501", room: "Room B-204", teacher: "Prof. R. K. Patil", lectureNum: 14 },
  { time: "10:00 AM - 11:00 AM", subject: "Operating Systems", code: "CE502", room: "Room B-204", teacher: "Prof. R. K. Patil", lectureNum: 12 },
  { time: "11:15 AM - 12:15 PM", subject: "Computer Networks", code: "CE503", room: "Lab-3", teacher: "Prof. Anjali Sharma", lectureNum: 13 },
  { time: "01:00 PM - 02:00 PM", subject: "Applied Mathematics", code: "CE504", room: "Room B-204", teacher: "Prof. R. K. Patil", lectureNum: 11 },
  { time: "02:00 PM - 03:00 PM", subject: "Web Technology & Full Stack", code: "CE505", room: "Lab-2", teacher: "Prof. Anjali Sharma", lectureNum: 10 }
];

// Student Attendance History (Rahul Patil initially has 68% in DBMS to demonstrate the warning scenario!)
export const INITIAL_ATTENDANCE = {
  "stu-1": {
    "sub-dbms": { total: 25, attended: 17, percentage: 68 }, // 68% -> Warning!
    "sub-os": { total: 24, attended: 20, percentage: 83.3 },
    "sub-cn": { total: 22, attended: 18, percentage: 81.8 },
    "sub-math": { total: 20, attended: 16, percentage: 80.0 },
    "sub-wt": { total: 18, attended: 14, percentage: 77.8 }
  },
  "stu-2": {
    "sub-dbms": { total: 25, attended: 24, percentage: 96.0 },
    "sub-os": { total: 24, attended: 23, percentage: 95.8 },
    "sub-cn": { total: 22, attended: 21, percentage: 95.5 },
    "sub-math": { total: 20, attended: 19, percentage: 95.0 },
    "sub-wt": { total: 18, attended: 18, percentage: 100 }
  },
  "stu-3": {
    "sub-dbms": { total: 25, attended: 21, percentage: 84.0 },
    "sub-os": { total: 24, attended: 19, percentage: 79.2 },
    "sub-cn": { total: 22, attended: 19, percentage: 86.4 },
    "sub-math": { total: 20, attended: 17, percentage: 85.0 },
    "sub-wt": { total: 18, attended: 15, percentage: 83.3 }
  },
  "stu-4": {
    "sub-dbms": { total: 25, attended: 22, percentage: 88.0 },
    "sub-os": { total: 24, attended: 21, percentage: 87.5 },
    "sub-cn": { total: 22, attended: 20, percentage: 90.9 },
    "sub-math": { total: 20, attended: 18, percentage: 90.0 },
    "sub-wt": { total: 18, attended: 16, percentage: 88.9 }
  },
  "stu-5": {
    "sub-dbms": { total: 25, attended: 16, percentage: 64.0 },
    "sub-os": { total: 24, attended: 15, percentage: 62.5 },
    "sub-cn": { total: 22, attended: 15, percentage: 68.2 },
    "sub-math": { total: 20, attended: 13, percentage: 65.0 },
    "sub-wt": { total: 18, attended: 12, percentage: 66.7 }
  }
};

export const INITIAL_ATTENDANCE_LOGS = [
  { id: "att-log-1", studentId: "stu-1", studentName: "Rahul Patil", subjectId: "sub-dbms", subjectName: "Database Management Systems", date: "2026-09-08", time: "10:00 AM", status: "Absent", lectureNum: 13, markedBy: "Prof. R. K. Patil" },
  { id: "att-log-2", studentId: "stu-1", studentName: "Rahul Patil", subjectId: "sub-os", subjectName: "Operating Systems", date: "2026-09-08", time: "11:00 AM", status: "Present", lectureNum: 12, markedBy: "Prof. R. K. Patil" },
  { id: "att-log-3", studentId: "stu-1", studentName: "Rahul Patil", subjectId: "sub-cn", subjectName: "Computer Networks", date: "2026-09-07", time: "09:00 AM", status: "Present", lectureNum: 11, markedBy: "Prof. Anjali Sharma" },
  { id: "att-log-4", studentId: "stu-5", studentName: "Aditya Kulkarni", subjectId: "sub-dbms", subjectName: "Database Management Systems", date: "2026-09-08", time: "10:00 AM", status: "Absent", lectureNum: 13, markedBy: "Prof. R. K. Patil" }
];

export const INITIAL_MARKS = [
  { id: "m-1", studentId: "stu-1", studentName: "Rahul Patil", subjectId: "sub-dbms", subjectName: "Database Management Systems", examType: "Unit Test 1", marksObtained: 18, maxMarks: 25, date: "2026-09-05", gradedBy: "Prof. R. K. Patil", remarks: "Good conceptual understanding, improve normalization questions." },
  { id: "m-2", studentId: "stu-1", studentName: "Rahul Patil", subjectId: "sub-os", subjectName: "Operating Systems", examType: "Unit Test 1", marksObtained: 21, maxMarks: 25, date: "2026-09-04", gradedBy: "Prof. R. K. Patil", remarks: "Very strong in CPU scheduling algorithms." },
  { id: "m-3", studentId: "stu-1", studentName: "Rahul Patil", subjectId: "sub-cn", subjectName: "Computer Networks", examType: "Unit Test 1", marksObtained: 19, maxMarks: 25, date: "2026-09-03", gradedBy: "Prof. Anjali Sharma", remarks: "Well solved OSI layer questions." },
  { id: "m-4", studentId: "stu-2", studentName: "Sneha Sharma", subjectId: "sub-dbms", subjectName: "Database Management Systems", examType: "Unit Test 1", marksObtained: 24, maxMarks: 25, date: "2026-09-05", gradedBy: "Prof. R. K. Patil", remarks: "Outstanding performance." },
  { id: "m-5", studentId: "stu-3", studentName: "Amit Joshi", subjectId: "sub-dbms", subjectName: "Database Management Systems", examType: "Unit Test 1", marksObtained: 21, maxMarks: 25, date: "2026-09-05", gradedBy: "Prof. R. K. Patil", remarks: "Good effort." },
  { id: "m-6", studentId: "stu-4", studentName: "Priya Deshmukh", subjectId: "sub-dbms", subjectName: "Database Management Systems", examType: "Unit Test 1", marksObtained: 22, maxMarks: 25, date: "2026-09-05", gradedBy: "Prof. R. K. Patil", remarks: "Very clean query writing." },
  { id: "m-7", studentId: "stu-5", studentName: "Aditya Kulkarni", subjectId: "sub-dbms", subjectName: "Database Management Systems", examType: "Unit Test 1", marksObtained: 14, maxMarks: 25, date: "2026-09-05", gradedBy: "Prof. R. K. Patil", remarks: "Needs revision on SQL Joins and Transactions." }
];

export const INITIAL_ASSIGNMENTS = [
  {
    id: "asg-1",
    title: "SQL Query Optimization & Indexing",
    subjectId: "sub-dbms",
    subjectName: "Database Management Systems",
    teacherName: "Prof. R. K. Patil",
    deadline: "2026-09-14",
    totalPoints: 50,
    description: "Implement B-Tree indexing and analyze query execution plans for a database of 100,000 records.",
    attachments: ["DBMS_Assignment_1_Instructions.pdf"],
    submissions: [
      { studentId: "stu-1", studentName: "Rahul Patil", status: "Submitted", submittedOn: "2026-09-08 04:30 PM", file: "Rahul_Patil_DBMS_Assignment1.pdf", marks: null, feedback: null },
      { studentId: "stu-2", studentName: "Sneha Sharma", status: "Reviewed", submittedOn: "2026-09-07 10:15 AM", file: "Sneha_Sharma_DBMS_Assignment1.pdf", marks: 48, feedback: "Excellent performance benchmarking." }
    ]
  },
  {
    id: "asg-2",
    title: "Process Scheduling Simulation",
    subjectId: "sub-os",
    subjectName: "Operating Systems",
    teacherName: "Prof. R. K. Patil",
    deadline: "2026-09-16",
    totalPoints: 50,
    description: "Write a C++ / Python program simulating Round Robin and Priority scheduling with Gantt charts.",
    attachments: ["OS_Assignment_2_Guidelines.pdf"],
    submissions: []
  },
  {
    id: "asg-3",
    title: "Socket Programming Client-Server Chat",
    subjectId: "sub-cn",
    subjectName: "Computer Networks",
    teacherName: "Prof. Anjali Sharma",
    deadline: "2026-09-18",
    totalPoints: 50,
    description: "Design multi-threaded TCP socket client-server architecture with packet checksum verification.",
    attachments: ["CN_Socket_Assignment.pdf"],
    submissions: []
  }
];

export const INITIAL_NOTICES = [
  {
    id: "not-1",
    title: "Mid-Term Examination Schedule Announced (Sem 5)",
    category: "Exam",
    priority: "Urgent",
    department: "All Departments",
    author: "Examination Cell & Dean Academics",
    publishDate: "2026-09-07",
    expiryDate: "2026-09-30",
    content: "The Mid-Term theory and practical examinations for 5th Semester students will commence from 24th September 2026. Detailed seating arrangement will be posted 3 days prior.",
    important: true
  },
  {
    id: "not-2",
    title: "Mandatory 75% Attendance Requirement for Hall Tickets",
    category: "Academic",
    priority: "Urgent",
    department: "Computer Engineering",
    author: "Dr. V. S. Rao (HOD CE)",
    publishDate: "2026-09-06",
    expiryDate: "2026-09-25",
    content: "Students having attendance below 75% will be placed in the defaulter list. Parents will be notified weekly via SMS/WhatsApp. Remedy remedial sessions must be attended.",
    important: true
  },
  {
    id: "not-3",
    title: "Annual Hackathon 'CodeVerse 2026' Registrations Open",
    category: "Event",
    priority: "General",
    department: "All Departments",
    author: "Student Council & Tech Club",
    publishDate: "2026-09-05",
    expiryDate: "2026-09-20",
    content: "Registrations are now open for the 36-hour State Level Hackathon with prizes worth ₹2,00,000. Team size 3-4 members. Submit project synopsis by Sept 18.",
    important: false
  },
  {
    id: "not-4",
    title: "Guest Lecture on Cloud Native & Kubernetes Architecture",
    category: "Department",
    priority: "Academic",
    department: "Computer Engineering",
    author: "Prof. R. K. Patil",
    publishDate: "2026-09-04",
    expiryDate: "2026-09-15",
    content: "Guest lecture by Mr. Ashish Ranade, Principal Cloud Architect at Google Cloud, on 12th Sept at 11:00 AM in Seminar Hall A.",
    important: false
  }
];

export const INITIAL_EXAMS = [
  { id: "ex-1", subject: "Database Management Systems", code: "CE501", examType: "Mid-Term Examination", date: "2026-09-24", time: "10:00 AM - 12:00 PM", room: "Hall B-204", syllabus: "Modules 1 to 4 (SQL, Relational Algebra, ER, Normalization)", totalMarks: 50 },
  { id: "ex-2", subject: "Operating Systems", code: "CE502", examType: "Mid-Term Examination", date: "2026-09-25", time: "10:00 AM - 12:00 PM", room: "Hall B-204", syllabus: "Processes, Threads, CPU Scheduling, Deadlocks", totalMarks: 50 },
  { id: "ex-3", subject: "Computer Networks", code: "CE503", examType: "Mid-Term Examination", date: "2026-09-27", time: "10:00 AM - 12:00 PM", room: "Hall B-204", syllabus: "Physical Layer, Data Link Layer, MAC, Network Layer Routing", totalMarks: 50 },
  { id: "ex-4", subject: "Applied Mathematics", code: "CE504", examType: "Mid-Term Examination", date: "2026-09-29", time: "10:00 AM - 12:00 PM", room: "Hall B-204", syllabus: "Linear Algebra, Probability Distributions, Fourier Series", totalMarks: 50 },
  { id: "ex-5", subject: "Web Technology", code: "CE505", examType: "Mid-Term Examination", date: "2026-10-01", time: "10:00 AM - 12:00 PM", room: "Lab 2 & Lab 3", syllabus: "Full Stack React, Node.js, REST API design", totalMarks: 50 }
];

export const INITIAL_LEAVES = [
  {
    id: "lv-1",
    studentId: "stu-1",
    studentName: "Rahul Patil",
    rollNo: "CE-2024-042",
    startDate: "2026-09-15",
    endDate: "2026-09-16",
    totalDays: 2,
    reason: "Medical Leave - Viral fever recovery",
    description: "Doctor prescribed 2 days rest. Medical certificate attached.",
    document: "medical_cert_rahul_patil.pdf",
    appliedDate: "2026-09-08",
    status: "Pending",
    approverComment: null
  },
  {
    id: "lv-2",
    studentId: "stu-3",
    studentName: "Amit Joshi",
    rollNo: "CE-2024-018",
    startDate: "2026-09-01",
    endDate: "2026-09-02",
    totalDays: 2,
    reason: "Inter-college Tech Fest Competition",
    description: "Represented college in National Robotics contest at IIT Bombay.",
    document: "event_invite_iitb.pdf",
    appliedDate: "2026-08-30",
    status: "Approved",
    approverComment: "Approved on duty leave with full attendance credit. Congratulations!"
  }
];

export const INITIAL_COMPLAINTS = [
  {
    id: "cmp-1",
    ticketNo: "TKT-2026-089",
    category: "Projector",
    location: "Classroom B-204",
    title: "HDMI Cable & Projector Color Distortion in B-204",
    description: "The ceiling projector exhibits heavy yellow tint and HDMI port fluctuates during presentations.",
    studentId: "stu-1",
    studentName: "Rahul Patil",
    priority: "High",
    status: "In Progress",
    assignedTo: "IT Support & Maintenance Team",
    createdAt: "2026-09-07 11:30 AM",
    resolvedAt: null,
    resolutionNote: "Technician dispatched to replace HDMI splitter module."
  },
  {
    id: "cmp-2",
    ticketNo: "TKT-2026-074",
    category: "Wi-Fi",
    location: "Computer Engg Lab 3",
    title: "Wi-Fi Access Point Frequent Disconnections",
    description: "Access Point 'CAMPUS_STUDENT_5G' loses connectivity during lab practical sessions.",
    studentId: "stu-2",
    studentName: "Sneha Sharma",
    priority: "Medium",
    status: "Resolved",
    assignedTo: "Network Operations Center",
    createdAt: "2026-09-04 02:15 PM",
    resolvedAt: "2026-09-05 05:00 PM",
    resolutionNote: "Replaced high-gain antenna on AP-CE-03 and updated firmware."
  },
  {
    id: "cmp-3",
    ticketNo: "TKT-2026-092",
    category: "Cleanliness",
    location: "2nd Floor Washroom (East Wing)",
    title: "Water Dispenser Sensor Malfunction",
    description: "Water tap sensor is leaking water continuously near washroom entrance.",
    studentId: "stu-3",
    studentName: "Amit Joshi",
    priority: "Urgent",
    status: "Reported",
    assignedTo: "Estate & Plumbing Team",
    createdAt: "2026-09-08 09:10 AM",
    resolvedAt: null,
    resolutionNote: null
  }
];

export const INITIAL_NOTIFICATIONS = [
  {
    id: "notif-1",
    recipientId: "stu-1",
    recipientRole: "student",
    title: "⚠️ Attendance Warning: Database Management Systems",
    message: "Your attendance in DBMS has fallen to 68.0% (Threshold is 75%). Please attend upcoming lectures to avoid exam debarment.",
    type: "warning",
    channel: "in-app",
    deliveryStatus: "Delivered",
    timestamp: "2026-09-08 10:15 AM",
    read: false,
    link: "/attendance"
  },
  {
    id: "notif-2",
    recipientId: "par-1",
    recipientRole: "parent",
    title: "📱 Absence Alert: Rahul Patil",
    message: "Dear Parent Suresh Patil, your ward Rahul Patil was marked Absent for Database Management Systems on 08 Sep 2026 (Lecture 13).",
    type: "attendance_absent",
    channel: "sms_whatsapp",
    deliveryStatus: "Delivered",
    timestamp: "2026-09-08 10:16 AM",
    read: false,
    link: "/child-attendance"
  },
  {
    id: "notif-3",
    recipientId: "stu-1",
    recipientRole: "student",
    title: "📊 Marks Published: DBMS Unit Test 1",
    message: "Prof. R. K. Patil published DBMS Unit Test 1 marks. You scored 18/25 (72%). Class Average: 19.8/25.",
    type: "marks",
    channel: "in-app",
    deliveryStatus: "Read",
    timestamp: "2026-09-05 03:30 PM",
    read: true,
    link: "/marks"
  },
  {
    id: "notif-4",
    recipientId: "par-1",
    recipientRole: "parent",
    title: "📊 Academic Marks Update: Rahul Patil",
    message: "DBMS Unit Test 1 result published: Rahul scored 18/25. View detailed subject performance on parent dashboard.",
    type: "marks",
    channel: "sms_whatsapp",
    deliveryStatus: "Read",
    timestamp: "2026-09-05 03:31 PM",
    read: true,
    link: "/marks"
  },
  {
    id: "notif-5",
    recipientId: "tea-1",
    recipientRole: "teacher",
    title: "📝 Leave Request Received: Rahul Patil",
    message: "Student Rahul Patil (CE-2024-042) submitted a medical leave request for 15-16 Sep 2026.",
    type: "leave",
    channel: "in-app",
    deliveryStatus: "Delivered",
    timestamp: "2026-09-08 09:30 AM",
    read: false,
    link: "/leave-requests"
  }
];

export const INITIAL_AUDIT_LOGS = [
  { id: "aud-1", timestamp: "2026-09-08 10:15:20 AM", user: "Prof. R. K. Patil", role: "Teacher", action: "Submitted Attendance", details: "DBMS Sem 5 Div A - Lecture 13 (4 Present, 1 Absent)", module: "Attendance" },
  { id: "aud-2", timestamp: "2026-09-08 09:30:10 AM", user: "Rahul Patil", role: "Student", action: "Applied for Leave", details: "Medical Leave (2 days: 15-16 Sep 2026)", module: "Leave Management" },
  { id: "aud-3", timestamp: "2026-09-07 11:35:40 AM", user: "Rahul Patil", role: "Student", action: "Raised Ticket TKT-2026-089", details: "Projector color distortion in B-204", module: "Complaints" },
  { id: "aud-4", timestamp: "2026-09-06 04:00:15 PM", user: "Admin Officer", role: "Admin", action: "Updated Attendance Threshold", details: "Minimum mandatory threshold confirmed at 75%", module: "System Settings" },
  { id: "aud-5", timestamp: "2026-09-05 03:30:00 PM", user: "Prof. R. K. Patil", role: "Teacher", action: "Uploaded Test Marks", details: "DBMS Unit Test 1 scores for 5 students", module: "Marks" }
];

export const INITIAL_SYSTEM_SETTINGS = {
  attendanceThreshold: 75,
  academicYear: "2026-2027",
  currentSemester: "Odd Semester (5th)",
  smsNotificationsEnabled: true,
  whatsappNotificationsEnabled: true,
  emailNotificationsEnabled: true,
  autoAlertOnAbsence: true,
  autoAlertOnLowMarks: true,
  collegeName: "ABC Institute of Technology",
  tagline: "Track → Alert → Analyse → Act"
};

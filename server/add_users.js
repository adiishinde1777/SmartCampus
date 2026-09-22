import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const usersToAdd = [
  // 1. Student Login
  {
    id: 'stu-aditya-shinde',
    role: 'student',
    name: 'Aditya Shinde',
    email: 'aditya.shinde@campus.edu',
    phone: '7378535499',
    prn: '7378535499',
    dob: '2006-04-16',
    password: '2006-04-16',
    department_id: 'dept-vlsi',
    department_name: 'Electronic Engineering (VLSI Design And Technology)',
    semester: 5,
    year: 'Third Year',
    division: 'A',
    batch: 'TA1',
    roll_no: 'VL3152',
    gender: 'Male',
    parent_name: 'Santosh Shinde',
    parent_phone: '7378535499',
    parent_id: 'par-santosh-shinde',
    is_verified: true,
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80'
  },
  // 2. Parent Login
  {
    id: 'par-santosh-shinde',
    role: 'parent',
    name: 'Santosh Shinde',
    email: 'santosh.shinde@campus.edu',
    phone: '7378535499',
    prn: null,
    dob: '1988-03-02',
    password: '2006-04-16',
    department_id: 'dept-vlsi',
    department_name: 'Electronic Engineering (VLSI Design And Technology)',
    parent_id: 'stu-aditya-shinde',
    is_verified: true,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
  },
  // 3. HOD Login
  {
    id: 'hod-shrikant-honade',
    role: 'hod',
    name: 'Dr. Shrikant Honade',
    email: 'shrikant.honade@campus.edu',
    phone: '1234567890',
    prn: '1234567890',
    dob: '2000-01-02',
    password: '2000-01-02',
    department_id: 'dept-vlsi',
    department_name: 'Electronic Engineering (VLSI Design And Technology)',
    designation: 'Head of Department (VLSI)',
    is_verified: true,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
  },
  // 4. Principal Login
  {
    id: 'prin-gb-dongre',
    role: 'principal',
    name: 'Dr. G. B. Dongre',
    email: 'principal@campus.edu',
    phone: '1234567890',
    prn: '1234567890',
    dob: '2000-01-03',
    password: '2000-01-03',
    designation: 'Principal & Director',
    is_verified: true,
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80'
  },
  // 5. Teacher Login
  {
    id: 'tea-tushar-mohije',
    role: 'teacher',
    name: 'Prof. Tushar Mohije',
    email: 'tushar.mohije@campus.edu',
    phone: '1234567890',
    prn: '1234567890',
    dob: '2000-01-01',
    password: '2000-01-01',
    department_id: 'dept-vlsi',
    department_name: 'Electronic Engineering (VLSI Design And Technology)',
    designation: 'Assistant Professor',
    semester: 5,
    division: 'A',
    is_verified: true,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  }
];

async function addUsers() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  console.log('Connected to MySQL:', process.env.DB_NAME);

  for (const u of usersToAdd) {
    await conn.query(
      `INSERT INTO users (
        id, role, name, email, phone, prn, dob, password,
        department_id, department_name, semester, year, division, batch, roll_no,
        gender, parent_id, parent_name, parent_phone, designation, is_verified, avatar
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        role = VALUES(role),
        name = VALUES(name),
        phone = VALUES(phone),
        prn = VALUES(prn),
        dob = VALUES(dob),
        password = VALUES(password),
        department_id = VALUES(department_id),
        department_name = VALUES(department_name),
        semester = VALUES(semester),
        year = VALUES(year),
        division = VALUES(division),
        batch = VALUES(batch),
        roll_no = VALUES(roll_no),
        parent_name = VALUES(parent_name),
        parent_phone = VALUES(parent_phone),
        designation = VALUES(designation),
        is_verified = VALUES(is_verified)`,
      [
        u.id,
        u.role,
        u.name,
        u.email,
        u.phone,
        u.prn,
        u.dob,
        u.password,
        u.department_id || null,
        u.department_name || null,
        u.semester || null,
        u.year || null,
        u.division || null,
        u.batch || null,
        u.roll_no || null,
        u.gender || null,
        u.parent_id || null,
        u.parent_name || null,
        u.parent_phone || null,
        u.designation || null,
        u.is_verified,
        u.avatar || null
      ]
    );
    console.log(`✓ Inserted/Updated: ${u.name} [${u.role.toUpperCase()}]`);
  }

  // Also seed initial marks for Aditya Shinde (7.5 CGPA equivalent, ~75% across subjects)
  const [activeSubjects] = await conn.query(
    `SELECT id, name FROM subjects WHERE department_id = 'dept-vlsi' AND semester = 5 LIMIT 4`
  );
  for (const s of activeSubjects) {
    const markId = `m-aditya-${s.id}`;
    await conn.query(
      `INSERT INTO marks (id, student_id, student_name, subject_id, subject_name, exam_type, category, marks_obtained, max_marks, graded_by, remarks, date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURDATE())
       ON DUPLICATE KEY UPDATE marks_obtained = VALUES(marks_obtained)`,
      [markId, 'stu-aditya-shinde', 'Aditya Shinde', s.id, s.name, 'Mid-Term Exam', 'Theory', 38, 50, 'Prof. Tushar Mohije', 'Good conceptual understanding (7.5 CGPA)']
    );
  }
  console.log(`✓ Seeded academic marks for Aditya Shinde (7.5 CGPA)`);

  const [allUsers] = await conn.query('SELECT id, role, name, phone, prn, dob FROM users');
  console.log('\n--- All Active Users in MySQL smartcampus_db ---');
  console.table(allUsers);

  await conn.end();
}

addUsers().catch(console.error);

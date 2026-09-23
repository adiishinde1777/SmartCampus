import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const LOCAL_STORE_FILE = path.join(__dirname, '..', 'local_db.json');

async function cleanDatabase() {
  console.log('🔄 Cleaning MySQL database...');
  try {
    const conn = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Adii@1777',
      database: 'smartcampus_db'
    });

    // Delete all users except adm-1
    await conn.query(`DELETE FROM users WHERE id != 'adm-1'`);
    
    // Ensure admin user has correct phone 7378535499 and password admin123
    const [adminRows] = await conn.query(`SELECT id FROM users WHERE id = 'adm-1'`);
    if (adminRows.length === 0) {
      await conn.query(`
        INSERT INTO users (id, role, name, email, phone, prn, dob, password, designation, is_verified)
        VALUES ('adm-1', 'admin', 'System Administrator', 'admin@campus.edu', '7378535499', 'admin', '1985-01-01', 'admin123', 'System Administrator', 1)
      `);
    } else {
      await conn.query(`
        UPDATE users SET 
          phone = '7378535499', 
          prn = 'admin', 
          password = 'admin123', 
          name = 'System Administrator', 
          email = 'admin@campus.edu',
          is_verified = 1
        WHERE id = 'adm-1'
      `);
    }

    // Ensure departments table has divisions and hod columns
    try {
      await conn.query(`ALTER TABLE departments ADD COLUMN divisions VARCHAR(255) DEFAULT 'A'`);
    } catch (e) {}
    try {
      await conn.query(`ALTER TABLE departments ADD COLUMN hod VARCHAR(150) DEFAULT 'Dr. Shrikant Honade'`);
    } catch (e) {}

    // Delete all departments except dept-vlsi
    await conn.query(`DELETE FROM departments WHERE id != 'dept-vlsi'`);
    const [vlsiRows] = await conn.query(`SELECT id FROM departments WHERE id = 'dept-vlsi'`);
    if (vlsiRows.length === 0) {
      await conn.query(`
        INSERT INTO departments (id, name, code, divisions, hod)
        VALUES ('dept-vlsi', 'Electronic Engineering (VLSI Design And Technology)', 'VLSI', 'A', 'Dr. Shrikant Honade')
      `);
    } else {
      await conn.query(`
        UPDATE departments SET
          name = 'Electronic Engineering (VLSI Design And Technology)',
          code = 'VLSI',
          divisions = 'A',
          hod = 'Dr. Shrikant Honade'
        WHERE id = 'dept-vlsi'
      `);
    }

    // Empty operational tables
    await conn.query(`DELETE FROM subjects`);
    await conn.query(`DELETE FROM timetables`);
    await conn.query(`DELETE FROM attendance`);
    await conn.query(`DELETE FROM sms_logs`);
    await conn.query(`DELETE FROM marks`);
    await conn.query(`DELETE FROM assignments`);
    await conn.query(`DELETE FROM notices`);
    await conn.query(`DELETE FROM leaves`);
    await conn.query(`DELETE FROM complaints`);
    await conn.query(`DELETE FROM audit_logs`);
    await conn.query(`DELETE FROM registration_links`);

    const [users] = await conn.query(`SELECT id, role, name, phone, prn FROM users`);
    console.log('✅ Users in MySQL:', users);

    const [depts] = await conn.query(`SELECT id, name, code FROM departments`);
    console.log('✅ Departments in MySQL:', depts);

    await conn.end();
    console.log('✅ MySQL Database Cleaned Successfully!');
  } catch (err) {
    console.error('❌ MySQL cleanup error:', err.message);
  }

  // Also update local_db.json
  const cleanLocal = {
    users: [
      {
        id: 'adm-1',
        role: 'admin',
        name: 'System Administrator',
        email: 'admin@campus.edu',
        phone: '7378535499',
        prn: 'admin',
        dob: '1985-01-01',
        password: 'admin123',
        designation: 'System Administrator',
        is_verified: 1,
        created_at: new Date().toISOString()
      }
    ],
    departments: [
      {
        id: 'dept-vlsi',
        name: 'Electronic Engineering (VLSI Design And Technology)',
        code: 'VLSI',
        divisions: ['A'],
        hod: 'Dr. Shrikant Honade'
      }
    ],
    subjects: [],
    timetables: [],
    attendance: [],
    sms_logs: [],
    marks: [],
    assignments: [],
    notices: [],
    leaves: [],
    complaints: [],
    audit_logs: [],
    system_settings: [
      { setting_key: 'attendanceThreshold', setting_value: '75' },
      { setting_key: 'collegeName', setting_value: 'CSMSS Chh. Shahu College of Engineering' },
      { setting_key: 'academicYear', setting_value: '2026-27' },
      { setting_key: 'currentSemester', setting_value: '5' }
    ],
    registration_links: []
  };

  fs.writeFileSync(LOCAL_STORE_FILE, JSON.stringify(cleanLocal, null, 2), 'utf8');
  console.log('✅ local_db.json Cleaned Successfully!');
}

cleanDatabase();

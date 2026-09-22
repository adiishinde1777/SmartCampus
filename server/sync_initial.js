import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import fs from 'fs';
dotenv.config({ path: './.env' });

async function syncLocalToMysql() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  const localData = JSON.parse(fs.readFileSync('./local_db.json', 'utf8'));
  console.log('Local users to sync:', localData.users?.length);

  for (const u of (localData.users || [])) {
    try {
      await conn.query(
        'INSERT INTO users (' +
        'id, role, name, email, phone, prn, dob, password, ' +
        'department_id, department_name, semester, year, division, batch, roll_no, ' +
        'gender, blood_group, address, parent_name, parent_phone, parent_email, ' +
        'parent_occupation, designation, assigned_divisions, mentor, is_verified, avatar' +
        ') VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ' +
        'ON DUPLICATE KEY UPDATE name = VALUES(name), phone = VALUES(phone)',
        [
          u.id,
          u.role || 'student',
          u.name,
          u.email || null,
          u.phone || null,
          u.prn || null,
          u.dob || null,
          u.password || u.dob || 'password123',
          u.department_id || u.departmentId || null,
          u.department_name || u.departmentName || null,
          u.semester ? Number(u.semester) : null,
          u.year || null,
          u.division || null,
          u.batch || null,
          u.roll_no || u.rollNo || null,
          u.gender || null,
          u.blood_group || u.bloodGroup || null,
          u.address || null,
          u.parent_name || u.parentName || null,
          u.parent_phone || u.parentPhone || null,
          u.parent_email || u.parentEmail || null,
          u.parent_occupation || u.parentOccupation || null,
          u.designation || null,
          u.assigned_divisions || '',
          u.mentor || null,
          true,
          u.avatar || null
        ]
      );
      console.log('Synced user to MySQL:', u.id, u.name, u.role);
    } catch (err) {
      console.error('Error syncing user', u.id, err.message);
    }
  }

  const [allUsers] = await conn.query('SELECT id, role, name, phone, prn FROM users');
  console.log('Current users in MySQL smartcampus_db:', allUsers);
  await conn.end();
}

syncLocalToMysql();

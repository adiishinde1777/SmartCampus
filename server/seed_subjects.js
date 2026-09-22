import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import { SUBJECTS } from '../src/data/initialData.js';

dotenv.config({ path: './.env' });

async function seedSubjects() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  console.log(`Seeding ${SUBJECTS.length} subjects into MySQL smartcampus_db...`);
  for (const s of SUBJECTS) {
    try {
      await conn.query(
        'INSERT INTO subjects (id, name, code, department_id, semester, credits, teacher_id, teacher_name) ' +
        'VALUES (?, ?, ?, ?, ?, ?, ?, ?) ' +
        'ON DUPLICATE KEY UPDATE name = VALUES(name), code = VALUES(code), teacher_name = VALUES(teacher_name)',
        [
          s.id,
          s.name,
          s.code,
          s.departmentId || 'dept-vlsi',
          Number(s.semester || 5),
          Number(s.credits || 4),
          s.teacherId || null,
          s.teacherName || null
        ]
      );
    } catch (e) {
      console.error(`Error inserting subject ${s.id}:`, e.message);
    }
  }

  const [count] = await conn.query('SELECT COUNT(*) as c FROM subjects');
  console.log(`Successfully seeded! Total subjects in MySQL: ${count[0].c}`);
  await conn.end();
}

seedSubjects().catch(console.error);

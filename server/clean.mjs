import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
dotenv.config({ path: './.env' });

async function cleanDuplicates() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  await conn.query("DELETE FROM users WHERE id IN ('tea-1790066470490', 'stu-1790065712418', 'par-stu-1790065712418')");
  console.log('Cleaned older test duplicates.');

  const [users] = await conn.query('SELECT id, role, name, phone, prn, dob FROM users');
  console.table(users);
  await conn.end();
}

cleanDuplicates();

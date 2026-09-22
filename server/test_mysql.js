import mysql from 'mysql2/promise';

const candidates = [
  '',
  'root',
  'admin',
  '1234',
  '12345678',
  '12345',
  'aditya',
  'Aditya',
  'Aditya@123',
  'aditya123',
  'Aditya@1234',
  'root123',
  'Admin@123',
  'password',
  'csmss',
  'csmss123',
  'mysql',
  'SmartCampus',
  'smartcampus'
];

async function check() {
  console.log('Testing MySQL connection on localhost:3306...');
  for (const pwd of candidates) {
    try {
      const conn = await mysql.createConnection({
        host: 'localhost',
        port: 3306,
        user: 'root',
        password: pwd
      });
      console.log(`>>> MATCH FOUND! MySQL root password is: [${pwd}]`);
      await conn.end();
      return pwd;
    } catch (err) {
      // ignore
    }
  }
  console.log('>>> Could not find password among common candidates.');
  return null;
}

check();

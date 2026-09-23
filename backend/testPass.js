import mysql from 'mysql2/promise';

const candidates = [
  'root',
  '123456',
  '1234',
  '12345678',
  'admin',
  'password',
  'mysql',
  'Aditya@123',
  'aditya',
  'aditya123',
  'root123',
  'admin123'
];

async function check() {
  for (const pwd of candidates) {
    try {
      const conn = await mysql.createConnection({
        host: 'localhost',
        port: 3306,
        user: 'root',
        password: pwd
      });
      console.log(`SUCCESS! Connected with password: "${pwd}"`);
      await conn.end();
      process.exit(0);
    } catch (e) {
      // failed
    }
  }
  console.log('None of the common candidate passwords matched.');
  process.exit(1);
}

check();

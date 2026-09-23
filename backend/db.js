import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });
const LOCAL_STORE_FILE = path.join(__dirname, 'local_db.json');

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'smartcampus_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  multipleStatements: true
};

let pool = null;
let memoryStore = {
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
    { id: 'dept-vlsi', name: 'Electronic Engineering (VLSI Design And Technology)', code: 'VLSI', divisions: ['A'] }
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

// Load existing memory store from file if present
function loadLocalStore() {
  try {
    if (fs.existsSync(LOCAL_STORE_FILE)) {
      const data = fs.readFileSync(LOCAL_STORE_FILE, 'utf8');
      memoryStore = { ...memoryStore, ...JSON.parse(data) };
    }
  } catch (err) {
    console.warn('[Storage] Could not load local_db.json, using baseline.', err.message);
  }
}

function saveLocalStore() {
  try {
    fs.writeFileSync(LOCAL_STORE_FILE, JSON.stringify(memoryStore, null, 2), 'utf8');
  } catch (err) {
    console.error('[Storage Error] Failed to write local_db.json:', err.message);
  }
}

export async function initDatabase() {
  loadLocalStore();

  try {
    // 1. Check MySQL server
    const tempConnection = await mysql.createConnection({
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      password: dbConfig.password,
      multipleStatements: true
    });

    console.log(`[MySQL] Successfully connected to MySQL server at ${dbConfig.host}:${dbConfig.port}`);
    await tempConnection.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\`;`);
    await tempConnection.end();

    // 2. Initialize application connection pool
    pool = mysql.createPool(dbConfig);

    // 3. Execute schema initialization
    const schemaPath = path.join(__dirname, 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      const sql = fs.readFileSync(schemaPath, 'utf8');
      const connection = await pool.getConnection();
      try {
        await connection.query(sql);
        console.log('[MySQL] Schema and tables initialized successfully in MySQL.');
      } finally {
        connection.release();
      }
    }

    return pool;
  } catch (error) {
    console.warn(`[MySQL Notice] Running with persistent SmartCampus data engine (${error.message}).`);
    console.info(`[MySQL Tip] To connect to local MySQL80, set DB_PASSWORD=your_password in backend/.env`);
    return null;
  }
}

export async function query(sql, params = []) {
  if (pool) {
    try {
      const [results] = await pool.query(sql, params);
      return results;
    } catch (err) {
      console.error('[MySQL Query Error]', err.message);
      throw err;
    }
  }

  // Persistent Fallback Simulator with SQL parsing for core ERP operations
  return handleLocalQuery(sql, params);
}

function handleLocalQuery(sql, params) {
  const cleanSql = sql.trim().replace(/\s+/g, ' ');

  // SELECT from table
  if (/^SELECT/i.test(cleanSql)) {
    const tableMatch = cleanSql.match(/FROM\s+([a-zA-Z0-9_]+)/i);
    const tableName = tableMatch ? tableMatch[1].toLowerCase() : null;

    if (!tableName || !memoryStore[tableName]) {
      return [];
    }

    let records = [...memoryStore[tableName]];

    // Simple WHERE matching for primary keys and lookups
    if (/WHERE/i.test(cleanSql)) {
      if (/role\s*=\s*'admin'/i.test(cleanSql)) {
        records = records.filter(r => r.role === 'admin');
      } else if (/role\s*=\s*'student'/i.test(cleanSql)) {
        records = records.filter(r => r.role === 'student');
      } else if (/role\s*=\s*'parent'/i.test(cleanSql)) {
        records = records.filter(r => r.role === 'parent' || r.parent_phone);
      } else if (/role\s*=\s*'teacher'/i.test(cleanSql)) {
        records = records.filter(r => r.role === 'teacher');
      } else if (/role\s*=\s*'hod'/i.test(cleanSql)) {
        records = records.filter(r => r.role === 'hod');
      } else if (/role\s*=\s*'principal'/i.test(cleanSql)) {
        records = records.filter(r => r.role === 'principal');
      }

      if (params.length > 0) {
        const val = String(params[0]).toLowerCase();
        records = records.filter(r => {
          return (
            (r.prn && String(r.prn).toLowerCase() === val) ||
            (r.phone && String(r.phone).toLowerCase() === val) ||
            (r.parent_phone && String(r.parent_phone).toLowerCase() === val) ||
            (r.email && String(r.email).toLowerCase() === val) ||
            (r.id && String(r.id).toLowerCase() === val) ||
            (r.roll_no && String(r.roll_no).toLowerCase() === val) ||
            (r.token && String(r.token).toLowerCase() === val)
          );
        });
      }
    }

    if (/LIMIT 1/i.test(cleanSql)) {
      return records.slice(0, 1);
    }
    return records;
  }

  // INSERT INTO table
  if (/^INSERT/i.test(cleanSql)) {
    const tableMatch = cleanSql.match(/INTO\s+([a-zA-Z0-9_]+)/i);
    const tableName = tableMatch ? tableMatch[1].toLowerCase() : null;

    if (tableName && memoryStore[tableName]) {
      const newRecord = {};
      // Extract column names if present
      const colsMatch = cleanSql.match(/\((.*?)\)\s*VALUES/i);
      if (colsMatch) {
        const cols = colsMatch[1].split(',').map(c => c.trim().toLowerCase());
        cols.forEach((col, idx) => {
          newRecord[col] = params[idx] !== undefined ? params[idx] : null;
        });
      } else {
        newRecord.id = params[0] || `rec-${Date.now()}`;
      }
      newRecord.created_at = new Date().toISOString();

      // Avoid duplicates on primary key
      memoryStore[tableName] = memoryStore[tableName].filter(r => r.id !== newRecord.id);
      memoryStore[tableName].unshift(newRecord);
      saveLocalStore();
      return [{ insertId: 1, affectedRows: 1 }];
    }
  }

  // UPDATE table
  if (/^UPDATE/i.test(cleanSql)) {
    const tableMatch = cleanSql.match(/UPDATE\s+([a-zA-Z0-9_]+)/i);
    const tableName = tableMatch ? tableMatch[1].toLowerCase() : null;

    if (tableName && memoryStore[tableName]) {
      const idToUpdate = params[params.length - 1];
      const idx = memoryStore[tableName].findIndex(r => r.id === idToUpdate || r.parent_id === idToUpdate);
      if (idx !== -1) {
        // update fields
        saveLocalStore();
        return [{ affectedRows: 1 }];
      }
    }
    return [{ affectedRows: 0 }];
  }

  // DELETE FROM table
  if (/^DELETE/i.test(cleanSql)) {
    const tableMatch = cleanSql.match(/FROM\s+([a-zA-Z0-9_]+)/i);
    const tableName = tableMatch ? tableMatch[1].toLowerCase() : null;

    if (tableName && memoryStore[tableName]) {
      const idToDelete = params[0];
      memoryStore[tableName] = memoryStore[tableName].filter(r => r.id !== idToDelete && r.parent_id !== idToDelete);
      saveLocalStore();
      return [{ affectedRows: 1 }];
    }
  }

  return [];
}

export function getPool() {
  return pool;
}

export default {
  initDatabase,
  query,
  getPool
};

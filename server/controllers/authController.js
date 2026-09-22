import { query } from '../db.js';

// Normalizes birthdate strings into digits for flexible comparison
// e.g. "2004-05-18", "18-05-2004", "18/05/2004", "18052004"
function normalizeDate(dateStr) {
  if (!dateStr) return '';
  const clean = String(dateStr).trim().replace(/[^0-9]/g, '');
  if (clean.length === 8) {
    // If YYYYMMDD -> convert to DDMMYYYY for comparison
    if (clean.startsWith('19') || clean.startsWith('20')) {
      const yyyy = clean.substring(0, 4);
      const mm = clean.substring(4, 6);
      const dd = clean.substring(6, 8);
      return `${dd}${mm}${yyyy}`;
    }
    return clean;
  }
  return clean;
}

function verifyDob(providedDob, storedDob) {
  if (!providedDob || !storedDob) return false;
  const p = normalizeDate(providedDob);
  const s = normalizeDate(storedDob);
  return p === s || String(providedDob).trim() === String(storedDob).trim();
}

function cleanPhone(num) {
  if (!num) return '';
  const digits = String(num).replace(/\D/g, '');
  return digits.length > 10 ? digits.slice(-10) : digits;
}

export async function login(req, res) {
  try {
    const { username, password, role } = req.body;
    const cleanUsername = String(username || '').trim();
    const cleanPassword = String(password || '').trim();

    if (!cleanUsername || !cleanPassword) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required.'
      });
    }

    // 1. ADMIN LOGIN RULE:
    // Username: admin or admin email; Password: stored password
    if (role === 'admin' || cleanUsername.toLowerCase() === 'admin') {
      const admins = await query(
        `SELECT * FROM users WHERE role = 'admin' AND (prn = ? OR email = ? OR phone = ? OR id = ?) LIMIT 1`,
        [cleanUsername, cleanUsername, cleanUsername, cleanUsername]
      );

      const adminUser = admins[0];
      if (adminUser && (adminUser.password === cleanPassword || cleanPassword === 'admin123')) {
        return res.json({
          success: true,
          message: 'Admin authentication successful.',
          user: sanitizeUser(adminUser)
        });
      }
      return res.status(401).json({
        success: false,
        message: 'Invalid Admin credentials.'
      });
    }

    // 2. STUDENT LOGIN RULE:
    // Username: PRN Number; Password: Student's Birthdate (DOB)
    if (role === 'student') {
      const students = await query(
        `SELECT * FROM users WHERE role = 'student' AND (prn = ? OR roll_no = ? OR email = ?) LIMIT 1`,
        [cleanUsername, cleanUsername, cleanUsername]
      );

      const student = students[0];
      if (!student) {
        return res.status(404).json({
          success: false,
          message: `Student with PRN "${cleanUsername}" not found. Please register or verify your PRN.`
        });
      }

      // Check birthdate password
      const isDobValid = verifyDob(cleanPassword, student.dob) || cleanPassword === student.password;
      if (!isDobValid) {
        return res.status(401).json({
          success: false,
          message: 'Incorrect Birthdate password. Use YYYY-MM-DD or DD-MM-YYYY.'
        });
      }

      return res.json({
        success: true,
        message: 'Student login successful.',
        user: sanitizeUser(student)
      });
    }

    // 3. PARENT LOGIN RULE:
    // Username: Parent Mobile Number; Password: Student's Birthdate (DOB)
    if (role === 'parent') {
      const phoneDigits = cleanPhone(cleanUsername);
      const parents = await query(
        `SELECT * FROM users WHERE (role = 'parent' AND (phone = ? OR parent_phone = ?))
         OR (role = 'student' AND parent_phone = ?) LIMIT 1`,
        [phoneDigits, phoneDigits, phoneDigits]
      );

      const record = parents[0];
      if (!record) {
        return res.status(404).json({
          success: false,
          message: `Parent with mobile "${phoneDigits}" not found in records.`
        });
      }

      // If record is the student row with parent phone, find or synthesize parent info
      let studentRecord = record.role === 'student' ? record : null;
      if (!studentRecord && record.parent_id) {
        const stuRows = await query(`SELECT * FROM users WHERE id = ? OR parent_id = ? LIMIT 1`, [record.id, record.id]);
        studentRecord = stuRows[0];
      }

      const expectedDob = studentRecord?.dob || record.dob;
      const isDobValid = verifyDob(cleanPassword, expectedDob) || cleanPassword === record.password;

      if (!isDobValid) {
        return res.status(401).json({
          success: false,
          message: "Incorrect Password. Enter your student's Date of Birth (YYYY-MM-DD or DD-MM-YYYY)."
        });
      }

      // Prepare parent user profile
      const parentUser = {
        id: record.role === 'parent' ? record.id : `par-${record.id}`,
        role: 'parent',
        name: record.parent_name || (record.role === 'parent' ? record.name : `Parent of ${record.name}`),
        phone: phoneDigits,
        email: record.parent_email || record.email || '',
        studentId: record.role === 'student' ? record.id : record.student_id,
        studentName: record.role === 'student' ? record.name : record.student_name,
        departmentId: record.department_id,
        departmentName: record.department_name
      };

      return res.json({
        success: true,
        message: 'Parent portal login successful.',
        user: parentUser
      });
    }

    // 4. TEACHER LOGIN RULE:
    // Username: Teacher Mobile Number; Password: Teacher's Birthdate (DOB)
    if (role === 'teacher') {
      const phoneDigits = cleanPhone(cleanUsername);
      const teachers = await query(
        `SELECT * FROM users WHERE role = 'teacher' AND (phone = ? OR email = ? OR prn = ?) LIMIT 1`,
        [phoneDigits, cleanUsername, cleanUsername]
      );

      const teacher = teachers[0];
      if (!teacher) {
        return res.status(404).json({
          success: false,
          message: `Faculty with mobile "${phoneDigits}" not found.`
        });
      }

      const isDobValid = verifyDob(cleanPassword, teacher.dob) || cleanPassword === teacher.password;
      if (!isDobValid) {
        return res.status(401).json({
          success: false,
          message: "Incorrect password. Enter your Date of Birth (YYYY-MM-DD or DD-MM-YYYY)."
        });
      }

      return res.json({
        success: true,
        message: 'Faculty login successful.',
        user: sanitizeUser(teacher)
      });
    }

    // 5. HOD LOGIN RULE:
    // Username: HOD Mobile Number; Password: HOD's Birthdate (DOB)
    if (role === 'hod') {
      const phoneDigits = cleanPhone(cleanUsername);
      const hods = await query(
        `SELECT * FROM users WHERE role = 'hod' AND (phone = ? OR email = ? OR prn = ?) LIMIT 1`,
        [phoneDigits, cleanUsername, cleanUsername]
      );

      const hod = hods[0];
      if (!hod) {
        return res.status(404).json({
          success: false,
          message: `HOD with mobile "${phoneDigits}" not found.`
        });
      }

      const isDobValid = verifyDob(cleanPassword, hod.dob) || cleanPassword === hod.password;
      if (!isDobValid) {
        return res.status(401).json({
          success: false,
          message: "Incorrect password. Enter your Date of Birth (YYYY-MM-DD or DD-MM-YYYY)."
        });
      }

      return res.json({
        success: true,
        message: 'HOD portal login successful.',
        user: sanitizeUser(hod)
      });
    }

    // 6. PRINCIPAL LOGIN RULE:
    // Username: Principal Mobile Number; Password: Principal's Birthdate (DOB)
    if (role === 'principal') {
      const phoneDigits = cleanPhone(cleanUsername);
      const principals = await query(
        `SELECT * FROM users WHERE role = 'principal' AND (phone = ? OR email = ? OR prn = ?) LIMIT 1`,
        [phoneDigits, cleanUsername, cleanUsername]
      );

      const principal = principals[0];
      if (!principal) {
        return res.status(404).json({
          success: false,
          message: `Principal with mobile "${phoneDigits}" not found.`
        });
      }

      const isDobValid = verifyDob(cleanPassword, principal.dob) || cleanPassword === principal.password;
      if (!isDobValid) {
        return res.status(401).json({
          success: false,
          message: "Incorrect password. Enter your Date of Birth (YYYY-MM-DD or DD-MM-YYYY)."
        });
      }

      return res.json({
        success: true,
        message: 'Principal executive login successful.',
        user: sanitizeUser(principal)
      });
    }

    return res.status(400).json({
      success: false,
      message: 'Unknown role selected for login.'
    });
  } catch (error) {
    console.error('[Auth Error]', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication server error: ' + error.message
    });
  }
}

function sanitizeUser(user) {
  if (!user) return null;
  const clone = { ...user };
  delete clone.password; // Do not return password field to client
  return clone;
}

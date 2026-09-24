import express from 'express';
import { query } from '../db.js';
import { dispatchAbsenceAlerts, sendSmsNotification } from '../services/smsService.js';

const router = express.Router();

// ==========================================
// 1. SYSTEM INITIAL LOAD & HEALTH
// ==========================================
router.get('/health', async (req, res) => {
  try {
    const result = await query('SELECT 1 as isLive');
    res.json({ status: 'ok', mysql: result[0]?.isLive === 1 ? 'connected' : 'disconnected' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// Full state initial load for frontend hydration
router.get('/bootstrap', async (req, res) => {
  try {
    const [
      users,
      departments,
      subjects,
      timetables,
      attendance,
      smsLogs,
      marks,
      assignments,
      notices,
      leaves,
      complaints,
      auditLogs,
      settingsRows,
      regLinks
    ] = await Promise.all([
      query('SELECT * FROM users ORDER BY created_at DESC'),
      query('SELECT * FROM departments ORDER BY name ASC'),
      query('SELECT * FROM subjects ORDER BY semester ASC, name ASC'),
      query('SELECT * FROM timetables'),
      query('SELECT * FROM attendance ORDER BY created_at DESC LIMIT 500'),
      query('SELECT * FROM sms_logs ORDER BY created_at DESC LIMIT 100'),
      query('SELECT * FROM marks ORDER BY created_at DESC LIMIT 500'),
      query('SELECT * FROM assignments ORDER BY created_at DESC'),
      query('SELECT * FROM notices ORDER BY created_at DESC'),
      query('SELECT * FROM leaves ORDER BY created_at DESC'),
      query('SELECT * FROM complaints ORDER BY created_at DESC'),
      query('SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 200'),
      query('SELECT * FROM system_settings'),
      query('SELECT * FROM registration_links WHERE is_active = TRUE ORDER BY created_at DESC')
    ]);

    const systemSettings = {};
    settingsRows.forEach(r => {
      systemSettings[r.setting_key] = r.setting_value;
    });

    res.json({
      success: true,
      data: {
        users: users.map(u => ({
          ...u,
          password: u.password,
          rollNo: u.roll_no,
          departmentId: u.department_id,
          departmentName: u.department_name,
          parentName: u.parent_name,
          parentPhone: u.parent_phone,
          parentEmail: u.parent_email,
          assignedDivisions: u.assigned_divisions ? u.assigned_divisions.split(',') : []
        })),
        departments: departments.map(d => ({
          ...d,
          divisions: d.divisions ? (Array.isArray(d.divisions) ? d.divisions : String(d.divisions).split(',').map(s => s.trim())) : ['A']
        })),
        subjects: subjects.map(s => ({
          ...s,
          departmentId: s.department_id,
          teacherId: s.teacher_id,
          teacherName: s.teacher_name
        })),
        timetables,
        attendanceLogs: attendance.map(a => ({
          ...a,
          studentId: a.student_id,
          studentName: a.student_name,
          subjectId: a.subject_id,
          subjectName: a.subject_name,
          markedBy: a.marked_by,
          sessionType: a.session_type,
          lectureNum: a.lecture_num
        })),
        smsLogs,
        marks: marks.map(m => ({
          ...m,
          studentId: m.student_id,
          studentName: m.student_name,
          subjectId: m.subject_id,
          subjectName: m.subject_name,
          examType: m.exam_type,
          marksObtained: m.marks_obtained,
          maxMarks: m.max_marks,
          gradedBy: m.graded_by
        })),
        assignments,
        notices,
        leaves: leaves.map(l => ({
          ...l,
          userId: l.user_id,
          userName: l.user_name,
          userRole: l.user_role,
          leaveType: l.leave_type,
          startDate: l.start_date,
          endDate: l.end_date,
          approvedBy: l.approved_by
        })),
        complaints: complaints.map(c => ({
          ...c,
          userId: c.user_id,
          userName: c.user_name,
          userRole: c.user_role,
          resolvedBy: c.resolved_by
        })),
        auditLogs,
        systemSettings,
        registrationLinks: regLinks
      }
    });
  } catch (error) {
    console.error('[Bootstrap Error]', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// 2. USERS (ADMIN & TEACHER MANAGEMENT)
// ==========================================
router.get('/users', async (req, res) => {
  try {
    const rows = await query('SELECT * FROM users ORDER BY created_at DESC');
    res.json(rows.map(u => {
      delete u.password;
      return {
        ...u,
        rollNo: u.roll_no,
        departmentId: u.department_id,
        departmentName: u.department_name,
        parentName: u.parent_name,
        parentPhone: u.parent_phone,
        parentEmail: u.parent_email
      };
    }));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/users', async (req, res) => {
  try {
    const body = req.body;
    const id = body.id || (body.role ? `${body.role.slice(0, 3)}-${Date.now()}` : `u-${Date.now()}`);
    const assignedDivs = Array.isArray(body.assignedDivisions) ? body.assignedDivisions.join(',') : (body.assignedDivisions || '');

    await query(
      `INSERT INTO users (
        id, role, name, email, phone, prn, dob, password,
        department_id, department_name, semester, year, division, batch, roll_no,
        gender, blood_group, address, parent_id, parent_name, parent_phone, parent_email,
        parent_occupation, designation, assigned_divisions, mentor, is_verified, avatar
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        body.role || 'student',
        body.name,
        body.email || null,
        body.phone || null,
        body.prn || null,
        body.dob || null,
        body.password || body.dob || 'password123',
        body.departmentId || body.department_id || null,
        body.departmentName || body.department_name || null,
        body.semester ? Number(body.semester) : null,
        body.year || null,
        body.division || null,
        body.batch || null,
        body.rollNo || body.roll_no || null,
        body.gender || null,
        body.bloodGroup || body.blood_group || null,
        body.address || null,
        body.parentId || null,
        body.parentName || body.parent_name || null,
        body.parentPhone || body.parent_phone || null,
        body.parentEmail || body.parent_email || null,
        body.parentOccupation || body.parent_occupation || null,
        body.designation || null,
        assignedDivs,
        body.mentor || null,
        body.isVerified !== undefined ? body.isVerified : true,
        body.avatar || null
      ]
    );

    // If parent details are provided and this is a student, automatically create a parent user row
    if (body.role === 'student' && (body.parentPhone || body.parent_phone)) {
      const parentPhoneClean = body.parentPhone || body.parent_phone;
      const parentId = `par-${id}`;
      try {
        await query(
          `INSERT INTO users (id, role, name, phone, email, dob, password, parent_id, department_id, department_name, is_verified)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE name = VALUES(name), phone = VALUES(phone), dob = VALUES(dob)`,
          [
            parentId,
            'parent',
            body.parentName || `Parent of ${body.name}`,
            parentPhoneClean,
            body.parentEmail || null,
            body.dob || null,
            null, // Parent password is not set by student; set by teacher
            id,
            body.departmentId || null,
            body.departmentName || null,
            true
          ]
        );
      } catch (parentErr) {
        console.warn('[Parent Auto-create Warning]', parentErr.message);
      }
    }

    // Record Audit Log in MySQL
    const timestampStr = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) + " " + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    await query(
      `INSERT INTO audit_logs (id, timestamp, user, role, action, details, module)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        'aud-usr-' + Date.now(),
        timestampStr,
        body.name || id,
        (body.role || 'USER').toUpperCase(),
        'USER_PROVISIONED',
        `Provisioned ${body.role || 'user'} account for ${body.name} in MySQL`,
        'User Management'
      ]
    ).catch(() => {});

    res.json({ success: true, id, message: 'User added successfully to MySQL database.' });
  } catch (err) {
    console.error('[Add User Error]', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body;
    const assignedDivs = Array.isArray(body.assignedDivisions) ? body.assignedDivisions.join(',') : (body.assignedDivisions || '');

    await query(
      `UPDATE users SET
        name = COALESCE(?, name),
        email = COALESCE(?, email),
        phone = COALESCE(?, phone),
        prn = COALESCE(?, prn),
        dob = COALESCE(?, dob),
        password = COALESCE(?, password),
        department_id = COALESCE(?, department_id),
        department_name = COALESCE(?, department_name),
        semester = COALESCE(?, semester),
        year = COALESCE(?, year),
        division = COALESCE(?, division),
        batch = COALESCE(?, batch),
        roll_no = COALESCE(?, roll_no),
        gender = COALESCE(?, gender),
        blood_group = COALESCE(?, blood_group),
        address = COALESCE(?, address),
        parent_name = COALESCE(?, parent_name),
        parent_phone = COALESCE(?, parent_phone),
        parent_email = COALESCE(?, parent_email),
        parent_occupation = COALESCE(?, parent_occupation),
        designation = COALESCE(?, designation),
        assigned_divisions = COALESCE(?, assigned_divisions),
        mentor = COALESCE(?, mentor),
        is_verified = COALESCE(?, is_verified),
        avatar = COALESCE(?, avatar)
      WHERE id = ?`,
      [
        body.name,
        body.email,
        body.phone,
        body.prn,
        body.dob,
        body.password,
        body.departmentId || body.department_id,
        body.departmentName || body.department_name,
        body.semester ? Number(body.semester) : null,
        body.year,
        body.division,
        body.batch,
        body.rollNo || body.roll_no,
        body.gender,
        body.bloodGroup || body.blood_group,
        body.address,
        body.parentName || body.parent_name,
        body.parentPhone || body.parent_phone,
        body.parentEmail || body.parent_email,
        body.parentOccupation || body.parent_occupation,
        body.designation,
        assignedDivs,
        body.mentor,
        body.isVerified,
        body.avatar,
        id
      ]
    );

    // Sync parent account if student updated
    if (body.parentPhone || body.dob) {
      await query(
        `UPDATE users SET
          phone = COALESCE(?, phone),
          dob = COALESCE(?, dob),
          name = COALESCE(?, name)
         WHERE parent_id = ? AND role = 'parent'`,
        [body.parentPhone, body.dob, body.parentName, id]
      );
    }

    res.json({ success: true, message: 'User updated successfully in MySQL.' });
  } catch (err) {
    console.error('[Update User Error]', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM users WHERE id = ?', [id]);
    await query('DELETE FROM users WHERE parent_id = ? AND role = "parent"', [id]);
    res.json({ success: true, message: 'User deleted successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================
// 3. STUDENT REGISTRATION SHAREABLE LINK FLOW
// ==========================================
// Teacher generates a registration token/link
router.post('/registration-links', async (req, res) => {
  try {
    const { departmentId, semester, division, batch, createdBy, createdById } = req.body;
    const token = 'reg-' + Math.random().toString(36).substring(2, 10);

    await query(
      `INSERT INTO registration_links (token, department_id, semester, division, batch, created_by, created_by_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [token, departmentId || 'dept-vlsi', semester || 5, division || 'A', batch || 'All', createdBy || 'Teacher', createdById || 'tea-1']
    );

    res.json({
      success: true,
      token,
      url: `/register-student?token=${token}`,
      message: 'Student Registration Link generated successfully.'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Public student registration submission from link
router.post('/register-student', async (req, res) => {
  try {
    const body = req.body;
    if (!body.name || !body.phone) {
      return res.status(400).json({ success: false, message: 'Student Full Name and Mobile Number are required.' });
    }

    const cleanPhone = String(body.phone).trim();
    const cleanDigits = cleanPhone.replace(/\D/g, '').slice(-10);
    const cleanPrn = body.prn ? String(body.prn).trim() : `PRN-${cleanDigits || cleanPhone.slice(-6)}`;
    const studentPass = body.password ? String(body.password).trim() : (body.dob || 'student123');

    // Check if Phone or PRN already registered
    const existing = await query(
      'SELECT id FROM users WHERE phone = ? OR (RIGHT(phone, 10) = ? AND ? != "") OR (prn = ? AND prn IS NOT NULL AND prn != "") LIMIT 1',
      [cleanPhone, cleanDigits || '', cleanDigits || '', cleanPrn]
    );
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: `A student account with Mobile "${cleanPhone}" or PRN "${cleanPrn}" already exists.` });
    }

    const studentId = body.id || (cleanDigits ? `stu-${cleanDigits}` : `stu-${Date.now()}`);
    await query(
      `INSERT INTO users (
        id, role, name, email, phone, prn, dob, password,
        department_id, department_name, semester, year, division, batch, roll_no,
        gender, blood_group, address, parent_name, parent_phone, parent_email,
        parent_occupation, is_verified
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        name = VALUES(name), email = VALUES(email), phone = VALUES(phone),
        password = VALUES(password), department_id = VALUES(department_id),
        department_name = VALUES(department_name), semester = VALUES(semester),
        year = VALUES(year), division = VALUES(division), batch = VALUES(batch),
        roll_no = VALUES(roll_no), gender = VALUES(gender), blood_group = VALUES(blood_group),
        address = VALUES(address), parent_name = VALUES(parent_name),
        parent_phone = VALUES(parent_phone), parent_email = VALUES(parent_email),
        parent_occupation = VALUES(parent_occupation), is_verified = VALUES(is_verified)`,
      [
        studentId,
        'student',
        body.name.trim(),
        body.email ? body.email.trim() : null,
        cleanPhone,
        cleanPrn,
        body.dob || '2005-01-01',
        studentPass,
        body.departmentId || 'dept-vlsi',
        body.departmentName || 'Electronic Engineering (VLSI Design And Technology)',
        body.semester ? Number(body.semester) : 1,
        body.year || '1st Year',
        body.division || 'A',
        body.batch || 'A1',
        body.rollNo || null,
        body.gender || 'Male',
        body.bloodGroup || 'O+',
        body.address || null,
        body.parentName || null,
        body.parentPhone ? String(body.parentPhone).trim() : null,
        body.parentEmail ? String(body.parentEmail).trim() : null,
        body.parentOccupation || null,
        true
      ]
    );

    // Auto-create Parent user record with NULL password (Teacher will generate & send parent password)
    let parentRecord = null;
    if (body.parentPhone) {
      const parentPhoneClean = String(body.parentPhone).trim();
      const parentDigits = parentPhoneClean.replace(/\D/g, '').slice(-10);
      const parentId = body.parentId || (parentDigits ? `par-${parentDigits}` : `par-${studentId}`);
      await query(
        `INSERT INTO users (id, role, name, phone, email, dob, password, parent_id, department_id, department_name, is_verified)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE name = VALUES(name), phone = VALUES(phone), email = VALUES(email), parent_id = VALUES(parent_id)`,
        [
          parentId,
          'parent',
          body.parentName || `Parent of ${body.name}`,
          parentPhoneClean,
          body.parentEmail || null,
          body.dob || null,
          null, // Parent password is not set by student; set by teacher
          studentId,
          body.departmentId || 'dept-vlsi',
          body.departmentName || 'Electronic Engineering (VLSI Design And Technology)',
          true
        ]
      );
      parentRecord = {
        id: parentId,
        role: 'parent',
        name: body.parentName || `Parent of ${body.name}`,
        phone: parentPhoneClean,
        email: body.parentEmail || null,
        studentId: studentId,
        studentName: body.name.trim(),
        departmentId: body.departmentId || 'dept-vlsi',
        departmentName: body.departmentName || 'Electronic Engineering (VLSI Design And Technology)',
        password: null,
        canLogin: false,
        isPasswordSet: false
      };
    }

    // Record Audit Log in MySQL
    const timestampStr = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) + " " + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    await query(
      `INSERT INTO audit_logs (id, timestamp, user, role, action, details, module)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        'aud-reg-' + Date.now(),
        timestampStr,
        body.name.trim(),
        'STUDENT',
        'STUDENT_SELF_REGISTRATION',
        `New student enrolled: ${body.name.trim()} (${cleanPrn}), Dept: ${body.departmentName || 'VLSI'}, Year: ${body.year || '1st Year'}, Div: ${body.division || 'A'}`,
        'Enrollment'
      ]
    ).catch((e) => console.warn('[Audit Log Warning]', e.message));

    const getBatchSession = (year, semester) => {
      const y = String(year || '').toLowerCase();
      const s = Number(semester);
      if (y.includes('1') || y.includes('first') || y.includes('fe') || s === 1 || s === 2) return '2026-2030';
      if (y.includes('2') || y.includes('second') || y.includes('se') || s === 3 || s === 4) return '2025-2029';
      if (y.includes('3') || y.includes('third') || y.includes('te') || s === 5 || s === 6) return '2024-2028';
      if (y.includes('4') || y.includes('final') || y.includes('fourth') || y.includes('be') || s === 7 || s === 8) return '2023-2027';
      return '2026-2030';
    };

    const yrPrefix = (body.year || '').includes('2') || body.semester === 3 ? 'SE' : (body.year || '').includes('3') || body.semester === 5 ? 'TE' : (body.year || '').includes('4') || body.semester === 7 ? 'BE' : 'FE';
    const computedClass = body.className || `${yrPrefix} ${body.departmentName || 'Engineering'} – Semester ${body.semester || 1} (${body.year || '1st Year'}) – Div ${body.division || 'A'}`;
    const computedSession = body.academicSession || getBatchSession(body.year, body.semester);

    const studentRecord = {
      id: studentId,
      role: 'student',
      name: body.name.trim(),
      email: body.email ? body.email.trim() : null,
      phone: cleanPhone,
      prn: cleanPrn,
      dob: body.dob || '2005-01-01',
      password: studentPass,
      departmentId: body.departmentId || 'dept-vlsi',
      departmentName: body.departmentName || 'Electronic Engineering (VLSI Design And Technology)',
      departmentCode: body.departmentCode || '',
      semester: body.semester ? Number(body.semester) : 1,
      year: body.year || '1st Year',
      division: body.division || 'A',
      batch: body.batch || 'A1',
      className: computedClass,
      academicSession: computedSession,
      rollNo: body.rollNo || null,
      gender: body.gender || 'Male',
      bloodGroup: body.bloodGroup || 'O+',
      address: body.address || null,
      parentName: body.parentName || null,
      parentPhone: body.parentPhone ? String(body.parentPhone).trim() : null,
      parentEmail: body.parentEmail ? String(body.parentEmail).trim() : null,
      parentOccupation: body.parentOccupation || null,
      canLogin: true,
      isVerified: true
    };

    res.json({
      success: true,
      studentId,
      student: studentRecord,
      parent: parentRecord,
      message: 'Student Registration completed and saved to database successfully!'
    });
  } catch (err) {
    console.error('[Student Self-Register Error]', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Dedicated Public Faculty & HOD Registration Submission
router.post('/register-faculty', async (req, res) => {
  try {
    const body = req.body;
    if (!body.name || !body.phone) {
      return res.status(400).json({ success: false, message: 'Faculty Full Name and Mobile Number are required.' });
    }

    const cleanPhone = String(body.phone).trim();
    const cleanRole = body.role === 'principal' ? 'principal' : body.role === 'hod' ? 'hod' : 'teacher';
    const facultyPass = body.password ? String(body.password).trim() : 'faculty123';

    // Check if Phone already registered
    const existing = await query('SELECT id FROM users WHERE phone = ? LIMIT 1', [cleanPhone]);
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: `An account with Mobile Number "${cleanPhone}" already exists.` });
    }

    const facultyId = body.id || (
      (cleanRole === 'principal' ? 'pri-' : cleanRole === 'hod' ? 'hod-' : 'tea-') + Date.now()
    );
    const assignedDivs = cleanRole === 'principal'
      ? 'All Divisions'
      : (Array.isArray(body.assignedDivisions) ? body.assignedDivisions.join(',') : (body.assignedDivisions || 'Div A'));

    const deptId = cleanRole === 'principal' ? 'dept-all' : (body.departmentId || 'dept-vlsi');
    const deptName = cleanRole === 'principal'
      ? 'Entire College (All Departments)'
      : (body.departmentName || 'Electronic Engineering (VLSI Design And Technology)');
    const designation = cleanRole === 'principal'
      ? 'Principal & Director'
      : (body.designation || (cleanRole === 'hod' ? 'Head of Department' : 'Assistant Professor'));

    await query(
      `INSERT INTO users (
        id, role, name, email, phone, dob, password,
        department_id, department_name, designation, assigned_divisions,
        is_verified
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        facultyId,
        cleanRole,
        body.name.trim(),
        body.email ? body.email.trim() : null,
        cleanPhone,
        body.dob || null,
        facultyPass,
        deptId,
        deptName,
        designation,
        assignedDivs,
        true
      ]
    );

    // Audit log
    const timestampStr = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) + " " + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    await query(
      `INSERT INTO audit_logs (id, timestamp, user, role, action, details, module)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        'aud-fac-' + Date.now(),
        timestampStr,
        body.name.trim(),
        cleanRole.toUpperCase(),
        cleanRole === 'principal' ? 'PRINCIPAL_SELF_REGISTRATION' : 'FACULTY_SELF_REGISTRATION',
        `New ${cleanRole} registered: ${body.name.trim()} (${cleanRole.toUpperCase()}), Scope: ${deptName}, Phone: ${cleanPhone}`,
        'Staff Onboarding'
      ]
    ).catch(() => {});

    const facultyRecord = {
      id: facultyId,
      role: cleanRole,
      name: body.name.trim(),
      email: body.email ? body.email.trim() : null,
      phone: cleanPhone,
      password: facultyPass,
      departmentId: deptId,
      departmentName: deptName,
      designation,
      assignedDivisions: assignedDivs,
      isVerified: true
    };

    res.json({
      success: true,
      facultyId,
      faculty: facultyRecord,
      message: `${cleanRole.toUpperCase()} account successfully registered and activated!`
    });
  } catch (err) {
    console.error('[Faculty Self-Register Error]', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Endpoint to dispatch live / simulated SMS and save in sms_logs
router.post('/sms/send', async (req, res) => {
  try {
    const { recipientPhone, recipientRole, studentName, message } = req.body;
    if (!recipientPhone || !message) {
      return res.status(400).json({ success: false, message: 'Recipient Phone and Message are required.' });
    }

    const smsRes = await sendSmsNotification({
      recipientRole: recipientRole || 'user',
      recipientPhone,
      studentName: studentName || 'User',
      message
    });

    res.json({ success: true, ...smsRes });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================
// OTP VERIFICATION SYSTEM (SECURE ONBOARDING)
// ==========================================
// In-memory OTP Store with 5-minute expiry
const otpStore = new Map();

// 1. Send OTP to Mobile Number
router.post('/otp/send', async (req, res) => {
  try {
    const { phone, purpose = 'registration', role = 'teacher' } = req.body;
    const cleanDigits = String(phone || '').replace(/\D/g, '').slice(-10);

    if (!cleanDigits || cleanDigits.length !== 10) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid 10-digit Indian mobile number.'
      });
    }

    // Cooldown check (30 seconds between requests for the same phone)
    const existing = otpStore.get(cleanDigits);
    if (existing && Date.now() < existing.createdAt + 25 * 1000) {
      const waitSec = Math.ceil((existing.createdAt + 25 * 1000 - Date.now()) / 1000);
      return res.status(429).json({
        success: false,
        message: `Please wait ${waitSec}s before requesting a new OTP.`
      });
    }

    // Generate secure 6-digit OTP
    const generatedOtp = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

    otpStore.set(cleanDigits, {
      otp: generatedOtp,
      createdAt: Date.now(),
      expiresAt,
      attempts: 0,
      purpose,
      role
    });

    const roleName = role === 'hod' ? 'Head of Dept' : role === 'teacher' ? 'Faculty' : 'Student';
    const smsMessage = `CSMSS SmartCampus: Your mobile verification code is ${generatedOtp} for ${roleName} Registration. Valid for 5 minutes. Do NOT share with anyone.`;

    // Dispatch SMS via smsService (Fast2SMS, Twilio, or Built-in Gateway Simulator)
    await sendSmsNotification({
      recipientRole: role,
      recipientPhone: cleanDigits,
      studentName: `${roleName} Applicant`,
      message: smsMessage
    });

    res.json({
      success: true,
      message: `OTP sent successfully to +91 ${cleanDigits}`,
      phone: cleanDigits,
      expiresIn: 300,
      // Provide previewOtp for local testing & development without external SMS gateway delays
      previewOtp: generatedOtp
    });
  } catch (err) {
    console.error('[Send OTP Error]', err);
    res.status(500).json({ success: false, message: 'Failed to dispatch OTP: ' + err.message });
  }
});

// 2. Verify OTP
router.post('/otp/verify', async (req, res) => {
  try {
    const { phone, otp } = req.body;
    const cleanDigits = String(phone || '').replace(/\D/g, '').slice(-10);
    const enteredOtp = String(otp || '').trim();

    if (!cleanDigits || !enteredOtp) {
      return res.status(400).json({
        success: false,
        message: 'Mobile number and 6-digit OTP code are required.'
      });
    }

    const record = otpStore.get(cleanDigits);
    if (!record) {
      return res.status(400).json({
        success: false,
        message: 'No active OTP found for this number. Please click "Send OTP" first.'
      });
    }

    if (Date.now() > record.expiresAt) {
      otpStore.delete(cleanDigits);
      return res.status(400).json({
        success: false,
        message: 'This OTP has expired. Please request a new OTP.'
      });
    }

    if (record.attempts >= 5) {
      otpStore.delete(cleanDigits);
      return res.status(429).json({
        success: false,
        message: 'Too many incorrect attempts. Please request a new OTP.'
      });
    }

    if (record.otp !== enteredOtp) {
      record.attempts += 1;
      return res.status(400).json({
        success: false,
        message: `Incorrect OTP code. (${5 - record.attempts} attempts remaining)`
      });
    }

    // OTP matched successfully!
    otpStore.delete(cleanDigits);

    res.json({
      success: true,
      verified: true,
      phone: cleanDigits,
      message: 'Mobile number verified successfully!'
    });
  } catch (err) {
    console.error('[Verify OTP Error]', err);
    res.status(500).json({ success: false, message: 'Failed to verify OTP: ' + err.message });
  }
});

// Teacher / Admin assigns or updates parent portal password & sends SMS
router.post('/parent-password', async (req, res) => {
  try {
    const { parentId, studentId, parentPhone, password } = req.body;
    if (!password) {
      return res.status(400).json({ success: false, message: 'Password cannot be empty.' });
    }

    const cleanPass = String(password).trim();
    const cleanPhone = parentPhone ? String(parentPhone).trim() : '';

    await query(
      `UPDATE users SET password = ? WHERE (id = ? OR parent_id = ? OR phone = ?) AND role = 'parent'`,
      [cleanPass, parentId || '', studentId || '', cleanPhone]
    );

    res.json({
      success: true,
      message: 'Parent password updated successfully and ready for sign in.'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================
// 4. ATTENDANCE & REAL-TIME SMS DISPATCH
// ==========================================
router.post('/attendance', async (req, res) => {
  try {
    const { departmentId, semester, subjectId, sessionType, lectureNum, statusMap, date, time, markedBy } = req.body;
    if (!subjectId || !statusMap) {
      return res.status(400).json({ success: false, message: 'Subject and statusMap are required.' });
    }

    // Resolve subject info
    const subRows = await query('SELECT * FROM subjects WHERE id = ? LIMIT 1', [subjectId]);
    const subject = subRows[0] || { name: 'Subject Class', code: 'SUB101' };

    const entries = Object.entries(statusMap);
    const absentStudents = [];

    for (const [studentId, status] of entries) {
      const stuRows = await query('SELECT * FROM users WHERE id = ? LIMIT 1', [studentId]);
      const student = stuRows[0];
      if (!student) continue;

      const attId = `att-${Date.now()}-${studentId}`;
      await query(
        `INSERT INTO attendance (id, student_id, student_name, subject_id, subject_name, marked_by, date, time, session_type, lecture_num, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [attId, studentId, student.name, subjectId, subject.name, markedBy || 'Faculty', date, time, sessionType || 'Theory', Number(lectureNum || 1), status]
      );

      if (status === 'Absent') {
        absentStudents.push({
          id: student.id,
          name: student.name,
          prn: student.prn,
          phone: student.phone,
          parentPhone: student.parent_phone
        });
      }
    }

    // DISPATCH REAL SMS ALERTS FOR ABSENT STUDENTS
    const smsDispatchResults = [];
    for (const absentStudent of absentStudents) {
      const alertResults = await dispatchAbsenceAlerts({
        student: absentStudent,
        subjectName: subject.name,
        date,
        lectureNum,
        sessionType
      });
      smsDispatchResults.push({ studentId: absentStudent.id, alerts: alertResults });
    }

    // Fetch latest SMS logs to return to frontend
    const updatedSmsLogs = await query('SELECT * FROM sms_logs ORDER BY created_at DESC LIMIT 50');

    res.json({
      success: true,
      totalMarked: entries.length,
      absentCount: absentStudents.length,
      absentStudents,
      smsDispatchedCount: absentStudents.length * 2,
      smsLogs: updatedSmsLogs,
      message: `Attendance submitted. Saved ${entries.length} records. Dispatched SMS alerts to ${absentStudents.length} absent students and parents.`
    });
  } catch (err) {
    console.error('[Attendance Submission Error]', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================
// 5. SMS LOGS VIEWER
// ==========================================
router.get('/sms-logs', async (req, res) => {
  try {
    const logs = await query('SELECT * FROM sms_logs ORDER BY created_at DESC LIMIT 150');
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 6. DEPARTMENTS, SUBJECTS & SETTINGS CRUD
// ==========================================
router.post('/departments', async (req, res) => {
  try {
    const { id, name, code, divisions, hod } = req.body;
    const deptId = id || `dept-${Date.now()}`;
    const divStr = Array.isArray(divisions) ? divisions.join(',') : (divisions || 'A');
    await query(
      `INSERT INTO departments (id, name, code, divisions, hod)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE name = VALUES(name), code = VALUES(code), divisions = VALUES(divisions), hod = VALUES(hod)`,
      [deptId, name, code, divStr, hod || null]
    );
    res.json({ success: true, id: deptId, message: 'Department saved to MySQL database.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/departments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, divisions, hod } = req.body;
    const divStr = Array.isArray(divisions) ? divisions.join(',') : (divisions || 'A');
    await query(
      `UPDATE departments SET
        name = COALESCE(?, name),
        code = COALESCE(?, code),
        divisions = COALESCE(?, divisions),
        hod = COALESCE(?, hod)
       WHERE id = ?`,
      [name, code, divStr, hod, id]
    );
    res.json({ success: true, message: 'Department updated in MySQL.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/departments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM departments WHERE id = ?', [id]);
    res.json({ success: true, message: 'Department deleted from MySQL.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/subjects', async (req, res) => {
  try {
    const { id, name, code, departmentId, semester, credits, teacherId, teacherName } = req.body;
    const subId = id || `sub-${Date.now()}`;
    await query(
      `INSERT INTO subjects (id, name, code, department_id, semester, credits, teacher_id, teacher_name)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE name = VALUES(name), code = VALUES(code), semester = VALUES(semester), credits = VALUES(credits), teacher_id = VALUES(teacher_id), teacher_name = VALUES(teacher_name)`,
      [subId, name, code, departmentId, Number(semester || 1), Number(credits || 4), teacherId || null, teacherName || null]
    );
    res.json({ success: true, id: subId });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/subjects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, departmentId, semester, credits, teacherId, teacherName } = req.body;
    await query(
      `UPDATE subjects SET
        name = COALESCE(?, name),
        code = COALESCE(?, code),
        department_id = COALESCE(?, department_id),
        semester = COALESCE(?, semester),
        credits = COALESCE(?, credits),
        teacher_id = COALESCE(?, teacher_id),
        teacher_name = COALESCE(?, teacher_name)
       WHERE id = ?`,
      [name, code, departmentId, semester ? Number(semester) : null, credits ? Number(credits) : null, teacherId, teacherName, id]
    );
    res.json({ success: true, message: 'Subject updated in MySQL.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/subjects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM subjects WHERE id = ?', [id]);
    res.json({ success: true, message: 'Subject deleted from MySQL.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Full state synchronizer endpoint: allows frontend to push any offline-registered records to MySQL
router.post('/sync-state', async (req, res) => {
  try {
    const { users = [], departments = [] } = req.body;
    let syncedUsers = 0;
    let syncedDepts = 0;

    for (const u of users) {
      if (!u.id || !u.name) continue;
      const assignedDivs = Array.isArray(u.assignedDivisions) ? u.assignedDivisions.join(',') : (u.assignedDivisions || '');
      await query(
        `INSERT INTO users (
          id, role, name, email, phone, prn, dob, password,
          department_id, department_name, semester, year, division, batch, roll_no,
          gender, blood_group, address, parent_id, parent_name, parent_phone, parent_email,
          parent_occupation, designation, assigned_divisions, mentor, is_verified, avatar
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          name = VALUES(name), phone = COALESCE(VALUES(phone), users.phone),
          password = COALESCE(VALUES(password), users.password)`,
        [
          u.id, u.role || 'student', u.name, u.email || null, u.phone || null,
          u.prn || null, u.dob || null, u.password || 'password123',
          u.departmentId || null, u.departmentName || null,
          u.semester ? Number(u.semester) : null, u.year || null,
          u.division || null, u.batch || null, u.rollNo || null,
          u.gender || null, u.bloodGroup || null, u.address || null,
          u.parentId || null, u.parentName || null, u.parentPhone || null,
          u.parentEmail || null, u.parentOccupation || null,
          u.designation || null, assignedDivs, u.mentor || null,
          u.isVerified !== undefined ? u.isVerified : true, u.avatar || null
        ]
      ).catch(() => {});
      syncedUsers++;
    }

    for (const d of departments) {
      if (!d.id || !d.name) continue;
      const divStr = Array.isArray(d.divisions) ? d.divisions.join(',') : (d.divisions || 'A');
      await query(
        `INSERT INTO departments (id, name, code, divisions, hod)
         VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE name = VALUES(name), code = VALUES(code), divisions = VALUES(divisions)`,
        [d.id, d.name, d.code || 'DEPT', divStr, d.hod || null]
      ).catch(() => {});
      syncedDepts++;
    }

    res.json({ success: true, message: `Synced ${syncedUsers} users and ${syncedDepts} departments to MySQL.` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/marks', async (req, res) => {
  try {
    const { studentId, subjectId, examType, category, marksObtained, maxMarks, gradedBy, remarks, date } = req.body;
    const markId = `m-${Date.now()}-${studentId}`;
    const [student] = await query('SELECT name FROM users WHERE id = ?', [studentId]);
    const [subject] = await query('SELECT name FROM subjects WHERE id = ?', [subjectId]);

    await query(
      `INSERT INTO marks (id, student_id, student_name, subject_id, subject_name, exam_type, category, marks_obtained, max_marks, graded_by, remarks, date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        markId,
        studentId,
        student?.name || 'Student',
        subjectId,
        subject?.name || 'Subject',
        examType,
        category || 'Theory',
        marksObtained,
        maxMarks,
        gradedBy || 'Faculty',
        remarks || '',
        date || new Date().toISOString().split('T')[0]
      ]
    );
    res.json({ success: true, id: markId });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/notices', async (req, res) => {
  try {
    const { title, content, targetAudience, departmentId, postedBy, role, priority, date } = req.body;
    const id = `notif-${Date.now()}`;
    await query(
      `INSERT INTO notices (id, title, content, target_audience, department_id, posted_by, role, priority, date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, title, content, targetAudience || 'all', departmentId || null, postedBy, role, priority || 'normal', date || new Date().toISOString().split('T')[0]]
    );
    res.json({ success: true, id });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;

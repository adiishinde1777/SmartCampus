import express from 'express';
import { query } from '../db.js';
import { dispatchAbsenceAlerts } from '../services/smsService.js';

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
        users: users.map(u => {
          delete u.password;
          return {
            ...u,
            rollNo: u.roll_no,
            departmentId: u.department_id,
            departmentName: u.department_name,
            parentName: u.parent_name,
            parentPhone: u.parent_phone,
            parentEmail: u.parent_email,
            assignedDivisions: u.assigned_divisions ? u.assigned_divisions.split(',') : []
          };
        }),
        departments,
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
    // for seamless Parent Login with Parent Phone + Student DOB
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
            body.dob || null, // Password for parent is student's DOB
            body.dob || 'password123',
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
    if (!body.prn || !body.name || !body.dob) {
      return res.status(400).json({ success: false, message: 'Student Name, PRN, and Date of Birth are mandatory.' });
    }

    // Check if PRN already registered
    const existing = await query('SELECT id FROM users WHERE prn = ? LIMIT 1', [body.prn]);
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: `Student with PRN "${body.prn}" is already registered.` });
    }

    const studentId = 'stu-' + Date.now();
    await query(
      `INSERT INTO users (
        id, role, name, email, phone, prn, dob, password,
        department_id, department_name, semester, year, division, batch, roll_no,
        gender, blood_group, address, parent_name, parent_phone, parent_email,
        parent_occupation, is_verified
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        studentId,
        'student',
        body.name,
        body.email || null,
        body.phone || null,
        body.prn,
        body.dob,
        body.dob, // Default password is birthdate
        body.departmentId || 'dept-vlsi',
        body.departmentName || 'Electronic Engineering (VLSI Design And Technology)',
        body.semester ? Number(body.semester) : 5,
        body.year || '3rd Year',
        body.division || 'A',
        body.batch || 'TA1',
        body.rollNo || null,
        body.gender || null,
        body.bloodGroup || null,
        body.address || null,
        body.parentName || null,
        body.parentPhone || null,
        body.parentEmail || null,
        body.parentOccupation || null,
        true
      ]
    );

    // Auto-create Parent User account so parent can immediately sign in with Parent Phone + Student DOB
    if (body.parentPhone) {
      const parentId = `par-${studentId}`;
      await query(
        `INSERT INTO users (id, role, name, phone, email, dob, password, parent_id, department_id, department_name, is_verified)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE name = VALUES(name), phone = VALUES(phone), dob = VALUES(dob)`,
        [
          parentId,
          'parent',
          body.parentName || `Parent of ${body.name}`,
          body.parentPhone,
          body.parentEmail || null,
          body.dob,
          body.dob,
          studentId,
          body.departmentId || 'dept-vlsi',
          body.departmentName || 'Electronic Engineering (VLSI Design And Technology)',
          true
        ]
      );
    }

    res.json({
      success: true,
      studentId,
      message: 'Registration submitted successfully! You can log in using your PRN as Username and Birthdate as Password.'
    });
  } catch (err) {
    console.error('[Student Self-Register Error]', err);
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
    const { id, name, code } = req.body;
    const deptId = id || `dept-${Date.now()}`;
    await query('INSERT INTO departments (id, name, code) VALUES (?, ?, ?)', [deptId, name, code]);
    res.json({ success: true, id: deptId });
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
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [subId, name, code, departmentId, Number(semester || 1), Number(credits || 4), teacherId || null, teacherName || null]
    );
    res.json({ success: true, id: subId });
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

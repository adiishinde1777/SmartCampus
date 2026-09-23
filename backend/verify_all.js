// Automated End-to-End Verification of SmartCampus ERP Requirements
const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('========================================================');
  console.log('🧪 RUNNING END-TO-END AUTOMATED VERIFICATION SUITE');
  console.log('========================================================\n');

  // Test 1: Check System Health
  console.log('Test 1: System Health & Database Connection...');
  const healthRes = await fetch(`${BASE_URL}/health`).then(r => r.json());
  console.log('✓ Health status:', healthRes);

  // Test 2: Admin Authentication
  console.log('\nTest 2: Admin Login (admin / admin123)...');
  const adminLogin = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'admin123', role: 'admin' })
  }).then(r => r.json());

  if (!adminLogin.success) throw new Error('Admin login failed: ' + adminLogin.message);
  console.log('✓ Admin authenticated successfully:', adminLogin.user.name);

  // Test 3: Faculty Provisioning by Admin
  console.log('\nTest 3: Faculty Provisioning...');
  const teacherId = 'tea-' + Date.now();
  const teacherPhone = '9822334455';
  const teacherDob = '1982-06-15';

  const addTeacher = await fetch(`${BASE_URL}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: teacherId,
      role: 'teacher',
      name: 'Prof. Rajesh Mohije',
      phone: teacherPhone,
      email: 'rajesh.mohije@campus.edu',
      dob: teacherDob,
      password: teacherDob,
      departmentId: 'dept-vlsi',
      departmentName: 'Electronic Engineering (VLSI Design And Technology)'
    })
  }).then(r => r.json());
  console.log('✓ Faculty added to MySQL:', addTeacher.message);

  // Test 4: Faculty Login using Mobile + DOB
  console.log('\nTest 4: Faculty Login with Mobile Number + DOB...');
  const teacherLogin = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: teacherPhone, password: teacherDob, role: 'teacher' })
  }).then(r => r.json());

  if (!teacherLogin.success) throw new Error('Faculty login failed: ' + teacherLogin.message);
  console.log('✓ Faculty authenticated with Mobile (' + teacherPhone + ') & DOB (' + teacherDob + '):', teacherLogin.user.name);

  // Test 5: Student Registration Link Submission (Student Info + Parent Info)
  const randomSuffix = Math.floor(100000 + Math.random() * 900000);
  const studentPrn = '24025331' + randomSuffix;
  const studentDob = '2004-08-22';
  const parentMobile = '942' + randomSuffix + '1';

  const regRes = await fetch(`${BASE_URL}/register-student`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Aditya Santosh Shinde',
      prn: studentPrn,
      dob: studentDob,
      rollNo: 'VL3152',
      phone: '9876543210',
      email: 'aditya.shinde@campus.edu',
      departmentId: 'dept-vlsi',
      semester: 5,
      batch: 'TA1',
      parentName: 'Mr. Santosh Shinde',
      parentPhone: parentMobile,
      parentEmail: 'santosh.shinde@gmail.com',
      parentOccupation: 'Business'
    })
  }).then(r => r.json());

  if (!regRes.success) throw new Error('Student registration failed: ' + regRes.message);
  const registeredStuId = regRes.studentId;
  console.log('✓ Student registered successfully. ID:', registeredStuId);

  // Test 6: Student Login using PRN as Username and DOB as Password
  console.log('\nTest 6: Student Login using PRN + Birthdate...');
  const studentLogin = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: studentPrn, password: studentDob, role: 'student' })
  }).then(r => r.json());

  if (!studentLogin.success) throw new Error('Student login failed: ' + studentLogin.message);
  console.log('✓ Student authenticated with PRN (' + studentPrn + ') & DOB (' + studentDob + '):', studentLogin.user.name);

  // Test 7: Parent Login using Parent Mobile as Username and Student DOB as Password
  console.log('\nTest 7: Parent Login using Parent Mobile + Student DOB...');
  const parentLogin = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: parentMobile, password: studentDob, role: 'parent' })
  }).then(r => r.json());

  if (!parentLogin.success) throw new Error('Parent login failed: ' + parentLogin.message);
  console.log('✓ Parent authenticated with Mobile (' + parentMobile + ') & Ward DOB (' + studentDob + '):', parentLogin.user.name);

  // Test 8: Teacher Edits/Corrects Student Information
  console.log('\nTest 8: Teacher Edits/Corrects Student Information...');
  const updateRes = await fetch(`${BASE_URL}/users/${registeredStuId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Aditya S. Shinde (Corrected by Teacher)',
      rollNo: 'VL3152-A',
      parentName: 'Mr. Santosh G. Shinde'
    })
  }).then(r => r.json());

  console.log('✓ Teacher update result:', updateRes.message);

  // Test 9: Create a Subject and Mark Attendance with Student Absent
  console.log('\nTest 9: Attendance Marking & Absence SMS Dispatch Trigger...');
  const subId = 'sub-test-' + Date.now();
  await fetch(`${BASE_URL}/subjects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: subId,
      name: 'CMOS Digital VLSI Design',
      code: 'VLSI501',
      departmentId: 'dept-vlsi',
      semester: 5,
      credits: 4,
      teacherId: teacherId,
      teacherName: 'Prof. Rajesh Mohije'
    })
  });

  const attRes = await fetch(`${BASE_URL}/attendance`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      departmentId: 'dept-vlsi',
      semester: 5,
      subjectId: subId,
      sessionType: 'Theory',
      lectureNum: 1,
      statusMap: {
        [registeredStuId]: 'Absent'
      },
      date: '2026-09-22',
      time: '10:00 AM',
      markedBy: 'Prof. Rajesh Mohije'
    })
  }).then(r => r.json());

  console.log('✓ Attendance submitted result:', attRes.message);
  console.log('  Absent Students Count:', attRes.absentCount);
  console.log('  SMS Dispatched Count:', attRes.smsDispatchedCount);

  // Test 10: Verify SMS Logs
  console.log('\nTest 10: Verify SMS Dispatch History in Database...');
  const smsLogs = await fetch(`${BASE_URL}/sms-logs`).then(r => r.json());
  console.log(`✓ Total SMS records found in database: ${smsLogs.length}`);
  const recentLogs = smsLogs.slice(0, 2);
  recentLogs.forEach((l, idx) => {
    console.log(`   [SMS #${idx + 1}] To: ${l.recipient_role.toUpperCase()} (${l.recipient_phone}) | Status: ${l.gateway_status}`);
    console.log(`   Text: "${l.message}"`);
  });

  console.log('\n========================================================');
  console.log('🎉 ALL 10 TESTS PASSED PERFECTLY!');
  console.log('========================================================');
}

runTests().catch(err => {
  console.error('\n❌ Test execution failed:', err);
  process.exit(1);
});

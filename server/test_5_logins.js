const testCases = [
  {
    desc: '1. Student Login (Aditya Shinde)',
    role: 'student',
    username: '7378535499',
    password: '16.04.2006'
  },
  {
    desc: '1b. Student Login with ISO DOB',
    role: 'student',
    username: '7378535499',
    password: '2006-04-16'
  },
  {
    desc: '2. Parent Login (Santosh Shinde)',
    role: 'parent',
    username: '7378535499',
    password: '02.03.1988'
  },
  {
    desc: '2b. Parent Login with student DOB',
    role: 'parent',
    username: '7378535499',
    password: '16.04.2006'
  },
  {
    desc: '3. HOD Login (Dr. Shrikant Honade)',
    role: 'hod',
    username: '1234567890',
    password: '2.1.2000'
  },
  {
    desc: '4. Principal Login (Dr. G. B. Dongre)',
    role: 'principal',
    username: '1234567890',
    password: '3.1.2000'
  },
  {
    desc: '5. Teacher Login (Prof. Tushar Mohije)',
    role: 'teacher',
    username: '1234567890',
    password: '1.1.2000'
  }
];

async function runTests() {
  console.log('Testing authentication for all 5 logins against http://localhost:5000/api/auth/login...\n');
  let allPass = true;

  for (const tc of testCases) {
    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: tc.role,
          username: tc.username,
          password: tc.password
        })
      });
      const data = await res.json();
      if (data.success && data.user) {
        console.log(`[PASS] ${tc.desc} -> Welcome ${data.user.name} (${data.user.role.toUpperCase()})`);
      } else {
        console.error(`[FAIL] ${tc.desc} -> ${data.message}`);
        allPass = false;
      }
    } catch (err) {
      console.error(`[ERROR] ${tc.desc} -> ${err.message}`);
      allPass = false;
    }
  }

  if (allPass) {
    console.log('\n🎉 ALL 5 USER LOGINS ARE WORKING 100% PERFECTLY!');
  } else {
    console.error('\n⚠️ Some logins failed.');
  }
}

runTests();

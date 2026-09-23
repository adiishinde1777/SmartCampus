import { TE_VLSI_STUDENTS, TE_VLSI_ATTENDANCE, INITIAL_USERS, VLSI_CLASS_METADATA, INITIAL_ATTENDANCE } from "../frontend/src/data/initialData.js";

console.log("=== TE VLSI 72-STUDENT DATABASE AUDIT ===");

// 1. Check count
console.log(`Total TE VLSI Students in TE_VLSI_STUDENTS: ${TE_VLSI_STUDENTS.length}`);
if (TE_VLSI_STUDENTS.length !== 72) {
  console.error("FAIL: Expected exactly 72 students!");
  process.exit(1);
}

// 2. Check roll numbers VL3101 - VL3172 in order
let rollFail = false;
TE_VLSI_STUDENTS.forEach((s, idx) => {
  const expectedRoll = `VL31${String(idx + 1).padStart(2, "0")}`;
  if (s.rollNo !== expectedRoll) {
    console.error(`FAIL: Student at index ${idx} has rollNo ${s.rollNo}, expected ${expectedRoll}`);
    rollFail = true;
  }
});
if (!rollFail) console.log("PASS: All Roll Numbers VL3101-VL3172 are present in strictly ascending order.");

// 3. Expected prompt data
const EXPECTED_PROMPT_DATA = [
  { roll: "VL3101", prn: "24025331378001", name: "RATHOD ANUSHKA NITESH" },
  { roll: "VL3102", prn: "24025331378002", name: "BARSALE SWAPNIL JALINDAR" },
  { roll: "VL3103", prn: "24025331378003", name: "BHISE NEHA DASHRATH" },
  { roll: "VL3104", prn: "24025331378004", name: "BHUVAN AVINASH MAHAMUNI" },
  { roll: "VL3105", prn: "24025331378005", name: "CHAUDHARI ARJUN BALASAHEB" },
  { roll: "VL3106", prn: "24025331378006", name: "CHAUDHARI SNEHAL SANTOSH" },
  { roll: "VL3107", prn: "24025331378007", name: "CHOPADE AVANTIKA PIRAJIRAO" },
  { roll: "VL3108", prn: "24025331378008", name: "DESALE PRASAD SHASHIKANT" },
  { roll: "VL3109", prn: "24025331378010", name: "DHAWALE RUSHIKESH SANJAY" },
  { roll: "VL3110", prn: "24025331378011", name: "DIGHOLE ASHVINI KAILAS" },
  { roll: "VL3111", prn: "24025331378012", name: "DONGARE ABHAY AJAY" },
  { roll: "VL3112", prn: "24025331378013", name: "DUDHEKAR SAMRUDDHI PRAVIN" },
  { roll: "VL3113", prn: "24025331378014", name: "GAIKWAD TUSHAR SANTOSH" },
  { roll: "VL3114", prn: "24025331378015", name: "GAWALI DHANRAJ ASHOK" },
  { roll: "VL3115", prn: "24025331378016", name: "GOJE SARTHAK SANJAY" },
  { roll: "VL3116", prn: "24025331378017", name: "GORE NIKHIL RAMNATH" },
  { roll: "VL3117", prn: "24025331378018", name: "GUNAWAT YASH DILIP" },
  { roll: "VL3118", prn: "24025331378019", name: "JADHAV ABHISHEK BALASAHEB" },
  { roll: "VL3119", prn: "24025331378020", name: "JADHAV ISHWARI MAKARAND" },
  { roll: "VL3120", prn: "24025331378022", name: "JANGLE VAISHNAVI SONBA" },
  { roll: "VL3121", prn: "24025331378023", name: "JOGDAND SANIYA RAJU" },
  { roll: "VL3122", prn: "24025331378024", name: "KALE NIVRUTTI VISHNU" },
  { roll: "VL3123", prn: "24025331378025", name: "KATARE SNEHAL RAJU" },
  { roll: "VL3124", prn: "24025331378026", name: "KHAN SHAHBAZ ASLAM" },
  { roll: "VL3125", prn: "24025331378028", name: "KIRDE SAMARTH PRAMOD" },
  { roll: "VL3126", prn: "24025331378029", name: "MAGAR ASHWINI DILIPRAO" },
  { roll: "VL3127", prn: "24025331378030", name: "MORE OM MURLIDHAR" },
  { roll: "VL3128", prn: "24025331378031", name: "MULAGE MAHESH GUNDU" },
  { roll: "VL3129", prn: "24025331378032", name: "MULE KAVERI SADASHIV" },
  { roll: "VL3130", prn: "24025331378033", name: "MULEY ADITI SANJAY" },
  { roll: "VL3131", prn: "24025331378034", name: "NAVLE GAYTRI SHIVAJI" },
  { roll: "VL3132", prn: "24025331378035", name: "OMKAR GANESH NIRMAL" },
  { roll: "VL3133", prn: "24025331378036", name: "OZA KHUSHI ASHISH" },
  { roll: "VL3134", prn: "24025331378037", name: "PAGORE TUSHAR GAJANAN" },
  { roll: "VL3135", prn: "24025331378038", name: "PALE RUSHIKESH SURESH" },
  { roll: "VL3136", prn: "24025331378040", name: "PATHAN YASEER GAFFAR" },
  { roll: "VL3137", prn: "24025331378041", name: "PATIL KUNAL MILIND" },
  { roll: "VL3138", prn: "24025331378042", name: "PATIL VAIBHAV RAMKRUSHNA" },
  { roll: "VL3139", prn: "24025331378043", name: "PAWAR GOVIND KALYAN" },
  { roll: "VL3140", prn: "24025331378044", name: "PEMBHARE GAYATRI SANJAY" },
  { roll: "VL3141", prn: "24025331378045", name: "POKALE GANESH REVANNATH" },
  { roll: "VL3142", prn: "24025331378046", name: "RAUT ADITYA SUKHDEV" },
  { roll: "VL3143", prn: "24025331378047", name: "SABLE ANJALI GAJANAN" },
  { roll: "VL3144", prn: "24025331378048", name: "SABLE SHRAVANI ANIL" },
  { roll: "VL3145", prn: "24025331378049", name: "SAH ADITYA KUMAR MUNNA KUMAR" },
  { roll: "VL3146", prn: "24025331378050", name: "SALUNKE SAKSHI SANTOSH" },
  { roll: "VL3147", prn: "24025331378051", name: "SANGHAVI PURVA VIJAYKUMAR" },
  { roll: "VL3148", prn: "24025331378052", name: "SANGLE ADITYA SUNIL" },
  { roll: "VL3149", prn: "24025331378053", name: "SHAIKH SHOHEB BUDHAN" },
  { roll: "VL3150", prn: "24025331378054", name: "SHEJUL TANVI SANDIP" },
  { roll: "VL3151", prn: "24025331378055", name: "SHINDE ABHAY KRISHNA" },
  { roll: "VL3152", prn: "24025331378056", name: "SHINDE ADITYA SANTOSH" },
  { roll: "VL3153", prn: "24025331378057", name: "SHIRSAT KARTIK RAVINDRA" },
  { roll: "VL3154", prn: "24025331378058", name: "JADHAV SHWETA PUNJAJI" },
  { roll: "VL3155", prn: "24025331378059", name: "SURUDE AARUNDHATI KAILAS" },
  { roll: "VL3156", prn: "24025331378061", name: "SWAMI SHANTANU SATISH" },
  { roll: "VL3157", prn: "24025331378062", name: "TANPURE SHIVPRASAD MACHHINDRNATH" },
  { roll: "VL3158", prn: "24025331378063", name: "TEJANKAR SHWETA GAJANAN" },
  { roll: "VL3159", prn: "24025331378064", name: "TIDKE KARTIK SANTOSH" },
  { roll: "VL3160", prn: "24025331378065", name: "VISHWAKARMA NAINA SUNIL" },
  { roll: "VL3161", prn: "24025331378066", name: "WADEKAR ABHAY DADARAO" },
  { roll: "VL3162", prn: "24025331378067", name: "WAGHMARE RITESH ISHVAR" },
  { roll: "VL3163", prn: "24025331378068", name: "WANKHEDE TANAYA PRAMOD" },
  { roll: "VL3164", prn: "2502533111378AF501", name: "AKOLKAR KANCHAN AMBADAS" },
  { roll: "VL3165", prn: "2502533111378AF502", name: "KATOLE DIVYA RAGHUNATH" },
  { roll: "VL3166", prn: "2502533111378AF503", name: "NARWADE SNEHAL SUNIL" },
  { roll: "VL3167", prn: "2502533111378AF504", name: "DALVI VARAD AJAY" },
  { roll: "VL3168", prn: "2502533111378AF505", name: "PIMPLE VAISHNAVI SANTOSH" },
  { roll: "VL3169", prn: "2502533111378AF506", name: "KADALE PRANAV MADHUKAR" },
  { roll: "VL3170", prn: "2502533111378AF507", name: "CHAVAN PRANJALI RAJENDRA" },
  { roll: "VL3171", prn: "2502533111378AF508", name: "BORDE SNEHAL KAILAS" },
  { roll: "VL3172", prn: "2502533111378AF509", name: "VAISHNAVI RATAN UCHIT" }
];

let dataMismatch = false;
EXPECTED_PROMPT_DATA.forEach((expected, i) => {
  const actual = TE_VLSI_STUDENTS[i];
  if (!actual) {
    console.error(`FAIL: Missing student index ${i} (${expected.roll})`);
    dataMismatch = true;
    return;
  }
  if (actual.prn !== expected.prn || actual.prnNo !== expected.prn) {
    console.error(`FAIL: PRN mismatch for ${expected.roll}: expected ${expected.prn}, got ${actual.prn}`);
    dataMismatch = true;
  }
  if (actual.name !== expected.name) {
    console.error(`FAIL: Name mismatch for ${expected.roll}: expected "${expected.name}", got "${actual.name}"`);
    dataMismatch = true;
  }
  // Check branch / dept
  if (actual.departmentId !== "dept-vlsi" || actual.department !== "Electronics Engineering (VLSI Design & Technology)") {
    console.error(`FAIL: Department mismatch for ${expected.roll}`);
    dataMismatch = true;
  }
  // Check year / sem / academicYear
  if (actual.year !== "Third Year" || actual.semester !== 5 || actual.academicYear !== "2026-27") {
    console.error(`FAIL: Academic info mismatch for ${expected.roll}: year=${actual.year}, sem=${actual.semester}, ay=${actual.academicYear}`);
    dataMismatch = true;
  }
  // Check batches
  const rollNum = parseInt(actual.rollNo.replace("VL3", ""));
  const expectedBatch = rollNum <= 136 ? "TA1" : "TA2";
  const expectedTg = rollNum <= 136 ? "TG-1" : "TG-2";
  const expectedMentor = rollNum <= 136 ? "Mr. G. G. Patil" : "Ms. K. B. Dandge";
  if (actual.batch !== expectedBatch || actual.tgBatch !== expectedTg || actual.teacherGuardian !== expectedMentor) {
    console.error(`FAIL: Batch/TG mismatch for ${expected.roll}: batch=${actual.batch}, tg=${actual.tgBatch}`);
    dataMismatch = true;
  }
  // Check class teacher
  if (actual.classTeacher !== "PROF. G R BHALEKAR") {
    console.error(`FAIL: Class Teacher mismatch for ${expected.roll}`);
    dataMismatch = true;
  }
});
if (!dataMismatch) {
  console.log("PASS: All 72 students match exact Roll, PRN, Name, Department, Year, Semester, Academic Year, and Batch data.");
}

// 4. Check Aditya Shinde link
const aditya = TE_VLSI_STUDENTS.find(s => s.rollNo === "VL3152");
if (aditya && aditya.id === "stu-1" && aditya.prn === "24025331378056" && aditya.name === "SHINDE ADITYA SANTOSH") {
  console.log("PASS: Student 52 (SHINDE ADITYA SANTOSH) correctly preserved with id 'stu-1'.");
} else {
  console.error("FAIL: Aditya Shinde record verification failed:", aditya);
  dataMismatch = true;
}

// 5. Check duplicates in INITIAL_USERS
const studentUsers = INITIAL_USERS.filter(u => u.role === "student" && u.departmentId === "dept-vlsi" && u.semester === 5);
console.log(`TE VLSI students in INITIAL_USERS: ${studentUsers.length}`);
const rollSet = new Set();
let dupRolls = 0;
studentUsers.forEach(s => {
  if (rollSet.has(s.rollNo)) {
    console.error(`FAIL: Duplicate rollNo detected: ${s.rollNo}`);
    dupRolls++;
  }
  rollSet.add(s.rollNo);
});
if (dupRolls === 0 && studentUsers.length === 72) {
  console.log("PASS: Exactly 72 TE VLSI students in INITIAL_USERS with 0 duplicates.");
} else {
  console.error(`FAIL: Duplicates found or count mismatch (${studentUsers.length})`);
}

// 6. Check attendance records
const attendanceKeys = Object.keys(INITIAL_ATTENDANCE);
let studentsWithoutAttendance = 0;
TE_VLSI_STUDENTS.forEach(s => {
  if (!INITIAL_ATTENDANCE[s.id]) {
    console.error(`FAIL: Missing attendance for student ${s.rollNo} (${s.id})`);
    studentsWithoutAttendance++;
  }
});
if (studentsWithoutAttendance === 0) {
  console.log(`PASS: All 72 TE VLSI students have subject-level attendance records in INITIAL_ATTENDANCE.`);
  const adityaAtt = INITIAL_ATTENDANCE["stu-1"];
  console.log(`Aditya Shinde (stu-1) subjects tracked: ${Object.keys(adityaAtt).length}`);
} else {
  console.error(`FAIL: ${studentsWithoutAttendance} students missing attendance.`);
}

// 7. Check Avatars: All students must have avatar: null (profile pictures removed)
let nonNullAvatars = 0;
INITIAL_USERS.filter(u => u.role === "student").forEach(s => {
  if (s.avatar !== null) {
    console.error(`FAIL: Student ${s.rollNo} (${s.name}) has non-null avatar:`, s.avatar);
    nonNullAvatars++;
  }
});
if (nonNullAvatars === 0) {
  console.log("PASS: All students in database have avatar: null (all profile pictures removed).");
} else {
  console.error(`FAIL: Found ${nonNullAvatars} students with profile pictures.`);
}

// 8. Check Logins: Only Aditya Shinde student login permitted
let illegalStudentLogins = 0;
INITIAL_USERS.filter(u => u.role === "student").forEach(s => {
  if (s.id !== "stu-1") {
    if (s.canLogin === true || s.password !== null) {
      console.error(`FAIL: Non-Aditya student ${s.rollNo} has active login credentials:`, s.email);
      illegalStudentLogins++;
    }
  } else {
    if (s.canLogin !== true || !s.password) {
      console.error("FAIL: Aditya Shinde does not have valid login credentials!");
      illegalStudentLogins++;
    }
  }
});
if (illegalStudentLogins === 0) {
  console.log("PASS: Exclusively Aditya Shinde (stu-1) has active student login credentials. All other 71 student logins disabled.");
} else {
  console.error(`FAIL: ${illegalStudentLogins} students have improper login configuration.`);
}

// 9. Check Divisions: This class has NO division (division must be null/empty)
let hasDivisionCount = 0;
TE_VLSI_STUDENTS.forEach(s => {
  if (s.division) {
    console.error(`FAIL: Student ${s.rollNo} has division:`, s.division);
    hasDivisionCount++;
  }
});
if (hasDivisionCount === 0) {
  console.log("PASS: All 72 TE VLSI students have division: null (No division assigned).");
} else {
  console.error(`FAIL: ${hasDivisionCount} students have a division.`);
}

// 10. Check Other Departments: Must be completely empty of students
const nonVlsiStudents = INITIAL_USERS.filter(u => u.role === "student" && u.departmentId !== "dept-vlsi");
if (nonVlsiStudents.length === 0) {
  console.log("PASS: Exactly 0 students in other departments. Other departments show empty as required.");
} else {
  console.error(`FAIL: Found ${nonVlsiStudents.length} students in other departments:`, nonVlsiStudents.map(s => `${s.name} (${s.departmentId})`));
}

// 11. Total Student Count in entire system
const totalStudentsInSystem = INITIAL_USERS.filter(u => u.role === "student").length;
console.log(`Total Students across whole system: ${totalStudentsInSystem} (Expected: 72, exclusively TE VLSI)`);

// 12. Check Class Metadata
console.log("Class metadata:", VLSI_CLASS_METADATA.name, "| Class Teacher:", VLSI_CLASS_METADATA.classTeacher, "| Total Students:", VLSI_CLASS_METADATA.totalStudents);
console.log("=== AUDIT COMPLETE ===");

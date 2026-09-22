import fs from 'fs';

const rawData = `
1. VL3101 | 24025331378001 | RATHOD ANUSHKA NITESH
2. VL3102 | 24025331378002 | BARSALE SWAPNIL JALINDAR
3. VL3103 | 24025331378003 | BHISE NEHA DASHRATH
4. VL3104 | 24025331378004 | BHUVAN AVINASH MAHAMUNI
5. VL3105 | 24025331378005 | CHAUDHARI ARJUN BALASAHEB
6. VL3106 | 24025331378006 | CHAUDHARI SNEHAL SANTOSH
7. VL3107 | 24025331378007 | CHOPADE AVANTIKA PIRAJIRAO
8. VL3108 | 24025331378008 | DESALE PRASAD SHASHIKANT
9. VL3109 | 24025331378010 | DHAWALE RUSHIKESH SANJAY
10. VL3110 | 24025331378011 | DIGHOLE ASHVINI KAILAS
11. VL3111 | 24025331378012 | DONGARE ABHAY AJAY
12. VL3112 | 24025331378013 | DUDHEKAR SAMRUDDHI PRAVIN
13. VL3113 | 24025331378014 | GAIKWAD TUSHAR SANTOSH
14. VL3114 | 24025331378015 | GAWALI DHANRAJ ASHOK
15. VL3115 | 24025331378016 | GOJE SARTHAK SANJAY
16. VL3116 | 24025331378017 | GORE NIKHIL RAMNATH
17. VL3117 | 24025331378018 | GUNAWAT YASH DILIP
18. VL3118 | 24025331378019 | JADHAV ABHISHEK BALASAHEB
19. VL3119 | 24025331378020 | JADHAV ISHWARI MAKARAND
20. VL3120 | 24025331378022 | JANGLE VAISHNAVI SONBA
21. VL3121 | 24025331378023 | JOGDAND SANIYA RAJU
22. VL3122 | 24025331378024 | KALE NIVRUTTI VISHNU
23. VL3123 | 24025331378025 | KATARE SNEHAL RAJU
24. VL3124 | 24025331378026 | KHAN SHAHBAZ ASLAM
25. VL3125 | 24025331378028 | KIRDE SAMARTH PRAMOD
26. VL3126 | 24025331378029 | MAGAR ASHWINI DILIPRAO
27. VL3127 | 24025331378030 | MORE OM MURLIDHAR
28. VL3128 | 24025331378031 | MULAGE MAHESH GUNDU
29. VL3129 | 24025331378032 | MULE KAVERI SADASHIV
30. VL3130 | 24025331378033 | MULEY ADITI SANJAY
31. VL3131 | 24025331378034 | NAVLE GAYTRI SHIVAJI
32. VL3132 | 24025331378035 | OMKAR GANESH NIRMAL
33. VL3133 | 24025331378036 | OZA KHUSHI ASHISH
34. VL3134 | 24025331378037 | PAGORE TUSHAR GAJANAN
35. VL3135 | 24025331378038 | PALE RUSHIKESH SURESH
36. VL3136 | 24025331378040 | PATHAN YASEER GAFFAR
37. VL3137 | 24025331378041 | PATIL KUNAL MILIND
38. VL3138 | 24025331378042 | PATIL VAIBHAV RAMKRUSHNA
39. VL3139 | 24025331378043 | PAWAR GOVIND KALYAN
40. VL3140 | 24025331378044 | PEMBHARE GAYATRI SANJAY
41. VL3141 | 24025331378045 | POKALE GANESH REVANNATH
42. VL3142 | 24025331378046 | RAUT ADITYA SUKHDEV
43. VL3143 | 24025331378047 | SABLE ANJALI GAJANAN
44. VL3144 | 24025331378048 | SABLE SHRAVANI ANIL
45. VL3145 | 24025331378049 | SAH ADITYA KUMAR MUNNA KUMAR
46. VL3146 | 24025331378050 | SALUNKE SAKSHI SANTOSH
47. VL3147 | 24025331378051 | SANGHAVI PURVA VIJAYKUMAR
48. VL3148 | 24025331378052 | SANGLE ADITYA SUNIL
49. VL3149 | 24025331378053 | SHAIKH SHOHEB BUDHAN
50. VL3150 | 24025331378054 | SHEJUL TANVI SANDIP
51. VL3151 | 24025331378055 | SHINDE ABHAY KRISHNA
52. VL3152 | 24025331378056 | SHINDE ADITYA SANTOSH
53. VL3153 | 24025331378057 | SHIRSAT KARTIK RAVINDRA
54. VL3154 | 24025331378058 | JADHAV SHWETA PUNJAJI
55. VL3155 | 24025331378059 | SURUDE AARUNDHATI KAILAS
56. VL3156 | 24025331378061 | SWAMI SHANTANU SATISH
57. VL3157 | 24025331378062 | TANPURE SHIVPRASAD MACHHINDRNATH
58. VL3158 | 24025331378063 | TEJANKAR SHWETA GAJANAN
59. VL3159 | 24025331378064 | TIDKE KARTIK SANTOSH
60. VL3160 | 24025331378065 | VISHWAKARMA NAINA SUNIL
61. VL3161 | 24025331378066 | WADEKAR ABHAY DADARAO
62. VL3162 | 24025331378067 | WAGHMARE RITESH ISHVAR
63. VL3163 | 24025331378068 | WANKHEDE TANAYA PRAMOD
64. VL3164 | 2502533111378AF501 | AKOLKAR KANCHAN AMBADAS
65. VL3165 | 2502533111378AF502 | KATOLE DIVYA RAGHUNATH
66. VL3166 | 2502533111378AF503 | NARWADE SNEHAL SUNIL
67. VL3167 | 2502533111378AF504 | DALVI VARAD AJAY
68. VL3168 | 2502533111378AF505 | PIMPLE VAISHNAVI SANTOSH
69. VL3169 | 2502533111378AF506 | KADALE PRANAV MADHUKAR
70. VL3170 | 2502533111378AF507 | CHAVAN PRANJALI RAJENDRA
71. VL3171 | 2502533111378AF508 | BORDE SNEHAL KAILAS
72. VL3172 | 2502533111378AF509 | VAISHNAVI RATAN UCHIT
`;

const lines = rawData.trim().split('\n').map(l => l.trim()).filter(Boolean);
console.log('Lines count:', lines.length);

const avatars = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=150&auto=format&fit=crop&q=80"
];

const bloodGroups = ["A+", "B+", "O+", "AB+", "O-", "A-", "B-"];

const students = lines.map((line, idx) => {
  const match = line.match(/^(\d+)\.\s*(VL\d+)\s*\|\s*([^|]+)\|\s*(.+)$/);
  if (!match) throw new Error('Line match failed: ' + line);

  const num = parseInt(match[1], 10);
  const rollNo = match[2].trim();
  const prn = match[3].trim();
  const name = match[4].trim();

  const isAditya = rollNo === "VL3152";
  const id = isAditya ? "stu-1" : `stu-vl${num + 3100}`; // or `stu-${rollNo.toLowerCase()}`
  const rollNumeric = parseInt(rollNo.replace(/\D/g, ''), 10);

  const isTA1 = rollNumeric <= 3136;
  const batch = isTA1 ? "TA1" : "TA2";
  const tgBatch = isTA1 ? "TG-1" : "TG-2";
  const tgTeacher = isTA1 ? "Mr. G. G. Patil" : "Ms. K. B. Dandge";

  const emailSlug = name.toLowerCase().split(/\s+/).slice(0, 2).join('.');
  const email = isAditya ? "aditya.shinde@campus.edu" : `${emailSlug}.${rollNo.toLowerCase()}@campus.edu`;

  return {
    id: isAditya ? "stu-1" : `stu-${rollNo.toLowerCase()}`,
    role: "student",
    name,
    displayName: name.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' '),
    email,
    password: "password123",
    rollNo,
    rollNoAlt: isAditya ? "VLSI3152" : rollNo,
    prn,
    prnNo: prn,
    departmentId: "dept-vlsi",
    departmentName: "Electronics Engineering (VLSI Design & Technology)",
    branch: "Electronics Engineering (VLSI Design & Technology)",
    className: "TE VLSI – Semester 5 – Academic Year 2026-27",
    year: "Third Year",
    academicYear: "2026-27",
    semester: 5,
    semesterType: "Odd Semester",
    division: "A",
    classroom: "A-209",
    effectiveFrom: "10-Aug-2026",
    batch,
    tgBatch,
    classTeacher: "PROF. G R BHALEKAR",
    teacherGuardian: tgTeacher,
    mentor: tgTeacher,
    avatar: avatars[idx % avatars.length],
    phone: isAditya ? "7378535499" : `+91 98${Math.floor(10000000 + Math.random() * 90000000)}`,
    parentName: isAditya ? "Santosh Shinde" : `${name.split(' ').slice(1).join(' ') || "Parent"}`,
    parentId: isAditya ? "par-1" : `par-${rollNo.toLowerCase()}`,
    parentPhone: isAditya ? "7378535499" : `+91 98${Math.floor(10000000 + Math.random() * 90000000)}`,
    parentEmail: isAditya ? "santosh.shinde@gmail.com" : `parent.${rollNo.toLowerCase()}@gmail.com`,
    address: isAditya ? "Rohit Complex Chitegaon tq PAithan DIS. Chh. Sambhajinagar" : "Chh. Sambhajinagar",
    bloodGroup: bloodGroups[idx % bloodGroups.length],
    collegeName: "CSMSS Chh. Shahu College of Engineering",
    cgpa: isAditya ? 7.23 : +(7.0 + ((idx * 17) % 25) / 10).toFixed(2)
  };
});

console.log('Students generated:', students.length);
console.log('Sample student 1:', students[0]);
console.log('Sample student 52 (Aditya):', students[51]);
console.log('Sample student 72:', students[71]);

fs.writeFileSync('./scripts/generated_students.json', JSON.stringify(students, null, 2));

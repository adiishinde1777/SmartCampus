// Academic Session & Batch Span Helpers
// SmartCampus ERP Rules:
// 1st Year (FE) -> 2026-2030
// 2nd Year (SE) -> 2025-2029
// 3rd Year (TE) -> 2024-2028
// 4th Year / Final Year (BE) -> 2023-2027

export function getAcademicSession(year, semester) {
  const y = String(year || "").toLowerCase();
  const s = Number(semester);
  if (y.includes("1") || y.includes("first") || y.includes("fe") || s === 1 || s === 2) {
    return "2026-2030";
  }
  if (y.includes("2") || y.includes("second") || y.includes("se") || s === 3 || s === 4) {
    return "2025-2029";
  }
  if (y.includes("3") || y.includes("third") || y.includes("te") || s === 5 || s === 6) {
    return "2024-2028";
  }
  if (y.includes("4") || y.includes("final") || y.includes("fourth") || y.includes("be") || s === 7 || s === 8) {
    return "2023-2027";
  }
  return "2026-2030";
}

export function getYearPrefix(year, semester) {
  const y = String(year || "").toLowerCase();
  const s = Number(semester);
  if (y.includes("1") || y.includes("first") || y.includes("fe") || s === 1 || s === 2) return "FE";
  if (y.includes("2") || y.includes("second") || y.includes("se") || s === 3 || s === 4) return "SE";
  if (y.includes("3") || y.includes("third") || y.includes("te") || s === 5 || s === 6) return "TE";
  if (y.includes("4") || y.includes("final") || y.includes("fourth") || y.includes("be") || s === 7 || s === 8) return "BE";
  return "FE";
}

export function getYearDisplay(year, semester) {
  const y = String(year || "").toLowerCase();
  const s = Number(semester);
  if (y.includes("1") || y.includes("first") || y.includes("fe") || s === 1 || s === 2) return "1st Year";
  if (y.includes("2") || y.includes("second") || y.includes("se") || s === 3 || s === 4) return "2nd Year";
  if (y.includes("3") || y.includes("third") || y.includes("te") || s === 5 || s === 6) return "3rd Year";
  if (y.includes("4") || y.includes("final") || y.includes("fourth") || y.includes("be") || s === 7 || s === 8) return "Final Year";
  return "1st Year";
}

export function getStudentDeptShort(departmentName, departmentCode) {
  if (departmentCode) return departmentCode;
  const d = String(departmentName || "").toLowerCase();
  if (d.includes("vlsi")) return "VLSI";
  if (d.includes("computer") || d.includes("cse")) return "CSE";
  if (d.includes("artificial") || d.includes("ai")) return "AI&DS";
  if (d.includes("mechanical")) return "MECH";
  if (d.includes("civil")) return "CIVIL";
  if (d.includes("electrical")) return "ELECT";
  return departmentName || "Engineering";
}

export function getStudentClassTitle(student) {
  if (!student) return "";
  const prefix = getYearPrefix(student.year, student.semester);
  const dept = getStudentDeptShort(student.departmentName, student.departmentCode || student.departmentId);
  const sem = student.semester || (prefix === "FE" ? 1 : prefix === "SE" ? 3 : prefix === "TE" ? 5 : 7);
  const divStr = student.division ? ` – Div ${student.division}` : "";
  const yr = getYearDisplay(student.year, student.semester);
  return `${prefix} ${dept} – Semester ${sem} (${yr})${divStr}`;
}

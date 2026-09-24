// SmartCampus ERP - Department Year-Wise Divisions and First Year HOD Management

export const ACADEMIC_YEARS = [
  { key: "1st Year", label: "1st Year (FE - First Year)", short: "FE", sem: 1 },
  { key: "2nd Year", label: "2nd Year (SE - Second Year)", short: "SE", sem: 3 },
  { key: "3rd Year", label: "3rd Year (TE - Third Year)", short: "TE", sem: 5 },
  { key: "4th Year", label: "4th Year (BE - Final Year)", short: "BE", sem: 7 }
];

export const DIVISION_OPTIONS = [
  { count: 1, label: "1 Division (Div A)", divs: ["A"] },
  { count: 2, label: "2 Divisions (Div A, Div B)", divs: ["A", "B"] },
  { count: 3, label: "3 Divisions (Div A, Div B, Div C)", divs: ["A", "B", "C"] },
  { count: 4, label: "4 Divisions (Div A, B, C, D)", divs: ["A", "B", "C", "D"] }
];

export function getDivisionsFromCount(count) {
  const letters = ["A", "B", "C", "D", "E", "F"];
  const n = Math.max(1, Math.min(letters.length, Number(count) || 1));
  return letters.slice(0, n);
}

export function normalizeYearKey(yearStr) {
  if (!yearStr) return "1st Year";
  const str = String(yearStr).toLowerCase();
  if (str.includes("1") || str.includes("first") || str.includes("fe")) return "1st Year";
  if (str.includes("2") || str.includes("second") || str.includes("se")) return "2nd Year";
  if (str.includes("3") || str.includes("third") || str.includes("te")) return "3rd Year";
  if (str.includes("4") || str.includes("fourth") || str.includes("final") || str.includes("be")) return "4th Year";
  return "1st Year";
}

/**
 * Returns division letters array for a specific academic year in a department
 * e.g., 1st Year -> ["A", "B"], 2nd Year -> ["A"]
 */
export function getDepartmentYearDivisions(department, yearStr) {
  if (!department) return ["A"];

  const yearKey = normalizeYearKey(yearStr);

  // If department has yearDivisions configured
  if (department.yearDivisions && department.yearDivisions[yearKey]) {
    const val = department.yearDivisions[yearKey];
    if (Array.isArray(val) && val.length > 0) return val;
    if (typeof val === "number") {
      return getDivisionsFromCount(val);
    }
  }

  // Fallback to department's general divisions array
  if (Array.isArray(department.divisions) && department.divisions.length > 0) {
    return department.divisions;
  }

  return ["A"];
}

/**
 * Resolves the effective HOD for a student.
 * If student is in 1st Year (FE), returns the First Year HOD!
 * If student is in 2nd, 3rd, or 4th Year, returns the branch HOD (e.g. VLSI HOD)!
 */
export function getEffectiveHOD({ studentYear, department, users = [], systemSettings = {} }) {
  const isFirstYear = normalizeYearKey(studentYear) === "1st Year";

  if (isFirstYear) {
    // 1. Check if a registered First Year HOD user exists
    const feHODUser = (users || []).find((u) => {
      if (u.role !== "hod") return false;
      const des = (u.designation || "").toLowerCase();
      const dName = (u.departmentName || "").toLowerCase();
      return (
        u.isFirstYearHOD ||
        u.departmentId === "dept-fe" ||
        u.departmentId === "dept-first-year" ||
        dName.includes("first year") ||
        dName.includes("applied science") ||
        dName.includes("basic science") ||
        des.includes("first year") ||
        des.includes("fe hod")
      );
    });

    if (feHODUser) {
      return {
        name: feHODUser.name,
        roleTitle: "Head of First Year Engineering (HOD - FE)",
        roleSubtitle: "Applied Science & Humanities • First Year Coordinator",
        user: feHODUser,
        isFirstYear: true
      };
    }

    // 2. System settings or default designated FE HOD
    const defaultFeHodName =
      systemSettings?.firstYearHod ||
      department?.firstYearHod ||
      "Dr. R. S. Pawar";

    return {
      name: defaultFeHodName,
      roleTitle: "Head of First Year Engineering (HOD - FE)",
      roleSubtitle: "Applied Science & Humanities • First Year In-Charge",
      isFirstYear: true
    };
  }

  // 2nd, 3rd, 4th Year: Branch HOD (e.g. VLSI HOD)
  const deptHODUser = (users || []).find(
    (u) => u.role === "hod" && (
      u.departmentId === department?.id ||
      (department?.code && (u.departmentName || "").toLowerCase().includes(department.code.toLowerCase()))
    )
  );

  const deptHODName = deptHODUser?.name || department?.hod || "Dr. Shrikant Honade";

  return {
    name: deptHODName,
    roleTitle: `Head of Department (${department?.code || "Branch HOD"})`,
    roleSubtitle: department?.name || "Department Academic Head",
    user: deptHODUser,
    isFirstYear: false
  };
}

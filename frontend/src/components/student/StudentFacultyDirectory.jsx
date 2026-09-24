import React, { useState } from "react";
import { useSmartCampus } from "../../context/SmartCampusContext";
import {
  GraduationCap,
  Users,
  Search,
  Mail,
  Phone,
  BookOpen,
  Award,
  ShieldCheck,
  Building2,
  CheckCircle2,
  Send,
  Sparkles,
  Info
} from "lucide-react";
import { Badge } from "../common/UIPrimitives";
import { getEffectiveHOD, normalizeYearKey } from "../../utils/departmentUtils";

export default function StudentFacultyDirectory({ onNavigate }) {
  const { currentUser, users, departments, subjects, addToast, systemSettings } = useSmartCampus();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");

  const isStudent = currentUser?.role === "student";
  const isFirstYearStudent = isStudent && normalizeYearKey(currentUser?.year) === "1st Year";

  const studentDeptId = currentUser?.departmentId || "dept-vlsi";
  const studentDept = departments.find((d) => d.id === studentDeptId) || {
    id: studentDeptId,
    name: currentUser?.departmentName || "Electronic Engineering (VLSI Design And Technology)",
    code: "VLSI",
    hod: "Dr. Shrikant Honade",
    firstYearHod: "Dr. R. S. Pawar"
  };

  const effectiveHOD = getEffectiveHOD({
    studentYear: currentUser?.year,
    department: studentDept,
    users,
    systemSettings
  });

  // Find all faculty and HOD belonging to this student's department
  const isMatchDept = (u) => {
    if (!u) return false;
    if (u.departmentId && u.departmentId === studentDeptId) return true;
    if (u.departmentName && studentDept.name && u.departmentName.toLowerCase().includes(studentDept.name.toLowerCase())) return true;
    if (studentDept.code && u.departmentName && u.departmentName.toLowerCase().includes(studentDept.code.toLowerCase())) return true;
    // Default fallback if single department baseline
    return u.departmentId === "dept-vlsi" || (!u.departmentId && studentDeptId === "dept-vlsi");
  };

  // Principal (College Head)
  const principals = users.filter((u) => u.role === "principal");

  // HOD for this department
  const hodUsers = users.filter((u) => u.role === "hod" && isMatchDept(u));

  // Teachers/Professors for this department
  const teacherUsers = users.filter((u) => u.role === "teacher" && isMatchDept(u));

  // If 1st Year student, ensure First Year HOD is also accessible or highlighted
  const feHODUsers = users.filter(
    (u) =>
      u.role === "hod" &&
      (u.isFirstYearHOD ||
        u.departmentId === "dept-fe" ||
        u.departmentId === "dept-first-year" ||
        (u.departmentName && u.departmentName.toLowerCase().includes("first year")) ||
        (u.designation && u.designation.toLowerCase().includes("first year")))
  );

  // Combine faculty list
  const allDeptFaculty = [...hodUsers, ...teacherUsers];

  // Filtered faculty
  const filteredFaculty = allDeptFaculty.filter((f) => {
    const matchesSearch =
      !searchQuery.trim() ||
      f.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.designation?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.phone?.includes(searchQuery);

    if (!matchesSearch) return false;

    if (selectedFilter === "all") return true;
    if (selectedFilter === "hod") return f.role === "hod";
    if (selectedFilter === "prof") {
      const des = (f.designation || "").toLowerCase();
      return des.includes("professor") && !des.includes("assistant");
    }
    if (selectedFilter === "asst_prof") {
      return (f.designation || "").toLowerCase().includes("assistant professor");
    }
    if (selectedFilter === "lecturer") {
      return (f.designation || "").toLowerCase().includes("lecturer");
    }
    return true;
  });

  const handleContactFaculty = (name, phone) => {
    addToast(
      "Faculty Contact Details",
      `Connecting to ${name} (${phone || "Office Desk"}). Official query logged.`,
      "info"
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header Banner */}
      <div
        style={{
          background: isFirstYearStudent
            ? "linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #0369a1 100%)"
            : "linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e3a8a 100%)",
          borderRadius: "16px",
          padding: "24px 28px",
          color: "white",
          boxShadow: "0 10px 25px -5px rgba(30, 27, 75, 0.4)",
          position: "relative",
          overflow: "hidden"
        }}
      >
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(255,255,255,0.12)", padding: "4px 12px", borderRadius: "20px", fontSize: "0.76rem", fontWeight: "700", marginBottom: "10px", color: "#c7d2fe" }}>
            <Building2 size={14} /> {isFirstYearStudent ? "FIRST YEAR ENGINEERING • ACADEMIC DIRECTORY" : "DEPARTMENT FACULTY DIRECTORY"}
          </div>
          <h2 style={{ fontSize: "1.6rem", fontWeight: "800", margin: "0 0 6px 0", color: "#ffffff" }}>
            {studentDept.name}
          </h2>
          <p style={{ margin: 0, fontSize: "0.88rem", color: "#cbd5e1", maxWidth: "750px", lineHeight: 1.5 }}>
            {isFirstYearStudent
              ? "Welcome 1st Year (FE) student. Your academic coordination is directed by the First Year HOD alongside department faculty members, professors, and course coordinators."
              : "Meet your Department Head (HOD), Professors, Assistant Professors, and Lecturers. Access their academic designations, teaching subjects, and official communication channels."}
          </p>

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "16px" }}>
            <div style={{ background: "rgba(255,255,255,0.15)", padding: "6px 14px", borderRadius: "10px", fontSize: "0.82rem", border: "1px solid rgba(255,255,255,0.2)" }}>
              {isFirstYearStudent ? "🎓 First Year HOD: " : "🏛️ Department HOD: "}
              <strong>{effectiveHOD.name}</strong>
            </div>
            {isFirstYearStudent && (
              <div style={{ background: "rgba(255,255,255,0.1)", padding: "6px 14px", borderRadius: "10px", fontSize: "0.82rem" }}>
                🏛️ Branch HOD: <strong>{studentDept.hod || "Dr. Shrikant Honade"}</strong>
              </div>
            )}
            <div style={{ background: "rgba(255,255,255,0.1)", padding: "6px 14px", borderRadius: "10px", fontSize: "0.82rem" }}>
              👨‍🏫 Active Dept Faculty: <strong>{allDeptFaculty.length} Registered</strong>
            </div>
            <div style={{ background: "rgba(255,255,255,0.1)", padding: "6px 14px", borderRadius: "10px", fontSize: "0.82rem" }}>
              🎓 Branch: <strong>{studentDept.code || "VLSI"}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* 1st Year Student Special HOD Spotlight Banner */}
      {isFirstYearStudent && (
        <div
          style={{
            background: "#eff6ff",
            border: "1.5px solid #93c5fd",
            borderRadius: "14px",
            padding: "16px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "16px"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div
              style={{
                width: "52px",
                height: "52px",
                borderRadius: "50%",
                background: "#dbeafe",
                color: "#1d4ed8",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "800",
                fontSize: "1.2rem",
                border: "2px solid #3b82f6"
              }}
            >
              FE
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "1.1rem", fontWeight: "800", color: "#1e3a8a" }}>
                  {effectiveHOD.name}
                </span>
                <span style={{ background: "#dbeafe", color: "#1d4ed8", padding: "2px 8px", borderRadius: "6px", fontSize: "0.74rem", fontWeight: "800" }}>
                  🎓 Head of First Year (FE HOD)
                </span>
              </div>
              <div style={{ fontSize: "0.82rem", color: "#475569", marginTop: "2px" }}>
                Applied Science & Humanities • All 1st Year Engineering Academic Affairs Coordinator
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <span style={{ fontSize: "0.78rem", color: "#1e40af", background: "#ffffff", padding: "4px 10px", borderRadius: "6px", border: "1px solid #bfdbfe", fontWeight: "600" }}>
              Designated FE Academic Authority
            </span>
          </div>
        </div>
      )}

      {/* College Principal & Director Leadership Banner */}
      {principals.length > 0 && (
        <div
          style={{
            background: "#f0fdf4",
            border: "1.5px solid #86efac",
            borderRadius: "14px",
            padding: "16px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "16px"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <img
              src={principals[0].avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80"}
              alt="Principal"
              style={{ width: "52px", height: "52px", borderRadius: "50%", objectFit: "cover", border: "2.5px solid #16a34a" }}
            />
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "1.1rem", fontWeight: "800", color: "#0f172a" }}>
                  {principals[0].name}
                </span>
                <span style={{ background: "#dcfce7", color: "#166534", padding: "2px 8px", borderRadius: "6px", fontSize: "0.74rem", fontWeight: "800" }}>
                  🎓 Principal & Director
                </span>
                {principals[0].gender && (
                  <span style={{ fontSize: "0.74rem", color: "#64748b", fontWeight: "600" }}>
                    ({principals[0].gender === "Female" ? "स्त्री / Madam" : "पुरुष / Sir"})
                  </span>
                )}
              </div>
              <div style={{ fontSize: "0.82rem", color: "#475569", marginTop: "2px" }}>
                Executive Head of CSMSS Chh. Shahu College of Engineering • Entire College Oversight
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            {principals[0].phone && (
              <a
                href={`tel:${principals[0].phone}`}
                className="btn btn-secondary btn-sm"
                style={{ display: "inline-flex", alignItems: "center", gap: "6px", textDecoration: "none", fontSize: "0.8rem" }}
              >
                <Phone size={14} color="#16a34a" />
                <span>+91 {principals[0].phone}</span>
              </a>
            )}
            {principals[0].email && (
              <a
                href={`mailto:${principals[0].email}`}
                className="btn btn-secondary btn-sm"
                style={{ display: "inline-flex", alignItems: "center", gap: "6px", textDecoration: "none", fontSize: "0.8rem" }}
              >
                <Mail size={14} color="#16a34a" />
                <span>Email Office</span>
              </a>
            )}
          </div>
        </div>
      )}

      {/* Search and Filters Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
        {/* Search */}
        <div style={{ position: "relative", minWidth: "260px", flex: 1 }}>
          <Search size={16} color="#64748b" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
          <input
            type="text"
            placeholder="Search by faculty name, designation (e.g. HOD, Professor, Lecturer)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-control"
            style={{ paddingLeft: "38px" }}
          />
        </div>

        {/* Filter Pills */}
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {[
            { id: "all", label: `All (${allDeptFaculty.length})` },
            { id: "hod", label: `🏛️ HOD (${hodUsers.length})` },
            { id: "prof", label: `👨‍🏫 Professors (${allDeptFaculty.filter((f) => (f.designation || "").toLowerCase().includes("professor") && !(f.designation || "").toLowerCase().includes("assistant")).length})` },
            { id: "asst_prof", label: `👨‍🏫 Asst. Professors (${allDeptFaculty.filter((f) => (f.designation || "").toLowerCase().includes("assistant")).length})` },
            { id: "lecturer", label: `👨‍🏫 Lecturers (${allDeptFaculty.filter((f) => (f.designation || "").toLowerCase().includes("lecturer")).length})` }
          ].map((btn) => (
            <button
              key={btn.id}
              onClick={() => setSelectedFilter(btn.id)}
              className={`btn btn-sm ${selectedFilter === btn.id ? "btn-primary" : "btn-secondary"}`}
              style={{ fontWeight: "600", fontSize: "0.8rem" }}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Faculty Cards Grid */}
      {filteredFaculty.length > 0 ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "20px" }}>
          {filteredFaculty.map((fac) => {
            const isHOD = fac.role === "hod" || (fac.designation || "").toLowerCase().includes("head of department");
            const facSubjects = subjects.filter(
              (s) => (s.teacherId && s.teacherId === fac.id) || (s.teacherName && s.teacherName.toLowerCase() === fac.name?.toLowerCase())
            );

            return (
              <div
                key={fac.id}
                className="card"
                style={{
                  borderTop: isHOD ? "4px solid #f59e0b" : "4px solid #4f46e5",
                  boxShadow: isHOD ? "0 10px 20px -5px rgba(245, 158, 11, 0.2)" : "0 4px 12px rgba(0,0,0,0.06)",
                  position: "relative",
                  transition: "all 0.2s ease"
                }}
              >
                {/* Top Badge for HOD */}
                {isHOD && (
                  <div
                    style={{
                      position: "absolute",
                      top: "12px",
                      right: "12px",
                      background: "#fef3c7",
                      color: "#92400e",
                      padding: "3px 10px",
                      borderRadius: "20px",
                      fontSize: "0.72rem",
                      fontWeight: "800",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px"
                    }}
                  >
                    <span>🏛️ DEPARTMENT HEAD</span>
                  </div>
                )}

                {/* Profile Header */}
                <div style={{ display: "flex", gap: "14px", alignItems: "center", marginBottom: "14px" }}>
                  <img
                    src={fac.avatar || `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80`}
                    alt={fac.name}
                    style={{
                      width: "60px",
                      height: "60px",
                      borderRadius: "50%",
                      objectFit: "cover",
                      border: isHOD ? "2.5px solid #f59e0b" : "2.5px solid #6366f1"
                    }}
                  />
                  <div>
                    <h3 style={{ fontSize: "1.12rem", fontWeight: "800", color: "var(--text-main)", margin: "0 0 3px 0" }}>
                      {fac.name}
                    </h3>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                      <span
                        style={{
                          background: isHOD ? "#fef3c7" : "#ede9fe",
                          color: isHOD ? "#b45309" : "#6d28d9",
                          padding: "2px 8px",
                          borderRadius: "6px",
                          fontSize: "0.74rem",
                          fontWeight: "700"
                        }}
                      >
                        {fac.designation || (isHOD ? "Head of Department" : "Faculty")}
                      </span>

                      {fac.gender && (
                        <span style={{ fontSize: "0.73rem", color: "#64748b", fontWeight: "600" }}>
                          {fac.gender === "Female" ? "👩 Madam (स्त्री)" : "👨 Sir (पुरुष)"}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Details Section */}
                <div
                  style={{
                    background: "var(--bg-surface-secondary, #f8fafc)",
                    borderRadius: "10px",
                    padding: "12px 14px",
                    fontSize: "0.82rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                    marginBottom: "14px"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--text-muted, #64748b)" }}>Department / Branch:</span>
                    <strong style={{ color: "#0f172a" }}>{fac.departmentName || studentDept.name}</strong>
                  </div>

                  {fac.assignedDivisions && (
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "var(--text-muted, #64748b)" }}>Divisions:</span>
                      <strong style={{ color: "#2563eb" }}>{fac.assignedDivisions}</strong>
                    </div>
                  )}

                  {fac.phone && (
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "var(--text-muted, #64748b)" }}>Mobile Contact:</span>
                      <strong style={{ color: "#059669" }}>+91 {fac.phone}</strong>
                    </div>
                  )}

                  {fac.email && (
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "var(--text-muted, #64748b)" }}>Email Address:</span>
                      <span style={{ color: "#1e40af", fontWeight: "600", fontSize: "0.78rem" }}>{fac.email}</span>
                    </div>
                  )}
                </div>

                {/* Assigned Subjects */}
                <div style={{ marginBottom: "14px" }}>
                  <div style={{ fontSize: "0.76rem", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "6px" }}>
                    Assigned Subjects / Teaching Courses:
                  </div>
                  {facSubjects.length > 0 ? (
                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                      {facSubjects.map((s) => (
                        <span
                          key={s.id}
                          style={{
                            background: "#eff6ff",
                            color: "#1d4ed8",
                            border: "1px solid #bfdbfe",
                            borderRadius: "6px",
                            padding: "3px 8px",
                            fontSize: "0.75rem",
                            fontWeight: "600"
                          }}
                        >
                          {s.name} ({s.code || "Course"})
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div style={{ fontSize: "0.78rem", color: "#94a3b8", fontStyle: "italic" }}>
                      Department core curriculum & mentorship
                    </div>
                  )}
                </div>

                {/* Action buttons */}
                <div style={{ display: "flex", gap: "10px", marginTop: "auto" }}>
                  {fac.phone && (
                    <a
                      href={`tel:${fac.phone}`}
                      className="btn btn-secondary btn-sm"
                      style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", textDecoration: "none", fontSize: "0.78rem", fontWeight: "700" }}
                    >
                      <Phone size={14} color="#059669" />
                      <span>Call Sir/Madam</span>
                    </a>
                  )}

                  <button
                    type="button"
                    onClick={() => handleContactFaculty(fac.name, fac.phone)}
                    className="btn btn-primary btn-sm"
                    style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", fontSize: "0.78rem", fontWeight: "700" }}
                  >
                    <Send size={14} />
                    <span>Send Query</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty Search or Baseline Fallback */
        <div
          style={{
            background: "white",
            borderRadius: "16px",
            padding: "36px 24px",
            textAlign: "center",
            border: "1px solid #e2e8f0"
          }}
        >
          <div
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              background: "#ede9fe",
              color: "#7c3aed",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px auto"
            }}
          >
            <Users size={32} />
          </div>
          <h3 style={{ fontSize: "1.2rem", fontWeight: "700", color: "#0f172a" }}>
            No Matching Faculty Found for Filter
          </h3>
          <p style={{ fontSize: "0.85rem", color: "#64748b", maxWidth: "500px", margin: "8px auto 16px auto" }}>
            As professors and lecturers from <strong>{studentDept.name}</strong> register into the portal, they will automatically appear here with their designations and assigned subjects.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setSelectedFilter("all");
            }}
            className="btn btn-secondary btn-md"
          >
            Clear Filter & Show All
          </button>
        </div>
      )}
    </div>
  );
}

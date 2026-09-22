import React, { useState } from "react";
import { useSmartCampus } from "../../context/SmartCampusContext";
import {
  Users,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle2,
  Phone,
  Mail,
  Send,
  MessageSquare,
  ShieldCheck,
  Building2,
  GraduationCap
} from "lucide-react";
import { Badge, Modal } from "../common/UIPrimitives";

export default function HODStudents() {
  const { currentUser, users, attendance, subjects, marks, departments, systemSettings, addToast } = useSmartCampus();

  // HOD is strictly restricted to their assigned department only
  const deptId = currentUser?.departmentId || "dept-vlsi";
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all"); // 'all' | 'defaulters' | 'good'
  const [selectedYear, setSelectedYear] = useState("all"); // 'all' | '2nd-year' | '3rd-year' | 'final-year'
  const [selectedStudentAlert, setSelectedStudentAlert] = useState(null);
  const [isRosterLoaded, setIsRosterLoaded] = useState(false);

  const activeDept = departments.find((d) => d.id === deptId) || {
    id: deptId,
    name: currentUser?.departmentName || "Electronic Engineering (VLSI Design And Technology)"
  };
  const deptStudents = users.filter((u) => u.role === "student" && u.departmentId === deptId);
  const threshold = systemSettings.attendanceThreshold;

  const studentDataList = deptStudents.map((stu) => {
    const sAtt = attendance[stu.id] || {};
    let total = 0;
    let att = 0;
    subjects.forEach((s) => {
      const d = sAtt[s.id] || { total: 20, attended: 16, percentage: 80 };
      total += d.total;
      att += d.attended;
    });
    const avgAtt = total > 0 ? Math.round((att / total) * 1000) / 10 : 80;

    const stuMarks = marks.filter((m) => m.studentId === stu.id);
    const avgM = stuMarks.length > 0
      ? Math.round(stuMarks.reduce((a, b) => a + (b.marksObtained / b.maxMarks) * 100, 0) / stuMarks.length)
      : 75;

    return {
      ...stu,
      overallAttendance: avgAtt,
      avgMarks: avgM,
      isDefaulter: avgAtt < threshold
    };
  });

  const filtered = studentDataList.filter((s) => {
    // Academic Year filter
    if (selectedYear === "2nd-year" && !(s.semester === 3 || s.semester === 4 || s.year?.includes("Second") || s.batch?.includes("SE") || s.className?.includes("SE"))) return false;
    if (selectedYear === "3rd-year" && !(s.semester === 5 || s.semester === 6 || s.year?.includes("Third") || s.batch?.includes("TE") || s.className?.includes("TE"))) return false;
    if (selectedYear === "final-year" && !(s.semester === 7 || s.semester === 8 || s.year?.includes("Final") || s.year?.includes("Fourth") || s.batch?.includes("BE") || s.className?.includes("BE"))) return false;

    const term = searchTerm.toLowerCase();
    const matchesSearch =
      s.name.toLowerCase().includes(term) ||
      s.rollNo.toLowerCase().includes(term) ||
      (s.prn && s.prn.toLowerCase().includes(term)) ||
      (s.rollNoAlt && s.rollNoAlt.toLowerCase().includes(term));
    if (!matchesSearch) return false;
    if (filterType === "defaulters") return s.isDefaulter;
    if (filterType === "good") return !s.isDefaulter;
    return true;
  });

  const handleSendSpecialAlert = (stu) => {
    addToast(
      "Official HOD Defaulter Notice Sent",
      `Notice dispatched to ${stu.name} and parent ${stu.parentName} (${stu.parentPhone}).`,
      "warning"
    );
    setSelectedStudentAlert(null);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
            <h2 style={{ fontSize: "1.5rem", fontWeight: "800", color: "var(--text-main)", margin: 0 }}>
              Department Student Directory
            </h2>
            <span className="badge badge-purple" style={{ fontSize: "0.78rem" }}>
              {filtered.length} Students {selectedYear !== "all" ? `(${selectedYear.replace("-", " ").toUpperCase()})` : "Enrolled"}
            </span>
          </div>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "4px" }}>
            {activeDept?.name} • 2nd Year (SE), 3rd Year (TE), and Final Year (BE)
          </p>
        </div>

        <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
          {/* Department Locked Badge - Strictly Scoped to HOD's Assigned Department */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "rgba(99, 102, 241, 0.08)",
              border: "1px solid rgba(99, 102, 241, 0.25)",
              padding: "7px 14px",
              borderRadius: "10px",
              fontSize: "0.85rem",
              fontWeight: "700",
              color: "var(--primary-700)"
            }}
          >
            <ShieldCheck size={16} color="var(--primary-600)" />
            <span>Dept: <strong>{activeDept?.name}</strong></span>
            <span style={{ fontSize: "0.72rem", background: "var(--primary-100)", color: "var(--primary-800)", padding: "2px 8px", borderRadius: "12px" }}>
              VLSI Scope
            </span>
          </div>

          <div style={{ display: "flex", gap: "8px" }}>
            <button
              className={`btn btn-sm ${filterType === "all" ? "btn-primary" : "btn-secondary"}`}
              onClick={() => setFilterType("all")}
            >
              All ({deptStudents.length})
            </button>
            <button
              className={`btn btn-sm ${filterType === "defaulters" ? "btn-danger" : "btn-secondary"}`}
              onClick={() => setFilterType("defaulters")}
            >
              Defaulters (&lt;{threshold}%)
            </button>
            <button
              className={`btn btn-sm ${filterType === "good" ? "btn-success" : "btn-secondary"}`}
              onClick={() => setFilterType("good")}
            >
              Compliant (&gt;={threshold}%)
            </button>
          </div>
        </div>
      </div>

      {/* Academic Year Selection Bar (2nd, 3rd, Final Year) */}
      <div
        className="card"
        style={{
          padding: "12px 18px",
          background: "var(--bg-surface)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
          borderLeft: "4px solid var(--primary-600)"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <GraduationCap size={20} color="var(--primary-600)" />
          <div>
            <div style={{ fontSize: "0.88rem", fontWeight: "800", color: "var(--text-main)" }}>
              Select Academic Year Class:
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
              Department cohorts: 2nd Year (SE), 3rd Year (TE), and Final Year (BE)
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {[
            { key: "all", label: "All Years", desc: "All Cohorts" },
            { key: "2nd-year", label: "2nd Year (SE)", desc: "Sem 3 & 4" },
            { key: "3rd-year", label: "3rd Year (TE)", desc: "Sem 5 & 6 (72 Students)" },
            { key: "final-year", label: "Final Year (BE)", desc: "Sem 7 & 8" }
          ].map((yr) => (
            <button
              key={yr.key}
              onClick={() => setSelectedYear(yr.key)}
              className={`btn btn-sm ${selectedYear === yr.key ? "btn-primary" : "btn-secondary"}`}
              style={{
                display: "inline-flex",
                flexDirection: "column",
                alignItems: "flex-start",
                padding: "6px 14px",
                lineHeight: "1.2"
              }}
            >
              <span style={{ fontWeight: "700", fontSize: "0.82rem" }}>{yr.label}</span>
              <span style={{ fontSize: "0.68rem", opacity: selectedYear === yr.key ? 0.9 : 0.6 }}>{yr.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Search Bar */}
      <div className="card" style={{ padding: "14px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Search size={18} color="var(--text-muted)" />
          <input
            type="text"
            className="form-control"
            style={{ border: "none", boxShadow: "none", padding: "0" }}
            placeholder="Search by student name, roll number, or PRN (e.g. VL3101, 24025331378001, SHINDE)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Privacy Control / Load Roster Toggle */}
      <div
        className="card"
        style={{
          padding: "16px 20px",
          background: "linear-gradient(135deg, rgba(99, 102, 241, 0.06), rgba(59, 130, 246, 0.03))",
          border: "1.5px solid rgba(99, 102, 241, 0.25)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "14px"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "10px",
              background: isRosterLoaded ? "#ecfdf5" : "rgba(99, 102, 241, 0.12)",
              color: isRosterLoaded ? "#059669" : "var(--primary-600)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            {isRosterLoaded ? <Users size={22} /> : <ShieldCheck size={22} />}
          </div>
          <div>
            <div style={{ fontWeight: "800", fontSize: "0.95rem", color: "var(--text-main)" }}>
              {isRosterLoaded ? "Department Student Directory Unlocked" : "Department Student Directory Protected (Privacy Shield Active)"}
            </div>
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
              {isRosterLoaded
                ? `Displaying ${filtered.length} enrolled student records for ${activeDept.name}.`
                : "Student roster and guardian contact records are hidden by default. Confirm parameters above, then click to view."}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          {isRosterLoaded ? (
            <button
              onClick={() => setIsRosterLoaded(false)}
              className="btn btn-secondary btn-sm"
              style={{ fontWeight: "600" }}
            >
              Hide Student Roster
            </button>
          ) : (
            <button
              onClick={() => setIsRosterLoaded(true)}
              className="btn btn-primary btn-sm"
              style={{ display: "inline-flex", alignItems: "center", gap: "8px", fontWeight: "700" }}
            >
              <Users size={16} /> Load Student Directory ({filtered.length})
            </button>
          )}
        </div>
      </div>

      {!isRosterLoaded ? (
        <div
          className="card"
          style={{
            padding: "50px 24px",
            textAlign: "center",
            background: "linear-gradient(180deg, var(--bg-surface), var(--bg-surface-secondary))"
          }}
        >
          <div
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              background: "rgba(99, 102, 241, 0.1)",
              color: "var(--primary-600)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px auto"
            }}
          >
            <ShieldCheck size={32} />
          </div>
          <h3 style={{ fontSize: "1.25rem", fontWeight: "800", color: "var(--text-main)" }}>
            Department Student Roster Protected
          </h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", maxWidth: "520px", margin: "8px auto 22px auto", lineHeight: "1.5" }}>
            Student roster, attendance statistics, and parent contact information for <strong>Electronic Engineering (VLSI)</strong> are protected. Click below to load the student directory.
          </p>
          <button
            type="button"
            onClick={() => setIsRosterLoaded(true)}
            className="btn btn-primary btn-lg"
            style={{ display: "inline-flex", alignItems: "center", gap: "8px", margin: "0 auto", fontWeight: "700" }}
          >
            <Users size={18} /> Load Student Directory ({filtered.length} Students)
          </button>
        </div>
      ) : (
        /* Table */
        <div className="card">
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Roll No & Batch</th>
                  <th>Student Name & PRN</th>
                  <th>Overall Attendance</th>
                  <th>Avg Internal Marks</th>
                  <th>Compliance Status</th>
                  <th>Parent Contact & Alert</th>
                  <th>HOD Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: "center", padding: "48px 20px", color: "var(--text-muted)" }}>
                      <Users size={40} style={{ opacity: 0.3, margin: "0 auto 12px", display: "block" }} />
                      <div style={{ fontWeight: "700", fontSize: "1.05rem", color: "var(--text-main)" }}>No Students Enrolled in this Department</div>
                      <p style={{ fontSize: "0.85rem", marginTop: "6px", maxWidth: "480px", margin: "6px auto 0" }}>
                        There are currently no student records registered under {activeDept.name}.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((stu) => (
                    <tr key={stu.id}>
                      <td>
                        <strong>{stu.rollNo}</strong>
                        <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "2px" }}>
                          {stu.batch || "TE VLSI"} • Div {stu.division || "A"}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          {stu.avatar ? (
                            <img
                              src={stu.avatar}
                              alt={stu.name}
                              style={{ width: "34px", height: "34px", borderRadius: "50%", objectFit: "cover" }}
                            />
                          ) : (
                            <div
                              style={{
                                width: "34px",
                                height: "34px",
                                borderRadius: "50%",
                                background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                                color: "white",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontWeight: "700",
                                fontSize: "0.8rem",
                                flexShrink: 0
                              }}
                            >
                              {stu.name ? stu.name.split(" ").slice(0, 2).map((n) => n[0]).join("") : "ST"}
                            </div>
                          )}
                          <div>
                            <strong style={{ color: "var(--text-main)" }}>{stu.name}</strong>
                            <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                              PRN: {stu.prn || "24025331378000"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <div
                            style={{
                              width: "8px",
                              height: "8px",
                              borderRadius: "50%",
                              background: stu.isDefaulter ? "var(--danger-solid)" : "var(--success-solid)"
                            }}
                          />
                          <strong style={{ fontSize: "0.95rem", color: stu.isDefaulter ? "var(--danger-solid)" : "var(--text-main)" }}>
                            {stu.overallAttendance}%
                          </strong>
                        </div>
                      </td>
                      <td>
                        <strong style={{ fontSize: "0.95rem", color: "var(--text-main)" }}>
                          {stu.avgMarks}%
                        </strong>
                      </td>
                      <td>
                        {stu.isDefaulter ? (
                          <Badge variant="danger">
                            <AlertTriangle size={12} style={{ marginRight: "4px" }} />
                            Defaulter (&lt;{threshold}%)
                          </Badge>
                        ) : (
                          <Badge variant="success">
                            <CheckCircle2 size={12} style={{ marginRight: "4px" }} />
                            Compliant (&gt;={threshold}%)
                          </Badge>
                        )}
                      </td>
                      <td>
                        <div style={{ fontSize: "0.82rem" }}>
                          <span style={{ fontWeight: "600" }}>{stu.parentName}</span>
                          <div style={{ fontSize: "0.75rem", color: "#047857" }}>{stu.parentPhone}</div>
                        </div>
                      </td>
                      <td>
                        {stu.isDefaulter ? (
                          <button
                            onClick={() => setSelectedStudentAlert(stu)}
                            className="btn btn-danger btn-sm"
                          >
                            <Send size={12} /> Issue HOD Warning
                          </button>
                        ) : (
                          <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Good standing</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* HOD Warning Confirmation Modal */}
      <Modal
        isOpen={Boolean(selectedStudentAlert)}
        onClose={() => setSelectedStudentAlert(null)}
        title={`Issue Official HOD Warning: ${selectedStudentAlert?.name}`}
      >
        <div>
          <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", marginBottom: "16px" }}>
            This will dispatch a high-priority official debarment notice to <strong>{selectedStudentAlert?.parentName}</strong> ({selectedStudentAlert?.parentPhone}) citing that <strong>{selectedStudentAlert?.name}</strong> has only <strong>{selectedStudentAlert?.overallAttendance}% attendance</strong>.
          </p>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
            <button className="btn btn-secondary" onClick={() => setSelectedStudentAlert(null)}>Cancel</button>
            <button className="btn btn-danger" onClick={() => handleSendSpecialAlert(selectedStudentAlert)}>
              Confirm & Dispatch Alert
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

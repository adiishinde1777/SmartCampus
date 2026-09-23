import React, { useState } from "react";
import { useSmartCampus } from "../../context/SmartCampusContext";
import {
  Layers,
  ChevronRight,
  Building2,
  Users,
  BookOpen,
  User,
  CalendarCheck,
  Award,
  Phone,
  Mail,
  ArrowLeft
} from "lucide-react";
import { Badge } from "../common/UIPrimitives";

export default function PrincipalCollegeOverview() {
  const { departments, subjects, users, attendance, marks, systemSettings } = useSmartCampus();

  // Drilldown hierarchy state
  // level: 'college' | 'department' | 'semester' | 'division' | 'subject' | 'student'
  const [selectedDeptId, setSelectedDeptId] = useState("dept-vlsi");
  const [selectedSemester, setSelectedSemester] = useState(5);
  const [selectedDivision, setSelectedDivision] = useState("A");
  const [selectedSubjectId, setSelectedSubjectId] = useState("sub-vlsi501");
  const [selectedStudentId, setSelectedStudentId] = useState("stu-1");
  const [viewLevel, setViewLevel] = useState("department"); // start at department level for immediate richness

  const activeDept = departments.find((d) => d.id === selectedDeptId) || departments[0];
  const activeSubject = subjects.find((s) => s.id === selectedSubjectId) || subjects[0];
  const deptStudents = users.filter((u) => u.role === "student" && u.departmentId === selectedDeptId);
  const activeStudent = users.find((u) => u.id === selectedStudentId) || deptStudents[0];
  const threshold = systemSettings.attendanceThreshold;

  const handleSelectDept = (dId) => {
    setSelectedDeptId(dId);
    setViewLevel("department");
  };

  const handleSelectStudent = (sId) => {
    setSelectedStudentId(sId);
    setViewLevel("student");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div>
        <h2 style={{ fontSize: "1.5rem", fontWeight: "800", color: "var(--text-main)" }}>
          Institutional Multi-Tier Academic Drill-Down Inspector
        </h2>
        <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "4px" }}>
          Inspect academic operations hierarchically: <strong>College → Department → Semester → Division → Subject → Student</strong>
        </p>
      </div>

      {/* Interactive Breadcrumb Stepper */}
      <div
        className="card"
        style={{
          padding: "14px 20px",
          background: "var(--primary-950)",
          color: "white",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          flexWrap: "wrap"
        }}
      >
        <button
          onClick={() => setViewLevel("college")}
          style={{ background: "none", border: "none", color: viewLevel === "college" ? "#60a5fa" : "white", fontWeight: "700", cursor: "pointer" }}
        >
          {systemSettings.collegeName}
        </button>

        <ChevronRight size={14} color="#94a3b8" />

        <button
          onClick={() => setViewLevel("department")}
          style={{ background: "none", border: "none", color: viewLevel === "department" ? "#60a5fa" : "white", fontWeight: "700", cursor: "pointer" }}
        >
          {activeDept.name}
        </button>

        <ChevronRight size={14} color="#94a3b8" />

        <button
          onClick={() => setViewLevel("division")}
          style={{ background: "none", border: "none", color: viewLevel === "division" ? "#60a5fa" : "white", fontWeight: "700", cursor: "pointer" }}
        >
          Sem {selectedSemester} - Div {selectedDivision}
        </button>

        <ChevronRight size={14} color="#94a3b8" />

        <button
          onClick={() => setViewLevel("subject")}
          style={{ background: "none", border: "none", color: viewLevel === "subject" ? "#60a5fa" : "white", fontWeight: "700", cursor: "pointer" }}
        >
          {activeSubject.name}
        </button>

        {viewLevel === "student" && (
          <>
            <ChevronRight size={14} color="#94a3b8" />
            <span style={{ color: "#38bdf8", fontWeight: "800" }}>Student: {activeStudent?.name}</span>
          </>
        )}
      </div>

      {/* VIEW: DEPARTMENT LEVEL */}
      {viewLevel === "department" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "16px" }}>
            {departments.map((d) => (
              <div
                key={d.id}
                className="card"
                onClick={() => handleSelectDept(d.id)}
                style={{
                  cursor: "pointer",
                  border: d.id === selectedDeptId ? "2px solid #2563eb" : "1px solid var(--border-subtle)",
                  background: d.id === selectedDeptId ? "var(--primary-50)" : "white"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <Badge variant="purple">{d.code}</Badge>
                  <strong>{d.avgAttendance}% Avg Att</strong>
                </div>
                <h3 style={{ fontSize: "1.1rem", fontWeight: "700" }}>{d.name}</h3>
                <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "4px" }}>
                  HOD: {d.hod} • {d.studentCount} Students
                </div>
              </div>
            ))}
          </div>

          {/* Division Selector */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <Users size={18} color="var(--primary-600)" />
                {activeDept.name} Students List ({deptStudents.length} Students)
              </div>
              <Badge variant="info">Select a student to inspect complete history</Badge>
            </div>

            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Roll No</th>
                    <th>Student Name</th>
                    <th>DBMS Att %</th>
                    <th>OS Att %</th>
                    <th>Unit Test Marks</th>
                    <th>Drill-Down Action</th>
                  </tr>
                </thead>
                <tbody>
                  {deptStudents.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: "center", padding: "28px", color: "var(--text-muted)" }}>
                        No enrolled students in this department yet.
                      </td>
                    </tr>
                  ) : (
                    deptStudents.map((stu) => {
                      const dbmsAtt = attendance[stu.id]?.["sub-dbms"]?.percentage || 80;
                      const osAtt = attendance[stu.id]?.["sub-os"]?.percentage || 80;
                      const stuMark = marks.find((m) => m.studentId === stu.id);

                      return (
                        <tr key={stu.id}>
                          <td><Badge variant="gray">{stu.rollNo}</Badge></td>
                          <td>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              {stu.avatar ? (
                                <img src={stu.avatar} alt={stu.name} style={{ width: "30px", height: "30px", borderRadius: "50%" }} />
                              ) : (
                                <div
                                  style={{
                                    width: "30px",
                                    height: "30px",
                                    borderRadius: "50%",
                                    background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                                    color: "white",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontWeight: "700",
                                    fontSize: "0.72rem",
                                    flexShrink: 0
                                  }}
                                >
                                  {stu.name ? stu.name.split(" ").slice(0, 2).map((n) => n[0]).join("") : "ST"}
                                </div>
                              )}
                              <strong>{stu.name}</strong>
                            </div>
                          </td>
                          <td>
                            <strong style={{ color: dbmsAtt < threshold ? "var(--danger-solid)" : "var(--success-solid)" }}>
                              {dbmsAtt}%
                            </strong>
                          </td>
                          <td>
                            <strong style={{ color: osAtt < threshold ? "var(--danger-solid)" : "var(--success-solid)" }}>
                              {osAtt}%
                            </strong>
                          </td>
                          <td>{stuMark ? `${stuMark.marksObtained}/25` : "18/25"}</td>
                          <td>
                            <button
                              onClick={() => handleSelectStudent(stu.id)}
                              className="btn btn-primary btn-sm"
                            >
                              Inspect Dossier
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW: INDIVIDUAL STUDENT DOSSIER */}
      {viewLevel === "student" && activeStudent && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <button
            onClick={() => setViewLevel("department")}
            className="btn btn-secondary btn-sm"
            style={{ width: "fit-content" }}
          >
            <ArrowLeft size={14} /> Back to Department Roster
          </button>

          <div className="card">
            <div style={{ display: "flex", gap: "20px", alignItems: "center", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "20px" }}>
              {activeStudent.avatar ? (
                <img
                  src={activeStudent.avatar}
                  alt={activeStudent.name}
                  style={{ width: "80px", height: "80px", borderRadius: "16px", objectFit: "cover" }}
                />
              ) : (
                <div
                  style={{
                    width: "80px",
                    height: "80px",
                    borderRadius: "16px",
                    background: "linear-gradient(135deg, #1e3a8a, #3b82f6)",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "800",
                    fontSize: "1.6rem",
                    flexShrink: 0
                  }}
                >
                  {activeStudent.name ? activeStudent.name.split(" ").slice(0, 2).map((n) => n[0]).join("") : "ST"}
                </div>
              )}
              <div>
                <h3 style={{ fontSize: "1.4rem", fontWeight: "800" }}>{activeStudent.name}</h3>
                <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                  Roll: <strong>{activeStudent.rollNo}</strong> {activeStudent.prn ? <>• PRN: <strong>{activeStudent.prn}</strong></> : null} • {activeStudent.className || `${activeStudent.departmentName} (3rd Year - Sem ${activeStudent.semester})`}
                </div>
                <div style={{ fontSize: "0.82rem", color: "#047857", marginTop: "4px" }}>
                  Guardian: <strong>{activeStudent.parentName}</strong> ({activeStudent.parentPhone})
                </div>
              </div>
            </div>

            {/* Subject Attendance Breakdown for this student */}
            <div style={{ marginTop: "20px" }}>
              <h4 style={{ fontSize: "1rem", fontWeight: "700", marginBottom: "12px" }}>
                Subject-wise Verified Attendance
              </h4>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
                {subjects.map((sub) => {
                  const sData = attendance[activeStudent.id]?.[sub.id] || { total: 20, attended: 16, percentage: 80 };
                  const isLow = sData.percentage < threshold;

                  return (
                    <div key={sub.id} style={{ background: isLow ? "#fff1f2" : "var(--bg-surface-secondary)", padding: "12px", borderRadius: "8px", border: isLow ? "1px solid #fecaca" : "1px solid var(--border-subtle)" }}>
                      <div style={{ fontSize: "0.85rem", fontWeight: "700" }}>{sub.name}</div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "8px" }}>
                        <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{sData.attended}/{sData.total} Lecs</span>
                        <Badge variant={isLow ? "danger" : "success"}>{sData.percentage}%</Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

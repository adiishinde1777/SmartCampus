import React, { useState, useEffect } from "react";
import { useSmartCampus } from "../../context/SmartCampusContext";
import {
  CalendarCheck,
  CheckCircle2,
  XCircle,
  Users,
  Send,
  Sparkles,
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  Smartphone,
  CheckCheck
} from "lucide-react";
import { Badge, Modal } from "../common/UIPrimitives";

export default function TeacherAttendance({ onNavigate }) {
  const {
    departments,
    subjects,
    users,
    attendance,
    markAttendance,
    switchUser,
    systemSettings
  } = useSmartCampus();

  const [selectedDept, setSelectedDept] = useState("dept-vlsi");
  const [selectedYear, setSelectedYear] = useState("3rd Year");
  const [selectedDivision, setSelectedDivision] = useState("all");
  const [selectedSubject, setSelectedSubject] = useState("sub-vlsi501");
  const [sessionType, setSessionType] = useState("Theory"); // 'Theory' | 'Practical'
  const [lectureNum, setLectureNum] = useState(14);
  const [lectureDate, setLectureDate] = useState("2026-09-08");
  const [lectureTime, setLectureTime] = useState("10:00 AM");
  const [isSheetLoaded, setIsSheetLoaded] = useState(false);

  const currentDeptObj = (departments || []).find((d) => d.id === selectedDept);
  const availableDivisions = currentDeptObj?.divisions || ["A"];

  // Filter students dynamically based on Department, Academic Year, and Division
  const enrolledStudents = users
    .filter((u) => {
      if (u.role !== "student") return false;
      if (u.departmentId && selectedDept && u.departmentId !== selectedDept) return false;
      
      // Match Academic Year
      if (selectedYear === "1st Year") {
        if (!(u.year === "1st Year" || u.semester === 1 || u.semester === 2 || u.className?.includes("FE"))) return false;
      } else if (selectedYear === "2nd Year") {
        if (!(u.year === "2nd Year" || u.semester === 3 || u.semester === 4 || u.year?.includes("Second") || u.className?.includes("SE") || u.batch?.includes("SE"))) return false;
      } else if (selectedYear === "4th Year") {
        if (!(u.year === "4th Year" || u.semester === 7 || u.semester === 8 || u.year?.includes("Final") || u.className?.includes("BE") || u.batch?.includes("BE"))) return false;
      } else if (selectedYear === "3rd Year") {
        if (!(u.year === "3rd Year" || u.semester === 5 || u.semester === 6 || u.year?.includes("Third") || u.className?.includes("TE") || u.batch?.includes("TE"))) return false;
      }

      // Match Division
      if (selectedDivision !== "all") {
        if (u.division && u.division !== selectedDivision) return false;
      }
      return true;
    })
    .sort((a, b) => (a.rollNo || "").localeCompare(b.rollNo || ""));

  // Status map: { [studentId]: "Present" | "Absent" }
  const [statusMap, setStatusMap] = useState(() => {
    const map = {};
    enrolledStudents.forEach((stu) => {
      map[stu.id] = stu.id === "stu-1" ? "Absent" : "Present";
    });
    return map;
  });

  // Re-sync statusMap when department/year/division filter changes
  useEffect(() => {
    const map = {};
    enrolledStudents.forEach((stu) => {
      map[stu.id] = stu.id === "stu-1" ? "Absent" : "Present";
    });
    setStatusMap(map);
  }, [selectedDept, selectedYear, selectedDivision]);

  const [submissionResult, setSubmissionResult] = useState(null);

  const handleToggle = (stuId) => {
    setStatusMap((prev) => ({
      ...prev,
      [stuId]: prev[stuId] === "Present" ? "Absent" : "Present"
    }));
  };

  const handleMarkAll = (status) => {
    const updated = {};
    enrolledStudents.forEach((stu) => {
      updated[stu.id] = status;
    });
    setStatusMap(updated);
  };

  const currentSubjectObj = subjects.find((s) => s.id === selectedSubject) || subjects[0];

  const handleSubmit = (e) => {
    e.preventDefault();
    const effectiveSemester = selectedClass.includes("2nd Year") || selectedClass.includes("SE")
      ? 3
      : selectedClass.includes("Final Year") || selectedClass.includes("BE")
      ? 7
      : (currentSubjectObj?.semester || 5);

    const res = markAttendance({
      departmentId: selectedDept,
      semester: effectiveSemester,
      division: null,
      subjectId: selectedSubject,
      sessionType,
      lectureNum: Number(lectureNum),
      statusMap,
      date: lectureDate,
      time: lectureTime
    });

    setSubmissionResult(res);
  };

  const presentCount = Object.values(statusMap).filter((s) => s === "Present").length;
  const absentCount = Object.values(statusMap).filter((s) => s === "Absent").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: "800", color: "var(--text-main)" }}>
            Lecture Attendance Marker & Automation Engine
          </h2>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "4px" }}>
            Mark lecture attendance to trigger instant real-time student notifications, parent SMS/WhatsApp alerts, and HOD analytics
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <Badge variant="success" icon={CheckCircle2}>{presentCount} Present</Badge>
          <Badge variant="danger" icon={XCircle}>{absentCount} Absent</Badge>
        </div>
      </div>

      {/* Step 1-4 Selection Controls Card */}
      <div className="card" style={{ background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)", border: "1px solid #cbd5e1" }}>
        <div style={{ fontSize: "0.8rem", fontWeight: "700", color: "var(--primary-700)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "12px" }}>
          Lecture Parameters Setup
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px" }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">1. Department</label>
            <select
              className="form-control"
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
            >
              {(departments || []).map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">2. Academic Year</label>
            <select
              className="form-control"
              value={selectedYear}
              onChange={(e) => {
                setSelectedYear(e.target.value);
                setIsSheetLoaded(false);
              }}
            >
              <option value="1st Year">1st Year (FE – Sem 1 & 2)</option>
              <option value="2nd Year">2nd Year (SE – Sem 3 & 4)</option>
              <option value="3rd Year">3rd Year (TE – Sem 5 & 6)</option>
              <option value="4th Year">4th Year (BE – Sem 7 & 8)</option>
            </select>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Division Filter</label>
            <select
              className="form-control"
              value={selectedDivision}
              onChange={(e) => setSelectedDivision(e.target.value)}
            >
              <option value="all">All Divisions</option>
              {availableDivisions.map((div) => (
                <option key={div} value={div}>Division {div}</option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">3. Subject</label>
            <select
              className="form-control"
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
            >
              {(subjects || []).map((s) => (
                <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">4. Session Type</label>
            <select
              className="form-control"
              value={sessionType}
              onChange={(e) => setSessionType(e.target.value)}
              style={{ fontWeight: "700", color: sessionType === "Practical" ? "#047857" : "#1d4ed8" }}
            >
              <option value="Theory">📘 Theory Lecture</option>
              <option value="Practical">🔬 Practical Lab Session</option>
            </select>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">5. {sessionType} Session #</label>
            <input
              type="number"
              className="form-control"
              value={lectureNum}
              onChange={(e) => setLectureNum(e.target.value)}
              min="1"
            />
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Date & Time</label>
            <input
              type="text"
              className="form-control"
              value={`${lectureDate} • ${lectureTime}`}
              readOnly
            />
          </div>
        </div>

        {/* Load / Gate Control Bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: "16px",
            paddingTop: "14px",
            borderTop: "1px solid #e2e8f0",
            flexWrap: "wrap",
            gap: "10px"
          }}
        >
          <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
            {isSheetLoaded ? (
              <span>Active Attendance Sheet: <strong>{currentSubjectObj?.name}</strong> ({sessionType} #{lectureNum}) • <strong>{enrolledStudents.length} Students</strong></span>
            ) : (
              <span>Configure Department & Subject above, then click <strong>"Load Attendance Sheet"</strong> to reveal the roll call.</span>
            )}
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            {isSheetLoaded ? (
              <button
                type="button"
                onClick={() => setIsSheetLoaded(false)}
                className="btn btn-secondary btn-sm"
              >
                Hide Attendance Sheet
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsSheetLoaded(true)}
                className="btn btn-primary"
                style={{ fontWeight: "700" }}
              >
                <Users size={16} /> Load Attendance Sheet
              </button>
            )}
          </div>
        </div>
      </div>

      {!isSheetLoaded ? (
        <div
          className="card"
          style={{
            padding: "54px 24px",
            textAlign: "center",
            background: "var(--bg-surface-secondary)",
            border: "2px dashed var(--border-strong)",
            borderRadius: "14px"
          }}
        >
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "14px",
              background: "#eff6ff",
              color: "#2563eb",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px auto"
            }}
          >
            <CalendarCheck size={28} />
          </div>
          <h3 style={{ fontSize: "1.25rem", fontWeight: "800", color: "var(--text-main)" }}>
            Attendance Roster Protected
          </h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", maxWidth: "520px", margin: "8px auto 22px auto", lineHeight: "1.5" }}>
            Student attendance records are not displayed openly. Please confirm your Department (<strong>Electronic Engineering VLSI</strong>), Class, Batch, and Subject above, then click below to display the live attendance sheet.
          </p>
          <button
            type="button"
            onClick={() => setIsSheetLoaded(true)}
            className="btn btn-primary btn-lg"
            style={{ display: "inline-flex", alignItems: "center", gap: "8px", margin: "0 auto", fontWeight: "700" }}
          >
            <Users size={18} /> Load Attendance Sheet ({currentSubjectObj?.name || "VLSI Subject"})
          </button>
        </div>
      ) : (
        /* Student List and Marking Table */
        <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">
              <Users size={18} color="var(--primary-600)" />
              Roll Call: {selectedClass} ({enrolledStudents.length} Students)
            </div>
            <div className="card-subtitle">
              Subject: <strong>{currentSubjectObj.name}</strong> • Mandatory Threshold: <strong>{systemSettings.attendanceThreshold}%</strong>
            </div>
          </div>

          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={() => handleMarkAll("Present")}
              className="btn btn-sm btn-secondary"
            >
              Mark All Present
            </button>
            <button
              onClick={() => handleMarkAll("Absent")}
              className="btn btn-sm btn-secondary"
            >
              Mark All Absent
            </button>
          </div>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Roll No</th>
                <th>Student Information</th>
                <th>Current Attendance</th>
                <th>Linked Parent Contact</th>
                <th>Attendance Action</th>
                <th>Live Status</th>
              </tr>
            </thead>
            <tbody>
              {enrolledStudents.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center", padding: "48px 20px", color: "var(--text-muted)" }}>
                    <Users size={40} style={{ opacity: 0.3, margin: "0 auto 12px", display: "block" }} />
                    <div style={{ fontWeight: "700", fontSize: "1.05rem", color: "var(--text-main)" }}>No Students Enrolled in this Department</div>
                    <p style={{ fontSize: "0.85rem", marginTop: "6px", maxWidth: "480px", margin: "6px auto 0" }}>
                      Student database is currently populated exclusively for <strong>Electronics Engineering (VLSI Design & Technology) – 3rd Year (TE VLSI)</strong>.
                    </p>
                  </td>
                </tr>
              ) : (
                (enrolledStudents || []).map((stu) => {
                const stuData = attendance[stu.id]?.[selectedSubject] || { total: 20, attended: 16, percentage: 80 };
                const isMarkedPresent = statusMap[stu.id] === "Present";
                const isBelowThreshold = stuData.percentage < systemSettings.attendanceThreshold;

                return (
                  <tr key={stu.id} style={{ background: !isMarkedPresent ? "#fff1f2" : undefined }}>
                    <td>
                      <Badge variant="primary">{stu.rollNo}</Badge>
                      {stu.batch && (
                        <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "3px", fontWeight: "600" }}>
                          {stu.batch}
                        </div>
                      )}
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        {stu.avatar ? (
                          <img
                            src={stu.avatar}
                            alt={stu.name}
                            style={{ width: "36px", height: "36px", borderRadius: "50%", objectFit: "cover" }}
                          />
                        ) : (
                          <div
                            style={{
                              width: "36px",
                              height: "36px",
                              borderRadius: "50%",
                              background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                              color: "white",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontWeight: "700",
                              fontSize: "0.78rem",
                              flexShrink: 0
                            }}
                          >
                            {stu.name ? stu.name.split(" ").slice(0, 2).map((n) => n[0]).join("") : "ST"}
                          </div>
                        )}
                        <div>
                          <div style={{ fontWeight: "700", color: !isMarkedPresent ? "#991b1b" : "var(--text-main)" }}>
                            {stu.name}
                          </div>
                          <div style={{ fontSize: "0.72rem", color: "var(--color-primary)", fontFamily: "monospace" }}>
                            PRN: {stu.prn || stu.prnNo}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      {(() => {
                        const thTotal = stuData.theoryTotal ?? Math.round(stuData.total * 0.7);
                        const thAtt = stuData.theoryAttended ?? Math.min(thTotal, Math.round(stuData.attended * 0.7));
                        const thPct = thTotal > 0 ? Math.round((thAtt / thTotal) * 100) : stuData.percentage;
                        const prTotal = stuData.practicalTotal ?? Math.max(0, stuData.total - thTotal);
                        const prAtt = stuData.practicalAttended ?? Math.max(0, stuData.attended - thAtt);
                        const prPct = prTotal > 0 ? Math.round((prAtt / prTotal) * 100) : stuData.percentage;

                        return (
                          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              <strong style={{ color: isBelowThreshold ? "var(--danger-solid)" : "var(--text-main)", fontSize: "0.9rem" }}>
                                {stuData.percentage}% Overall
                              </strong>
                              <span style={{ fontSize: "0.74rem", color: "var(--text-muted)" }}>
                                ({stuData.attended}/{stuData.total})
                              </span>
                              {isBelowThreshold && (
                                <span title={`Below ${systemSettings.attendanceThreshold}%`} style={{ color: "var(--danger-solid)", fontSize: "0.75rem" }}>⚠️</span>
                              )}
                            </div>
                            <div style={{ display: "flex", gap: "6px", fontSize: "0.72rem" }}>
                              <span style={{ background: "rgba(37, 99, 235, 0.1)", color: "#1d4ed8", padding: "1px 6px", borderRadius: "4px", fontWeight: "600" }}>
                                Theory: {thPct}% ({thAtt}/{thTotal})
                              </span>
                              <span style={{ background: "rgba(16, 185, 129, 0.1)", color: "#047857", padding: "1px 6px", borderRadius: "4px", fontWeight: "600" }}>
                                Practical: {prPct}% ({prAtt}/{prTotal})
                              </span>
                            </div>
                          </div>
                        );
                      })()}
                    </td>
                    <td>
                      <div style={{ fontSize: "0.82rem" }}>
                        <span style={{ fontWeight: "600" }}>{stu.parentName}</span>
                        <div style={{ fontSize: "0.75rem", color: "#047857" }}>{stu.parentPhone}</div>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button
                          type="button"
                          onClick={() => setStatusMap((prev) => ({ ...prev, [stu.id]: "Present" }))}
                          style={{
                            padding: "6px 12px",
                            borderRadius: "6px",
                            border: "none",
                            background: isMarkedPresent ? "#10b981" : "#e2e8f0",
                            color: isMarkedPresent ? "white" : "var(--text-muted)",
                            fontWeight: "700",
                            fontSize: "0.8rem",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px"
                          }}
                        >
                          <CheckCircle2 size={14} /> Present
                        </button>

                        <button
                          type="button"
                          onClick={() => setStatusMap((prev) => ({ ...prev, [stu.id]: "Absent" }))}
                          style={{
                            padding: "6px 12px",
                            borderRadius: "6px",
                            border: "none",
                            background: !isMarkedPresent ? "#ef4444" : "#e2e8f0",
                            color: !isMarkedPresent ? "white" : "var(--text-muted)",
                            fontWeight: "700",
                            fontSize: "0.8rem",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px"
                          }}
                        >
                          <XCircle size={14} /> Absent
                        </button>
                      </div>
                    </td>
                    <td>
                      {isMarkedPresent ? (
                        <Badge variant="success" icon={CheckCircle2}>Present</Badge>
                      ) : (
                        <Badge variant="danger" icon={XCircle}>Marked Absent</Badge>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
          </table>
        </div>

        {/* Submit Attendance Bar */}
        <div
          style={{
            padding: "20px",
            borderTop: "1px solid var(--border-subtle)",
            background: "var(--bg-surface-secondary)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "16px"
          }}
        >
          <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
            ⚡ Submitting will automatically recalculate percentages, generate student in-app alerts, send simulated parent SMS/WhatsApp notices, and refresh HOD analytics.
          </div>

          <button
            onClick={handleSubmit}
            className="btn btn-primary btn-lg"
            style={{
              padding: "12px 28px",
              boxShadow: "0 4px 15px rgba(37, 99, 235, 0.4)"
            }}
          >
            <Send size={18} />
            <span>Submit Attendance & Dispatch Alerts</span>
          </button>
        </div>
      </div>
      )}

      {/* Confirmation & Automation Pipeline Modal */}
      <Modal
        isOpen={Boolean(submissionResult)}
        onClose={() => setSubmissionResult(null)}
        title="✓ Attendance Submitted & Automated Alerts Triggered!"
        maxWidth="680px"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <div style={{ background: "#ecfdf5", border: "1px solid #a7f3d0", padding: "16px", borderRadius: "12px", display: "flex", alignItems: "center", gap: "12px" }}>
            <CheckCheck size={28} color="#059669" />
            <div>
              <h4 style={{ fontSize: "1.05rem", fontWeight: "800", color: "#065f46" }}>
                Attendance Recorded Successfully
              </h4>
              <p style={{ fontSize: "0.82rem", color: "#047857" }}>
                Lecture #{lectureNum} for {currentSubjectObj.name} has been synchronized across all institution databases.
              </p>
            </div>
          </div>

          {/* Automated Actions Summary */}
          <div>
            <div style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--text-main)", marginBottom: "10px" }}>
              ⚡ Real-Time Automated Actions Executed:
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "0.82rem" }}>
              <div style={{ padding: "10px 14px", background: "var(--bg-surface-secondary)", borderRadius: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
                <CheckCircle2 size={16} color="#10b981" />
                <span>Saved <strong>{submissionResult?.totalMarked}</strong> student attendance records to central database.</span>
              </div>

              <div style={{ padding: "10px 14px", background: "#fef2f2", borderRadius: "8px", border: "1px solid #fecaca", display: "flex", alignItems: "center", gap: "8px" }}>
                <Smartphone size={16} color="#dc2626" />
                <span>
                  Identified <strong>{submissionResult?.absentCount} Absent Student(s)</strong>:{" "}
                  {(submissionResult?.absentStudents || []).map((s) => s.name).join(", ") || "None"}.
                </span>
              </div>

              <div style={{ padding: "10px 14px", background: "#f0fdf4", borderRadius: "8px", border: "1px solid #bbf7d0", display: "flex", alignItems: "center", gap: "8px" }}>
                <CheckCircle2 size={16} color="#15803d" />
                <span>Dispatched Parent SMS & WhatsApp Absence Notices to registered guardian phone numbers.</span>
              </div>

              <div style={{ padding: "10px 14px", background: "var(--bg-surface-secondary)", borderRadius: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
                <CheckCircle2 size={16} color="#2563eb" />
                <span>Updated live HOD & Principal department attendance radar and defaulter counts.</span>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              className="btn btn-primary"
              onClick={() => setSubmissionResult(null)}
            >
              Done & Close
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

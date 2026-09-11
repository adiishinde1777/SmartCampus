import React, { useState } from "react";
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

export default function TeacherAttendance() {
  const {
    departments,
    subjects,
    users,
    attendance,
    markAttendance,
    switchUser,
    systemSettings
  } = useSmartCampus();

  const [selectedDept, setSelectedDept] = useState("dept-ce");
  const [selectedSemDiv, setSelectedSemDiv] = useState("Sem 5 - Div A");
  const [selectedSubject, setSelectedSubject] = useState("sub-dbms");
  const [lectureNum, setLectureNum] = useState(14);
  const [lectureDate, setLectureDate] = useState("2026-09-08");
  const [lectureTime, setLectureTime] = useState("10:00 AM");

  // Get enrolled students
  const enrolledStudents = users.filter((u) => u.role === "student" && u.departmentId === selectedDept);

  // Status map: { [studentId]: "Present" | "Absent" }
  // By default in demo flow, let's have Rahul Patil set as "Absent" or "Present" ready to toggle!
  const [statusMap, setStatusMap] = useState(() => {
    const map = {};
    enrolledStudents.forEach((stu) => {
      // Default Rahul Patil (stu-1) to Absent to make demo immediately ready!
      map[stu.id] = stu.id === "stu-1" ? "Absent" : "Present";
    });
    return map;
  });

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

  const handleSubmit = (e) => {
    e.preventDefault();
    const res = markAttendance({
      departmentId: selectedDept,
      semester: 5,
      division: "A",
      subjectId: selectedSubject,
      lectureNum: Number(lectureNum),
      statusMap,
      date: lectureDate,
      time: lectureTime
    });

    setSubmissionResult(res);
  };

  const currentSubjectObj = subjects.find((s) => s.id === selectedSubject) || subjects[0];
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
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">2. Semester & Division</label>
            <select
              className="form-control"
              value={selectedSemDiv}
              onChange={(e) => setSelectedSemDiv(e.target.value)}
            >
              <option value="Sem 5 - Div A">Sem 5 - Division A</option>
              <option value="Sem 5 - Div B">Sem 5 - Division B</option>
              <option value="Sem 3 - Div A">Sem 3 - Division A</option>
            </select>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">3. Subject</label>
            <select
              className="form-control"
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
            >
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">4. Lecture #</label>
            <input
              type="number"
              className="form-control"
              value={lectureNum}
              onChange={(e) => setLectureNum(e.target.value)}
              min="1"
            />
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Lecture Date & Time</label>
            <input
              type="text"
              className="form-control"
              value={`${lectureDate} • ${lectureTime}`}
              readOnly
            />
          </div>
        </div>
      </div>

      {/* Student List and Marking Table */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">
              <Users size={18} color="var(--primary-600)" />
              Roll Call: {selectedSemDiv} ({enrolledStudents.length} Students)
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
              {enrolledStudents.map((stu) => {
                const stuData = attendance[stu.id]?.[selectedSubject] || { total: 20, attended: 16, percentage: 80 };
                const isMarkedPresent = statusMap[stu.id] === "Present";
                const isBelowThreshold = stuData.percentage < systemSettings.attendanceThreshold;

                return (
                  <tr key={stu.id} style={{ background: !isMarkedPresent ? "#fff1f2" : undefined }}>
                    <td>
                      <Badge variant="gray">{stu.rollNo}</Badge>
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <img
                          src={stu.avatar}
                          alt={stu.name}
                          style={{ width: "36px", height: "36px", borderRadius: "50%", objectFit: "cover" }}
                        />
                        <div>
                          <div style={{ fontWeight: "700", color: !isMarkedPresent ? "#991b1b" : "var(--text-main)" }}>
                            {stu.name}
                          </div>
                          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{stu.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <strong style={{ color: isBelowThreshold ? "var(--danger-solid)" : "var(--text-main)" }}>
                          {stuData.percentage}%
                        </strong>
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                          ({stuData.attended}/{stuData.total})
                        </span>
                        {isBelowThreshold && (
                          <span title={`Below ${systemSettings.attendanceThreshold}%`} style={{ color: "var(--danger-solid)", fontSize: "0.75rem" }}>⚠️</span>
                        )}
                      </div>
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
              })}
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
                  {submissionResult?.absentStudents?.map((s) => s.name).join(", ") || "None"}.
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

          {/* Quick Demo Switcher Buttons */}
          <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", padding: "16px", borderRadius: "12px" }}>
            <div style={{ fontSize: "0.82rem", fontWeight: "700", color: "#1e40af", marginBottom: "8px" }}>
              🚀 Next Steps in Demo Scenario:
            </div>
            <p style={{ fontSize: "0.8rem", color: "#1e3a8a", marginBottom: "12px" }}>
              Switch personas to see the immediate effect of this attendance submission:
            </p>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => {
                  setSubmissionResult(null);
                  switchUser("stu-1"); // Switch to Rahul Patil
                }}
              >
                <span>View Rahul Patil (Student Alert)</span>
                <ArrowRight size={14} />
              </button>

              <button
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  setSubmissionResult(null);
                  switchUser("par-1"); // Switch to Suresh Patil (Parent)
                }}
              >
                <span>View Suresh Patil (Parent Alert)</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              className="btn btn-secondary"
              onClick={() => setSubmissionResult(null)}
            >
              Close Confirmation
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

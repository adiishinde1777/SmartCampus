import React, { useState } from "react";
import { useSmartCampus } from "../../context/SmartCampusContext";
import {
  CalendarCheck,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Calculator,
  Filter,
  Clock,
  ShieldAlert,
  Layers,
  Printer,
  BookOpen,
  Award
} from "lucide-react";
import { Badge } from "../common/UIPrimitives";
import PrintHeader, { PrintSignatures } from "../common/PrintHeader";

export default function StudentAttendance() {
  const {
    currentUser,
    attendance,
    subjects,
    attendanceLogs,
    systemSettings,
    getSubjectsForDepartmentAndSemester,
    switchStudentSemester
  } = useSmartCampus();
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [attendanceViewTab, setAttendanceViewTab] = useState("all"); // 'all' | 'theory' | 'practical'
  const [extraLecturesSim, setExtraLecturesSim] = useState(5);

  const student = currentUser;
  const studentSem = Number(student?.semester) || 1;
  const isFirstYear = student?.year === "First Year" || studentSem <= 2;
  const threshold = systemSettings.attendanceThreshold;
  const studentAtt = attendance[student?.id] || {};

  const rawEnrolledSubjects = getSubjectsForDepartmentAndSemester
    ? getSubjectsForDepartmentAndSemester(student?.departmentId, studentSem)
    : (subjects || []).filter((s) => s.semester === studentSem);
  const enrolledSubjects = Array.isArray(rawEnrolledSubjects) ? rawEnrolledSubjects : [];

  let totalClasses = 0;
  let totalAttended = 0;
  let totalTheoryClasses = 0;
  let totalTheoryAttended = 0;
  let totalPracticalClasses = 0;
  let totalPracticalAttended = 0;

  const subjectRows = (enrolledSubjects || []).map((sub) => {
    const sData = studentAtt[sub.id] || { total: 20, attended: 16, percentage: 80 };
    totalClasses += sData.total;
    totalAttended += sData.attended;

    const thTotal = sData.theoryTotal ?? Math.round(sData.total * 0.7);
    const thAtt = sData.theoryAttended ?? Math.min(thTotal, Math.round(sData.attended * 0.7));
    const thPct = thTotal > 0 ? Math.round((thAtt / thTotal) * 1000) / 10 : sData.percentage;

    const prTotal = sData.practicalTotal ?? Math.max(0, sData.total - thTotal);
    const prAtt = sData.practicalAttended ?? Math.max(0, sData.attended - thAtt);
    const prPct = prTotal > 0 ? Math.round((prAtt / prTotal) * 1000) / 10 : sData.percentage;

    totalTheoryClasses += thTotal;
    totalTheoryAttended += thAtt;
    totalPracticalClasses += prTotal;
    totalPracticalAttended += prAtt;

    const missed = sData.total - sData.attended;
    const isBelow = sData.percentage < threshold;

    let requiredLectures = 0;
    if (isBelow && threshold < 100) {
      const needed = (threshold * sData.total - 100 * sData.attended) / (100 - threshold);
      requiredLectures = Math.max(1, Math.ceil(needed));
    }

    return {
      ...sub,
      total: sData.total,
      attended: sData.attended,
      theoryTotal: thTotal,
      theoryAttended: thAtt,
      theoryPercentage: thPct,
      practicalTotal: prTotal,
      practicalAttended: prAtt,
      practicalPercentage: prPct,
      missed,
      percentage: sData.percentage,
      isBelow,
      requiredLectures
    };
  });

  const overallPct = totalClasses > 0 ? Math.round((totalAttended / totalClasses) * 1000) / 10 : 0;
  const overallTheoryPct = totalTheoryClasses > 0 ? Math.round((totalTheoryAttended / totalTheoryClasses) * 1000) / 10 : overallPct;
  const overallPracticalPct = totalPracticalClasses > 0 ? Math.round((totalPracticalAttended / totalPracticalClasses) * 1000) / 10 : overallPct;
  const defaulterCount = subjectRows.filter((s) => s.isBelow).length;

  // Filter logs for this student safely
  const myLogs = (attendanceLogs || []).filter((log) => {
    if (!log) return false;
    const isMine = log.studentId === student?.id;
    if (!isMine) return false;
    if (selectedSubject !== "all" && log.subjectId !== selectedSubject) return false;
    if (attendanceViewTab === "theory" && log.sessionType === "Practical") return false;
    if (attendanceViewTab === "practical" && log.sessionType === "Theory") return false;
    return true;
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Official College Print Header (Appears only on print) */}
      <PrintHeader
        title="STUDENT OFFICIAL ATTENDANCE & COMPLIANCE TRANSCRIPT"
        subtitle={`Student: ${student?.name} (Roll: ${student?.rollNo || "VL3152"} • PRN: ${student?.prn || "24025331378056"}) • Class: TE VLSI Sem 5`}
        documentType="ATTENDANCE REGISTER RECORD"
      />

      {/* Page Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: "800", color: "var(--text-main)" }}>
            Attendance Management & Defaulter Radar
          </h2>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "4px" }}>
            Real-time tracking of Theory Lectures & Practical Labs with automatic threshold evaluation ({threshold}%)
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
          <Badge variant={overallPct >= threshold ? "success" : "danger"}>
            Overall: {overallPct}%
          </Badge>
          <Badge variant="primary">
            Theory: {overallTheoryPct}%
          </Badge>
          <Badge variant="purple">
            Practical: {overallPracticalPct}%
          </Badge>
          <button
            onClick={handlePrint}
            className="btn btn-secondary btn-sm"
            style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
          >
            <Printer size={15} /> Print Report
          </button>
        </div>
      </div>

      {/* First Year Common Curriculum Banner */}
      {isFirstYear && (
        <div
          style={{
            background: "linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(139, 92, 246, 0.12) 100%)",
            border: "1px solid rgba(99, 102, 241, 0.3)",
            borderRadius: "14px",
            padding: "14px 20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Layers size={22} color="#6366f1" />
            <div>
              <span style={{ fontWeight: "700", color: "var(--color-text-primary)", fontSize: "0.95rem" }}>
                First Year Common Curriculum Attendance ({enrolledSubjects.length} Courses)
              </span>
              <p style={{ margin: "2px 0 0 0", fontSize: "0.82rem", color: "var(--color-text-secondary)" }}>
                Displaying Semester {studentSem} subjects common across all engineering branches.
              </p>
            </div>
          </div>

          <div style={{ display: "flex", gap: "6px" }}>
            <button
              className={`btn btn-sm ${studentSem === 1 ? "btn-primary" : "btn-secondary"}`}
              onClick={() => { switchStudentSemester(1); setSelectedSubject("all"); }}
            >
              Semester I
            </button>
            <button
              className={`btn btn-sm ${studentSem === 2 ? "btn-primary" : "btn-secondary"}`}
              onClick={() => { switchStudentSemester(2); setSelectedSubject("all"); }}
            >
              Semester II
            </button>
          </div>
        </div>
      )}

      {/* Top Banner: Defaulter Risk Overview & Recovery Calculator */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
        
        {/* Attendance Summary Card */}
        <div className="card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <div className="card-header">
              <div className="card-title">
                <CalendarCheck size={18} color="var(--primary-600)" />
                Overall Attendance Progress
              </div>
              <span style={{ fontSize: "0.82rem", fontWeight: "700", color: overallPct >= threshold ? "var(--success-solid)" : "var(--danger-solid)" }}>
                {overallPct >= threshold ? "Compliant" : "Defaulter Risk"}
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "16px" }}>
              <div
                style={{
                  width: "90px",
                  height: "90px",
                  borderRadius: "50%",
                  background: overallPct >= threshold ? "var(--success-bg)" : "var(--danger-bg)",
                  border: `4px solid ${overallPct >= threshold ? "var(--success-solid)" : "var(--danger-solid)"}`,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0
                }}
              >
                <span style={{ fontSize: "1.4rem", fontWeight: "800", color: overallPct >= threshold ? "var(--success-text)" : "var(--danger-text)" }}>
                  {overallPct}%
                </span>
                <span style={{ fontSize: "0.65rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Avg</span>
              </div>

              <div>
                <div style={{ fontSize: "0.95rem", fontWeight: "700", color: "var(--text-main)" }}>
                  {totalAttended} of {totalClasses} Lectures Attended
                </div>
                <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "4px" }}>
                  Total Missed Lectures: <strong>{totalClasses - totalAttended}</strong>
                </div>
                <div style={{ fontSize: "0.8rem", color: overallPct >= threshold ? "var(--success-text)" : "var(--danger-text)", fontWeight: "600", marginTop: "4px" }}>
                  {overallPct >= threshold
                    ? `Safe zone (${(overallPct - threshold).toFixed(1)}% above cutoff)`
                    : `Requires attention (${(threshold - overallPct).toFixed(1)}% below mandatory cutoff)`}
                </div>
              </div>
            </div>
          </div>

          <div style={{ background: "var(--bg-surface-secondary)", padding: "12px 16px", borderRadius: "8px", fontSize: "0.78rem", color: "var(--text-muted)" }}>
            💡 Institutional rule: Hall tickets for Mid-Term and Final Semester exams require at least <strong>{threshold}% attendance</strong>.
          </div>
        </div>

        {/* Real-time Interactive Recovery Calculator */}
        <div className="card" style={{ background: "linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%)", border: "1px solid #bfdbfe" }}>
          <div className="card-header">
            <div className="card-title">
              <Calculator size={18} color="var(--primary-600)" />
              Smart Attendance Recovery Simulator
            </div>
            <Badge variant="info">Interactive</Badge>
          </div>

          <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: "16px" }}>
            Simulate attending consecutive upcoming lectures to forecast your new percentage:
          </p>

          <div style={{ marginBottom: "14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", fontWeight: "600", marginBottom: "6px" }}>
              <span>Simulate Next Lectures Attended:</span>
              <span style={{ color: "var(--primary-700)", fontWeight: "800" }}>+{extraLecturesSim} lectures</span>
            </div>
            <input
              type="range"
              min="1"
              max="20"
              value={extraLecturesSim}
              onChange={(e) => setExtraLecturesSim(Number(e.target.value))}
              style={{ width: "100%", accentColor: "var(--primary-600)", cursor: "pointer" }}
            />
          </div>

          {/* Forecast Box */}
          {(() => {
            const simTotal = totalClasses + extraLecturesSim;
            const simAttended = totalAttended + extraLecturesSim;
            const simPct = Math.round((simAttended / simTotal) * 1000) / 10;
            return (
              <div style={{ background: "white", padding: "12px 16px", borderRadius: "10px", border: "1px solid #cbd5e1", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Projected Overall Attendance</div>
                  <div style={{ fontSize: "1.3rem", fontWeight: "800", color: simPct >= threshold ? "var(--success-solid)" : "var(--danger-solid)" }}>
                    {simPct}%
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Status Impact</div>
                  <span style={{ fontSize: "0.82rem", fontWeight: "700", color: simPct >= threshold ? "var(--success-text)" : "var(--danger-text)" }}>
                    {simPct >= threshold ? "✓ Threshold Recovered" : `Needs ${Math.ceil((threshold * simTotal - 100 * simAttended) / (100 - threshold))} more`}
                  </span>
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* Subject-wise Attendance Table */}
      <div className="card">
        <div className="card-header" style={{ flexWrap: "wrap", gap: "12px" }}>
          <div>
            <div className="card-title">
              <TrendingUp size={18} color="var(--primary-600)" />
              Subject-wise Theory & Practical Attendance Breakdown
            </div>
            <div className="card-subtitle">Real-time attendance segmented by classroom lectures and laboratory practical sessions</div>
          </div>

          <div style={{ display: "flex", background: "var(--bg-surface-secondary)", padding: "3px", borderRadius: "8px", gap: "4px" }}>
            <button
              onClick={() => setAttendanceViewTab("all")}
              className={`btn btn-sm ${attendanceViewTab === "all" ? "btn-primary" : "btn-ghost"}`}
              style={{ fontSize: "0.8rem", padding: "4px 10px", borderRadius: "6px" }}
            >
              All Components
            </button>
            <button
              onClick={() => setAttendanceViewTab("theory")}
              className={`btn btn-sm ${attendanceViewTab === "theory" ? "btn-primary" : "btn-ghost"}`}
              style={{ fontSize: "0.8rem", padding: "4px 10px", borderRadius: "6px" }}
            >
              📘 Theory Only
            </button>
            <button
              onClick={() => setAttendanceViewTab("practical")}
              className={`btn btn-sm ${attendanceViewTab === "practical" ? "btn-primary" : "btn-ghost"}`}
              style={{ fontSize: "0.8rem", padding: "4px 10px", borderRadius: "6px" }}
            >
              🔬 Practical Only
            </button>
          </div>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Subject Name</th>
                <th>Code</th>
                <th>📘 Theory Attendance</th>
                <th>🔬 Practical Attendance</th>
                <th>Overall Progress</th>
                <th>Compliance Status</th>
                <th>Advisory / Required</th>
              </tr>
            </thead>
            <tbody>
              {(subjectRows || []).map((row) => (
                <tr key={row.id} style={{ background: row.isBelow ? "#fff1f2" : undefined }}>
                  <td>
                    <div style={{ fontWeight: "700", color: row.isBelow ? "#991b1b" : "var(--text-main)" }}>
                      {row.name}
                    </div>
                  </td>
                  <td>
                    <span style={{ fontFamily: "monospace", fontSize: "0.82rem", background: "var(--bg-surface-secondary)", padding: "2px 6px", borderRadius: "4px" }}>
                      {row.code}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem" }}>
                        <span>{row.theoryAttended}/{row.theoryTotal}</span>
                        <strong style={{ color: row.theoryPercentage < threshold ? "#dc2626" : "#2563eb" }}>
                          {row.theoryPercentage}%
                        </strong>
                      </div>
                      <div style={{ height: "6px", background: "#e2e8f0", borderRadius: "3px", overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${Math.min(100, row.theoryPercentage)}%`, background: "#3b82f6", borderRadius: "3px" }} />
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem" }}>
                        <span>{row.practicalAttended}/{row.practicalTotal}</span>
                        <strong style={{ color: row.practicalPercentage < threshold ? "#dc2626" : "#059669" }}>
                          {row.practicalPercentage}%
                        </strong>
                      </div>
                      <div style={{ height: "6px", background: "#e2e8f0", borderRadius: "3px", overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${Math.min(100, row.practicalPercentage)}%`, background: "#10b981", borderRadius: "3px" }} />
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div style={{ flex: 1, height: "8px", width: "70px", background: "#e2e8f0", borderRadius: "4px", overflow: "hidden" }}>
                        <div
                          style={{
                            height: "100%",
                            width: `${Math.min(100, row.percentage)}%`,
                            background: row.isBelow ? "var(--danger-solid)" : "var(--primary-600)",
                            borderRadius: "4px"
                          }}
                        />
                      </div>
                      <strong style={{ fontSize: "0.88rem", color: row.isBelow ? "#991b1b" : "var(--text-main)" }}>
                        {row.percentage}%
                      </strong>
                    </div>
                  </td>
                  <td>
                    {row.isBelow ? (
                      <Badge variant="danger" icon={AlertTriangle}>Defaulter (&lt;{threshold}%)</Badge>
                    ) : (
                      <Badge variant="success" icon={CheckCircle2}>Compliant</Badge>
                    )}
                  </td>
                  <td>
                    {row.isBelow ? (
                      <span style={{ fontSize: "0.78rem", color: "#b91c1c", fontWeight: "700" }}>
                        ⚠️ Attend next {row.requiredLectures} sessions
                      </span>
                    ) : (
                      <span style={{ fontSize: "0.78rem", color: "var(--success-text)", fontWeight: "500" }}>
                        ✓ Meets criteria
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Lecture-wise Attendance Log */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">
              <Clock size={18} color="var(--primary-600)" />
              Lecture-wise Submission History & Audit
            </div>
            <div className="card-subtitle">Verified lecture attendance records submitted by faculty</div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Filter size={16} color="var(--text-muted)" />
            <select
              className="form-control"
              style={{ padding: "6px 12px", fontSize: "0.82rem" }}
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
            >
              <option value="all">All Subjects</option>
              {(subjects || []).map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Lecture #</th>
                <th>Subject</th>
                <th>Faculty Marked By</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {(!myLogs || myLogs.length === 0) ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center", padding: "24px", color: "var(--text-muted)" }}>
                    No lecture attendance records found matching filters.
                  </td>
                </tr>
              ) : (
                (myLogs || []).map((log) => (
                  <tr key={log.id}>
                    <td>
                      <div style={{ fontWeight: "600" }}>{log.date}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{log.time}</div>
                    </td>
                    <td>
                      <Badge variant="gray">Session #{log.lectureNum}</Badge>
                    </td>
                    <td>
                      <span style={{ fontSize: "0.75rem", fontWeight: "700", padding: "2px 6px", borderRadius: "4px", background: log.sessionType === "Practical" ? "rgba(16, 185, 129, 0.15)" : "rgba(37, 99, 235, 0.15)", color: log.sessionType === "Practical" ? "#047857" : "#1d4ed8" }}>
                        {log.sessionType === "Practical" ? "🔬 Practical" : "📘 Theory"}
                      </span>
                    </td>
                    <td>
                      <strong>{log.subjectName}</strong>
                    </td>
                    <td>{log.markedBy}</td>
                    <td>
                      {log.status === "Present" ? (
                        <Badge variant="success" icon={CheckCircle2}>Present</Badge>
                      ) : (
                        <Badge variant="danger" icon={AlertTriangle}>Absent</Badge>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Official Signatures (Appears only on print) */}
      <PrintSignatures />
    </div>
  );
}

import React from "react";
import { useSmartCampus } from "../../context/SmartCampusContext";
import {
  Users,
  GraduationCap,
  CalendarCheck,
  AlertTriangle,
  Award,
  BookOpen,
  AlertOctagon,
  TrendingUp,
  BarChart3,
  CheckCircle2,
  ArrowRight
} from "lucide-react";
import { StatCard, Badge } from "../common/UIPrimitives";

export default function HODDashboard({ onNavigate }) {
  const {
    currentUser,
    users,
    departments,
    subjects,
    attendance,
    marks,
    assignments,
    complaints,
    systemSettings
  } = useSmartCampus();

  const hod = currentUser;
  const dept = departments.find((d) => d.id === (hod?.departmentId || "dept-ce")) || departments[0];
  const deptStudents = users.filter((u) => u.role === "student" && u.departmentId === dept.id);
  const deptTeachers = users.filter((u) => u.role === "teacher" && u.departmentId === dept.id);
  const threshold = systemSettings.attendanceThreshold;

  // Calculate department-wide attendance
  let totalLecs = 0;
  let attendedLecs = 0;
  let belowThresholdStudents = 0;

  deptStudents.forEach((stu) => {
    const sAtt = attendance[stu.id] || {};
    let stuTotal = 0;
    let stuAttended = 0;

    subjects.forEach((sub) => {
      const data = sAtt[sub.id] || { total: 20, attended: 16, percentage: 80 };
      stuTotal += data.total;
      stuAttended += data.attended;
    });

    const stuPct = stuTotal > 0 ? (stuAttended / stuTotal) * 100 : 80;
    if (stuPct < threshold) belowThresholdStudents++;

    totalLecs += stuTotal;
    attendedLecs += stuAttended;
  });

  const deptAvgAttendance = totalLecs > 0 ? Math.round((attendedLecs / totalLecs) * 1000) / 10 : dept.avgAttendance;

  // Department marks average
  const deptMarks = marks.filter((m) => {
    const stu = users.find((u) => u.id === m.studentId);
    return stu && stu.departmentId === dept.id;
  });
  const avgMarks = deptMarks.length > 0
    ? Math.round(deptMarks.reduce((a, b) => a + (b.marksObtained / b.maxMarks) * 100, 0) / deptMarks.length)
    : 74;

  const pendingComplaints = complaints.filter((c) => c.status !== "Resolved");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header Banner */}
      <div
        style={{
          background: "linear-gradient(135deg, #78350f 0%, #0f172a 100%)",
          borderRadius: "16px",
          padding: "24px 32px",
          color: "white",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
          boxShadow: "0 10px 25px -5px rgba(120, 53, 15, 0.3)"
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
            <Badge variant="warning">HOD Administration Portal</Badge>
            <span style={{ fontSize: "0.8rem", color: "#fde68a" }}>{dept.name}</span>
          </div>
          <h2 style={{ fontSize: "1.75rem", fontWeight: "800", color: "white" }}>
            Welcome, {hod?.name}
          </h2>
          <p style={{ fontSize: "0.9rem", color: "#fef3c7", marginTop: "2px" }}>
            Real-time department academic overview • Configured Threshold: <strong>{threshold}%</strong>
          </p>
        </div>

        <button
          onClick={() => onNavigate("students")}
          className="btn btn-primary"
          style={{ background: "#d97706", borderColor: "#b45309" }}
        >
          <AlertTriangle size={16} /> View Defaulter Radar ({belowThresholdStudents})
        </button>
      </div>

      {/* 8 Metric Cards from Specification */}
      <div className="stats-grid">
        <StatCard
          label="Total Students"
          value={dept.studentCount || deptStudents.length}
          subtext="Enrolled across Sem 1 to Sem 8"
          icon={Users}
          variant="primary"
          onClick={() => onNavigate("students")}
        />

        <StatCard
          label="Total Faculty"
          value={dept.facultyCount || deptTeachers.length}
          subtext="Professors & Lab Instructors"
          icon={GraduationCap}
          variant="purple"
          onClick={() => onNavigate("faculty")}
        />

        <StatCard
          label="Average Attendance"
          value={`${deptAvgAttendance}%`}
          subtext={`Department-wide compliance`}
          icon={CalendarCheck}
          variant={deptAvgAttendance >= threshold ? "success" : "warning"}
          onClick={() => onNavigate("attendance")}
        />

        <StatCard
          label="Students Below Threshold"
          value={`${belowThresholdStudents}`}
          subtext={`Requiring parent intervention`}
          icon={AlertTriangle}
          variant={belowThresholdStudents > 0 ? "danger" : "success"}
          onClick={() => onNavigate("students")}
        />

        <StatCard
          label="Avg Internal Marks"
          value={`${avgMarks}%`}
          subtext="Continuous evaluation score"
          icon={Award}
          variant="primary"
          onClick={() => onNavigate("marks")}
        />

        <StatCard
          label="Pending Assignments"
          value={`${assignments.length} Active`}
          subtext="Coursework tracking"
          icon={BookOpen}
          variant="purple"
          onClick={() => onNavigate("assignments")}
        />

        <StatCard
          label="Active Complaints"
          value={`${pendingComplaints.length}`}
          subtext="Infrastructure & lab tickets"
          icon={AlertOctagon}
          variant={pendingComplaints.length > 0 ? "warning" : "success"}
          onClick={() => onNavigate("complaints")}
        />

        <StatCard
          label="Today's Attendance Status"
          value="95% Completed"
          subtext="4 of 5 lectures recorded"
          icon={CheckCircle2}
          variant="success"
          onClick={() => onNavigate("faculty")}
        />
      </div>

      {/* Visual Analytics Charts & Defaulters Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "24px" }}>
        
        {/* Subject Attendance Comparison */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">
                <BarChart3 size={18} color="var(--primary-600)" />
                Subject-wise Department Attendance Comparison
              </div>
              <div className="card-subtitle">Real-time attendance averages across courses</div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {subjects.map((sub) => {
              // Calculate average for this subject
              let total = 0;
              let att = 0;
              deptStudents.forEach((stu) => {
                const d = attendance[stu.id]?.[sub.id] || { total: 20, attended: 16, percentage: 80 };
                total += d.total;
                att += d.attended;
              });
              const subPct = total > 0 ? Math.round((att / total) * 1000) / 10 : 78;
              const isLow = subPct < threshold;

              return (
                <div key={sub.id}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "4px" }}>
                    <span style={{ fontWeight: "700" }}>{sub.name} ({sub.code})</span>
                    <span style={{ fontWeight: "800", color: isLow ? "var(--danger-solid)" : "var(--success-solid)" }}>
                      {subPct}%
                    </span>
                  </div>
                  <div style={{ height: "10px", background: "#e2e8f0", borderRadius: "5px", overflow: "hidden" }}>
                    <div
                      style={{
                        height: "100%",
                        width: `${subPct}%`,
                        background: isLow ? "var(--danger-solid)" : "var(--primary-600)",
                        borderRadius: "5px"
                      }}
                    />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "2px" }}>
                    <span>Faculty: {sub.teacherName}</span>
                    <span>Status: {isLow ? "⚠️ Defaulter High" : "✓ Healthy"}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Low Attendance Student Alert Radar */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">
                <AlertTriangle size={18} color="#ef4444" />
                Department Defaulter Radar (&lt;{threshold}%)
              </div>
              <div className="card-subtitle">Students requiring immediate counseling</div>
            </div>
            <button
              onClick={() => onNavigate("students")}
              style={{ background: "none", border: "none", color: "var(--primary-600)", fontSize: "0.8rem", fontWeight: "600", cursor: "pointer" }}
            >
              Full List
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {deptStudents
              .filter((stu) => {
                const sAtt = attendance[stu.id] || {};
                let t = 0; let a = 0;
                subjects.forEach((s) => {
                  const d = sAtt[s.id] || { total: 20, attended: 16, percentage: 80 };
                  t += d.total; a += d.attended;
                });
                return t > 0 && (a / t) * 100 < threshold;
              })
              .map((stu) => {
                const sAtt = attendance[stu.id] || {};
                let t = 0; let a = 0;
                subjects.forEach((s) => {
                  const d = sAtt[s.id] || { total: 20, attended: 16, percentage: 80 };
                  t += d.total; a += d.attended;
                });
                const pct = Math.round((a / t) * 1000) / 10;

                return (
                  <div
                    key={stu.id}
                    style={{
                      padding: "12px",
                      borderRadius: "8px",
                      background: "#fef2f2",
                      border: "1px solid #fecaca",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center"
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: "700", fontSize: "0.88rem", color: "#991b1b" }}>{stu.name}</div>
                      <div style={{ fontSize: "0.75rem", color: "#7f1d1d" }}>
                        Roll: {stu.rollNo} • Parent: {stu.parentName} ({stu.parentPhone})
                      </div>
                    </div>
                    <Badge variant="danger">{pct}% Avg</Badge>
                  </div>
                );
              })}
          </div>
        </div>

      </div>
    </div>
  );
}

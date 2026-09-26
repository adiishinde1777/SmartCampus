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
  ArrowRight,
  Sparkles
} from "lucide-react";
import { StatCard, Badge } from "../common/UIPrimitives";
import { getTimeBasedGreeting } from "../../utils/academicSession";

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
    systemSettings,
    studentSkills,
    collegeEvents,
    studentHealthRecords
  } = useSmartCampus();

  const hod = currentUser;
  const deptId = hod?.departmentId || "dept-vlsi";
  const dept = departments.find((d) => d.id === deptId) || {
    id: deptId,
    name: hod?.departmentName || "Electronic Engineering (VLSI Design And Technology)"
  };
  const deptStudents = users.filter((u) => u.role === "student" && u.departmentId === dept.id);
  const deptTeachers = users.filter((u) => u.role === "teacher" && u.departmentId === dept.id);
  const deptSubjects = subjects.filter((s) => s.departmentId === dept.id || s.departmentId === "dept-vlsi");
  const threshold = systemSettings.attendanceThreshold;

  // Calculate department-wide attendance
  let totalLecs = 0;
  let attendedLecs = 0;
  let belowThresholdStudents = 0;

  deptStudents.forEach((stu) => {
    const sAtt = attendance[stu.id] || {};
    let stuTotal = 0;
    let stuAttended = 0;

    deptSubjects.forEach((sub) => {
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

  const deptStudentIds = new Set(deptStudents.map((s) => s.id));
  const deptApprovedSkills = (studentSkills || []).filter(
    (s) => (deptStudentIds.has(s.studentId) || s.departmentId === dept.id) && s.approvalStatus === "Approved"
  );
  const deptVerifiedStudentCount = new Set(deptApprovedSkills.map((s) => s.studentId)).size;

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
            {getTimeBasedGreeting()}, {hod?.name} 👨‍🏫
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

      {/* Department Talent & Events Highlight Card */}
      <div
        className="card"
        style={{
          background: "linear-gradient(135deg, #312e81 0%, #1e1b4b 100%)",
          color: "white",
          padding: "20px 28px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
          boxShadow: "0 8px 20px -4px rgba(49, 46, 129, 0.3)"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              width: "46px",
              height: "46px",
              borderRadius: "12px",
              background: "rgba(255, 255, 255, 0.18)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white"
            }}
          >
            <Sparkles size={24} />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
              <h3 style={{ fontSize: "1.15rem", fontWeight: "800", color: "white", margin: 0 }}>
                {dept.name} • Student Skill Bucket & Talent
              </h3>
              <span style={{ background: "rgba(255,255,255,0.2)", padding: "2px 8px", borderRadius: "10px", fontSize: "0.72rem", fontWeight: "700" }}>
                {deptVerifiedStudentCount} Verified Skilled Students ({dept.code || "Dept"})
              </span>
            </div>
            <p style={{ fontSize: "0.86rem", color: "#c7d2fe", marginTop: "3px" }}>
              Only showing your department's students. Track technical skills for internships & cultural talents for events.
            </p>
          </div>
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button
            onClick={() => onNavigate("placement-skills")}
            className="btn btn-sm"
            style={{ background: "#4f46e5", color: "white", fontWeight: "700", border: "none" }}
          >
            Dept Skill Bucket (Internship)
          </button>
          <button
            onClick={() => onNavigate("department-talent")}
            className="btn btn-sm"
            style={{ background: "#ffffff", color: "#312e81", fontWeight: "700", border: "none" }}
          >
            Dept Talent & Events
          </button>
        </div>
      </div>

      {/* Visual Analytics Charts & Defaulters Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px" }}>
        
        {/* Subject Attendance Comparison */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">
                <BarChart3 size={18} color="var(--primary-600)" />
                Subject-wise Department Attendance Comparison
              </div>
              <div className="card-subtitle">Real-time attendance averages (Theory & Practical)</div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {deptSubjects.map((sub) => {
              // Calculate average for this subject
              let total = 0;
              let att = 0;
              let thTotal = 0;
              let thAtt = 0;
              let prTotal = 0;
              let prAtt = 0;

              deptStudents.forEach((stu) => {
                const d = attendance[stu.id]?.[sub.id] || { total: 20, attended: 16, percentage: 80 };
                total += d.total;
                att += d.attended;
                thTotal += d.theoryTotal ?? Math.round(d.total * 0.7);
                thAtt += d.theoryAttended ?? Math.min(thTotal, Math.round(d.attended * 0.7));
                prTotal += d.practicalTotal ?? (d.total - (d.theoryTotal ?? Math.round(d.total * 0.7)));
                prAtt += d.practicalAttended ?? Math.max(0, d.attended - (d.theoryAttended ?? Math.min(thTotal, Math.round(d.attended * 0.7))));
              });
              const subPct = total > 0 ? Math.round((att / total) * 1000) / 10 : 78;
              const thPct = thTotal > 0 ? Math.round((thAtt / thTotal) * 1000) / 10 : subPct;
              const prPct = prTotal > 0 ? Math.round((prAtt / prTotal) * 1000) / 10 : subPct;
              const isLow = subPct < threshold;

              return (
                <div key={sub.id} style={{ background: "var(--bg-surface-secondary)", padding: "12px", borderRadius: "10px", border: "1px solid var(--border-subtle)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "6px" }}>
                    <span style={{ fontWeight: "700" }}>{sub.name} ({sub.code})</span>
                    <span style={{ fontWeight: "800", color: isLow ? "var(--danger-solid)" : "var(--success-solid)" }}>
                      Overall: {subPct}%
                    </span>
                  </div>
                  <div style={{ height: "8px", background: "#e2e8f0", borderRadius: "4px", overflow: "hidden", marginBottom: "8px" }}>
                    <div
                      style={{
                        height: "100%",
                        width: `${subPct}%`,
                        background: isLow ? "var(--danger-solid)" : "var(--primary-600)",
                        borderRadius: "4px"
                      }}
                    />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "6px", fontSize: "0.74rem", color: "var(--text-muted)" }}>
                    <span>Faculty: <strong>{sub.teacherName}</strong></span>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <span style={{ background: "rgba(37, 99, 235, 0.1)", color: "#1d4ed8", padding: "1px 6px", borderRadius: "4px", fontWeight: "600" }}>
                        Theory: {thPct}%
                      </span>
                      <span style={{ background: "rgba(16, 185, 129, 0.1)", color: "#047857", padding: "1px 6px", borderRadius: "4px", fontWeight: "600" }}>
                        Practical: {prPct}%
                      </span>
                    </div>
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

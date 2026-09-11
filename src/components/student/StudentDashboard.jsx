import React from "react";
import { useSmartCampus } from "../../context/SmartCampusContext";
import {
  CalendarCheck,
  Award,
  BookOpen,
  Activity,
  AlertTriangle,
  Clock,
  Calendar,
  ArrowRight,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  FileText
} from "lucide-react";
import { StatCard, Badge } from "../common/UIPrimitives";

export default function StudentDashboard({ onNavigate }) {
  const {
    currentUser,
    attendance,
    subjects,
    marks,
    assignments,
    notices,
    timetables,
    timetableToday,
    systemSettings
  } = useSmartCampus();

  const student = currentUser;
  const threshold = systemSettings.attendanceThreshold;

  // Student class timetable for today
  const todayDayName = new Date().toLocaleDateString("en-US", { weekday: "long" });
  const studentDept = student?.departmentId || "dept-ce";
  const studentSem = Number(student?.semester) || 5;
  const studentDiv = student?.division || "A";

  // Filter slots for student's department, sem, div for today (or fallback to Monday slots if weekend)
  const studentTodaySlots = (timetables || []).filter(
    (t) =>
      t.departmentId === studentDept &&
      t.semester === studentSem &&
      t.division === studentDiv &&
      (t.day === todayDayName || t.day === "Monday" || t.day === "Tuesday")
  );

  const displayTimetable = studentTodaySlots.length > 0
    ? studentTodaySlots.map((s, idx) => ({
        subject: s.subjectName,
        code: s.subjectCode,
        room: s.room,
        teacher: s.teacherName,
        time: s.time,
        type: s.type,
        lectureNum: idx + 1
      }))
    : timetableToday;

  // Calculate student attendance metrics
  const studentAtt = attendance[student?.id] || {};
  let totalLectures = 0;
  let totalAttended = 0;
  const subjectList = [];

  subjects.forEach((sub) => {
    const sData = studentAtt[sub.id] || { total: 20, attended: 16, percentage: 80 };
    totalLectures += sData.total;
    totalAttended += sData.attended;
    subjectList.push({
      ...sub,
      total: sData.total,
      attended: sData.attended,
      percentage: sData.percentage,
      isLow: sData.percentage < threshold
    });
  });

  const overallAttendance = totalLectures > 0 ? Math.round((totalAttended / totalLectures) * 1000) / 10 : 0;
  const lowAttendanceSubjects = subjectList.filter((s) => s.isLow);

  // Student Marks average
  const studentMarks = marks.filter((m) => m.studentId === student?.id);
  const avgMarks =
    studentMarks.length > 0
      ? Math.round(
          studentMarks.reduce((acc, m) => acc + (m.marksObtained / m.maxMarks) * 100, 0) /
            studentMarks.length
        )
      : 78;

  // Pending assignments
  const pendingAssignments = assignments.filter((asg) => {
    const sub = asg.submissions.find((s) => s.studentId === student?.id);
    return !sub || sub.status !== "Submitted";
  });

  // Academic Health Indicator
  let academicStatus = "Good";
  let statusColor = "success";
  if (overallAttendance < threshold || avgMarks < 60 || pendingAssignments.length >= 3) {
    if (overallAttendance < 65 || avgMarks < 50 || pendingAssignments.length >= 4) {
      academicStatus = "High Attention";
      statusColor = "danger";
    } else {
      academicStatus = "Needs Attention";
      statusColor = "warning";
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Welcome Banner */}
      <div
        style={{
          background: "linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%)",
          borderRadius: "16px",
          padding: "24px 32px",
          color: "white",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
          boxShadow: "0 10px 25px -5px rgba(30, 58, 138, 0.3)"
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
            <span style={{ fontSize: "0.8rem", background: "rgba(255,255,255,0.15)", padding: "3px 10px", borderRadius: "20px", fontWeight: "600" }}>
              {student?.rollNo} • {student?.departmentName}
            </span>
          </div>
          <h2 style={{ fontSize: "1.75rem", fontWeight: "800", color: "white" }}>
            Good Morning, {student?.name} 👋
          </h2>
          <p style={{ fontSize: "0.9rem", color: "#93c5fd", marginTop: "4px" }}>
            Semester {student?.semester} - Division {student?.division} • Academic Session {systemSettings.academicYear}
          </p>
        </div>

        <button
          onClick={() => onNavigate("ai-assistant")}
          className="btn btn-primary"
          style={{
            background: "linear-gradient(135deg, #7c3aed, #2563eb)",
            border: "1px solid rgba(255,255,255,0.2)",
            boxShadow: "0 4px 14px rgba(124, 58, 237, 0.4)"
          }}
        >
          <Sparkles size={16} />
          <span>Ask AI Academic Assistant</span>
        </button>
      </div>

      {/* 4 Main Summary Cards */}
      <div className="stats-grid">
        <StatCard
          label="Overall Attendance"
          value={`${overallAttendance}%`}
          subtext={
            overallAttendance >= threshold
              ? `✓ Above mandatory ${threshold}% threshold`
              : `⚠️ Below mandatory ${threshold}% threshold`
          }
          icon={CalendarCheck}
          variant={overallAttendance >= threshold ? "success" : "danger"}
          onClick={() => onNavigate("attendance")}
        />

        <StatCard
          label="Internal Marks Avg"
          value={`${avgMarks}%`}
          subtext={`Based on ${studentMarks.length} evaluated tests`}
          icon={Award}
          variant="primary"
          onClick={() => onNavigate("marks")}
        />

        <StatCard
          label="Course Assignments"
          value={`${pendingAssignments.length} Pending`}
          subtext={`Total ${assignments.length} assignments active`}
          icon={BookOpen}
          variant={pendingAssignments.length > 0 ? "warning" : "success"}
          onClick={() => onNavigate("assignments")}
        />

        <StatCard
          label="Academic Status"
          value={academicStatus}
          subtext="Transparent multi-metric indicator"
          icon={Activity}
          variant={statusColor}
          onClick={() => onNavigate("performance")}
        />
      </div>

      {/* Critical Alert Banner if Low Attendance */}
      {lowAttendanceSubjects.length > 0 && (
        <div
          style={{
            background: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: "12px",
            padding: "16px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "12px"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "8px",
                background: "#fee2e2",
                color: "#dc2626",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0
              }}
            >
              <AlertTriangle size={22} />
            </div>
            <div>
              <div style={{ fontWeight: "700", color: "#991b1b", fontSize: "0.95rem" }}>
                ⚠️ Attendance Risk Alert
              </div>
              <div style={{ fontSize: "0.85rem", color: "#7f1d1d", marginTop: "2px" }}>
                Your attendance in <strong>{lowAttendanceSubjects.map((s) => `${s.name} (${s.percentage}%)`).join(", ")}</strong> is below the configured {threshold}% threshold.
              </div>
            </div>
          </div>
          <button
            onClick={() => onNavigate("attendance")}
            className="btn btn-danger btn-sm"
          >
            <span>View Recovery Calculator</span>
            <ArrowRight size={14} />
          </button>
        </div>
      )}

      {/* Two Column Grid: Today's Timetable & Upcoming Tasks */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "24px" }}>
        {/* Today's Lectures */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">
                <Clock size={18} color="var(--primary-600)" />
                Today's Lecture Schedule
              </div>
              <div className="card-subtitle">Room B-204 & Laboratories</div>
            </div>
            <Badge variant="info">{displayTimetable.length} Lectures</Badge>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {displayTimetable.map((item, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 16px",
                  borderRadius: "10px",
                  background: idx === 0 ? "var(--primary-50)" : "var(--bg-surface-secondary)",
                  border: idx === 0 ? "1px solid var(--primary-200)" : "1px solid var(--border-subtle)"
                }}
              >
                <div>
                  <div style={{ fontWeight: "700", fontSize: "0.9rem", color: "var(--text-main)" }}>
                    {item.subject} ({item.code})
                  </div>
                  <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "2px" }}>
                    Faculty: {item.teacher} • Venue: {item.room}
                  </div>
                </div>

                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "0.82rem", fontWeight: "700", color: idx === 0 ? "var(--primary-700)" : "var(--text-main)" }}>
                    {item.time}
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                    Lecture #{item.lectureNum}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Upcoming Tests & Assignments */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Upcoming Tests */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <Calendar size={18} color="var(--accent-purple)" />
                Upcoming Exams & Tests
              </div>
              <button
                onClick={() => onNavigate("exams")}
                style={{ background: "none", border: "none", color: "var(--primary-600)", fontSize: "0.8rem", fontWeight: "600", cursor: "pointer" }}
              >
                View All
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ padding: "12px", borderRadius: "8px", background: "#f5f3ff", border: "1px solid #ddd6fe", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: "700", fontSize: "0.85rem", color: "#5b21b6" }}>DBMS Mid-Term Exam</div>
                  <div style={{ fontSize: "0.75rem", color: "#6d28d9" }}>24 Sept 2026 • 10:00 AM</div>
                </div>
                <Badge variant="purple">15 Days Left</Badge>
              </div>

              <div style={{ padding: "12px", borderRadius: "8px", background: "#fffbeb", border: "1px solid #fde68a", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: "700", fontSize: "0.85rem", color: "#92400e" }}>OS Assignment Submission</div>
                  <div style={{ fontSize: "0.75rem", color: "#b45309" }}>Due 16 Sept 2026 • 50 Pts</div>
                </div>
                <Badge variant="warning">Due Soon</Badge>
              </div>
            </div>
          </div>

          {/* Quick Notice Board snippet */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <FileText size={18} color="var(--primary-600)" />
                Recent Notices & Circulars
              </div>
              <button
                onClick={() => onNavigate("notices")}
                style={{ background: "none", border: "none", color: "var(--primary-600)", fontSize: "0.8rem", fontWeight: "600", cursor: "pointer" }}
              >
                Board
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {notices.slice(0, 2).map((n) => (
                <div key={n.id} style={{ borderBottom: "1px solid var(--border-subtle)", paddingBottom: "10px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "3px" }}>
                    {n.important && <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#ef4444" }} />}
                    <span style={{ fontWeight: "600", fontSize: "0.82rem", color: "var(--text-main)" }}>
                      {n.title}
                    </span>
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                    {n.author} • {n.publishDate}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

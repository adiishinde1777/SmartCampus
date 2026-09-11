import React from "react";
import { useSmartCampus } from "../../context/SmartCampusContext";
import {
  CalendarCheck,
  Award,
  BookOpen,
  Users,
  Clock,
  ArrowRight,
  AlertTriangle,
  GraduationCap,
  Sparkles,
  CheckCircle2
} from "lucide-react";
import { StatCard, Badge } from "../common/UIPrimitives";

export default function TeacherDashboard({ onNavigate }) {
  const { currentUser, subjects, attendance, users, assignments, leaves, systemSettings } = useSmartCampus();

  const teacher = currentUser;
  const mySubjects = subjects.filter((s) => s.teacherId === teacher?.id || s.teacherName === teacher?.name);
  const myStudents = users.filter((u) => u.role === "student" && u.departmentId === (teacher?.departmentId || "dept-ce"));
  const pendingLeaves = leaves.filter((l) => l.status === "Pending");
  const threshold = systemSettings.attendanceThreshold;

  // Find students with low attendance in teacher's subjects
  const lowAttendanceStudents = [];
  myStudents.forEach((stu) => {
    const stuAtt = attendance[stu.id] || {};
    mySubjects.forEach((sub) => {
      const sData = stuAtt[sub.id];
      if (sData && sData.percentage < threshold) {
        lowAttendanceStudents.push({
          student: stu,
          subject: sub,
          percentage: sData.percentage,
          attended: sData.attended,
          total: sData.total
        });
      }
    });
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Welcome Banner */}
      <div
        style={{
          background: "linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)",
          borderRadius: "16px",
          padding: "24px 32px",
          color: "white",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
          boxShadow: "0 10px 25px -5px rgba(30, 27, 75, 0.4)"
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
            <span style={{ fontSize: "0.8rem", background: "rgba(255,255,255,0.15)", padding: "3px 10px", borderRadius: "20px", fontWeight: "600" }}>
              {teacher?.designation} • {teacher?.departmentName}
            </span>
          </div>
          <h2 style={{ fontSize: "1.75rem", fontWeight: "800", color: "white" }}>
            Welcome, {teacher?.name} 👨‍🏫
          </h2>
          <p style={{ fontSize: "0.9rem", color: "#cbd5e1", marginTop: "4px" }}>
            Academic Session {systemSettings.academicYear} • Assigned Subjects: {mySubjects.map((s) => s.code).join(", ")}
          </p>
        </div>

        <button
          onClick={() => onNavigate("attendance")}
          className="btn btn-primary btn-lg"
          style={{
            background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
            boxShadow: "0 4px 14px rgba(37, 99, 235, 0.4)"
          }}
        >
          <CalendarCheck size={18} />
          <span>Mark Lecture Attendance Now</span>
        </button>
      </div>

      {/* 4 Teacher Metric Cards */}
      <div className="stats-grid">
        <StatCard
          label="Assigned Subjects"
          value={mySubjects.length || 2}
          subtext="DBMS, Operating Systems (Sem 5)"
          icon={BookOpen}
          variant="primary"
          onClick={() => onNavigate("classes")}
        />

        <StatCard
          label="Enrolled Students"
          value={myStudents.length}
          subtext="Sem 5 - Div A & Div B"
          icon={Users}
          variant="purple"
          onClick={() => onNavigate("classes")}
        />

        <StatCard
          label="Pending Leave Approvals"
          value={`${pendingLeaves.length} Requests`}
          subtext="Medical & On-Duty applications"
          icon={Clock}
          variant={pendingLeaves.length > 0 ? "warning" : "success"}
          onClick={() => onNavigate("leaves")}
        />

        <StatCard
          label="Attendance Defaulters"
          value={`${lowAttendanceStudents.length} Students`}
          subtext={`Below ${threshold}% attendance threshold`}
          icon={AlertTriangle}
          variant={lowAttendanceStudents.length > 0 ? "danger" : "success"}
          onClick={() => onNavigate("attendance")}
        />
      </div>

      {/* Two Column Grid: Today's Lectures & Defaulter Radar */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "24px" }}>
        
        {/* Today's Teaching Schedule */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">
                <Clock size={18} color="var(--primary-600)" />
                Today's Lecture Schedule
              </div>
              <div className="card-subtitle">Ready for automated attendance marking</div>
            </div>
            <button
              onClick={() => onNavigate("attendance")}
              className="btn btn-sm btn-primary"
            >
              Start Attendance
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "14px 18px",
                borderRadius: "10px",
                background: "var(--primary-50)",
                border: "1px solid var(--primary-200)"
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Badge variant="purple">DBMS (CE501)</Badge>
                  <strong style={{ fontSize: "0.95rem" }}>Sem 5 - Division A</strong>
                </div>
                <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "4px" }}>
                  09:00 AM - 10:00 AM • Classroom B-204 • Lecture #14
                </div>
              </div>
              <button
                onClick={() => onNavigate("attendance")}
                className="btn btn-primary btn-sm"
              >
                Mark Now
              </button>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "14px 18px",
                borderRadius: "10px",
                background: "var(--bg-surface-secondary)",
                border: "1px solid var(--border-subtle)"
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Badge variant="info">Operating Systems (CE502)</Badge>
                  <strong style={{ fontSize: "0.95rem" }}>Sem 5 - Division A</strong>
                </div>
                <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "4px" }}>
                  10:00 AM - 11:00 AM • Classroom B-204 • Lecture #12
                </div>
              </div>
              <button
                onClick={() => onNavigate("attendance")}
                className="btn btn-secondary btn-sm"
              >
                Mark
              </button>
            </div>
          </div>
        </div>

        {/* Low Attendance Student Spotlight */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">
                <AlertTriangle size={18} color="#ef4444" />
                Defaulter Spotlight (&lt;{threshold}%)
              </div>
              <div className="card-subtitle">Automatic parent notifications active</div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {lowAttendanceStudents.length === 0 ? (
              <div style={{ textAlign: "center", padding: "20px", color: "var(--text-muted)" }}>
                <CheckCircle2 size={32} color="#10b981" style={{ margin: "0 auto 8px" }} />
                <p style={{ fontWeight: "600" }}>All students above {threshold}% threshold!</p>
              </div>
            ) : (
              lowAttendanceStudents.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: "12px",
                    borderRadius: "8px",
                    background: "#fef2f2",
                    border: "1px solid #fecaca",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between"
                  }}
                >
                  <div>
                    <div style={{ fontWeight: "700", fontSize: "0.88rem", color: "#991b1b" }}>
                      {item.student.name} ({item.student.rollNo})
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "#7f1d1d" }}>
                      {item.subject.name} • Attended {item.attended}/{item.total}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <Badge variant="danger">{item.percentage}%</Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

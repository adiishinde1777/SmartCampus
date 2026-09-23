import React from "react";
import { useSmartCampus } from "../../context/SmartCampusContext";
import {
  GraduationCap,
  Users,
  BookOpen,
  CalendarCheck,
  Award,
  ArrowRight
} from "lucide-react";
import { Badge } from "../common/UIPrimitives";

export default function TeacherClasses({ onNavigate }) {
  const { currentUser, subjects, users, attendance, systemSettings } = useSmartCampus();

  const teacher = currentUser;
  const mySubjects = subjects.filter((s) => s.teacherId === teacher?.id || s.teacherName === teacher?.name);
  const students = users.filter((u) => u.role === "student" && u.departmentId === (teacher?.departmentId || "dept-vlsi"));
  const threshold = systemSettings.attendanceThreshold;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div>
        <h2 style={{ fontSize: "1.5rem", fontWeight: "800", color: "var(--text-main)" }}>
          My Assigned Classes & Subject Batches
        </h2>
        <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "4px" }}>
          Active semester courses, enrolled student rosters, and batch analytics
        </p>
      </div>

      {/* Classes Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: "20px" }}>
        {mySubjects.map((sub) => {
          // Calculate class attendance average for this subject
          let totalClasses = 0;
          let totalAttended = 0;
          let lowCount = 0;

          students.forEach((stu) => {
            const data = attendance[stu.id]?.[sub.id] || { total: 20, attended: 16, percentage: 80 };
            totalClasses += data.total;
            totalAttended += data.attended;
            if (data.percentage < threshold) lowCount++;
          });

          const classAvg = totalClasses > 0 ? Math.round((totalAttended / totalClasses) * 1000) / 10 : 80;

          return (
            <div key={sub.id} className="card" style={{ borderTop: "4px solid var(--primary-600)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <Badge variant="purple">TE VLSI – Semester {sub.semester} (3rd Year)</Badge>
                <Badge variant={classAvg >= threshold ? "success" : "danger"}>Class Avg: {classAvg}%</Badge>
              </div>

              <h3 style={{ fontSize: "1.2rem", fontWeight: "700" }}>{sub.name}</h3>
              <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: "2px", fontFamily: "monospace" }}>
                Course Code: {sub.code} • Credits: {sub.credits}
              </div>

              <div style={{ background: "var(--bg-surface-secondary)", padding: "12px", borderRadius: "8px", margin: "16px 0", display: "flex", flexDirection: "column", gap: "8px", fontSize: "0.82rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-muted)" }}>Enrolled Students:</span>
                  <strong>{students.length} Students</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-muted)" }}>Below {threshold}% Threshold:</span>
                  <strong style={{ color: lowCount > 0 ? "#dc2626" : "#059669" }}>{lowCount} Defaulter(s)</strong>
                </div>
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  onClick={() => onNavigate("attendance")}
                  className="btn btn-primary btn-sm"
                  style={{ flex: 1 }}
                >
                  <CalendarCheck size={14} /> Mark Attendance
                </button>
                <button
                  onClick={() => onNavigate("marks")}
                  className="btn btn-secondary btn-sm"
                  style={{ flex: 1 }}
                >
                  <Award size={14} /> Upload Marks
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

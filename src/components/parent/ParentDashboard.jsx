import React from "react";
import { useSmartCampus } from "../../context/SmartCampusContext";
import {
  CalendarCheck,
  Award,
  BookOpen,
  Activity,
  AlertTriangle,
  MessageSquare,
  Smartphone,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldAlert
} from "lucide-react";
import { StatCard, Badge } from "../common/UIPrimitives";

export default function ParentDashboard({ onNavigate }) {
  const { currentUser, users, attendance, subjects, marks, assignments, notifications, systemSettings } = useSmartCampus();

  const parent = currentUser;
  const ward = users.find((u) => u.id === parent?.studentId) || users[0];
  const threshold = systemSettings.attendanceThreshold;

  // Calculate ward attendance
  const wardAtt = attendance[ward?.id] || {};
  let totalLectures = 0;
  let totalAttended = 0;
  const subjectList = [];

  subjects.forEach((sub) => {
    const sData = wardAtt[sub.id] || { total: 20, attended: 16, percentage: 80 };
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

  // Ward marks
  const wardMarks = marks.filter((m) => m.studentId === ward?.id);
  const avgMarks = wardMarks.length > 0
    ? Math.round(wardMarks.reduce((a, b) => a + (b.marksObtained / b.maxMarks) * 100, 0) / wardMarks.length)
    : 72;

  // Ward assignments
  const pendingAssignments = assignments.filter((asg) => {
    const sub = asg.submissions.find((s) => s.studentId === ward?.id);
    return !sub || sub.status !== "Submitted";
  });

  // Recent SMS / WhatsApp notifications for parent
  const parentAlerts = notifications.filter((n) => n.recipientId === parent?.id || n.recipientRole === "parent");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Hero Welcome Banner */}
      <div
        style={{
          background: "linear-gradient(135deg, #064e3b 0%, #0f172a 100%)",
          borderRadius: "16px",
          padding: "24px 32px",
          color: "white",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
          boxShadow: "0 10px 25px -5px rgba(6, 78, 59, 0.3)"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <img
            src={ward?.avatar}
            alt={ward?.name}
            style={{ width: "64px", height: "64px", borderRadius: "50%", objectFit: "cover", border: "3px solid #10b981" }}
          />
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
              <Badge variant="success">Monitoring Ward: {ward?.name}</Badge>
              <span style={{ fontSize: "0.8rem", color: "#a7f3d0" }}>Roll: {ward?.rollNo}</span>
            </div>
            <h2 style={{ fontSize: "1.6rem", fontWeight: "800", color: "white" }}>
              Parent Portal: {parent?.name}
            </h2>
            <p style={{ fontSize: "0.85rem", color: "#a7f3d0", marginTop: "2px" }}>
              {ward?.departmentName} (Sem {ward?.semester} - Div {ward?.division}) • SMS & WhatsApp Sync Active
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigate("attendance")}
          className="btn btn-primary btn-sm"
          style={{ background: "#10b981", borderColor: "#059669" }}
        >
          <CalendarCheck size={16} /> View Attendance Breakdown
        </button>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="stats-grid">
        <StatCard
          label="Ward Overall Attendance"
          value={`${overallAttendance}%`}
          subtext={
            overallAttendance >= threshold
              ? `✓ Above mandatory ${threshold}% cutoff`
              : `⚠️ Below mandatory ${threshold}% cutoff`
          }
          icon={CalendarCheck}
          variant={overallAttendance >= threshold ? "success" : "danger"}
          onClick={() => onNavigate("attendance")}
        />

        <StatCard
          label="Internal Assessment Avg"
          value={`${avgMarks}%`}
          subtext={`Based on ${wardMarks.length} evaluated tests`}
          icon={Award}
          variant="primary"
          onClick={() => onNavigate("marks")}
        />

        <StatCard
          label="Pending Assignments"
          value={`${pendingAssignments.length} Pending`}
          subtext="Coursework submission tracking"
          icon={BookOpen}
          variant={pendingAssignments.length > 0 ? "warning" : "success"}
          onClick={() => onNavigate("assignments")}
        />

        <StatCard
          label="Academic Health"
          value={overallAttendance >= threshold ? "Satisfactory" : "High Attention"}
          subtext="Transparent institution evaluation"
          icon={Activity}
          variant={overallAttendance >= threshold ? "success" : "danger"}
          onClick={() => onNavigate("academic-status")}
        />
      </div>

      {/* Real-time SMS & WhatsApp Live Simulation Drawer */}
      <div className="card" style={{ background: "linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)", border: "1px solid #a7f3d0" }}>
        <div className="card-header">
          <div className="card-title" style={{ color: "#065f46" }}>
            <Smartphone size={20} color="#059669" />
            Live Parent SMS & WhatsApp Notification Stream
          </div>
          <Badge variant="success">✓ Real-time Sync</Badge>
        </div>

        <p style={{ fontSize: "0.85rem", color: "#047857", marginBottom: "14px" }}>
          Whenever a teacher marks attendance or publishes marks, instant alerts are pushed directly to parent phone: <strong>{parent?.phone}</strong>
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {parentAlerts.slice(0, 3).map((alert) => (
            <div
              key={alert.id}
              style={{
                background: "white",
                padding: "14px 16px",
                borderRadius: "10px",
                border: "1px solid #bbf7d0",
                display: "flex",
                gap: "12px",
                boxShadow: "0 2px 6px rgba(5, 150, 105, 0.08)"
              }}
            >
              <div style={{ marginTop: "2px" }}>
                <MessageSquare size={18} color="#059669" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                  <span style={{ fontWeight: "700", fontSize: "0.88rem", color: "#065f46" }}>
                    {alert.title}
                  </span>
                  <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{alert.timestamp}</span>
                </div>
                <p style={{ fontSize: "0.82rem", color: "#1e293b", lineHeight: 1.4 }}>
                  {alert.message}
                </p>
                <div style={{ display: "flex", gap: "8px", marginTop: "6px", fontSize: "0.7rem", color: "#059669", fontWeight: "600" }}>
                  <span>📱 Delivered via WhatsApp Gateway</span>
                  <span>•</span>
                  <span>Status: {alert.deliveryStatus}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Two Column Grid: Subject Breakdown & Recent Marks */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "24px" }}>
        
        {/* Subject Attendance Breakdown */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">
                <CalendarCheck size={18} color="var(--primary-600)" />
                Ward Subject Attendance Breakdown
              </div>
              <div className="card-subtitle">Threshold: {threshold}%</div>
            </div>
            <button
              onClick={() => onNavigate("attendance")}
              style={{ background: "none", border: "none", color: "var(--primary-600)", fontSize: "0.8rem", fontWeight: "600", cursor: "pointer" }}
            >
              Full Details
            </button>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Attendance %</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {subjectList.map((row) => (
                  <tr key={row.id} style={{ background: row.isLow ? "#fff1f2" : undefined }}>
                    <td>
                      <strong>{row.name}</strong>
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div style={{ flex: 1, height: "6px", width: "60px", background: "#e2e8f0", borderRadius: "3px", overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${row.percentage}%`, background: row.isLow ? "var(--danger-solid)" : "var(--success-solid)" }} />
                        </div>
                        <strong style={{ color: row.isLow ? "#991b1b" : "var(--text-main)" }}>{row.percentage}%</strong>
                      </div>
                    </td>
                    <td>
                      {row.isLow ? (
                        <Badge variant="danger">Low Attendance</Badge>
                      ) : (
                        <Badge variant="success">Safe</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Assessment Scores */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">
                <Award size={18} color="var(--primary-600)" />
                Latest Assessment Results
              </div>
              <div className="card-subtitle">Published test scores</div>
            </div>
            <button
              onClick={() => onNavigate("marks")}
              style={{ background: "none", border: "none", color: "var(--primary-600)", fontSize: "0.8rem", fontWeight: "600", cursor: "pointer" }}
            >
              Scorecard
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {wardMarks.map((m) => (
              <div key={m.id} style={{ padding: "12px", borderRadius: "8px", background: "var(--bg-surface-secondary)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: "700", fontSize: "0.85rem" }}>{m.subjectName}</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{m.examType} • {m.date}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "1.05rem", fontWeight: "800", color: "var(--primary-700)" }}>
                    {m.marksObtained} / {m.maxMarks}
                  </div>
                  <Badge variant={m.marksObtained >= 18 ? "success" : "warning"}>
                    {Math.round((m.marksObtained / m.maxMarks) * 100)}%
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

import React from "react";
import { useSmartCampus } from "../../context/SmartCampusContext";
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Award,
  CalendarCheck,
  BookOpen,
  HelpCircle
} from "lucide-react";
import { Badge, StatCard } from "../common/UIPrimitives";

export default function StudentPerformance() {
  const { currentUser, attendance, subjects, marks, assignments, systemSettings } = useSmartCampus();

  const student = currentUser;
  const threshold = systemSettings.attendanceThreshold;

  // Calculate attendance
  const studentAtt = attendance[student?.id] || {};
  let totalLectures = 0;
  let totalAttended = 0;
  subjects.forEach((s) => {
    const d = studentAtt[s.id] || { total: 0, attended: 0, percentage: 0 };
    totalLectures += d.total;
    totalAttended += d.attended;
  });
  const overallAttendance = totalLectures > 0 ? Math.round((totalAttended / totalLectures) * 1000) / 10 : 0;

  // Calculate marks average
  const studentMarks = marks.filter((m) => m.studentId === student?.id);
  const avgMarks =
    studentMarks.length > 0
      ? Math.round(studentMarks.reduce((sum, m) => sum + (m.marksObtained / m.maxMarks) * 100, 0) / studentMarks.length)
      : 0;

  // Pending assignments
  const pendingAssignments = assignments.filter((asg) => {
    const sub = asg.submissions.find((s) => s.studentId === student?.id);
    return !sub || sub.status !== "Submitted";
  });

  // Determine Academic Standing
  let statusTier = "GOOD";
  let statusBadge = "success";
  let statusIcon = CheckCircle2;
  let summaryText = "Your attendance and academic marks are healthy. Keep up the consistent work!";

  if (studentMarks.length === 0 && totalLectures === 0) {
    statusTier = "ENROLLED";
    statusBadge = "primary";
    statusIcon = CheckCircle2;
    summaryText = "Welcome to SmartCampus! Your academic records will update once continuous evaluation begins.";
  } else if ((totalLectures > 0 && overallAttendance < 65) || (studentMarks.length > 0 && avgMarks < 50) || pendingAssignments.length >= 4) {
    statusTier = "HIGH ATTENTION";
    statusBadge = "danger";
    statusIcon = AlertOctagon;
    summaryText = "Critical risk detected across multiple metrics. Immediate faculty consultation recommended.";
  } else if ((totalLectures > 0 && overallAttendance < threshold) || (studentMarks.length > 0 && avgMarks < 65) || pendingAssignments.length >= 2) {
    statusTier = "NEEDS ATTENTION";
    statusBadge = "warning";
    statusIcon = AlertTriangle;
    summaryText = "One or more metrics are trailing behind institutional benchmarks. Action is required.";
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div>
        <h2 style={{ fontSize: "1.5rem", fontWeight: "800", color: "var(--text-main)" }}>
          Academic Health & Performance Indicator
        </h2>
        <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "4px" }}>
          Transparent, rule-based academic status combining attendance, internal marks, and assignment completion
        </p>
      </div>

      {/* Hero Status Banner */}
      <div
        className="card"
        style={{
          borderLeft: `6px solid ${statusTier === "GOOD" ? "#10b981" : statusTier === "NEEDS ATTENTION" ? "#f59e0b" : "#ef4444"}`,
          background: statusTier === "GOOD" ? "#f0fdf4" : statusTier === "NEEDS ATTENTION" ? "#fffbeb" : "#fef2f2"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "12px",
                background: statusTier === "GOOD" ? "#dcfce7" : statusTier === "NEEDS ATTENTION" ? "#fef3c7" : "#fee2e2",
                color: statusTier === "GOOD" ? "#15803d" : statusTier === "NEEDS ATTENTION" ? "#b45309" : "#b91c1c",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <Activity size={32} />
            </div>
            <div>
              <div style={{ fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)" }}>
                Current Institutional Evaluation
              </div>
              <h3 style={{ fontSize: "1.6rem", fontWeight: "800", color: statusTier === "GOOD" ? "#166534" : statusTier === "NEEDS ATTENTION" ? "#92400e" : "#991b1b" }}>
                {statusTier}
              </h3>
              <p style={{ fontSize: "0.88rem", color: "var(--text-main)", marginTop: "4px" }}>
                {summaryText}
              </p>
            </div>
          </div>

          <Badge variant={statusBadge} icon={statusIcon}>
            {statusTier}
          </Badge>
        </div>
      </div>

      {/* 3 Pillars of Evaluation */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
        
        {/* Attendance Pillar */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <CalendarCheck size={18} color="var(--primary-600)" />
              1. Attendance Pillar
            </div>
            <Badge variant={overallAttendance >= threshold ? "success" : "danger"}>
              {overallAttendance}%
            </Badge>
          </div>
          <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "12px" }}>
            Mandatory cutoff: <strong>{threshold}%</strong>
          </div>
          <div style={{ height: "8px", background: "#e2e8f0", borderRadius: "4px", overflow: "hidden", marginBottom: "12px" }}>
            <div
              style={{
                height: "100%",
                width: `${overallAttendance}%`,
                background: overallAttendance >= threshold ? "var(--success-solid)" : "var(--danger-solid)"
              }}
            />
          </div>
          <div style={{ fontSize: "0.78rem", color: overallAttendance >= threshold ? "var(--success-text)" : "var(--danger-text)", fontWeight: "600" }}>
            {overallAttendance >= threshold ? "✓ Criteria Satisfied" : `⚠️ Defaulter: ${(threshold - overallAttendance).toFixed(1)}% below required`}
          </div>
        </div>

        {/* Marks Pillar */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Award size={18} color="var(--primary-600)" />
              2. Internal Marks Pillar
            </div>
            <Badge variant={avgMarks >= 65 ? "success" : avgMarks >= 50 ? "warning" : "danger"}>
              {avgMarks}%
            </Badge>
          </div>
          <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "12px" }}>
            Benchmark expectation: <strong>60%</strong>
          </div>
          <div style={{ height: "8px", background: "#e2e8f0", borderRadius: "4px", overflow: "hidden", marginBottom: "12px" }}>
            <div
              style={{
                height: "100%",
                width: `${avgMarks}%`,
                background: avgMarks >= 65 ? "var(--success-solid)" : avgMarks >= 50 ? "var(--warning-solid)" : "var(--danger-solid)"
              }}
            />
          </div>
          <div style={{ fontSize: "0.78rem", color: avgMarks >= 60 ? "var(--success-text)" : "var(--warning-text)", fontWeight: "600" }}>
            {avgMarks >= 60 ? "✓ Above benchmark target" : "⚠️ Needs academic revision"}
          </div>
        </div>

        {/* Assignments Pillar */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <BookOpen size={18} color="var(--primary-600)" />
              3. Coursework Pillar
            </div>
            <Badge variant={pendingAssignments.length === 0 ? "success" : "warning"}>
              {pendingAssignments.length} Pending
            </Badge>
          </div>
          <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "12px" }}>
            Total coursework assignments: <strong>{assignments.length}</strong>
          </div>
          <div style={{ height: "8px", background: "#e2e8f0", borderRadius: "4px", overflow: "hidden", marginBottom: "12px" }}>
            <div
              style={{
                height: "100%",
                width: `${((assignments.length - pendingAssignments.length) / assignments.length) * 100}%`,
                background: pendingAssignments.length === 0 ? "var(--success-solid)" : "var(--warning-solid)"
              }}
            />
          </div>
          <div style={{ fontSize: "0.78rem", color: pendingAssignments.length === 0 ? "var(--success-text)" : "var(--warning-text)", fontWeight: "600" }}>
            {pendingAssignments.length === 0 ? "✓ 100% Coursework Submitted" : `⚠️ ${pendingAssignments.length} Assignment(s) due`}
          </div>
        </div>
      </div>

      {/* Transparent Rules Card */}
      <div className="card" style={{ background: "var(--bg-surface-secondary)" }}>
        <div className="card-title" style={{ marginBottom: "10px", fontSize: "0.95rem" }}>
          <HelpCircle size={16} color="var(--primary-600)" />
          How is this Academic Status Calculated?
        </div>
        <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", lineHeight: 1.6 }}>
          This status is a purely deterministic academic progress indicator based transparently on verified database thresholds: Attendance (&gt;={threshold}%), Assessment average (&gt;=60%), and active assignment deadlines. It provides early feedback to help students and mentors take corrective steps before semester exams.
        </p>
      </div>
    </div>
  );
}

import React, { useState } from "react";
import { useSmartCampus } from "../../context/SmartCampusContext";
import {
  CalendarCheck,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Smartphone,
  ShieldAlert,
  MessageSquare
} from "lucide-react";
import { Badge } from "../common/UIPrimitives";

export default function ParentAttendance() {
  const { currentUser, users, attendance, subjects, attendanceLogs, systemSettings } = useSmartCampus();

  const parent = currentUser;
  const ward = users.find((u) => u.id === parent?.studentId) || users[0];
  const threshold = systemSettings.attendanceThreshold;

  const wardAtt = attendance[ward?.id] || {};
  let totalClasses = 0;
  let totalAttended = 0;

  const subjectRows = subjects.map((sub) => {
    const sData = wardAtt[sub.id] || { total: 20, attended: 16, percentage: 80 };
    totalClasses += sData.total;
    totalAttended += sData.attended;
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
      missed: sData.total - sData.attended,
      percentage: sData.percentage,
      isBelow,
      requiredLectures
    };
  });

  const overallPct = totalClasses > 0 ? Math.round((totalAttended / totalClasses) * 1000) / 10 : 0;
  const myWardLogs = attendanceLogs.filter((l) => l.studentId === ward?.id);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: "800", color: "var(--text-main)" }}>
            Ward Attendance & Absence History: {ward?.name}
          </h2>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "4px" }}>
            Real-time verified lecture attendance, absence alerts, and recovery targets
          </p>
        </div>

        <Badge variant={overallPct >= threshold ? "success" : "danger"}>
          Overall Ward Attendance: {overallPct}%
        </Badge>
      </div>

      {/* Summary Card */}
      <div className="card" style={{ background: overallPct < threshold ? "#fef2f2" : "#f0fdf4", border: `1px solid ${overallPct < threshold ? "#fecaca" : "#bbf7d0"}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "12px",
              background: overallPct < threshold ? "#fee2e2" : "#dcfce7",
              color: overallPct < threshold ? "#dc2626" : "#15803d",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            {overallPct < threshold ? <AlertTriangle size={28} /> : <CheckCircle2 size={28} />}
          </div>

          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: "1.2rem", fontWeight: "800", color: overallPct < threshold ? "#991b1b" : "#166534" }}>
              {overallPct < threshold ? "⚠️ Attendance Warning: Immediate Action Required" : "✓ Attendance Satisfactory"}
            </h3>
            <p style={{ fontSize: "0.85rem", color: overallPct < threshold ? "#7f1d1d" : "#14532d", marginTop: "2px" }}>
              {overallPct < threshold
                ? `Rahul's attendance (${overallPct}%) is currently below the institutional ${threshold}% threshold. Please ensure regular attendance to avoid exam debarment.`
                : `Rahul has attended ${totalAttended} out of ${totalClasses} lectures (${overallPct}%). All requirements met.`}
            </p>
          </div>
        </div>
      </div>

      {/* Subject Table */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <CalendarCheck size={18} color="var(--primary-600)" />
            Subject-wise Attendance & Recovery Target
          </div>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Subject Name</th>
                <th>Course Code</th>
                <th>Attended / Total</th>
                <th>Missed Lectures</th>
                <th>Attendance %</th>
                <th>Compliance Status</th>
                <th>Recovery Target</th>
              </tr>
            </thead>
            <tbody>
              {subjectRows.map((row) => (
                <tr key={row.id} style={{ background: row.isBelow ? "#fff1f2" : undefined }}>
                  <td>
                    <strong>{row.name}</strong>
                  </td>
                  <td>
                    <Badge variant="gray">{row.code}</Badge>
                  </td>
                  <td>
                    <strong>{row.attended}</strong> / {row.total}
                  </td>
                  <td>
                    <span style={{ color: row.missed > 5 ? "var(--danger-solid)" : "var(--text-muted)", fontWeight: row.missed > 5 ? "700" : "normal" }}>
                      {row.missed} Missed
                    </span>
                  </td>
                  <td>
                    <strong style={{ color: row.isBelow ? "#991b1b" : "var(--text-main)" }}>
                      {row.percentage}%
                    </strong>
                  </td>
                  <td>
                    {row.isBelow ? (
                      <Badge variant="danger" icon={AlertTriangle}>Below {threshold}%</Badge>
                    ) : (
                      <Badge variant="success" icon={CheckCircle2}>Safe</Badge>
                    )}
                  </td>
                  <td>
                    {row.isBelow ? (
                      <span style={{ fontSize: "0.8rem", color: "#b91c1c", fontWeight: "700" }}>
                        ⚠️ Must attend next {row.requiredLectures} lectures
                      </span>
                    ) : (
                      <span style={{ fontSize: "0.8rem", color: "var(--success-text)" }}>
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

      {/* Verified Absence Log */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <Clock size={18} color="var(--primary-600)" />
            Verified Lecture Log & Absence Notices
          </div>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Subject</th>
                <th>Status</th>
                <th>Marked By Faculty</th>
                <th>Parent SMS / WhatsApp Status</th>
              </tr>
            </thead>
            <tbody>
              {myWardLogs.map((log) => (
                <tr key={log.id}>
                  <td>
                    <strong>{log.date}</strong> ({log.time})
                  </td>
                  <td>{log.subjectName}</td>
                  <td>
                    {log.status === "Present" ? (
                      <Badge variant="success">Present</Badge>
                    ) : (
                      <Badge variant="danger" icon={AlertTriangle}>Marked Absent</Badge>
                    )}
                  </td>
                  <td>{log.markedBy}</td>
                  <td>
                    <span style={{ fontSize: "0.78rem", color: log.status === "Absent" ? "#dc2626" : "var(--text-muted)", fontWeight: "600" }}>
                      {log.status === "Absent" ? "📱 Immediate SMS & WhatsApp Dispatched" : "Logged in portal"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

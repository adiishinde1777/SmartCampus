import React, { useState } from "react";
import { useSmartCampus } from "../../context/SmartCampusContext";
import {
  CalendarCheck,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Smartphone,
  ShieldAlert,
  MessageSquare,
  Stethoscope,
  FileText
} from "lucide-react";
import { Badge } from "../common/UIPrimitives";

export default function ParentAttendance({ onNavigate }) {
  const { currentUser, users, attendance, subjects, attendanceLogs, systemSettings } = useSmartCampus();

  const parent = currentUser;
  const ward = users.find((u) => u.id === parent?.studentId) || users[0];
  const threshold = systemSettings.attendanceThreshold;

  const wardAtt = attendance[ward?.id] || {};
  let totalClasses = 0;
  let totalAttended = 0;
  let totalTheoryClasses = 0;
  let totalTheoryAttended = 0;
  let totalPracticalClasses = 0;
  let totalPracticalAttended = 0;

  const subjectRows = (subjects || []).map((sub) => {
    const sData = wardAtt[sub.id] || { total: 20, attended: 16, percentage: 80 };
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
      missed: sData.total - sData.attended,
      percentage: sData.percentage,
      isBelow,
      requiredLectures
    };
  });

  const overallPct = totalClasses > 0 ? Math.round((totalAttended / totalClasses) * 1000) / 10 : 0;
  const overallTheoryPct = totalTheoryClasses > 0 ? Math.round((totalTheoryAttended / totalTheoryClasses) * 1000) / 10 : overallPct;
  const overallPracticalPct = totalPracticalClasses > 0 ? Math.round((totalPracticalAttended / totalPracticalClasses) * 1000) / 10 : overallPct;
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
            Real-time verified lecture attendance, practical sessions, absence alerts, and recovery targets
          </p>
        </div>

        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <Badge variant={overallPct >= threshold ? "success" : "danger"}>
            Overall: {overallPct}%
          </Badge>
          <Badge variant="primary">
            Theory: {overallTheoryPct}%
          </Badge>
          <Badge variant="purple">
            Practical: {overallPracticalPct}%
          </Badge>
        </div>
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
                ? `${ward?.name ? ward.name.split(" ")[0] : "Aditya"}'s attendance (${overallPct}%) is currently below the institutional ${threshold}% threshold. Please ensure regular attendance to avoid exam debarment.`
                : `${ward?.name ? ward.name.split(" ")[0] : "Aditya"} has attended ${totalAttended} out of ${totalClasses} lectures (${overallPct}%). All requirements met.`}
            </p>
          </div>
        </div>
      </div>

      {/* Doctor's Letter Absence Condonation Banner */}
      <div
        className="card"
        style={{
          background: "linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)",
          border: "1px solid #a7f3d0",
          padding: "16px 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "14px"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "10px",
              background: "#dcfce7",
              color: "#059669",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0
            }}
          >
            <Stethoscope size={22} />
          </div>
          <div>
            <div style={{ fontWeight: "800", color: "#065f46", fontSize: "0.95rem" }}>
              Medical Absence Condonation
            </div>
            <div style={{ fontSize: "0.82rem", color: "#047857", marginTop: "2px" }}>
              Was your ward absent due to illness, fever, or medical consultation? Upload a doctor's letter to request official attendance excusal.
            </div>
          </div>
        </div>

        {onNavigate && (
          <button
            onClick={() => onNavigate("doctor-letters")}
            className="btn btn-sm"
            style={{
              background: "#059669",
              color: "white",
              fontWeight: "700",
              border: "none",
              boxShadow: "0 2px 8px rgba(5, 150, 105, 0.3)"
            }}
          >
            <FileText size={14} /> Upload Doctor's Letter
          </button>
        )}
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
                <th>📘 Theory</th>
                <th>🔬 Practical</th>
                <th>Overall Attendance</th>
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
                    <span style={{ fontSize: "0.82rem", fontWeight: "700", color: "#1d4ed8" }}>
                      {row.theoryPercentage}% ({row.theoryAttended}/{row.theoryTotal})
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: "0.82rem", fontWeight: "700", color: "#047857" }}>
                      {row.practicalPercentage}% ({row.practicalAttended}/{row.practicalTotal})
                    </span>
                  </td>
                  <td>
                    <strong style={{ color: row.isBelow ? "#991b1b" : "var(--text-main)" }}>
                      {row.percentage}%
                    </strong>
                    <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginLeft: "4px" }}>
                      ({row.attended}/{row.total})
                    </span>
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
              {(myWardLogs || []).map((log) => (
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

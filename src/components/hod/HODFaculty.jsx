import React, { useState } from "react";
import { useSmartCampus } from "../../context/SmartCampusContext";
import {
  GraduationCap,
  CalendarCheck,
  CheckCircle2,
  Clock,
  BookOpen,
  Phone,
  Mail,
  Send
} from "lucide-react";
import { Badge } from "../common/UIPrimitives";

export default function HODFaculty() {
  const { users, subjects } = useSmartCampus();

  const deptTeachers = users.filter((u) => u.role === "teacher" && u.departmentId === "dept-ce");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div>
        <h2 style={{ fontSize: "1.5rem", fontWeight: "800", color: "var(--text-main)" }}>
          Department Faculty Tracking & Lecture Compliance
        </h2>
        <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "4px" }}>
          Monitor daily lecture attendance submissions, assigned teaching load, and faculty contact records
        </p>
      </div>

      {/* Faculty Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: "20px" }}>
        {deptTeachers.map((tea, idx) => {
          const teaSubjects = subjects.filter((s) => s.teacherId === tea.id || s.teacherName === tea.name);

          return (
            <div key={tea.id} className="card" style={{ borderTop: "4px solid var(--primary-600)" }}>
              <div style={{ display: "flex", gap: "16px", alignItems: "center", marginBottom: "16px" }}>
                <img
                  src={tea.avatar}
                  alt={tea.name}
                  style={{ width: "56px", height: "56px", borderRadius: "50%", objectFit: "cover", border: "2px solid #e2e8f0" }}
                />
                <div>
                  <h3 style={{ fontSize: "1.15rem", fontWeight: "700" }}>{tea.name}</h3>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{tea.designation}</div>
                  <div style={{ fontSize: "0.75rem", color: "#047857", fontWeight: "600", marginTop: "2px" }}>
                    ✓ Today's Attendance Submitted (10:05 AM)
                  </div>
                </div>
              </div>

              <div style={{ background: "var(--bg-surface-secondary)", padding: "12px", borderRadius: "8px", fontSize: "0.82rem", display: "flex", flexDirection: "column", gap: "8px", marginBottom: "16px" }}>
                <div>
                  <span style={{ color: "var(--text-muted)" }}>Assigned Subjects:</span>
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "4px" }}>
                    {teaSubjects.map((s) => (
                      <Badge key={s.id} variant="purple">{s.name}</Badge>
                    ))}
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px" }}>
                  <span style={{ color: "var(--text-muted)" }}>Email:</span>
                  <strong>{tea.email}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-muted)" }}>Phone:</span>
                  <strong>{tea.phone}</strong>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Badge variant="success" icon={CheckCircle2}>100% Attendance Compliant</Badge>
                <button
                  onClick={() => alert(`Sending message to ${tea.name}...`)}
                  className="btn btn-secondary btn-sm"
                >
                  <Send size={12} /> Contact
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

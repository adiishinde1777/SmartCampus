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
  const { currentUser, users, subjects, departments, addToast } = useSmartCampus();

  const deptId = currentUser?.departmentId || "dept-vlsi";
  const activeDept = departments.find((d) => d.id === deptId) || {
    id: deptId,
    name: currentUser?.departmentName || "Electronic Engineering (VLSI Design And Technology)"
  };

  const deptTeachers = users.filter((u) => u.role === "teacher" && u.departmentId === deptId);

  const handleContact = (teacherName) => {
    addToast(
      "Communication Dispatched",
      `Official departmental memo sent to ${teacherName}.`,
      "info"
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: "800", color: "var(--text-main)" }}>
            Department Faculty Tracking & Lecture Compliance
          </h2>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "4px" }}>
            Monitor daily lecture attendance submissions, assigned teaching load, and faculty records for {activeDept.name}
          </p>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: "rgba(99, 102, 241, 0.08)",
            border: "1px solid rgba(99, 102, 241, 0.25)",
            padding: "7px 14px",
            borderRadius: "10px",
            fontSize: "0.85rem",
            fontWeight: "700",
            color: "var(--primary-700)"
          }}
        >
          <span>Dept Faculty: <strong>{deptTeachers.length} Active</strong></span>
        </div>
      </div>

      {/* Faculty Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: "20px" }}>
        {deptTeachers.map((tea) => {
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
                  onClick={() => handleContact(tea.name)}
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

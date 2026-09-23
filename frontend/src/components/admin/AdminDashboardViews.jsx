import React, { useState } from "react";
import { useSmartCampus } from "../../context/SmartCampusContext";
import {
  ShieldCheck,
  Users,
  Building2,
  BookOpen,
  CalendarCheck,
  FileText,
  Settings,
  AlertOctagon,
  TrendingUp,
  Save,
  CheckCircle2
} from "lucide-react";
import { StatCard, Badge } from "../common/UIPrimitives";

export function AdminDashboard({ onNavigate }) {
  const { users, departments, subjects, complaints, auditLogs, systemSettings } = useSmartCampus();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header Banner */}
      <div
        style={{
          background: "linear-gradient(135deg, #0e7490 0%, #0f172a 100%)",
          borderRadius: "16px",
          padding: "24px 32px",
          color: "white",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
          boxShadow: "0 10px 25px -5px rgba(14, 116, 144, 0.3)"
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
            <Badge variant="info">Master System Administration</Badge>
            <span style={{ fontSize: "0.8rem", color: "#cffafe" }}>ERP Control Engine</span>
          </div>
          <h2 style={{ fontSize: "1.75rem", fontWeight: "800", color: "white" }}>
            Admin Management Console
          </h2>
          <p style={{ fontSize: "0.9rem", color: "#e0f2fe", marginTop: "2px" }}>
            Configure academic policies, attendance thresholds, user roles, and monitor live audit trails
          </p>
        </div>

        <button
          onClick={() => onNavigate("threshold")}
          className="btn btn-primary btn-lg"
          style={{ background: "#0891b2", borderColor: "#0e7490" }}
        >
          <ShieldCheck size={18} />
          <span>Configure Attendance Threshold ({systemSettings.attendanceThreshold}%)</span>
        </button>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <StatCard
          label="Total Registered Users"
          value={users.length}
          subtext="Students, Teachers, Parents, HODs"
          icon={Users}
          variant="primary"
          onClick={() => onNavigate("users")}
        />

        <StatCard
          label="Academic Departments"
          value={departments.length}
          subtext="Configured engineering programs"
          icon={Building2}
          variant="purple"
          onClick={() => onNavigate("departments")}
        />

        <StatCard
          label="Attendance Threshold"
          value={`${systemSettings.attendanceThreshold}%`}
          subtext="Institutional mandatory cutoff"
          icon={ShieldCheck}
          variant="warning"
          onClick={() => onNavigate("threshold")}
        />

        <StatCard
          label="Audit Log Entries"
          value={auditLogs.length}
          subtext="Immutable system action trail"
          icon={FileText}
          variant="success"
          onClick={() => onNavigate("audit-logs")}
        />
      </div>

      {/* Stakeholder Data Management & Edit Hub */}
      <div className="card" style={{ padding: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
          <div>
            <div className="card-title" style={{ fontSize: "1.1rem" }}>
              <Users size={20} color="var(--primary-600)" />
              Stakeholder Data Management & Quick Edit Hub
            </div>
            <div className="card-subtitle">
              Direct access to edit profiles, credentials, academic details, and parent connections for all 6 roles
            </div>
          </div>
          <button
            onClick={() => onNavigate("users")}
            className="btn btn-primary btn-sm"
            style={{ display: "flex", alignItems: "center", gap: "6px" }}
          >
            <span>Open Full User Directory</span>
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px" }}>
          {[
            { role: "student", label: "Students", desc: "Roll No, Sem, CGPA, Mentor, Parent Link", color: "#2563eb", bg: "#eff6ff", count: users.filter(u => u.role === "student").length },
            { role: "teacher", label: "Teachers & Faculty", desc: "Designation, Subjects, Divisions", color: "#7c3aed", bg: "#f5f3ff", count: users.filter(u => u.role === "teacher").length },
            { role: "parent", label: "Parents & Guardians", desc: "Ward Linkage, Phone, Occupation", color: "#d97706", bg: "#fffbeb", count: users.filter(u => u.role === "parent").length },
            { role: "hod", label: "HODs", desc: "Dept Leadership, Faculty Oversight", color: "#0891b2", bg: "#ecfeff", count: users.filter(u => u.role === "hod").length },
            { role: "principal", label: "Principal", desc: "College Leadership & Directorship", color: "#059669", bg: "#ecfdf5", count: users.filter(u => u.role === "principal").length },
            { role: "admin", label: "System Admins", desc: "ERP Masters & Security Policies", color: "#dc2626", bg: "#fef2f2", count: users.filter(u => u.role === "admin").length }
          ].map((cat) => (
            <div
              key={cat.role}
              onClick={() => onNavigate("users")}
              style={{
                background: cat.bg,
                border: `1px solid ${cat.color}30`,
                borderRadius: "12px",
                padding: "16px",
                cursor: "pointer",
                transition: "transform 0.15s ease, box-shadow 0.15s ease",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: "10px"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 6px 16px rgba(0,0,0,0.08)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "none";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontWeight: "700", color: "var(--text-main)", fontSize: "0.95rem" }}>{cat.label}</span>
                  <span style={{ background: "white", padding: "2px 8px", borderRadius: "12px", fontWeight: "800", color: cat.color, fontSize: "0.85rem", border: `1px solid ${cat.color}40` }}>
                    {cat.count}
                  </span>
                </div>
                <p style={{ fontSize: "0.74rem", color: "var(--text-muted)", marginTop: "6px", lineHeight: "1.4" }}>
                  {cat.desc}
                </p>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.78rem", fontWeight: "700", color: cat.color }}>
                <span>Edit & Manage Data →</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent System Activity Logs */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">
              <FileText size={18} color="var(--primary-600)" />
              Recent System Action Audit Trail
            </div>
            <div className="card-subtitle">Real-time trace of faculty attendance, marks uploads, and admin policy updates</div>
          </div>
          <button
            onClick={() => onNavigate("audit-logs")}
            style={{ background: "none", border: "none", color: "var(--primary-600)", fontSize: "0.8rem", fontWeight: "600", cursor: "pointer" }}
          >
            View Complete Audit Log
          </button>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Actor User & Role</th>
                <th>Action Taken</th>
                <th>Details & Scope</th>
                <th>Module</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.slice(0, 5).map((log) => (
                <tr key={log.id}>
                  <td>
                    <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontFamily: "monospace" }}>
                      {log.timestamp}
                    </span>
                  </td>
                  <td>
                    <strong>{log.user}</strong>
                    <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{log.role}</div>
                  </td>
                  <td>
                    <Badge variant="purple">{log.action}</Badge>
                  </td>
                  <td>
                    <span style={{ fontSize: "0.85rem" }}>{log.details}</span>
                  </td>
                  <td>
                    <Badge variant="gray">{log.module}</Badge>
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

export function AdminAttendanceThreshold() {
  const { systemSettings, updateSystemSettings } = useSmartCampus();

  const [threshold, setThreshold] = useState(systemSettings.attendanceThreshold);
  const [academicYear, setAcademicYear] = useState(systemSettings.academicYear);
  const [smsEnabled, setSmsEnabled] = useState(systemSettings.smsNotificationsEnabled);
  const [whatsappEnabled, setWhatsappEnabled] = useState(systemSettings.whatsappNotificationsEnabled);

  const handleSave = (e) => {
    e.preventDefault();
    updateSystemSettings({
      attendanceThreshold: Number(threshold),
      academicYear,
      smsNotificationsEnabled: smsEnabled,
      whatsappNotificationsEnabled: whatsappEnabled
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "800px" }}>
      <div>
        <h2 style={{ fontSize: "1.5rem", fontWeight: "800", color: "var(--text-main)" }}>
          Attendance Policy & Warning Threshold Engine
        </h2>
        <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "4px" }}>
          Dynamic configurable cutoff rule. Adjusting this slider immediately recalculates defaulter radars across student, parent, teacher, HOD, and principal portals.
        </p>
      </div>

      <div className="card">
        <form onSubmit={handleSave}>
          <div style={{ background: "linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%)", padding: "20px", borderRadius: "12px", border: "1px solid #bfdbfe", marginBottom: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <label className="form-label" style={{ fontSize: "1rem" }}>
                Mandatory Attendance Threshold:
              </label>
              <span style={{ fontSize: "1.8rem", fontWeight: "800", color: "var(--primary-700)" }}>
                {threshold}%
              </span>
            </div>

            <input
              type="range"
              min="50"
              max="90"
              step="1"
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              style={{ width: "100%", height: "8px", accentColor: "var(--primary-600)", cursor: "pointer" }}
            />

            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "6px" }}>
              <span>50% (Lenient)</span>
              <span>75% (Standard AICTE Benchmark)</span>
              <span>90% (Strict)</span>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Active Academic Year</label>
            <input
              type="text"
              className="form-control"
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              required
            />
          </div>

          <div style={{ marginTop: "20px", borderTop: "1px solid var(--border-subtle)", paddingTop: "16px" }}>
            <h4 style={{ fontSize: "0.95rem", fontWeight: "700", marginBottom: "12px" }}>
              Automated Communication Channels
            </h4>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "0.88rem", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={whatsappEnabled}
                  onChange={(e) => setWhatsappEnabled(e.target.checked)}
                  style={{ width: "16px", height: "16px", accentColor: "#059669" }}
                />
                <span>Enable Automated WhatsApp Absence Alerts to Parents</span>
              </label>

              <label style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "0.88rem", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={smsEnabled}
                  onChange={(e) => setSmsEnabled(e.target.checked)}
                  style={{ width: "16px", height: "16px", accentColor: "var(--primary-600)" }}
                />
                <span>Enable SMS Gateway Fallback Alerts</span>
              </label>
            </div>
          </div>

          <div style={{ marginTop: "24px" }}>
            <button type="submit" className="btn btn-primary btn-lg" style={{ width: "100%" }}>
              <Save size={18} />
              <span>Save & Apply System-Wide Configuration</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

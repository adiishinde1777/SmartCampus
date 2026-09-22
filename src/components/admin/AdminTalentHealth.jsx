import React, { useState } from "react";
import { useSmartCampus } from "../../context/SmartCampusContext";
import {
  ShieldCheck,
  FileText,
  Clock,
  User,
  Activity,
  AlertTriangle,
  Sparkles,
  Calendar,
  Lock,
  Search,
  Filter
} from "lucide-react";
import { Badge } from "../common/UIPrimitives";

export default function AdminTalentHealth() {
  const {
    auditLogs,
    studentSkills,
    collegeEvents,
    studentHealthRecords,
    users
  } = useSmartCampus();

  const [activeTab, setActiveTab] = useState("audit");
  const [filterModule, setFilterModule] = useState("Health & Confidential");
  const [searchTerm, setSearchTerm] = useState("");

  // Audit logs filtering
  const filteredAuditLogs = auditLogs.filter((log) => {
    if (filterModule !== "All" && log.module !== filterModule) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        (log.user && log.user.toLowerCase().includes(q)) ||
        (log.action && log.action.toLowerCase().includes(q)) ||
        (log.details && log.details.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header Banner */}
      <div
        style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)",
          borderRadius: "16px",
          padding: "24px 32px",
          color: "white",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
          boxShadow: "0 10px 25px -5px rgba(15, 23, 42, 0.4)"
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
            <span style={{ background: "rgba(255,255,255,0.15)", padding: "4px 10px", borderRadius: "20px", fontSize: "0.75rem", fontWeight: "700" }}>
              SECURITY & COMPLIANCE
            </span>
          </div>
          <h2 style={{ fontSize: "1.75rem", fontWeight: "800", color: "white" }}>
            Talent & Sensitive Health Admin 🛡️
          </h2>
          <p style={{ fontSize: "0.9rem", color: "#cbd5e1", marginTop: "4px" }}>
            Audit trails, confidential health access records, and talent system governance.
          </p>
        </div>
      </div>

      {/* Security Status Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
        <div className="card" style={{ padding: "18px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--primary-600)", fontWeight: "700", fontSize: "0.85rem" }}>
            <Lock size={16} /> Health Access Control
          </div>
          <div style={{ fontSize: "1.2rem", fontWeight: "800", color: "var(--text-main)", marginTop: "6px" }}>
            Strict RBAC Active
          </div>
          <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "4px" }}>
            Public API isolation enabled. Zero medical data leaked to public student lists.
          </p>
        </div>

        <div className="card" style={{ padding: "18px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--success-solid)", fontWeight: "700", fontSize: "0.85rem" }}>
            <FileText size={16} /> Audit Log Integrity
          </div>
          <div style={{ fontSize: "1.2rem", fontWeight: "800", color: "var(--text-main)", marginTop: "6px" }}>
            {auditLogs.filter((l) => l.module === "Health & Confidential").length} Sensitive Actions Logged
          </div>
          <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "4px" }}>
            All medical record views, uploads, and verifications recorded.
          </p>
        </div>

        <div className="card" style={{ padding: "18px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--accent-purple)", fontWeight: "700", fontSize: "0.85rem" }}>
            <ShieldCheck size={16} /> Max Document Quota
          </div>
          <div style={{ fontSize: "1.2rem", fontWeight: "800", color: "var(--text-main)", marginTop: "6px" }}>
            5.0 MB Limit
          </div>
          <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "4px" }}>
            Supported formats: PDF, JPG, JPEG, PNG with validation.
          </p>
        </div>
      </div>

      {/* Filter and Audit Log Viewer */}
      <div className="card" style={{ padding: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", marginBottom: "16px" }}>
          <div className="card-title">
            <Clock size={18} color="var(--primary-600)" />
            Confidential Health & Talent Audit Log
          </div>

          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <select
              className="form-control"
              style={{ width: "200px", fontSize: "0.82rem" }}
              value={filterModule}
              onChange={(e) => setFilterModule(e.target.value)}
            >
              <option value="All">All Modules</option>
              <option value="Health & Confidential">Health & Confidential</option>
              <option value="Talent & Skills">Talent & Skills</option>
              <option value="Events & Teams">Events & Teams</option>
            </select>

            <input
              type="text"
              className="form-control"
              style={{ width: "180px", fontSize: "0.82rem" }}
              placeholder="Search user or action..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>User / Actor</th>
                <th>Role</th>
                <th>Action</th>
                <th>Module</th>
                <th>Log Audit Details</th>
              </tr>
            </thead>
            <tbody>
              {filteredAuditLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", color: "var(--text-muted)", padding: "24px" }}>
                    No audit records found matching this module.
                  </td>
                </tr>
              ) : (
                filteredAuditLogs.map((log) => (
                  <tr key={log.id}>
                    <td style={{ whiteSpace: "nowrap", fontSize: "0.8rem", color: "var(--text-muted)" }}>
                      {log.timestamp}
                    </td>
                    <td>
                      <strong>{log.user}</strong>
                    </td>
                    <td>
                      <span
                        style={{
                          padding: "2px 8px",
                          borderRadius: "8px",
                          fontSize: "0.72rem",
                          fontWeight: "700",
                          background: "var(--bg-surface-secondary)",
                          color: "var(--text-main)"
                        }}
                      >
                        {log.role}
                      </span>
                    </td>
                    <td>
                      <strong style={{ fontSize: "0.82rem", color: log.module === "Health & Confidential" ? "#991b1b" : "var(--primary-700)" }}>
                        {log.action}
                      </strong>
                    </td>
                    <td>
                      <span
                        style={{
                          padding: "2px 8px",
                          borderRadius: "8px",
                          fontSize: "0.72rem",
                          fontWeight: "700",
                          background: log.module === "Health & Confidential" ? "#fef2f2" : "var(--primary-50)",
                          color: log.module === "Health & Confidential" ? "#991b1b" : "var(--primary-700)"
                        }}
                      >
                        {log.module}
                      </span>
                    </td>
                    <td style={{ fontSize: "0.82rem" }}>
                      {log.details}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

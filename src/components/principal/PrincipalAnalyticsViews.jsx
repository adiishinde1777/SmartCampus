import React from "react";
import { useSmartCampus } from "../../context/SmartCampusContext";
import {
  CalendarCheck,
  TrendingUp,
  BarChart3,
  AlertTriangle,
  Building2,
  Users
} from "lucide-react";
import { Badge, StatCard } from "../common/UIPrimitives";

export function PrincipalAttendanceAnalytics() {
  const { departments, systemSettings } = useSmartCampus();
  const threshold = systemSettings.attendanceThreshold;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div>
        <h2 style={{ fontSize: "1.5rem", fontWeight: "800", color: "var(--text-main)" }}>
          Institution-Wide Attendance Analytics & Trends
        </h2>
        <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "4px" }}>
          Comparative analytics across engineering departments with defaulter tracking
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Building2 size={18} color="var(--primary-600)" />
              Department Attendance Compliance Ranking
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {departments.map((d, idx) => (
              <div key={d.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", background: "var(--bg-surface-secondary)", borderRadius: "8px" }}>
                <div>
                  <div style={{ fontWeight: "700" }}>#{idx + 1} {d.name}</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>HOD: {d.hod} • {d.studentCount} Students</div>
                </div>
                <Badge variant={d.avgAttendance >= threshold ? "success" : "danger"}>
                  {d.avgAttendance}%
                </Badge>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <AlertTriangle size={18} color="#ef4444" />
              Institutional Defaulter Breakdown (&lt;{threshold}%)
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
              Total 118 students currently fall below the mandatory {threshold}% threshold. Automated weekly SMS and WhatsApp notifications are dispatched to parents.
            </p>

            <div style={{ padding: "12px", background: "#fef2f2", borderRadius: "8px", border: "1px solid #fecaca" }}>
              <div style={{ fontWeight: "700", color: "#991b1b" }}>Computer Engineering: 28 Students</div>
              <div style={{ fontSize: "0.75rem", color: "#7f1d1d" }}>Includes Rahul Patil, Aditya Kulkarni</div>
            </div>

            <div style={{ padding: "12px", background: "#fef2f2", borderRadius: "8px", border: "1px solid #fecaca" }}>
              <div style={{ fontWeight: "700", color: "#991b1b" }}>Mechanical Engineering: 42 Students</div>
              <div style={{ fontSize: "0.75rem", color: "#7f1d1d" }}>Remedial counseling underway</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PrincipalAcademicAnalytics() {
  const { departments } = useSmartCampus();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div>
        <h2 style={{ fontSize: "1.5rem", fontWeight: "800", color: "var(--text-main)" }}>
          College-Wide Academic Marks & Exam Analytics
        </h2>
        <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "4px" }}>
          Semester assessments, subject averages, and institutional pass percentages
        </p>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <TrendingUp size={18} color="var(--primary-600)" />
            Department Academic Performance Scorecards
          </div>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Department Name</th>
                <th>Head of Department</th>
                <th>Enrolled Strength</th>
                <th>Average CIE Score</th>
                <th>Distinction Rate</th>
                <th>Pass Percentage</th>
              </tr>
            </thead>
            <tbody>
              {departments.map((d) => (
                <tr key={d.id}>
                  <td><strong>{d.name}</strong></td>
                  <td>{d.hod}</td>
                  <td>{d.studentCount}</td>
                  <td><strong>{d.avgMarks}%</strong></td>
                  <td><Badge variant="purple">42%</Badge></td>
                  <td><Badge variant="success">96.4%</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

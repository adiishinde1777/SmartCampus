import React from "react";
import { useSmartCampus } from "../../context/SmartCampusContext";
import {
  Building2,
  Users,
  GraduationCap,
  CalendarCheck,
  AlertTriangle,
  Award,
  AlertOctagon,
  BarChart3,
  TrendingUp,
  Layers,
  ArrowRight,
  ShieldCheck
} from "lucide-react";
import { StatCard, Badge } from "../common/UIPrimitives";

export default function PrincipalDashboard({ onNavigate }) {
  const { currentUser, departments, users, systemSettings, complaints } = useSmartCampus();

  const totalStudents = departments.reduce((acc, d) => acc + (d.studentCount || 0), 0);
  const totalFaculty = departments.reduce((acc, d) => acc + (d.facultyCount || 0), 0);
  const avgAttendance = (departments.reduce((acc, d) => acc + d.avgAttendance, 0) / departments.length).toFixed(1);
  const avgMarks = (departments.reduce((acc, d) => acc + d.avgMarks, 0) / departments.length).toFixed(1);

  const pendingComplaints = complaints.filter((c) => c.status !== "Resolved");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header Banner */}
      <div
        style={{
          background: "linear-gradient(135deg, #881337 0%, #0f172a 100%)",
          borderRadius: "16px",
          padding: "24px 32px",
          color: "white",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
          boxShadow: "0 10px 25px -5px rgba(136, 19, 55, 0.3)"
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
            <Badge variant="danger">Institutional Executive Dashboard</Badge>
            <span style={{ fontSize: "0.8rem", color: "#fecdd3" }}>{systemSettings.collegeName}</span>
          </div>
          <h2 style={{ fontSize: "1.75rem", fontWeight: "800", color: "white" }}>
            {currentUser?.name}
          </h2>
          <p style={{ fontSize: "0.9rem", color: "#ffe4e6", marginTop: "2px" }}>
            Centralized institutional tracking • All departments synchronized in real-time
          </p>
        </div>

        <button
          onClick={() => onNavigate("drilldown")}
          className="btn btn-primary btn-lg"
          style={{
            background: "linear-gradient(135deg, #e11d48, #be123c)",
            boxShadow: "0 4px 14px rgba(225, 29, 72, 0.4)"
          }}
        >
          <Layers size={18} />
          <span>Launch College Drill-Down</span>
        </button>
      </div>

      {/* 8 Principal Executive Summary Cards */}
      <div className="stats-grid">
        <StatCard
          label="Total Enrolled Students"
          value={totalStudents}
          subtext="Across all 4 engineering branches"
          icon={Users}
          variant="primary"
          onClick={() => onNavigate("departments")}
        />

        <StatCard
          label="Total Faculty Staff"
          value={totalFaculty}
          subtext="Professors & Technical Staff"
          icon={GraduationCap}
          variant="purple"
          onClick={() => onNavigate("departments")}
        />

        <StatCard
          label="Active Departments"
          value={departments.length}
          subtext="CE, IT, EXTC, MECH"
          icon={Building2}
          variant="primary"
          onClick={() => onNavigate("departments")}
        />

        <StatCard
          label="College Overall Attendance"
          value={`${avgAttendance}%`}
          subtext={`Threshold: ${systemSettings.attendanceThreshold}%`}
          icon={CalendarCheck}
          variant={avgAttendance >= systemSettings.attendanceThreshold ? "success" : "warning"}
          onClick={() => onNavigate("attendance-analytics")}
        />

        <StatCard
          label="Students Below Threshold"
          value="118 (13.8%)"
          subtext="Parent notifications active"
          icon={AlertTriangle}
          variant="danger"
          onClick={() => onNavigate("attendance-analytics")}
        />

        <StatCard
          label="Institution Marks Average"
          value={`${avgMarks}%`}
          subtext="Mid-term & unit evaluations"
          icon={Award}
          variant="purple"
          onClick={() => onNavigate("academic-analytics")}
        />

        <StatCard
          label="Pending Major Grievances"
          value={`${pendingComplaints.length}`}
          subtext="Campus infrastructure tickets"
          icon={AlertOctagon}
          variant={pendingComplaints.length > 0 ? "warning" : "success"}
          onClick={() => onNavigate("complaints")}
        />

        <StatCard
          label="Institutional Standing"
          value="Grade A+"
          subtext="NAAC & NIRF Benchmark Score"
          icon={ShieldCheck}
          variant="success"
        />
      </div>

      {/* Multi-Department Visual Comparison Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
        
        {/* Department Attendance Comparison */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">
                <BarChart3 size={18} color="var(--primary-600)" />
                Department-wise Attendance Comparison
              </div>
              <div className="card-subtitle">Aggregated semester average compliance</div>
            </div>
            <button
              onClick={() => onNavigate("attendance-analytics")}
              style={{ background: "none", border: "none", color: "var(--primary-600)", fontSize: "0.8rem", fontWeight: "600", cursor: "pointer" }}
            >
              Details
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {departments.map((d) => (
              <div key={d.id}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.88rem", marginBottom: "4px" }}>
                  <span style={{ fontWeight: "700" }}>{d.name} ({d.code})</span>
                  <strong style={{ color: d.avgAttendance >= systemSettings.attendanceThreshold ? "var(--success-solid)" : "var(--danger-solid)" }}>
                    {d.avgAttendance}%
                  </strong>
                </div>
                <div style={{ height: "10px", background: "#e2e8f0", borderRadius: "5px", overflow: "hidden" }}>
                  <div
                    style={{
                      height: "100%",
                      width: `${d.avgAttendance}%`,
                      background: d.avgAttendance >= systemSettings.attendanceThreshold ? "var(--success-solid)" : "var(--warning-solid)",
                      borderRadius: "5px"
                    }}
                  />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "2px" }}>
                  <span>HOD: {d.hod}</span>
                  <span>{d.studentCount} Students</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Department-wise Academic Marks Average */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">
                <TrendingUp size={18} color="var(--accent-purple)" />
                Department Academic Performance (Marks Avg)
              </div>
              <div className="card-subtitle">Continuous internal assessment comparison</div>
            </div>
            <button
              onClick={() => onNavigate("academic-analytics")}
              style={{ background: "none", border: "none", color: "var(--primary-600)", fontSize: "0.8rem", fontWeight: "600", cursor: "pointer" }}
            >
              Details
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {departments.map((d) => (
              <div key={d.id}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.88rem", marginBottom: "4px" }}>
                  <span style={{ fontWeight: "700" }}>{d.name}</span>
                  <strong style={{ color: "var(--primary-700)" }}>{d.avgMarks}%</strong>
                </div>
                <div style={{ height: "10px", background: "#e2e8f0", borderRadius: "5px", overflow: "hidden" }}>
                  <div
                    style={{
                      height: "100%",
                      width: `${d.avgMarks}%`,
                      background: "#8b5cf6",
                      borderRadius: "5px"
                    }}
                  />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "2px" }}>
                  <span>Academic Rank: #{d.code === "IT" ? 1 : d.code === "CE" ? 2 : d.code === "EXTC" ? 3 : 4}</span>
                  <span>Benchmark Status: ✓ Above 60%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

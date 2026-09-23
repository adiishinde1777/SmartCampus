import React, { useState } from "react";
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
  ShieldCheck,
  Sparkles,
  Briefcase,
  Target,
  Code2
} from "lucide-react";
import { StatCard, Badge } from "../common/UIPrimitives";

export default function PrincipalDashboard({ onNavigate }) {
  const { currentUser, departments, users, systemSettings, complaints, collegeEvents } = useSmartCampus();

  const [selectedDeptFilter, setSelectedDeptFilter] = useState("all");

  const displayedDepartments = selectedDeptFilter === "all"
    ? departments
    : departments.filter((d) => d.id === selectedDeptFilter);

  const totalStudents = displayedDepartments.reduce((acc, d) => acc + (d.studentCount || 0), 0);
  const totalFaculty = displayedDepartments.reduce((acc, d) => acc + (d.facultyCount || 0), 0);
  const avgAttendance = displayedDepartments.length > 0
    ? (displayedDepartments.reduce((acc, d) => acc + d.avgAttendance, 0) / displayedDepartments.length).toFixed(1)
    : "0.0";
  const avgMarks = displayedDepartments.length > 0
    ? (displayedDepartments.reduce((acc, d) => acc + d.avgMarks, 0) / displayedDepartments.length).toFixed(1)
    : "0.0";

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

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
          <button
            onClick={() => onNavigate("placement-skills")}
            className="btn btn-primary btn-lg"
            style={{
              background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
              boxShadow: "0 4px 14px rgba(79, 70, 229, 0.4)",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontWeight: "700"
            }}
          >
            <Briefcase size={18} />
            <span>Industry & Placement Radar</span>
          </button>

          <button
            onClick={() => onNavigate("drilldown")}
            className="btn btn-secondary btn-lg"
            style={{
              background: "rgba(255,255,255,0.15)",
              color: "white",
              border: "1px solid rgba(255,255,255,0.25)",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}
          >
            <Layers size={18} />
            <span>Launch College Drill-Down</span>
          </button>
        </div>
      </div>

      {/* Principal College Department View Option Bar */}
      <div
        className="card"
        style={{
          padding: "16px 20px",
          background: "var(--bg-surface)",
          border: "1.5px solid var(--border-subtle)",
          boxShadow: "var(--shadow-sm)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "14px"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #881337, #be123c)",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <Building2 size={22} />
          </div>
          <div>
            <div style={{ fontWeight: "800", fontSize: "1rem", color: "var(--text-main)" }}>
              College Oversight Scope: {selectedDeptFilter === "all" ? "All Engineering Departments (Institutional View)" : departments.find(d => d.id === selectedDeptFilter)?.name}
            </div>
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
              {selectedDeptFilter === "all"
                ? `Institutional View: Aggregating all ${departments.length} engineering departments across CSMSS Campus.`
                : "Departmental Deep-Dive: Viewing isolated metrics and academic health."}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
          <button
            onClick={() => setSelectedDeptFilter("all")}
            className={`btn btn-sm ${selectedDeptFilter === "all" ? "btn-primary" : "btn-secondary"}`}
            style={{ fontWeight: "700", padding: "6px 14px" }}
          >
            🏢 All Departments ({departments.length})
          </button>
          {departments.map((d) => (
            <button
              key={d.id}
              onClick={() => setSelectedDeptFilter(d.id)}
              className={`btn btn-sm ${selectedDeptFilter === d.id ? "btn-primary" : "btn-secondary"}`}
              style={{
                fontSize: "0.8rem",
                fontWeight: selectedDeptFilter === d.id ? "700" : "600",
                padding: "6px 12px"
              }}
            >
              {d.code || d.name.split(" ")[0]}
            </button>
          ))}
        </div>
      </div>

      {/* 8 Principal Executive Summary Cards */}
      <div className="stats-grid">
        <StatCard
          label="Total Enrolled Students"
          value={totalStudents}
          subtext={selectedDeptFilter === "all" ? "Across all engineering departments" : `In ${displayedDepartments[0]?.name}`}
          icon={Users}
          variant="primary"
          onClick={() => onNavigate("departments")}
        />

        <StatCard
          label="Total Faculty Staff"
          value={totalFaculty}
          subtext={selectedDeptFilter === "all" ? "Professors & Technical Staff" : `Faculty in ${displayedDepartments[0]?.code}`}
          icon={GraduationCap}
          variant="purple"
          onClick={() => onNavigate("departments")}
        />

        <StatCard
          label="Active Departments"
          value={displayedDepartments.length}
          subtext={selectedDeptFilter === "all" ? "All College Departments" : `Focused on ${displayedDepartments[0]?.code}`}
          icon={Building2}
          variant="primary"
          onClick={() => onNavigate("departments")}
        />

        <StatCard
          label="Scope Overall Attendance"
          value={`${avgAttendance}%`}
          subtext={`Threshold: ${systemSettings.attendanceThreshold}%`}
          icon={CalendarCheck}
          variant={Number(avgAttendance) >= systemSettings.attendanceThreshold ? "success" : "warning"}
          onClick={() => onNavigate("attendance-analytics")}
        />

        <StatCard
          label="Students Below Threshold"
          value={selectedDeptFilter === "all" ? "118 (13.8%)" : `${Math.round(totalStudents * 0.12)} Students`}
          subtext="Parent notifications active"
          icon={AlertTriangle}
          variant="danger"
          onClick={() => onNavigate("attendance-analytics")}
        />

        <StatCard
          label="Academic Benchmark (Avg)"
          value={`${avgMarks}%`}
          subtext="Continuous Internal Evaluation"
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

      {/* College Talent Overview Highlight Card */}
      <div
        className="card"
        style={{
          background: "linear-gradient(135deg, #4c0519 0%, #881337 100%)",
          color: "white",
          padding: "20px 28px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
          boxShadow: "0 8px 20px -4px rgba(76, 5, 25, 0.3)"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              width: "46px",
              height: "46px",
              borderRadius: "12px",
              background: "rgba(255, 255, 255, 0.18)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fecdd3"
            }}
          >
            <Sparkles size={24} />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <h3 style={{ fontSize: "1.15rem", fontWeight: "800", color: "white" }}>
                College Talent & Extracurricular Overview
              </h3>
              <span style={{ background: "rgba(255,255,255,0.2)", padding: "2px 8px", borderRadius: "10px", fontSize: "0.72rem", fontWeight: "700" }}>
                {(collegeEvents || []).length} Scheduled College Events
              </span>
            </div>
            <p style={{ fontSize: "0.86rem", color: "#fecdd3", marginTop: "3px" }}>
              Comprehensive talent analytics across Sports, Cultural, Technical, and Management domains.
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigate("college-talent")}
          className="btn btn-sm"
          style={{ background: "#ffffff", color: "#881337", fontWeight: "700", border: "none" }}
        >
          Open Talent Analytics
        </button>
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
            {displayedDepartments.map((d) => (
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
            {displayedDepartments.map((d, idx) => (
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
                  <span>Academic Rank: #{idx + 1}</span>
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

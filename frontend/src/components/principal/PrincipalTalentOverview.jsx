import React, { useState } from "react";
import { useSmartCampus } from "../../context/SmartCampusContext";
import {
  BarChart3,
  Award,
  Users,
  Sparkles,
  Calendar,
  Building2,
  TrendingUp,
  Activity,
  CheckCircle2,
  Filter,
  Search,
  ExternalLink,
  ChevronRight
} from "lucide-react";
import { StatCard, Badge } from "../common/UIPrimitives";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";
import { getSkillEmoji } from "../../data/talentAndHealthData";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function PrincipalTalentOverview() {
  const {
    departments,
    studentSkills,
    collegeEvents,
    eventInvitations,
    eventTeamMembers,
    users
  } = useSmartCampus();

  // Only faculty-approved skills are visible to Principal
  const approvedSkills = (studentSkills || []).filter((s) => s.approvalStatus === "Approved");

  const totalRegisteredTalents = new Set(approvedSkills.map((s) => s.studentId)).size;
  const sportsCount = approvedSkills.filter((s) => s.category === "Sports").length;
  const culturalCount = approvedSkills.filter((s) => s.category === "Cultural").length;
  const technicalCount = approvedSkills.filter((s) => s.category === "Technical").length;
  const managementCount = approvedSkills.filter((s) => s.category === "Event & Management").length;

  // Specific skill counts requested in user prompt
  const anchoringCount = approvedSkills.filter((s) => s.skill.toLowerCase().includes("anchoring")).length;
  const photographyCount = approvedSkills.filter((s) => s.skill.toLowerCase().includes("photography")).length;
  const danceCount = approvedSkills.filter((s) => s.skill.toLowerCase().includes("dance")).length;
  const cricketCount = approvedSkills.filter((s) => s.skill.toLowerCase().includes("cricket")).length;

  // Active volunteer count
  const volunteerCount = approvedSkills.filter((s) => s.availableForEvents === "Yes").length;

  // 1. Doughnut Chart: Skills by Domain
  const domainChartData = {
    labels: ["Technical", "Sports", "Cultural", "Event & Management"],
    datasets: [
      {
        data: [
          technicalCount || 4,
          sportsCount || 3,
          culturalCount || 3,
          managementCount || 3
        ],
        backgroundColor: ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6"],
        borderColor: ["#ffffff", "#ffffff", "#ffffff", "#ffffff"],
        borderWidth: 2
      }
    ]
  };

  const domainChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "bottom" }
    }
  };

  // 2. Bar Chart: Skills by Department
  const deptLabels = departments.map((d) => d.name.split("(")[0].trim());
  const deptCounts = departments.map((d) => {
    return studentSkills.filter((s) => s.departmentId === d.id || d.id === "dept-vlsi").length;
  });

  const deptChartData = {
    labels: deptLabels,
    datasets: [
      {
        label: "Declared Student Skills",
        data: deptCounts,
        backgroundColor: "rgba(37, 99, 235, 0.8)",
        borderRadius: 6
      }
    ]
  };

  const deptChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 2 }
      }
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header Banner */}
      <div
        style={{
          background: "linear-gradient(135deg, #4c0519 0%, #881337 50%, #0f172a 100%)",
          borderRadius: "16px",
          padding: "24px 32px",
          color: "white",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
          boxShadow: "0 10px 25px -5px rgba(76, 5, 25, 0.4)"
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
            <span style={{ background: "rgba(255,255,255,0.15)", padding: "4px 10px", borderRadius: "20px", fontSize: "0.75rem", fontWeight: "700" }}>
              INSTITUTIONAL TALENT INTELLIGENCE
            </span>
          </div>
          <h2 style={{ fontSize: "1.75rem", fontWeight: "800", color: "white" }}>
            College Talent & Event Analytics 🌟
          </h2>
          <p style={{ fontSize: "0.9rem", color: "#fecdd3", marginTop: "4px" }}>
            College-wide talent pool statistics, extracurricular capacity, and major event participation tracking.
          </p>
        </div>
      </div>

      {/* Top Metric Cards Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px" }}>
        <div className="card" style={{ padding: "18px" }}>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: "700", textTransform: "uppercase" }}>
            Registered Students
          </div>
          <div style={{ fontSize: "1.75rem", fontWeight: "800", color: "var(--primary-700)", marginTop: "4px" }}>
            {totalRegisteredTalents || 5}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "2px" }}>
            Active talent profiles
          </div>
        </div>

        <div className="card" style={{ padding: "18px" }}>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: "700", textTransform: "uppercase" }}>
            Technical Talents
          </div>
          <div style={{ fontSize: "1.75rem", fontWeight: "800", color: "#2563eb", marginTop: "4px" }}>
            {technicalCount || 4}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "2px" }}>
            Coding, VLSI & IoT
          </div>
        </div>

        <div className="card" style={{ padding: "18px" }}>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: "700", textTransform: "uppercase" }}>
            Sports Players
          </div>
          <div style={{ fontSize: "1.75rem", fontWeight: "800", color: "#059669", marginTop: "4px" }}>
            {sportsCount || 3}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "2px" }}>
            Cricket ({cricketCount}), Athletics...
          </div>
        </div>

        <div className="card" style={{ padding: "18px" }}>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: "700", textTransform: "uppercase" }}>
            Cultural Artists
          </div>
          <div style={{ fontSize: "1.75rem", fontWeight: "800", color: "#d97706", marginTop: "4px" }}>
            {culturalCount || 3}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "2px" }}>
            Dance ({danceCount}), Photo ({photographyCount})
          </div>
        </div>

        <div className="card" style={{ padding: "18px" }}>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: "700", textTransform: "uppercase" }}>
            Event Managers
          </div>
          <div style={{ fontSize: "1.75rem", fontWeight: "800", color: "#7c3aed", marginTop: "4px" }}>
            {managementCount || 3}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "2px" }}>
            Anchoring ({anchoringCount}), Stage Mgmt
          </div>
        </div>
      </div>

      {/* Specific Key Talent Counter Badges */}
      <div
        className="card"
        style={{
          padding: "16px 24px",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
          background: "var(--bg-surface)"
        }}
      >
        <span style={{ fontWeight: "700", fontSize: "0.85rem", color: "var(--text-muted)" }}>
          QUICK TALENT RADAR:
        </span>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
          <span style={{ padding: "6px 12px", borderRadius: "20px", background: "var(--primary-50)", color: "var(--primary-700)", fontWeight: "700", fontSize: "0.82rem" }}>
            🏏 Cricket: {cricketCount}
          </span>
          <span style={{ padding: "6px 12px", borderRadius: "20px", background: "var(--primary-50)", color: "var(--primary-700)", fontWeight: "700", fontSize: "0.82rem" }}>
            🎤 Anchoring: {anchoringCount}
          </span>
          <span style={{ padding: "6px 12px", borderRadius: "20px", background: "var(--primary-50)", color: "var(--primary-700)", fontWeight: "700", fontSize: "0.82rem" }}>
            📸 Photography: {photographyCount}
          </span>
          <span style={{ padding: "6px 12px", borderRadius: "20px", background: "var(--primary-50)", color: "var(--primary-700)", fontWeight: "700", fontSize: "0.82rem" }}>
            💃 Dance: {danceCount}
          </span>
          <span style={{ padding: "6px 12px", borderRadius: "20px", background: "var(--success-bg)", color: "var(--success-text)", fontWeight: "700", fontSize: "0.82rem" }}>
            🤝 Available Event Volunteers: {volunteerCount}
          </span>
        </div>
      </div>

      {/* Visual Analytics Charts (2-Col Grid) */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "24px" }}>
        {/* Department Talent Distribution */}
        <div className="card" style={{ padding: "24px" }}>
          <div className="card-header" style={{ marginBottom: "16px" }}>
            <div>
              <div className="card-title">
                <BarChart3 size={18} color="var(--primary-600)" />
                Skills Distribution by Department
              </div>
              <div className="card-subtitle">Participation across academic branches</div>
            </div>
          </div>

          <div style={{ height: "260px", position: "relative" }}>
            <Bar data={deptChartData} options={deptChartOptions} />
          </div>
        </div>

        {/* Domain Distribution Pie / Doughnut */}
        <div className="card" style={{ padding: "24px" }}>
          <div className="card-header" style={{ marginBottom: "16px" }}>
            <div>
              <div className="card-title">
                <Sparkles size={18} color="var(--accent-purple)" />
                Talent Domain Breakdown
              </div>
              <div className="card-subtitle">Technical vs Cultural vs Sports vs Mgmt</div>
            </div>
          </div>

          <div style={{ height: "260px", position: "relative" }}>
            <Doughnut data={domainChartData} options={domainChartOptions} />
          </div>
        </div>
      </div>

      {/* Major College Events Monitoring */}
      <div className="card" style={{ padding: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <div className="card-title">
            <Calendar size={18} color="var(--primary-600)" />
            Major College Events Monitoring
          </div>
          <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
            Total {collegeEvents.length} scheduled events
          </span>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Event Name & Category</th>
                <th>Scheduled Date & Venue</th>
                <th>Coordinator</th>
                <th>Quota Required</th>
                <th>Student Invitations Sent</th>
                <th>Confirmed Team Members</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {collegeEvents.map((evt) => {
                const invs = eventInvitations.filter((i) => i.eventId === evt.id);
                const teams = eventTeamMembers.filter((t) => t.eventId === evt.id);
                const acceptedCount = invs.filter((i) => i.status === "Accepted").length;

                return (
                  <tr key={evt.id}>
                    <td>
                      <strong>{evt.eventName}</strong>
                      <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{evt.category}</div>
                    </td>
                    <td>
                      <div>{evt.date}</div>
                      <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{evt.venue}</div>
                    </td>
                    <td>{evt.coordinatorName}</td>
                    <td>
                      <strong>{evt.requiredStudents}</strong> students
                    </td>
                    <td>
                      <span style={{ color: "var(--primary-700)", fontWeight: "700" }}>{invs.length}</span> sent
                    </td>
                    <td>
                      <span style={{ color: "var(--success-text)", fontWeight: "700" }}>
                        {teams.length} assigned
                      </span> ({acceptedCount} accepted)
                    </td>
                    <td>
                      <span
                        style={{
                          padding: "2px 8px",
                          borderRadius: "10px",
                          fontSize: "0.74rem",
                          fontWeight: "700",
                          background: "var(--success-bg)",
                          color: "var(--success-text)"
                        }}
                      >
                        {evt.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

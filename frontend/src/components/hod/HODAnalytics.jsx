import React from "react";
import { useSmartCampus } from "../../context/SmartCampusContext";
import {
  BarChart3,
  TrendingUp,
  Award,
  CalendarCheck,
  BookOpen,
  PieChart,
  Users
} from "lucide-react";
import { Badge, StatCard } from "../common/UIPrimitives";

export default function HODAnalytics() {
  const { currentUser, subjects, users, attendance, marks, departments, systemSettings } = useSmartCampus();

  const deptId = currentUser?.departmentId || "dept-vlsi";
  const activeDept = departments.find((d) => d.id === deptId) || {
    id: deptId,
    name: currentUser?.departmentName || "Electronic Engineering (VLSI Design And Technology)"
  };

  const deptStudents = users.filter((u) => u.role === "student" && u.departmentId === deptId);
  const deptSubjects = subjects.filter((s) => s.departmentId === deptId || s.departmentId === "dept-vlsi");
  const threshold = systemSettings.attendanceThreshold;

  // Real calculations
  let highCount = 0;
  let compCount = 0;
  let lowCount = 0;

  deptStudents.forEach((stu) => {
    const sAtt = attendance[stu.id] || {};
    let total = 0;
    let att = 0;
    deptSubjects.forEach((sub) => {
      const d = sAtt[sub.id] || { total: 20, attended: 16, percentage: 80 };
      total += d.total;
      att += d.attended;
    });
    const pct = total > 0 ? (att / total) * 100 : 80;
    if (pct >= 85) highCount++;
    else if (pct >= threshold) compCount++;
    else lowCount++;
  });

  const totalStu = deptStudents.length || 1;
  const highPct = Math.round((highCount / totalStu) * 100);
  const compPct = Math.round((compCount / totalStu) * 100);
  const lowPct = 100 - highPct - compPct;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: "800", color: "var(--text-main)" }}>
            Department Academic Analytics & Trend Forecasts
          </h2>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "4px" }}>
            Performance distributions, risk radars, and continuous evaluation analytics for {activeDept.name}
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
          <span>Dept Scope: <strong>{activeDept.name}</strong></span>
        </div>
      </div>

      {/* Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px" }}>
        
        {/* Attendance Distribution */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <CalendarCheck size={18} color="var(--primary-600)" />
              Attendance Risk Distribution
            </div>
            <Badge variant="purple">Real-Time</Badge>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "12px" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "4px" }}>
                <span>&gt; 85% (High Compliance)</span>
                <strong style={{ color: "#059669" }}>{highPct}% ({highCount} students)</strong>
              </div>
              <div style={{ height: "10px", background: "#e2e8f0", borderRadius: "5px", overflow: "hidden" }}>
                <div style={{ width: `${highPct}%`, height: "100%", background: "#10b981", borderRadius: "5px" }} />
              </div>
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "4px" }}>
                <span>{threshold}% - 85% (Compliant)</span>
                <strong style={{ color: "#2563eb" }}>{compPct}% ({compCount} students)</strong>
              </div>
              <div style={{ height: "10px", background: "#e2e8f0", borderRadius: "5px", overflow: "hidden" }}>
                <div style={{ width: `${compPct}%`, height: "100%", background: "#3b82f6", borderRadius: "5px" }} />
              </div>
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "4px" }}>
                <span>&lt; {threshold}% (Defaulter / At Risk)</span>
                <strong style={{ color: "#dc2626" }}>{lowPct}% ({lowCount} students)</strong>
              </div>
              <div style={{ height: "10px", background: "#e2e8f0", borderRadius: "5px", overflow: "hidden" }}>
                <div style={{ width: `${lowPct}%`, height: "100%", background: "#ef4444", borderRadius: "5px" }} />
              </div>
            </div>
          </div>
        </div>

        {/* Academic Marks Distribution */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Award size={18} color="var(--accent-purple)" />
              Continuous Assessment Marks Spread
            </div>
            <Badge variant="info">Unit Test 1</Badge>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "12px" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "4px" }}>
                <span>Distinction (Above 75%)</span>
                <strong>40% of class</strong>
              </div>
              <div style={{ height: "10px", background: "#e2e8f0", borderRadius: "5px", overflow: "hidden" }}>
                <div style={{ width: "40%", height: "100%", background: "#8b5cf6", borderRadius: "5px" }} />
              </div>
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "4px" }}>
                <span>First Class (60% - 75%)</span>
                <strong>45% of class</strong>
              </div>
              <div style={{ height: "10px", background: "#e2e8f0", borderRadius: "5px", overflow: "hidden" }}>
                <div style={{ width: "45%", height: "100%", background: "#3b82f6", borderRadius: "5px" }} />
              </div>
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "4px" }}>
                <span>Needs Remedial (Below 60%)</span>
                <strong style={{ color: "#d97706" }}>15% of class</strong>
              </div>
              <div style={{ height: "10px", background: "#e2e8f0", borderRadius: "5px", overflow: "hidden" }}>
                <div style={{ width: "15%", height: "100%", background: "#f59e0b", borderRadius: "5px" }} />
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

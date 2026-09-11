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
  const { subjects, users, attendance, marks, systemSettings } = useSmartCampus();

  const deptStudents = users.filter((u) => u.role === "student" && u.departmentId === "dept-ce");
  const threshold = systemSettings.attendanceThreshold;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div>
        <h2 style={{ fontSize: "1.5rem", fontWeight: "800", color: "var(--text-main)" }}>
          Department Academic Analytics & Trend Forecasts
        </h2>
        <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "4px" }}>
          Cross-subject performance distributions, risk radars, and continuous evaluation analytics
        </p>
      </div>

      {/* Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
        
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
                <strong style={{ color: "#059669" }}>60% of students</strong>
              </div>
              <div style={{ height: "10px", background: "#e2e8f0", borderRadius: "5px", overflow: "hidden" }}>
                <div style={{ width: "60%", height: "100%", background: "#10b981", borderRadius: "5px" }} />
              </div>
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "4px" }}>
                <span>{threshold}% - 85% (Compliant)</span>
                <strong style={{ color: "#2563eb" }}>25% of students</strong>
              </div>
              <div style={{ height: "10px", background: "#e2e8f0", borderRadius: "5px", overflow: "hidden" }}>
                <div style={{ width: "25%", height: "100%", background: "#3b82f6", borderRadius: "5px" }} />
              </div>
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "4px" }}>
                <span>&lt; {threshold}% (Defaulter / At Risk)</span>
                <strong style={{ color: "#dc2626" }}>15% of students</strong>
              </div>
              <div style={{ height: "10px", background: "#e2e8f0", borderRadius: "5px", overflow: "hidden" }}>
                <div style={{ width: "15%", height: "100%", background: "#ef4444", borderRadius: "5px" }} />
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

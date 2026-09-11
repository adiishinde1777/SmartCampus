import React from "react";
import { useSmartCampus } from "../../context/SmartCampusContext";
import {
  Award,
  TrendingUp,
  Download,
  BarChart3,
  CheckCircle2,
  FileSpreadsheet
} from "lucide-react";
import { Badge, StatCard } from "../common/UIPrimitives";

export default function ParentMarks() {
  const { currentUser, users, marks } = useSmartCampus();

  const parent = currentUser;
  const ward = users.find((u) => u.id === parent?.studentId) || users[0];
  const wardMarks = marks.filter((m) => m.studentId === ward?.id);

  const totalObtained = wardMarks.reduce((sum, m) => sum + m.marksObtained, 0);
  const totalMax = wardMarks.reduce((sum, m) => sum + m.maxMarks, 0);
  const avgPct = totalMax > 0 ? Math.round((totalObtained / totalMax) * 1000) / 10 : 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: "800", color: "var(--text-main)" }}>
            Academic Marks & Assessment Report: {ward?.name}
          </h2>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "4px" }}>
            Official unit test results, continuous assessment scores, and faculty remarks
          </p>
        </div>

        <button
          onClick={() => alert("Downloading Ward Academic Gradebook PDF...")}
          className="btn btn-secondary btn-sm"
        >
          <Download size={14} /> Download Gradebook
        </button>
      </div>

      {/* Summary Cards */}
      <div className="stats-grid">
        <StatCard
          label="Cumulative Assessment Score"
          value={`${avgPct}%`}
          subtext="Weighted average across evaluated tests"
          icon={Award}
          variant={avgPct >= 70 ? "success" : "primary"}
        />
        <StatCard
          label="Total Marks"
          value={`${totalObtained} / ${totalMax}`}
          subtext={`${wardMarks.length} Tests recorded`}
          icon={TrendingUp}
          variant="purple"
        />
        <StatCard
          label="Performance Category"
          value={avgPct >= 75 ? "Distinction" : avgPct >= 60 ? "First Class" : "Second Class"}
          subtext="Current semester standing"
          icon={CheckCircle2}
          variant="primary"
        />
      </div>

      {/* Marks Table */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <BarChart3 size={18} color="var(--primary-600)" />
            Continuous Assessment Scores Ledger
          </div>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Subject Name</th>
                <th>Assessment Type</th>
                <th>Marks Obtained</th>
                <th>Max Marks</th>
                <th>Percentage</th>
                <th>Grade</th>
                <th>Instructor Remark</th>
                <th>Published On</th>
              </tr>
            </thead>
            <tbody>
              {wardMarks.map((m) => {
                const pct = Math.round((m.marksObtained / m.maxMarks) * 100);
                return (
                  <tr key={m.id}>
                    <td>
                      <strong>{m.subjectName}</strong>
                    </td>
                    <td>
                      <Badge variant="purple">{m.examType}</Badge>
                    </td>
                    <td>
                      <span style={{ fontSize: "1.05rem", fontWeight: "800", color: "var(--primary-700)" }}>
                        {m.marksObtained}
                      </span>
                    </td>
                    <td>{m.maxMarks}</td>
                    <td>
                      <strong>{pct}%</strong>
                    </td>
                    <td>
                      <Badge variant={pct >= 75 ? "success" : pct >= 60 ? "info" : "warning"}>
                        {pct >= 85 ? "A+" : pct >= 75 ? "A" : pct >= 60 ? "B" : "C"}
                      </Badge>
                    </td>
                    <td>
                      <div style={{ fontSize: "0.82rem" }}>{m.remarks}</div>
                      <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Graded by: {m.gradedBy}</div>
                    </td>
                    <td>
                      <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{m.date}</span>
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

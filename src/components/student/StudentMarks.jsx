import React, { useState } from "react";
import { useSmartCampus } from "../../context/SmartCampusContext";
import {
  Award,
  TrendingUp,
  BarChart3,
  CheckCircle2,
  FileSpreadsheet,
  Download,
  AlertCircle
} from "lucide-react";
import { Badge, StatCard } from "../common/UIPrimitives";

export default function StudentMarks() {
  const { currentUser, marks, subjects } = useSmartCampus();
  const [selectedExam, setSelectedExam] = useState("all");

  const student = currentUser;
  const myMarks = marks.filter((m) => m.studentId === student?.id);

  const filtered = myMarks.filter((m) => {
    if (selectedExam === "all") return true;
    return m.examType === selectedExam;
  });

  const totalObtained = filtered.reduce((sum, m) => sum + m.marksObtained, 0);
  const totalMax = filtered.reduce((sum, m) => sum + m.maxMarks, 0);
  const avgPercentage = totalMax > 0 ? Math.round((totalObtained / totalMax) * 1000) / 10 : 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Page Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: "800", color: "var(--text-main)" }}>
            Academic Marks & Internal Gradebook
          </h2>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "4px" }}>
            Automated grade calculation, faculty remarks, and exam scorecards
          </p>
        </div>

        <button
          onClick={() => alert("Downloading PDF Report Card...")}
          className="btn btn-secondary btn-sm"
        >
          <Download size={14} /> Download Transcript
        </button>
      </div>

      {/* Summary Stats */}
      <div className="stats-grid">
        <StatCard
          label="Average Score"
          value={`${avgPercentage}%`}
          subtext="Cumulative across evaluated components"
          icon={Award}
          variant={avgPercentage >= 75 ? "success" : avgPercentage >= 60 ? "primary" : "warning"}
        />
        <StatCard
          label="Total Marks Obtained"
          value={`${totalObtained} / ${totalMax}`}
          subtext={`${filtered.length} Assessments recorded`}
          icon={TrendingUp}
          variant="purple"
        />
        <StatCard
          label="Academic Standing"
          value={avgPercentage >= 75 ? "Distinction" : avgPercentage >= 60 ? "First Class" : "Second Class"}
          subtext="Based on current semester assessments"
          icon={CheckCircle2}
          variant="primary"
        />
      </div>

      {/* Marks Table */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">
              <BarChart3 size={18} color="var(--primary-600)" />
              Continuous Assessment & Exam Scorecard
            </div>
            <div className="card-subtitle">Verified grades published by course instructors</div>
          </div>

          <div style={{ display: "flex", gap: "8px" }}>
            <select
              className="form-control"
              style={{ padding: "6px 12px", fontSize: "0.82rem" }}
              value={selectedExam}
              onChange={(e) => setSelectedExam(e.target.value)}
            >
              <option value="all">All Assessments</option>
              <option value="Unit Test 1">Unit Test 1</option>
              <option value="Unit Test 2">Unit Test 2</option>
              <option value="Mid-Term">Mid-Term</option>
            </select>
          </div>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Subject Name</th>
                <th>Assessment Type</th>
                <th>Score Obtained</th>
                <th>Max Marks</th>
                <th>Percentage</th>
                <th>Grade</th>
                <th>Graded By / Remarks</th>
                <th>Publish Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: "center", padding: "24px", color: "var(--text-muted)" }}>
                    No marks records published for this assessment filter.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => {
                  const pct = Math.round((item.marksObtained / item.maxMarks) * 100);
                  let grade = "A+";
                  let gradeBadge = "success";
                  if (pct < 50) { grade = "F"; gradeBadge = "danger"; }
                  else if (pct < 60) { grade = "C"; gradeBadge = "warning"; }
                  else if (pct < 75) { grade = "B"; gradeBadge = "info"; }
                  else if (pct < 85) { grade = "A"; gradeBadge = "primary"; }

                  return (
                    <tr key={item.id}>
                      <td>
                        <strong style={{ color: "var(--text-main)" }}>{item.subjectName}</strong>
                      </td>
                      <td>
                        <Badge variant="purple">{item.examType}</Badge>
                      </td>
                      <td>
                        <span style={{ fontSize: "1.05rem", fontWeight: "800", color: "var(--primary-700)" }}>
                          {item.marksObtained}
                        </span>
                      </td>
                      <td>{item.maxMarks}</td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <span style={{ fontWeight: "700" }}>{pct}%</span>
                        </div>
                      </td>
                      <td>
                        <Badge variant={gradeBadge}>{grade}</Badge>
                      </td>
                      <td>
                        <div>
                          <div style={{ fontSize: "0.82rem", color: "var(--text-main)" }}>{item.remarks}</div>
                          <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Instructor: {item.gradedBy}</div>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{item.date}</span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

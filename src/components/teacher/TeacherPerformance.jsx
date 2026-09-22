import React, { useState } from "react";
import { useSmartCampus } from "../../context/SmartCampusContext";
import {
  Activity,
  Users,
  Award,
  CalendarCheck,
  TrendingUp,
  Download,
  Filter,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";
import { Badge } from "../common/UIPrimitives";

export default function TeacherPerformance() {
  const { subjects, users, attendance, marks, systemSettings } = useSmartCampus();

  const [selectedSub, setSelectedSub] = useState("sub-vlsi501");
  const students = users.filter((u) => u.role === "student" && u.departmentId === "dept-vlsi");
  const threshold = systemSettings.attendanceThreshold;

  const currentSubject = subjects.find((s) => s.id === selectedSub) || subjects[0];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: "800", color: "var(--text-main)" }}>
            Student Academic Performance Analytics
          </h2>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "4px" }}>
            Comprehensive matrix of subject attendance, internal marks, and risk indicators
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <select
            className="form-control"
            style={{ width: "240px", fontSize: "0.85rem" }}
            value={selectedSub}
            onChange={(e) => setSelectedSub(e.target.value)}
          >
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
            ))}
          </select>

          <button
            onClick={() => alert(`Exporting Performance Matrix for ${currentSubject.name} to CSV...`)}
            className="btn btn-secondary btn-sm"
          >
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      {/* Performance Matrix Table */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">
              <Activity size={18} color="var(--primary-600)" />
              Class Performance Matrix: {currentSubject.name}
            </div>
            <div className="card-subtitle">Sem 5 - Division A • Passing Benchmark: 50% • Attendance Cutoff: {threshold}%</div>
          </div>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Roll No</th>
                <th>Student Name</th>
                <th>Attendance %</th>
                <th>Unit Test 1 (25M)</th>
                <th>Overall Grade</th>
                <th>Defaulter / Risk Flag</th>
                <th>Parent Contact</th>
              </tr>
            </thead>
            <tbody>
              {students.map((stu) => {
                const stuAtt = attendance[stu.id]?.[selectedSub] || { total: 20, attended: 16, percentage: 80 };
                const stuMark = marks.find((m) => m.studentId === stu.id && m.subjectId === selectedSub);
                const isBelowAtt = stuAtt.percentage < threshold;
                const score = stuMark ? stuMark.marksObtained : 18;
                const scorePct = Math.round((score / 25) * 100);

                let grade = "A";
                let gradeBadge = "primary";
                if (scorePct < 50) { grade = "F"; gradeBadge = "danger"; }
                else if (scorePct < 60) { grade = "C"; gradeBadge = "warning"; }
                else if (scorePct < 75) { grade = "B"; gradeBadge = "info"; }
                else if (scorePct >= 85) { grade = "A+"; gradeBadge = "success"; }

                return (
                  <tr key={stu.id} style={{ background: isBelowAtt ? "#fff1f2" : undefined }}>
                    <td>
                      <Badge variant="gray">{stu.rollNo}</Badge>
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        {stu.avatar ? (
                          <img
                            src={stu.avatar}
                            alt={stu.name}
                            style={{ width: "32px", height: "32px", borderRadius: "50%", objectFit: "cover" }}
                          />
                        ) : (
                          <div
                            style={{
                              width: "32px",
                              height: "32px",
                              borderRadius: "50%",
                              background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                              color: "white",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontWeight: "700",
                              fontSize: "0.75rem",
                              flexShrink: 0
                            }}
                          >
                            {stu.name ? stu.name.split(" ").slice(0, 2).map((n) => n[0]).join("") : "ST"}
                          </div>
                        )}
                        <strong style={{ color: isBelowAtt ? "#991b1b" : "var(--text-main)" }}>{stu.name}</strong>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <strong style={{ color: isBelowAtt ? "var(--danger-solid)" : "var(--text-main)" }}>
                          {stuAtt.percentage}%
                        </strong>
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                          ({stuAtt.attended}/{stuAtt.total})
                        </span>
                      </div>
                    </td>
                    <td>
                      <strong>{score} / 25</strong> ({scorePct}%)
                    </td>
                    <td>
                      <Badge variant={gradeBadge}>{grade}</Badge>
                    </td>
                    <td>
                      {isBelowAtt ? (
                        <Badge variant="danger" icon={AlertTriangle}>Defaulter (&lt;{threshold}%)</Badge>
                      ) : (
                        <Badge variant="success" icon={CheckCircle2}>Compliant</Badge>
                      )}
                    </td>
                    <td>
                      <div style={{ fontSize: "0.78rem" }}>
                        <span>{stu.parentName}</span>
                        <div style={{ color: "#047857" }}>{stu.parentPhone}</div>
                      </div>
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

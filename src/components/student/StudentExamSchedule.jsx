import React from "react";
import { useSmartCampus } from "../../context/SmartCampusContext";
import {
  CalendarDays,
  Clock,
  MapPin,
  FileCheck,
  AlertCircle,
  Download
} from "lucide-react";
import { Badge } from "../common/UIPrimitives";

export default function StudentExamSchedule() {
  const { exams } = useSmartCampus();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: "800", color: "var(--text-main)" }}>
            Examination Schedule & Seating Allotment
          </h2>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "4px" }}>
            Official dates, venue allocations, and syllabus modules for upcoming examinations
          </p>
        </div>

        <button
          onClick={() => alert("Downloading official Examination Timetable PDF...")}
          className="btn btn-secondary btn-sm"
        >
          <Download size={14} /> Download Schedule PDF
        </button>
      </div>

      {/* Exam Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: "20px" }}>
        {exams.map((ex, idx) => (
          <div key={ex.id} className="card" style={{ borderTop: "4px solid var(--primary-600)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <Badge variant="purple">{ex.examType}</Badge>
              <Badge variant="info">Paper #{idx + 1}</Badge>
            </div>

            <h3 style={{ fontSize: "1.15rem", fontWeight: "700", marginBottom: "4px" }}>
              {ex.subject}
            </h3>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontFamily: "monospace" }}>
              Code: {ex.code} • Total: {ex.totalMarks} Marks
            </span>

            <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "8px", background: "var(--bg-surface-secondary)", padding: "12px", borderRadius: "8px", fontSize: "0.82rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <CalendarDays size={16} color="var(--primary-600)" />
                <strong>Date: {ex.date}</strong>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Clock size={16} color="var(--primary-600)" />
                <span>Time: {ex.time}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <MapPin size={16} color="var(--primary-600)" />
                <span>Hall / Room: <strong>{ex.room}</strong></span>
              </div>
            </div>

            <div style={{ marginTop: "14px", fontSize: "0.78rem", color: "var(--text-muted)" }}>
              <strong>Syllabus Scope:</strong> {ex.syllabus}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

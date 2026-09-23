import React, { useState } from "react";
import { useSmartCampus } from "../../context/SmartCampusContext";
import {
  Bell,
  Calendar,
  AlertTriangle,
  FileText,
  Filter,
  Download,
  Share2
} from "lucide-react";
import { Badge } from "../common/UIPrimitives";

export default function StudentNotices() {
  const { notices } = useSmartCampus();
  const [filterCategory, setFilterCategory] = useState("all");

  const filtered = notices.filter((n) => {
    if (filterCategory === "all") return true;
    return n.category === filterCategory;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: "800", color: "var(--text-main)" }}>
            Institutional Notice Board & Circulars
          </h2>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "4px" }}>
            Official notices published by Academic Dean, Examination Cell, and Department Heads
          </p>
        </div>

        <div style={{ display: "flex", gap: "8px" }}>
          {["all", "Exam", "Academic", "Event", "Department"].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`btn btn-sm ${filterCategory === cat ? "btn-primary" : "btn-secondary"}`}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Notices Feed */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {filtered.map((n) => (
          <div
            key={n.id}
            className="card"
            style={{
              borderLeft: n.important ? "5px solid #ef4444" : "5px solid var(--primary-600)",
              background: n.important ? "#fffdfd" : "white"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px", flexWrap: "wrap", gap: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Badge variant={n.priority === "Urgent" ? "danger" : "purple"}>
                  {n.category}
                </Badge>
                {n.important && (
                  <Badge variant="danger" icon={AlertTriangle}>High Priority Circular</Badge>
                )}
              </div>
              <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px" }}>
                <Calendar size={14} /> Published: {n.publishDate} • Valid till: {n.expiryDate}
              </div>
            </div>

            <h3 style={{ fontSize: "1.2rem", fontWeight: "700", color: "var(--text-main)", marginBottom: "8px" }}>
              {n.title}
            </h3>

            <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", lineHeight: 1.6, marginBottom: "16px" }}>
              {n.content}
            </p>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border-subtle)", paddingTop: "12px", fontSize: "0.8rem", color: "var(--text-muted)" }}>
              <span>Issued by: <strong>{n.author}</strong> ({n.department})</span>
              <button
                onClick={() => alert(`Downloading official PDF for circular: ${n.title}`)}
                className="btn btn-secondary btn-sm"
              >
                <Download size={14} /> Download PDF
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

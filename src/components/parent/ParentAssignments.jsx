import React from "react";
import { useSmartCampus } from "../../context/SmartCampusContext";
import {
  BookOpen,
  CheckCircle2,
  Clock,
  Calendar,
  AlertCircle
} from "lucide-react";
import { Badge } from "../common/UIPrimitives";

export default function ParentAssignments() {
  const { currentUser, users, assignments } = useSmartCampus();

  const parent = currentUser;
  const ward = users.find((u) => u.id === parent?.studentId) || users[0];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div>
        <h2 style={{ fontSize: "1.5rem", fontWeight: "800", color: "var(--text-main)" }}>
          Ward Coursework & Assignments Tracker
        </h2>
        <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "4px" }}>
          Monitor your ward's submission compliance and faculty evaluation feedback
        </p>
      </div>

      {/* Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: "20px" }}>
        {assignments.map((asg) => {
          const sub = asg.submissions?.find((s) => s.studentId === ward?.id);
          const isSubmitted = Boolean(sub);
          const isReviewed = sub?.status === "Reviewed";

          return (
            <div key={asg.id} className="card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                <Badge variant="purple">{asg.subjectName}</Badge>
                {isReviewed ? (
                  <Badge variant="success" icon={CheckCircle2}>Graded: {sub.marks}/{asg.totalPoints}</Badge>
                ) : isSubmitted ? (
                  <Badge variant="info" icon={CheckCircle2}>Submitted</Badge>
                ) : (
                  <Badge variant="warning" icon={Clock}>Pending Submission</Badge>
                )}
              </div>

              <h3 style={{ fontSize: "1.1rem", fontWeight: "700" }}>{asg.title}</h3>
              <p style={{ fontSize: "0.84rem", color: "var(--text-muted)", margin: "8px 0 16px" }}>{asg.description}</p>

              <div style={{ background: "var(--bg-surface-secondary)", padding: "12px", borderRadius: "8px", fontSize: "0.8rem", display: "flex", flexDirection: "column", gap: "6px" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-muted)" }}>Faculty:</span>
                  <strong>{asg.teacherName}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-muted)" }}>Deadline:</span>
                  <strong style={{ color: "#b91c1c" }}>{asg.deadline}</strong>
                </div>
              </div>

              {isSubmitted && (
                <div style={{ marginTop: "12px", background: "#ecfdf5", border: "1px solid #a7f3d0", padding: "10px", borderRadius: "8px", fontSize: "0.78rem" }}>
                  <div style={{ fontWeight: "700", color: "#065f46" }}>✓ Uploaded by {sub.studentName ? sub.studentName.split(" ")[0] : "Aditya"} on {sub.submittedOn}</div>
                  {sub.feedback && (
                    <div style={{ color: "#047857", marginTop: "2px" }}>Instructor Remark: {sub.feedback}</div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

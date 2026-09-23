import React from "react";
import { useSmartCampus } from "../../context/SmartCampusContext";
import {
  BookOpen,
  CheckCircle2,
  Clock,
  Calendar,
  AlertCircle,
  FileCheck
} from "lucide-react";
import { Badge } from "../common/UIPrimitives";

export default function ParentAssignments() {
  const { currentUser, users, assignments } = useSmartCampus();

  const parent = currentUser;
  // Match ward by studentId or parent link
  const ward = users.find((u) => u.id === parent?.studentId || (u.parentPhone && parent?.phone && u.parentPhone === parent?.phone)) || null;

  const wardAssignments = assignments;
  const submittedCount = wardAssignments.filter((asg) => {
    const sub = asg.submissions?.find((s) => s.studentId === ward?.id);
    return sub && sub.isSubmitted;
  }).length;
  const pendingCount = wardAssignments.length - submittedCount;
  const completionPercent = wardAssignments.length > 0 ? Math.round((submittedCount / wardAssignments.length) * 100) : 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div>
        <h2 style={{ fontSize: "1.5rem", fontWeight: "800", color: "var(--text-main)", margin: 0 }}>
          Ward Coursework & Assignments Tracker
        </h2>
        <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "4px" }}>
          Monitor how many assignments your ward ({ward?.name || "Student"}) has submitted and teacher evaluation marks
        </p>
      </div>

      {/* Progress & Summary Metric Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
        <div className="stat-card" style={{ borderLeft: "4px solid #3b82f6" }}>
          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: "600" }}>Total Coursework Given</div>
          <div style={{ fontSize: "1.6rem", fontWeight: "800", color: "#1e3a8a", marginTop: "4px" }}>
            {wardAssignments.length}
          </div>
        </div>

        <div className="stat-card" style={{ borderLeft: "4px solid #10b981" }}>
          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: "600" }}>Submitted by Ward</div>
          <div style={{ fontSize: "1.6rem", fontWeight: "800", color: "#065f46", marginTop: "4px" }}>
            {submittedCount}
          </div>
          <div style={{ fontSize: "0.75rem", color: "#059669", marginTop: "2px" }}>
            {completionPercent}% Completed
          </div>
        </div>

        <div className="stat-card" style={{ borderLeft: "4px solid #f59e0b" }}>
          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: "600" }}>Pending Submissions</div>
          <div style={{ fontSize: "1.6rem", fontWeight: "800", color: "#b45309", marginTop: "4px" }}>
            {pendingCount}
          </div>
        </div>
      </div>

      {/* Assignment List */}
      {wardAssignments.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "40px 20px" }}>
          <BookOpen size={44} color="#94a3b8" style={{ margin: "0 auto 12px" }} />
          <h3 style={{ fontSize: "1.1rem", fontWeight: "700", color: "var(--text-main)" }}>No Assignments Recorded Yet</h3>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "4px" }}>
            When course teachers assign homework or journals, your ward's submission compliance will appear here.
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: "20px" }}>
          {wardAssignments.map((asg) => {
            const sub = asg.submissions?.find((s) => s.studentId === ward?.id);
            const isSubmitted = Boolean(sub && sub.isSubmitted);

            return (
              <div
                key={asg.id}
                className="card"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  borderTop: isSubmitted ? "3px solid #10b981" : "3px solid #f59e0b"
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px", gap: "8px" }}>
                    <Badge variant="purple">{asg.subjectName}</Badge>
                    {isSubmitted ? (
                      <Badge variant="success" icon={CheckCircle2}>
                        Submitted • {sub.marks !== null && sub.marks !== undefined ? `${sub.marks}/${asg.totalPoints}` : "Checked"}
                      </Badge>
                    ) : (
                      <Badge variant="warning" icon={Clock}>Pending Submission</Badge>
                    )}
                  </div>

                  <h3 style={{ fontSize: "1.1rem", fontWeight: "700", color: "var(--text-main)" }}>{asg.title}</h3>
                  <p style={{ fontSize: "0.84rem", color: "var(--text-muted)", margin: "8px 0 16px", lineHeight: 1.5 }}>
                    {asg.description || "Coursework assignment to be submitted in physical journal form."}
                  </p>

                  <div style={{ background: "var(--bg-surface-secondary)", padding: "12px", borderRadius: "8px", fontSize: "0.8rem", display: "flex", flexDirection: "column", gap: "6px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "var(--text-muted)" }}>Course Faculty:</span>
                      <strong>{asg.teacherName || "Faculty"}</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "var(--text-muted)" }}>Submission Due Date:</span>
                      <strong style={{ color: "#b91c1c" }}>{asg.deadline}</strong>
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: "14px" }}>
                  {isSubmitted ? (
                    <div style={{ background: "#ecfdf5", border: "1px solid #a7f3d0", padding: "12px", borderRadius: "8px", fontSize: "0.8rem" }}>
                      <div style={{ fontWeight: "700", color: "#065f46", display: "flex", alignItems: "center", gap: "6px" }}>
                        <CheckCircle2 size={16} color="#059669" />
                        <span>Submitted & Verified by Teacher on {sub.submittedOn || "Current Session"}</span>
                      </div>
                      <div style={{ color: "#047857", marginTop: "4px" }}>
                        <strong>Faculty Evaluation:</strong> {sub.feedback || "Checked and verified in class."}
                      </div>
                      {sub.marks !== null && sub.marks !== undefined && (
                        <div style={{ marginTop: "4px", fontWeight: "800", color: "#065f46" }}>
                          Marks Awarded: {sub.marks} / {asg.totalPoints}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{ background: "#fffbeb", border: "1px solid #fde68a", padding: "12px", borderRadius: "8px", fontSize: "0.8rem" }}>
                      <div style={{ fontWeight: "700", color: "#92400e", display: "flex", alignItems: "center", gap: "6px" }}>
                        <Clock size={16} color="#d97706" />
                        <span>Not Yet Submitted to Faculty</span>
                      </div>
                      <div style={{ color: "#b45309", marginTop: "4px" }}>
                        Your ward has not submitted the hardcopy/journal for this assignment yet.
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

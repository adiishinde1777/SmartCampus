import React from "react";
import { useSmartCampus } from "../../context/SmartCampusContext";
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  AlertCircle,
  GraduationCap,
  Award,
  Info
} from "lucide-react";
import { Badge } from "../common/UIPrimitives";

export default function StudentAssignments() {
  const { currentUser, assignments } = useSmartCampus();

  const student = currentUser;
  const studentYear = student?.year || "1st Year";
  const studentDept = student?.departmentId || "dept-vlsi";

  // Filter assignments relevant to this student
  const relevantAssignments = assignments.filter((asg) => {
    if (!asg.departmentId || asg.departmentId === "common") return true;
    return asg.departmentId === studentDept;
  });

  const submittedCount = relevantAssignments.filter((asg) => {
    const sub = asg.submissions?.find((s) => s.studentId === student?.id);
    return sub && sub.isSubmitted;
  }).length;

  const pendingCount = relevantAssignments.length - submittedCount;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Page Header */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: "800", color: "var(--text-main)", margin: 0 }}>
            Course Assignments & Submission Status
          </h2>
          <span className="badge badge-purple" style={{ fontSize: "0.75rem" }}>
            {studentYear}
          </span>
        </div>
        <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "4px" }}>
          Track teacher assignments, submission deadlines, and evaluation marks
        </p>
      </div>

      {/* Instructions Banner */}
      <div
        className="card"
        style={{
          background: "linear-gradient(135deg, #eff6ff 0%, #f8fafc 100%)",
          border: "1.5px solid #bfdbfe",
          padding: "18px 20px"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "38px",
              height: "38px",
              borderRadius: "10px",
              background: "#dbeafe",
              color: "#2563eb",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0
            }}
          >
            <Info size={20} />
          </div>
          <div>
            <div style={{ fontWeight: "700", fontSize: "0.95rem", color: "#1e3a8a" }}>
              In-Class Assignment Verification Notice
            </div>
            <div style={{ fontSize: "0.82rem", color: "#475569", marginTop: "2px" }}>
              Students do not need to upload files online. Please submit your physical assignments / handwritten journals directly to your respective subject teachers during class hours. The faculty will check your work and publish the submission status & marks here.
            </div>
          </div>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
        <div className="stat-card" style={{ borderLeft: "4px solid #3b82f6" }}>
          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: "600" }}>Total Assigned</div>
          <div style={{ fontSize: "1.6rem", fontWeight: "800", color: "#1e3a8a", marginTop: "4px" }}>
            {relevantAssignments.length}
          </div>
        </div>

        <div className="stat-card" style={{ borderLeft: "4px solid #10b981" }}>
          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: "600" }}>Submitted & Verified</div>
          <div style={{ fontSize: "1.6rem", fontWeight: "800", color: "#065f46", marginTop: "4px" }}>
            {submittedCount}
          </div>
        </div>

        <div className="stat-card" style={{ borderLeft: "4px solid #f59e0b" }}>
          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: "600" }}>Pending Submission</div>
          <div style={{ fontSize: "1.6rem", fontWeight: "800", color: "#b45309", marginTop: "4px" }}>
            {pendingCount}
          </div>
        </div>
      </div>

      {/* Assignment List */}
      {relevantAssignments.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "40px 20px" }}>
          <BookOpen size={44} color="#94a3b8" style={{ margin: "0 auto 12px" }} />
          <h3 style={{ fontSize: "1.1rem", fontWeight: "700", color: "var(--text-main)" }}>No Assignments Published Yet</h3>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "4px" }}>
            Your subject faculties have not posted any new assignments at this time.
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: "20px" }}>
          {relevantAssignments.map((asg) => {
            const sub = asg.submissions?.find((s) => s.studentId === student?.id);
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
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px", gap: "8px" }}>
                    <Badge variant="purple">{asg.subjectName}</Badge>
                    <Badge variant="info">Max {asg.totalPoints} Marks</Badge>
                  </div>

                  <h3 style={{ fontSize: "1.15rem", fontWeight: "700", color: "var(--text-main)", marginBottom: "6px" }}>
                    {asg.title}
                  </h3>

                  <p style={{ fontSize: "0.84rem", color: "var(--text-muted)", lineHeight: 1.5, marginBottom: "16px" }}>
                    {asg.description || "Complete all problems given in textbook assignment module."}
                  </p>

                  <div style={{ background: "var(--bg-surface-secondary)", padding: "10px 14px", borderRadius: "8px", fontSize: "0.8rem", display: "flex", flexDirection: "column", gap: "6px", marginBottom: "16px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "var(--text-muted)" }}>Faculty:</span>
                      <strong>{asg.teacherName || "Course Faculty"}</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "var(--text-muted)" }}>Submission Deadline:</span>
                      <strong style={{ color: "#dc2626" }}>{asg.deadline}</strong>
                    </div>
                  </div>
                </div>

                {/* Submission & Evaluation Box */}
                <div>
                  {isSubmitted ? (
                    <div
                      style={{
                        background: "#ecfdf5",
                        border: "1.5px solid #a7f3d0",
                        borderRadius: "10px",
                        padding: "12px 14px"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px", marginBottom: "6px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#065f46", fontWeight: "700", fontSize: "0.88rem" }}>
                          <CheckCircle2 size={18} color="#059669" />
                          <span>Submitted & Verified</span>
                        </div>
                        <span style={{ fontSize: "0.95rem", fontWeight: "800", color: "#047857" }}>
                          Score: {sub.marks} / {asg.totalPoints}
                        </span>
                      </div>
                      <div style={{ fontSize: "0.8rem", color: "#065f46" }}>
                        <strong>Feedback:</strong> {sub.feedback || "Checked and verified in class."}
                      </div>
                      <div style={{ fontSize: "0.72rem", color: "#047857", marginTop: "4px" }}>
                        Verified on: {sub.submittedOn || "Current Session"}
                      </div>
                    </div>
                  ) : (
                    <div
                      style={{
                        background: "#fffbeb",
                        border: "1.5px solid #fde68a",
                        borderRadius: "10px",
                        padding: "12px 14px"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#b45309", fontWeight: "700", fontSize: "0.86rem", marginBottom: "4px" }}>
                        <Clock size={16} color="#d97706" />
                        <span>Pending Physical Submission</span>
                      </div>
                      <div style={{ fontSize: "0.78rem", color: "#92400e" }}>
                        Please submit your handwritten copy to {asg.teacherName} in class for physical verification and grading.
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

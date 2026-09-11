import React, { useState } from "react";
import { useSmartCampus } from "../../context/SmartCampusContext";
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Upload,
  FileText,
  Download,
  AlertCircle,
  X
} from "lucide-react";
import { Badge, Modal } from "../common/UIPrimitives";

export default function StudentAssignments() {
  const { currentUser, assignments, submitAssignment } = useSmartCampus();

  const [selectedAsg, setSelectedAsg] = useState(null);
  const [submissionFileName, setSubmissionFileName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const student = currentUser;

  const handleOpenSubmit = (asg) => {
    setSelectedAsg(asg);
    setSubmissionFileName(`${student?.name.replace(/\s+/g, "_")}_${asg.subjectName.replace(/\s+/g, "_")}_Solution.pdf`);
  };

  const handleConfirmSubmit = (e) => {
    e.preventDefault();
    if (!selectedAsg) return;

    submitAssignment(selectedAsg.id, student.id, submissionFileName);
    setSelectedAsg(null);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Page Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: "800", color: "var(--text-main)" }}>
            Course Assignments & Project Submissions
          </h2>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "4px" }}>
            Track task deadlines, download resources, and submit coursework for faculty review
          </p>
        </div>
      </div>

      {/* Assignment Cards Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: "20px" }}>
        {assignments.map((asg) => {
          const submission = asg.submissions?.find((s) => s.studentId === student?.id);
          const isSubmitted = Boolean(submission);
          const isReviewed = submission?.status === "Reviewed";

          return (
            <div
              key={asg.id}
              className="card"
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                borderTop: `4px solid ${isReviewed ? "#10b981" : isSubmitted ? "#3b82f6" : "#f59e0b"}`
              }}
            >
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                  <Badge variant="purple">{asg.subjectName}</Badge>
                  {isReviewed ? (
                    <Badge variant="success" icon={CheckCircle2}>Graded: {submission.marks}/{asg.totalPoints}</Badge>
                  ) : isSubmitted ? (
                    <Badge variant="info" icon={CheckCircle2}>Submitted</Badge>
                  ) : (
                    <Badge variant="warning" icon={Clock}>Pending Submission</Badge>
                  )}
                </div>

                <h3 style={{ fontSize: "1.1rem", fontWeight: "700", color: "var(--text-main)", marginBottom: "8px" }}>
                  {asg.title}
                </h3>

                <p style={{ fontSize: "0.84rem", color: "var(--text-muted)", lineHeight: 1.5, marginBottom: "16px" }}>
                  {asg.description}
                </p>

                <div style={{ background: "var(--bg-surface-secondary)", padding: "12px", borderRadius: "8px", fontSize: "0.8rem", display: "flex", flexDirection: "column", gap: "6px", marginBottom: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--text-muted)" }}>Faculty:</span>
                    <strong>{asg.teacherName}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--text-muted)" }}>Deadline:</span>
                    <strong style={{ color: "#b91c1c" }}>{asg.deadline}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--text-muted)" }}>Total Points:</span>
                    <strong>{asg.totalPoints} Marks</strong>
                  </div>
                </div>

                {isSubmitted && (
                  <div style={{ background: "#ecfdf5", border: "1px solid #a7f3d0", padding: "10px 14px", borderRadius: "8px", fontSize: "0.78rem", marginBottom: "16px" }}>
                    <div style={{ fontWeight: "700", color: "#065f46" }}>Uploaded File: {submission.file}</div>
                    <div style={{ color: "#047857", marginTop: "2px" }}>Timestamp: {submission.submittedOn}</div>
                    {submission.feedback && (
                      <div style={{ marginTop: "6px", paddingTop: "6px", borderTop: "1px solid #a7f3d0", color: "#065f46" }}>
                        <strong>Teacher Feedback:</strong> {submission.feedback}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  onClick={() => alert(`Downloading attachment: ${asg.attachments?.[0] || "assignment_brief.pdf"}`)}
                  className="btn btn-secondary btn-sm"
                  style={{ flex: 1 }}
                >
                  <Download size={14} /> Brief PDF
                </button>

                {!isSubmitted ? (
                  <button
                    onClick={() => handleOpenSubmit(asg)}
                    className="btn btn-primary btn-sm"
                    style={{ flex: 1 }}
                  >
                    <Upload size={14} /> Submit Work
                  </button>
                ) : (
                  <button
                    onClick={() => handleOpenSubmit(asg)}
                    className="btn btn-secondary btn-sm"
                    style={{ flex: 1 }}
                  >
                    Resubmit
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Submission Modal */}
      <Modal
        isOpen={Boolean(selectedAsg)}
        onClose={() => setSelectedAsg(null)}
        title={`Submit Assignment: ${selectedAsg?.title}`}
      >
        <form onSubmit={handleConfirmSubmit}>
          <div style={{ marginBottom: "16px" }}>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
              Upload your completed solution document for <strong>{selectedAsg?.subjectName}</strong>.
            </p>
          </div>

          <div className="form-group">
            <label className="form-label">Attached Document Filename</label>
            <input
              type="text"
              className="form-control"
              value={submissionFileName}
              onChange={(e) => setSubmissionFileName(e.target.value)}
              required
            />
          </div>

          <div
            style={{
              border: "2px dashed #cbd5e1",
              borderRadius: "12px",
              padding: "24px",
              textAlign: "center",
              background: "#f8fafc",
              marginBottom: "20px"
            }}
          >
            <Upload size={32} color="var(--primary-600)" style={{ margin: "0 auto 8px" }} />
            <p style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--text-main)" }}>
              File Ready for Upload
            </p>
            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "2px" }}>
              PDF, ZIP, DOCX supported up to 25MB
            </p>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setSelectedAsg(null)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Confirm & Upload
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

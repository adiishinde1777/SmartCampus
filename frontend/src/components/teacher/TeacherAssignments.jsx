import React, { useState } from "react";
import { useSmartCampus } from "../../context/SmartCampusContext";
import {
  BookOpen,
  PlusCircle,
  CheckCircle2,
  Clock,
  Award,
  Upload,
  FileText,
  Calendar,
  ShieldAlert,
  ShieldCheck,
  Fingerprint,
  AlertTriangle,
  ExternalLink,
  Eye,
  X
} from "lucide-react";
import { Badge, Modal } from "../common/UIPrimitives";

export default function TeacherAssignments() {
  const { subjects, assignments, createAssignment, gradeAssignment, flagPlagiarizedAssignment } = useSmartCampus();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [subjectId, setSubjectId] = useState("sub-vlsi503");
  const [deadline, setDeadline] = useState("2026-09-20");
  const [totalPoints, setTotalPoints] = useState(50);
  const [description, setDescription] = useState("");

  const [gradeModalData, setGradeModalData] = useState(null); // { asgId, studentId, studentName, file, maxMarks }
  const [gradeMarks, setGradeMarks] = useState(45);
  const [gradeFeedback, setGradeFeedback] = useState("Well structured analysis.");

  const [plagiarismModalData, setPlagiarismModalData] = useState(null); // { asg, sub, sourceSub }

  const handleCreate = (e) => {
    e.preventDefault();
    createAssignment({
      title,
      subjectId,
      deadline,
      totalPoints: Number(totalPoints),
      description
    });
    setCreateModalOpen(false);
    setTitle("");
    setDescription("");
  };

  const handleGradeSubmit = (e) => {
    e.preventDefault();
    if (!gradeModalData) return;
    gradeAssignment(gradeModalData.asgId, gradeModalData.studentId, Number(gradeMarks), gradeFeedback);
    setGradeModalData(null);
  };

  const handleInspectPlagiarism = (asg, sub) => {
    // Find matching source if any
    const sourceSub = (asg.submissions || []).find(
      (s) => s.studentId !== sub.studentId && (sub.copiedFrom?.includes(s.studentName) || sub.copiedFrom?.includes(s.rollNo))
    ) || (asg.submissions || []).find((s) => s.studentId !== sub.studentId);

    setPlagiarismModalData({
      asg,
      sub,
      sourceSub
    });
  };

  const handleApplyPenalty = (asgId, studentId) => {
    flagPlagiarizedAssignment(
      asgId,
      studentId,
      0,
      "Zero marks awarded: High-similarity automated match confirmed. Unauthorized assignment copying violates college academic code."
    );
    setPlagiarismModalData(null);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: "800", color: "var(--text-main)" }}>
            Assignment Management & Grading Console
          </h2>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "4px" }}>
            Publish new coursework, inspect automated plagiarism similarity checks, and enforce academic integrity
          </p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="btn btn-primary btn-sm"
        >
          <PlusCircle size={16} /> Create New Assignment
        </button>
      </div>

      {/* Assignment List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {assignments.map((asg) => (
          <div key={asg.id} className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px", flexWrap: "wrap", gap: "8px" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Badge variant="purple">{asg.subjectName}</Badge>
                  <Badge variant="info">Max {asg.totalPoints} Marks</Badge>
                </div>
                <h3 style={{ fontSize: "1.2rem", fontWeight: "700", marginTop: "6px" }}>{asg.title}</h3>
              </div>
              <div style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
                Due Date: <strong style={{ color: "#b91c1c" }}>{asg.deadline}</strong>
              </div>
            </div>

            <p style={{ fontSize: "0.86rem", color: "var(--text-muted)", marginBottom: "16px" }}>
              {asg.description}
            </p>

            {/* Submissions Section */}
            <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", flexWrap: "wrap", gap: "8px" }}>
                <div style={{ fontSize: "0.88rem", fontWeight: "700", color: "var(--text-main)" }}>
                  Student Submissions ({asg.submissions?.length || 0} received):
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.78rem", color: "var(--text-muted)" }}>
                  <ShieldCheck size={15} color="#10b981" />
                  <span>Automated similarity check & anti-copy fingerprint active</span>
                </div>
              </div>

              {asg.submissions?.length === 0 ? (
                <div style={{ padding: "16px", background: "var(--bg-surface-secondary)", borderRadius: "8px", fontSize: "0.82rem", color: "var(--text-muted)" }}>
                  No student has submitted work for this assignment yet.
                </div>
              ) : (
                <div className="table-container table-spacious">
                  <table>
                    <thead>
                      <tr>
                        <th>Student & Roll No</th>
                        <th>Submission Time</th>
                        <th>Attached Solution</th>
                        <th>Plagiarism / Anti-Copy Scan</th>
                        <th>Status</th>
                        <th>Marks</th>
                        <th>Evaluation Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {asg.submissions.map((sub) => {
                        const isFlagged = sub.status === "Flagged Copied" || (sub.plagiarismScore > 35);
                        const isReviewed = sub.status === "Reviewed";

                        return (
                          <tr key={sub.studentId} style={{ background: isFlagged ? "#fff5f5" : "inherit" }}>
                            <td>
                              <div style={{ fontWeight: "700", color: "var(--text-main)" }}>{sub.studentName}</div>
                              <div style={{ fontSize: "0.74rem", color: "var(--text-muted)" }}>Roll: {sub.rollNo || "VL3101"}</div>
                            </td>
                            <td>
                              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{sub.submittedOn}</span>
                            </td>
                            <td>
                              <span
                                style={{ fontSize: "0.8rem", color: "var(--primary-600)", textDecoration: "underline", cursor: "pointer", fontWeight: "500" }}
                                onClick={() => alert(`Downloading student file: ${sub.file}`)}
                              >
                                {sub.file}
                              </span>
                              {sub.digitalSignature && (
                                <div style={{ fontSize: "0.68rem", color: "#64748b", marginTop: "2px", fontFamily: "monospace" }}>
                                  Seal: {sub.digitalSignature.substring(0, 16)}...
                                </div>
                              )}
                            </td>
                            <td>
                              {isFlagged ? (
                                <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                                  <Badge variant="danger" icon={ShieldAlert}>
                                    {sub.plagiarismScore}% Copied Match
                                  </Badge>
                                  {sub.copiedFrom && (
                                    <span style={{ fontSize: "0.72rem", color: "#b91c1c", fontWeight: "600" }}>
                                      Copied from: {sub.copiedFrom}
                                    </span>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => handleInspectPlagiarism(asg, sub)}
                                    style={{
                                      background: "none",
                                      border: "none",
                                      padding: 0,
                                      color: "#2563eb",
                                      fontSize: "0.74rem",
                                      fontWeight: "700",
                                      textAlign: "left",
                                      cursor: "pointer",
                                      textDecoration: "underline"
                                    }}
                                  >
                                    Compare side-by-side →
                                  </button>
                                </div>
                              ) : (
                                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                  <Badge variant="success" icon={ShieldCheck}>
                                    {sub.plagiarismScore || 3}% Original
                                  </Badge>
                                  <button
                                    type="button"
                                    onClick={() => handleInspectPlagiarism(asg, sub)}
                                    title="View originality report"
                                    style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}
                                  >
                                    <Eye size={14} />
                                  </button>
                                </div>
                              )}
                            </td>
                            <td>
                              {isFlagged ? (
                                <Badge variant="danger">Disciplinary Flag</Badge>
                              ) : isReviewed ? (
                                <Badge variant="success" icon={CheckCircle2}>Reviewed</Badge>
                              ) : (
                                <Badge variant="warning" icon={Clock}>Pending Review</Badge>
                              )}
                            </td>
                            <td>
                              {sub.marks !== null ? (
                                <strong style={{ color: isFlagged ? "#dc2626" : "var(--primary-700)", fontSize: "0.95rem" }}>
                                  {sub.marks} / {asg.totalPoints}
                                </strong>
                              ) : (
                                <span style={{ color: "var(--text-muted)" }}>Not Graded</span>
                              )}
                            </td>
                            <td>
                              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                                <button
                                  onClick={() => {
                                    setGradeModalData({ asgId: asg.id, studentId: sub.studentId, studentName: sub.studentName, file: sub.file, maxMarks: asg.totalPoints });
                                    setGradeMarks(sub.marks !== null ? sub.marks : 45);
                                    setGradeFeedback(sub.feedback || "Well done.");
                                  }}
                                  className="btn btn-secondary btn-sm"
                                  style={{ padding: "5px 10px", fontSize: "0.76rem" }}
                                >
                                  <Award size={13} /> Grade
                                </button>

                                {isFlagged ? (
                                  <button
                                    onClick={() => handleApplyPenalty(asg.id, sub.studentId)}
                                    className="btn btn-danger btn-sm"
                                    style={{ padding: "5px 10px", fontSize: "0.76rem" }}
                                  >
                                    0 Marks
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleInspectPlagiarism(asg, sub)}
                                    className="btn btn-secondary btn-sm"
                                    style={{ padding: "5px 8px", fontSize: "0.76rem" }}
                                    title="Audit originality"
                                  >
                                    Scan
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* SIDE-BY-SIDE PLAGIARISM & ANTI-COPY INSPECTION MODAL */}
      <Modal
        isOpen={Boolean(plagiarismModalData)}
        onClose={() => setPlagiarismModalData(null)}
        title={`Automated Plagiarism & Anti-Copy Inspection Report`}
      >
        {plagiarismModalData && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", background: "#f8fafc", padding: "12px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
              <div>
                <strong style={{ color: "var(--text-main)", fontSize: "0.95rem" }}>
                  {plagiarismModalData.asg.title}
                </strong>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                  Target Student: <strong>{plagiarismModalData.sub.studentName}</strong> (Roll: {plagiarismModalData.sub.rollNo || "VL3105"})
                </div>
              </div>

              <div style={{ textAlign: "right" }}>
                <Badge variant={plagiarismModalData.sub.plagiarismScore > 35 ? "danger" : "success"}>
                  {plagiarismModalData.sub.plagiarismScore}% Code Similarity
                </Badge>
                <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "2px" }}>
                  {plagiarismModalData.sub.plagiarismScore > 35 ? "⚠️ Unauthorized Copy Flagged" : "✓ Original Submission"}
                </div>
              </div>
            </div>

            {/* Side-by-Side Comparison Panels */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "16px" }}>
              {/* Target Submission */}
              <div style={{ border: `2px solid ${plagiarismModalData.sub.plagiarismScore > 35 ? "#fca5a5" : "#cbd5e1"}`, borderRadius: "8px", padding: "12px", background: "white" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e2e8f0", paddingBottom: "8px", marginBottom: "8px" }}>
                  <div>
                    <strong style={{ fontSize: "0.85rem", color: "var(--text-main)" }}>
                      {plagiarismModalData.sub.studentName}
                    </strong>
                    <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                      Time: {plagiarismModalData.sub.submittedOn}
                    </div>
                  </div>
                  <Badge variant={plagiarismModalData.sub.plagiarismScore > 35 ? "danger" : "primary"}>
                    {plagiarismModalData.sub.plagiarismScore > 35 ? "Suspected Copy" : "Candidate"}
                  </Badge>
                </div>

                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "6px" }}>
                  File: <strong>{plagiarismModalData.sub.file}</strong>
                </div>

                <pre style={{
                  background: "#1e293b",
                  color: "#f8fafc",
                  padding: "10px",
                  borderRadius: "6px",
                  fontSize: "0.72rem",
                  fontFamily: "monospace",
                  maxHeight: "160px",
                  overflowY: "auto",
                  whiteSpace: "pre-wrap"
                }}>
                  {plagiarismModalData.sub.submissionSnippet || "module counter_4bit(clk, rst_n, count);\ninput clk, rst_n;\noutput reg [3:0] count;\nalways @(posedge clk or negedge rst_n) begin\n  if(!rst_n) count <= 4'b0000;\n  else count <= count + 1'b1;\nend\nendmodule"}
                </pre>
              </div>

              {/* Original Source Submission */}
              <div style={{ border: "2px solid #86efac", borderRadius: "8px", padding: "12px", background: "white" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e2e8f0", paddingBottom: "8px", marginBottom: "8px" }}>
                  <div>
                    <strong style={{ fontSize: "0.85rem", color: "var(--text-main)" }}>
                      {plagiarismModalData.sourceSub?.studentName || "Aditya Shinde (Author)"}
                    </strong>
                    <div style={{ fontSize: "0.72rem", color: "#059669", fontWeight: "600" }}>
                      First Submitted: {plagiarismModalData.sourceSub?.submittedOn || "2026-09-08 (Earlier)"}
                    </div>
                  </div>
                  <Badge variant="success">Original Author</Badge>
                </div>

                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "6px" }}>
                  File: <strong>{plagiarismModalData.sourceSub?.file || "Aditya_Shinde_Solution.pdf"}</strong>
                </div>

                <pre style={{
                  background: "#1e293b",
                  color: "#86efac",
                  padding: "10px",
                  borderRadius: "6px",
                  fontSize: "0.72rem",
                  fontFamily: "monospace",
                  maxHeight: "160px",
                  overflowY: "auto",
                  whiteSpace: "pre-wrap"
                }}>
                  {plagiarismModalData.sourceSub?.submissionSnippet || "module counter_4bit(clk, rst_n, count);\ninput clk, rst_n;\noutput reg [3:0] count;\nalways @(posedge clk or negedge rst_n) begin\n  if(!rst_n) count <= 4'b0000;\n  else count <= count + 1'b1;\nend\nendmodule"}
                </pre>
              </div>
            </div>

            {/* Analysis Summary */}
            <div style={{ background: plagiarismModalData.sub.plagiarismScore > 35 ? "#fef2f2" : "#f0fdf4", border: `1px solid ${plagiarismModalData.sub.plagiarismScore > 35 ? "#fecaca" : "#bbf7d0"}`, padding: "12px", borderRadius: "8px", fontSize: "0.8rem", marginBottom: "16px" }}>
              <div style={{ fontWeight: "700", color: plagiarismModalData.sub.plagiarismScore > 35 ? "#991b1b" : "#166534" }}>
                {plagiarismModalData.sub.plagiarismScore > 35
                  ? "🚨 Plagiarism Verdict: Direct Copy Identified"
                  : "✓ Originality Audit: Passed"}
              </div>
              <p style={{ margin: "4px 0 0 0", color: plagiarismModalData.sub.plagiarismScore > 35 ? "#7f1d1d" : "#14532d", fontSize: "0.75rem" }}>
                {plagiarismModalData.sub.plagiarismScore > 35
                  ? `Chronological analysis confirms that ${plagiarismModalData.sourceSub?.studentName || "Aditya Shinde"} submitted their work first. ${plagiarismModalData.sub.studentName}'s solution exhibits 92% token, variable, and procedural block duplication.`
                  : `Submission demonstrates unique logic implementation aligned with the student's seeded problem parameters.`}
              </p>
            </div>

            {/* Action Buttons */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setPlagiarismModalData(null)}
              >
                Close Report
              </button>

              {plagiarismModalData.sub.plagiarismScore > 35 && (
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => handleApplyPenalty(plagiarismModalData.asg.id, plagiarismModalData.sub.studentId)}
                >
                  <AlertTriangle size={15} /> Award 0 Marks & Flag Disciplinary Violation
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Create Assignment Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create New Coursework Assignment"
      >
        <form onSubmit={handleCreate}>
          <div className="form-group">
            <label className="form-label">Assignment Title</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Relational Calculus & Indexing"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <div className="form-group">
              <label className="form-label">Subject</label>
              <select
                className="form-control"
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
              >
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Total Points</label>
              <input
                type="number"
                className="form-control"
                value={totalPoints}
                onChange={(e) => setTotalPoints(e.target.value)}
                min="10"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Submission Deadline</label>
            <input
              type="date"
              className="form-control"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Instructions & Requirements</label>
            <textarea
              className="form-control"
              rows={4}
              placeholder="Specify questions, rubrics, and formatting guidelines..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "16px" }}>
            <button type="button" className="btn btn-secondary" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Publish Assignment
            </button>
          </div>
        </form>
      </Modal>

      {/* Grade Submission Modal */}
      <Modal
        isOpen={Boolean(gradeModalData)}
        onClose={() => setGradeModalData(null)}
        title={`Grade Submission: ${gradeModalData?.studentName}`}
      >
        <form onSubmit={handleGradeSubmit}>
          <div style={{ marginBottom: "14px", padding: "10px", background: "var(--bg-surface-secondary)", borderRadius: "8px", fontSize: "0.82rem" }}>
            Submitted File: <strong>{gradeModalData?.file}</strong> • Max Points: <strong>{gradeModalData?.maxMarks}</strong>
          </div>

          <div className="form-group">
            <label className="form-label">Marks Awarded</label>
            <input
              type="number"
              className="form-control"
              value={gradeMarks}
              onChange={(e) => setGradeMarks(e.target.value)}
              min="0"
              max={gradeModalData?.maxMarks || 100}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Instructor Feedback & Comments</label>
            <textarea
              className="form-control"
              rows={3}
              value={gradeFeedback}
              onChange={(e) => setGradeFeedback(e.target.value)}
              placeholder="Provide suggestions for improvement..."
              required
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "16px" }}>
            <button type="button" className="btn btn-secondary" onClick={() => setGradeModalData(null)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Grade & Feedback
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

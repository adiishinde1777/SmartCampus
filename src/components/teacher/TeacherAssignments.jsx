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
  X
} from "lucide-react";
import { Badge, Modal } from "../common/UIPrimitives";

export default function TeacherAssignments() {
  const { subjects, assignments, createAssignment, gradeAssignment } = useSmartCampus();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [subjectId, setSubjectId] = useState("sub-dbms");
  const [deadline, setDeadline] = useState("2026-09-20");
  const [totalPoints, setTotalPoints] = useState(50);
  const [description, setDescription] = useState("");

  const [gradeModalData, setGradeModalData] = useState(null); // { asgId, studentId, studentName, file }
  const [gradeMarks, setGradeMarks] = useState(45);
  const [gradeFeedback, setGradeFeedback] = useState("Well structured query analysis.");

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

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: "800", color: "var(--text-main)" }}>
            Assignment Management & Grading Console
          </h2>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "4px" }}>
            Publish new coursework assignments, download student submissions, and award grades with personalized feedback
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
              <div style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--text-main)", marginBottom: "10px" }}>
                Student Submissions ({asg.submissions?.length || 0} received):
              </div>

              {asg.submissions?.length === 0 ? (
                <div style={{ padding: "12px", background: "var(--bg-surface-secondary)", borderRadius: "8px", fontSize: "0.8rem", color: "var(--text-muted)" }}>
                  No student has submitted work for this assignment yet.
                </div>
              ) : (
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Student Name</th>
                        <th>Submission Timestamp</th>
                        <th>Attached File</th>
                        <th>Status</th>
                        <th>Marks Awarded</th>
                        <th>Evaluation Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {asg.submissions.map((sub) => (
                        <tr key={sub.studentId}>
                          <td>
                            <strong>{sub.studentName}</strong>
                          </td>
                          <td>{sub.submittedOn}</td>
                          <td>
                            <span style={{ fontSize: "0.78rem", color: "var(--primary-600)", textDecoration: "underline", cursor: "pointer" }} onClick={() => alert(`Downloading student file: ${sub.file}`)}>
                              {sub.file}
                            </span>
                          </td>
                          <td>
                            {sub.status === "Reviewed" ? (
                              <Badge variant="success" icon={CheckCircle2}>Reviewed</Badge>
                            ) : (
                              <Badge variant="warning" icon={Clock}>Pending Review</Badge>
                            )}
                          </td>
                          <td>
                            {sub.marks !== null ? (
                              <strong style={{ color: "var(--primary-700)" }}>{sub.marks} / {asg.totalPoints}</strong>
                            ) : (
                              <span style={{ color: "var(--text-muted)" }}>Not Graded</span>
                            )}
                          </td>
                          <td>
                            <button
                              onClick={() => {
                                setGradeModalData({ asgId: asg.id, studentId: sub.studentId, studentName: sub.studentName, file: sub.file, maxMarks: asg.totalPoints });
                                setGradeMarks(sub.marks || 45);
                                setGradeFeedback(sub.feedback || "Well done.");
                              }}
                              className="btn btn-secondary btn-sm"
                            >
                              <Award size={14} /> Grade Work
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

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

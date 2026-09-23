import React, { useState } from "react";
import { useSmartCampus } from "../../context/SmartCampusContext";
import {
  BookOpen,
  PlusCircle,
  CheckCircle2,
  Clock,
  Award,
  Users,
  Calendar,
  Save,
  Check,
  X,
  FileCheck
} from "lucide-react";
import { Badge, Modal } from "../common/UIPrimitives";

export default function TeacherAssignments() {
  const { users, subjects, assignments, createAssignment, updateStudentAssignmentStatus } = useSmartCampus();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedAsgForGrading, setSelectedAsgForGrading] = useState(null);

  // New assignment form state
  const [title, setTitle] = useState("");
  const [subjectId, setSubjectId] = useState(subjects[0]?.id || "sub-1");
  const [deadline, setDeadline] = useState(new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0]);
  const [totalPoints, setTotalPoints] = useState(25);
  const [description, setDescription] = useState("");

  // Grade edit state for individual students in modal
  const [studentGrades, setStudentGrades] = useState({});

  const enrolledStudents = users.filter((u) => u.role === "student");

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

  const handleOpenGradingModal = (asg) => {
    setSelectedAsgForGrading(asg);
    // Initialize grade state from existing submissions
    const initialMap = {};
    enrolledStudents.forEach((stu) => {
      const sub = asg.submissions?.find((s) => s.studentId === stu.id);
      initialMap[stu.id] = {
        isSubmitted: Boolean(sub && sub.isSubmitted),
        marks: sub?.marks !== undefined && sub?.marks !== null ? sub.marks : asg.totalPoints,
        feedback: sub?.feedback || "Checked and verified in class."
      };
    });
    setStudentGrades(initialMap);
  };

  const handleToggleSubmitted = (stuId) => {
    setStudentGrades((prev) => ({
      ...prev,
      [stuId]: {
        ...prev[stuId],
        isSubmitted: !prev[stuId]?.isSubmitted
      }
    }));
  };

  const handleMarksChange = (stuId, marksVal) => {
    setStudentGrades((prev) => ({
      ...prev,
      [stuId]: {
        ...prev[stuId],
        marks: marksVal
      }
    }));
  };

  const handleFeedbackChange = (stuId, feedbackVal) => {
    setStudentGrades((prev) => ({
      ...prev,
      [stuId]: {
        ...prev[stuId],
        feedback: feedbackVal
      }
    }));
  };

  const handleSaveStudentGrade = (asgId, stuId) => {
    const data = studentGrades[stuId];
    if (!data) return;
    updateStudentAssignmentStatus(asgId, stuId, {
      isSubmitted: data.isSubmitted,
      marks: Number(data.marks),
      feedback: data.feedback
    });
  };

  const handleSaveAllGrades = (asgId) => {
    enrolledStudents.forEach((stu) => {
      const data = studentGrades[stu.id];
      if (data) {
        updateStudentAssignmentStatus(asgId, stu.id, {
          isSubmitted: data.isSubmitted,
          marks: Number(data.marks),
          feedback: data.feedback
        });
      }
    });
    setSelectedAsgForGrading(null);
  };

  const handleMarkAllSubmitted = () => {
    setStudentGrades((prev) => {
      const updated = { ...prev };
      enrolledStudents.forEach((stu) => {
        updated[stu.id] = {
          ...(updated[stu.id] || {}),
          isSubmitted: true
        };
      });
      return updated;
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: "800", color: "var(--text-main)", margin: 0 }}>
            Coursework & Assignment Management Console
          </h2>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "4px" }}>
            Create coursework, verify physical in-class student submissions, and record evaluation marks
          </p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="btn btn-primary btn-sm"
          style={{ display: "flex", alignItems: "center", gap: "6px" }}
        >
          <PlusCircle size={16} /> Create New Assignment
        </button>
      </div>

      {/* Assignment List */}
      {assignments.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "40px 20px" }}>
          <BookOpen size={44} color="#94a3b8" style={{ margin: "0 auto 12px" }} />
          <h3 style={{ fontSize: "1.1rem", fontWeight: "700", color: "var(--text-main)" }}>No Assignments Created Yet</h3>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "4px" }}>
            Click "Create New Assignment" above to assign coursework to students.
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: "20px" }}>
          {assignments.map((asg) => {
            const submittedCount = (asg.submissions || []).filter((s) => s.isSubmitted).length;
            const totalStudents = enrolledStudents.length;
            const completionPercent = totalStudents > 0 ? Math.round((submittedCount / totalStudents) * 100) : 0;

            return (
              <div key={asg.id} className="card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px", gap: "8px" }}>
                    <Badge variant="purple">{asg.subjectName}</Badge>
                    <Badge variant="info">Max {asg.totalPoints} Marks</Badge>
                  </div>

                  <h3 style={{ fontSize: "1.15rem", fontWeight: "700", color: "var(--text-main)", marginBottom: "6px" }}>
                    {asg.title}
                  </h3>

                  <p style={{ fontSize: "0.84rem", color: "var(--text-muted)", lineHeight: 1.5, marginBottom: "14px" }}>
                    {asg.description || "Coursework assignment to be submitted in physical journal form."}
                  </p>

                  <div style={{ background: "var(--bg-surface-secondary)", padding: "10px 14px", borderRadius: "8px", fontSize: "0.8rem", display: "flex", flexDirection: "column", gap: "6px", marginBottom: "16px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "var(--text-muted)" }}>Submission Deadline:</span>
                      <strong style={{ color: "#dc2626" }}>{asg.deadline}</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "var(--text-muted)" }}>Class Submissions:</span>
                      <strong>{submittedCount} / {totalStudents} Students ({completionPercent}%)</strong>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleOpenGradingModal(asg)}
                  className="btn btn-secondary btn-sm"
                  style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "10px" }}
                >
                  <FileCheck size={16} />
                  <span>Verify Submissions & Grade ({submittedCount}/{totalStudents})</span>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE ASSIGNMENT MODAL */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Publish New Assignment"
      >
        <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div className="form-group">
            <label className="form-label" style={{ fontWeight: "700" }}>Assignment Title</label>
            <input
              type="text"
              required
              className="form-control"
              placeholder="e.g. Assignment 1: Design CMOS Inverter Schematic"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: "700" }}>Subject</label>
              <select
                className="form-control"
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
              >
                {subjects.length > 0 ? (
                  subjects.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))
                ) : (
                  <option value="sub-gen">General Coursework</option>
                )}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontWeight: "700" }}>Total Points</label>
              <input
                type="number"
                min="5"
                max="100"
                className="form-control"
                value={totalPoints}
                onChange={(e) => setTotalPoints(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" style={{ fontWeight: "700" }}>Submission Deadline</label>
            <input
              type="date"
              required
              className="form-control"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label" style={{ fontWeight: "700" }}>Instructions / Description</label>
            <textarea
              className="form-control"
              rows={3}
              placeholder="Provide questions, textbook reference, or journal requirements..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "12px" }}>
            <button
              type="button"
              onClick={() => setCreateModalOpen(false)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
            >
              Publish Assignment
            </button>
          </div>
        </form>
      </Modal>

      {/* VERIFY SUBMISSIONS & GRADE MODAL */}
      {selectedAsgForGrading && (
        <Modal
          isOpen={Boolean(selectedAsgForGrading)}
          onClose={() => setSelectedAsgForGrading(null)}
          title={`Grade: ${selectedAsgForGrading.title} (Max ${selectedAsgForGrading.totalPoints} Marks)`}
          maxWidth="750px"
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f8fafc", padding: "10px 14px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
              <span style={{ fontSize: "0.85rem", color: "#64748b" }}>
                Total Enrolled Students: <strong>{enrolledStudents.length}</strong>
              </span>
              <button
                type="button"
                onClick={handleMarkAllSubmitted}
                className="btn btn-secondary btn-sm"
              >
                Mark All as Submitted
              </button>
            </div>

            {enrolledStudents.length === 0 ? (
              <div style={{ textAlign: "center", padding: "30px", color: "var(--text-muted)" }}>
                No students enrolled in the system yet. Once students register, they will appear here for grading.
              </div>
            ) : (
              <div style={{ maxHeight: "380px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "12px" }}>
                {enrolledStudents.map((stu) => {
                  const currentGrade = studentGrades[stu.id] || {
                    isSubmitted: false,
                    marks: selectedAsgForGrading.totalPoints,
                    feedback: "Checked in class"
                  };

                  return (
                    <div
                      key={stu.id}
                      style={{
                        padding: "12px 14px",
                        borderRadius: "10px",
                        border: currentGrade.isSubmitted ? "1.5px solid #a7f3d0" : "1.5px solid #e2e8f0",
                        background: currentGrade.isSubmitted ? "#f0fdf4" : "white",
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px"
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
                        <div>
                          <div style={{ fontWeight: "700", color: "#0f172a" }}>
                            {stu.name}
                          </div>
                          <div style={{ fontSize: "0.78rem", color: "#64748b" }}>
                            PRN: {stu.prn || "N/A"} • Roll: {stu.rollNo || "N/A"} • Year: {stu.year || "1st Year"}
                          </div>
                        </div>

                        <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "0.84rem", fontWeight: "700", color: currentGrade.isSubmitted ? "#059669" : "#64748b" }}>
                          <input
                            type="checkbox"
                            checked={currentGrade.isSubmitted}
                            onChange={() => handleToggleSubmitted(stu.id)}
                            style={{ width: "18px", height: "18px", cursor: "pointer" }}
                          />
                          <span>{currentGrade.isSubmitted ? "Submitted ✓" : "Not Submitted"}</span>
                        </label>
                      </div>

                      {currentGrade.isSubmitted && (
                        <div style={{ display: "grid", gridTemplateColumns: "100px 1fr auto", gap: "10px", alignItems: "center" }}>
                          <div>
                            <input
                              type="number"
                              min="0"
                              max={selectedAsgForGrading.totalPoints}
                              value={currentGrade.marks}
                              onChange={(e) => handleMarksChange(stu.id, e.target.value)}
                              className="form-control"
                              placeholder="Marks"
                              style={{ padding: "6px 10px", fontSize: "0.85rem" }}
                            />
                          </div>

                          <div>
                            <input
                              type="text"
                              value={currentGrade.feedback}
                              onChange={(e) => handleFeedbackChange(stu.id, e.target.value)}
                              className="form-control"
                              placeholder="Remarks (e.g. Good journal work)"
                              style={{ padding: "6px 10px", fontSize: "0.85rem" }}
                            />
                          </div>

                          <button
                            type="button"
                            onClick={() => handleSaveStudentGrade(selectedAsgForGrading.id, stu.id)}
                            className="btn btn-primary btn-sm"
                            style={{ padding: "6px 12px", whiteSpace: "nowrap" }}
                          >
                            <Save size={14} /> Save
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", borderTop: "1px solid #e2e8f0", paddingTop: "14px", marginTop: "8px" }}>
              <button
                type="button"
                onClick={() => setSelectedAsgForGrading(null)}
                className="btn btn-secondary"
              >
                Close
              </button>
              {enrolledStudents.length > 0 && (
                <button
                  type="button"
                  onClick={() => handleSaveAllGrades(selectedAsgForGrading.id)}
                  className="btn btn-primary"
                >
                  Save All Records
                </button>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

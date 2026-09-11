import React, { useState } from "react";
import { useSmartCampus } from "../../context/SmartCampusContext";
import {
  Award,
  Send,
  CheckCircle2,
  Users,
  TrendingUp,
  BarChart3,
  FileSpreadsheet,
  CheckCheck
} from "lucide-react";
import { Badge, Modal } from "../common/UIPrimitives";

export default function TeacherMarks() {
  const { subjects, users, submitMarks, switchUser } = useSmartCampus();

  const [selectedSubject, setSelectedSubject] = useState("sub-dbms");
  const [examType, setExamType] = useState("Unit Test 1");
  const [maxMarks, setMaxMarks] = useState(25);
  const [remarks, setRemarks] = useState("Unit Test 1 evaluated and published.");

  const enrolledStudents = users.filter((u) => u.role === "student" && u.departmentId === "dept-ce");

  // Marks inputs state: { [studentId]: number }
  const [marksMap, setMarksMap] = useState({
    "stu-1": 18, // Rahul Patil
    "stu-2": 24, // Sneha Sharma
    "stu-3": 21, // Amit Joshi
    "stu-4": 22, // Priya Deshmukh
    "stu-5": 14  // Aditya Kulkarni
  });

  const [resultModalOpen, setResultModalOpen] = useState(false);

  const handleScoreChange = (stuId, val) => {
    setMarksMap((prev) => ({
      ...prev,
      [stuId]: Number(val)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const marksRecords = enrolledStudents.map((stu) => ({
      studentId: stu.id,
      marksObtained: marksMap[stu.id] || 0,
      remarks: marksMap[stu.id] >= 20 ? "Excellent mastery" : marksMap[stu.id] >= 15 ? "Good performance" : "Requires remedial revision"
    }));

    submitMarks({
      subjectId: selectedSubject,
      examType,
      maxMarks: Number(maxMarks),
      marksRecords,
      remarks
    });

    setResultModalOpen(true);
  };

  const subjectObj = subjects.find((s) => s.id === selectedSubject) || subjects[0];
  const scoresArray = Object.values(marksMap);
  const avgScore = scoresArray.length > 0 ? (scoresArray.reduce((a, b) => a + b, 0) / scoresArray.length).toFixed(1) : 0;
  const avgPercentage = maxMarks > 0 ? Math.round((avgScore / maxMarks) * 100) : 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: "800", color: "var(--text-main)" }}>
            Academic Marks Management & Evaluation Portal
          </h2>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "4px" }}>
            Enter and publish unit test and continuous evaluation scores with automated student and parent alerts
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <Badge variant="purple">Class Avg: {avgScore} / {maxMarks} ({avgPercentage}%)</Badge>
        </div>
      </div>

      {/* Evaluation Parameters */}
      <div className="card">
        <div style={{ fontSize: "0.8rem", fontWeight: "700", color: "var(--primary-700)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "12px" }}>
          Assessment Scope Configuration
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Subject</label>
            <select
              className="form-control"
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
            >
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Assessment / Exam Type</label>
            <select
              className="form-control"
              value={examType}
              onChange={(e) => setExamType(e.target.value)}
            >
              <option value="Unit Test 1">Unit Test 1</option>
              <option value="Unit Test 2">Unit Test 2</option>
              <option value="Mid-Term Assessment">Mid-Term Assessment</option>
              <option value="Practical Exam">Practical Exam</option>
            </select>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Maximum Marks</label>
            <input
              type="number"
              className="form-control"
              value={maxMarks}
              onChange={(e) => setMaxMarks(e.target.value)}
              min="1"
            />
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">General Feedback Remark</label>
            <input
              type="text"
              className="form-control"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Marks Entry Grid */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">
              <Award size={18} color="var(--primary-600)" />
              Score Sheet: {subjectObj.name} - {examType}
            </div>
            <div className="card-subtitle">Enter student marks below. Automatic grades and statistics compute instantly.</div>
          </div>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Roll No</th>
                <th>Student Name</th>
                <th>Marks Obtained (Max: {maxMarks})</th>
                <th>Percentage</th>
                <th>Grade</th>
                <th>Performance Status</th>
              </tr>
            </thead>
            <tbody>
              {enrolledStudents.map((stu) => {
                const score = marksMap[stu.id] !== undefined ? marksMap[stu.id] : 0;
                const pct = maxMarks > 0 ? Math.round((score / maxMarks) * 100) : 0;
                let grade = "A+";
                let badgeVariant = "success";
                if (pct < 50) { grade = "F"; badgeVariant = "danger"; }
                else if (pct < 60) { grade = "C"; badgeVariant = "warning"; }
                else if (pct < 75) { grade = "B"; badgeVariant = "info"; }
                else if (pct < 85) { grade = "A"; badgeVariant = "primary"; }

                return (
                  <tr key={stu.id}>
                    <td>
                      <Badge variant="gray">{stu.rollNo}</Badge>
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <img
                          src={stu.avatar}
                          alt={stu.name}
                          style={{ width: "32px", height: "32px", borderRadius: "50%", objectFit: "cover" }}
                        />
                        <strong style={{ color: "var(--text-main)" }}>{stu.name}</strong>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <input
                          type="number"
                          className="form-control"
                          style={{ width: "90px", fontWeight: "700", fontSize: "1rem" }}
                          value={score}
                          min="0"
                          max={maxMarks}
                          onChange={(e) => handleScoreChange(stu.id, e.target.value)}
                        />
                        <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>/ {maxMarks}</span>
                      </div>
                    </td>
                    <td>
                      <strong>{pct}%</strong>
                    </td>
                    <td>
                      <Badge variant={badgeVariant}>{grade}</Badge>
                    </td>
                    <td>
                      <span style={{ fontSize: "0.8rem", color: pct >= 60 ? "var(--success-text)" : "var(--danger-text)", fontWeight: "600" }}>
                        {pct >= 75 ? "✓ Distinction" : pct >= 50 ? "✓ Passed" : "⚠️ Needs Remedial Help"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Submit Marks Action */}
        <div
          style={{
            padding: "20px",
            borderTop: "1px solid var(--border-subtle)",
            background: "var(--bg-surface-secondary)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "16px"
          }}
        >
          <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
            ⚡ Submitting marks publishes the scorecards to student and parent dashboards, and alerts them via in-app and SMS/WhatsApp notifications.
          </div>

          <button
            onClick={handleSubmit}
            className="btn btn-primary btn-lg"
            style={{
              padding: "12px 28px",
              boxShadow: "0 4px 15px rgba(37, 99, 235, 0.4)"
            }}
          >
            <Send size={18} />
            <span>Publish Marks & Notify Parents</span>
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={resultModalOpen}
        onClose={() => setResultModalOpen(false)}
        title="✓ Marks Published & Alerts Dispatched!"
        maxWidth="620px"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ background: "#ecfdf5", border: "1px solid #a7f3d0", padding: "16px", borderRadius: "12px", display: "flex", alignItems: "center", gap: "12px" }}>
            <CheckCheck size={28} color="#059669" />
            <div>
              <h4 style={{ fontSize: "1.05rem", fontWeight: "800", color: "#065f46" }}>
                Scores Successfully Recorded
              </h4>
              <p style={{ fontSize: "0.82rem", color: "#047857" }}>
                {subjectObj.name} ({examType}) scores for {enrolledStudents.length} students published.
              </p>
            </div>
          </div>

          <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
            • Rahul Patil scored <strong>{marksMap["stu-1"] || 18} / {maxMarks}</strong> (Alert dispatched to Suresh Patil)<br />
            • Sneha Sharma scored <strong>{marksMap["stu-2"] || 24} / {maxMarks}</strong><br />
            • Updated student academic averages, HOD analytics, and Principal institution marks metrics.
          </div>

          <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => {
                setResultModalOpen(false);
                switchUser("par-1"); // Switch to Parent View to see updated marks
              }}
            >
              <span>Switch to Parent View (Suresh Patil)</span>
            </button>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setResultModalOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

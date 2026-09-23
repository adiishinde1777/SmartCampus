import React, { useState, useEffect } from "react";
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
  const { subjects, users, departments, submitMarks, switchUser } = useSmartCampus();

  const [selectedDept, setSelectedDept] = useState("dept-vlsi");
  const [selectedClass, setSelectedClass] = useState("TE VLSI – Semester 5 (3rd Year)");
  const [selectedBatch, setSelectedBatch] = useState("all");
  const [selectedSubject, setSelectedSubject] = useState("sub-vlsi501");
  const [category, setCategory] = useState("Theory"); // "Theory" | "Practical"
  const [examType, setExamType] = useState("Class Test 1 (CT-1)");
  const [maxMarks, setMaxMarks] = useState(25);
  const [remarks, setRemarks] = useState("Class Test 1 evaluated and published.");
  const [isMarksLoaded, setIsMarksLoaded] = useState(false);

  // Pre-configured assessment lists
  const theoryExams = [
    { name: "Class Test 1 (CT-1)", defaultMax: 25, desc: "Theory Class Test 1" },
    { name: "Mid-Semester Examination", defaultMax: 50, desc: "Mid-Sem Theory Exam" },
    { name: "Class Test 2 (CT-2)", defaultMax: 25, desc: "Theory Class Test 2" },
    { name: "Unit Test 1", defaultMax: 25, desc: "Periodic Unit Test" },
    { name: "Unit Test 2", defaultMax: 25, desc: "Periodic Unit Test 2" },
  ];

  const practicalExams = [
    { name: "Lab Continuous Assessment (ICA)", defaultMax: 25, desc: "Continuous Lab Work & Journal Assessment" },
    { name: "Practical Exam (POE)", defaultMax: 50, desc: "Hands-on Practical & Oral Examination" },
    { name: "Lab Viva-Voce", defaultMax: 25, desc: "Oral Technical Assessment" },
    { name: "Term Work (TW)", defaultMax: 50, desc: "Term Work & Lab File Submission" },
  ];

  const handleCategoryChange = (newCat) => {
    setCategory(newCat);
    if (newCat === "Theory") {
      setExamType("Class Test 1 (CT-1)");
      setMaxMarks(25);
      setRemarks("Class Test 1 evaluated and published.");
    } else {
      setExamType("Lab Continuous Assessment (ICA)");
      setMaxMarks(25);
      setRemarks("Lab Continuous Assessment & Journal evaluation completed.");
    }
  };

  const handleExamTypeChange = (newExam) => {
    setExamType(newExam);
    const list = category === "Theory" ? theoryExams : practicalExams;
    const match = list.find((item) => item.name === newExam);
    if (match) {
      setMaxMarks(match.defaultMax);
      setRemarks(`${match.name} evaluation completed.`);
    }
  };

  const enrolledStudents = users
    .filter((u) => {
      if (u.role !== "student") return false;
      if (u.departmentId !== selectedDept) return false;
      if (selectedDept === "dept-vlsi") {
        if (selectedClass.includes("2nd Year") || selectedClass.includes("SE")) {
          if (!(u.semester === 3 || u.semester === 4 || u.year?.includes("Second") || u.className?.includes("SE") || u.batch?.includes("SE"))) return false;
        } else if (selectedClass.includes("Final Year") || selectedClass.includes("BE")) {
          if (!(u.semester === 7 || u.semester === 8 || u.year?.includes("Final") || u.className?.includes("BE") || u.batch?.includes("BE"))) return false;
        } else {
          // 3rd Year (TE)
          if (!(u.semester === 5 || u.semester === 6 || u.year?.includes("Third") || u.className?.includes("TE") || u.batch?.includes("TE"))) return false;
        }
        if (selectedBatch === "TA1" && u.batch !== "TA1" && u.batch !== "SA1" && u.batch !== "BA1") return false;
        if (selectedBatch === "TA2" && u.batch !== "TA2" && u.batch !== "SA2" && u.batch !== "BA2") return false;
      }
      return true;
    })
    .sort((a, b) => (a.rollNo || "").localeCompare(b.rollNo || ""));

  // Marks inputs state: { [studentId]: number }
  const [marksMap, setMarksMap] = useState(() => {
    const map = {};
    enrolledStudents.forEach((stu, idx) => {
      map[stu.id] = 16 + ((idx * 7) % 9);
    });
    map["stu-1"] = 18; // Aditya Shinde
    return map;
  });

  // Re-sync marksMap when enrolled roster changes
  useEffect(() => {
    const map = {};
    enrolledStudents.forEach((stu, idx) => {
      map[stu.id] = 16 + ((idx * 7) % 9);
    });
    if (marksMap["stu-1"]) map["stu-1"] = marksMap["stu-1"];
    setMarksMap(map);
  }, [selectedDept, selectedBatch, selectedClass]);

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
      remarks: marksMap[stu.id] >= (maxMarks * 0.8) ? "Excellent mastery" : marksMap[stu.id] >= (maxMarks * 0.6) ? "Good performance" : "Requires remedial revision"
    }));

    submitMarks({
      subjectId: selectedSubject,
      category,
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
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <div style={{ fontSize: "0.8rem", fontWeight: "700", color: "var(--primary-700)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Assessment Category & Scope Configuration
            </div>
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "2px" }}>
              Choose whether to grade Theoretical Examinations or Practical / Lab Continuous Assessments
            </div>
          </div>

          {/* Theory vs Practical Category Switcher */}
          <div style={{ display: "flex", background: "var(--bg-surface-secondary)", padding: "4px", borderRadius: "10px", border: "1px solid var(--border-subtle)", gap: "4px" }}>
            <button
              type="button"
              onClick={() => handleCategoryChange("Theory")}
              style={{
                padding: "8px 16px",
                borderRadius: "8px",
                border: "none",
                fontWeight: "700",
                fontSize: "0.85rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                transition: "all 0.2s ease",
                background: category === "Theory" ? "var(--color-primary)" : "transparent",
                color: category === "Theory" ? "#ffffff" : "var(--text-muted)",
                boxShadow: category === "Theory" ? "0 2px 8px rgba(37, 99, 235, 0.3)" : "none"
              }}
            >
              <span>📘 Theory Assessments</span>
              <span style={{ fontSize: "0.7rem", opacity: 0.8 }}>(CT-1, Mid-Sem, CT-2)</span>
            </button>
            <button
              type="button"
              onClick={() => handleCategoryChange("Practical")}
              style={{
                padding: "8px 16px",
                borderRadius: "8px",
                border: "none",
                fontWeight: "700",
                fontSize: "0.85rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                transition: "all 0.2s ease",
                background: category === "Practical" ? "var(--color-secondary, #10b981)" : "transparent",
                color: category === "Practical" ? "#ffffff" : "var(--text-muted)",
                boxShadow: category === "Practical" ? "0 2px 8px rgba(16, 185, 129, 0.3)" : "none"
              }}
            >
              <span>🔬 Practical / Lab Marks</span>
              <span style={{ fontSize: "0.7rem", opacity: 0.8 }}>(ICA, POE, Viva, TW)</span>
            </button>
          </div>

          {/* Quick Exam Shortcut Pills */}
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ fontSize: "0.8rem", fontWeight: "700", color: "var(--text-muted)" }}>Quick Exam:</span>
            <button
              type="button"
              onClick={() => {
                setCategory("Theory");
                handleExamTypeChange("Class Test 1 (CT-1)");
              }}
              style={{
                padding: "5px 12px",
                borderRadius: "8px",
                border: examType === "Class Test 1 (CT-1)" ? "1.5px solid #2563eb" : "1px solid var(--border-subtle)",
                background: examType === "Class Test 1 (CT-1)" ? "#2563eb" : "var(--bg-surface)",
                color: examType === "Class Test 1 (CT-1)" ? "#fff" : "var(--text-main)",
                fontSize: "0.78rem",
                fontWeight: "700",
                cursor: "pointer"
              }}
            >
              Class Test 1 (CT-1)
            </button>
            <button
              type="button"
              onClick={() => {
                setCategory("Theory");
                handleExamTypeChange("Mid-Semester Examination");
              }}
              style={{
                padding: "5px 12px",
                borderRadius: "8px",
                border: examType === "Mid-Semester Examination" ? "1.5px solid #7c3aed" : "1px solid var(--border-subtle)",
                background: examType === "Mid-Semester Examination" ? "#7c3aed" : "var(--bg-surface)",
                color: examType === "Mid-Semester Examination" ? "#fff" : "var(--text-main)",
                fontSize: "0.78rem",
                fontWeight: "700",
                cursor: "pointer"
              }}
            >
              Mid-Semester Exam
            </button>
            <button
              type="button"
              onClick={() => {
                setCategory("Theory");
                handleExamTypeChange("Class Test 2 (CT-2)");
              }}
              style={{
                padding: "5px 12px",
                borderRadius: "8px",
                border: examType === "Class Test 2 (CT-2)" ? "1.5px solid #0891b2" : "1px solid var(--border-subtle)",
                background: examType === "Class Test 2 (CT-2)" ? "#0891b2" : "var(--bg-surface)",
                color: examType === "Class Test 2 (CT-2)" ? "#fff" : "var(--text-main)",
                fontSize: "0.78rem",
                fontWeight: "700",
                cursor: "pointer"
              }}
            >
              Class Test 2 (CT-2)
            </button>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Department</label>
            <select
              className="form-control"
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
            >
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Class / Academic Year</label>
            <select
              className="form-control"
              value={selectedClass}
              onChange={(e) => {
                setSelectedClass(e.target.value);
                setIsMarksLoaded(false);
              }}
              disabled={selectedDept !== "dept-vlsi"}
            >
              {selectedDept === "dept-vlsi" ? (
                <>
                  <option value="TE VLSI – Semester 5 (3rd Year)">3rd Year (TE VLSI – Sem 5 & 6)</option>
                  <option value="SE VLSI – Semester 3 (2nd Year)">2nd Year (SE VLSI – Sem 3 & 4)</option>
                  <option value="BE VLSI – Semester 7 (Final Year)">Final Year (BE VLSI – Sem 7 & 8)</option>
                </>
              ) : (
                <option value="">No Active Class (Roster Empty)</option>
              )}
            </select>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Batch Filter</label>
            <select
              className="form-control"
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
              disabled={selectedDept !== "dept-vlsi"}
            >
              <option value="all">All Students (72 Enrolled)</option>
              <option value="TA1">Batch TA1 (Roll VL3101 to VL3136)</option>
              <option value="TA2">Batch TA2 (Roll VL3137 to VL3172)</option>
            </select>
          </div>

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
            <label className="form-label">
              {category === "Theory" ? "📘 Theory Exam Type" : "🔬 Practical Assessment Type"}
            </label>
            <select
              className="form-control"
              value={examType}
              onChange={(e) => handleExamTypeChange(e.target.value)}
              style={{ fontWeight: "600", borderColor: category === "Theory" ? "var(--color-primary)" : "#10b981" }}
            >
              {(category === "Theory" ? theoryExams : practicalExams).map((ex) => (
                <option key={ex.name} value={ex.name}>
                  {ex.name} (Max: {ex.defaultMax})
                </option>
              ))}
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
            <label className="form-label">Assessment Description / Remarks</label>
            <input
              type="text"
              className="form-control"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />
          </div>
        </div>

        {/* Load / Gate Control Bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: "16px",
            paddingTop: "14px",
            borderTop: "1px solid #e2e8f0",
            flexWrap: "wrap",
            gap: "10px"
          }}
        >
          <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
            {isMarksLoaded ? (
              <span>Active Score Sheet: <strong>{subjectObj?.name}</strong> • {examType} (Max: {maxMarks}) • <strong>{enrolledStudents.length} Students</strong></span>
            ) : (
              <span>Configure Department, Subject & Exam above, then click <strong>"Load Marks Evaluation Sheet"</strong> to enter marks.</span>
            )}
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            {isMarksLoaded ? (
              <button
                type="button"
                onClick={() => setIsMarksLoaded(false)}
                className="btn btn-secondary btn-sm"
              >
                Hide Marks Sheet
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsMarksLoaded(true)}
                className="btn btn-primary"
                style={{ fontWeight: "700" }}
              >
                <Award size={16} /> Load Marks Evaluation Sheet
              </button>
            )}
          </div>
        </div>
      </div>

      {!isMarksLoaded ? (
        <div
          className="card"
          style={{
            padding: "54px 24px",
            textAlign: "center",
            background: "var(--bg-surface-secondary)",
            border: "2px dashed var(--border-strong)",
            borderRadius: "14px"
          }}
        >
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "14px",
              background: "#eff6ff",
              color: "#2563eb",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px auto"
            }}
          >
            <Award size={28} />
          </div>
          <h3 style={{ fontSize: "1.25rem", fontWeight: "800", color: "var(--text-main)" }}>
            Student Marks Records Protected
          </h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", maxWidth: "520px", margin: "8px auto 22px auto", lineHeight: "1.5" }}>
            Student evaluation scores and grades are not displayed openly. Please confirm your Department (<strong>Electronic Engineering VLSI</strong>), Class, Subject, and Assessment type above, then click below to display the marks evaluation sheet.
          </p>
          <button
            type="button"
            onClick={() => setIsMarksLoaded(true)}
            className="btn btn-primary btn-lg"
            style={{ display: "inline-flex", alignItems: "center", gap: "8px", margin: "0 auto", fontWeight: "700" }}
          >
            <Award size={18} /> Load Marks Evaluation Sheet ({subjectObj?.name || "Subject"})
          </button>
        </div>
      ) : (
        /* Marks Entry Grid */
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

        <div className="table-container table-spacious">
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
              {enrolledStudents.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center", padding: "48px 20px", color: "var(--text-muted)" }}>
                    <Users size={40} style={{ opacity: 0.3, margin: "0 auto 12px", display: "block" }} />
                    <div style={{ fontWeight: "700", fontSize: "1.05rem", color: "var(--text-main)" }}>No Students Enrolled in this Department</div>
                    <p style={{ fontSize: "0.85rem", marginTop: "6px", maxWidth: "480px", margin: "6px auto 0" }}>
                      Student database is currently populated exclusively for <strong>Electronics Engineering (VLSI Design & Technology) – 3rd Year (TE VLSI)</strong>.
                    </p>
                  </td>
                </tr>
              ) : (
                enrolledStudents.map((stu) => {
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
                      <Badge variant="primary">{stu.rollNo}</Badge>
                      {stu.batch && (
                        <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "2px" }}>
                          {stu.batch}
                        </div>
                      )}
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        {stu.avatar ? (
                          <img
                            src={stu.avatar}
                            alt={stu.name}
                            style={{ width: "32px", height: "32px", borderRadius: "50%", objectFit: "cover" }}
                          />
                        ) : (
                          <div
                            style={{
                              width: "32px",
                              height: "32px",
                              borderRadius: "50%",
                              background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                              color: "white",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontWeight: "700",
                              fontSize: "0.75rem",
                              flexShrink: 0
                            }}
                          >
                            {stu.name ? stu.name.split(" ").slice(0, 2).map((n) => n[0]).join("") : "ST"}
                          </div>
                        )}
                        <div>
                          <strong style={{ color: "var(--text-main)" }}>{stu.name}</strong>
                          <div style={{ fontSize: "0.72rem", color: "var(--color-primary)", fontFamily: "monospace" }}>
                            PRN: {stu.prn || stu.prnNo}
                          </div>
                        </div>
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
              }))}
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
      )}

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
            • Aditya Shinde scored <strong>{marksMap["stu-1"] || 18} / {maxMarks}</strong> (Alert dispatched to Santosh Shinde)<br />
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
              <span>Switch to Parent View (Santosh Shinde)</span>
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

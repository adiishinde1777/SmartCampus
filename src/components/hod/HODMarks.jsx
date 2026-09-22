import React, { useState } from "react";
import { useSmartCampus } from "../../context/SmartCampusContext";
import {
  Award,
  Download,
  Filter,
  Users,
  TrendingUp,
  ShieldCheck,
  Search,
  Printer,
  BookOpen,
  FlaskConical,
  GraduationCap,
  Layers
} from "lucide-react";
import { Badge } from "../common/UIPrimitives";
import PrintHeader, { PrintSignatures } from "../common/PrintHeader";

export default function HODMarks() {
  const { currentUser, subjects, users, marks, departments } = useSmartCampus();

  const deptId = currentUser?.departmentId || "dept-vlsi";
  const activeDept = departments.find((d) => d.id === deptId) || {
    id: deptId,
    name: currentUser?.departmentName || "Electronic Engineering (VLSI Design And Technology)"
  };

  const [selectedYear, setSelectedYear] = useState("3rd-year"); // 'all' | '2nd-year' | '3rd-year' | 'final-year'
  const [selectedExamType, setSelectedExamType] = useState("all"); // 'all' | 'ct1' | 'midsem' | 'ct2' | 'practical'
  const [searchTerm, setSearchTerm] = useState("");
  const [isMarksLoaded, setIsMarksLoaded] = useState(false);

  const deptSubjects = subjects.filter((s) => {
    if (s.departmentId !== deptId && s.departmentId !== "dept-vlsi") return false;
    if (selectedYear === "2nd-year") return s.semester === 3 || s.semester === 4;
    if (selectedYear === "3rd-year") return s.semester === 5 || s.semester === 6;
    if (selectedYear === "final-year") return s.semester === 7 || s.semester === 8;
    return true;
  });

  const deptStudents = users.filter((u) => {
    if (u.role !== "student" || u.departmentId !== deptId) return false;
    if (selectedYear === "2nd-year") return u.semester === 3 || u.semester === 4 || u.year?.includes("Second") || u.className?.includes("SE") || u.batch?.includes("SE");
    if (selectedYear === "3rd-year") return u.semester === 5 || u.semester === 6 || u.year?.includes("Third") || u.className?.includes("TE") || u.batch?.includes("TE");
    if (selectedYear === "final-year") return u.semester === 7 || u.semester === 8 || u.year?.includes("Final") || u.className?.includes("BE") || u.batch?.includes("BE");
    return true;
  });

  const [selectedSubId, setSelectedSubId] = useState(deptSubjects[0]?.id || "sub-vlsi501");
  const selectedSubject = deptSubjects.find((s) => s.id === selectedSubId) || deptSubjects[0];

  const filteredStudents = deptStudents.filter((stu) => {
    const term = searchTerm.toLowerCase();
    return stu.name.toLowerCase().includes(term) || stu.rollNo.toLowerCase().includes(term);
  });

  const isCT1 = (m) => m && (m.examType?.toLowerCase().includes("ct-1") || m.examType?.toLowerCase().includes("class test 1") || m.examType?.toLowerCase().includes("unit test 1"));
  const isMidSem = (m) => m && (m.examType?.toLowerCase().includes("mid-sem") || m.examType?.toLowerCase().includes("mid semester"));
  const isCT2 = (m) => m && (m.examType?.toLowerCase().includes("ct-2") || m.examType?.toLowerCase().includes("class test 2") || m.examType?.toLowerCase().includes("unit test 2"));
  const isPractical = (m) => m && (m.category === "Practical" || m.examType?.toLowerCase().includes("lab") || m.examType?.toLowerCase().includes("poe") || m.examType?.toLowerCase().includes("viva") || m.examType?.toLowerCase().includes("term work"));

  const handleExportCSV = () => {
    const rows = [
      ["Roll No", "Student Name", "Course", "CT-1 Score", "Mid-Sem Score", "CT-2 Score", "Practical Score", "Total CIE", "Status"]
    ];

    filteredStudents.forEach((stu) => {
      const stuMarks = marks.filter((m) => m.studentId === stu.id && (m.subjectId === selectedSubject?.id || !m.subjectId));
      const ct1 = stuMarks.find(isCT1);
      const mid = stuMarks.find(isMidSem);
      const ct2 = stuMarks.find(isCT2);
      const prac = stuMarks.find(isPractical);

      const items = [ct1, mid, ct2, prac].filter(Boolean);
      const obt = items.reduce((s, x) => s + x.marksObtained, 0);
      const max = items.reduce((s, x) => s + x.maxMarks, 0);
      const pct = max > 0 ? Math.round((obt / max) * 100) : 0;
      const status = pct >= 75 ? "Distinction" : pct >= 40 ? "Cleared" : "Needs Retest";

      rows.push([
        stu.rollNo,
        stu.name,
        selectedSubject?.name || "",
        ct1 ? `${ct1.marksObtained}/${ct1.maxMarks}` : "N/A",
        mid ? `${mid.marksObtained}/${mid.maxMarks}` : "N/A",
        ct2 ? `${ct2.marksObtained}/${ct2.maxMarks}` : "N/A",
        prac ? `${prac.marksObtained}/${prac.maxMarks}` : "N/A",
        `${obt}/${max} (${pct}%)`,
        status
      ]);
    });

    const csvContent = "data:text/csv;charset=utf-8," + rows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `HOD_${selectedSubject?.code || "MARKS"}_Evaluation_Sheet.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Official College Print Header */}
      <PrintHeader
        title="DEPARTMENT CONTINUOUS ASSESSMENT & EVALUATION REGISTER"
        subtitle={`Department: ${activeDept.name} | Course: ${selectedSubject?.name} (${selectedSubject?.code}) | Faculty: ${selectedSubject?.teacherName}`}
      />

      {/* Header */}
      <div className="no-print" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: "800", color: "var(--text-main)" }}>
            Department Marks & Continuous Evaluation Matrix
          </h2>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "4px" }}>
            Review channel for Class Test 1 (CT-1), Mid-Semester Exam, Class Test 2 (CT-2), and Practical / Lab Continuous Assessments
          </p>
        </div>

        <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "rgba(99, 102, 241, 0.08)",
              border: "1px solid rgba(99, 102, 241, 0.25)",
              padding: "7px 14px",
              borderRadius: "10px",
              fontSize: "0.85rem",
              fontWeight: "700",
              color: "var(--primary-700)"
            }}
          >
            <ShieldCheck size={16} color="var(--primary-600)" />
            <span>Scope: <strong>{activeDept.name}</strong></span>
          </div>

          <button onClick={() => window.print()} className="btn btn-primary btn-sm">
            <Printer size={14} /> Print Register
          </button>

          <button onClick={handleExportCSV} className="btn btn-secondary btn-sm">
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      {/* Exam Breakdown Tabs (CT-1, Mid-Sem, CT-2, Practical) */}
      <div className="no-print" style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
        <button
          onClick={() => setSelectedExamType("all")}
          style={{
            padding: "9px 18px",
            borderRadius: "10px",
            border: selectedExamType === "all" ? "1.5px solid var(--primary-600)" : "1px solid var(--border-subtle)",
            background: selectedExamType === "all" ? "var(--primary-600)" : "var(--bg-surface)",
            color: selectedExamType === "all" ? "#fff" : "var(--text-main)",
            fontWeight: "700",
            fontSize: "0.85rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}
        >
          <Layers size={16} />
          <span>All Evaluation Matrix</span>
        </button>

        <button
          onClick={() => setSelectedExamType("ct1")}
          style={{
            padding: "9px 18px",
            borderRadius: "10px",
            border: selectedExamType === "ct1" ? "1.5px solid #2563eb" : "1px solid var(--border-subtle)",
            background: selectedExamType === "ct1" ? "#2563eb" : "var(--bg-surface)",
            color: selectedExamType === "ct1" ? "#fff" : "var(--text-main)",
            fontWeight: "700",
            fontSize: "0.85rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}
        >
          <BookOpen size={16} />
          <span>Class Test 1 (CT-1)</span>
        </button>

        <button
          onClick={() => setSelectedExamType("midsem")}
          style={{
            padding: "9px 18px",
            borderRadius: "10px",
            border: selectedExamType === "midsem" ? "1.5px solid #7c3aed" : "1px solid var(--border-subtle)",
            background: selectedExamType === "midsem" ? "#7c3aed" : "var(--bg-surface)",
            color: selectedExamType === "midsem" ? "#fff" : "var(--text-main)",
            fontWeight: "700",
            fontSize: "0.85rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}
        >
          <Award size={16} />
          <span>Mid-Semester Exam</span>
        </button>

        <button
          onClick={() => setSelectedExamType("ct2")}
          style={{
            padding: "9px 18px",
            borderRadius: "10px",
            border: selectedExamType === "ct2" ? "1.5px solid #0891b2" : "1px solid var(--border-subtle)",
            background: selectedExamType === "ct2" ? "#0891b2" : "var(--bg-surface)",
            color: selectedExamType === "ct2" ? "#fff" : "var(--text-main)",
            fontWeight: "700",
            fontSize: "0.85rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}
        >
          <BookOpen size={16} />
          <span>Class Test 2 (CT-2)</span>
        </button>

        <button
          onClick={() => setSelectedExamType("practical")}
          style={{
            padding: "9px 18px",
            borderRadius: "10px",
            border: selectedExamType === "practical" ? "1.5px solid #059669" : "1px solid var(--border-subtle)",
            background: selectedExamType === "practical" ? "#059669" : "var(--bg-surface)",
            color: selectedExamType === "practical" ? "#fff" : "var(--text-main)",
            fontWeight: "700",
            fontSize: "0.85rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}
        >
          <FlaskConical size={16} />
          <span>Practical / Lab ICA</span>
        </button>
      </div>

      {/* Academic Year Selection Bar (2nd, 3rd, Final Year) */}
      <div
        className="card no-print"
        style={{
          padding: "12px 18px",
          background: "var(--bg-surface)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
          borderLeft: "4px solid var(--primary-600)"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <GraduationCap size={20} color="var(--primary-600)" />
          <div>
            <div style={{ fontSize: "0.88rem", fontWeight: "800", color: "var(--text-main)" }}>
              Select Academic Year Class:
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
              Filter department evaluations by year: 2nd Year (SE), 3rd Year (TE), and Final Year (BE)
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={() => setSelectedYear("all")}
            style={{
              padding: "6px 14px",
              borderRadius: "8px",
              border: selectedYear === "all" ? "1px solid var(--primary-600)" : "1px solid var(--border-subtle)",
              background: selectedYear === "all" ? "var(--primary-600)" : "var(--bg-surface)",
              color: selectedYear === "all" ? "#fff" : "var(--text-main)",
              fontSize: "0.82rem",
              fontWeight: "700",
              cursor: "pointer"
            }}
          >
            All Years ({users.filter((u) => u.role === "student" && u.departmentId === deptId).length})
          </button>
          <button
            type="button"
            onClick={() => setSelectedYear("2nd-year")}
            style={{
              padding: "6px 14px",
              borderRadius: "8px",
              border: selectedYear === "2nd-year" ? "1px solid #3b82f6" : "1px solid var(--border-subtle)",
              background: selectedYear === "2nd-year" ? "#2563eb" : "var(--bg-surface)",
              color: selectedYear === "2nd-year" ? "#fff" : "var(--text-main)",
              fontSize: "0.82rem",
              fontWeight: "700",
              cursor: "pointer"
            }}
          >
            2nd Year (SE)
          </button>
          <button
            type="button"
            onClick={() => setSelectedYear("3rd-year")}
            style={{
              padding: "6px 14px",
              borderRadius: "8px",
              border: selectedYear === "3rd-year" ? "1.5px solid #10b981" : "1px solid var(--border-subtle)",
              background: selectedYear === "3rd-year" ? "#059669" : "var(--bg-surface)",
              color: selectedYear === "3rd-year" ? "#fff" : "var(--text-main)",
              fontSize: "0.82rem",
              fontWeight: "700",
              cursor: "pointer"
            }}
          >
            3rd Year (TE - Active)
          </button>
          <button
            type="button"
            onClick={() => setSelectedYear("final-year")}
            style={{
              padding: "6px 14px",
              borderRadius: "8px",
              border: selectedYear === "final-year" ? "1px solid #8b5cf6" : "1px solid var(--border-subtle)",
              background: selectedYear === "final-year" ? "#7c3aed" : "var(--bg-surface)",
              color: selectedYear === "final-year" ? "#fff" : "var(--text-main)",
              fontSize: "0.82rem",
              fontWeight: "700",
              cursor: "pointer"
            }}
          >
            Final Year (BE)
          </button>
        </div>
      </div>

      {/* Course & Filter Selector Bar */}
      <div className="card no-print" style={{ padding: "16px 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--text-main)" }}>
              Select Department Course:
            </span>
            <select
              className="form-control"
              style={{ width: "auto", minWidth: "280px" }}
              value={selectedSubId}
              onChange={(e) => setSelectedSubId(e.target.value)}
            >
              {deptSubjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.code}) • {s.teacherName}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px", width: "260px" }}>
            <Search size={16} color="var(--text-muted)" />
            <input
              type="text"
              className="form-control"
              placeholder="Filter by student / roll..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ fontSize: "0.85rem" }}
            />
          </div>
        </div>
      </div>

      {/* Privacy Control / Load Marks Toggle */}
      <div
        className="card no-print"
        style={{
          padding: "16px 20px",
          background: "linear-gradient(135deg, rgba(99, 102, 241, 0.06), rgba(59, 130, 246, 0.03))",
          border: "1.5px solid rgba(99, 102, 241, 0.25)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "14px"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "10px",
              background: isMarksLoaded ? "#ecfdf5" : "rgba(99, 102, 241, 0.12)",
              color: isMarksLoaded ? "#059669" : "var(--primary-600)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            {isMarksLoaded ? <Award size={22} /> : <ShieldCheck size={22} />}
          </div>
          <div>
            <div style={{ fontWeight: "800", fontSize: "0.95rem", color: "var(--text-main)" }}>
              {isMarksLoaded ? "Department Marks Matrix Unlocked" : "Department Marks Matrix Protected (Privacy Shield Active)"}
            </div>
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
              {isMarksLoaded
                ? `Displaying multi-exam assessment records for ${selectedSubject?.name} (${selectedExamType.toUpperCase()}).`
                : "Student scorecards and internal evaluations are hidden by default. Confirm department parameters above, then click to display."}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          {isMarksLoaded ? (
            <button
              onClick={() => setIsMarksLoaded(false)}
              className="btn btn-secondary btn-sm"
              style={{ fontWeight: "600" }}
            >
              Hide Marks Ledger
            </button>
          ) : (
            <button
              onClick={() => setIsMarksLoaded(true)}
              className="btn btn-primary btn-sm"
              style={{ display: "inline-flex", alignItems: "center", gap: "8px", fontWeight: "700" }}
            >
              <Award size={16} /> Load Marks Matrix ({filteredStudents.length} Students)
            </button>
          )}
        </div>
      </div>

      {!isMarksLoaded ? (
        <div
          className="card"
          style={{
            padding: "50px 24px",
            textAlign: "center",
            background: "linear-gradient(180deg, var(--bg-surface), var(--bg-surface-secondary))"
          }}
        >
          <div
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              background: "rgba(99, 102, 241, 0.1)",
              color: "var(--primary-600)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px auto"
            }}
          >
            <ShieldCheck size={32} />
          </div>
          <h3 style={{ fontSize: "1.25rem", fontWeight: "800", color: "var(--text-main)" }}>
            Department Marks Register Protected
          </h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", maxWidth: "520px", margin: "8px auto 22px auto", lineHeight: "1.5" }}>
            Student continuous internal assessments and scores for <strong>Electronic Engineering (VLSI)</strong> are not displayed openly. Please confirm the course and evaluation type above, then click below to reveal the matrix.
          </p>
          <button
            type="button"
            onClick={() => setIsMarksLoaded(true)}
            className="btn btn-primary btn-lg"
            style={{ display: "inline-flex", alignItems: "center", gap: "8px", margin: "0 auto", fontWeight: "700" }}
          >
            <Award size={18} /> Load Marks Matrix ({selectedSubject?.name || "Selected Subject"})
          </button>
        </div>
      ) : (
        /* Enhanced Spacious Marks Table with CT-1, Mid-Sem, CT-2 Columns */
        <div className="card">
          <div className="card-header no-print">
            <div className="card-title">
              <Award size={18} color="var(--primary-600)" />
              {selectedSubject?.name} ({selectedSubject?.code}) — Continuous Assessment Matrix ({filteredStudents.length} Students)
            </div>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
              Faculty In-charge: <strong>{selectedSubject?.teacherName}</strong>
            </span>
          </div>

          <div className="table-container table-spacious">
            <table>
              <thead>
                <tr>
                  <th>Roll No</th>
                  <th>Student Name</th>
                  {selectedExamType === "all" ? (
                    <>
                      <th>Class Test 1 (CT-1)</th>
                      <th>Mid-Sem Exam</th>
                      <th>Class Test 2 (CT-2)</th>
                      <th>Practical / ICA</th>
                      <th>Total CIE Progress</th>
                      <th>Status</th>
                    </>
                  ) : selectedExamType === "ct1" ? (
                    <>
                      <th>CT-1 Max</th>
                      <th>Marks Obtained</th>
                      <th>Percentage</th>
                      <th>Remarks</th>
                      <th>Status</th>
                    </>
                  ) : selectedExamType === "midsem" ? (
                    <>
                      <th>Mid-Sem Max</th>
                      <th>Marks Obtained</th>
                      <th>Percentage</th>
                      <th>Remarks</th>
                      <th>Status</th>
                    </>
                  ) : selectedExamType === "ct2" ? (
                    <>
                      <th>CT-2 Max</th>
                      <th>Marks Obtained</th>
                      <th>Percentage</th>
                      <th>Remarks</th>
                      <th>Status</th>
                    </>
                  ) : (
                    <>
                      <th>Practical Component</th>
                      <th>Marks Obtained</th>
                      <th>Max Marks</th>
                      <th>Percentage</th>
                      <th>Status</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((stu) => {
                  const stuMarks = marks.filter((m) => m.studentId === stu.id && (m.subjectId === selectedSubject?.id || !m.subjectId));
                  const ct1 = stuMarks.find(isCT1);
                  const mid = stuMarks.find(isMidSem);
                  const ct2 = stuMarks.find(isCT2);
                  const prac = stuMarks.find(isPractical);

                  if (selectedExamType === "all") {
                    const items = [ct1, mid, ct2, prac].filter(Boolean);
                    const obt = items.reduce((s, x) => s + x.marksObtained, 0);
                    const max = items.reduce((s, x) => s + x.maxMarks, 0);
                    const pct = max > 0 ? Math.round((obt / max) * 100) : 0;
                    const isDist = pct >= 75;
                    const isPass = pct >= 40;

                    return (
                      <tr key={stu.id}>
                        <td><strong>{stu.rollNo}</strong></td>
                        <td>
                          <div style={{ fontWeight: "700", color: "var(--text-main)" }}>{stu.name}</div>
                          <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>PRN: {stu.prn || stu.prnNo || "CSMSS-VLSI"}</div>
                        </td>
                        <td>
                          {ct1 ? (
                            <span style={{ fontWeight: "700", color: "#1e40af" }}>
                              {ct1.marksObtained} / {ct1.maxMarks}
                            </span>
                          ) : (
                            <span style={{ color: "var(--text-light)" }}>—</span>
                          )}
                        </td>
                        <td>
                          {mid ? (
                            <span style={{ fontWeight: "700", color: "#6d28d9" }}>
                              {mid.marksObtained} / {mid.maxMarks}
                            </span>
                          ) : (
                            <span style={{ color: "var(--text-light)" }}>—</span>
                          )}
                        </td>
                        <td>
                          {ct2 ? (
                            <span style={{ fontWeight: "700", color: "#0e7490" }}>
                              {ct2.marksObtained} / {ct2.maxMarks}
                            </span>
                          ) : (
                            <span style={{ color: "var(--text-light)" }}>—</span>
                          )}
                        </td>
                        <td>
                          {prac ? (
                            <span style={{ fontWeight: "700", color: "#047857" }}>
                              {prac.marksObtained} / {prac.maxMarks}
                            </span>
                          ) : (
                            <span style={{ color: "var(--text-light)" }}>—</span>
                          )}
                        </td>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <strong>{obt}/{max}</strong>
                            <span style={{ fontSize: "0.75rem", fontWeight: "700", color: "var(--primary-600)" }}>
                              ({pct}%)
                            </span>
                          </div>
                          <div style={{ height: "4px", width: "70px", background: "#e2e8f0", borderRadius: "4px", marginTop: "3px" }}>
                            <div style={{ height: "100%", width: `${pct}%`, background: isDist ? "#10b981" : isPass ? "#3b82f6" : "#ef4444", borderRadius: "4px" }} />
                          </div>
                        </td>
                        <td>
                          <Badge variant={isDist ? "success" : isPass ? "info" : "danger"}>
                            {isDist ? "Distinction" : isPass ? "Cleared" : "Needs Retest"}
                          </Badge>
                        </td>
                      </tr>
                    );
                  }

                  // Single exam view
                  const currentItem = selectedExamType === "ct1" ? ct1 : selectedExamType === "midsem" ? mid : selectedExamType === "ct2" ? ct2 : prac;
                  const obt = currentItem ? currentItem.marksObtained : 0;
                  const max = currentItem ? currentItem.maxMarks : 25;
                  const pct = max > 0 ? Math.round((obt / max) * 100) : 0;
                  const remarks = currentItem?.remarks || "Evaluation score published.";

                  return (
                    <tr key={stu.id}>
                      <td><strong>{stu.rollNo}</strong></td>
                      <td>{stu.name}</td>
                      <td>{max}</td>
                      <td><strong style={{ fontSize: "1.05rem", color: "var(--primary-700)" }}>{obt}</strong></td>
                      <td><strong>{pct}%</strong></td>
                      <td>
                        <span style={{ fontSize: "0.82rem", color: "var(--text-main)" }}>{remarks}</span>
                      </td>
                      <td>
                        <Badge variant={pct >= 75 ? "success" : pct >= 40 ? "info" : "danger"}>
                          {pct >= 75 ? "Distinction" : pct >= 40 ? "Cleared" : "Needs Retest"}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Official Signatures for Printed Marks Register */}
      <PrintSignatures />
    </div>
  );
}

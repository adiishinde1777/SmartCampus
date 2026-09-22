import React, { useState } from "react";
import { useSmartCampus } from "../../context/SmartCampusContext";
import {
  Award,
  TrendingUp,
  BarChart3,
  CheckCircle2,
  FileSpreadsheet,
  Download,
  AlertCircle,
  Printer,
  FlaskConical,
  BookOpen,
  Calendar,
  Layers,
  ChevronRight
} from "lucide-react";
import { Badge, StatCard } from "../common/UIPrimitives";
import PrintHeader, { PrintSignatures } from "../common/PrintHeader";

export default function StudentMarks({ onNavigate }) {
  const { currentUser, marks, subjects } = useSmartCampus();
  const [activeTab, setActiveTab] = useState("all"); // "all" | "ct1" | "midsem" | "ct2" | "practical"
  const [selectedExamDropdown, setSelectedExamDropdown] = useState("all");

  const student = currentUser;
  const myMarks = (marks || []).filter((m) => m && m.studentId === student?.id);

  // Group marks by exam type helpers
  const isCT1 = (m) => m && (m.examType?.toLowerCase().includes("ct-1") || m.examType?.toLowerCase().includes("class test 1") || m.examType?.toLowerCase().includes("unit test 1"));
  const isMidSem = (m) => m && (m.examType?.toLowerCase().includes("mid-sem") || m.examType?.toLowerCase().includes("mid semester"));
  const isCT2 = (m) => m && (m.examType?.toLowerCase().includes("ct-2") || m.examType?.toLowerCase().includes("class test 2") || m.examType?.toLowerCase().includes("unit test 2"));
  const isPractical = (m) => m && (m.category === "Practical" || m.examType?.toLowerCase().includes("lab") || m.examType?.toLowerCase().includes("poe") || m.examType?.toLowerCase().includes("viva") || m.examType?.toLowerCase().includes("term work"));

  const ct1Marks = myMarks.filter(isCT1);
  const midSemMarks = myMarks.filter(isMidSem);
  const ct2Marks = myMarks.filter(isCT2);
  const practicalMarks = myMarks.filter(isPractical);
  const theoryMarks = myMarks.filter((m) => (m.category || "Theory") === "Theory");

  const calcStats = (items) => {
    const validItems = items || [];
    const totalObtained = validItems.reduce((sum, m) => sum + (m?.marksObtained || 0), 0);
    const totalMax = validItems.reduce((sum, m) => sum + (m?.maxMarks || 0), 0);
    const pct = totalMax > 0 ? Math.round((totalObtained / totalMax) * 1000) / 10 : 0;
    return { totalObtained, totalMax, pct, count: validItems.length };
  };

  const overallStats = calcStats(myMarks);
  const ct1Stats = calcStats(ct1Marks);
  const midSemStats = calcStats(midSemMarks);
  const ct2Stats = calcStats(ct2Marks);
  const practicalStats = calcStats(practicalMarks);

  // Filtered marks based on active tab
  const filteredMarks = myMarks.filter((m) => {
    if (!m) return false;
    if (activeTab === "ct1" && !isCT1(m)) return false;
    if (activeTab === "midsem" && !isMidSem(m)) return false;
    if (activeTab === "ct2" && !isCT2(m)) return false;
    if (activeTab === "practical" && !isPractical(m)) return false;
    if (selectedExamDropdown !== "all" && m.examType !== selectedExamDropdown) return false;
    return true;
  });

  // Consolidated Subject Matrix: extract unique subjects
  const subjectMap = new Map();
  myMarks.forEach((m) => {
    const key = m.subjectId || m.subjectName;
    if (!subjectMap.has(key)) {
      subjectMap.set(key, {
        subjectId: m.subjectId,
        subjectName: m.subjectName,
        ct1: null,
        midSem: null,
        ct2: null,
        practical: null
      });
    }
    const entry = subjectMap.get(key);
    if (isCT1(m) && (!entry.ct1 || entry.ct1.marksObtained < m.marksObtained)) entry.ct1 = m;
    else if (isMidSem(m) && (!entry.midSem || entry.midSem.marksObtained < m.marksObtained)) entry.midSem = m;
    else if (isCT2(m) && (!entry.ct2 || entry.ct2.marksObtained < m.marksObtained)) entry.ct2 = m;
    else if (isPractical(m) && (!entry.practical || entry.practical.marksObtained < m.marksObtained)) entry.practical = m;
  });

  const consolidatedSubjects = Array.from(subjectMap.values());

  const examOptions = Array.from(new Set(myMarks.map((m) => m && m.examType).filter(Boolean)));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Printable College Header */}
      <PrintHeader
        title="STUDENT ACADEMIC GRADEBOOK & CONTINUOUS INTERNAL EVALUATION (CIE)"
        subtitle={`Student: ${student?.name || "Aditya Shinde"} | PRN: ${student?.prn || student?.prnNo || "CSMSS-VLSI-2023-01"} | Roll: ${student?.rollNo || "VL3101"} | Class: ${student?.className || "TE VLSI (3rd Year)"}`}
      />

      {/* Page Header */}
      <div className="no-print" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: "800", color: "var(--text-main)" }}>
            Academic Marks & Internal Evaluation Gradebook
          </h2>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "4px" }}>
            Comprehensive performance tracking across Class Test 1 (CT-1), Mid-Semester Exam, Class Test 2 (CT-2), and Practical continuous evaluations
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <button
            onClick={() => window.print()}
            className="btn btn-primary btn-sm"
          >
            <Printer size={15} /> Print Official Gradebook
          </button>
        </div>
      </div>

      {/* Primary Exam Breakdown Selector Buttons */}
      <div className="no-print" style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
        <button
          onClick={() => { setActiveTab("all"); setSelectedExamDropdown("all"); }}
          style={{
            padding: "9px 18px",
            borderRadius: "10px",
            border: activeTab === "all" ? "1.5px solid var(--primary-600)" : "1px solid var(--border-subtle)",
            background: activeTab === "all" ? "var(--primary-600)" : "var(--bg-surface)",
            color: activeTab === "all" ? "#fff" : "var(--text-main)",
            fontWeight: "700",
            fontSize: "0.85rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            boxShadow: activeTab === "all" ? "0 2px 6px rgba(37, 99, 235, 0.3)" : "none",
            transition: "all 0.15s ease"
          }}
        >
          <Layers size={16} />
          <span>All Assessments</span>
          <span style={{
            background: activeTab === "all" ? "rgba(255,255,255,0.25)" : "var(--bg-surface-secondary)",
            padding: "2px 7px",
            borderRadius: "12px",
            fontSize: "0.72rem"
          }}>
            {myMarks.length}
          </span>
        </button>

        <button
          onClick={() => { setActiveTab("ct1"); setSelectedExamDropdown("all"); }}
          style={{
            padding: "9px 18px",
            borderRadius: "10px",
            border: activeTab === "ct1" ? "1.5px solid #2563eb" : "1px solid var(--border-subtle)",
            background: activeTab === "ct1" ? "#2563eb" : "var(--bg-surface)",
            color: activeTab === "ct1" ? "#fff" : "var(--text-main)",
            fontWeight: "700",
            fontSize: "0.85rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            boxShadow: activeTab === "ct1" ? "0 2px 6px rgba(37, 99, 235, 0.3)" : "none",
            transition: "all 0.15s ease"
          }}
        >
          <BookOpen size={16} />
          <span>Class Test 1 (CT-1)</span>
          <span style={{
            background: activeTab === "ct1" ? "rgba(255,255,255,0.25)" : "#eff6ff",
            color: activeTab === "ct1" ? "#fff" : "#1e40af",
            padding: "2px 7px",
            borderRadius: "12px",
            fontSize: "0.72rem",
            fontWeight: "800"
          }}>
            Avg: {ct1Stats.pct}%
          </span>
        </button>

        <button
          onClick={() => { setActiveTab("midsem"); setSelectedExamDropdown("all"); }}
          style={{
            padding: "9px 18px",
            borderRadius: "10px",
            border: activeTab === "midsem" ? "1.5px solid #7c3aed" : "1px solid var(--border-subtle)",
            background: activeTab === "midsem" ? "#7c3aed" : "var(--bg-surface)",
            color: activeTab === "midsem" ? "#fff" : "var(--text-main)",
            fontWeight: "700",
            fontSize: "0.85rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            boxShadow: activeTab === "midsem" ? "0 2px 6px rgba(124, 58, 237, 0.3)" : "none",
            transition: "all 0.15s ease"
          }}
        >
          <Award size={16} />
          <span>Mid-Semester Exam</span>
          <span style={{
            background: activeTab === "midsem" ? "rgba(255,255,255,0.25)" : "#f5f3ff",
            color: activeTab === "midsem" ? "#fff" : "#6d28d9",
            padding: "2px 7px",
            borderRadius: "12px",
            fontSize: "0.72rem",
            fontWeight: "800"
          }}>
            Avg: {midSemStats.pct}%
          </span>
        </button>

        <button
          onClick={() => { setActiveTab("ct2"); setSelectedExamDropdown("all"); }}
          style={{
            padding: "9px 18px",
            borderRadius: "10px",
            border: activeTab === "ct2" ? "1.5px solid #0891b2" : "1px solid var(--border-subtle)",
            background: activeTab === "ct2" ? "#0891b2" : "var(--bg-surface)",
            color: activeTab === "ct2" ? "#fff" : "var(--text-main)",
            fontWeight: "700",
            fontSize: "0.85rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            boxShadow: activeTab === "ct2" ? "0 2px 6px rgba(8, 145, 178, 0.3)" : "none",
            transition: "all 0.15s ease"
          }}
        >
          <BookOpen size={16} />
          <span>Class Test 2 (CT-2)</span>
          <span style={{
            background: activeTab === "ct2" ? "rgba(255,255,255,0.25)" : "#ecfeff",
            color: activeTab === "ct2" ? "#fff" : "#0e7490",
            padding: "2px 7px",
            borderRadius: "12px",
            fontSize: "0.72rem",
            fontWeight: "800"
          }}>
            Avg: {ct2Stats.pct}%
          </span>
        </button>

        <button
          onClick={() => { setActiveTab("practical"); setSelectedExamDropdown("all"); }}
          style={{
            padding: "9px 18px",
            borderRadius: "10px",
            border: activeTab === "practical" ? "1.5px solid #059669" : "1px solid var(--border-subtle)",
            background: activeTab === "practical" ? "#059669" : "var(--bg-surface)",
            color: activeTab === "practical" ? "#fff" : "var(--text-main)",
            fontWeight: "700",
            fontSize: "0.85rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            boxShadow: activeTab === "practical" ? "0 2px 6px rgba(5, 150, 105, 0.3)" : "none",
            transition: "all 0.15s ease"
          }}
        >
          <FlaskConical size={16} />
          <span>Practical & Continuous Lab</span>
          <span style={{
            background: activeTab === "practical" ? "rgba(255,255,255,0.25)" : "#ecfdf5",
            color: activeTab === "practical" ? "#fff" : "#047857",
            padding: "2px 7px",
            borderRadius: "12px",
            fontSize: "0.72rem",
            fontWeight: "800"
          }}>
            Avg: {practicalStats.pct}%
          </span>
        </button>
      </div>

      {/* Summary Scorecards Grid */}
      <div className="stats-grid">
        <StatCard
          label="📘 Class Test 1 (CT-1)"
          value={`${ct1Stats.pct}%`}
          subtext={`${ct1Stats.totalObtained} / ${ct1Stats.totalMax} marks across subjects`}
          icon={BookOpen}
          variant={ct1Stats.pct >= 75 ? "success" : "primary"}
        />
        <StatCard
          label="🏛️ Mid-Sem Examination"
          value={`${midSemStats.pct}%`}
          subtext={`${midSemStats.totalObtained} / ${midSemStats.totalMax} marks (50 Max)`}
          icon={Award}
          variant={midSemStats.pct >= 75 ? "purple" : "primary"}
        />
        <StatCard
          label="📘 Class Test 2 (CT-2)"
          value={`${ct2Stats.pct}%`}
          subtext={`${ct2Stats.totalObtained} / ${ct2Stats.totalMax} marks across subjects`}
          icon={BookOpen}
          variant={ct2Stats.pct >= 75 ? "success" : "primary"}
        />
        <StatCard
          label="🔬 Practical Lab Average"
          value={`${practicalStats.pct}%`}
          subtext={`${practicalStats.totalObtained} / ${practicalStats.totalMax} in Continuous ICA & POE`}
          icon={FlaskConical}
          variant={practicalStats.pct >= 75 ? "success" : "warning"}
        />
      </div>

      {/* CONSOLIDATED ASSESSMENT MATRIX (CT-1, Mid-Sem, CT-2 side-by-side) */}
      <div className="card">
        <div className="card-header no-print">
          <div>
            <div className="card-title">
              <BarChart3 size={18} color="var(--primary-600)" />
              Subject-Wise Consolidated Evaluation Matrix (CT-1, Mid-Sem, CT-2)
            </div>
            <div className="card-subtitle">
              Official MSBTE/University Continuous Internal Evaluation (CIE) breakdown by subject
            </div>
          </div>
          <Badge variant="primary">Academic Year 2026-27</Badge>
        </div>

        <div className="table-container table-spacious">
          <table>
            <thead>
              <tr>
                <th>Course / Subject Name</th>
                <th>Class Test 1 (CT-1)</th>
                <th>Mid-Sem Examination</th>
                <th>Class Test 2 (CT-2)</th>
                <th>Practical / Lab ICA</th>
                <th>CIE Weighted Total</th>
                <th>Academic Standing</th>
              </tr>
            </thead>
            <tbody>
              {consolidatedSubjects.map((sub, idx) => {
                const ct1Score = sub.ct1 ? `${sub.ct1.marksObtained} / ${sub.ct1.maxMarks}` : "—";
                const ct1Pct = sub.ct1 ? Math.round((sub.ct1.marksObtained / sub.ct1.maxMarks) * 100) : null;

                const midScore = sub.midSem ? `${sub.midSem.marksObtained} / ${sub.midSem.maxMarks}` : "—";
                const midPct = sub.midSem ? Math.round((sub.midSem.marksObtained / sub.midSem.maxMarks) * 100) : null;

                const ct2Score = sub.ct2 ? `${sub.ct2.marksObtained} / ${sub.ct2.maxMarks}` : "—";
                const ct2Pct = sub.ct2 ? Math.round((sub.ct2.marksObtained / sub.ct2.maxMarks) * 100) : null;

                const pracScore = sub.practical ? `${sub.practical.marksObtained} / ${sub.practical.maxMarks}` : "—";
                const pracPct = sub.practical ? Math.round((sub.practical.marksObtained / sub.practical.maxMarks) * 100) : null;

                // Total obtained and max for this subject
                const items = [sub.ct1, sub.midSem, sub.ct2, sub.practical].filter(Boolean);
                const subObtained = items.reduce((s, x) => s + x.marksObtained, 0);
                const subMax = items.reduce((s, x) => s + x.maxMarks, 0);
                const subPct = subMax > 0 ? Math.round((subObtained / subMax) * 100) : 0;

                let badgeVariant = "success";
                let badgeText = "Distinction";
                if (subPct < 50) { badgeVariant = "danger"; badgeText = "Needs Retest"; }
                else if (subPct < 70) { badgeVariant = "primary"; badgeText = "Good Standing"; }
                else if (subPct < 85) { badgeVariant = "purple"; badgeText = "Very Good"; }

                return (
                  <tr key={sub.subjectId || idx}>
                    <td>
                      <div style={{ fontWeight: "700", color: "var(--text-main)" }}>
                        {sub.subjectName}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "2px" }}>
                        Code: {sub.subjectId || "VLSI-CORE"}
                      </div>
                    </td>
                    <td>
                      {sub.ct1 ? (
                        <div>
                          <div style={{ fontWeight: "700", color: "#1e40af", fontSize: "0.92rem" }}>{ct1Score}</div>
                          <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{ct1Pct}%</div>
                        </div>
                      ) : (
                        <span style={{ color: "var(--text-light)" }}>Not Scheduled</span>
                      )}
                    </td>
                    <td>
                      {sub.midSem ? (
                        <div>
                          <div style={{ fontWeight: "700", color: "#6d28d9", fontSize: "0.92rem" }}>{midScore}</div>
                          <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{midPct}%</div>
                        </div>
                      ) : (
                        <span style={{ color: "var(--text-light)" }}>Not Scheduled</span>
                      )}
                    </td>
                    <td>
                      {sub.ct2 ? (
                        <div>
                          <div style={{ fontWeight: "700", color: "#0e7490", fontSize: "0.92rem" }}>{ct2Score}</div>
                          <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{ct2Pct}%</div>
                        </div>
                      ) : (
                        <span style={{ color: "var(--text-light)" }}>Not Scheduled</span>
                      )}
                    </td>
                    <td>
                      {sub.practical ? (
                        <div>
                          <div style={{ fontWeight: "700", color: "#047857", fontSize: "0.92rem" }}>{pracScore}</div>
                          <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{pracPct}%</div>
                        </div>
                      ) : (
                        <span style={{ color: "var(--text-light)" }}>Theory Only</span>
                      )}
                    </td>
                    <td>
                      {subMax > 0 ? (
                        <>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <span style={{ fontWeight: "800", color: "var(--text-main)", fontSize: "0.95rem" }}>
                              {subObtained}/{subMax}
                            </span>
                            <span style={{ fontSize: "0.75rem", fontWeight: "700", color: "var(--primary-600)" }}>
                              ({subPct}%)
                            </span>
                          </div>
                          <div style={{
                            height: "5px",
                            width: "90px",
                            background: "#e2e8f0",
                            borderRadius: "4px",
                            marginTop: "4px",
                            overflow: "hidden"
                          }}>
                            <div style={{
                              height: "100%",
                              width: `${subPct}%`,
                              background: subPct >= 75 ? "#10b981" : subPct >= 60 ? "#3b82f6" : "#f59e0b",
                              borderRadius: "4px"
                            }} />
                          </div>
                        </>
                      ) : (
                        <span style={{ color: "var(--text-light)" }}>—</span>
                      )}
                    </td>
                    <td>
                      {subMax > 0 ? (
                        <Badge variant={badgeVariant}>{badgeText}</Badge>
                      ) : (
                        <Badge variant="secondary">Pending Assessment</Badge>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAILED ITEMIZED EVALUATION RECORDS */}
      <div className="card">
        <div className="card-header no-print" style={{ flexWrap: "wrap", gap: "12px" }}>
          <div>
            <div className="card-title">
              <FileSpreadsheet size={18} color="var(--primary-600)" />
              {activeTab === "all"
                ? "All Published Assessment Scorecards"
                : activeTab === "ct1"
                ? "Class Test 1 (CT-1) Published Records"
                : activeTab === "midsem"
                ? "Mid-Semester Examination Published Records"
                : activeTab === "ct2"
                ? "Class Test 2 (CT-2) Published Records"
                : "Practical & Lab Continuous Assessment Records"}
            </div>
            <div className="card-subtitle">
              Verified evaluation records signed by departmental faculty
            </div>
          </div>

          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Filter:</span>
            <select
              className="form-control"
              style={{ padding: "6px 12px", fontSize: "0.82rem" }}
              value={selectedExamDropdown}
              onChange={(e) => setSelectedExamDropdown(e.target.value)}
            >
              <option value="all">All Specific Exam Names</option>
              {(examOptions || []).map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="table-container table-spacious">
          <table>
            <thead>
              <tr>
                <th>Course / Subject Name</th>
                <th>Category</th>
                <th>Evaluation / Exam Type</th>
                <th>Marks Obtained</th>
                <th>Max Marks</th>
                <th>Percentage</th>
                <th>Grade</th>
                <th>Faculty Remarks & Evaluation Feedback</th>
                <th>Publish Date</th>
              </tr>
            </thead>
            <tbody>
              {(!filteredMarks || filteredMarks.length === 0) ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: "center", padding: "36px", color: "var(--text-muted)" }}>
                    No marks records published for the selected evaluation filter.
                  </td>
                </tr>
              ) : (
                (filteredMarks || []).map((item) => {
                  const pct = item.maxMarks > 0 ? Math.round((item.marksObtained / item.maxMarks) * 100) : 0;
                  let grade = "A+";
                  let gradeBadge = "success";
                  if (pct < 50) { grade = "F"; gradeBadge = "danger"; }
                  else if (pct < 60) { grade = "C"; gradeBadge = "warning"; }
                  else if (pct < 75) { grade = "B"; gradeBadge = "info"; }
                  else if (pct < 85) { grade = "A"; gradeBadge = "primary"; }

                  const isPrac = item.category === "Practical";

                  return (
                    <tr key={item.id}>
                      <td>
                        <div style={{ fontWeight: "700", color: "var(--text-main)" }}>
                          {item.subjectName}
                        </div>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "2px" }}>
                          Code: {item.subjectId || "VLSI-CORE"}
                        </div>
                      </td>
                      <td>
                        <Badge variant={isPrac ? "success" : "primary"}>
                          {isPrac ? "🔬 Practical" : "📘 Theory"}
                        </Badge>
                      </td>
                      <td>
                        <Badge variant={item.examType?.includes("CT-1") ? "primary" : item.examType?.includes("Mid-Sem") ? "purple" : item.examType?.includes("CT-2") ? "info" : "secondary"}>
                          {item.examType}
                        </Badge>
                      </td>
                      <td>
                        <span style={{ fontSize: "1.05rem", fontWeight: "800", color: isPrac ? "#059669" : "var(--primary-700)" }}>
                          {item.marksObtained}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontWeight: "600", color: "var(--text-muted)" }}>{item.maxMarks}</span>
                      </td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <span style={{ fontWeight: "700", color: "var(--text-main)" }}>{pct}%</span>
                        </div>
                        <div style={{
                          height: "4px",
                          width: "60px",
                          background: "#e2e8f0",
                          borderRadius: "4px",
                          marginTop: "3px",
                          overflow: "hidden"
                        }}>
                          <div style={{
                            height: "100%",
                            width: `${pct}%`,
                            background: pct >= 75 ? "#10b981" : pct >= 60 ? "#3b82f6" : "#ef4444",
                            borderRadius: "4px"
                          }} />
                        </div>
                      </td>
                      <td>
                        <Badge variant={gradeBadge}>{grade}</Badge>
                      </td>
                      <td>
                        <div>
                          <div style={{ fontSize: "0.84rem", color: "var(--text-main)", fontWeight: "500" }}>{item.remarks}</div>
                          <div style={{ fontSize: "0.74rem", color: "var(--text-muted)", marginTop: "2px" }}>Evaluator: {item.gradedBy}</div>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{item.date}</span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Official Signatures for Printed Scorecard */}
      <PrintSignatures />
    </div>
  );
}

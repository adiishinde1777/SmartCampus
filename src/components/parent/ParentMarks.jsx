import React, { useState } from "react";
import { useSmartCampus } from "../../context/SmartCampusContext";
import {
  Award,
  TrendingUp,
  Download,
  BarChart3,
  CheckCircle2,
  FileSpreadsheet,
  Printer,
  BookOpen,
  FlaskConical,
  Layers,
  ChevronRight
} from "lucide-react";
import { Badge, StatCard } from "../common/UIPrimitives";
import PrintHeader, { PrintSignatures } from "../common/PrintHeader";

export default function ParentMarks() {
  const { currentUser, users, marks } = useSmartCampus();
  const [activeTab, setActiveTab] = useState("all"); // "all" | "ct1" | "midsem" | "ct2" | "practical"

  const parent = currentUser;
  const ward = users.find((u) => u.id === parent?.studentId) || users[0];
  const wardMarks = (marks || []).filter((m) => m && m.studentId === ward?.id);

  const isCT1 = (m) => m && (m.examType?.toLowerCase().includes("ct-1") || m.examType?.toLowerCase().includes("class test 1") || m.examType?.toLowerCase().includes("unit test 1"));
  const isMidSem = (m) => m && (m.examType?.toLowerCase().includes("mid-sem") || m.examType?.toLowerCase().includes("mid semester"));
  const isCT2 = (m) => m && (m.examType?.toLowerCase().includes("ct-2") || m.examType?.toLowerCase().includes("class test 2") || m.examType?.toLowerCase().includes("unit test 2"));
  const isPractical = (m) => m && (m.category === "Practical" || m.examType?.toLowerCase().includes("lab") || m.examType?.toLowerCase().includes("poe") || m.examType?.toLowerCase().includes("viva") || m.examType?.toLowerCase().includes("term work"));

  const ct1Marks = wardMarks.filter(isCT1);
  const midSemMarks = wardMarks.filter(isMidSem);
  const ct2Marks = wardMarks.filter(isCT2);
  const practicalMarks = wardMarks.filter(isPractical);

  const calcStats = (items) => {
    const validItems = items || [];
    const totalObtained = validItems.reduce((sum, m) => sum + (m?.marksObtained || 0), 0);
    const totalMax = validItems.reduce((sum, m) => sum + (m?.maxMarks || 0), 0);
    const pct = totalMax > 0 ? Math.round((totalObtained / totalMax) * 1000) / 10 : 0;
    return { totalObtained, totalMax, pct, count: validItems.length };
  };

  const overallStats = calcStats(wardMarks);
  const ct1Stats = calcStats(ct1Marks);
  const midSemStats = calcStats(midSemMarks);
  const ct2Stats = calcStats(ct2Marks);
  const practicalStats = calcStats(practicalMarks);

  const filteredMarks = wardMarks.filter((m) => {
    if (!m) return false;
    if (activeTab === "ct1" && !isCT1(m)) return false;
    if (activeTab === "midsem" && !isMidSem(m)) return false;
    if (activeTab === "ct2" && !isCT2(m)) return false;
    if (activeTab === "practical" && !isPractical(m)) return false;
    return true;
  });

  // Consolidated Subject Matrix
  const subjectMap = new Map();
  wardMarks.forEach((m) => {
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

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Official College Print Header */}
      <PrintHeader
        title="WARD ACADEMIC PERFORMANCE & MARKS REPORT"
        subtitle={`Ward: ${ward?.name || "Aditya Shinde"} | Parent/Guardian: ${parent?.name || "Santosh Shinde"} | PRN: ${ward?.prn || ward?.prnNo || "CSMSS-VLSI-2023-01"} | Roll: ${ward?.rollNo || "VL3101"}`}
      />

      {/* Header */}
      <div className="no-print" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: "800", color: "var(--text-main)" }}>
            Academic Marks & Assessment Report: {ward?.name}
          </h2>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "4px" }}>
            Official unit test results, continuous internal evaluation scores, and faculty remarks
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={() => window.print()}
            className="btn btn-primary btn-sm"
          >
            <Printer size={15} /> Print Gradebook
          </button>
        </div>
      </div>

      {/* Primary Exam Breakdown Tabs */}
      <div className="no-print" style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
        <button
          onClick={() => setActiveTab("all")}
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
            gap: "8px"
          }}
        >
          <Layers size={16} />
          <span>All Assessments ({wardMarks.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("ct1")}
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
            gap: "8px"
          }}
        >
          <BookOpen size={16} />
          <span>Class Test 1 (CT-1)</span>
          <span style={{ background: activeTab === "ct1" ? "rgba(255,255,255,0.25)" : "#eff6ff", color: activeTab === "ct1" ? "#fff" : "#1e40af", padding: "2px 6px", borderRadius: "10px", fontSize: "0.72rem" }}>
            {ct1Stats.pct}%
          </span>
        </button>

        <button
          onClick={() => setActiveTab("midsem")}
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
            gap: "8px"
          }}
        >
          <Award size={16} />
          <span>Mid-Semester Exam</span>
          <span style={{ background: activeTab === "midsem" ? "rgba(255,255,255,0.25)" : "#f5f3ff", color: activeTab === "midsem" ? "#fff" : "#6d28d9", padding: "2px 6px", borderRadius: "10px", fontSize: "0.72rem" }}>
            {midSemStats.pct}%
          </span>
        </button>

        <button
          onClick={() => setActiveTab("ct2")}
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
            gap: "8px"
          }}
        >
          <BookOpen size={16} />
          <span>Class Test 2 (CT-2)</span>
          <span style={{ background: activeTab === "ct2" ? "rgba(255,255,255,0.25)" : "#ecfeff", color: activeTab === "ct2" ? "#fff" : "#0e7490", padding: "2px 6px", borderRadius: "10px", fontSize: "0.72rem" }}>
            {ct2Stats.pct}%
          </span>
        </button>

        <button
          onClick={() => setActiveTab("practical")}
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
            gap: "8px"
          }}
        >
          <FlaskConical size={16} />
          <span>🔬 Practical / Lab</span>
          <span style={{ background: activeTab === "practical" ? "rgba(255,255,255,0.25)" : "#ecfdf5", color: activeTab === "practical" ? "#fff" : "#047857", padding: "2px 6px", borderRadius: "10px", fontSize: "0.72rem" }}>
            {practicalStats.pct}%
          </span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="stats-grid">
        <StatCard
          label="📘 Class Test 1 (CT-1)"
          value={`${ct1Stats.pct}%`}
          subtext={`${ct1Stats.totalObtained} / ${ct1Stats.totalMax} marks (CT-1 Tests)`}
          icon={BookOpen}
          variant={ct1Stats.pct >= 70 ? "success" : "primary"}
        />
        <StatCard
          label="🏛️ Mid-Sem Exam"
          value={`${midSemStats.pct}%`}
          subtext={`${midSemStats.totalObtained} / ${midSemStats.totalMax} marks (Mid-Sem)`}
          icon={Award}
          variant={midSemStats.pct >= 70 ? "purple" : "primary"}
        />
        <StatCard
          label="📘 Class Test 2 (CT-2)"
          value={`${ct2Stats.pct}%`}
          subtext={`${ct2Stats.totalObtained} / ${ct2Stats.totalMax} marks (CT-2 Tests)`}
          icon={BookOpen}
          variant={ct2Stats.pct >= 70 ? "success" : "primary"}
        />
        <StatCard
          label="Combined Academic Average"
          value={`${overallStats.pct}%`}
          subtext={`${overallStats.totalObtained} / ${overallStats.totalMax} marks overall`}
          icon={TrendingUp}
          variant="primary"
        />
      </div>

      {/* Consolidated Subject Matrix for Parents */}
      <div className="card">
        <div className="card-header no-print">
          <div>
            <div className="card-title">
              <BarChart3 size={18} color="var(--primary-600)" />
              Ward's Subject-Wise Assessment Breakdown (CT-1, Mid-Sem, CT-2)
            </div>
            <div className="card-subtitle">
              Comprehensive report of internal class tests, mid-semester exams, and continuous assessments
            </div>
          </div>
          <Badge variant="primary">TE VLSI (3rd Year)</Badge>
        </div>

        <div className="table-container table-spacious">
          <table>
            <thead>
              <tr>
                <th>Course / Subject</th>
                <th>Class Test 1 (CT-1)</th>
                <th>Mid-Sem Exam</th>
                <th>Class Test 2 (CT-2)</th>
                <th>Practical Lab ICA</th>
                <th>CIE Total & Progress</th>
                <th>Academic Status</th>
              </tr>
            </thead>
            <tbody>
              {consolidatedSubjects.map((sub, idx) => {
                const ct1Score = sub.ct1 ? `${sub.ct1.marksObtained} / ${sub.ct1.maxMarks}` : "—";
                const midScore = sub.midSem ? `${sub.midSem.marksObtained} / ${sub.midSem.maxMarks}` : "—";
                const ct2Score = sub.ct2 ? `${sub.ct2.marksObtained} / ${sub.ct2.maxMarks}` : "—";
                const pracScore = sub.practical ? `${sub.practical.marksObtained} / ${sub.practical.maxMarks}` : "—";

                const items = [sub.ct1, sub.midSem, sub.ct2, sub.practical].filter(Boolean);
                const subObtained = items.reduce((s, x) => s + x.marksObtained, 0);
                const subMax = items.reduce((s, x) => s + x.maxMarks, 0);
                const subPct = subMax > 0 ? Math.round((subObtained / subMax) * 100) : 0;

                return (
                  <tr key={sub.subjectId || idx}>
                    <td>
                      <div style={{ fontWeight: "700", color: "var(--text-main)" }}>{sub.subjectName}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Code: {sub.subjectId || "VLSI-CORE"}</div>
                    </td>
                    <td>
                      <span style={{ fontWeight: "700", color: "#1e40af" }}>{ct1Score}</span>
                    </td>
                    <td>
                      <span style={{ fontWeight: "700", color: "#6d28d9" }}>{midScore}</span>
                    </td>
                    <td>
                      <span style={{ fontWeight: "700", color: "#0e7490" }}>{ct2Score}</span>
                    </td>
                    <td>
                      <span style={{ fontWeight: "700", color: "#047857" }}>{pracScore}</span>
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <strong style={{ fontSize: "0.95rem" }}>{subObtained}/{subMax}</strong>
                        <span style={{ fontSize: "0.75rem", color: "var(--primary-600)", fontWeight: "700" }}>({subPct}%)</span>
                      </div>
                      <div style={{ height: "4px", width: "80px", background: "#e2e8f0", borderRadius: "4px", marginTop: "4px" }}>
                        <div style={{ height: "100%", width: `${subPct}%`, background: subPct >= 75 ? "#10b981" : "#3b82f6", borderRadius: "4px" }} />
                      </div>
                    </td>
                    <td>
                      <Badge variant={subPct >= 75 ? "success" : subPct >= 50 ? "primary" : "warning"}>
                        {subPct >= 75 ? "Distinction" : subPct >= 50 ? "Clear" : "Needs Revision"}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Marks Table */}
      <div className="card">
        <div className="card-header no-print">
          <div className="card-title">
            <FileSpreadsheet size={18} color="var(--primary-600)" />
            {activeTab === "all"
              ? "All Continuous Assessment & Exam Scores Ledger"
              : activeTab === "ct1"
              ? "Class Test 1 (CT-1) Results"
              : activeTab === "midsem"
              ? "Mid-Semester Exam Results"
              : activeTab === "ct2"
              ? "Class Test 2 (CT-2) Results"
              : "Practical & Lab Continuous Assessment Scores"}
          </div>
        </div>

        <div className="table-container table-spacious">
          <table>
            <thead>
              <tr>
                <th>Subject Name</th>
                <th>Category</th>
                <th>Assessment Type</th>
                <th>Marks Obtained</th>
                <th>Max Marks</th>
                <th>Percentage</th>
                <th>Grade</th>
                <th>Instructor Remark</th>
                <th>Published On</th>
              </tr>
            </thead>
            <tbody>
              {filteredMarks.map((m) => {
                const pct = m.maxMarks > 0 ? Math.round((m.marksObtained / m.maxMarks) * 100) : 0;
                const isPracticalItem = m.category === "Practical";
                return (
                  <tr key={m.id}>
                    <td>
                      <strong>{m.subjectName}</strong>
                    </td>
                    <td>
                      <Badge variant={isPracticalItem ? "success" : "primary"}>
                        {isPracticalItem ? "🔬 Practical" : "📘 Theory"}
                      </Badge>
                    </td>
                    <td>
                      <Badge variant={m.examType?.includes("CT-1") ? "primary" : m.examType?.includes("Mid-Sem") ? "purple" : m.examType?.includes("CT-2") ? "info" : "secondary"}>
                        {m.examType}
                      </Badge>
                    </td>
                    <td>
                      <span style={{ fontSize: "1.05rem", fontWeight: "800", color: isPracticalItem ? "#059669" : "var(--primary-700)" }}>
                        {m.marksObtained}
                      </span>
                    </td>
                    <td>{m.maxMarks}</td>
                    <td>
                      <strong>{pct}%</strong>
                    </td>
                    <td>
                      <Badge variant={pct >= 75 ? "success" : pct >= 60 ? "info" : "warning"}>
                        {pct >= 85 ? "A+" : pct >= 75 ? "A" : pct >= 60 ? "B" : "C"}
                      </Badge>
                    </td>
                    <td>
                      <div style={{ fontSize: "0.82rem" }}>{m.remarks}</div>
                      <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Graded by: {m.gradedBy}</div>
                    </td>
                    <td>
                      <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{m.date}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Signatures for Print */}
      <PrintSignatures />
    </div>
  );
}

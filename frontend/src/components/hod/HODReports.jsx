import React, { useState } from "react";
import { useSmartCampus } from "../../context/SmartCampusContext";
import {
  FileSpreadsheet,
  Download,
  CalendarCheck,
  Award,
  Users,
  Printer,
  ShieldCheck,
  AlertTriangle,
  GraduationCap
} from "lucide-react";
import { Badge } from "../common/UIPrimitives";
import PrintHeader, { PrintSignatures } from "../common/PrintHeader";

export default function HODReports() {
  const { currentUser, subjects, users, attendance, marks, departments, systemSettings, addToast } = useSmartCampus();

  const deptId = currentUser?.departmentId || "dept-vlsi";
  const activeDept = departments.find((d) => d.id === deptId) || {
    id: deptId,
    name: currentUser?.departmentName || "Electronic Engineering (VLSI Design And Technology)"
  };

  const [reportType, setReportType] = useState("attendance");
  const [selectedYear, setSelectedYear] = useState("3rd-year"); // 'all' | '2nd-year' | '3rd-year' | 'final-year'

  const deptSubjects = subjects.filter((s) => {
    if (s.departmentId !== deptId && s.departmentId !== "dept-vlsi") return false;
    if (selectedYear === "2nd-year") return s.semester === 3 || s.semester === 4;
    if (selectedYear === "3rd-year") return s.semester === 5 || s.semester === 6;
    if (selectedYear === "final-year") return s.semester === 7 || s.semester === 8;
    return true;
  });

  const [selectedSubject, setSelectedSubject] = useState(deptSubjects[0]?.id || "sub-vlsi501");
  const [isReportLoaded, setIsReportLoaded] = useState(false);

  const deptStudents = users.filter((u) => {
    if (u.role !== "student" || u.departmentId !== deptId) return false;
    if (selectedYear === "2nd-year") return u.semester === 3 || u.semester === 4 || u.year?.includes("Second") || u.className?.includes("SE") || u.batch?.includes("SE");
    if (selectedYear === "3rd-year") return u.semester === 5 || u.semester === 6 || u.year?.includes("Third") || u.className?.includes("TE") || u.batch?.includes("TE");
    if (selectedYear === "final-year") return u.semester === 7 || u.semester === 8 || u.year?.includes("Final") || u.className?.includes("BE") || u.batch?.includes("BE");
    return true;
  });
  const subjectObj = deptSubjects.find((s) => s.id === selectedSubject) || deptSubjects[0];
  const threshold = systemSettings.attendanceThreshold;

  const handleExport = () => {
    const rows = [
      ["Roll No", "PRN", "Student Name", "Department", "Subject", "Theory Total", "Theory Attended", "Theory %", "Practical Total", "Practical Attended", "Practical %", "Overall %", "Compliance Status"]
    ];

    deptStudents.forEach((stu) => {
      const sData = attendance[stu.id]?.[subjectObj?.id] || { total: 24, attended: 20, percentage: 83 };
      const theoryTotal = sData.theoryTotal ?? Math.round(sData.total * 0.7);
      const theoryAttended = sData.theoryAttended ?? Math.round(sData.attended * 0.7);
      const theoryPct = theoryTotal > 0 ? Math.round((theoryAttended / theoryTotal) * 100) : 0;
      const practicalTotal = sData.practicalTotal ?? Math.max(0, sData.total - theoryTotal);
      const practicalAttended = sData.practicalAttended ?? Math.max(0, sData.attended - theoryAttended);
      const practicalPct = practicalTotal > 0 ? Math.round((practicalAttended / practicalTotal) * 100) : 0;
      const status = sData.percentage >= threshold ? "Compliant" : "Defaulter (Action Required)";

      rows.push([
        stu.rollNo,
        stu.prn || "N/A",
        stu.name,
        activeDept.name,
        subjectObj?.name,
        theoryTotal,
        theoryAttended,
        `${theoryPct}%`,
        practicalTotal,
        practicalAttended,
        `${practicalPct}%`,
        `${sData.percentage}%`,
        status
      ]);
    });

    const csvContent = "data:text/csv;charset=utf-8," + rows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `HOD_${subjectObj?.code || "REPORT"}_Compliance_Report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast(
      "Report Downloaded",
      `Exported official department attendance register for ${subjectObj?.name}.`,
      "success"
    );
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Official College Print Header */}
      <PrintHeader
        title="DEPARTMENT ACADEMIC ATTENDANCE & COMPLIANCE REGISTER"
        subtitle={`Department: ${activeDept.name} | Course: ${subjectObj?.name} (${subjectObj?.code}) | Faculty: ${subjectObj?.teacherName}`}
      />

      {/* Header */}
      <div className="no-print" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: "800", color: "var(--text-main)" }}>
            Department Academic Reports & Compliance Registers
          </h2>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "4px" }}>
            Generate exportable attendance sheets, continuous evaluation logs, and parent communication records for {activeDept.name}
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
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

          <button onClick={handlePrint} className="btn btn-primary btn-sm">
            <Printer size={14} /> Print Register
          </button>
          <button onClick={handleExport} className="btn btn-secondary btn-sm">
            <Download size={14} /> Export CSV / Excel
          </button>
        </div>
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
              Official records cohort: 2nd Year (SE), 3rd Year (TE), and Final Year (BE)
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {[
            { key: "all", label: "All Years", desc: "All Cohorts" },
            { key: "2nd-year", label: "2nd Year (SE)", desc: "Sem 3 & 4" },
            { key: "3rd-year", label: "3rd Year (TE)", desc: "Sem 5 & 6 (72 Students)" },
            { key: "final-year", label: "Final Year (BE)", desc: "Sem 7 & 8" }
          ].map((yr) => (
            <button
              key={yr.key}
              onClick={() => {
                setSelectedYear(yr.key);
                setIsReportLoaded(false);
              }}
              className={`btn btn-sm ${selectedYear === yr.key ? "btn-primary" : "btn-secondary"}`}
              style={{
                display: "inline-flex",
                flexDirection: "column",
                alignItems: "flex-start",
                padding: "6px 14px",
                lineHeight: "1.2"
              }}
            >
              <span style={{ fontWeight: "700", fontSize: "0.82rem" }}>{yr.label}</span>
              <span style={{ fontSize: "0.68rem", opacity: selectedYear === yr.key ? 0.9 : 0.6 }}>{yr.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Filter Parameters */}
      <div className="card no-print">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Report Category</label>
            <select
              className="form-control"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
            >
              <option value="attendance">Subject Attendance Register (Theory + Practical)</option>
              <option value="defaulter">Department Defaulter Sheet (&lt;{threshold}%)</option>
              <option value="continuous">Continuous Internal Assessment (CIE)</option>
            </select>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Course / Subject</label>
            <select
              className="form-control"
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
            >
              {deptSubjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.code})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Class Cohort</label>
            <div style={{ padding: "10px 14px", background: "var(--bg-surface-secondary)", borderRadius: "8px", fontWeight: "700", fontSize: "0.85rem" }}>
              {selectedYear === "2nd-year"
                ? `SE VLSI – 2nd Year (${deptStudents.length} Students)`
                : selectedYear === "final-year"
                ? `BE VLSI – Final Year (${deptStudents.length} Students)`
                : selectedYear === "all"
                ? `All Cohorts (SE, TE, BE VLSI) (${deptStudents.length} Students)`
                : `TE VLSI – 3rd Year (${deptStudents.length} Students)`}
            </div>
          </div>
        </div>
      </div>

      {/* Privacy Control / Load Report Toggle */}
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
              background: isReportLoaded ? "#ecfdf5" : "rgba(99, 102, 241, 0.12)",
              color: isReportLoaded ? "#059669" : "var(--primary-600)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            {isReportLoaded ? <FileSpreadsheet size={22} /> : <ShieldCheck size={22} />}
          </div>
          <div>
            <div style={{ fontWeight: "800", fontSize: "0.95rem", color: "var(--text-main)" }}>
              {isReportLoaded ? "Official Register Unlocked" : "Official Academic Register Protected (Privacy Shield Active)"}
            </div>
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
              {isReportLoaded
                ? `Displaying official academic records for ${activeDept.name} • ${subjectObj?.name}.`
                : "Attendance registers and continuous evaluation ledgers are hidden by default. Confirm course & parameters above, then load."}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          {isReportLoaded ? (
            <button
              onClick={() => setIsReportLoaded(false)}
              className="btn btn-secondary btn-sm"
              style={{ fontWeight: "600" }}
            >
              Hide Register
            </button>
          ) : (
            <button
              onClick={() => setIsReportLoaded(true)}
              className="btn btn-primary btn-sm"
              style={{ display: "inline-flex", alignItems: "center", gap: "8px", fontWeight: "700" }}
            >
              <FileSpreadsheet size={16} /> Load Register Ledger ({deptStudents.length})
            </button>
          )}
        </div>
      </div>

      {!isReportLoaded ? (
        <div
          className="card no-print"
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
            Academic Register & Evaluation Ledger Protected
          </h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", maxWidth: "520px", margin: "8px auto 22px auto", lineHeight: "1.5" }}>
            To safeguard student academic standing and attendance records for <strong>Electronic Engineering (VLSI)</strong>, data is not displayed openly. Confirm the report parameters above, then click below to reveal the ledger.
          </p>
          <button
            type="button"
            onClick={() => setIsReportLoaded(true)}
            className="btn btn-primary btn-lg"
            style={{ display: "inline-flex", alignItems: "center", gap: "8px", margin: "0 auto", fontWeight: "700" }}
          >
            <FileSpreadsheet size={18} /> Load Register Ledger ({subjectObj?.name || "Selected Subject"})
          </button>
        </div>
      ) : (
        /* Report Preview */
        <div className="card">
        <div className="card-header no-print">
          <div>
            <div className="card-title">
              <FileSpreadsheet size={18} color="var(--primary-600)" />
              {activeDept.name} — {subjectObj?.name} ({subjectObj?.code})
            </div>
            <div className="card-subtitle">
              Official Academic Register • Faculty: {subjectObj?.teacherName}
            </div>
          </div>
          <Badge variant="purple">{deptStudents.length} Records</Badge>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Roll No</th>
                <th>PRN</th>
                <th>Student Name</th>
                <th>📘 Theory Attendance</th>
                <th>🔬 Practical Attendance</th>
                <th>Overall %</th>
                <th>Academic Standing</th>
              </tr>
            </thead>
            <tbody>
              {deptStudents.map((stu) => {
                const sData = attendance[stu.id]?.[subjectObj?.id] || { total: 24, attended: 20, percentage: 83 };
                const isLow = sData.percentage < threshold;

                const theoryTotal = sData.theoryTotal ?? Math.round(sData.total * 0.7);
                const theoryAttended = sData.theoryAttended ?? Math.round(sData.attended * 0.7);
                const theoryPct = theoryTotal > 0 ? Math.round((theoryAttended / theoryTotal) * 100) : 0;

                const practicalTotal = sData.practicalTotal ?? Math.max(0, sData.total - theoryTotal);
                const practicalAttended = sData.practicalAttended ?? Math.max(0, sData.attended - theoryAttended);
                const practicalPct = practicalTotal > 0 ? Math.round((practicalAttended / practicalTotal) * 100) : 0;

                return (
                  <tr key={stu.id}>
                    <td><strong>{stu.rollNo}</strong></td>
                    <td><span style={{ fontFamily: "monospace", fontSize: "0.82rem" }}>{stu.prn || "20240101901"}</span></td>
                    <td>{stu.name}</td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span>{theoryAttended}/{theoryTotal}</span>
                        <Badge variant={theoryPct >= 75 ? "primary" : "warning"}>{theoryPct}%</Badge>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span>{practicalAttended}/{practicalTotal}</span>
                        <Badge variant={practicalPct >= 75 ? "success" : "warning"}>{practicalPct}%</Badge>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontWeight: "800", fontSize: "1rem", color: isLow ? "var(--danger-solid)" : "var(--success-solid)" }}>
                        {sData.percentage}%
                      </span>
                    </td>
                    <td>
                      <Badge variant={isLow ? "danger" : "success"}>
                        {isLow ? "Defaulter (Warning)" : "In Good Standing"}
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

      {/* Signatures for Print */}
      <PrintSignatures />
    </div>
  );
}

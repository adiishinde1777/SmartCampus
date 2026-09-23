import React, { useState } from "react";
import { useSmartCampus } from "../../context/SmartCampusContext";
import {
  FileSpreadsheet,
  Download,
  CalendarCheck,
  Award,
  Users,
  Printer
} from "lucide-react";
import { Badge } from "../common/UIPrimitives";

export default function TeacherReports() {
  const { subjects, users, attendance, marks, systemSettings } = useSmartCampus();

  const [reportType, setReportType] = useState("attendance");
  const [selectedSubject, setSelectedSubject] = useState("sub-vlsi501");

  const students = users.filter((u) => u.role === "student" && u.departmentId === "dept-vlsi");
  const subjectObj = subjects.find((s) => s.id === selectedSubject) || subjects[0];
  const threshold = systemSettings.attendanceThreshold;

  const handleExport = () => {
    alert(`Exporting ${reportType.toUpperCase()} report for ${subjectObj.name} to Excel/CSV...`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: "800", color: "var(--text-main)" }}>
            Academic Reports & Defaulter Sheets
          </h2>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "4px" }}>
            Generate exportable attendance sheets, continuous evaluation logs, and parent communication records
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={handlePrint} className="btn btn-secondary btn-sm">
            <Printer size={14} /> Print Report
          </button>
          <button onClick={handleExport} className="btn btn-primary btn-sm">
            <Download size={14} /> Export CSV / Excel
          </button>
        </div>
      </div>

      {/* Filter Parameters */}
      <div className="card">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Report Category</label>
            <select
              className="form-control"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
            >
              <option value="attendance">Subject Attendance & Defaulter List</option>
              <option value="marks">Continuous Internal Evaluation (CIE) Marks</option>
              <option value="parent_alerts">Parent Notification Dispatch Log</option>
            </select>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Course Subject</label>
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
        </div>
      </div>

      {/* Generated Report View */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">
              <FileSpreadsheet size={18} color="var(--primary-600)" />
              {reportType === "attendance"
                ? `Official Attendance Sheet: ${subjectObj.name}`
                : `Marks Ledger: ${subjectObj.name}`}
            </div>
            <div className="card-subtitle">
              Generated on: {new Date().toLocaleDateString("en-GB")} • Academic Session: {systemSettings.academicYear}
            </div>
          </div>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Sr No</th>
                <th>Roll Number</th>
                <th>Student Full Name</th>
                <th>Total Lectures</th>
                <th>Attended</th>
                <th>Percentage</th>
                <th>Institutional Eligibility</th>
                <th>Parent Notification Status</th>
              </tr>
            </thead>
            <tbody>
              {students.map((stu, idx) => {
                const sData = attendance[stu.id]?.[selectedSubject] || { total: 20, attended: 16, percentage: 80 };
                const isBelow = sData.percentage < threshold;

                return (
                  <tr key={stu.id} style={{ background: isBelow ? "#fff1f2" : undefined }}>
                    <td>{idx + 1}</td>
                    <td>
                      <Badge variant="gray">{stu.rollNo}</Badge>
                    </td>
                    <td>
                      <strong>{stu.name}</strong>
                    </td>
                    <td>{sData.total}</td>
                    <td>{sData.attended}</td>
                    <td>
                      <strong style={{ color: isBelow ? "var(--danger-solid)" : "var(--success-text)" }}>
                        {sData.percentage}%
                      </strong>
                    </td>
                    <td>
                      {isBelow ? (
                        <Badge variant="danger">Defaulter Notice Issued</Badge>
                      ) : (
                        <Badge variant="success">Eligible for Exams</Badge>
                      )}
                    </td>
                    <td>
                      <span style={{ fontSize: "0.8rem", color: isBelow ? "#b91c1c" : "var(--text-muted)", fontWeight: isBelow ? "700" : "normal" }}>
                        {isBelow ? "⚠️ Dispatched SMS/WhatsApp Alert" : "Normal weekly digest"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

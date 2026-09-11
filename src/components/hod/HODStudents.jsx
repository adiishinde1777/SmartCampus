import React, { useState } from "react";
import { useSmartCampus } from "../../context/SmartCampusContext";
import {
  Users,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle2,
  Phone,
  Mail,
  Send,
  MessageSquare
} from "lucide-react";
import { Badge, Modal } from "../common/UIPrimitives";

export default function HODStudents() {
  const { users, attendance, subjects, marks, systemSettings, addToast } = useSmartCampus();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all"); // 'all' | 'defaulters' | 'good'
  const [selectedStudentAlert, setSelectedStudentAlert] = useState(null);

  const deptStudents = users.filter((u) => u.role === "student" && u.departmentId === "dept-ce");
  const threshold = systemSettings.attendanceThreshold;

  const studentDataList = deptStudents.map((stu) => {
    const sAtt = attendance[stu.id] || {};
    let total = 0;
    let att = 0;
    subjects.forEach((s) => {
      const d = sAtt[s.id] || { total: 20, attended: 16, percentage: 80 };
      total += d.total;
      att += d.attended;
    });
    const avgAtt = total > 0 ? Math.round((att / total) * 1000) / 10 : 80;

    const stuMarks = marks.filter((m) => m.studentId === stu.id);
    const avgM = stuMarks.length > 0
      ? Math.round(stuMarks.reduce((a, b) => a + (b.marksObtained / b.maxMarks) * 100, 0) / stuMarks.length)
      : 75;

    return {
      ...stu,
      overallAttendance: avgAtt,
      avgMarks: avgM,
      isDefaulter: avgAtt < threshold
    };
  });

  const filtered = studentDataList.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.rollNo.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;
    if (filterType === "defaulters") return s.isDefaulter;
    if (filterType === "good") return !s.isDefaulter;
    return true;
  });

  const handleSendSpecialAlert = (stu) => {
    addToast(
      "Official HOD Defaulter Notice Sent",
      `Dispatched formal attendance debarment warning to ${stu.parentName} (${stu.parentPhone}) for ward ${stu.name}.`,
      "warning"
    );
    setSelectedStudentAlert(null);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: "800", color: "var(--text-main)" }}>
            Department Students Directory & Risk Monitor
          </h2>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "4px" }}>
            Monitor academic metrics, attendance compliance, and parent contact information for all department students
          </p>
        </div>

        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={() => setFilterType("all")}
            className={`btn btn-sm ${filterType === "all" ? "btn-primary" : "btn-secondary"}`}
          >
            All ({deptStudents.length})
          </button>
          <button
            onClick={() => setFilterType("defaulters")}
            className={`btn btn-sm ${filterType === "defaulters" ? "btn-danger" : "btn-secondary"}`}
          >
            Defaulters &lt;{threshold}% ({studentDataList.filter((s) => s.isDefaulter).length})
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="card" style={{ padding: "14px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Search size={18} color="var(--text-muted)" />
          <input
            type="text"
            className="form-control"
            style={{ border: "none", boxShadow: "none", padding: "0" }}
            placeholder="Search by student name or roll number (e.g. Rahul Patil, CE-2024-042)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Roll No</th>
                <th>Student Details</th>
                <th>Overall Attendance</th>
                <th>Avg Internal Marks</th>
                <th>Compliance Status</th>
                <th>Parent Contact & Alert</th>
                <th>HOD Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((stu) => (
                <tr key={stu.id} style={{ background: stu.isDefaulter ? "#fff1f2" : undefined }}>
                  <td>
                    <Badge variant="gray">{stu.rollNo}</Badge>
                  </td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <img
                        src={stu.avatar}
                        alt={stu.name}
                        style={{ width: "36px", height: "36px", borderRadius: "50%", objectFit: "cover" }}
                      />
                      <div>
                        <strong style={{ color: stu.isDefaulter ? "#991b1b" : "var(--text-main)" }}>{stu.name}</strong>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{stu.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <strong style={{ color: stu.isDefaulter ? "var(--danger-solid)" : "var(--success-solid)" }}>
                        {stu.overallAttendance}%
                      </strong>
                    </div>
                  </td>
                  <td>
                    <strong>{stu.avgMarks}%</strong>
                  </td>
                  <td>
                    {stu.isDefaulter ? (
                      <Badge variant="danger" icon={AlertTriangle}>Defaulter (&lt;{threshold}%)</Badge>
                    ) : (
                      <Badge variant="success" icon={CheckCircle2}>Compliant</Badge>
                    )}
                  </td>
                  <td>
                    <div style={{ fontSize: "0.82rem" }}>
                      <span style={{ fontWeight: "600" }}>{stu.parentName}</span>
                      <div style={{ fontSize: "0.75rem", color: "#047857" }}>{stu.parentPhone}</div>
                    </div>
                  </td>
                  <td>
                    {stu.isDefaulter ? (
                      <button
                        onClick={() => setSelectedStudentAlert(stu)}
                        className="btn btn-danger btn-sm"
                      >
                        <Send size={12} /> Issue HOD Warning
                      </button>
                    ) : (
                      <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Good standing</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* HOD Warning Confirmation Modal */}
      <Modal
        isOpen={Boolean(selectedStudentAlert)}
        onClose={() => setSelectedStudentAlert(null)}
        title={`Issue Official HOD Warning: ${selectedStudentAlert?.name}`}
      >
        <div>
          <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", marginBottom: "16px" }}>
            This will dispatch a high-priority official debarment notice to <strong>{selectedStudentAlert?.parentName}</strong> ({selectedStudentAlert?.parentPhone}) citing that <strong>{selectedStudentAlert?.name}</strong> has only <strong>{selectedStudentAlert?.overallAttendance}% attendance</strong>.
          </p>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
            <button className="btn btn-secondary" onClick={() => setSelectedStudentAlert(null)}>Cancel</button>
            <button className="btn btn-danger" onClick={() => handleSendSpecialAlert(selectedStudentAlert)}>
              Confirm & Dispatch Alert
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

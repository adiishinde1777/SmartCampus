import React, { useState } from "react";
import { useSmartCampus } from "../../context/SmartCampusContext";
import {
  Clock,
  PlusCircle,
  CheckCircle2,
  XCircle,
  FileText,
  AlertCircle,
  Calendar
} from "lucide-react";
import { Badge, Modal } from "../common/UIPrimitives";

export default function StudentLeave() {
  const { currentUser, leaves, applyLeave } = useSmartCampus();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [startDate, setStartDate] = useState("2026-09-15");
  const [endDate, setEndDate] = useState("2026-09-16");
  const [totalDays, setTotalDays] = useState(2);
  const [reason, setReason] = useState("Medical Leave - Fever recovery");
  const [description, setDescription] = useState("Doctor prescribed 2 days bed rest. Medical certificate attached.");
  const [docName, setDocName] = useState("medical_prescription.pdf");

  const student = currentUser;
  const myLeaves = leaves.filter((l) => l.studentId === student?.id);

  const handleSubmit = (e) => {
    e.preventDefault();
    applyLeave({
      startDate,
      endDate,
      totalDays: Number(totalDays),
      reason,
      description,
      document: docName
    });
    setIsModalOpen(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: "800", color: "var(--text-main)" }}>
            Leave Applications & Attendance Condonation
          </h2>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "4px" }}>
            Submit medical/duty leave requests with attached documents for faculty approval
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="btn btn-primary btn-sm"
        >
          <PlusCircle size={16} /> Apply for New Leave
        </button>
      </div>

      {/* Leave Application History */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <Clock size={18} color="var(--primary-600)" />
            My Leave Applications History
          </div>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Applied Date</th>
                <th>Leave Duration</th>
                <th>Days</th>
                <th>Reason</th>
                <th>Document</th>
                <th>Status</th>
                <th>Approver Remarks</th>
              </tr>
            </thead>
            <tbody>
              {myLeaves.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center", padding: "24px", color: "var(--text-muted)" }}>
                    No leave applications submitted yet.
                  </td>
                </tr>
              ) : (
                myLeaves.map((lv) => (
                  <tr key={lv.id}>
                    <td>{lv.appliedDate}</td>
                    <td>
                      <strong>{lv.startDate}</strong> to <strong>{lv.endDate}</strong>
                    </td>
                    <td>
                      <Badge variant="gray">{lv.totalDays} Day(s)</Badge>
                    </td>
                    <td>
                      <div>
                        <div style={{ fontWeight: "600" }}>{lv.reason}</div>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{lv.description}</div>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: "0.78rem", color: "var(--primary-600)", textDecoration: "underline", cursor: "pointer" }} onClick={() => alert(`Viewing attached doc: ${lv.document}`)}>
                        {lv.document}
                      </span>
                    </td>
                    <td>
                      {lv.status === "Approved" ? (
                        <Badge variant="success" icon={CheckCircle2}>Approved</Badge>
                      ) : lv.status === "Rejected" ? (
                        <Badge variant="danger" icon={XCircle}>Rejected</Badge>
                      ) : (
                        <Badge variant="warning" icon={Clock}>Pending Review</Badge>
                      )}
                    </td>
                    <td>
                      <span style={{ fontSize: "0.8rem", color: lv.approverComment ? "var(--text-main)" : "var(--text-muted)" }}>
                        {lv.approverComment || "Under review by Mentor/HOD"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Apply Leave Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Apply for Student Leave"
      >
        <form onSubmit={handleSubmit}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <div className="form-group">
              <label className="form-label">Start Date</label>
              <input
                type="date"
                className="form-control"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">End Date</label>
              <input
                type="date"
                className="form-control"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Total Days</label>
            <input
              type="number"
              className="form-control"
              value={totalDays}
              min="1"
              onChange={(e) => setTotalDays(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Reason Category</label>
            <select
              className="form-control"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            >
              <option value="Medical Leave - Illness">Medical Leave - Illness</option>
              <option value="On-Duty Official College Event / Hackathon">On-Duty Official College Event / Hackathon</option>
              <option value="Family Emergency">Family Emergency</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Detailed Explanation</label>
            <textarea
              className="form-control"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide reason details..."
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Medical Certificate / Supporting Doc</label>
            <input
              type="text"
              className="form-control"
              value={docName}
              onChange={(e) => setDocName(e.target.value)}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "16px" }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Submit Leave Application
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

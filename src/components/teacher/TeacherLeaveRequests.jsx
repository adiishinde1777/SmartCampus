import React, { useState } from "react";
import { useSmartCampus } from "../../context/SmartCampusContext";
import {
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  User,
  Calendar,
  MessageSquare
} from "lucide-react";
import { Badge, Modal } from "../common/UIPrimitives";

export default function TeacherLeaveRequests() {
  const { leaves, updateLeaveStatus } = useSmartCampus();

  const [reviewModalData, setReviewModalData] = useState(null); // { id, studentName, reason, dates }
  const [approverComment, setApproverComment] = useState("Approved. Medical certificate verified.");

  const handleAction = (status) => {
    if (!reviewModalData) return;
    updateLeaveStatus(reviewModalData.id, status, approverComment);
    setReviewModalData(null);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div>
        <h2 style={{ fontSize: "1.5rem", fontWeight: "800", color: "var(--text-main)" }}>
          Student Leave Applications Approval Desk
        </h2>
        <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "4px" }}>
          Review, approve, or reject student medical and official duty leave requests with remarks
        </p>
      </div>

      {/* Requests Table */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <Clock size={18} color="var(--primary-600)" />
            Pending & Processed Leave Applications ({leaves.length})
          </div>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Student Details</th>
                <th>Leave Dates</th>
                <th>Duration</th>
                <th>Reason & Medical Note</th>
                <th>Document</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {leaves.map((lv) => (
                <tr key={lv.id}>
                  <td>
                    <div style={{ fontWeight: "700" }}>{lv.studentName}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Roll: {lv.rollNo}</div>
                  </td>
                  <td>
                    <strong>{lv.startDate}</strong> to <strong>{lv.endDate}</strong>
                    <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Applied: {lv.appliedDate}</div>
                  </td>
                  <td>
                    <Badge variant="gray">{lv.totalDays} Day(s)</Badge>
                  </td>
                  <td>
                    <div style={{ fontWeight: "600" }}>{lv.reason}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{lv.description}</div>
                  </td>
                  <td>
                    <span
                      style={{ fontSize: "0.78rem", color: "var(--primary-600)", textDecoration: "underline", cursor: "pointer" }}
                      onClick={() => alert(`Opening attached verification document: ${lv.document}`)}
                    >
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
                    {lv.status === "Pending" ? (
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button
                          onClick={() => {
                            setReviewModalData(lv);
                            setApproverComment("Approved. Medical document verified.");
                          }}
                          className="btn btn-primary btn-sm"
                        >
                          Review & Decide
                        </button>
                      </div>
                    ) : (
                      <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{lv.approverComment}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Modal */}
      <Modal
        isOpen={Boolean(reviewModalData)}
        onClose={() => setReviewModalData(null)}
        title={`Review Leave: ${reviewModalData?.studentName}`}
      >
        <div>
          <div style={{ background: "var(--bg-surface-secondary)", padding: "12px 16px", borderRadius: "8px", fontSize: "0.85rem", marginBottom: "16px" }}>
            <div>Reason: <strong>{reviewModalData?.reason}</strong></div>
            <div>Duration: <strong>{reviewModalData?.startDate}</strong> to <strong>{reviewModalData?.endDate}</strong> ({reviewModalData?.totalDays} days)</div>
          </div>

          <div className="form-group">
            <label className="form-label">Approver Note / Remarks</label>
            <textarea
              className="form-control"
              rows={3}
              value={approverComment}
              onChange={(e) => setApproverComment(e.target.value)}
              placeholder="e.g. Approved on medical grounds with full condonation."
              required
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "16px" }}>
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => handleAction("Rejected")}
            >
              <XCircle size={16} /> Reject Application
            </button>
            <button
              type="button"
              className="btn btn-success"
              onClick={() => handleAction("Approved")}
            >
              <CheckCircle2 size={16} /> Approve Leave
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

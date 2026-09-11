import React, { useState } from "react";
import { useSmartCampus } from "../../context/SmartCampusContext";
import {
  AlertOctagon,
  CheckCircle2,
  Clock,
  Wrench,
  User,
  MapPin,
  Send
} from "lucide-react";
import { Badge, Modal } from "../common/UIPrimitives";

export default function HODComplaints() {
  const { complaints, updateComplaintStatus } = useSmartCampus();

  const [activeModalTicket, setActiveModalTicket] = useState(null);
  const [assignedTo, setAssignedTo] = useState("Mr. S. Jadhav (AV & IT Technician)");
  const [status, setStatus] = useState("In Progress");
  const [resolutionNote, setResolutionNote] = useState("Technician dispatched with replacement spare parts.");

  const handleUpdate = (e) => {
    e.preventDefault();
    if (!activeModalTicket) return;
    updateComplaintStatus(activeModalTicket.id, status, resolutionNote, assignedTo);
    setActiveModalTicket(null);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div>
        <h2 style={{ fontSize: "1.5rem", fontWeight: "800", color: "var(--text-main)" }}>
          Department Complaint & Facility Issue Resolution Desk
        </h2>
        <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "4px" }}>
          Track classroom, laboratory, and hardware grievances reported by students and assign maintenance personnel
        </p>
      </div>

      {/* Complaints Table */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <AlertOctagon size={18} color="var(--primary-600)" />
            Active Tickets ({complaints.length})
          </div>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Ticket ID</th>
                <th>Category & Venue</th>
                <th>Reported Problem</th>
                <th>Reported By</th>
                <th>Priority</th>
                <th>Assigned Technician</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {complaints.map((c) => (
                <tr key={c.id}>
                  <td>
                    <Badge variant="gray">{c.ticketNo}</Badge>
                    <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{c.createdAt}</div>
                  </td>
                  <td>
                    <strong>{c.category}</strong>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "3px" }}>
                      <MapPin size={12} /> {c.location}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: "600" }}>{c.title}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{c.description}</div>
                  </td>
                  <td>{c.studentName}</td>
                  <td>
                    <Badge variant={c.priority === "Urgent" || c.priority === "High" ? "danger" : "info"}>
                      {c.priority}
                    </Badge>
                  </td>
                  <td>
                    <span style={{ fontSize: "0.82rem" }}>{c.assignedTo || "Unassigned"}</span>
                  </td>
                  <td>
                    <Badge variant={c.status === "Resolved" ? "success" : c.status === "In Progress" ? "purple" : "warning"}>
                      {c.status}
                    </Badge>
                  </td>
                  <td>
                    <button
                      onClick={() => {
                        setActiveModalTicket(c);
                        setStatus(c.status);
                        setAssignedTo(c.assignedTo || "IT Support Cell");
                        setResolutionNote(c.resolutionNote || "Action in progress");
                      }}
                      className="btn btn-primary btn-sm"
                    >
                      Assign / Resolve
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={Boolean(activeModalTicket)}
        onClose={() => setActiveModalTicket(null)}
        title={`Manage Ticket: ${activeModalTicket?.ticketNo}`}
      >
        <form onSubmit={handleUpdate}>
          <div style={{ background: "var(--bg-surface-secondary)", padding: "12px", borderRadius: "8px", fontSize: "0.82rem", marginBottom: "16px" }}>
            <div>Issue: <strong>{activeModalTicket?.title}</strong></div>
            <div>Location: <strong>{activeModalTicket?.location}</strong></div>
          </div>

          <div className="form-group">
            <label className="form-label">Assign Responsible Technician / Staff</label>
            <input
              type="text"
              className="form-control"
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Update Ticket Status</label>
            <select
              className="form-control"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="Reported">Reported</option>
              <option value="Assigned">Assigned</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Resolution / Action Note</label>
            <textarea
              className="form-control"
              rows={3}
              value={resolutionNote}
              onChange={(e) => setResolutionNote(e.target.value)}
              placeholder="Detail actions taken to resolve..."
              required
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "16px" }}>
            <button type="button" className="btn btn-secondary" onClick={() => setActiveModalTicket(null)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Ticket Update
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

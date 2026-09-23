import React, { useState } from "react";
import { useSmartCampus } from "../../context/SmartCampusContext";
import {
  AlertOctagon,
  PlusCircle,
  CheckCircle2,
  Clock,
  Wrench,
  HelpCircle,
  MapPin
} from "lucide-react";
import { Badge, Modal } from "../common/UIPrimitives";

export default function StudentComplaints() {
  const { currentUser, complaints, raiseComplaint } = useSmartCampus();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [category, setCategory] = useState("Projector");
  const [location, setLocation] = useState("Classroom B-204");
  const [title, setTitle] = useState("Ceiling projector flickering and HDMI port loose");
  const [description, setDescription] = useState("During DBMS lectures the projection flashes every few minutes.");
  const [priority, setPriority] = useState("High");

  const student = currentUser;
  const myComplaints = complaints.filter((c) => c.studentId === student?.id);

  const handleSubmit = (e) => {
    e.preventDefault();
    raiseComplaint({
      category,
      location,
      title,
      description,
      priority
    });
    setIsModalOpen(false);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Resolved":
        return <Badge variant="success" icon={CheckCircle2}>Resolved</Badge>;
      case "In Progress":
        return <Badge variant="purple" icon={Wrench}>In Progress</Badge>;
      case "Assigned":
        return <Badge variant="info" icon={Clock}>Assigned</Badge>;
      default:
        return <Badge variant="warning" icon={AlertOctagon}>Reported</Badge>;
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: "800", color: "var(--text-main)" }}>
            Campus Issue & Complaint Ticketing System
          </h2>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "4px" }}>
            Report classroom, laboratory, Wi-Fi, and infrastructure grievances with transparent resolution tracking
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="btn btn-primary btn-sm"
        >
          <PlusCircle size={16} /> Raise New Complaint Ticket
        </button>
      </div>

      {/* Complaints List */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <AlertOctagon size={18} color="var(--primary-600)" />
            My Raised Support Tickets
          </div>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Ticket ID</th>
                <th>Category & Location</th>
                <th>Subject & Description</th>
                <th>Priority</th>
                <th>Assigned Facility Staff</th>
                <th>Status</th>
                <th>Resolution Details</th>
              </tr>
            </thead>
            <tbody>
              {myComplaints.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center", padding: "24px", color: "var(--text-muted)" }}>
                    No tickets filed by your account.
                  </td>
                </tr>
              ) : (
                myComplaints.map((cmp) => (
                  <tr key={cmp.id}>
                    <td>
                      <Badge variant="gray">{cmp.ticketNo}</Badge>
                      <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "2px" }}>{cmp.createdAt}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: "700" }}>{cmp.category}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "3px" }}>
                        <MapPin size={12} /> {cmp.location}
                      </div>
                    </td>
                    <td>
                      <div>
                        <strong style={{ color: "var(--text-main)" }}>{cmp.title}</strong>
                        <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "2px" }}>
                          {cmp.description}
                        </div>
                      </div>
                    </td>
                    <td>
                      <Badge variant={cmp.priority === "Urgent" || cmp.priority === "High" ? "danger" : "info"}>
                        {cmp.priority}
                      </Badge>
                    </td>
                    <td>
                      <span style={{ fontSize: "0.82rem" }}>{cmp.assignedTo || "Maintenance Cell"}</span>
                    </td>
                    <td>{getStatusBadge(cmp.status)}</td>
                    <td>
                      <span style={{ fontSize: "0.8rem", color: cmp.resolutionNote ? "var(--text-main)" : "var(--text-muted)" }}>
                        {cmp.resolutionNote || "Pending investigation"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal to file ticket */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Raise Campus Complaint Ticket"
      >
        <form onSubmit={handleSubmit}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                className="form-control"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="Classroom">Classroom</option>
                <option value="Laboratory">Laboratory</option>
                <option value="Projector">Projector</option>
                <option value="Computer">Computer</option>
                <option value="Wi-Fi">Wi-Fi & Network</option>
                <option value="Cleanliness">Cleanliness</option>
                <option value="Infrastructure">Infrastructure</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Priority</label>
              <select
                className="form-control"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Specific Location</label>
            <input
              type="text"
              className="form-control"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Classroom B-204 / Lab 3"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Issue Title</label>
            <input
              type="text"
              className="form-control"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Brief summary of the issue"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Detailed Description</label>
            <textarea
              className="form-control"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide exact details of the problem..."
              required
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "16px" }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Generate Ticket
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

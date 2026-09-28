import React, { useState } from "react";
import { useSmartCampus } from "../../context/SmartCampusContext";
import {
  Bell,
  PlusCircle,
  Calendar,
  AlertTriangle,
  Send,
  FileText,
  Zap
} from "lucide-react";
import { Badge, Modal } from "../common/UIPrimitives";

export default function TeacherNotices() {
  const { notices, createNotice, currentUser } = useSmartCampus();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Academic");
  const [priority, setPriority] = useState("General");
  const [content, setContent] = useState("");
  const [expiryDate, setExpiryDate] = useState("2026-09-30");
  const [isFlashMessage, setIsFlashMessage] = useState(false);
  const [flashDurationHours, setFlashDurationHours] = useState(24);

  const canPublishFlash = currentUser?.role === "hod" || currentUser?.role === "principal" || currentUser?.role === "admin";

  const handleSubmit = (e) => {
    e.preventDefault();
    createNotice({
      title,
      category,
      priority: isFlashMessage ? "Urgent" : priority,
      content,
      expiryDate,
      department: currentUser?.departmentName || "All Departments",
      isFlashMessage,
      flashDurationHours: Number(flashDurationHours)
    });
    setIsModalOpen(false);
    setTitle("");
    setContent("");
    setIsFlashMessage(false);
    setFlashDurationHours(24);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: "800", color: "var(--text-main)" }}>
            Class & Subject Circular Publisher
          </h2>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "4px" }}>
            Publish departmental circulars, submission guidelines, and test announcements
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="btn btn-primary btn-sm"
        >
          <PlusCircle size={16} /> Publish Class Notice
        </button>
      </div>

      {/* Notices Feed */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {notices.map((n) => {
          const isFlashActive = n.isFlashMessage && (!n.flashExpiresAt || new Date(n.flashExpiresAt) > new Date());
          return (
            <div
              key={n.id}
              className="card"
              style={{
                borderLeft: isFlashActive ? "5px solid #e11d48" : (n.important ? "5px solid #ef4444" : "5px solid var(--primary-600)"),
                background: isFlashActive ? "#fff1f2" : (n.important ? "#fffdfd" : "white")
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px", flexWrap: "wrap", gap: "8px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                  <Badge variant={n.priority === "Urgent" ? "danger" : "purple"}>{n.category}</Badge>
                  {n.important && <Badge variant="danger">High Priority</Badge>}
                  {isFlashActive && (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", background: "#e11d48", color: "white", padding: "2px 8px", borderRadius: "12px", fontSize: "0.72rem", fontWeight: "800", animation: "pulse 2s infinite" }}>
                      <Zap size={12} fill="white" /> FLASH NOTICE ({n.flashDurationHours || 24}h ACTIVE)
                    </span>
                  )}
                </div>
                <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Published: {n.publishDate}</span>
              </div>

              <h3 style={{ fontSize: "1.15rem", fontWeight: "700", marginBottom: "6px", color: isFlashActive ? "#9f1239" : "var(--text-main)" }}>
                {isFlashActive && "🚨 "}{n.title}
              </h3>
              <p style={{ fontSize: "0.88rem", color: isFlashActive ? "#881337" : "var(--text-muted)", lineHeight: 1.5, marginBottom: "12px" }}>
                {n.content}
              </p>

              <div style={{ fontSize: "0.78rem", color: isFlashActive ? "#be123c" : "var(--text-muted)", borderTop: "1px solid var(--border-subtle)", paddingTop: "10px", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
                <span>Author: <strong>{n.author}</strong> • Dept: {n.department}</span>
                {isFlashActive && n.flashExpiresAt && (
                  <span style={{ fontWeight: "700", color: "#e11d48" }}>
                    ⏳ Auto-Expires: {new Date(n.flashExpiresAt).toLocaleString()}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Publish Notice Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Publish Class / Department Circular"
      >
        <form onSubmit={handleSubmit}>
          {/* Flash Message Option for HOD / Principal */}
          {canPublishFlash && (
            <div style={{
              background: isFlashMessage ? "#fff1f2" : "#f8fafc",
              border: isFlashMessage ? "1.5px solid #f43f5e" : "1px solid #e2e8f0",
              borderRadius: "10px",
              padding: "14px",
              marginBottom: "16px",
              transition: "all 0.2s ease"
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", fontWeight: "700", color: isFlashMessage ? "#be123c" : "#1e293b", fontSize: "0.9rem" }}>
                  <input
                    type="checkbox"
                    checked={isFlashMessage}
                    onChange={(e) => setIsFlashMessage(e.target.checked)}
                    style={{ width: "18px", height: "18px", accentColor: "#e11d48", cursor: "pointer" }}
                  />
                  <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <Zap size={16} color={isFlashMessage ? "#e11d48" : "#64748b"} />
                    ⚡ Publish as Urgent Flash Message (Student Top Alert Banner)
                  </span>
                </label>
                {isFlashMessage && (
                  <span style={{ fontSize: "0.72rem", background: "#ffe4e6", color: "#e11d48", padding: "2px 8px", borderRadius: "12px", fontWeight: "700" }}>
                    High Priority Ticker Active
                  </span>
                )}
              </div>

              {isFlashMessage && (
                <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1px dashed #fecdd3" }}>
                  <label className="form-label" style={{ fontSize: "0.82rem", color: "#9f1239", fontWeight: "700" }}>
                    Display Flash Duration (विद्यार्थ्यांना किती वेळ Flash दिसावे)
                  </label>
                  <select
                    className="form-control"
                    value={flashDurationHours}
                    onChange={(e) => setFlashDurationHours(Number(e.target.value))}
                    style={{ borderColor: "#fda4af", fontWeight: "600" }}
                  >
                    <option value={24}>24 Hours (Standard 1 Day • 24 तास)</option>
                    <option value={12}>12 Hours (Half Day • 12 तास)</option>
                    <option value={6}>6 Hours (Immediate Alert • 6 तास)</option>
                    <option value={48}>48 Hours (2 Days • 48 तास)</option>
                    <option value={72}>72 Hours (3 Days • 72 तास)</option>
                    <option value={168}>7 Days (1 Week • 1 आठवडा)</option>
                  </select>
                  <p style={{ fontSize: "0.76rem", color: "#e11d48", marginTop: "6px", lineHeight: 1.4 }}>
                    🔔 ही नोटीस विद्यार्थ्यांच्या डॅशबोर्डवर सर्वात वरती ठळक <strong>Flash Notice</strong> म्हणून सतत लुकलुकेल आणि ठरवलेल्या मुदतीनंतर आपोआप बंद होईल.
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Notice Title</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. DBMS Unit Test 1 Syllabus & Seating Matrix"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                className="form-control"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="Academic">Academic</option>
                <option value="Exam">Exam</option>
                <option value="Assignment">Assignment</option>
                <option value="Department">Department</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Priority</label>
              <select
                className="form-control"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="General">General</option>
                <option value="Urgent">Urgent (Red Alert Banner)</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Notice Content & Guidelines</label>
            <textarea
              className="form-control"
              rows={4}
              placeholder="Write circular content..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "16px" }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Post to Active Board
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

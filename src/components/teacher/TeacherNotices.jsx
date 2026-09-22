import React, { useState } from "react";
import { useSmartCampus } from "../../context/SmartCampusContext";
import {
  Bell,
  PlusCircle,
  Calendar,
  AlertTriangle,
  Send,
  FileText
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

  const handleSubmit = (e) => {
    e.preventDefault();
    createNotice({
      title,
      category,
      priority,
      content,
      expiryDate,
      department: currentUser?.departmentName || "Computer Science Engineering (CSE)"
    });
    setIsModalOpen(false);
    setTitle("");
    setContent("");
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
        {notices.map((n) => (
          <div key={n.id} className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Badge variant={n.priority === "Urgent" ? "danger" : "purple"}>{n.category}</Badge>
                {n.important && <Badge variant="danger">High Priority</Badge>}
              </div>
              <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Published: {n.publishDate}</span>
            </div>

            <h3 style={{ fontSize: "1.15rem", fontWeight: "700", marginBottom: "6px" }}>{n.title}</h3>
            <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", lineHeight: 1.5, marginBottom: "12px" }}>
              {n.content}
            </p>

            <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", borderTop: "1px solid var(--border-subtle)", paddingTop: "10px" }}>
              Author: <strong>{n.author}</strong> • Dept: {n.department}
            </div>
          </div>
        ))}
      </div>

      {/* Publish Notice Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Publish Class / Subject Notice"
      >
        <form onSubmit={handleSubmit}>
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

import React, { useState } from "react";
import { useSmartCampus } from "../../context/SmartCampusContext";
import {
  Sparkles,
  Users,
  Award,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  AlertTriangle,
  Search,
  Filter,
  Eye,
  Check,
  X,
  MapPin,
  HeartPulse
} from "lucide-react";
import { Modal, Badge } from "../common/UIPrimitives";
import { getSkillEmoji } from "../../data/talentAndHealthData";

export default function HODTalentEvents() {
  const {
    currentUser,
    users,
    departments,
    studentSkills,
    collegeEvents,
    eventInvitations,
    eventTeamMembers,
    studentHealthRecords,
    updateHealthVerification,
    logHealthAccess,
    addToast
  } = useSmartCampus();

  const hod = currentUser;
  const deptId = hod?.departmentId || "dept-vlsi";
  const dept = departments.find((d) => d.id === deptId) || {
    id: deptId,
    name: hod?.departmentName || "Electronic Engineering (VLSI Design And Technology)"
  };

  // Department students
  const deptStudents = users.filter((u) => u.role === "student" && (u.departmentId === dept.id || !u.departmentId));
  const deptStudentIds = new Set(deptStudents.map((s) => s.id));

  // Department skills - ONLY faculty-approved skills are visible to HOD
  const deptSkills = studentSkills.filter((s) => deptStudentIds.has(s.studentId) && s.approvalStatus === "Approved");

  // Department health records
  const deptHealthRecords = studentHealthRecords.filter((h) => deptStudentIds.has(h.studentId));
  const pendingHealthDocs = deptHealthRecords.filter((h) => h.verificationStatus === "Pending Verification");

  // Tabs: 'talent' | 'events' | 'health-verification'
  const [activeTab, setActiveTab] = useState("talent");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  // Verification Review Modal State
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedRecordForReview, setSelectedRecordForReview] = useState(null);
  const [verificationDecision, setVerificationDecision] = useState("Verified");
  const [reviewNotes, setReviewNotes] = useState("");

  // Filter department talent
  const filteredSkills = deptSkills.filter((s) => {
    if (categoryFilter !== "All" && s.category !== categoryFilter) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        s.studentName.toLowerCase().includes(q) ||
        s.skill.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleOpenReviewModal = (record) => {
    setSelectedRecordForReview(record);
    setVerificationDecision("Verified");
    setReviewNotes("");
    logHealthAccess("HOD_REVIEW_HEALTH_RECORD", record.studentId, "Opened medical document for verification review");
    setReviewModalOpen(true);
  };

  const handleConfirmVerification = () => {
    if (!selectedRecordForReview) return;
    updateHealthVerification({
      recordId: selectedRecordForReview.id,
      verificationStatus: verificationDecision,
      reviewNotes: reviewNotes.trim()
    });
    setReviewModalOpen(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* 1. Header Banner */}
      <div
        style={{
          background: "linear-gradient(135deg, #312e81 0%, #1e1b4b 50%, #0f172a 100%)",
          borderRadius: "16px",
          padding: "24px 32px",
          color: "white",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
          boxShadow: "0 10px 25px -5px rgba(49, 46, 129, 0.4)"
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
            <span style={{ background: "rgba(255,255,255,0.15)", padding: "4px 10px", borderRadius: "20px", fontSize: "0.75rem", fontWeight: "700" }}>
              DEPARTMENT LEADERSHIP
            </span>
          </div>
          <h2 style={{ fontSize: "1.75rem", fontWeight: "800", color: "white" }}>
            Department Talent & Events 🏆
          </h2>
          <p style={{ fontSize: "0.9rem", color: "#c7d2fe", marginTop: "4px" }}>
            {dept.name} • Monitor departmental talent profiles, event representation, and medical verification.
          </p>
        </div>

        {pendingHealthDocs.length > 0 && (
          <button
            onClick={() => setActiveTab("health-verification")}
            className="btn btn-warning"
            style={{ display: "flex", alignItems: "center", gap: "8px" }}
          >
            <ShieldCheck size={18} />
            <span>{pendingHealthDocs.length} Health Doc(s) Requiring Verification</span>
          </button>
        )}
      </div>

      {/* 2. Department Metrics Overview */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
        <div className="card" style={{ padding: "18px" }}>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: "700", textTransform: "uppercase" }}>
            Dept Skilled Students
          </div>
          <div style={{ fontSize: "1.6rem", fontWeight: "800", color: "var(--primary-700)", marginTop: "4px" }}>
            {new Set(deptSkills.map((s) => s.studentId)).size}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "2px" }}>
            Total {deptSkills.length} declared skills
          </div>
        </div>

        <div className="card" style={{ padding: "18px" }}>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: "700", textTransform: "uppercase" }}>
            Event Volunteers
          </div>
          <div style={{ fontSize: "1.6rem", fontWeight: "800", color: "var(--success-text)", marginTop: "4px" }}>
            {deptSkills.filter((s) => s.availableForEvents === "Yes").length}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "2px" }}>
            Available for college fests
          </div>
        </div>

        <div className="card" style={{ padding: "18px" }}>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: "700", textTransform: "uppercase" }}>
            Upcoming College Events
          </div>
          <div style={{ fontSize: "1.6rem", fontWeight: "800", color: "var(--accent-purple)", marginTop: "4px" }}>
            {collegeEvents.filter((e) => e.status === "Upcoming").length}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "2px" }}>
            Active campus schedules
          </div>
        </div>

        <div className="card" style={{ padding: "18px" }}>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: "700", textTransform: "uppercase" }}>
            Health Records On File
          </div>
          <div style={{ fontSize: "1.6rem", fontWeight: "800", color: pendingHealthDocs.length > 0 ? "var(--warning-solid)" : "var(--success-solid)", marginTop: "4px" }}>
            {deptHealthRecords.length}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "2px" }}>
            {pendingHealthDocs.length} pending verification
          </div>
        </div>
      </div>

      {/* 3. Tab Navigation */}
      <div style={{ display: "flex", gap: "12px", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "8px" }}>
        <button
          onClick={() => setActiveTab("talent")}
          style={{
            background: "none",
            border: "none",
            padding: "8px 16px",
            fontSize: "0.92rem",
            fontWeight: "700",
            cursor: "pointer",
            color: activeTab === "talent" ? "var(--primary-600)" : "var(--text-muted)",
            borderBottom: activeTab === "talent" ? "3px solid var(--primary-600)" : "3px solid transparent",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}
        >
          <Sparkles size={16} />
          Department Talent Directory ({filteredSkills.length})
        </button>

        <button
          onClick={() => setActiveTab("health-verification")}
          style={{
            background: "none",
            border: "none",
            padding: "8px 16px",
            fontSize: "0.92rem",
            fontWeight: "700",
            cursor: "pointer",
            color: activeTab === "health-verification" ? "var(--primary-600)" : "var(--text-muted)",
            borderBottom: activeTab === "health-verification" ? "3px solid var(--primary-600)" : "3px solid transparent",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}
        >
          <ShieldCheck size={16} />
          Health Document Verification Desk
          {pendingHealthDocs.length > 0 && (
            <span
              style={{
                background: "var(--warning-solid)",
                color: "white",
                borderRadius: "10px",
                padding: "1px 7px",
                fontSize: "0.72rem",
                fontWeight: "800"
              }}
            >
              {pendingHealthDocs.length} Action Needed
            </span>
          )}
        </button>
      </div>

      {/* 4. TAB 1: TALENT DIRECTORY */}
      {activeTab === "talent" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Filter Bar */}
          <div className="card" style={{ padding: "16px", display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", gap: "12px", flex: "1 1 300px" }}>
              <div style={{ position: "relative", flex: 1 }}>
                <Search size={16} style={{ position: "absolute", left: "10px", top: "10px", color: "var(--text-muted)" }} />
                <input
                  type="text"
                  className="form-control"
                  style={{ paddingLeft: "32px", fontSize: "0.85rem" }}
                  placeholder="Search student name or skill..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <select
                className="form-control"
                style={{ width: "160px", fontSize: "0.85rem" }}
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="All">All Categories</option>
                <option value="Sports">Sports</option>
                <option value="Cultural">Cultural</option>
                <option value="Event & Management">Management</option>
                <option value="Technical">Technical</option>
              </select>
            </div>

            <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
              Showing {filteredSkills.length} of {deptSkills.length} skills
            </span>
          </div>

          {/* Table of Skills */}
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Skill & Category</th>
                  <th>Proficiency Level</th>
                  <th>Experience</th>
                  <th>Availability</th>
                  <th>Achievements / Proof</th>
                </tr>
              </thead>
              <tbody>
                {filteredSkills.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: "center", color: "var(--text-muted)", padding: "24px" }}>
                      No skills found matching filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredSkills.map((s) => (
                    <tr key={s.id}>
                      <td>
                        <strong>{s.studentName}</strong>
                        <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                          {s.year} • Roll {s.rollNo || "VL3152"}
                        </div>
                      </td>
                      <td>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontWeight: "600" }}>
                          <span>{getSkillEmoji(s.category, s.skill)}</span>
                          <span>{s.skill}</span>
                        </span>
                        <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{s.category}</div>
                      </td>
                      <td>
                        <span
                          style={{
                            padding: "2px 8px",
                            borderRadius: "10px",
                            fontSize: "0.75rem",
                            fontWeight: "700",
                            background:
                              s.skillLevel === "Expert" ? "#fef3c7" :
                              s.skillLevel === "Advanced" ? "#dbeafe" : "#f1f5f9",
                            color:
                              s.skillLevel === "Expert" ? "#92400e" :
                              s.skillLevel === "Advanced" ? "#1e40af" : "var(--text-main)"
                          }}
                        >
                          {s.skillLevel}
                        </span>
                      </td>
                      <td style={{ fontSize: "0.82rem" }}>
                        <div>{s.experienceLevel}</div>
                        {s.experienceDescription && (
                          <div style={{ fontSize: "0.74rem", color: "var(--text-muted)", maxWidth: "240px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            "{s.experienceDescription}"
                          </div>
                        )}
                      </td>
                      <td>
                        <span
                          style={{
                            padding: "2px 8px",
                            borderRadius: "8px",
                            fontSize: "0.72rem",
                            fontWeight: "700",
                            background: s.availableForEvents === "Yes" ? "var(--success-bg)" : "var(--danger-bg)",
                            color: s.availableForEvents === "Yes" ? "var(--success-text)" : "var(--danger-text)"
                          }}
                        >
                          {s.availableForEvents === "Yes" ? "Available" : "Unavailable"}
                        </span>
                      </td>
                      <td style={{ fontSize: "0.78rem" }}>
                        {s.achievements && s.achievements.length > 0 ? (
                          <span style={{ color: "var(--primary-700)", fontWeight: "600" }}>
                            {s.achievements[0]} {s.achievements.length > 1 ? `(+${s.achievements.length - 1} more)` : ""}
                          </span>
                        ) : (
                          <span style={{ color: "var(--text-muted)" }}>None listed</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. TAB 2: HEALTH DOCUMENT VERIFICATION DESK */}
      {activeTab === "health-verification" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div
            style={{
              padding: "14px 20px",
              borderRadius: "10px",
              background: "#eff6ff",
              border: "1px solid #bfdbfe",
              fontSize: "0.85rem",
              color: "#1e3a8a",
              display: "flex",
              alignItems: "center",
              gap: "10px"
            }}
          >
            <ShieldCheck size={20} />
            <span>
              <strong>Authorized Verification Desk:</strong> The Head of Department reviews medical letters and certificates submitted by parents to officially verify conditions for student safety during labs, workshops, and sports events.
            </span>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Student Name & PRN</th>
                  <th>Condition Category</th>
                  <th>Parent Information</th>
                  <th>Doctor Letter / Proof</th>
                  <th>Current Status</th>
                  <th>Review Actions</th>
                </tr>
              </thead>
              <tbody>
                {deptHealthRecords.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: "center", color: "var(--text-muted)", padding: "24px" }}>
                      No health records on file for this department.
                    </td>
                  </tr>
                ) : (
                  deptHealthRecords.map((rec) => (
                    <tr key={rec.id}>
                      <td>
                        <strong>{rec.studentName}</strong>
                        <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                          PRN: {rec.prn} • {rec.year}
                        </div>
                      </td>
                      <td>
                        <strong style={{ color: "#991b1b" }}>{rec.conditionCategory}</strong>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", maxWidth: "220px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {rec.description}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: "0.82rem" }}>{rec.parentName}</div>
                        <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{rec.parentContact}</div>
                      </td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <FileText size={14} color="var(--primary-600)" />
                          <span style={{ fontSize: "0.78rem", fontWeight: "600" }}>{rec.documentName || "Medical_Doc.pdf"}</span>
                        </div>
                        <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Size: {rec.documentSize || "300 KB"}</span>
                      </td>
                      <td>
                        <span
                          style={{
                            padding: "3px 8px",
                            borderRadius: "10px",
                            fontSize: "0.74rem",
                            fontWeight: "800",
                            background:
                              rec.verificationStatus === "Verified" ? "var(--success-bg)" :
                              rec.verificationStatus === "Pending Verification" ? "var(--warning-bg)" : "var(--danger-bg)",
                            color:
                              rec.verificationStatus === "Verified" ? "var(--success-text)" :
                              rec.verificationStatus === "Pending Verification" ? "var(--warning-text)" : "var(--danger-text)"
                          }}
                        >
                          {rec.verificationStatus}
                        </span>
                        {rec.verifiedBy && (
                          <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "2px" }}>
                            By {rec.verifiedBy.split("(")[0]}
                          </div>
                        )}
                      </td>
                      <td>
                        <button
                          onClick={() => handleOpenReviewModal(rec)}
                          className="btn btn-secondary btn-sm"
                          style={{ fontSize: "0.76rem" }}
                        >
                          Review & Verify
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. HOD VERIFICATION REVIEW MODAL */}
      <Modal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        title="Review Medical Record & Certificate"
        maxWidth="580px"
      >
        {selectedRecordForReview && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", background: "var(--bg-surface-secondary)", padding: "12px", borderRadius: "8px" }}>
              <div>
                <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Student</span>
                <div style={{ fontWeight: "700" }}>{selectedRecordForReview.studentName}</div>
              </div>
              <div>
                <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Condition</span>
                <div style={{ fontWeight: "700", color: "#b91c1c" }}>{selectedRecordForReview.conditionCategory}</div>
              </div>
            </div>

            <div>
              <span style={{ fontSize: "0.75rem", fontWeight: "700", color: "var(--text-muted)" }}>Description by Parent:</span>
              <p style={{ fontSize: "0.85rem", marginTop: "2px" }}>{selectedRecordForReview.description}</p>
            </div>

            <div>
              <span style={{ fontSize: "0.75rem", fontWeight: "700", color: "#991b1b" }}>Emergency Guidelines:</span>
              <p style={{ fontSize: "0.85rem", marginTop: "2px", color: "#991b1b" }}>{selectedRecordForReview.emergencyInstructions}</p>
            </div>

            <div style={{ border: "1px solid var(--border-subtle)", borderRadius: "8px", padding: "10px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <FileText size={18} color="var(--primary-600)" />
                <div>
                  <div style={{ fontSize: "0.85rem", fontWeight: "700" }}>{selectedRecordForReview.documentName}</div>
                  <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Official Doctor Letter Attachment</div>
                </div>
              </div>
              <span style={{ fontSize: "0.78rem", color: "var(--success-text)", fontWeight: "700" }}>
                ✓ Document Attached
              </span>
            </div>

            <div className="form-group">
              <label className="form-label">Verification Decision</label>
              <select
                className="form-control"
                value={verificationDecision}
                onChange={(e) => setVerificationDecision(e.target.value)}
              >
                <option value="Verified">Verified (Official Medical Document Approved)</option>
                <option value="More Information Required">More Information Required (Ask Parent to update)</option>
                <option value="Rejected">Rejected (Invalid document / Policy mismatch)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Reviewer Remarks / Institutional Safety Notes</label>
              <textarea
                className="form-control"
                rows={2}
                placeholder="e.g. Official consultation letter on file. Approved for campus event safety protocol."
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "6px" }}>
              <button onClick={() => setReviewModalOpen(false)} className="btn btn-secondary">
                Cancel
              </button>
              <button onClick={handleConfirmVerification} className="btn btn-primary">
                Record Verification Decision
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

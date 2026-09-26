import React, { useState, useMemo } from "react";
import { useSmartCampus } from "../../context/SmartCampusContext";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  Award,
  Sparkles,
  FileText,
  ExternalLink,
  ShieldCheck,
  Building2,
  GraduationCap,
  User,
  Phone,
  Mail,
  AlertCircle,
  Check,
  X,
  Code2
} from "lucide-react";
import { Badge, Modal } from "../common/UIPrimitives";
import { getSkillEmoji } from "../../data/talentAndHealthData";

export default function TeacherSkillApprovals({ onNavigate }) {
  const {
    currentUser,
    studentSkills = [],
    users = [],
    departments = [],
    approveStudentSkill,
    rejectStudentSkill
  } = useSmartCampus();

  const teacher = currentUser;
  const teacherDeptId = teacher?.departmentId || "dept-vlsi";

  // Filter & Search states
  const [activeTab, setActiveTab] = useState("Pending"); // 'All' | 'Pending' | 'Approved' | 'Rejected'
  const [searchTerm, setSearchTerm] = useState("");
  const [deptFilter, setDeptFilter] = useState(teacherDeptId);
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [yearFilter, setYearFilter] = useState("All");

  // Rejection Modal State
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedSkillForReject, setSelectedSkillForReject] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("Certificate or practical project proof required.");
  const [customReason, setCustomReason] = useState("");

  // Certificate Modal State
  const [certModalOpen, setCertModalOpen] = useState(false);
  const [selectedCertSkill, setSelectedCertSkill] = useState(null);

  // Compute counts
  const pendingCount = studentSkills.filter(
    (s) => s.approvalStatus === "Pending" && (deptFilter === "all" || s.departmentId === deptFilter || s.departmentId === teacherDeptId)
  ).length;

  const approvedCount = studentSkills.filter(
    (s) => s.approvalStatus === "Approved" && (deptFilter === "all" || s.departmentId === deptFilter || s.departmentId === teacherDeptId)
  ).length;

  const rejectedCount = studentSkills.filter(
    (s) => s.approvalStatus === "Rejected" && (deptFilter === "all" || s.departmentId === deptFilter || s.departmentId === teacherDeptId)
  ).length;

  // Filter skills
  const filteredSkills = useMemo(() => {
    return studentSkills.filter((s) => {
      // Status filter
      if (activeTab !== "All") {
        if (activeTab === "Pending" && s.approvalStatus !== "Pending") return false;
        if (activeTab === "Approved" && s.approvalStatus !== "Approved") return false;
        if (activeTab === "Rejected" && s.approvalStatus !== "Rejected") return false;
      }

      // Department filter
      if (deptFilter !== "all" && s.departmentId && s.departmentId !== deptFilter) {
        return false;
      }

      // Category filter
      if (categoryFilter !== "All" && s.category !== categoryFilter) {
        return false;
      }

      // Year filter
      if (yearFilter !== "All" && s.year !== yearFilter) {
        return false;
      }

      // Search keyword filter
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase().trim();
        const matchName = (s.studentName || "").toLowerCase().includes(q);
        const matchSkill = (s.skill || "").toLowerCase().includes(q);
        const matchRoll = (s.rollNo || "").toLowerCase().includes(q);
        const matchPrn = (s.prn || "").toLowerCase().includes(q);
        if (!matchName && !matchSkill && !matchRoll && !matchPrn) return false;
      }

      return true;
    });
  }, [studentSkills, activeTab, deptFilter, categoryFilter, yearFilter, searchTerm]);

  // Handle Approve
  const handleApprove = (skill) => {
    approveStudentSkill(skill.id, teacher?.name || "Prof. Faculty Mentor", "Verified & Approved by Faculty");
  };

  // Open Reject Modal
  const handleOpenReject = (skill) => {
    setSelectedSkillForReject(skill);
    setRejectionReason("Certificate or practical project proof required.");
    setCustomReason("");
    setRejectModalOpen(true);
  };

  // Confirm Reject
  const handleConfirmReject = () => {
    if (!selectedSkillForReject) return;
    const finalReason = rejectionReason === "Other" ? (customReason.trim() || "Verification criteria not met") : rejectionReason;
    rejectStudentSkill(selectedSkillForReject.id, teacher?.name || "Prof. Faculty Mentor", finalReason);
    setRejectModalOpen(false);
    setSelectedSkillForReject(null);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* 1. Top Header Banner */}
      <div
        style={{
          background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)",
          borderRadius: "16px",
          padding: "24px 32px",
          color: "white",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
          boxShadow: "0 10px 25px -5px rgba(30, 27, 75, 0.4)"
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
            <span style={{ background: "rgba(255,255,255,0.15)", padding: "4px 10px", borderRadius: "20px", fontSize: "0.75rem", fontWeight: "700", letterSpacing: "0.05em" }}>
              FACULTY VERIFICATION DESK
            </span>
          </div>
          <h2 style={{ fontSize: "1.75rem", fontWeight: "800", color: "white" }}>
            🎯 Skill Bucket Approvals (कौशल्य पडताळणी)
          </h2>
          <p style={{ fontSize: "0.9rem", color: "#cbd5e1", marginTop: "4px", maxWidth: "680px" }}>
            Review student-claimed skills (e.g. Python, Java, VLSI). Only skills approved by you will be forwarded to the <strong>HOD</strong> and <strong>Principal</strong> for campus placements and industry visits.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          {pendingCount > 0 && (
            <div
              style={{
                background: "rgba(245, 158, 11, 0.2)",
                border: "1px solid #f59e0b",
                borderRadius: "12px",
                padding: "8px 16px",
                color: "#fef3c7",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontWeight: "700",
                fontSize: "0.85rem"
              }}
            >
              <Clock size={16} color="#fbbf24" />
              <span>{pendingCount} Pending Approval{pendingCount > 1 ? "s" : ""}</span>
            </div>
          )}
        </div>
      </div>

      {/* 2. Stat Metric Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
        <div
          onClick={() => setActiveTab("Pending")}
          className="card"
          style={{
            padding: "18px 20px",
            borderLeft: "4px solid #f59e0b",
            cursor: "pointer",
            background: activeTab === "Pending" ? "var(--bg-surface-hover, #fef3c715)" : "var(--bg-surface)",
            boxShadow: activeTab === "Pending" ? "0 4px 12px rgba(245, 158, 11, 0.15)" : "none"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.76rem", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase" }}>
              Pending Verification
            </span>
            <Clock size={20} color="#f59e0b" />
          </div>
          <div style={{ fontSize: "2rem", fontWeight: "800", color: "#d97706", marginTop: "4px" }}>
            {pendingCount}
          </div>
          <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "2px" }}>
            Awaiting your faculty review
          </div>
        </div>

        <div
          onClick={() => setActiveTab("Approved")}
          className="card"
          style={{
            padding: "18px 20px",
            borderLeft: "4px solid #10b981",
            cursor: "pointer",
            background: activeTab === "Approved" ? "var(--bg-surface-hover, #d1fae515)" : "var(--bg-surface)",
            boxShadow: activeTab === "Approved" ? "0 4px 12px rgba(16, 185, 129, 0.15)" : "none"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.76rem", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase" }}>
              Approved & Verified
            </span>
            <CheckCircle2 size={20} color="#10b981" />
          </div>
          <div style={{ fontSize: "2rem", fontWeight: "800", color: "#059669", marginTop: "4px" }}>
            {approvedCount}
          </div>
          <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "2px" }}>
            Visible to HOD & Principal
          </div>
        </div>

        <div
          onClick={() => setActiveTab("Rejected")}
          className="card"
          style={{
            padding: "18px 20px",
            borderLeft: "4px solid #ef4444",
            cursor: "pointer",
            background: activeTab === "Rejected" ? "var(--bg-surface-hover, #fee2e215)" : "var(--bg-surface)",
            boxShadow: activeTab === "Rejected" ? "0 4px 12px rgba(239, 68, 68, 0.15)" : "none"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.76rem", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase" }}>
              Rejected Requests
            </span>
            <XCircle size={20} color="#ef4444" />
          </div>
          <div style={{ fontSize: "2rem", fontWeight: "800", color: "#dc2626", marginTop: "4px" }}>
            {rejectedCount}
          </div>
          <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "2px" }}>
            Hidden from HOD & Principal
          </div>
        </div>

        <div
          onClick={() => setActiveTab("All")}
          className="card"
          style={{
            padding: "18px 20px",
            borderLeft: "4px solid #6366f1",
            cursor: "pointer",
            background: activeTab === "All" ? "var(--bg-surface-hover, #e0e7ff15)" : "var(--bg-surface)"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.76rem", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase" }}>
              Total Submissions
            </span>
            <Code2 size={20} color="#6366f1" />
          </div>
          <div style={{ fontSize: "2rem", fontWeight: "800", color: "#4f46e5", marginTop: "4px" }}>
            {studentSkills.length}
          </div>
          <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "2px" }}>
            All student technical claims
          </div>
        </div>
      </div>

      {/* 3. Filter Bar & Search */}
      <div className="card" style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: "14px" }}>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
          {/* Search Input */}
          <div style={{ flex: "2", minWidth: "260px", position: "relative" }}>
            <Search size={18} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input
              type="text"
              placeholder="Search by student name, skill (Python, Java...), or PRN..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-control"
              style={{ paddingLeft: "38px", height: "40px", borderRadius: "8px", fontSize: "0.88rem" }}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Department Filter */}
          <div style={{ flex: "1", minWidth: "180px" }}>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="form-control"
              style={{ height: "40px", borderRadius: "8px", fontSize: "0.85rem" }}
            >
              <option value="all">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div style={{ flex: "1", minWidth: "150px" }}>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="form-control"
              style={{ height: "40px", borderRadius: "8px", fontSize: "0.85rem" }}
            >
              <option value="All">All Categories</option>
              <option value="Technical">💻 Technical</option>
              <option value="Sports">🏆 Sports</option>
              <option value="Cultural">✨ Cultural</option>
              <option value="Event & Management">📋 Event & Management</option>
            </select>
          </div>

          {/* Year Filter */}
          <div style={{ flex: "1", minWidth: "140px" }}>
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="form-control"
              style={{ height: "40px", borderRadius: "8px", fontSize: "0.85rem" }}
            >
              <option value="All">All Years</option>
              <option value="1st Year">1st Year</option>
              <option value="2nd Year">2nd Year</option>
              <option value="Third Year">3rd Year</option>
              <option value="Final Year">Final Year</option>
            </select>
          </div>
        </div>

        {/* Status Tabs */}
        <div style={{ display: "flex", gap: "8px", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "8px" }}>
          {[
            { id: "Pending", label: "Pending Verification", count: pendingCount, color: "#f59e0b" },
            { id: "Approved", label: "Approved (Forwarded to HOD & Principal)", count: approvedCount, color: "#10b981" },
            { id: "Rejected", label: "Rejected (Hidden)", count: rejectedCount, color: "#ef4444" },
            { id: "All", label: "All Skills", count: studentSkills.length, color: "#6366f1" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                background: activeTab === tab.id ? tab.color : "transparent",
                color: activeTab === tab.id ? "white" : "var(--text-main)",
                border: "none",
                borderRadius: "8px",
                padding: "6px 14px",
                fontSize: "0.84rem",
                fontWeight: "700",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                transition: "all 0.15s ease"
              }}
            >
              <span>{tab.label}</span>
              <span
                style={{
                  background: activeTab === tab.id ? "rgba(255,255,255,0.25)" : "var(--bg-surface-secondary)",
                  color: activeTab === tab.id ? "white" : "var(--text-muted)",
                  padding: "1px 6px",
                  borderRadius: "10px",
                  fontSize: "0.72rem"
                }}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 4. Skills Verification List */}
      {filteredSkills.length === 0 ? (
        <div className="card" style={{ padding: "48px 24px", textAlign: "center" }}>
          <Sparkles size={40} color="var(--text-light)" style={{ margin: "0 auto 12px auto" }} />
          <h4 style={{ fontSize: "1.1rem", fontWeight: "700" }}>No Skill Submissions Found</h4>
          <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", maxWidth: "450px", margin: "8px auto 0 auto" }}>
            {activeTab === "Pending"
              ? "All submitted student skills have been verified. Great job!"
              : "No student records match the selected filter criteria."}
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: "18px" }}>
          {filteredSkills.map((sk) => {
            const isPending = sk.approvalStatus === "Pending";
            const isApproved = sk.approvalStatus === "Approved";
            const isRejected = sk.approvalStatus === "Rejected";

            return (
              <div
                key={sk.id}
                className="card"
                style={{
                  padding: "20px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: "16px",
                  borderLeft: isPending ? "4px solid #f59e0b" : isApproved ? "4px solid #10b981" : "4px solid #ef4444",
                  boxShadow: isPending ? "0 4px 14px rgba(245, 158, 11, 0.15)" : "none"
                }}
              >
                <div>
                  {/* Top Row: Student Identity */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div
                        style={{
                          width: "38px",
                          height: "38px",
                          borderRadius: "10px",
                          background: "#e0e7ff",
                          color: "#4338ca",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: "800",
                          fontSize: "0.95rem"
                        }}
                      >
                        {sk.studentName?.charAt(0) || "S"}
                      </div>
                      <div>
                        <h4 style={{ fontSize: "0.98rem", fontWeight: "800", color: "var(--text-main)", margin: 0 }}>
                          {sk.studentName}
                        </h4>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                          {sk.rollNo} • {sk.year} {sk.division ? `(Div ${sk.division})` : ""}
                        </div>
                      </div>
                    </div>

                    {/* Status Badge */}
                    {isPending ? (
                      <span style={{ background: "#fef3c7", color: "#92400e", border: "1px solid #f59e0b", padding: "3px 8px", borderRadius: "10px", fontSize: "0.72rem", fontWeight: "700", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                        <Clock size={12} color="#d97706" /> Pending Review
                      </span>
                    ) : isApproved ? (
                      <span style={{ background: "#d1fae5", color: "#065f46", border: "1px solid #10b981", padding: "3px 8px", borderRadius: "10px", fontSize: "0.72rem", fontWeight: "700", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                        <CheckCircle2 size={12} color="#059669" /> Approved
                      </span>
                    ) : (
                      <span style={{ background: "#fee2e2", color: "#991b1b", border: "1px solid #ef4444", padding: "3px 8px", borderRadius: "10px", fontSize: "0.72rem", fontWeight: "700", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                        <XCircle size={12} color="#dc2626" /> Rejected
                      </span>
                    )}
                  </div>

                  {/* Skill Badge & Proficiency */}
                  <div
                    style={{
                      background: "var(--bg-surface-secondary, #f8fafc)",
                      borderRadius: "10px",
                      padding: "12px 14px",
                      marginBottom: "12px"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontSize: "1.4rem" }}>{getSkillEmoji(sk.category, sk.skill)}</span>
                        <div>
                          <div style={{ fontSize: "1.05rem", fontWeight: "800", color: "var(--text-main)" }}>
                            {sk.skill}
                          </div>
                          <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: "600" }}>
                            {sk.category || "Technical"}
                          </span>
                        </div>
                      </div>

                      <span
                        style={{
                          padding: "3px 10px",
                          borderRadius: "12px",
                          fontSize: "0.74rem",
                          fontWeight: "700",
                          background:
                            sk.skillLevel === "Expert" ? "#fef3c7" :
                            sk.skillLevel === "Advanced" ? "#dbeafe" :
                            sk.skillLevel === "Intermediate" ? "#e0e7ff" : "#f1f5f9",
                          color:
                            sk.skillLevel === "Expert" ? "#92400e" :
                            sk.skillLevel === "Advanced" ? "#1e40af" :
                            sk.skillLevel === "Intermediate" ? "#3730a3" : "#475569"
                        }}
                      >
                        {sk.skillLevel || "Intermediate"}
                      </span>
                    </div>

                    {/* Department Tag */}
                    <div style={{ fontSize: "0.74rem", color: "var(--text-muted)", marginTop: "4px" }}>
                      <strong>Department:</strong> {sk.departmentName || "Engineering"}
                    </div>
                  </div>

                  {/* Practical Project / Experience Description */}
                  {sk.experienceDescription && (
                    <div style={{ marginBottom: "10px" }}>
                      <div style={{ fontSize: "0.72rem", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase" }}>
                        Experience / Practical Work:
                      </div>
                      <p style={{ fontSize: "0.82rem", color: "var(--text-main)", marginTop: "3px", lineHeight: "1.4" }}>
                        "{sk.experienceDescription}"
                      </p>
                    </div>
                  )}

                  {/* Achievements */}
                  {sk.achievements && sk.achievements.length > 0 && (
                    <div style={{ marginBottom: "10px" }}>
                      <div style={{ fontSize: "0.72rem", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase" }}>
                        Achievements / Proof:
                      </div>
                      <ul style={{ margin: "4px 0 0 0", paddingLeft: "16px", fontSize: "0.78rem", color: "var(--text-main)" }}>
                        {sk.achievements.map((a, i) => (
                          <li key={i}>{a}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Attached Certificate */}
                  {sk.certificateUrl && (
                    <div style={{ marginTop: "10px" }}>
                      <button
                        onClick={() => {
                          setSelectedCertSkill(sk);
                          setCertModalOpen(true);
                        }}
                        className="btn btn-sm"
                        style={{
                          background: "#eff6ff",
                          border: "1px solid #bfdbfe",
                          color: "#1d4ed8",
                          fontSize: "0.75rem",
                          fontWeight: "700",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px"
                        }}
                      >
                        <FileText size={14} /> View Certificate Proof
                      </button>
                    </div>
                  )}

                  {/* Verification Attribution / Rejection Note */}
                  {isApproved && (
                    <div style={{ marginTop: "10px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "8px", padding: "8px 12px", fontSize: "0.75rem", color: "#166534" }}>
                      <strong>✅ Verified by:</strong> {sk.approvedBy || "Faculty"} • Visible to HOD & Principal
                    </div>
                  )}

                  {isRejected && (
                    <div style={{ marginTop: "10px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", padding: "8px 12px", fontSize: "0.75rem", color: "#991b1b" }}>
                      <strong>❌ Rejection Reason:</strong> {sk.rejectionReason || "Verification criteria not met"} (Hidden from HOD/Principal)
                    </div>
                  )}
                </div>

                {/* Bottom Action Buttons */}
                <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "12px", display: "flex", gap: "10px" }}>
                  {isPending ? (
                    <>
                      <button
                        onClick={() => handleApprove(sk)}
                        className="btn btn-sm"
                        style={{
                          flex: 1,
                          background: "#10b981",
                          color: "white",
                          border: "none",
                          fontWeight: "700",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "6px"
                        }}
                      >
                        <Check size={16} /> Approve (मंजूर करा)
                      </button>

                      <button
                        onClick={() => handleOpenReject(sk)}
                        className="btn btn-sm"
                        style={{
                          flex: 1,
                          background: "#ef4444",
                          color: "white",
                          border: "none",
                          fontWeight: "700",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "6px"
                        }}
                      >
                        <X size={16} /> Reject (नाकार करा)
                      </button>
                    </>
                  ) : (
                    <div style={{ display: "flex", width: "100%", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                        {isApproved ? "Approved for placement radar" : "Rejected submission"}
                      </span>
                      <button
                        onClick={() => (isApproved ? handleOpenReject(sk) : handleApprove(sk))}
                        className="btn btn-sm btn-secondary"
                        style={{ fontSize: "0.72rem", padding: "4px 10px" }}
                      >
                        {isApproved ? "Revoke / Reject" : "Re-approve"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 5. Reject Confirmation Modal */}
      {rejectModalOpen && selectedSkillForReject && (
        <Modal
          isOpen={rejectModalOpen}
          onClose={() => setRejectModalOpen(false)}
          title="Reject Skill Claim (कौशल्य नाकार करा)"
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <p style={{ fontSize: "0.88rem", color: "var(--text-main)", lineHeight: "1.5" }}>
              You are rejecting the skill claim for <strong>{selectedSkillForReject.studentName}</strong>:{" "}
              <span style={{ color: "#4338ca", fontWeight: "700" }}>{selectedSkillForReject.skill} ({selectedSkillForReject.skillLevel})</span>.
              This skill will <strong>NOT</strong> be visible to the HOD or Principal.
            </p>

            <div>
              <label style={{ fontSize: "0.82rem", fontWeight: "700", display: "block", marginBottom: "6px" }}>
                Select Reason for Rejection:
              </label>
              <select
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="form-control"
                style={{ width: "100%", height: "42px", borderRadius: "8px", fontSize: "0.85rem" }}
              >
                <option value="Certificate or practical project proof required.">Certificate or practical project proof required</option>
                <option value="Skill level claimed (Advanced/Expert) does not match practical evaluation.">Skill level claimed does not match practical evaluation</option>
                <option value="Incomplete project description or missing verification details.">Incomplete project description or missing verification details</option>
                <option value="In-person laboratory evaluation required before approval.">In-person laboratory evaluation required before approval</option>
                <option value="Other">Other Reason (Write below)</option>
              </select>
            </div>

            {rejectionReason === "Other" && (
              <div>
                <label style={{ fontSize: "0.82rem", fontWeight: "700", display: "block", marginBottom: "6px" }}>
                  Specify Reason:
                </label>
                <textarea
                  rows={3}
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  placeholder="Enter specific feedback for the student..."
                  className="form-control"
                  style={{ width: "100%", borderRadius: "8px", fontSize: "0.85rem" }}
                />
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "12px" }}>
              <button
                onClick={() => setRejectModalOpen(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                className="btn"
                style={{ background: "#ef4444", color: "white", fontWeight: "700" }}
              >
                Confirm Rejection (नाकार करा)
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* 6. Certificate Preview Modal */}
      {certModalOpen && selectedCertSkill && (
        <Modal
          isOpen={certModalOpen}
          onClose={() => setCertModalOpen(false)}
          title={`Certificate Proof: ${selectedCertSkill.skill} — ${selectedCertSkill.studentName}`}
        >
          <div style={{ textAlign: "center" }}>
            <img
              src={selectedCertSkill.certificateUrl}
              alt="Skill Certificate Proof"
              style={{
                maxWidth: "100%",
                maxHeight: "480px",
                borderRadius: "10px",
                border: "1px solid var(--border-subtle)",
                objectFit: "contain"
              }}
            />
            <div style={{ marginTop: "14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                {selectedCertSkill.certificateName || "Uploaded verification document"}
              </span>
              <a
                href={selectedCertSkill.certificateUrl}
                target="_blank"
                rel="noreferrer"
                className="btn btn-sm btn-secondary"
                style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
              >
                <ExternalLink size={14} /> Open in Full Tab
              </a>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

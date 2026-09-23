import React, { useState } from "react";
import { useSmartCampus } from "../../context/SmartCampusContext";
import {
  Sparkles,
  Plus,
  Award,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  FileText,
  Upload,
  User,
  ExternalLink,
  Trash2,
  Edit2,
  AlertCircle,
  Tag,
  Check,
  X,
  MapPin,
  ChevronRight,
  Info
} from "lucide-react";
import { Modal, Badge } from "../common/UIPrimitives";
import {
  SPORTS_OPTIONS,
  CULTURAL_OPTIONS,
  EVENT_MGMT_OPTIONS,
  TECHNICAL_OPTIONS,
  SKILL_LEVELS,
  EXPERIENCE_LEVELS,
  PREFERRED_EVENT_TYPES,
  DECLINE_REASONS,
  getSkillEmoji
} from "../../data/talentAndHealthData";

export default function StudentSkills() {
  const {
    currentUser,
    studentSkills,
    eventInvitations,
    addStudentSkill,
    updateStudentSkill,
    deleteStudentSkill,
    respondToInvitation
  } = useSmartCampus();

  const student = currentUser;

  // Tabs: 'skills' | 'invitations'
  const [activeTab, setActiveTab] = useState("skills");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("All");

  // Add/Edit Skill Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSkillId, setEditingSkillId] = useState(null);

  const [formData, setFormData] = useState({
    category: "Technical",
    skill: "Programming",
    customSkill: "",
    skillLevel: "Intermediate",
    experienceLevel: "College Level",
    experienceDescription: "",
    achievements: [""],
    certificateUrl: "",
    certificateName: "",
    availableForEvents: "Yes",
    preferredEventType: "Any Event"
  });

  // Decline Modal State
  const [declineModalOpen, setDeclineModalOpen] = useState(false);
  const [selectedInvitationId, setSelectedInvitationId] = useState(null);
  const [declineReason, setDeclineReason] = useState("Academic Schedule");
  const [customDeclineReason, setCustomDeclineReason] = useState("");

  // Certificate Preview Modal State
  const [certPreviewModalOpen, setCertPreviewModalOpen] = useState(false);
  const [selectedCert, setSelectedCert] = useState(null);

  // Filter skills for current student
  const mySkills = studentSkills.filter((s) => s.studentId === student?.id);
  const displayedSkills = selectedCategoryFilter === "All"
    ? mySkills
    : mySkills.filter((s) => s.category === selectedCategoryFilter);

  // Filter invitations for current student
  const myInvitations = eventInvitations.filter((i) => i.studentId === student?.id);
  const pendingInvitations = myInvitations.filter((i) => i.status === "Invited");

  // Get available skill options based on selected category
  const getCategoryOptions = (cat) => {
    switch (cat) {
      case "Sports": return SPORTS_OPTIONS;
      case "Cultural": return CULTURAL_OPTIONS;
      case "Event & Management": return EVENT_MGMT_OPTIONS;
      case "Technical": return TECHNICAL_OPTIONS;
      default: return TECHNICAL_OPTIONS;
    }
  };

  const handleOpenAddModal = () => {
    setEditingSkillId(null);
    setFormData({
      category: "Technical",
      skill: TECHNICAL_OPTIONS[0],
      customSkill: "",
      skillLevel: "Intermediate",
      experienceLevel: "College Level",
      experienceDescription: "",
      achievements: [""],
      certificateUrl: "",
      certificateName: "",
      availableForEvents: "Yes",
      preferredEventType: "Any Event"
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (skillObj) => {
    setEditingSkillId(skillObj.id);
    const catOptions = getCategoryOptions(skillObj.category);
    const isStandard = catOptions.includes(skillObj.skill);

    setFormData({
      category: skillObj.category,
      skill: isStandard ? skillObj.skill : "Other",
      customSkill: isStandard ? "" : skillObj.skill,
      skillLevel: skillObj.skillLevel,
      experienceLevel: skillObj.experienceLevel,
      experienceDescription: skillObj.experienceDescription || "",
      achievements: skillObj.achievements && skillObj.achievements.length > 0 ? skillObj.achievements : [""],
      certificateUrl: skillObj.certificateUrl || "",
      certificateName: skillObj.certificateName || "",
      availableForEvents: skillObj.availableForEvents || "Yes",
      preferredEventType: skillObj.preferredEventType || "Any Event"
    });
    setIsModalOpen(true);
  };

  const handleAchievementChange = (index, value) => {
    const updated = [...formData.achievements];
    updated[index] = value;
    setFormData({ ...formData, achievements: updated });
  };

  const handleAddAchievementField = () => {
    setFormData({ ...formData, achievements: [...formData.achievements, ""] });
  };

  const handleRemoveAchievementField = (index) => {
    const updated = formData.achievements.filter((_, i) => i !== index);
    setFormData({ ...formData, achievements: updated.length > 0 ? updated : [""] });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check size limit: 5MB
    if (file.size > 5 * 1024 * 1024) {
      alert("File size exceeds 5MB limit. Please upload a smaller document.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      setFormData({
        ...formData,
        certificateUrl: uploadEvent.target.result,
        certificateName: file.name
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitSkill = (e) => {
    e.preventDefault();
    const finalSkillName = formData.skill === "Other"
      ? (formData.customSkill.trim() || "Other Skill")
      : formData.skill;

    const cleanedAchievements = formData.achievements
      .map((a) => a.trim())
      .filter((a) => a.length > 0);

    const payload = {
      studentId: student?.id || "stu-1",
      studentName: student?.name || "Aditya Shinde",
      departmentId: student?.departmentId || "dept-vlsi",
      departmentName: student?.departmentName || "Electronic Engineering (VLSI Design And Technology)",
      year: student?.year || "Third Year",
      semester: student?.semester || 5,
      division: student?.division || "A",
      rollNo: student?.rollNo || "VL3152",
      prn: student?.prn || student?.prnNo || "24025331378056",
      category: formData.category,
      skill: finalSkillName,
      customSkill: formData.skill === "Other" ? formData.customSkill : "",
      skillLevel: formData.skillLevel,
      experienceLevel: formData.experienceLevel,
      experienceDescription: formData.experienceDescription,
      achievements: cleanedAchievements,
      certificateUrl: formData.certificateUrl,
      certificateName: formData.certificateName,
      availableForEvents: formData.availableForEvents,
      preferredEventType: formData.preferredEventType
    };

    if (editingSkillId) {
      updateStudentSkill(editingSkillId, payload);
    } else {
      addStudentSkill(payload);
    }

    setIsModalOpen(false);
  };

  const handleDeclineClick = (invId) => {
    setSelectedInvitationId(invId);
    setDeclineReason("Academic Schedule");
    setCustomDeclineReason("");
    setDeclineModalOpen(true);
  };

  const handleConfirmDecline = () => {
    if (!selectedInvitationId) return;
    const finalReason = declineReason === "Other" ? (customDeclineReason.trim() || "Other Reason") : declineReason;
    respondToInvitation({
      invitationId: selectedInvitationId,
      status: "Declined",
      declineReason: finalReason
    });
    setDeclineModalOpen(false);
    setSelectedInvitationId(null);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* 1. Header Banner */}
      <div
        style={{
          background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #0f172a 100%)",
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
              EXTRACURRICULAR & EVENT TALENT HUB
            </span>
          </div>
          <h2 style={{ fontSize: "1.75rem", fontWeight: "800", color: "white" }}>
            My Skills & Interests 🌟
          </h2>
          <p style={{ fontSize: "0.9rem", color: "#cbd5e1", marginTop: "4px" }}>
            Showcase your skills, sports capabilities, cultural talents, and volunteer experience to the college.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="btn btn-primary btn-lg"
          style={{
            background: "linear-gradient(135deg, #4f46e5, #4338ca)",
            boxShadow: "0 4px 14px rgba(79, 70, 229, 0.4)",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}
        >
          <Plus size={18} />
          <span>Add New Skill</span>
        </button>
      </div>

      {/* 2. Privacy & Notice Banner */}
      <div
        style={{
          background: "var(--info-bg)",
          border: "1px solid var(--info-border)",
          borderRadius: "12px",
          padding: "14px 20px",
          display: "flex",
          alignItems: "center",
          gap: "14px",
          color: "var(--info-text)"
        }}
      >
        <ShieldCheck size={24} style={{ flexShrink: 0 }} />
        <div style={{ fontSize: "0.86rem", lineHeight: "1.5" }}>
          <strong>Student Privacy Notice:</strong> Your skills and interests may be viewed by authorized college staff (Teachers, HODs, and Principal) for event planning, talent identification, and official college representation. Participation in events remains voluntary.
        </div>
      </div>

      {/* 3. Read-only Auto-fetched Student Information Card */}
      <div className="card" style={{ padding: "20px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
          <User size={18} color="var(--primary-600)" />
          <h3 style={{ fontSize: "1rem", fontWeight: "700" }}>Verified Student Profile Details (Auto-Fetched)</h3>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
          <div>
            <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: "600" }}>Student Name</div>
            <div style={{ fontSize: "0.92rem", fontWeight: "700", marginTop: "2px" }}>{student?.name || "Aditya Shinde"}</div>
          </div>
          <div>
            <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: "600" }}>PRN / Student ID</div>
            <div style={{ fontSize: "0.92rem", fontWeight: "700", marginTop: "2px" }}>{student?.prn || student?.prnNo || student?.id || "24025331378056"}</div>
          </div>
          <div>
            <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: "600" }}>Department & Branch</div>
            <div style={{ fontSize: "0.92rem", fontWeight: "700", marginTop: "2px" }}>{student?.departmentName || "Electronics (VLSI)"}</div>
          </div>
          <div>
            <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: "600" }}>Academic Year & Sem</div>
            <div style={{ fontSize: "0.92rem", fontWeight: "700", marginTop: "2px" }}>{student?.year || "Third Year"} (Sem {student?.semester || 5})</div>
          </div>
          <div>
            <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: "600" }}>Division / Roll No</div>
            <div style={{ fontSize: "0.92rem", fontWeight: "700", marginTop: "2px" }}>Div {student?.division || "A"} • Roll {student?.rollNo || "VL3152"}</div>
          </div>
          <div>
            <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: "600" }}>Email & Mobile</div>
            <div style={{ fontSize: "0.92rem", fontWeight: "700", marginTop: "2px" }}>{student?.email} • {student?.phone || "+91 98900 12345"}</div>
          </div>
        </div>
      </div>

      {/* 4. Tab Navigation */}
      <div style={{ display: "flex", gap: "12px", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "8px" }}>
        <button
          onClick={() => setActiveTab("skills")}
          style={{
            background: "none",
            border: "none",
            padding: "8px 16px",
            fontSize: "0.92rem",
            fontWeight: "700",
            cursor: "pointer",
            color: activeTab === "skills" ? "var(--primary-600)" : "var(--text-muted)",
            borderBottom: activeTab === "skills" ? "3px solid var(--primary-600)" : "3px solid transparent",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}
        >
          <Sparkles size={16} />
          My Skills & Talents ({mySkills.length})
        </button>

        <button
          onClick={() => setActiveTab("invitations")}
          style={{
            background: "none",
            border: "none",
            padding: "8px 16px",
            fontSize: "0.92rem",
            fontWeight: "700",
            cursor: "pointer",
            color: activeTab === "invitations" ? "var(--primary-600)" : "var(--text-muted)",
            borderBottom: activeTab === "invitations" ? "3px solid var(--primary-600)" : "3px solid transparent",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}
        >
          <Calendar size={16} />
          Event Invitations
          {pendingInvitations.length > 0 && (
            <span
              style={{
                background: "var(--danger-solid)",
                color: "white",
                borderRadius: "12px",
                padding: "2px 8px",
                fontSize: "0.72rem",
                fontWeight: "800"
              }}
            >
              {pendingInvitations.length} New
            </span>
          )}
        </button>
      </div>

      {/* 5. TAB 1: MY SKILLS & TALENTS */}
      {activeTab === "skills" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Category Filter Pills */}
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {["All", "Sports", "Cultural", "Event & Management", "Technical"].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategoryFilter(cat)}
                style={{
                  padding: "6px 14px",
                  borderRadius: "20px",
                  fontSize: "0.82rem",
                  fontWeight: "600",
                  cursor: "pointer",
                  border: selectedCategoryFilter === cat ? "1px solid var(--primary-600)" : "1px solid var(--border-subtle)",
                  background: selectedCategoryFilter === cat ? "var(--primary-50)" : "var(--bg-surface)",
                  color: selectedCategoryFilter === cat ? "var(--primary-700)" : "var(--text-muted)",
                  transition: "all 0.15s ease"
                }}
              >
                {cat === "All" ? "All Categories" : cat}
              </button>
            ))}
          </div>

          {/* Skills Grid */}
          {displayedSkills.length === 0 ? (
            <div className="card" style={{ padding: "48px 24px", textAlign: "center" }}>
              <Sparkles size={42} color="var(--text-light)" style={{ margin: "0 auto 12px auto" }} />
              <h4 style={{ fontSize: "1.1rem", fontWeight: "700" }}>No Skills Added In This Category</h4>
              <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", maxWidth: "400px", margin: "8px auto 16px auto" }}>
                Tell your college what you excel at—from sports and dance to anchoring, coding, or video editing.
              </p>
              <button onClick={handleOpenAddModal} className="btn btn-primary btn-sm">
                <Plus size={14} /> Add Skill Now
              </button>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "18px" }}>
              {displayedSkills.map((skill) => (
                <div
                  key={skill.id}
                  className="card"
                  style={{
                    padding: "20px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    gap: "16px",
                    transition: "transform 0.2s ease, box-shadow 0.2s ease"
                  }}
                >
                  <div>
                    {/* Header: Emoji, Skill Name, Level */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span style={{ fontSize: "1.8rem" }}>{getSkillEmoji(skill.category, skill.skill)}</span>
                        <div>
                          <h4 style={{ fontSize: "1.05rem", fontWeight: "800", color: "var(--text-main)" }}>
                            {skill.skill}
                          </h4>
                          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: "600" }}>
                            {skill.category}
                          </span>
                        </div>
                      </div>

                      <span
                        style={{
                          padding: "4px 10px",
                          borderRadius: "12px",
                          fontSize: "0.75rem",
                          fontWeight: "700",
                          background:
                            skill.skillLevel === "Expert" ? "#fef3c7" :
                            skill.skillLevel === "Advanced" ? "#dbeafe" :
                            skill.skillLevel === "Intermediate" ? "#e0e7ff" : "#f1f5f9",
                          color:
                            skill.skillLevel === "Expert" ? "#92400e" :
                            skill.skillLevel === "Advanced" ? "#1e40af" :
                            skill.skillLevel === "Intermediate" ? "#3730a3" : "#475569"
                        }}
                      >
                        {skill.skillLevel}
                      </span>
                    </div>

                    {/* Experience Level & Narrative */}
                    <div style={{ marginTop: "14px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.8rem", color: "var(--primary-700)", fontWeight: "600" }}>
                        <Award size={14} />
                        <span>{skill.experienceLevel} Experience</span>
                      </div>
                      {skill.experienceDescription && (
                        <p style={{ fontSize: "0.82rem", color: "var(--text-main)", marginTop: "6px", lineHeight: "1.4" }}>
                          "{skill.experienceDescription}"
                        </p>
                      )}
                    </div>

                    {/* Achievements List */}
                    {skill.achievements && skill.achievements.length > 0 && (
                      <div style={{ marginTop: "12px" }}>
                        <div style={{ fontSize: "0.72rem", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "6px" }}>
                          Achievements:
                        </div>
                        <ul style={{ margin: 0, paddingLeft: "16px", fontSize: "0.78rem", color: "var(--text-main)" }}>
                          {skill.achievements.map((ach, idx) => (
                            <li key={idx} style={{ marginBottom: "2px" }}>{ach}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Certificate Badge */}
                    {skill.certificateUrl && (
                      <div style={{ marginTop: "12px" }}>
                        <button
                          onClick={() => {
                            setSelectedCert(skill);
                            setCertPreviewModalOpen(true);
                          }}
                          style={{
                            background: "var(--bg-surface-secondary)",
                            border: "1px solid var(--border-subtle)",
                            borderRadius: "6px",
                            padding: "4px 8px",
                            fontSize: "0.74rem",
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "5px",
                            color: "var(--primary-700)",
                            fontWeight: "600"
                          }}
                        >
                          <FileText size={12} />
                          <span>View Certificate / Proof</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Footer: Availability & Action Buttons */}
                  <div
                    style={{
                      borderTop: "1px solid var(--border-subtle)",
                      paddingTop: "12px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span
                        style={{
                          width: "8px",
                          height: "8px",
                          borderRadius: "50%",
                          background: skill.availableForEvents === "Yes" ? "var(--success-solid)" : "var(--danger-solid)"
                        }}
                      />
                      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                        {skill.availableForEvents === "Yes" ? "Available for Events" : "Unavailable"}
                      </span>
                    </div>

                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        onClick={() => handleOpenEditModal(skill)}
                        style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: "4px" }}
                        title="Edit Skill"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Remove ${skill.skill} from your profile?`)) {
                            deleteStudentSkill(skill.id);
                          }
                        }}
                        style={{ background: "none", border: "none", cursor: "pointer", color: "var(--danger-solid)", padding: "4px" }}
                        title="Delete Skill"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 6. TAB 2: EVENT INVITATIONS */}
      {activeTab === "invitations" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {myInvitations.length === 0 ? (
            <div className="card" style={{ padding: "48px 24px", textAlign: "center" }}>
              <Calendar size={42} color="var(--text-light)" style={{ margin: "0 auto 12px auto" }} />
              <h4 style={{ fontSize: "1.1rem", fontWeight: "700" }}>No Event Invitations Yet</h4>
              <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", maxWidth: "420px", margin: "8px auto 0 auto" }}>
                When teachers or event coordinators schedule an event and search for students with your skills, your invitations will appear here.
              </p>
            </div>
          ) : (
            myInvitations.map((inv) => (
              <div
                key={inv.id}
                className="card"
                style={{
                  padding: "24px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "20px",
                  borderLeft: inv.status === "Invited" ? "4px solid var(--primary-600)" :
                    inv.status === "Accepted" ? "4px solid var(--success-solid)" : "4px solid var(--border-subtle)"
                }}
              >
                <div style={{ flex: "1 1 320px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                    <span
                      style={{
                        fontSize: "0.72rem",
                        fontWeight: "700",
                        padding: "3px 8px",
                        borderRadius: "10px",
                        background: inv.status === "Invited" ? "#dbeafe" : inv.status === "Accepted" ? "var(--success-bg)" : "#f1f5f9",
                        color: inv.status === "Invited" ? "var(--primary-700)" : inv.status === "Accepted" ? "var(--success-text)" : "var(--text-muted)"
                      }}
                    >
                      Status: {inv.status}
                    </span>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                      Assigned Skill: {inv.skill}
                    </span>
                  </div>

                  <h3 style={{ fontSize: "1.2rem", fontWeight: "800", color: "var(--text-main)", marginBottom: "4px" }}>
                    {inv.eventName}
                  </h3>

                  <div style={{ fontSize: "0.88rem", color: "var(--primary-700)", fontWeight: "600", marginBottom: "8px" }}>
                    Invited Role: {inv.role}
                  </div>

                  <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", fontSize: "0.8rem", color: "var(--text-muted)" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <Calendar size={14} /> Date: <strong>{inv.eventDate}</strong>
                    </span>
                    <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <MapPin size={14} /> Venue: <strong>{inv.venue || "College Campus"}</strong>
                    </span>
                    <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <User size={14} /> Coordinator: <strong>{inv.invitedByName}</strong>
                    </span>
                  </div>

                  {inv.notes && (
                    <p style={{ fontSize: "0.82rem", color: "var(--text-main)", marginTop: "10px", background: "var(--bg-surface-secondary)", padding: "8px 12px", borderRadius: "6px" }}>
                      Note: {inv.notes}
                    </p>
                  )}

                  {inv.status === "Declined" && inv.declineReason && (
                    <p style={{ fontSize: "0.8rem", color: "var(--danger-text)", marginTop: "8px" }}>
                      Declined reason: {inv.declineReason}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div>
                  {inv.status === "Invited" ? (
                    <div style={{ display: "flex", gap: "10px" }}>
                      <button
                        onClick={() => respondToInvitation({ invitationId: inv.id, status: "Accepted" })}
                        className="btn btn-success"
                        style={{ display: "flex", alignItems: "center", gap: "6px" }}
                      >
                        <Check size={16} /> Accept Invitation
                      </button>
                      <button
                        onClick={() => handleDeclineClick(inv.id)}
                        className="btn btn-secondary"
                        style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--danger-solid)" }}
                      >
                        <X size={16} /> Decline
                      </button>
                    </div>
                  ) : inv.status === "Accepted" ? (
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--success-text)", fontWeight: "700" }}>
                      <CheckCircle2 size={20} />
                      <span>Participation Confirmed</span>
                    </div>
                  ) : (
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-muted)", fontWeight: "600" }}>
                      <XCircle size={18} />
                      <span>Declined</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* 7. ADD / EDIT SKILL MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSkillId ? "Update Skill & Talent" : "Add Skill or Talent"}
        maxWidth="620px"
      >
        <form onSubmit={handleSubmitSkill} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Category */}
          <div className="form-group">
            <label className="form-label">Category</label>
            <select
              className="form-control"
              value={formData.category}
              onChange={(e) => {
                const newCat = e.target.value;
                const opts = getCategoryOptions(newCat);
                setFormData({
                  ...formData,
                  category: newCat,
                  skill: opts[0],
                  customSkill: ""
                });
              }}
            >
              <option value="Sports">Sports</option>
              <option value="Cultural">Cultural</option>
              <option value="Event & Management">Event & Management</option>
              <option value="Technical">Technical Skills</option>
            </select>
          </div>

          {/* Skill Selector */}
          <div className="form-group">
            <label className="form-label">Skill / Talent</label>
            <select
              className="form-control"
              value={formData.skill}
              onChange={(e) => setFormData({ ...formData, skill: e.target.value })}
            >
              {getCategoryOptions(formData.category).map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          {/* Custom Skill Input if 'Other' is selected */}
          {formData.skill === "Other" && (
            <div className="form-group">
              <label className="form-label">Specify Custom {formData.category} Skill *</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Lawn Tennis, Aerial Drone Videography, Sound Mixing..."
                required
                value={formData.customSkill}
                onChange={(e) => setFormData({ ...formData, customSkill: e.target.value })}
              />
            </div>
          )}

          {/* Skill Level & Experience Level (2-col grid) */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <div className="form-group">
              <label className="form-label">Proficiency Level</label>
              <select
                className="form-control"
                value={formData.skillLevel}
                onChange={(e) => setFormData({ ...formData, skillLevel: e.target.value })}
              >
                {SKILL_LEVELS.map((lvl) => (
                  <option key={lvl} value={lvl}>{lvl}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Experience Scope</label>
              <select
                className="form-control"
                value={formData.experienceLevel}
                onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value })}
              >
                {EXPERIENCE_LEVELS.map((exp) => (
                  <option key={exp} value={exp}>{exp}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Experience Narrative */}
          <div className="form-group">
            <label className="form-label">Describe Your Experience</label>
            <textarea
              className="form-control"
              rows={3}
              placeholder="e.g. Played cricket at district level for 3 years as an opening bowler; coordinated 2025 Tech Fest stage audio."
              value={formData.experienceDescription}
              onChange={(e) => setFormData({ ...formData, experienceDescription: e.target.value })}
            />
          </div>

          {/* Achievements (Multiple Items) */}
          <div className="form-group">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
              <label className="form-label" style={{ margin: 0 }}>Achievements & Awards</label>
              <button
                type="button"
                onClick={handleAddAchievementField}
                style={{ background: "none", border: "none", color: "var(--primary-600)", fontSize: "0.8rem", fontWeight: "700", cursor: "pointer" }}
              >
                + Add Another Achievement
              </button>
            </div>

            {formData.achievements.map((ach, idx) => (
              <div key={idx} style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. District Cricket Winner, Hackathon 1st Rank, Best Anchor 2025"
                  value={ach}
                  onChange={(e) => handleAchievementChange(idx, e.target.value)}
                />
                {formData.achievements.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveAchievementField(idx)}
                    style={{ background: "none", border: "none", color: "var(--danger-solid)", cursor: "pointer", padding: "0 6px" }}
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Certificate / Proof Upload */}
          <div className="form-group">
            <label className="form-label">Certificate / Proof of Achievement (Optional)</label>
            <div
              style={{
                border: "2px dashed var(--border-strong)",
                borderRadius: "8px",
                padding: "16px",
                textAlign: "center",
                background: "var(--bg-surface-secondary)"
              }}
            >
              <Upload size={24} color="var(--primary-600)" style={{ margin: "0 auto 6px auto" }} />
              <div style={{ fontSize: "0.85rem", fontWeight: "600" }}>Upload Certificate / Award Proof</div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "10px" }}>
                Supported formats: PDF, JPG, JPEG, PNG (Max 5MB)
              </div>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileUpload}
                style={{ fontSize: "0.82rem" }}
              />
              {formData.certificateName && (
                <div style={{ fontSize: "0.8rem", color: "var(--success-text)", fontWeight: "700", marginTop: "8px" }}>
                  Attached: {formData.certificateName}
                </div>
              )}
            </div>
          </div>

          {/* Event Availability & Preferred Event Type */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <div className="form-group">
              <label className="form-label">Available for College Events?</label>
              <select
                className="form-control"
                value={formData.availableForEvents}
                onChange={(e) => setFormData({ ...formData, availableForEvents: e.target.value })}
              >
                <option value="Yes">Yes (Available)</option>
                <option value="No">No (Currently Unavailable)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Preferred Event Type</label>
              <select
                className="form-control"
                value={formData.preferredEventType}
                onChange={(e) => setFormData({ ...formData, preferredEventType: e.target.value })}
              >
                {PREFERRED_EVENT_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "10px" }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editingSkillId ? "Update Skill" : "Save Skill Profile"}
            </button>
          </div>
        </form>
      </Modal>

      {/* 8. DECLINE REASON MODAL */}
      <Modal
        isOpen={declineModalOpen}
        onClose={() => setDeclineModalOpen(false)}
        title="Decline Event Invitation"
        maxWidth="450px"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <p style={{ fontSize: "0.88rem", color: "var(--text-muted)" }}>
            Please select the reason for declining this invitation so the event coordinator can invite an alternate student.
          </p>

          <div className="form-group">
            <label className="form-label">Reason</label>
            <select
              className="form-control"
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
            >
              {DECLINE_REASONS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          {declineReason === "Other" && (
            <div className="form-group">
              <label className="form-label">Describe Reason</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Family function, exam preparation..."
                value={customDeclineReason}
                onChange={(e) => setCustomDeclineReason(e.target.value)}
              />
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setDeclineModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={handleConfirmDecline}
            >
              Confirm Decline
            </button>
          </div>
        </div>
      </Modal>

      {/* 9. CERTIFICATE PREVIEW MODAL */}
      <Modal
        isOpen={certPreviewModalOpen}
        onClose={() => setCertPreviewModalOpen(false)}
        title={selectedCert ? `${selectedCert.skill} – Proof Document` : "Document Preview"}
        maxWidth="600px"
      >
        {selectedCert && (
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "14px" }}>
              File: <strong>{selectedCert.certificateName || "Proof_Document.pdf"}</strong>
            </p>
            {selectedCert.certificateUrl?.startsWith("data:image") || selectedCert.certificateUrl?.includes("unsplash.com") ? (
              <img
                src={selectedCert.certificateUrl}
                alt="Certificate"
                style={{ maxWidth: "100%", maxHeight: "400px", borderRadius: "8px", objectFit: "contain" }}
              />
            ) : (
              <div
                style={{
                  padding: "40px 20px",
                  background: "var(--bg-surface-secondary)",
                  borderRadius: "8px",
                  border: "1px solid var(--border-subtle)"
                }}
              >
                <FileText size={48} color="var(--primary-600)" style={{ margin: "0 auto 12px auto" }} />
                <div style={{ fontWeight: "700", fontSize: "1rem" }}>{selectedCert.certificateName || "Official Verification PDF"}</div>
                <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "4px" }}>
                  Verified by Institutional Committee
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

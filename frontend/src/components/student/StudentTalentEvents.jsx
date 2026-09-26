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
  Info,
  Music,
  Mic,
  Camera,
  Trophy,
  Flame,
  PartyPopper,
  Mail,
  Heart
} from "lucide-react";
import { Modal, Badge } from "../common/UIPrimitives";
import {
  SPORTS_OPTIONS,
  CULTURAL_OPTIONS,
  EVENT_MGMT_OPTIONS,
  SKILL_LEVELS,
  EXPERIENCE_LEVELS,
  PREFERRED_EVENT_TYPES,
  DECLINE_REASONS,
  getSkillEmoji
} from "../../data/talentAndHealthData";

export default function StudentTalentEvents({ onNavigate }) {
  const {
    currentUser,
    studentSkills = [],
    eventInvitations = [],
    addStudentSkill,
    updateStudentSkill,
    deleteStudentSkill,
    respondToInvitation
  } = useSmartCampus();

  const student = currentUser;

  // Tabs: 'talents' | 'invitations' | 'opportunities'
  const [activeTab, setActiveTab] = useState("talents");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("All");

  // Add/Edit Talent Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSkillId, setEditingSkillId] = useState(null);

  const [formData, setFormData] = useState({
    category: "Cultural",
    skill: "Singing",
    customSkill: "",
    skillLevel: "Intermediate",
    experienceLevel: "College Level",
    experienceDescription: "",
    achievements: [""],
    certificateUrl: "",
    certificateName: "",
    availableForEvents: "Yes",
    preferredEventType: "Annual Gathering / Cultural Night"
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
  const mySkillsRaw = (studentSkills || []).filter((s) => s.studentId === student?.id);

  // Talent & Extracurricular skills (Cultural, Sports, Event Management, Literary)
  const myTalents = mySkillsRaw.filter(
    (s) =>
      s.category === "Cultural" ||
      s.category === "Sports" ||
      s.category === "Event & Management" ||
      s.category === "Literary & Anchoring" ||
      CULTURAL_OPTIONS.includes(s.skill) ||
      SPORTS_OPTIONS.includes(s.skill) ||
      EVENT_MGMT_OPTIONS.includes(s.skill)
  );

  const displayedTalents = selectedCategoryFilter === "All"
    ? myTalents
    : myTalents.filter((s) => s.category === selectedCategoryFilter);

  // Filter invitations for current student
  const myInvitations = (eventInvitations || []).filter((i) => i.studentId === student?.id);
  const pendingInvitations = myInvitations.filter((i) => i.status === "Invited");
  const acceptedInvitations = myInvitations.filter((i) => i.status === "Accepted");

  // Get available skill options based on selected category
  const getCategoryOptions = (cat) => {
    switch (cat) {
      case "Sports": return SPORTS_OPTIONS;
      case "Cultural": return CULTURAL_OPTIONS;
      case "Event & Management": return EVENT_MGMT_OPTIONS;
      case "Literary & Anchoring": return ["Anchoring", "Elocution", "Debate", "Poetry", "Writing", "Public Speaking", "Other"];
      default: return CULTURAL_OPTIONS;
    }
  };

  const handleOpenAddModal = (defaultCategory = "Cultural") => {
    setEditingSkillId(null);
    const options = getCategoryOptions(defaultCategory);
    setFormData({
      category: defaultCategory,
      skill: options[0],
      customSkill: "",
      skillLevel: "Intermediate",
      experienceLevel: "College Level",
      experienceDescription: "",
      achievements: [""],
      certificateUrl: "",
      certificateName: "",
      availableForEvents: "Yes",
      preferredEventType: "Annual Gathering / Cultural Night"
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (skillObj) => {
    setEditingSkillId(skillObj.id);
    const catOptions = getCategoryOptions(skillObj.category);
    const isStandard = catOptions.includes(skillObj.skill);

    setFormData({
      category: skillObj.category || "Cultural",
      skill: isStandard ? skillObj.skill : "Other",
      customSkill: isStandard ? "" : skillObj.skill,
      skillLevel: skillObj.skillLevel || "Intermediate",
      experienceLevel: skillObj.experienceLevel || "College Level",
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
      ? (formData.customSkill.trim() || "Event Talent")
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
      preferredEventType: formData.preferredEventType,
      approvalStatus: "Approved", // Talents are immediately active for teacher event discovery
      submittedAt: new Date().toISOString()
    };

    if (editingSkillId) {
      updateStudentSkill(editingSkillId, payload);
    } else {
      addStudentSkill(payload);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id, label) => {
    if (window.confirm(`Are you sure you want to remove "${label}" from your event talents?`)) {
      deleteStudentSkill(id);
    }
  };

  const handleAcceptInvite = (inviteId) => {
    respondToInvitation(inviteId, "Accepted");
  };

  const handleOpenDeclineModal = (inviteId) => {
    setSelectedInvitationId(inviteId);
    setDeclineReason("Academic Schedule");
    setCustomDeclineReason("");
    setDeclineModalOpen(true);
  };

  const handleConfirmDecline = () => {
    const finalReason = declineReason === "Other" ? customDeclineReason : declineReason;
    respondToInvitation(selectedInvitationId, "Declined", finalReason);
    setDeclineModalOpen(false);
    setSelectedInvitationId(null);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Top Hero Pitch Banner */}
      <div
        className="card"
        style={{
          background: "linear-gradient(135deg, #4c1d95 0%, #6d28d9 50%, #7c3aed 100%)",
          color: "white",
          padding: "26px 30px",
          borderRadius: "18px",
          boxShadow: "0 10px 25px -5px rgba(109, 40, 217, 0.4)",
          position: "relative",
          overflow: "hidden"
        }}
      >
        <div style={{ position: "relative", zIndex: 1, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "20px" }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(255, 255, 255, 0.2)", border: "1px solid rgba(255, 255, 255, 0.3)", padding: "5px 12px", borderRadius: "20px", marginBottom: "12px" }}>
              <PartyPopper size={16} color="#fde047" />
              <span style={{ fontSize: "0.78rem", fontWeight: "700", color: "#fef08a", letterSpacing: "0.04em" }}>
                COLLEGE & DEPARTMENT EVENTS TALENT HUB
              </span>
            </div>

            <h1 style={{ fontSize: "1.7rem", fontWeight: "800", color: "white", margin: 0 }}>
              Skills & Talent (कला, क्रीडा व सांस्कृतिक कलागुण मंच)
            </h1>

            <p style={{ fontSize: "0.92rem", color: "#e9d5ff", marginTop: "8px", maxWidth: "700px", lineHeight: "1.5" }}>
              Showcase your talents in Singing, Dance, Drama, Anchoring, Photography, Sports, and Event Coordination. When college or department organizes Annual Gathering, Shiv Jayanti, Sports Meet, or Tech-Fest, teachers and HOD discover you here to give you a stage to perform!
            </p>

            <div style={{ display: "flex", alignItems: "center", gap: "16px", marginTop: "14px", flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.82rem", color: "#ddd6fe" }}>
                <Mic size={16} color="#f472b6" />
                <span>Anchoring & Cultural Night Performers</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.82rem", color: "#ddd6fe" }}>
                <Trophy size={16} color="#facc15" />
                <span>Inter-College Sports & Tournaments</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.82rem", color: "#ddd6fe" }}>
                <Mail size={16} color="#60a5fa" />
                <span>Direct Event Invitations from Teachers & HOD</span>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px", minWidth: "220px" }}>
            <button
              onClick={() => handleOpenAddModal("Cultural")}
              className="btn"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                padding: "12px 20px",
                fontWeight: "700",
                fontSize: "0.92rem",
                background: "white",
                color: "#5b21b6",
                border: "none",
                borderRadius: "10px",
                boxShadow: "0 4px 14px rgba(0,0,0,0.2)"
              }}
            >
              <Plus size={18} />
              <span>+ Add Talent or Skill</span>
            </button>

            <button
              onClick={() => onNavigate && onNavigate("skill-bucket")}
              className="btn btn-secondary"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                padding: "10px 16px",
                fontWeight: "600",
                fontSize: "0.84rem",
                background: "rgba(255, 255, 255, 0.15)",
                color: "white",
                borderColor: "rgba(255, 255, 255, 0.25)"
              }}
            >
              <span>Go to Technical Skill Bucket (Internship)</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Counters */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
        <div className="card" style={{ padding: "18px", borderLeft: "4px solid #8b5cf6", display: "flex", alignItems: "center", gap: "14px" }}>
          <div style={{ width: "42px", height: "42px", borderRadius: "10px", background: "#f5f3ff", color: "#7c3aed", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Sparkles size={22} />
          </div>
          <div>
            <div style={{ fontSize: "1.4rem", fontWeight: "800", color: "var(--text-main)" }}>{myTalents.length}</div>
            <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontWeight: "600" }}>Registered Event Talents</div>
          </div>
        </div>

        <div className="card" style={{ padding: "18px", borderLeft: "4px solid #ef4444", display: "flex", alignItems: "center", gap: "14px" }}>
          <div style={{ width: "42px", height: "42px", borderRadius: "10px", background: "#fef2f2", color: "#dc2626", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Mail size={22} />
          </div>
          <div>
            <div style={{ fontSize: "1.4rem", fontWeight: "800", color: "var(--text-main)" }}>{pendingInvitations.length}</div>
            <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontWeight: "600" }}>Pending Event Invitations</div>
          </div>
        </div>

        <div className="card" style={{ padding: "18px", borderLeft: "4px solid #10b981", display: "flex", alignItems: "center", gap: "14px" }}>
          <div style={{ width: "42px", height: "42px", borderRadius: "10px", background: "#ecfdf5", color: "#059669", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Trophy size={22} />
          </div>
          <div>
            <div style={{ fontSize: "1.4rem", fontWeight: "800", color: "var(--text-main)" }}>{acceptedInvitations.length}</div>
            <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontWeight: "600" }}>Accepted College Events</div>
          </div>
        </div>

        <div className="card" style={{ padding: "18px", borderLeft: "4px solid #f59e0b", display: "flex", alignItems: "center", gap: "14px" }}>
          <div style={{ width: "42px", height: "42px", borderRadius: "10px", background: "#fffbeb", color: "#d97706", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Flame size={22} />
          </div>
          <div>
            <div style={{ fontSize: "1.4rem", fontWeight: "800", color: "var(--text-main)" }}>
              {myTalents.filter((t) => t.availableForEvents === "Yes").length > 0 ? "Ready" : "Inactive"}
            </div>
            <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontWeight: "600" }}>Event Participation Status</div>
          </div>
        </div>
      </div>

      {/* Main Tabs Container */}
      <div className="card">
        <div className="card-header" style={{ borderBottom: "1px solid var(--border-color)", paddingBottom: "0px" }}>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <button
              onClick={() => setActiveTab("talents")}
              style={{
                padding: "12px 18px",
                border: "none",
                background: "transparent",
                fontWeight: activeTab === "talents" ? "800" : "600",
                color: activeTab === "talents" ? "#7c3aed" : "var(--text-muted)",
                borderBottom: activeTab === "talents" ? "3px solid #7c3aed" : "3px solid transparent",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}
            >
              <Sparkles size={17} />
              <span>My Talents & Skills ({myTalents.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("invitations")}
              style={{
                padding: "12px 18px",
                border: "none",
                background: "transparent",
                fontWeight: activeTab === "invitations" ? "800" : "600",
                color: activeTab === "invitations" ? "#7c3aed" : "var(--text-muted)",
                borderBottom: activeTab === "invitations" ? "3px solid #7c3aed" : "3px solid transparent",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}
            >
              <Mail size={17} />
              <span>Event Invitations ({myInvitations.length})</span>
              {pendingInvitations.length > 0 && (
                <span style={{ background: "#ef4444", color: "white", borderRadius: "10px", padding: "1px 6px", fontSize: "0.7rem", fontWeight: "800" }}>
                  {pendingInvitations.length} NEW
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("opportunities")}
              style={{
                padding: "12px 18px",
                border: "none",
                background: "transparent",
                fontWeight: activeTab === "opportunities" ? "800" : "600",
                color: activeTab === "opportunities" ? "#7c3aed" : "var(--text-muted)",
                borderBottom: activeTab === "opportunities" ? "3px solid #7c3aed" : "3px solid transparent",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}
            >
              <Trophy size={17} />
              <span>College Functions Guide (कार्यक्रम माहिती)</span>
            </button>
          </div>
        </div>

        {/* ============================================================== */}
        {/* SUBTAB 1: MY TALENTS & HOBBIES */}
        {/* ============================================================== */}
        {activeTab === "talents" && (
          <div style={{ padding: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", marginBottom: "18px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                <span style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--text-muted)" }}>Category:</span>
                {["All", "Cultural", "Sports", "Literary & Anchoring", "Event & Management"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategoryFilter(cat)}
                    className="btn btn-sm"
                    style={{
                      padding: "4px 10px",
                      fontSize: "0.76rem",
                      background: selectedCategoryFilter === cat ? "#7c3aed" : "var(--bg-subtle)",
                      color: selectedCategoryFilter === cat ? "white" : "var(--text-muted)",
                      borderColor: selectedCategoryFilter === cat ? "#7c3aed" : "var(--border-color)",
                      fontWeight: selectedCategoryFilter === cat ? "700" : "500"
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  onClick={() => handleOpenAddModal("Cultural")}
                  className="btn btn-sm"
                  style={{ background: "#7c3aed", color: "white", display: "flex", alignItems: "center", gap: "5px" }}
                >
                  <Plus size={14} /> Add Talent
                </button>
              </div>
            </div>

            {displayedTalents.length === 0 ? (
              <div style={{ textAlign: "center", padding: "48px 20px", color: "var(--text-muted)" }}>
                <Sparkles size={42} style={{ margin: "0 auto 12px auto", opacity: 0.3 }} />
                <h4 style={{ fontWeight: "700", margin: "0 0 6px 0", color: "var(--text-main)" }}>
                  No Extracurricular Talents Registered Yet
                </h4>
                <p style={{ fontSize: "0.86rem", maxWidth: "480px", margin: "0 auto 16px auto" }}>
                  Mention your singing, dance, drama, anchoring, sports, or photography skills so you get selected when CSMSS organizes Annual Gathering or Sports Meets!
                </p>
                <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
                  <button onClick={() => handleOpenAddModal("Cultural")} className="btn btn-sm" style={{ background: "#7c3aed", color: "white" }}>
                    🎭 Add Cultural Talent
                  </button>
                  <button onClick={() => handleOpenAddModal("Sports")} className="btn btn-secondary btn-sm">
                    🏆 Add Sports Talent
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "16px" }}>
                {displayedTalents.map((t) => (
                  <div
                    key={t.id}
                    style={{
                      padding: "16px",
                      borderRadius: "12px",
                      border: "1px solid var(--border-color)",
                      background: "var(--bg-surface)",
                      display: "flex",
                      flexDirection: "column",
                      gap: "10px",
                      position: "relative"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span style={{ fontSize: "1.6rem" }}>{getSkillEmoji(t.skill)}</span>
                        <div>
                          <div style={{ fontWeight: "800", fontSize: "1.05rem", color: "var(--text-main)" }}>
                            {t.skill}
                          </div>
                          <div style={{ fontSize: "0.78rem", color: "#7c3aed", fontWeight: "700" }}>
                            {t.category} • {t.skillLevel}
                          </div>
                        </div>
                      </div>

                      <span style={{ background: t.availableForEvents === "Yes" ? "#ecfdf5" : "#f1f5f9", color: t.availableForEvents === "Yes" ? "#059669" : "#64748b", border: "1px solid #cbd5e1", padding: "2px 8px", borderRadius: "10px", fontSize: "0.7rem", fontWeight: "700" }}>
                        {t.availableForEvents === "Yes" ? "✓ Ready for Events" : "Not Available"}
                      </span>
                    </div>

                    <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                      Experience: <strong>{t.experienceLevel || "College Level"}</strong>
                    </div>

                    {t.experienceDescription && (
                      <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", margin: "0", lineHeight: "1.4" }}>
                        {t.experienceDescription}
                      </p>
                    )}

                    {t.achievements && t.achievements.length > 0 && t.achievements[0] !== "" && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                        {t.achievements.map((ach, i) => (
                          <span
                            key={i}
                            style={{
                              background: "#fdf4ff",
                              color: "#a21caf",
                              fontSize: "0.74rem",
                              padding: "2px 8px",
                              borderRadius: "4px",
                              fontWeight: "600",
                              border: "1px solid #f0abfc"
                            }}
                          >
                            🌟 {ach}
                          </span>
                        ))}
                      </div>
                    )}

                    {t.preferredEventType && (
                      <div style={{ fontSize: "0.75rem", color: "#64748b", background: "var(--bg-subtle)", padding: "4px 8px", borderRadius: "6px" }}>
                        🎯 Preferred Event: <strong>{t.preferredEventType}</strong>
                      </div>
                    )}

                    {t.certificateUrl && (
                      <div>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedCert(t);
                            setCertPreviewModalOpen(true);
                          }}
                          className="btn btn-ghost btn-sm"
                          style={{ padding: "4px 8px", fontSize: "0.75rem", color: "#7c3aed", display: "inline-flex", alignItems: "center", gap: "4px" }}
                        >
                          <FileText size={13} />
                          <span>View Trophy / Certificate / Proof</span>
                        </button>
                      </div>
                    )}

                    {/* Actions */}
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "auto", paddingTop: "8px", borderTop: "1px solid var(--border-color)" }}>
                      <button
                        onClick={() => handleOpenEditModal(t)}
                        className="btn btn-ghost btn-sm"
                        style={{ padding: "4px 8px", fontSize: "0.75rem", color: "#7c3aed" }}
                      >
                        <Edit2 size={13} /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(t.id, t.skill)}
                        className="btn btn-ghost btn-sm"
                        style={{ padding: "4px 8px", fontSize: "0.75rem", color: "#ef4444" }}
                      >
                        <Trash2 size={13} /> Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* SUBTAB 2: EVENT INVITATIONS FROM TEACHERS / HOD */}
        {/* ============================================================== */}
        {activeTab === "invitations" && (
          <div style={{ padding: "20px" }}>
            <div style={{ marginBottom: "18px" }}>
              <h3 style={{ margin: "0", fontSize: "1.1rem", fontWeight: "800" }}>Invitations from Event Coordinators & Faculty</h3>
              <p style={{ margin: "2px 0 0 0", fontSize: "0.82rem", color: "var(--text-muted)" }}>
                Faculty members search your talent profile and invite you to perform, anchor, or coordinate in college events.
              </p>
            </div>

            {myInvitations.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
                <Mail size={38} style={{ opacity: 0.3, margin: "0 auto 10px auto" }} />
                <p>No event invitations received yet. Make sure your talents are registered and status is set to "Ready for Events"!</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {myInvitations.map((inv) => {
                  const isPending = inv.status === "Invited";
                  const isAccepted = inv.status === "Accepted";
                  const isDeclined = inv.status === "Declined";

                  return (
                    <div
                      key={inv.id}
                      style={{
                        padding: "16px 20px",
                        borderRadius: "12px",
                        border: "1px solid var(--border-color)",
                        background: isPending ? "#faf5ff" : "var(--bg-surface)",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: "14px"
                      }}
                    >
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <span style={{ fontWeight: "800", fontSize: "1.05rem", color: "var(--text-main)" }}>
                            {inv.eventName}
                          </span>
                          <Badge variant={isAccepted ? "success" : isDeclined ? "danger" : "purple"}>
                            {inv.status}
                          </Badge>
                        </div>

                        <div style={{ display: "flex", gap: "14px", fontSize: "0.82rem", color: "var(--text-muted)", marginTop: "4px", flexWrap: "wrap" }}>
                          <span>🎭 Role: <strong>{inv.role || "Performer"}</strong></span>
                          <span>📅 Date: <strong>{inv.eventDate || "Upcoming Function"}</strong></span>
                          <span>🏛️ Venue: <strong>{inv.venue || "College Auditorium / Ground"}</strong></span>
                          <span>👨‍🏫 Invited by: <strong>{inv.facultyName || "Faculty Coordinator"}</strong></span>
                        </div>

                        {inv.notes && (
                          <div style={{ fontSize: "0.8rem", color: "#6b21a8", marginTop: "6px", background: "rgba(168, 85, 247, 0.1)", padding: "4px 10px", borderRadius: "6px" }}>
                            💬 Note from Teacher: "{inv.notes}"
                          </div>
                        )}
                      </div>

                      {isPending && (
                        <div style={{ display: "flex", gap: "10px" }}>
                          <button
                            onClick={() => handleAcceptInvite(inv.id)}
                            className="btn btn-sm"
                            style={{ background: "#059669", color: "white", display: "flex", alignItems: "center", gap: "5px", fontWeight: "700" }}
                          >
                            <Check size={14} /> Accept Invitation (स्वीकारा)
                          </button>
                          <button
                            onClick={() => handleOpenDeclineModal(inv.id)}
                            className="btn btn-ghost btn-sm"
                            style={{ color: "#dc2626", border: "1px solid #fecaca" }}
                          >
                            Decline (नाकारा)
                          </button>
                        </div>
                      )}

                      {isAccepted && (
                        <div style={{ fontSize: "0.82rem", color: "#059669", fontWeight: "700", display: "flex", alignItems: "center", gap: "4px" }}>
                          <CheckCircle2 size={16} /> Accepted — Best of luck for your performance!
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* SUBTAB 3: COLLEGE FUNCTIONS GUIDE */}
        {/* ============================================================== */}
        {activeTab === "opportunities" && (
          <div style={{ padding: "20px" }}>
            <h3 style={{ margin: "0 0 4px 0", fontSize: "1.1rem", fontWeight: "800" }}>CSMSS Annual Events & Talent Platforms</h3>
            <p style={{ margin: "0 0 16px 0", fontSize: "0.82rem", color: "var(--text-muted)" }}>
              The college provides extensive opportunities for students to showcase their talent on grand stages:
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
              <div style={{ padding: "18px", borderRadius: "12px", background: "linear-gradient(135deg, #fdf4ff 0%, #fae8ff 100%)", border: "1px solid #f0abfc" }}>
                <div style={{ fontSize: "1.8rem", marginBottom: "8px" }}>🎭</div>
                <h4 style={{ margin: "0 0 6px 0", color: "#86198f", fontWeight: "800" }}>Annual Gathering & Cultural Fest (स्नेहसंमेलन)</h4>
                <p style={{ fontSize: "0.82rem", color: "#701a75", lineHeight: "1.5", margin: 0 }}>
                  Three days of grand cultural celebration featuring solo singing, group dance, fashion shows, street plays (पथनाट्य), and drama. Stage anchors are selected from registered talent profiles.
                </p>
              </div>

              <div style={{ padding: "18px", borderRadius: "12px", background: "linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)", border: "1px solid #fed7aa" }}>
                <div style={{ fontSize: "1.8rem", marginBottom: "8px" }}>🚩</div>
                <h4 style={{ margin: "0 0 6px 0", color: "#9a3412", fontWeight: "800" }}>Chhatrapati Shivaji Maharaj Jayanti</h4>
                <p style={{ fontSize: "0.82rem", color: "#7c2d12", lineHeight: "1.5", margin: 0 }}>
                  Traditional Dhol-Tasha, Powada singing, elocution, poetry recitation, and historical drama. Opportunities for students with skills in traditional instruments and speeches.
                </p>
              </div>

              <div style={{ padding: "18px", borderRadius: "12px", background: "linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)", border: "1px solid #a7f3d0" }}>
                <div style={{ fontSize: "1.8rem", marginBottom: "8px" }}>🏆</div>
                <h4 style={{ margin: "0 0 6px 0", color: "#065f46", fontWeight: "800" }}>Annual Sports Week & Tournaments</h4>
                <p style={{ fontSize: "0.82rem", color: "#064e3b", lineHeight: "1.5", margin: 0 }}>
                  Inter-department competitions in Cricket, Football, Volleyball, Kabaddi, Badminton, Chess, and Athletics. Outstanding players represent the college at University levels.
                </p>
              </div>

              <div style={{ padding: "18px", borderRadius: "12px", background: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)", border: "1px solid #bfdbfe" }}>
                <div style={{ fontSize: "1.8rem", marginBottom: "8px" }}>🎤</div>
                <h4 style={{ margin: "0 0 6px 0", color: "#1e40af", fontWeight: "800" }}>Anchoring & Stage Management Desk</h4>
                <p style={{ fontSize: "0.82rem", color: "#1e3a8a", lineHeight: "1.5", margin: 0 }}>
                  Confidence, stage presence, and bilingual fluency (Marathi / English / Hindi). Teachers select student anchors for all guest lectures, felicitation ceremonies, and seminars.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* MODAL: ADD / EDIT TALENT */}
      {/* ============================================================== */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingSkillId ? "Edit Event Talent" : "Add Talent for College Functions"}
          maxWidth="600px"
        >
          <form onSubmit={handleSubmitSkill} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ background: "#f5f3ff", border: "1px solid #ddd6fe", padding: "12px", borderRadius: "8px", fontSize: "0.82rem", color: "#5b21b6" }}>
              🌟 <strong>College Functions Platform:</strong> Register your cultural, anchoring, arts, or sports talents so faculty and HOD can invite you to perform in Annual Gathering, Shiv Jayanti, and Sports Meets!
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: "700" }}>Talent Category *</label>
                <select
                  className="form-control"
                  value={formData.category}
                  onChange={(e) => {
                    const cat = e.target.value;
                    const opts = getCategoryOptions(cat);
                    setFormData({ ...formData, category: cat, skill: opts[0] });
                  }}
                  required
                >
                  <option value="Cultural">🎭 Cultural & Performing Arts</option>
                  <option value="Literary & Anchoring">🎤 Anchoring & Literary</option>
                  <option value="Sports">🏆 Sports & Athletics</option>
                  <option value="Event & Management">🎪 Event Management & Volunteers</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: "700" }}>Specific Talent / Skill *</label>
                <select
                  className="form-control"
                  value={formData.skill}
                  onChange={(e) => setFormData({ ...formData, skill: e.target.value })}
                  required
                >
                  {getCategoryOptions(formData.category).map((opt) => (
                    <option key={opt} value={opt}>{getSkillEmoji(opt)} {opt}</option>
                  ))}
                </select>
              </div>
            </div>

            {formData.skill === "Other" && (
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: "700" }}>Specify Custom Talent *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Dhol Tasha, Magic, Classical Kathak, Flute..."
                  value={formData.customSkill}
                  onChange={(e) => setFormData({ ...formData, customSkill: e.target.value })}
                  required
                />
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: "700" }}>Skill Level</label>
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
                <label className="form-label" style={{ fontWeight: "700" }}>Competition Experience</label>
                <select
                  className="form-control"
                  value={formData.experienceLevel}
                  onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value })}
                >
                  {EXPERIENCE_LEVELS.map((lvl) => (
                    <option key={lvl} value={lvl}>{lvl}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontWeight: "700" }}>Past Performances / Description</label>
              <textarea
                className="form-control"
                rows={3}
                placeholder="Mention past stage performances, school/college events, sports matches, or anchoring experience..."
                value={formData.experienceDescription}
                onChange={(e) => setFormData({ ...formData, experienceDescription: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontWeight: "700" }}>Prizes Won & Achievements</label>
              {formData.achievements.map((ach, i) => (
                <div key={i} style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. 1st Prize in Inter-College Dance, Best Batsman in District Cup..."
                    value={ach}
                    onChange={(e) => handleAchievementChange(i, e.target.value)}
                  />
                  {formData.achievements.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveAchievementField(i)}
                      className="btn btn-ghost btn-sm"
                      style={{ color: "#ef4444" }}
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddAchievementField}
                className="btn btn-ghost btn-sm"
                style={{ color: "#7c3aed", fontWeight: "600", fontSize: "0.78rem" }}
              >
                + Add Another Achievement
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: "700" }}>Available for College Functions?</label>
                <select
                  className="form-control"
                  value={formData.availableForEvents}
                  onChange={(e) => setFormData({ ...formData, availableForEvents: e.target.value })}
                >
                  <option value="Yes">Yes, Ready to Participate! (होय)</option>
                  <option value="No">No, Only For Record (नाही)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: "700" }}>Preferred Event Type</label>
                <select
                  className="form-control"
                  value={formData.preferredEventType}
                  onChange={(e) => setFormData({ ...formData, preferredEventType: e.target.value })}
                >
                  {PREFERRED_EVENT_TYPES.map((et) => (
                    <option key={et} value={et}>{et}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontWeight: "700" }}>Upload Certificate / Trophy Photo (Optional)</label>
              <input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                className="form-control"
                onChange={handleFileUpload}
              />
              {formData.certificateName && (
                <small style={{ color: "#059669", display: "block", marginTop: "4px" }}>
                  ✓ Attached: {formData.certificateName}
                </small>
              )}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "12px" }}>
              <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" style={{ background: "#7c3aed", borderColor: "#6d28d9" }}>
                {editingSkillId ? "Update Talent" : "Save Talent to Event Profile"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Decline Invitation Modal */}
      {declineModalOpen && (
        <Modal
          isOpen={declineModalOpen}
          onClose={() => setDeclineModalOpen(false)}
          title="Decline Event Invitation"
          maxWidth="460px"
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", margin: 0 }}>
              Please provide a polite reason to the faculty coordinator for not participating in this function:
            </p>

            <div className="form-group">
              <label className="form-label" style={{ fontWeight: "700" }}>Reason for Declining</label>
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
                <label className="form-label">Specify Reason</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Traveling home that weekend..."
                  value={customDeclineReason}
                  onChange={(e) => setCustomDeclineReason(e.target.value)}
                  required
                />
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px" }}>
              <button onClick={() => setDeclineModalOpen(false)} className="btn btn-secondary">
                Cancel
              </button>
              <button onClick={handleConfirmDecline} className="btn btn-primary" style={{ background: "#dc2626", borderColor: "#b91c1c" }}>
                Confirm Decline
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Certificate Viewer Modal */}
      {certPreviewModalOpen && selectedCert && (
        <Modal
          isOpen={certPreviewModalOpen}
          onClose={() => setCertPreviewModalOpen(false)}
          title={`Certificate / Proof: ${selectedCert.skill}`}
          maxWidth="700px"
        >
          <div style={{ textAlign: "center", padding: "10px" }}>
            {selectedCert.certificateUrl?.startsWith("data:image") ? (
              <img
                src={selectedCert.certificateUrl}
                alt="Certificate"
                style={{ maxWidth: "100%", maxHeight: "500px", borderRadius: "8px", objectFit: "contain" }}
              />
            ) : (
              <iframe
                src={selectedCert.certificateUrl}
                title="Certificate PDF"
                style={{ width: "100%", height: "450px", border: "none", borderRadius: "8px" }}
              />
            )}
            <div style={{ marginTop: "14px", display: "flex", justifyContent: "flex-end" }}>
              <button onClick={() => setCertPreviewModalOpen(false)} className="btn btn-secondary">
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

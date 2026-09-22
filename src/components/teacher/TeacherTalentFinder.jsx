import React, { useState } from "react";
import { useSmartCampus } from "../../context/SmartCampusContext";
import {
  Search,
  Users,
  Calendar,
  Sparkles,
  Award,
  Filter,
  Plus,
  Mail,
  Phone,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldAlert,
  AlertTriangle,
  UserCheck,
  Tag,
  MapPin,
  FileText,
  Eye,
  Send,
  Trash2,
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
  EVENT_CATEGORIES,
  getSkillEmoji
} from "../../data/talentAndHealthData";

export default function TeacherTalentFinder() {
  const {
    currentUser,
    activeRole,
    users,
    departments,
    studentSkills,
    collegeEvents,
    eventInvitations,
    eventTeamMembers,
    studentHealthRecords,
    createCollegeEvent,
    deleteCollegeEvent,
    sendEventInvitation,
    assignEventTeamMember,
    removeEventTeamMember,
    logHealthAccess,
    addToast
  } = useSmartCampus();

  // Active View Tab: 'search' | 'events' | 'teams'
  const [activeTab, setActiveTab] = useState("search");

  // Search Filters
  const [filterDept, setFilterDept] = useState("All");
  const [filterYear, setFilterYear] = useState("All");
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterSkill, setFilterSkill] = useState("");
  const [filterLevel, setFilterLevel] = useState("All");
  const [filterAvailability, setFilterAvailability] = useState("Available");

  // Modal States
  const [createEventModalOpen, setCreateEventModalOpen] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [selectedStudentForInvite, setSelectedStudentForInvite] = useState(null);
  const [selectedEventIdForInvite, setSelectedEventIdForInvite] = useState("");
  const [inviteRole, setInviteRole] = useState("");
  const [inviteNotes, setInviteNotes] = useState("");

  // Student Profile Modal State
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [viewingStudent, setViewingStudent] = useState(null);

  // Health Information Modal State (Authorized View Only)
  const [healthModalOpen, setHealthModalOpen] = useState(false);
  const [selectedHealthRecord, setSelectedHealthRecord] = useState(null);

  // Shortlisted students set (local UI state)
  const [shortlistedStudentIds, setShortlistedStudentIds] = useState(new Set());

  // Selected Event for Team Management Tab
  const [selectedEventForTeam, setSelectedEventForTeam] = useState(collegeEvents[0]?.id || "");

  // Create Event Form State
  const [eventFormData, setEventFormData] = useState({
    eventName: "",
    category: "Technical",
    description: "",
    date: "",
    startTime: "10:00 AM",
    endTime: "05:00 PM",
    venue: "Main Auditorium",
    department: "All",
    year: "All",
    requiredStudents: 10,
    registrationDeadline: "",
    additionalInstructions: "",
    requiredSkills: [
      { skill: "Anchoring", category: "Event & Management", minSkillLevel: "Intermediate", requiredCount: 2 }
    ]
  });

  // Unique list of all skills across records
  const allKnownSkills = Array.from(new Set(studentSkills.map((s) => s.skill))).sort();

  // Group skills by student
  const studentMap = {};
  users.filter((u) => u.role === "student").forEach((stu) => {
    studentMap[stu.id] = {
      ...stu,
      skills: studentSkills.filter((s) => s.studentId === stu.id),
      healthRecord: studentHealthRecords.find((h) => h.studentId === stu.id)
    };
  });

  // Filter students based on search criteria
  const matchingStudents = Object.values(studentMap).filter((stu) => {
    // Dept filter
    if (filterDept !== "All" && stu.departmentId !== filterDept) return false;
    // Year filter
    if (filterYear !== "All" && stu.year !== filterYear) return false;

    // If student has no skills recorded, only show if no skill/category filter is set
    if (stu.skills.length === 0) {
      if (filterCategory !== "All" || filterSkill || filterLevel !== "All") return false;
      return true;
    }

    // Availability filter
    if (filterAvailability === "Available") {
      const hasAvailableSkill = stu.skills.some((s) => s.availableForEvents === "Yes");
      if (!hasAvailableSkill) return false;
    } else if (filterAvailability === "Unavailable") {
      const allUnavailable = stu.skills.every((s) => s.availableForEvents === "No");
      if (!allUnavailable) return false;
    }

    // Category filter
    if (filterCategory !== "All") {
      const matchCat = stu.skills.some((s) => s.category === filterCategory);
      if (!matchCat) return false;
    }

    // Specific Skill text/search filter
    if (filterSkill.trim()) {
      const q = filterSkill.toLowerCase().trim();
      const matchSkill = stu.skills.some(
        (s) => s.skill.toLowerCase().includes(q) || s.category.toLowerCase().includes(q)
      );
      if (!matchSkill) return false;
    }

    // Skill level filter
    if (filterLevel !== "All") {
      const levelRank = { Beginner: 1, Intermediate: 2, Advanced: 3, Expert: 4 };
      const reqRank = levelRank[filterLevel] || 1;
      const matchLvl = stu.skills.some((s) => (levelRank[s.skillLevel] || 1) >= reqRank);
      if (!matchLvl) return false;
    }

    return true;
  });

  const toggleShortlist = (studentId) => {
    setShortlistedStudentIds((prev) => {
      const next = new Set(prev);
      if (next.has(studentId)) {
        next.delete(studentId);
        addToast("Shortlist Updated", "Student removed from shortlist.", "info");
      } else {
        next.add(studentId);
        addToast("Student Shortlisted", "Student added to your event shortlist.", "success");
      }
      return next;
    });
  };

  const handleOpenInviteModal = (stu) => {
    setSelectedStudentForInvite(stu);
    setSelectedEventIdForInvite(collegeEvents[0]?.id || "");
    const topSkill = stu.skills[0]?.skill || "Volunteer";
    setInviteRole(topSkill);
    setInviteNotes("");
    setInviteModalOpen(true);
  };

  const handleSendInvite = (e) => {
    e.preventDefault();
    if (!selectedStudentForInvite || !selectedEventIdForInvite) return;

    // If student has health safety advisory, display note
    if (selectedStudentForInvite.healthRecord) {
      logHealthAccess(
        "EVENT_INVITATION_SAFETY_CHECK",
        selectedStudentForInvite.id,
        `Assigned/Invited student to event ID ${selectedEventIdForInvite}`
      );
    }

    sendEventInvitation({
      eventId: selectedEventIdForInvite,
      studentId: selectedStudentForInvite.id,
      role: inviteRole,
      skill: selectedStudentForInvite.skills.find((s) => s.skill === inviteRole)?.skill || inviteRole,
      notes: inviteNotes
    });

    setInviteModalOpen(false);
  };

  const handleViewHealthDetails = (record) => {
    setSelectedHealthRecord(record);
    logHealthAccess("VIEW_HEALTH_RECORD_COORDINATOR", record.studentId, "Reviewed during event talent search");
    setHealthModalOpen(true);
  };

  const handleAddEventSkillField = () => {
    setEventFormData({
      ...eventFormData,
      requiredSkills: [
        ...eventFormData.requiredSkills,
        { skill: TECHNICAL_OPTIONS[0], category: "Technical", minSkillLevel: "Intermediate", requiredCount: 2 }
      ]
    });
  };

  const handleRemoveEventSkillField = (idx) => {
    setEventFormData({
      ...eventFormData,
      requiredSkills: eventFormData.requiredSkills.filter((_, i) => i !== idx)
    });
  };

  const handleCreateEventSubmit = (e) => {
    e.preventDefault();
    createCollegeEvent({
      eventName: eventFormData.eventName,
      category: eventFormData.category,
      description: eventFormData.description,
      date: eventFormData.date,
      startTime: eventFormData.startTime,
      endTime: eventFormData.endTime,
      venue: eventFormData.venue,
      department: eventFormData.department,
      year: eventFormData.year,
      requiredStudents: Number(eventFormData.requiredStudents) || 10,
      registrationDeadline: eventFormData.registrationDeadline,
      coordinatorId: currentUser.id,
      coordinatorName: currentUser.name,
      coordinatorPhone: currentUser.phone || "+91 98900 12345",
      requiredSkills: eventFormData.requiredSkills,
      additionalInstructions: eventFormData.additionalInstructions
    });
    setCreateEventModalOpen(false);
  };

  const currentEventForTeamObj = collegeEvents.find((e) => e.id === selectedEventForTeam) || collegeEvents[0];
  const eventInvs = eventInvitations.filter((i) => i.eventId === currentEventForTeamObj?.id);
  const eventTeams = eventTeamMembers.filter((t) => t.eventId === currentEventForTeamObj?.id);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* 1. Header Banner */}
      <div
        style={{
          background: "linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #0f172a 100%)",
          borderRadius: "16px",
          padding: "24px 32px",
          color: "white",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
          boxShadow: "0 10px 25px -5px rgba(30, 58, 138, 0.4)"
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
            <span style={{ background: "rgba(255,255,255,0.15)", padding: "4px 10px", borderRadius: "20px", fontSize: "0.75rem", fontWeight: "700" }}>
              CAMPUS EVENT COORDINATION
            </span>
          </div>
          <h2 style={{ fontSize: "1.75rem", fontWeight: "800", color: "white" }}>
            Event Talent Finder 🎯
          </h2>
          <p style={{ fontSize: "0.9rem", color: "#bfdbfe", marginTop: "4px" }}>
            Search student talents across sports, cultural, management and technical domains. Invite, shortlist & assign event teams.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={() => setCreateEventModalOpen(true)}
            className="btn btn-primary btn-lg"
            style={{
              background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
              boxShadow: "0 4px 14px rgba(37, 99, 235, 0.4)"
            }}
          >
            <Plus size={18} /> Create New Event
          </button>
        </div>
      </div>

      {/* 2. Tab Navigation */}
      <div style={{ display: "flex", gap: "12px", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "8px" }}>
        <button
          onClick={() => setActiveTab("search")}
          style={{
            background: "none",
            border: "none",
            padding: "8px 16px",
            fontSize: "0.92rem",
            fontWeight: "700",
            cursor: "pointer",
            color: activeTab === "search" ? "var(--primary-600)" : "var(--text-muted)",
            borderBottom: activeTab === "search" ? "3px solid var(--primary-600)" : "3px solid transparent",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}
        >
          <Search size={16} />
          Find Students ({matchingStudents.length})
        </button>

        <button
          onClick={() => setActiveTab("events")}
          style={{
            background: "none",
            border: "none",
            padding: "8px 16px",
            fontSize: "0.92rem",
            fontWeight: "700",
            cursor: "pointer",
            color: activeTab === "events" ? "var(--primary-600)" : "var(--text-muted)",
            borderBottom: activeTab === "events" ? "3px solid var(--primary-600)" : "3px solid transparent",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}
        >
          <Calendar size={16} />
          College Events ({collegeEvents.length})
        </button>

        <button
          onClick={() => setActiveTab("teams")}
          style={{
            background: "none",
            border: "none",
            padding: "8px 16px",
            fontSize: "0.92rem",
            fontWeight: "700",
            cursor: "pointer",
            color: activeTab === "teams" ? "var(--primary-600)" : "var(--text-muted)",
            borderBottom: activeTab === "teams" ? "3px solid var(--primary-600)" : "3px solid transparent",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}
        >
          <Users size={16} />
          Event Team Management
        </button>
      </div>

      {/* 3. TAB 1: SMART STUDENT SEARCH */}
      {activeTab === "search" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Multi-Filter Bar Card */}
          <div className="card" style={{ padding: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
              <Filter size={18} color="var(--primary-600)" />
              <h3 style={{ fontSize: "0.95rem", fontWeight: "700" }}>Smart Talent Search & Multi-Filters</h3>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "14px" }}>
              {/* Department */}
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontSize: "0.78rem" }}>Department</label>
                <select
                  className="form-control"
                  style={{ padding: "8px 10px", fontSize: "0.82rem" }}
                  value={filterDept}
                  onChange={(e) => setFilterDept(e.target.value)}
                >
                  <option value="All">All Departments</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>{d.name.split("(")[0]}</option>
                  ))}
                </select>
              </div>

              {/* Year */}
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontSize: "0.78rem" }}>Academic Year</label>
                <select
                  className="form-control"
                  style={{ padding: "8px 10px", fontSize: "0.82rem" }}
                  value={filterYear}
                  onChange={(e) => setFilterYear(e.target.value)}
                >
                  <option value="All">All Years</option>
                  <option value="First Year">First Year</option>
                  <option value="Second Year">Second Year</option>
                  <option value="Third Year">Third Year</option>
                  <option value="Final Year">Final Year</option>
                </select>
              </div>

              {/* Category */}
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontSize: "0.78rem" }}>Category</label>
                <select
                  className="form-control"
                  style={{ padding: "8px 10px", fontSize: "0.82rem" }}
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                >
                  <option value="All">All Categories</option>
                  <option value="Sports">Sports</option>
                  <option value="Cultural">Cultural</option>
                  <option value="Event & Management">Event & Management</option>
                  <option value="Technical">Technical</option>
                </select>
              </div>

              {/* Skill Search input */}
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontSize: "0.78rem" }}>Skill Keyword</label>
                <input
                  type="text"
                  className="form-control"
                  style={{ padding: "8px 10px", fontSize: "0.82rem" }}
                  placeholder="e.g. Anchoring, Cricket, Dance..."
                  value={filterSkill}
                  onChange={(e) => setFilterSkill(e.target.value)}
                />
              </div>

              {/* Minimum Skill Level */}
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontSize: "0.78rem" }}>Min Proficiency</label>
                <select
                  className="form-control"
                  style={{ padding: "8px 10px", fontSize: "0.82rem" }}
                  value={filterLevel}
                  onChange={(e) => setFilterLevel(e.target.value)}
                >
                  <option value="All">Any Level</option>
                  <option value="Intermediate">Intermediate+</option>
                  <option value="Advanced">Advanced+</option>
                  <option value="Expert">Expert Only</option>
                </select>
              </div>

              {/* Availability */}
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontSize: "0.78rem" }}>Availability</label>
                <select
                  className="form-control"
                  style={{ padding: "8px 10px", fontSize: "0.82rem" }}
                  value={filterAvailability}
                  onChange={(e) => setFilterAvailability(e.target.value)}
                >
                  <option value="All">All Students</option>
                  <option value="Available">Available for Events</option>
                  <option value="Unavailable">Unavailable</option>
                </select>
              </div>
            </div>

            {/* Quick Reset */}
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "12px" }}>
              <button
                onClick={() => {
                  setFilterDept("All");
                  setFilterYear("All");
                  setFilterCategory("All");
                  setFilterSkill("");
                  setFilterLevel("All");
                  setFilterAvailability("All");
                }}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--primary-600)",
                  fontSize: "0.8rem",
                  fontWeight: "600",
                  cursor: "pointer"
                }}
              >
                Reset All Filters
              </button>
            </div>
          </div>

          {/* Result Cards Grid */}
          {matchingStudents.length === 0 ? (
            <div className="card" style={{ padding: "48px 24px", textAlign: "center" }}>
              <Search size={42} color="var(--text-light)" style={{ margin: "0 auto 12px auto" }} />
              <h4 style={{ fontSize: "1.1rem", fontWeight: "700" }}>No Students Found Matching Filters</h4>
              <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", maxWidth: "420px", margin: "8px auto 0 auto" }}>
                Try adjusting your criteria, skill name, or proficiency requirement to view available student talent.
              </p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: "20px" }}>
              {matchingStudents.map((stu) => {
                const isShortlisted = shortlistedStudentIds.has(stu.id);
                const hasHealth = !!stu.healthRecord;

                return (
                  <div
                    key={stu.id}
                    className="card"
                    style={{
                      padding: "20px",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      gap: "16px",
                      border: isShortlisted ? "2px solid var(--primary-600)" : "1px solid var(--border-subtle)"
                    }}
                  >
                    <div>
                      {/* Card Top: Avatar, Name, Year & Dept */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          {stu.avatar ? (
                            <img
                              src={stu.avatar}
                              alt={stu.name}
                              style={{ width: "48px", height: "48px", borderRadius: "50%", objectFit: "cover" }}
                            />
                          ) : (
                            <div
                              style={{
                                width: "48px",
                                height: "48px",
                                borderRadius: "50%",
                                background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                                color: "white",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontWeight: "800",
                                fontSize: "1.1rem"
                              }}
                            >
                              {stu.name[0]}
                            </div>
                          )}

                          <div>
                            <h4 style={{ fontSize: "1.05rem", fontWeight: "800", color: "var(--text-main)" }}>
                              {stu.name}
                            </h4>
                            <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                              {stu.departmentName || "Electronics (VLSI)"} • {stu.year || "Third Year"}
                            </div>
                          </div>
                        </div>

                        <span
                          style={{
                            padding: "3px 8px",
                            borderRadius: "10px",
                            fontSize: "0.72rem",
                            fontWeight: "700",
                            background: stu.skills.some((s) => s.availableForEvents === "Yes") ? "var(--success-bg)" : "var(--danger-bg)",
                            color: stu.skills.some((s) => s.availableForEvents === "Yes") ? "var(--success-text)" : "var(--danger-text)"
                          }}
                        >
                          {stu.skills.some((s) => s.availableForEvents === "Yes") ? "Available" : "Unavailable"}
                        </span>
                      </div>

                      {/* Skills Chips with Emojis & Levels */}
                      <div style={{ marginTop: "14px" }}>
                        <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: "700", marginBottom: "6px" }}>
                          Skills & Proficiency:
                        </div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                          {stu.skills.length === 0 ? (
                            <span style={{ fontSize: "0.8rem", color: "var(--text-light)" }}>No skills declared yet</span>
                          ) : (
                            stu.skills.map((s) => (
                              <span
                                key={s.id}
                                style={{
                                  background: "var(--bg-surface-secondary)",
                                  border: "1px solid var(--border-subtle)",
                                  borderRadius: "6px",
                                  padding: "3px 8px",
                                  fontSize: "0.78rem",
                                  fontWeight: "600",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "5px"
                                }}
                              >
                                <span>{getSkillEmoji(s.category, s.skill)}</span>
                                <span>{s.skill}</span>
                                <span style={{ color: "var(--primary-700)", fontSize: "0.7rem", fontWeight: "700" }}>
                                  ({s.skillLevel})
                                </span>
                              </span>
                            ))
                          )}
                        </div>
                      </div>

                      {/* Experience Scope */}
                      {stu.skills.length > 0 && (
                        <div style={{ marginTop: "10px", fontSize: "0.78rem", color: "var(--text-muted)" }}>
                          <strong>Experience:</strong> {stu.skills.map((s) => s.experienceLevel).filter((v, i, a) => a.indexOf(v) === i).join(" • ")}
                        </div>
                      )}

                      {/* Health Alert Indicator (Discreet & Protected) */}
                      {hasHealth && (
                        <div
                          style={{
                            marginTop: "12px",
                            padding: "8px 12px",
                            borderRadius: "6px",
                            background: "#fffbeb",
                            border: "1px solid #fef3c7",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center"
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.75rem", color: "#92400e", fontWeight: "700" }}>
                            <AlertTriangle size={14} color="#d97706" />
                            <span>Health Information Available</span>
                          </div>
                          <button
                            onClick={() => handleViewHealthDetails(stu.healthRecord)}
                            style={{
                              background: "none",
                              border: "none",
                              color: "#b45309",
                              fontSize: "0.72rem",
                              fontWeight: "700",
                              cursor: "pointer",
                              textDecoration: "underline"
                            }}
                          >
                            View (Authorized)
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons: View Profile, Invite, Shortlist, Contact */}
                    <div
                      style={{
                        borderTop: "1px solid var(--border-subtle)",
                        paddingTop: "12px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "6px",
                        flexWrap: "wrap"
                      }}
                    >
                      <button
                        onClick={() => {
                          setViewingStudent(stu);
                          setProfileModalOpen(true);
                        }}
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: "0.78rem" }}
                      >
                        <Eye size={14} /> Profile
                      </button>

                      <button
                        onClick={() => toggleShortlist(stu.id)}
                        className="btn btn-secondary btn-sm"
                        style={{
                          fontSize: "0.78rem",
                          background: isShortlisted ? "var(--primary-50)" : undefined,
                          borderColor: isShortlisted ? "var(--primary-500)" : undefined,
                          color: isShortlisted ? "var(--primary-700)" : undefined
                        }}
                      >
                        <UserCheck size={14} /> {isShortlisted ? "Shortlisted" : "Shortlist"}
                      </button>

                      <button
                        onClick={() => handleOpenInviteModal(stu)}
                        className="btn btn-primary btn-sm"
                        style={{ fontSize: "0.78rem" }}
                      >
                        <Send size={14} /> Invite
                      </button>

                      <a
                        href={`mailto:${stu.email}`}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: "6px 8px" }}
                        title={`Email ${stu.name}`}
                      >
                        <Mail size={14} />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 4. TAB 2: COLLEGE EVENTS */}
      {activeTab === "events" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {collegeEvents.map((evt) => (
            <div
              key={evt.id}
              className="card"
              style={{
                padding: "24px",
                display: "flex",
                flexDirection: "column",
                gap: "16px"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                    <span
                      style={{
                        padding: "3px 10px",
                        borderRadius: "12px",
                        fontSize: "0.75rem",
                        fontWeight: "700",
                        background: "#dbeafe",
                        color: "#1e40af"
                      }}
                    >
                      {evt.category}
                    </span>
                    <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                      Deadline: <strong>{evt.registrationDeadline || "Open"}</strong>
                    </span>
                  </div>

                  <h3 style={{ fontSize: "1.3rem", fontWeight: "800", color: "var(--text-main)" }}>
                    {evt.eventName}
                  </h3>

                  <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", marginTop: "4px" }}>
                    {evt.description}
                  </p>
                </div>

                <div style={{ textAlign: "right" }}>
                  <span
                    style={{
                      padding: "4px 12px",
                      borderRadius: "12px",
                      fontSize: "0.75rem",
                      fontWeight: "700",
                      background: "var(--success-bg)",
                      color: "var(--success-text)"
                    }}
                  >
                    {evt.status}
                  </span>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "6px" }}>
                    Required: <strong>{evt.requiredStudents} Students</strong>
                  </div>
                </div>
              </div>

              {/* Event Metadata Bar */}
              <div
                style={{
                  background: "var(--bg-surface-secondary)",
                  borderRadius: "8px",
                  padding: "12px 16px",
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "24px",
                  fontSize: "0.82rem"
                }}
              >
                <div>
                  <span style={{ color: "var(--text-muted)" }}>Date & Time: </span>
                  <strong>{evt.date} ({evt.startTime} – {evt.endTime})</strong>
                </div>
                <div>
                  <span style={{ color: "var(--text-muted)" }}>Venue: </span>
                  <strong>{evt.venue}</strong>
                </div>
                <div>
                  <span style={{ color: "var(--text-muted)" }}>Coordinator: </span>
                  <strong>{evt.coordinatorName} ({evt.coordinatorPhone})</strong>
                </div>
              </div>

              {/* Required Skills Chips */}
              <div>
                <div style={{ fontSize: "0.75rem", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "6px" }}>
                  Required Skills:
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {(evt.requiredSkills || []).map((req, idx) => (
                    <span
                      key={idx}
                      style={{
                        background: "white",
                        border: "1px solid var(--border-subtle)",
                        borderRadius: "6px",
                        padding: "4px 10px",
                        fontSize: "0.8rem",
                        fontWeight: "600",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px"
                      }}
                    >
                      <span>{getSkillEmoji(req.category, req.skill)}</span>
                      <span>{req.skill}</span>
                      <span style={{ color: "var(--primary-600)", fontSize: "0.74rem" }}>
                        ({req.minSkillLevel}+ • {req.requiredCount} needed)
                      </span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", borderTop: "1px solid var(--border-subtle)", paddingTop: "12px" }}>
                <button
                  onClick={() => {
                    setSelectedEventForTeam(evt.id);
                    setActiveTab("teams");
                  }}
                  className="btn btn-secondary btn-sm"
                >
                  <Users size={14} /> View Team & Invitations
                </button>
                <button
                  onClick={() => {
                    setFilterCategory(evt.category === "Technical" ? "Technical" : "All");
                    setActiveTab("search");
                  }}
                  className="btn btn-primary btn-sm"
                >
                  <Search size={14} /> Find Students for this Event
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 5. TAB 3: EVENT TEAM MANAGEMENT */}
      {activeTab === "teams" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Event Picker */}
          <div className="card" style={{ padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontWeight: "700", fontSize: "0.9rem" }}>Select Event:</span>
              <select
                className="form-control"
                style={{ width: "auto", minWidth: "260px" }}
                value={selectedEventForTeam}
                onChange={(e) => setSelectedEventForTeam(e.target.value)}
              >
                {collegeEvents.map((evt) => (
                  <option key={evt.id} value={evt.id}>{evt.eventName} ({evt.date})</option>
                ))}
              </select>
            </div>

            <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
              Coordinator: <strong>{currentEventForTeamObj?.coordinatorName}</strong>
            </div>
          </div>

          {/* Invitations Status Tracker */}
          <div className="card" style={{ padding: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ fontSize: "1rem", fontWeight: "700" }}>
                Invitations & Responses ({eventInvs.length})
              </h3>
              <div style={{ display: "flex", gap: "12px", fontSize: "0.78rem" }}>
                <span style={{ color: "var(--primary-700)", fontWeight: "600" }}>
                  • Invited: {eventInvs.filter((i) => i.status === "Invited").length}
                </span>
                <span style={{ color: "var(--success-text)", fontWeight: "600" }}>
                  • Accepted: {eventInvs.filter((i) => i.status === "Accepted").length}
                </span>
                <span style={{ color: "var(--danger-text)", fontWeight: "600" }}>
                  • Declined: {eventInvs.filter((i) => i.status === "Declined").length}
                </span>
              </div>
            </div>

            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Invited Role</th>
                    <th>Skill</th>
                    <th>Status</th>
                    <th>Response Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {eventInvs.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: "center", color: "var(--text-muted)", padding: "24px" }}>
                        No students invited for this event yet. Use "Find Students" to send invitations.
                      </td>
                    </tr>
                  ) : (
                    eventInvs.map((inv) => (
                      <tr key={inv.id}>
                        <td>
                          <strong>{inv.studentName}</strong>
                        </td>
                        <td>{inv.role}</td>
                        <td>{inv.skill}</td>
                        <td>
                          <span
                            style={{
                              padding: "2px 8px",
                              borderRadius: "10px",
                              fontSize: "0.74rem",
                              fontWeight: "700",
                              background:
                                inv.status === "Accepted" ? "var(--success-bg)" :
                                inv.status === "Declined" ? "var(--danger-bg)" : "#dbeafe",
                              color:
                                inv.status === "Accepted" ? "var(--success-text)" :
                                inv.status === "Declined" ? "var(--danger-text)" : "#1e40af"
                            }}
                          >
                            {inv.status}
                          </span>
                        </td>
                        <td style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                          {inv.responseDate ? new Date(inv.responseDate).toLocaleDateString() : "Pending"}
                          {inv.declineReason && (
                            <div style={{ color: "var(--danger-text)", fontSize: "0.72rem" }}>
                              Reason: {inv.declineReason}
                            </div>
                          )}
                        </td>
                        <td>
                          {inv.status === "Accepted" && (
                            <button
                              onClick={() => {
                                const newRole = prompt(`Assign specific team role for ${inv.studentName}:`, inv.role);
                                if (newRole) {
                                  assignEventTeamMember({
                                    eventId: inv.eventId,
                                    studentId: inv.studentId,
                                    role: newRole
                                  });
                                }
                              }}
                              className="btn btn-secondary btn-sm"
                              style={{ fontSize: "0.72rem" }}
                            >
                              Assign Team Role
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Official Assigned Team Roster */}
          <div className="card" style={{ padding: "20px" }}>
            <h3 style={{ fontSize: "1rem", fontWeight: "700", marginBottom: "16px" }}>
              Official Event Management Team ({eventTeams.length} Members)
            </h3>

            {eventTeams.length === 0 ? (
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                No students officially assigned to the team yet. Once students accept invitations, coordinators can assign them specific responsibilities.
              </p>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "14px" }}>
                {eventTeams.map((mem) => (
                  <div
                    key={mem.id}
                    style={{
                      padding: "14px",
                      borderRadius: "8px",
                      background: "var(--bg-surface-secondary)",
                      border: "1px solid var(--border-subtle)",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center"
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: "700", fontSize: "0.9rem" }}>{mem.studentName}</div>
                      <div style={{ fontSize: "0.78rem", color: "var(--primary-700)", fontWeight: "600", marginTop: "2px" }}>
                        Role: {mem.assignedRole}
                      </div>
                    </div>
                    <button
                      onClick={() => removeEventTeamMember({ eventId: mem.eventId, studentId: mem.studentId })}
                      style={{ background: "none", border: "none", color: "var(--danger-solid)", cursor: "pointer", padding: "4px" }}
                      title="Remove Member"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 6. CREATE EVENT MODAL */}
      <Modal
        isOpen={createEventModalOpen}
        onClose={() => setCreateEventModalOpen(false)}
        title="Create New College Event"
        maxWidth="680px"
      >
        <form onSubmit={handleCreateEventSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div className="form-group">
            <label className="form-label">Event Name *</label>
            <input
              type="text"
              className="form-control"
              required
              placeholder="e.g. Engineer's Day 2026, Annual Gathering 'Tarang', Inter-College Hackathon"
              value={eventFormData.eventName}
              onChange={(e) => setEventFormData({ ...eventFormData, eventName: e.target.value })}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <div className="form-group">
              <label className="form-label">Event Category</label>
              <select
                className="form-control"
                value={eventFormData.category}
                onChange={(e) => setEventFormData({ ...eventFormData, category: e.target.value })}
              >
                {EVENT_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Target Department</label>
              <select
                className="form-control"
                value={eventFormData.department}
                onChange={(e) => setEventFormData({ ...eventFormData, department: e.target.value })}
              >
                <option value="All">All Departments</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.name}>{d.name.split("(")[0]}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-control"
              rows={2}
              placeholder="Brief summary of the event purpose and key activities..."
              value={eventFormData.description}
              onChange={(e) => setEventFormData({ ...eventFormData, description: e.target.value })}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
            <div className="form-group">
              <label className="form-label">Event Date *</label>
              <input
                type="date"
                className="form-control"
                required
                value={eventFormData.date}
                onChange={(e) => setEventFormData({ ...eventFormData, date: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Start Time</label>
              <input
                type="text"
                className="form-control"
                placeholder="09:30 AM"
                value={eventFormData.startTime}
                onChange={(e) => setEventFormData({ ...eventFormData, startTime: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">End Time</label>
              <input
                type="text"
                className="form-control"
                placeholder="05:00 PM"
                value={eventFormData.endTime}
                onChange={(e) => setEventFormData({ ...eventFormData, endTime: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "14px" }}>
            <div className="form-group">
              <label className="form-label">Venue *</label>
              <input
                type="text"
                className="form-control"
                required
                placeholder="Auditorium, Ground, Seminar Hall 1"
                value={eventFormData.venue}
                onChange={(e) => setEventFormData({ ...eventFormData, venue: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Students Required</label>
              <input
                type="number"
                className="form-control"
                min={1}
                value={eventFormData.requiredStudents}
                onChange={(e) => setEventFormData({ ...eventFormData, requiredStudents: e.target.value })}
              />
            </div>
          </div>

          {/* Required Skills Dynamic Section */}
          <div className="form-group">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <label className="form-label" style={{ margin: 0 }}>Required Skills</label>
              <button
                type="button"
                onClick={handleAddEventSkillField}
                style={{ background: "none", border: "none", color: "var(--primary-600)", fontSize: "0.8rem", fontWeight: "700", cursor: "pointer" }}
              >
                + Add Required Skill
              </button>
            </div>

            {eventFormData.requiredSkills.map((req, idx) => (
              <div key={idx} style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 80px 30px", gap: "8px", marginBottom: "8px", alignItems: "center" }}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Anchoring, Photography"
                  value={req.skill}
                  onChange={(e) => {
                    const updated = [...eventFormData.requiredSkills];
                    updated[idx].skill = e.target.value;
                    setEventFormData({ ...eventFormData, requiredSkills: updated });
                  }}
                />
                <select
                  className="form-control"
                  value={req.minSkillLevel}
                  onChange={(e) => {
                    const updated = [...eventFormData.requiredSkills];
                    updated[idx].minSkillLevel = e.target.value;
                    setEventFormData({ ...eventFormData, requiredSkills: updated });
                  }}
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Expert">Expert</option>
                </select>
                <input
                  type="number"
                  className="form-control"
                  placeholder="Count"
                  min={1}
                  value={req.requiredCount}
                  onChange={(e) => {
                    const updated = [...eventFormData.requiredSkills];
                    updated[idx].requiredCount = Number(e.target.value);
                    setEventFormData({ ...eventFormData, requiredSkills: updated });
                  }}
                />
                {eventFormData.requiredSkills.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveEventSkillField(idx)}
                    style={{ background: "none", border: "none", color: "var(--danger-solid)", cursor: "pointer" }}
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "8px" }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setCreateEventModalOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Schedule Event
            </button>
          </div>
        </form>
      </Modal>

      {/* 7. INVITATION DISPATCH MODAL */}
      <Modal
        isOpen={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        title={selectedStudentForInvite ? `Invite ${selectedStudentForInvite.name} for Event` : "Send Invitation"}
        maxWidth="500px"
      >
        <form onSubmit={handleSendInvite} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {selectedStudentForInvite?.healthRecord && (
            <div
              style={{
                padding: "12px",
                borderRadius: "8px",
                background: "#fffbeb",
                border: "1px solid #fde68a",
                fontSize: "0.82rem",
                color: "#92400e"
              }}
            >
              <strong>Safety Reminder:</strong> This student has a declared health profile. Please review any physical activity guidelines before confirming high-intensity or outdoor role assignments.
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Select Event *</label>
            <select
              className="form-control"
              required
              value={selectedEventIdForInvite}
              onChange={(e) => setSelectedEventIdForInvite(e.target.value)}
            >
              {collegeEvents.map((evt) => (
                <option key={evt.id} value={evt.id}>{evt.eventName} ({evt.date})</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Invited Role / Responsibility *</label>
            <input
              type="text"
              className="form-control"
              required
              placeholder="e.g. Lead Anchor, Stage Coordinator, Official Photographer"
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Personalized Instructions / Notes</label>
            <textarea
              className="form-control"
              rows={2}
              placeholder="e.g. Please bring your camera setup for morning session briefing."
              value={inviteNotes}
              onChange={(e) => setInviteNotes(e.target.value)}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setInviteModalOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Send Official Invitation
            </button>
          </div>
        </form>
      </Modal>

      {/* 8. STUDENT DETAILED PROFILE MODAL */}
      <Modal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        title={viewingStudent ? `${viewingStudent.name} – Talent Portfolio` : "Student Profile"}
        maxWidth="620px"
      >
        {viewingStudent && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "14px", paddingBottom: "14px", borderBottom: "1px solid var(--border-subtle)" }}>
              {viewingStudent.avatar ? (
                <img
                  src={viewingStudent.avatar}
                  alt={viewingStudent.name}
                  style={{ width: "60px", height: "60px", borderRadius: "50%", objectFit: "cover" }}
                />
              ) : (
                <div
                  style={{
                    width: "60px",
                    height: "60px",
                    borderRadius: "50%",
                    background: "var(--primary-600)",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "800",
                    fontSize: "1.3rem"
                  }}
                >
                  {viewingStudent.name[0]}
                </div>
              )}
              <div>
                <h3 style={{ fontSize: "1.2rem", fontWeight: "800" }}>{viewingStudent.name}</h3>
                <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                  {viewingStudent.departmentName} • {viewingStudent.year} (Sem {viewingStudent.semester})
                </div>
                <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "2px" }}>
                  PRN: {viewingStudent.prn || viewingStudent.id} • Email: {viewingStudent.email}
                </div>
              </div>
            </div>

            <div>
              <h4 style={{ fontSize: "0.95rem", fontWeight: "700", marginBottom: "10px" }}>Recorded Talents & Skills:</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {viewingStudent.skills.map((s) => (
                  <div
                    key={s.id}
                    style={{
                      padding: "12px 14px",
                      borderRadius: "8px",
                      background: "var(--bg-surface-secondary)",
                      border: "1px solid var(--border-subtle)"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: "700" }}>
                        <span>{getSkillEmoji(s.category, s.skill)}</span>
                        <span>{s.skill}</span>
                        <span style={{ fontSize: "0.75rem", color: "var(--primary-700)", fontWeight: "600" }}>
                          • {s.skillLevel}
                        </span>
                      </div>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: "600" }}>
                        {s.experienceLevel}
                      </span>
                    </div>
                    {s.experienceDescription && (
                      <p style={{ fontSize: "0.82rem", color: "var(--text-main)", marginTop: "6px" }}>
                        "{s.experienceDescription}"
                      </p>
                    )}
                    {s.achievements && s.achievements.length > 0 && (
                      <div style={{ fontSize: "0.76rem", color: "var(--text-muted)", marginTop: "4px" }}>
                        Awards: {s.achievements.join(", ")}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* 9. AUTHORIZED HEALTH INFORMATION MODAL */}
      <Modal
        isOpen={healthModalOpen}
        onClose={() => setHealthModalOpen(false)}
        title="Confidential Medical & Safety Advisory"
        maxWidth="540px"
      >
        {selectedHealthRecord && (
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div
              style={{
                padding: "12px",
                borderRadius: "8px",
                background: "#fef2f2",
                border: "1px solid #fecaca",
                color: "#991b1b",
                fontSize: "0.82rem"
              }}
            >
              <strong>Confidential Access:</strong> This medical information is provided under institutional privacy policy solely for student safety during college events. Do NOT redistribute or share publicly.
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "0.85rem" }}>
              <div>
                <span style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>Student:</span>
                <div style={{ fontWeight: "700" }}>{selectedHealthRecord.studentName}</div>
              </div>
              <div>
                <span style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>Condition Category:</span>
                <div style={{ fontWeight: "700", color: "#b91c1c" }}>{selectedHealthRecord.conditionCategory}</div>
              </div>
            </div>

            <div>
              <span style={{ color: "var(--text-muted)", fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase" }}>
                Condition Description:
              </span>
              <p style={{ fontSize: "0.85rem", background: "var(--bg-surface-secondary)", padding: "10px", borderRadius: "6px", marginTop: "4px" }}>
                {selectedHealthRecord.description}
              </p>
            </div>

            <div>
              <span style={{ color: "var(--text-muted)", fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase" }}>
                Emergency Instructions:
              </span>
              <p style={{ fontSize: "0.85rem", background: "#fef2f2", border: "1px solid #fecaca", padding: "10px", borderRadius: "6px", marginTop: "4px", color: "#991b1b" }}>
                {selectedHealthRecord.emergencyInstructions}
              </p>
            </div>

            <div style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
              Emergency Contact (Parent): <strong>{selectedHealthRecord.parentName} ({selectedHealthRecord.parentContact})</strong>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "10px" }}>
              <button onClick={() => setHealthModalOpen(false)} className="btn btn-secondary">
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

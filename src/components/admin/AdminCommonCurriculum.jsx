import React, { useState } from "react";
import { useSmartCampus } from "../../context/SmartCampusContext";
import {
  BookOpen,
  PlusCircle,
  Edit,
  Trash2,
  Calendar,
  Layers,
  Award,
  Clock,
  UserCheck,
  Building2,
  CheckCircle2,
  Search,
  Filter,
  Users,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CalendarDays,
  FileSpreadsheet,
  Info,
  MapPin,
  ExternalLink
} from "lucide-react";
import { Badge, Modal, StatCard } from "../common/UIPrimitives";

export default function AdminCommonCurriculum() {
  const {
    subjects,
    departments,
    users,
    timetables,
    addCommonSubject,
    updateCommonSubject,
    deleteCommonSubject,
    addTimetableSlot,
    assignCommonSubjectFaculty,
    commonSubjectBranchFaculty
  } = useSmartCampus();

  // Filters
  const [selectedSemTab, setSelectedSemTab] = useState("all"); // "all" | "1" | "2"
  const [selectedType, setSelectedType] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("cards"); // "cards" | "table"

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [deletingSubject, setDeletingSubject] = useState(null);
  const [timetableSubject, setTimetableSubject] = useState(null);
  const [showBranchMatrix, setShowBranchMatrix] = useState(false);
  const [selectedMatrixSubId, setSelectedMatrixSubId] = useState("sub-fy101");
  const [matrixActiveTab, setMatrixActiveTab] = useState("faculty"); // "faculty" | "inheritance"

  // Form State for Add / Edit
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    semester: 1,
    credits: 3,
    type: "Theory",
    teacherId: "tea-1",
    teacherName: "Prof. T. A. Mohije",
    room: "Smart Classroom C-101",
    weeklyHours: 3,
    description: "",
    academic_year: "2026-27"
  });

  // Form State for Timetable Assignment
  const [timetableForm, setTimetableForm] = useState({
    day: "Monday",
    time: "10:00 AM - 11:00 AM",
    startTime: "10:00 AM",
    endTime: "11:00 AM",
    division: "A",
    room: "Smart Classroom C-101"
  });

  const teachers = users.filter((u) => u.role === "teacher");

  // Filter common subjects
  const commonSubjects = subjects.filter((s) => s.is_common_subject);

  const filteredSubjects = commonSubjects.filter((sub) => {
    const matchesSearch =
      sub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (sub.teacherName && sub.teacherName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (sub.room && sub.room.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesSem = selectedSemTab === "all" || sub.semester === Number(selectedSemTab);
    const matchesType = selectedType === "all" || sub.type === selectedType;

    return matchesSearch && matchesSem && matchesType;
  });

  // Calculate stats
  const totalCommon = commonSubjects.length;
  const sem1Count = commonSubjects.filter((s) => s.semester === 1).length;
  const sem2Count = commonSubjects.filter((s) => s.semester === 2).length;
  const sem1Credits = commonSubjects.filter((s) => s.semester === 1).reduce((acc, s) => acc + (s.credits || 0), 0);
  const sem2Credits = commonSubjects.filter((s) => s.semester === 2).reduce((acc, s) => acc + (s.credits || 0), 0);

  // Handlers
  const handleOpenAdd = () => {
    const defaultSem = selectedSemTab === "2" ? 2 : 1;
    const firstTeacher = teachers[0] || { id: "tea-1", name: "Prof. T. A. Mohije" };

    setFormData({
      name: "",
      code: defaultSem === 1 ? "BS-10" + (sem1Count + 1) : "BS-20" + (sem2Count + 1),
      semester: defaultSem,
      credits: 3,
      type: "Theory",
      teacherId: firstTeacher.id,
      teacherName: firstTeacher.name,
      room: defaultSem === 1 ? "Classroom C-101" : "Classroom C-102",
      weeklyHours: 3,
      description: "",
      academic_year: "2026-27"
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (sub) => {
    setEditingSubject(sub);
    setFormData({
      name: sub.name,
      code: sub.code,
      semester: sub.semester || 1,
      credits: sub.credits || 3,
      type: sub.type || "Theory",
      teacherId: sub.teacherId || "tea-1",
      teacherName: sub.teacherName || "Prof. T. A. Mohije",
      room: sub.room || "Smart Classroom C-101",
      weeklyHours: sub.weeklyHours || 3,
      description: sub.description || "",
      academic_year: sub.academic_year || "2026-27"
    });
  };

  const handleSaveAdd = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.code) return;

    const assignedTeacher = teachers.find((t) => t.id === formData.teacherId);
    addCommonSubject({
      ...formData,
      teacherName: assignedTeacher ? assignedTeacher.name : formData.teacherName
    });
    setIsAddModalOpen(false);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editingSubject) return;

    const assignedTeacher = teachers.find((t) => t.id === formData.teacherId);
    updateCommonSubject(editingSubject.id, {
      ...formData,
      teacherName: assignedTeacher ? assignedTeacher.name : formData.teacherName
    });
    setEditingSubject(null);
  };

  const handleConfirmDelete = () => {
    if (deletingSubject) {
      deleteCommonSubject(deletingSubject.id);
      setDeletingSubject(null);
    }
  };

  const handleOpenTimetableModal = (sub) => {
    setTimetableSubject(sub);
    setTimetableForm({
      day: "Monday",
      time: "10:00 AM - 11:00 AM",
      startTime: "10:00 AM",
      endTime: "11:00 AM",
      division: "A",
      room: sub.room || "Smart Classroom C-101"
    });
  };

  const handleSaveTimetableSlot = (e) => {
    e.preventDefault();
    if (!timetableSubject) return;

    addTimetableSlot({
      departmentId: "common",
      is_common_timetable: true,
      semester: timetableSubject.semester,
      division: timetableForm.division,
      classroom: timetableForm.room,
      day: timetableForm.day,
      time: timetableForm.time,
      startTime: timetableForm.startTime,
      endTime: timetableForm.endTime,
      subjectId: timetableSubject.id,
      subjectName: timetableSubject.name,
      subjectCode: timetableSubject.code,
      teacherId: timetableSubject.teacherId,
      teacherName: timetableSubject.teacherName,
      room: timetableForm.room,
      type: timetableSubject.type || "Theory",
      batch: "All"
    });

    setTimetableSubject(null);
  };

  // Get scheduled slots for a subject
  const getSubjectScheduledSlots = (subId) => {
    return (timetables || []).filter((t) => t.subjectId === subId);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Top Banner */}
      <div
        style={{
          background: "linear-gradient(135deg, #1e3a8a 0%, #1e1b4b 100%)",
          borderRadius: "16px",
          padding: "24px 32px",
          color: "white",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
          boxShadow: "0 10px 25px -5px rgba(30, 58, 138, 0.3)"
        }}
      >
        <div style={{ maxWidth: "680px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(59, 130, 246, 0.25)", border: "1px solid rgba(59, 130, 246, 0.4)", padding: "4px 12px", borderRadius: "20px", marginBottom: "10px" }}>
            <Sparkles size={14} color="#93c5fd" />
            <span style={{ fontSize: "0.78rem", fontWeight: "700", color: "#bfdbfe", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Central Academic Curriculum • Common First Year
            </span>
          </div>
          <h2 style={{ fontSize: "1.85rem", fontWeight: "800", color: "white", marginBottom: "8px" }}>
            First Year B.Tech Common Curriculum
          </h2>
          <p style={{ fontSize: "0.9rem", color: "#cbd5e1", lineHeight: 1.5 }}>
            Centralized common framework for <strong>Semester I (11 subjects)</strong> and <strong>Semester II (10 subjects)</strong>. Stored once in the database with universal inheritance across <strong>ALL {departments.length} engineering branches</strong> without duplicate records.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button
            onClick={() => setShowBranchMatrix(true)}
            className="btn"
            style={{
              background: "rgba(255, 255, 255, 0.15)",
              color: "white",
              border: "1px solid rgba(255, 255, 255, 0.25)",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 16px"
            }}
          >
            <Layers size={16} /> Branch Inheritance Matrix
          </button>
          <button
            onClick={handleOpenAdd}
            className="btn btn-primary"
            style={{
              background: "#3b82f6",
              color: "white",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 18px",
              boxShadow: "0 4px 14px rgba(59, 130, 246, 0.4)"
            }}
          >
            <PlusCircle size={16} /> Add Common Subject
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="stats-grid">
        <StatCard
          label="Total Common Subjects"
          value={totalCommon}
          subtext="Universal across all branches"
          icon={BookOpen}
          variant="primary"
        />
        <StatCard
          label="Semester I Curriculum"
          value={`${sem1Count} Subjects`}
          subtext={`${sem1Credits} Total B.Tech Credits`}
          icon={Award}
          variant="info"
        />
        <StatCard
          label="Semester II Curriculum"
          value={`${sem2Count} Subjects`}
          subtext={`${sem2Credits} Total B.Tech Credits`}
          icon={Award}
          variant="purple"
        />
        <StatCard
          label="Inheriting Branches"
          value={`${departments.length} Branches`}
          subtext="Zero Data Duplication"
          icon={Building2}
          variant="success"
        />
      </div>

      {/* Inheriting Branches Strip */}
      <div
        className="card"
        style={{
          background: "var(--bg-surface-secondary)",
          border: "1px solid var(--border-color)",
          padding: "16px 20px"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", marginBottom: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <ShieldCheck size={18} color="var(--primary-600)" />
            <span style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--text-main)" }}>
              Active Inheriting Engineering Branches (Auto-Mapped Central Hub):
            </span>
          </div>
          <span style={{ fontSize: "0.78rem", color: "var(--success-solid)", fontWeight: "600" }}>
            ✓ 100% In Sync (Updates reflect in real-time across all branches)
          </span>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
          {departments.map((dept) => (
            <span
              key={dept.id}
              style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border-color)",
                padding: "4px 10px",
                borderRadius: "6px",
                fontSize: "0.78rem",
                fontWeight: "600",
                color: "var(--text-main)",
                display: "inline-flex",
                alignItems: "center",
                gap: "5px"
              }}
            >
              <CheckCircle2 size={12} color="#10b981" />
              {dept.name} ({dept.code})
            </span>
          ))}
          <span
            style={{
              background: "rgba(59, 130, 246, 0.1)",
              border: "1px dashed #3b82f6",
              padding: "4px 10px",
              borderRadius: "6px",
              fontSize: "0.78rem",
              fontWeight: "700",
              color: "#2563eb",
              display: "inline-flex",
              alignItems: "center",
              gap: "5px"
            }}
          >
            + Future Engineering Departments
          </span>
        </div>
      </div>

      {/* Main Filter & Navigation Controls */}
      <div className="card" style={{ padding: "16px 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          {/* Semester Tabs */}
          <div style={{ display: "flex", background: "var(--bg-surface-secondary)", padding: "4px", borderRadius: "8px", gap: "4px" }}>
            <button
              onClick={() => setSelectedSemTab("all")}
              className={`btn btn-sm ${selectedSemTab === "all" ? "btn-primary" : "btn-ghost"}`}
              style={{ borderRadius: "6px" }}
            >
              All Common ({totalCommon})
            </button>
            <button
              onClick={() => setSelectedSemTab("1")}
              className={`btn btn-sm ${selectedSemTab === "1" ? "btn-primary" : "btn-ghost"}`}
              style={{ borderRadius: "6px" }}
            >
              Semester I ({sem1Count})
            </button>
            <button
              onClick={() => setSelectedSemTab("2")}
              className={`btn btn-sm ${selectedSemTab === "2" ? "btn-primary" : "btn-ghost"}`}
              style={{ borderRadius: "6px" }}
            >
              Semester II ({sem2Count})
            </button>
          </div>

          {/* Search and Filters */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
            <div style={{ position: "relative", minWidth: "240px" }}>
              <Search size={16} color="var(--text-muted)" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }} />
              <input
                type="text"
                placeholder="Search subject, code, faculty, room..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field"
                style={{ paddingLeft: "32px", fontSize: "0.85rem", height: "36px" }}
              />
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Filter size={15} color="var(--text-muted)" />
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="input-field"
                style={{ height: "36px", fontSize: "0.85rem", padding: "0 10px" }}
              >
                <option value="all">All Types</option>
                <option value="Theory">Theory Only</option>
                <option value="Lab">Lab Only</option>
                <option value="Practical">Practical</option>
              </select>
            </div>

            <div style={{ display: "flex", background: "var(--bg-surface-secondary)", padding: "3px", borderRadius: "6px" }}>
              <button
                onClick={() => setViewMode("cards")}
                className={`btn btn-sm ${viewMode === "cards" ? "btn-secondary" : "btn-ghost"}`}
                style={{ padding: "4px 8px", fontSize: "0.78rem" }}
              >
                Cards
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`btn btn-sm ${viewMode === "table" ? "btn-secondary" : "btn-ghost"}`}
                style={{ padding: "4px 8px", fontSize: "0.78rem" }}
              >
                Table
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Curriculum View */}
      {viewMode === "cards" ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: "20px" }}>
          {filteredSubjects.map((sub) => {
            const scheduledSlots = getSubjectScheduledSlots(sub.id);
            const isLab = sub.type === "Lab" || sub.type === "Practical";

            return (
              <div
                key={sub.id}
                className="card"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  borderTop: `4px solid ${sub.semester === 1 ? "#3b82f6" : "#8b5cf6"}`
                }}
              >
                <div>
                  {/* Top Bar */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                    <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                      <Badge variant={sub.semester === 1 ? "primary" : "purple"}>
                        Sem {sub.semester === 1 ? "I" : "II"}
                      </Badge>
                      <Badge variant={isLab ? "warning" : "success"}>
                        {sub.type}
                      </Badge>
                    </div>
                    <span style={{ fontSize: "0.78rem", fontWeight: "700", fontFamily: "monospace", color: "var(--text-muted)", background: "var(--bg-surface-secondary)", padding: "2px 8px", borderRadius: "4px" }}>
                      {sub.code}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 style={{ fontSize: "1.15rem", fontWeight: "700", color: "var(--text-main)", marginBottom: "6px" }}>
                    {sub.name}
                  </h3>

                  <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", lineHeight: 1.4, marginBottom: "16px" }}>
                    {sub.description || "Foundational engineering curriculum subject common for all B.Tech branches."}
                  </p>

                  {/* Meta Details */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", background: "var(--bg-surface-secondary)", padding: "12px", borderRadius: "8px", fontSize: "0.82rem", marginBottom: "16px" }}>
                    <div>
                      <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Credits</span>
                      <div style={{ fontWeight: "700", color: "var(--text-main)", marginTop: "2px" }}>
                        {sub.credits} Credits ({sub.weeklyHours || 3} hrs/wk)
                      </div>
                    </div>
                    <div>
                      <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Classroom / Lab</span>
                      <div style={{ fontWeight: "700", color: "var(--text-main)", marginTop: "2px", display: "flex", alignItems: "center", gap: "4px" }}>
                        <MapPin size={12} color="var(--primary-600)" />
                        {sub.room || "C-101"}
                      </div>
                    </div>
                    <div style={{ gridColumn: "span 2" }}>
                      <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Assigned Faculty</span>
                      <div style={{ fontWeight: "700", color: "var(--primary-600)", marginTop: "2px", display: "flex", alignItems: "center", gap: "4px" }}>
                        <UserCheck size={13} />
                        {sub.teacherName || "Unassigned"}
                      </div>
                    </div>
                  </div>

                  {/* Timetable Assignment Badge */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: "12px" }}>
                    <span>Scheduled Timetable Slots:</span>
                    <Badge variant={scheduledSlots.length > 0 ? "info" : "neutral"}>
                      {scheduledSlots.length > 0 ? `${scheduledSlots.length} Slots Active` : "Unscheduled"}
                    </Badge>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "12px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "6px" }}>
                  <div style={{ display: "flex", gap: "6px" }}>
                    <button
                      onClick={() => handleOpenTimetableModal(sub)}
                      className="btn btn-ghost btn-sm"
                      style={{ fontSize: "0.78rem", color: "var(--primary-600)", display: "flex", alignItems: "center", gap: "4px" }}
                    >
                      <Calendar size={14} /> Schedule
                    </button>
                    <button
                      onClick={() => {
                        setSelectedMatrixSubId(sub.id);
                        setMatrixActiveTab("faculty");
                        setShowBranchMatrix(true);
                      }}
                      className="btn btn-ghost btn-sm"
                      style={{ fontSize: "0.78rem", color: "#059669", display: "flex", alignItems: "center", gap: "4px" }}
                      title="Branch-Specific Faculty"
                    >
                      <Users size={14} /> Branch Faculty
                    </button>
                  </div>

                  <div style={{ display: "flex", gap: "6px" }}>
                    <button
                      onClick={() => handleOpenEdit(sub)}
                      className="btn btn-ghost btn-sm"
                      title="Edit Common Subject"
                      style={{ padding: "6px" }}
                    >
                      <Edit size={16} color="var(--primary-600)" />
                    </button>
                    <button
                      onClick={() => setDeletingSubject(sub)}
                      className="btn btn-ghost btn-sm"
                      title="Delete Subject"
                      style={{ padding: "6px" }}
                    >
                      <Trash2 size={16} color="var(--danger-solid)" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="card" style={{ padding: "0", overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table className="table" style={{ width: "100%", textAlign: "left", fontSize: "0.85rem" }}>
              <thead style={{ background: "var(--bg-surface-secondary)", borderBottom: "1px solid var(--border-color)" }}>
                <tr>
                  <th style={{ padding: "12px 16px" }}>Code</th>
                  <th style={{ padding: "12px 16px" }}>Subject Name</th>
                  <th style={{ padding: "12px 16px" }}>Semester</th>
                  <th style={{ padding: "12px 16px" }}>Type</th>
                  <th style={{ padding: "12px 16px" }}>Credits</th>
                  <th style={{ padding: "12px 16px" }}>Faculty</th>
                  <th style={{ padding: "12px 16px" }}>Room / Lab</th>
                  <th style={{ padding: "12px 16px" }}>Branches</th>
                  <th style={{ padding: "12px 16px", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubjects.map((sub) => (
                  <tr key={sub.id} style={{ borderBottom: "1px solid var(--border-color)" }}>
                    <td style={{ padding: "12px 16px", fontWeight: "700", fontFamily: "monospace" }}>
                      {sub.code}
                    </td>
                    <td style={{ padding: "12px 16px", fontWeight: "600", color: "var(--text-main)" }}>
                      {sub.name}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <Badge variant={sub.semester === 1 ? "primary" : "purple"}>
                        Sem {sub.semester === 1 ? "I" : "II"}
                      </Badge>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <Badge variant={sub.type === "Lab" ? "warning" : "success"}>
                        {sub.type}
                      </Badge>
                    </td>
                    <td style={{ padding: "12px 16px", fontWeight: "700" }}>
                      {sub.credits}
                    </td>
                    <td style={{ padding: "12px 16px", color: "var(--primary-600)", fontWeight: "500" }}>
                      {sub.teacherName || "Unassigned"}
                    </td>
                    <td style={{ padding: "12px 16px", color: "var(--text-muted)" }}>
                      {sub.room || "C-101"}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ fontSize: "0.75rem", background: "rgba(16, 185, 129, 0.1)", color: "#059669", padding: "2px 8px", borderRadius: "12px", fontWeight: "600" }}>
                        All {departments.length} Branches
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px", textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: "6px" }}>
                        <button
                          onClick={() => {
                            setSelectedMatrixSubId(sub.id);
                            setMatrixActiveTab("faculty");
                            setShowBranchMatrix(true);
                          }}
                          className="btn btn-ghost btn-sm"
                          title="Branch-Specific Faculty"
                        >
                          <Users size={14} color="#059669" />
                        </button>
                        <button
                          onClick={() => handleOpenTimetableModal(sub)}
                          className="btn btn-ghost btn-sm"
                          title="Assign Timetable"
                        >
                          <Calendar size={14} color="var(--primary-600)" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(sub)}
                          className="btn btn-ghost btn-sm"
                          title="Edit"
                        >
                          <Edit size={14} color="var(--primary-600)" />
                        </button>
                        <button
                          onClick={() => setDeletingSubject(sub)}
                          className="btn btn-ghost btn-sm"
                          title="Delete"
                        >
                          <Trash2 size={14} color="var(--danger-solid)" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: ADD COMMON SUBJECT */}
      {/* ========================================================= */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Common First Year Subject"
      >
        <form onSubmit={handleSaveAdd} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ background: "rgba(59, 130, 246, 0.1)", border: "1px solid #bfdbfe", padding: "10px 14px", borderRadius: "8px", fontSize: "0.82rem", color: "#1e3a8a" }}>
            <strong>Universal Inheritance:</strong> This subject will be automatically available to First Year students in <strong>all {departments.length} engineering branches</strong> without creating duplicate database records.
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label className="input-label">Semester *</label>
              <select
                value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: Number(e.target.value) })}
                className="input-field"
                required
              >
                <option value={1}>Semester I (FE - First Half)</option>
                <option value={2}>Semester II (FE - Second Half)</option>
              </select>
            </div>
            <div>
              <label className="input-label">Course Code *</label>
              <input
                type="text"
                placeholder="e.g. BS-101 or ES-102"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="input-field"
                required
              />
            </div>
          </div>

          <div>
            <label className="input-label">Subject Name *</label>
            <input
              type="text"
              placeholder="e.g. Engineering Mathematics-I"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input-field"
              required
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
            <div>
              <label className="input-label">Subject Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="input-field"
              >
                <option value="Theory">Theory</option>
                <option value="Lab">Lab / Practical</option>
                <option value="Practical">Workshop</option>
              </select>
            </div>
            <div>
              <label className="input-label">Credits</label>
              <input
                type="number"
                step="0.5"
                min="1"
                max="6"
                value={formData.credits}
                onChange={(e) => setFormData({ ...formData, credits: parseFloat(e.target.value) || 3 })}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="input-label">Weekly Hours</label>
              <input
                type="number"
                min="1"
                max="10"
                value={formData.weeklyHours}
                onChange={(e) => setFormData({ ...formData, weeklyHours: parseInt(e.target.value, 10) || 3 })}
                className="input-field"
                required
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label className="input-label">Assigned Faculty *</label>
              <select
                value={formData.teacherId}
                onChange={(e) => {
                  const tea = teachers.find((t) => t.id === e.target.value);
                  setFormData({
                    ...formData,
                    teacherId: e.target.value,
                    teacherName: tea ? tea.name : formData.teacherName
                  });
                }}
                className="input-field"
              >
                {teachers.map((tea) => (
                  <option key={tea.id} value={tea.id}>
                    {tea.name} ({tea.departmentName || "Faculty"})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="input-label">Classroom / Lab *</label>
              <input
                type="text"
                placeholder="e.g. Smart Classroom C-101 or Physics Lab 1"
                value={formData.room}
                onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                className="input-field"
                required
              />
            </div>
          </div>

          <div>
            <label className="input-label">Syllabus Overview / Description</label>
            <textarea
              rows={2}
              placeholder="Module overview, competencies, and learning outcomes..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input-field"
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "12px" }}>
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Common Subject
            </button>
          </div>
        </form>
      </Modal>

      {/* ========================================================= */}
      {/* MODAL: EDIT COMMON SUBJECT */}
      {/* ========================================================= */}
      <Modal
        isOpen={Boolean(editingSubject)}
        onClose={() => setEditingSubject(null)}
        title={`Edit Common Subject: ${editingSubject?.name}`}
      >
        <form onSubmit={handleSaveEdit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ background: "rgba(16, 185, 129, 0.1)", border: "1px solid #a7f3d0", padding: "10px 14px", borderRadius: "8px", fontSize: "0.82rem", color: "#065f46" }}>
            <strong>Central Sync Active:</strong> Any update made here will immediately update across all {departments.length} engineering branches and student timetables.
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label className="input-label">Semester</label>
              <select
                value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: Number(e.target.value) })}
                className="input-field"
                required
              >
                <option value={1}>Semester I</option>
                <option value={2}>Semester II</option>
              </select>
            </div>
            <div>
              <label className="input-label">Course Code</label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="input-field"
                required
              />
            </div>
          </div>

          <div>
            <label className="input-label">Subject Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input-field"
              required
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
            <div>
              <label className="input-label">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="input-field"
              >
                <option value="Theory">Theory</option>
                <option value="Lab">Lab / Practical</option>
                <option value="Practical">Workshop</option>
              </select>
            </div>
            <div>
              <label className="input-label">Credits</label>
              <input
                type="number"
                step="0.5"
                min="1"
                max="6"
                value={formData.credits}
                onChange={(e) => setFormData({ ...formData, credits: parseFloat(e.target.value) || 3 })}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="input-label">Weekly Hours</label>
              <input
                type="number"
                min="1"
                max="10"
                value={formData.weeklyHours}
                onChange={(e) => setFormData({ ...formData, weeklyHours: parseInt(e.target.value, 10) || 3 })}
                className="input-field"
                required
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label className="input-label">Assigned Faculty</label>
              <select
                value={formData.teacherId}
                onChange={(e) => {
                  const tea = teachers.find((t) => t.id === e.target.value);
                  setFormData({
                    ...formData,
                    teacherId: e.target.value,
                    teacherName: tea ? tea.name : formData.teacherName
                  });
                }}
                className="input-field"
              >
                {teachers.map((tea) => (
                  <option key={tea.id} value={tea.id}>
                    {tea.name} ({tea.departmentName || "Faculty"})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="input-label">Classroom / Lab</label>
              <input
                type="text"
                value={formData.room}
                onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                className="input-field"
                required
              />
            </div>
          </div>

          <div>
            <label className="input-label">Description / Syllabus</label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input-field"
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "12px" }}>
            <button
              type="button"
              onClick={() => setEditingSubject(null)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Update Across All Branches
            </button>
          </div>
        </form>
      </Modal>

      {/* ========================================================= */}
      {/* MODAL: ASSIGN TIMETABLE SLOT */}
      {/* ========================================================= */}
      <Modal
        isOpen={Boolean(timetableSubject)}
        onClose={() => setTimetableSubject(null)}
        title={`Assign Timetable Slot: ${timetableSubject?.name}`}
      >
        <form onSubmit={handleSaveTimetableSlot} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ background: "var(--bg-surface-secondary)", padding: "12px", borderRadius: "8px", fontSize: "0.85rem" }}>
            <div><strong>Subject:</strong> {timetableSubject?.name} ({timetableSubject?.code})</div>
            <div><strong>Semester:</strong> Semester {timetableSubject?.semester} (Common First Year)</div>
            <div><strong>Faculty:</strong> {timetableSubject?.teacherName}</div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label className="input-label">Day of Week</label>
              <select
                value={timetableForm.day}
                onChange={(e) => setTimetableForm({ ...timetableForm, day: e.target.value })}
                className="input-field"
              >
                <option value="Monday">Monday</option>
                <option value="Tuesday">Tuesday</option>
                <option value="Wednesday">Wednesday</option>
                <option value="Thursday">Thursday</option>
                <option value="Friday">Friday</option>
                <option value="Saturday">Saturday</option>
              </select>
            </div>
            <div>
              <label className="input-label">Division</label>
              <select
                value={timetableForm.division}
                onChange={(e) => setTimetableForm({ ...timetableForm, division: e.target.value })}
                className="input-field"
              >
                <option value="A">Division A</option>
                <option value="B">Division B</option>
              </select>
            </div>
          </div>

          <div>
            <label className="input-label">Time Slot</label>
            <select
              value={timetableForm.time}
              onChange={(e) => {
                const parts = e.target.value.split(" - ");
                setTimetableForm({
                  ...timetableForm,
                  time: e.target.value,
                  startTime: parts[0],
                  endTime: parts[1] || ""
                });
              }}
              className="input-field"
            >
              <option value="10:00 AM - 11:00 AM">10:00 AM - 11:00 AM (Lecture 1)</option>
              <option value="11:00 AM - 12:00 PM">11:00 AM - 12:00 PM (Lecture 2)</option>
              <option value="12:00 PM - 01:00 PM">12:00 PM - 01:00 PM (Lecture 3)</option>
              <option value="02:00 PM - 04:00 PM">02:00 PM - 04:00 PM (Practical / Lab Session)</option>
              <option value="02:00 PM - 05:00 PM">02:00 PM - 05:00 PM (Workshop 3h Block)</option>
              <option value="04:00 PM - 05:00 PM">04:00 PM - 05:00 PM (Tutorial / Remedial)</option>
            </select>
          </div>

          <div>
            <label className="input-label">Assigned Room / Laboratory</label>
            <input
              type="text"
              value={timetableForm.room}
              onChange={(e) => setTimetableForm({ ...timetableForm, room: e.target.value })}
              className="input-field"
              required
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "12px" }}>
            <button
              type="button"
              onClick={() => setTimetableSubject(null)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Schedule in Master Timetable
            </button>
          </div>
        </form>
      </Modal>

      {/* ========================================================= */}
      {/* MODAL: CONFIRM DELETE */}
      {/* ========================================================= */}
      <Modal
        isOpen={Boolean(deletingSubject)}
        onClose={() => setDeletingSubject(null)}
        title="Confirm Removal of Common Subject"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <p style={{ fontSize: "0.9rem", color: "var(--text-main)" }}>
            Are you sure you want to remove <strong>{deletingSubject?.name} ({deletingSubject?.code})</strong>?
          </p>
          <div style={{ background: "rgba(220, 38, 38, 0.1)", border: "1px solid #fecaca", padding: "10px 14px", borderRadius: "8px", fontSize: "0.82rem", color: "#991b1b" }}>
            <strong>Caution:</strong> This will remove the subject from all {departments.length} engineering branches and any associated scheduled timetable slots.
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px" }}>
            <button
              type="button"
              onClick={() => setDeletingSubject(null)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmDelete}
              className="btn btn-danger"
            >
              Confirm Removal
            </button>
          </div>
        </div>
      </Modal>

      {/* ========================================================= */}
      {/* MODAL: BRANCH FACULTY ALLOCATION & INHERITANCE MATRIX */}
      {/* ========================================================= */}
      <Modal
        isOpen={showBranchMatrix}
        onClose={() => setShowBranchMatrix(false)}
        title="1st Year Common Curriculum & Branch Faculty Allocation Matrix"
        maxWidth="840px"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Matrix Sub-tabs */}
          <div style={{ display: "flex", gap: "8px", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "10px" }}>
            <button
              onClick={() => setMatrixActiveTab("faculty")}
              style={{
                padding: "8px 16px",
                borderRadius: "8px",
                border: "none",
                fontWeight: "700",
                fontSize: "0.85rem",
                cursor: "pointer",
                background: matrixActiveTab === "faculty" ? "var(--color-primary)" : "transparent",
                color: matrixActiveTab === "faculty" ? "#ffffff" : "var(--text-muted)",
                display: "flex",
                alignItems: "center",
                gap: "6px"
              }}
            >
              <Users size={16} />
              <span>👥 Branch Faculty Allocation (Different Faculty per Branch)</span>
            </button>
            <button
              onClick={() => setMatrixActiveTab("inheritance")}
              style={{
                padding: "8px 16px",
                borderRadius: "8px",
                border: "none",
                fontWeight: "700",
                fontSize: "0.85rem",
                cursor: "pointer",
                background: matrixActiveTab === "inheritance" ? "var(--color-primary)" : "transparent",
                color: matrixActiveTab === "inheritance" ? "#ffffff" : "var(--text-muted)",
                display: "flex",
                alignItems: "center",
                gap: "6px"
              }}
            >
              <Building2 size={16} />
              <span>🏛️ Curriculum Inheritance Status</span>
            </button>
          </div>

          {matrixActiveTab === "faculty" ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {/* Informative Banner */}
              <div style={{ background: "rgba(59, 130, 246, 0.08)", border: "1px solid rgba(59, 130, 246, 0.25)", padding: "12px 16px", borderRadius: "10px", fontSize: "0.84rem", color: "var(--text-main)", lineHeight: 1.5 }}>
                <strong>📌 Unified Syllabus with Branch-Specific Faculty:</strong> Every 1st-year engineering branch shares the common academic syllabus for this course, but <em>faculty is not common across branches</em>. Each department designates its own specialized instructor to teach their student division and manage laboratory sessions.
              </div>

              {/* Subject Selector */}
              <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "var(--bg-surface-secondary)", padding: "10px 14px", borderRadius: "8px" }}>
                <span style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--text-main)", whiteSpace: "nowrap" }}>
                  Select Common Subject:
                </span>
                <select
                  className="form-control"
                  style={{ flex: 1, fontWeight: "600" }}
                  value={selectedMatrixSubId}
                  onChange={(e) => setSelectedMatrixSubId(e.target.value)}
                >
                  {commonSubjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code}) — Semester {s.semester === 1 ? "I" : "II"} [{s.type}, {s.credits} Credits]
                    </option>
                  ))}
                </select>
              </div>

              {/* Branch Faculty Table */}
              <div style={{ maxHeight: "360px", overflowY: "auto" }}>
                <table className="table" style={{ width: "100%", fontSize: "0.83rem" }}>
                  <thead style={{ background: "var(--bg-surface-secondary)" }}>
                    <tr>
                      <th style={{ padding: "10px" }}>Branch / Department</th>
                      <th style={{ padding: "10px" }}>Code</th>
                      <th style={{ padding: "10px", minWidth: "220px" }}>Assigned Faculty (Branch In-charge)</th>
                      <th style={{ padding: "10px" }}>Division / Batch</th>
                      <th style={{ padding: "10px" }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {departments.map((d) => {
                      const subjectObj = commonSubjects.find((s) => s.id === selectedMatrixSubId);
                      const branchAlloc = commonSubjectBranchFaculty?.[selectedMatrixSubId]?.[d.id] ||
                        subjectObj?.branchFaculty?.[d.id] || {
                          teacherId: subjectObj?.teacherId || "tea-1",
                          teacherName: subjectObj?.teacherName || "Prof. T. A. Mohije"
                        };

                      return (
                        <tr key={d.id} style={{ borderBottom: "1px solid var(--border-color)" }}>
                          <td style={{ padding: "10px", fontWeight: "600" }}>{d.name}</td>
                          <td style={{ padding: "10px", fontFamily: "monospace" }}>{d.code}</td>
                          <td style={{ padding: "10px" }}>
                            <select
                              className="form-control"
                              style={{ padding: "4px 8px", fontSize: "0.82rem", fontWeight: "600" }}
                              value={branchAlloc.teacherId || "tea-1"}
                              onChange={(e) => {
                                const newT = teachers.find((t) => t.id === e.target.value);
                                if (newT) {
                                  assignCommonSubjectFaculty(selectedMatrixSubId, d.id, newT.id, newT.name);
                                }
                              }}
                            >
                              {teachers.map((t) => (
                                <option key={t.id} value={t.id}>
                                  {t.name} ({t.departmentName?.split(" ")[0] || "Faculty"})
                                </option>
                              ))}
                            </select>
                          </td>
                          <td style={{ padding: "10px", color: "var(--text-muted)", fontSize: "0.78rem" }}>
                            Div {d.code.slice(0, 2).toUpperCase()} • Batches 1 & 2
                          </td>
                          <td style={{ padding: "10px" }}>
                            <Badge variant="success" style={{ fontSize: "0.7rem" }}>
                              ✓ Branch Active
                            </Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
                The following branches automatically inherit the unified First Year Semester I (11 subjects) and Semester II (10 subjects) curriculum. Updates made to any common subject dynamically apply to all of these departments with zero duplicate database entries.
              </p>

              <div style={{ maxHeight: "360px", overflowY: "auto" }}>
                <table className="table" style={{ width: "100%", fontSize: "0.82rem" }}>
                  <thead style={{ background: "var(--bg-surface-secondary)" }}>
                    <tr>
                      <th style={{ padding: "10px" }}>Branch Name</th>
                      <th style={{ padding: "10px" }}>Code</th>
                      <th style={{ padding: "10px" }}>Sem I Subjects</th>
                      <th style={{ padding: "10px" }}>Sem II Subjects</th>
                      <th style={{ padding: "10px" }}>Inheritance Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {departments.map((d) => (
                      <tr key={d.id} style={{ borderBottom: "1px solid var(--border-color)" }}>
                        <td style={{ padding: "10px", fontWeight: "600" }}>{d.name}</td>
                        <td style={{ padding: "10px", fontFamily: "monospace" }}>{d.code}</td>
                        <td style={{ padding: "10px" }}>{sem1Count} Subjects ({sem1Credits} Credits)</td>
                        <td style={{ padding: "10px" }}>{sem2Count} Subjects ({sem2Credits} Credits)</td>
                        <td style={{ padding: "10px" }}>
                          <span style={{ color: "#10b981", fontWeight: "700", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                            <CheckCircle2 size={13} /> Synchronized
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "10px" }}>
            <button
              onClick={() => setShowBranchMatrix(false)}
              className="btn btn-primary"
            >
              Close Matrix
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

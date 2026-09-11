import React, { useState } from "react";
import { useSmartCampus } from "../../context/SmartCampusContext";
import {
  BookOpen,
  Search,
  PlusCircle,
  Edit,
  Trash2,
  Filter,
  GraduationCap,
  Layers,
  Award,
  Clock,
  UserCheck,
  Building2,
  CheckCircle2,
  X,
  CalendarDays,
  FileSpreadsheet
} from "lucide-react";
import { Badge, Modal, StatCard } from "../common/UIPrimitives";

export default function AdminSubjects() {
  const {
    subjects,
    departments,
    users,
    addSubject,
    updateSubject,
    deleteSubject
  } = useSmartCampus();

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDept, setSelectedDept] = useState("all");
  const [selectedSem, setSelectedSem] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [viewMode, setViewMode] = useState("cards"); // "cards" | "table"

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [deletingSubject, setDeletingSubject] = useState(null);

  // Form State for Add / Edit
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    departmentId: "dept-ce",
    semester: 5,
    credits: 4,
    type: "Theory",
    teacherId: "tea-1",
    teacherName: "Prof. R. K. Patil",
    weeklyHours: 4,
    description: ""
  });

  const teachers = users.filter((u) => u.role === "teacher");

  // Filtered subjects
  const filteredSubjects = subjects.filter((sub) => {
    const matchesSearch =
      sub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (sub.teacherName && sub.teacherName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesDept = selectedDept === "all" || sub.departmentId === selectedDept;
    const matchesSem = selectedSem === "all" || sub.semester === Number(selectedSem);
    const matchesType = selectedType === "all" || sub.type === selectedType;

    return matchesSearch && matchesDept && matchesSem && matchesType;
  });

  // Calculate stats
  const totalSubjects = subjects.length;
  const year1Count = subjects.filter((s) => s.semester === 1 || s.semester === 2).length;
  const year2Count = subjects.filter((s) => s.semester === 3 || s.semester === 4).length;
  const year3Count = subjects.filter((s) => s.semester === 5 || s.semester === 6).length;
  const year4Count = subjects.filter((s) => s.semester === 7 || s.semester === 8).length;

  const handleOpenAdd = () => {
    const defaultDept = selectedDept !== "all" ? selectedDept : "dept-ce";
    const defaultSem = selectedSem !== "all" ? Number(selectedSem) : 5;
    const firstTeacher = teachers[0] || { id: "tea-1", name: "Prof. R. K. Patil" };

    setFormData({
      name: "",
      code: "",
      departmentId: defaultDept,
      semester: defaultSem,
      credits: 4,
      type: "Theory",
      teacherId: firstTeacher.id,
      teacherName: firstTeacher.name,
      weeklyHours: 4,
      description: ""
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (sub) => {
    setEditingSubject(sub);
    setFormData({
      name: sub.name,
      code: sub.code,
      departmentId: sub.departmentId || "dept-ce",
      semester: sub.semester || 1,
      credits: sub.credits || 3,
      type: sub.type || "Theory",
      teacherId: sub.teacherId || "tea-1",
      teacherName: sub.teacherName || "Prof. R. K. Patil",
      weeklyHours: sub.weeklyHours || 4,
      description: sub.description || ""
    });
  };

  const handleSaveAdd = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.code) return;

    const assignedTeacher = teachers.find((t) => t.id === formData.teacherId);
    addSubject({
      ...formData,
      teacherName: assignedTeacher ? assignedTeacher.name : formData.teacherName
    });
    setIsAddModalOpen(false);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editingSubject) return;

    const assignedTeacher = teachers.find((t) => t.id === formData.teacherId);
    updateSubject(editingSubject.id, {
      ...formData,
      teacherName: assignedTeacher ? assignedTeacher.name : formData.teacherName
    });
    setEditingSubject(null);
  };

  const handleConfirmDelete = () => {
    if (deletingSubject) {
      deleteSubject(deletingSubject.id);
      setDeletingSubject(null);
    }
  };

  // Helper for Year Badge
  const getYearLabel = (sem) => {
    if (sem <= 2) return "1st Year (FE)";
    if (sem <= 4) return "2nd Year (SE)";
    if (sem <= 6) return "3rd Year (TE)";
    return "4th Year (BE)";
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Top Banner */}
      <div
        style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)",
          borderRadius: "16px",
          padding: "24px 32px",
          color: "white",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
          boxShadow: "0 10px 25px -5px rgba(15, 23, 42, 0.4)"
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
            <span
              style={{
                fontSize: "0.75rem",
                background: "rgba(59, 130, 246, 0.2)",
                color: "#60a5fa",
                border: "1px solid rgba(96, 165, 250, 0.3)",
                padding: "3px 10px",
                borderRadius: "20px",
                fontWeight: "700",
                letterSpacing: "0.03em"
              }}
            >
              CURRICULUM & ACADEMIC REPOSITORY
            </span>
          </div>
          <h2 style={{ fontSize: "1.75rem", fontWeight: "800", color: "white" }}>
            Subjects & Course Master (4 Years / 8 Semesters)
          </h2>
          <p style={{ fontSize: "0.9rem", color: "#cbd5e1", marginTop: "4px" }}>
            Manage institute-wide curriculum, assign faculty instructors, credits & lab schemes across all 8 semesters.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="btn btn-primary btn-lg"
          style={{
            background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
            boxShadow: "0 4px 14px rgba(37, 99, 235, 0.4)",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px"
          }}
        >
          <PlusCircle size={18} />
          <span>Add New Subject</span>
        </button>
      </div>

      {/* 4 Academic Year Stats Grid */}
      <div className="stats-grid">
        <StatCard
          label="Total Courses Registered"
          value={totalSubjects}
          subtext="Active Across All Depts"
          icon={BookOpen}
          variant="primary"
        />
        <StatCard
          label="Year 1 (Sem 1 & 2)"
          value={year1Count}
          subtext="Foundational & Basic Sciences"
          icon={Layers}
          variant="success"
          onClick={() => setSelectedSem("1")}
        />
        <StatCard
          label="Year 2 (Sem 3 & 4)"
          value={year2Count}
          subtext="Core Branch Fundamentals"
          icon={GraduationCap}
          variant="purple"
          onClick={() => setSelectedSem("3")}
        />
        <StatCard
          label="Year 3 & 4 (Sem 5-8)"
          value={year3Count + year4Count}
          subtext="Advanced Core, Labs & Capstones"
          icon={Award}
          variant="warning"
          onClick={() => setSelectedSem("5")}
        />
      </div>

      {/* Main Filter & Control Panel */}
      <div className="card" style={{ padding: "18px 24px" }}>
        {/* Semester Quick Pills (Sem 1 to Sem 8) */}
        <div style={{ marginBottom: "16px" }}>
          <div style={{ fontSize: "0.78rem", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>
            Select Semester (1st Year to 4th Year):
          </div>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <button
              onClick={() => setSelectedSem("all")}
              className={`btn btn-sm ${selectedSem === "all" ? "btn-primary" : "btn-secondary"}`}
              style={{ borderRadius: "20px", padding: "4px 14px" }}
            >
              All Semesters ({totalSubjects})
            </button>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => {
              const count = subjects.filter(
                (s) => s.semester === sem && (selectedDept === "all" || s.departmentId === selectedDept)
              ).length;
              const year = Math.ceil(sem / 2);
              return (
                <button
                  key={sem}
                  onClick={() => setSelectedSem(String(sem))}
                  className={`btn btn-sm ${selectedSem === String(sem) ? "btn-primary" : "btn-secondary"}`}
                  style={{
                    borderRadius: "20px",
                    padding: "4px 14px",
                    fontWeight: "600",
                    border: selectedSem === String(sem) ? undefined : "1px solid var(--border-subtle)"
                  }}
                >
                  Sem {sem} (Yr {year}) • <span style={{ opacity: 0.8 }}>{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Secondary Filter Row */}
        <div style={{ display: "flex", gap: "14px", alignItems: "center", flexWrap: "wrap", paddingTop: "12px", borderTop: "1px solid var(--border-subtle)" }}>
          {/* Search Box */}
          <div style={{ position: "relative", flex: "1 1 240px", minWidth: "220px" }}>
            <Search
              size={16}
              style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}
            />
            <input
              type="text"
              className="form-control"
              placeholder="Search course title, code (e.g. CE501) or teacher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: "36px" }}
            />
          </div>

          {/* Department Filter */}
          <div style={{ minWidth: "180px" }}>
            <select
              className="form-control"
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
            >
              <option value="all">🏢 All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.code})
                </option>
              ))}
            </select>
          </div>

          {/* Type Filter */}
          <div style={{ minWidth: "140px" }}>
            <select
              className="form-control"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <option value="all">📚 All Types</option>
              <option value="Theory">Theory</option>
              <option value="Lab">Lab / Practical</option>
              <option value="Elective">Elective</option>
              <option value="Project">Project / Capstone</option>
            </select>
          </div>

          {/* View Mode Toggle */}
          <div style={{ display: "flex", border: "1px solid var(--border-subtle)", borderRadius: "8px", overflow: "hidden" }}>
            <button
              onClick={() => setViewMode("cards")}
              className={`btn btn-sm ${viewMode === "cards" ? "btn-primary" : "btn-secondary"}`}
              style={{ borderRadius: 0 }}
            >
              Grid View
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`btn btn-sm ${viewMode === "table" ? "btn-primary" : "btn-secondary"}`}
              style={{ borderRadius: 0 }}
            >
              Table View
            </button>
          </div>

          {/* Clear Filters */}
          {(searchTerm || selectedDept !== "all" || selectedSem !== "all" || selectedType !== "all") && (
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedDept("all");
                setSelectedSem("all");
                setSelectedType("all");
              }}
              className="btn btn-sm btn-secondary"
              style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}
            >
              <X size={14} /> Clear
            </button>
          )}
        </div>
      </div>

      {/* Results Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>
          Showing <strong>{filteredSubjects.length}</strong> matching subjects
        </div>
      </div>

      {/* Subjects Grid View */}
      {viewMode === "cards" ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "20px" }}>
          {filteredSubjects.map((sub) => {
            const dept = departments.find((d) => d.id === sub.departmentId);
            const teacher = teachers.find((t) => t.id === sub.teacherId) || { name: sub.teacherName || "Assigned Faculty" };

            const typeColorMap = {
              Theory: "primary",
              Lab: "purple",
              Elective: "warning",
              Project: "success"
            };

            return (
              <div
                key={sub.id}
                className="card"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  borderTop: `4px solid ${sub.type === "Lab" ? "#8b5cf6" : sub.type === "Elective" ? "#f59e0b" : sub.type === "Project" ? "#10b981" : "#2563eb"}`
                }}
              >
                <div>
                  {/* Card Header */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px", marginBottom: "12px" }}>
                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                      <Badge variant="purple">Sem {sub.semester} ({getYearLabel(sub.semester)})</Badge>
                      <Badge variant={typeColorMap[sub.type] || "info"}>{sub.type || "Theory"}</Badge>
                    </div>
                    <span
                      style={{
                        fontFamily: "monospace",
                        fontSize: "0.78rem",
                        fontWeight: "700",
                        background: "var(--bg-surface-secondary)",
                        padding: "3px 8px",
                        borderRadius: "6px",
                        border: "1px solid var(--border-subtle)"
                      }}
                    >
                      {sub.code}
                    </span>
                  </div>

                  <h3 style={{ fontSize: "1.15rem", fontWeight: "700", color: "var(--text-main)", marginBottom: "4px" }}>
                    {sub.name}
                  </h3>

                  <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "16px" }}>
                    🏢 {dept ? dept.name : sub.departmentId}
                  </div>

                  {/* Course Details Box */}
                  <div
                    style={{
                      background: "var(--bg-surface-secondary)",
                      padding: "12px",
                      borderRadius: "8px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                      fontSize: "0.82rem"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "var(--text-muted)" }}>Faculty Instructor:</span>
                      <strong style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <UserCheck size={14} color="var(--primary-600)" />
                        {teacher.name}
                      </strong>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "var(--text-muted)" }}>Academic Credits:</span>
                      <strong>{sub.credits} Credits</strong>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "var(--text-muted)" }}>Workload / Week:</span>
                      <span>{sub.weeklyHours || 4} Hours / Week</span>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div style={{ display: "flex", gap: "8px", marginTop: "16px", paddingTop: "12px", borderTop: "1px solid var(--border-subtle)" }}>
                  <button
                    onClick={() => handleOpenEdit(sub)}
                    className="btn btn-secondary btn-sm"
                    style={{ flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
                  >
                    <Edit size={14} /> Edit Course
                  </button>
                  <button
                    onClick={() => setDeletingSubject(sub)}
                    className="btn btn-sm btn-secondary"
                    style={{
                      color: "#ef4444",
                      borderColor: "rgba(239, 68, 68, 0.3)",
                      padding: "6px 12px"
                    }}
                    title="Delete Subject"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Subject Name</th>
                  <th>Department</th>
                  <th>Semester / Year</th>
                  <th>Type</th>
                  <th>Credits</th>
                  <th>Faculty Instructor</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubjects.map((sub) => {
                  const dept = departments.find((d) => d.id === sub.departmentId);
                  const teacher = teachers.find((t) => t.id === sub.teacherId) || { name: sub.teacherName || "Faculty" };

                  return (
                    <tr key={sub.id}>
                      <td>
                        <strong style={{ fontFamily: "monospace", color: "var(--primary-600)" }}>{sub.code}</strong>
                      </td>
                      <td>
                        <strong>{sub.name}</strong>
                      </td>
                      <td style={{ fontSize: "0.82rem" }}>{dept ? dept.name : sub.departmentId}</td>
                      <td>
                        <Badge variant="purple">Sem {sub.semester} ({getYearLabel(sub.semester)})</Badge>
                      </td>
                      <td>
                        <Badge variant={sub.type === "Lab" ? "purple" : sub.type === "Elective" ? "warning" : sub.type === "Project" ? "success" : "primary"}>
                          {sub.type || "Theory"}
                        </Badge>
                      </td>
                      <td>
                        <strong>{sub.credits}</strong>
                      </td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.85rem" }}>
                          <UserCheck size={14} color="var(--primary-600)" />
                          {teacher.name}
                        </div>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <div style={{ display: "inline-flex", gap: "6px" }}>
                          <button
                            onClick={() => handleOpenEdit(sub)}
                            className="btn btn-sm btn-secondary"
                            title="Edit Subject"
                          >
                            <Edit size={13} />
                          </button>
                          <button
                            onClick={() => setDeletingSubject(sub)}
                            className="btn btn-sm btn-secondary"
                            style={{ color: "#ef4444" }}
                            title="Delete Subject"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Subject Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Academic Course / Subject"
      >
        <form onSubmit={handleSaveAdd} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <div>
              <label className="form-label">Subject Name *</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Distributed Cloud Systems"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="form-label">Course Code *</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. CE601"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                required
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <div>
              <label className="form-label">Department *</label>
              <select
                className="form-control"
                value={formData.departmentId}
                onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="form-label">Semester (1 to 8 across 4 Years) *</label>
              <select
                className="form-control"
                value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: Number(e.target.value) })}
              >
                <option value={1}>Semester 1 (1st Year - FE)</option>
                <option value={2}>Semester 2 (1st Year - FE)</option>
                <option value={3}>Semester 3 (2nd Year - SE)</option>
                <option value={4}>Semester 4 (2nd Year - SE)</option>
                <option value={5}>Semester 5 (3rd Year - TE)</option>
                <option value={6}>Semester 6 (3rd Year - TE)</option>
                <option value={7}>Semester 7 (4th Year - BE)</option>
                <option value={8}>Semester 8 (4th Year - BE)</option>
              </select>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px" }}>
            <div>
              <label className="form-label">Course Type *</label>
              <select
                className="form-control"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="Theory">Theory Course</option>
                <option value="Lab">Laboratory / Practical</option>
                <option value="Elective">Elective Course</option>
                <option value="Project">Capstone / Project</option>
              </select>
            </div>

            <div>
              <label className="form-label">Credits *</label>
              <input
                type="number"
                min="1"
                max="12"
                className="form-control"
                value={formData.credits}
                onChange={(e) => setFormData({ ...formData, credits: Number(e.target.value) })}
                required
              />
            </div>

            <div>
              <label className="form-label">Weekly Hours</label>
              <input
                type="number"
                min="1"
                max="20"
                className="form-control"
                value={formData.weeklyHours}
                onChange={(e) => setFormData({ ...formData, weeklyHours: Number(e.target.value) })}
              />
            </div>
          </div>

          <div>
            <label className="form-label">Assigned Faculty Instructor *</label>
            <select
              className="form-control"
              value={formData.teacherId}
              onChange={(e) => {
                const t = teachers.find((tc) => tc.id === e.target.value);
                setFormData({
                  ...formData,
                  teacherId: e.target.value,
                  teacherName: t ? t.name : ""
                });
              }}
            >
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.designation || "Faculty"} - {t.departmentName})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label">Course Description / Syllabus Overview</label>
            <textarea
              className="form-control"
              rows={2}
              placeholder="Key concepts, syllabus modules, or pre-requisites..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
              Save Course to Curriculum
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Subject Modal */}
      <Modal
        isOpen={Boolean(editingSubject)}
        onClose={() => setEditingSubject(null)}
        title={`Edit Subject: ${editingSubject?.name} (${editingSubject?.code})`}
      >
        <form onSubmit={handleSaveEdit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <div>
              <label className="form-label">Subject Name *</label>
              <input
                type="text"
                className="form-control"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="form-label">Course Code *</label>
              <input
                type="text"
                className="form-control"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                required
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <div>
              <label className="form-label">Department *</label>
              <select
                className="form-control"
                value={formData.departmentId}
                onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="form-label">Semester *</label>
              <select
                className="form-control"
                value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: Number(e.target.value) })}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s}>
                    Semester {s} ({getYearLabel(s)})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px" }}>
            <div>
              <label className="form-label">Course Type *</label>
              <select
                className="form-control"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="Theory">Theory Course</option>
                <option value="Lab">Laboratory / Practical</option>
                <option value="Elective">Elective Course</option>
                <option value="Project">Capstone / Project</option>
              </select>
            </div>

            <div>
              <label className="form-label">Credits *</label>
              <input
                type="number"
                min="1"
                max="12"
                className="form-control"
                value={formData.credits}
                onChange={(e) => setFormData({ ...formData, credits: Number(e.target.value) })}
                required
              />
            </div>

            <div>
              <label className="form-label">Weekly Hours</label>
              <input
                type="number"
                min="1"
                max="20"
                className="form-control"
                value={formData.weeklyHours}
                onChange={(e) => setFormData({ ...formData, weeklyHours: Number(e.target.value) })}
              />
            </div>
          </div>

          <div>
            <label className="form-label">Assigned Faculty Instructor *</label>
            <select
              className="form-control"
              value={formData.teacherId}
              onChange={(e) => {
                const t = teachers.find((tc) => tc.id === e.target.value);
                setFormData({
                  ...formData,
                  teacherId: e.target.value,
                  teacherName: t ? t.name : ""
                });
              }}
            >
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.designation || "Faculty"} - {t.departmentName})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label">Course Description</label>
            <textarea
              className="form-control"
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
              Update Course Details
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(deletingSubject)}
        onClose={() => setDeletingSubject(null)}
        title="Confirm Delete Subject"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <p style={{ color: "var(--text-main)" }}>
            Are you sure you want to delete <strong>{deletingSubject?.name}</strong> ({deletingSubject?.code})?
          </p>
          <div style={{ background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.3)", padding: "12px", borderRadius: "8px", fontSize: "0.85rem", color: "#dc2626" }}>
            ⚠️ This will remove the course and its scheduled lecture slots from all class timetables.
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
            <button
              onClick={() => setDeletingSubject(null)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmDelete}
              className="btn btn-sm btn-secondary"
              style={{ background: "#dc2626", color: "white", borderColor: "#dc2626" }}
            >
              Delete Subject
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

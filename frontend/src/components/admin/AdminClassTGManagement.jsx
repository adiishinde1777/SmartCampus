import React, { useState } from "react";
import { useSmartCampus } from "../../context/SmartCampusContext";
import {
  Users,
  GraduationCap,
  ShieldCheck,
  PlusCircle,
  Edit,
  Trash2,
  CheckCircle2,
  Search,
  Filter,
  Layers,
  Sparkles,
  ArrowRight,
  BookOpen,
  UserCheck,
  Building2,
  Shuffle,
  Info
} from "lucide-react";
import { Badge, Modal, StatCard } from "../common/UIPrimitives";

export default function AdminClassTGManagement() {
  const {
    classAssignments,
    departments,
    users,
    assignClassTeacher,
    createClassAssignment,
    updateClassAssignment,
    deleteClassAssignment,
    createTgBatch,
    updateTgTeacher,
    assignStudentsToTgBatch,
    autoDistributeStudentsToTg
  } = useSmartCampus();

  const [activeTab, setActiveTab] = useState("classes"); // "classes" | "workload"
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDeptFilter, setSelectedDeptFilter] = useState("all");

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [selectedClassForTg, setSelectedClassForTg] = useState(null); // For managing TG batches
  const [deletingAssignmentId, setDeletingAssignmentId] = useState(null);

  // Student allocation modal state
  const [allocatingBatch, setAllocatingBatch] = useState(null); // { classId, tgBatch }
  const [studentSearch, setStudentSearch] = useState("");

  const teachers = users.filter((u) => u.role === "teacher");
  const allStudents = users.filter((u) => u.role === "student");

  // Filtered Class Assignments
  const filteredAssignments = (classAssignments || []).filter((ca) => {
    const matchesDept = selectedDeptFilter === "all" || ca.departmentId === selectedDeptFilter;
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      ca.className?.toLowerCase().includes(term) ||
      ca.classTeacherName?.toLowerCase().includes(term) ||
      ca.departmentName?.toLowerCase().includes(term);
    return matchesDept && matchesSearch;
  });

  // KPI Calculations
  const totalClasses = (classAssignments || []).length;
  const totalTgBatches = (classAssignments || []).reduce((acc, ca) => acc + (ca.tgBatches?.length || 0), 0);
  const teachersWithClass = new Set((classAssignments || []).map((ca) => ca.classTeacherId).filter(Boolean)).size;
  const teachersWithTg = new Set(
    (classAssignments || []).flatMap((ca) => (ca.tgBatches || []).map((b) => b.teacherId).filter(Boolean))
  ).size;

  // New Class Form State
  const [formData, setFormData] = useState({
    departmentId: "dept-vlsi",
    year: "Third Year",
    semester: 5,
    division: "A",
    academicYear: "2026-27",
    className: "TE VLSI – Semester 5 (Div A)",
    classroom: "A-209",
    classTeacherId: "tea-1",
    numTgBatches: 3
  });

  const handleOpenCreate = () => {
    setFormData({
      departmentId: departments[0]?.id || "dept-vlsi",
      year: "Third Year",
      semester: 5,
      division: "A",
      academicYear: "2026-27",
      className: "TE VLSI – Semester 5 (Div A)",
      classroom: "A-209",
      classTeacherId: teachers[0]?.id || "tea-1",
      numTgBatches: 3
    });
    setIsCreateModalOpen(true);
  };

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    const selectedDept = departments.find((d) => d.id === formData.departmentId);
    const assignedTeacher = teachers.find((t) => t.id === formData.classTeacherId);

    // Create default TG batches
    const tgBatches = [];
    for (let i = 1; i <= Number(formData.numTgBatches); i++) {
      const assignedTgTeacher = teachers[(i - 1) % teachers.length];
      tgBatches.push({
        id: `tg-${Date.now()}-${i}`,
        name: `Batch TG-${i}`,
        teacherId: assignedTgTeacher?.id || teachers[0]?.id,
        teacherName: assignedTgTeacher?.name || teachers[0]?.name,
        studentIds: []
      });
    }

    const newId = createClassAssignment({
      departmentId: formData.departmentId,
      departmentName: selectedDept?.name || "Engineering",
      year: formData.year,
      semester: Number(formData.semester),
      division: formData.division,
      academicYear: formData.academicYear,
      className: formData.className,
      classroom: formData.classroom,
      classTeacherId: formData.classTeacherId,
      classTeacherName: assignedTeacher?.name || "Assigned Faculty",
      tgBatches
    });

    // Automatically distribute enrolled students if available
    setTimeout(() => {
      autoDistributeStudentsToTg(newId, Number(formData.numTgBatches));
    }, 100);

    setIsCreateModalOpen(false);
  };

  const handleOpenEdit = (ca) => {
    setEditingAssignment(ca);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editingAssignment) return;
    const assignedTeacher = teachers.find((t) => t.id === editingAssignment.classTeacherId);
    updateClassAssignment(editingAssignment.id, {
      className: editingAssignment.className,
      classroom: editingAssignment.classroom,
      classTeacherId: editingAssignment.classTeacherId,
      classTeacherName: assignedTeacher?.name || editingAssignment.classTeacherName
    });
    setEditingAssignment(null);
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
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "rgba(59, 130, 246, 0.25)",
              border: "1px solid rgba(59, 130, 246, 0.4)",
              padding: "4px 12px",
              borderRadius: "20px",
              marginBottom: "10px"
            }}
          >
            <Sparkles size={14} color="#93c5fd" />
            <span style={{ fontSize: "0.78rem", fontWeight: "700", color: "#bfdbfe", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Academic Operations • Class Teacher & TG Allocation
            </span>
          </div>
          <h2 style={{ fontSize: "1.85rem", fontWeight: "800", color: "white", marginBottom: "8px" }}>
            Class & Teacher Guardian (TG) Management
          </h2>
          <p style={{ fontSize: "0.9rem", color: "#cbd5e1", lineHeight: 1.5 }}>
            Assign Class Teachers to division cohorts, configure TG batches, and allocate students with automatic distribution. Seamlessly integrates into existing teacher logins with dynamic role-based access.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="btn btn-primary btn-lg"
          style={{
            background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
            boxShadow: "0 4px 15px rgba(37, 99, 235, 0.4)",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}
        >
          <PlusCircle size={18} />
          <span>Assign New Class / TG Cohort</span>
        </button>
      </div>

      {/* KPI Stats */}
      <div className="stats-grid">
        <StatCard
          label="Active Classes"
          value={totalClasses}
          subtext="Configured Department Classes"
          icon={GraduationCap}
          variant="primary"
        />
        <StatCard
          label="Total TG Batches"
          value={totalTgBatches}
          subtext="Mentoring & Remedial Batches"
          icon={ShieldCheck}
          variant="purple"
        />
        <StatCard
          label="Designated Class Teachers"
          value={teachersWithClass}
          subtext="Faculty with Class Oversight"
          icon={UserCheck}
          variant="success"
        />
        <StatCard
          label="Designated TGs"
          value={teachersWithTg}
          subtext="Faculty with TG Batches"
          icon={Users}
          variant="info"
        />
      </div>

      {/* View Switcher & Filters */}
      <div className="card" style={{ padding: "16px 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={() => setActiveTab("classes")}
              className={`btn btn-sm ${activeTab === "classes" ? "btn-primary" : "btn-ghost"}`}
              style={{ borderRadius: "8px" }}
            >
              <GraduationCap size={15} />
              <span>Class & TG Assignments ({totalClasses})</span>
            </button>
            <button
              onClick={() => setActiveTab("workload")}
              className={`btn btn-sm ${activeTab === "workload" ? "btn-primary" : "btn-ghost"}`}
              style={{ borderRadius: "8px" }}
            >
              <Users size={15} />
              <span>Faculty Workload & Roles Matrix</span>
            </button>
          </div>

          <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Filter size={15} color="var(--text-muted)" />
              <select
                className="form-control"
                style={{ width: "auto", fontSize: "0.85rem" }}
                value={selectedDeptFilter}
                onChange={(e) => setSelectedDeptFilter(e.target.value)}
              >
                <option value="all">All Departments</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>

            <div style={{ position: "relative", minWidth: "220px" }}>
              <Search size={15} color="var(--text-muted)" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }} />
              <input
                type="text"
                placeholder="Search class, teacher, dept..."
                className="form-control"
                style={{ paddingLeft: "32px", fontSize: "0.85rem" }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Tab Content */}
      {activeTab === "classes" ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
          {filteredAssignments.length === 0 ? (
            <div className="card" style={{ gridColumn: "1 / -1", textAlign: "center", padding: "48px 20px" }}>
              <Users size={48} style={{ opacity: 0.3, margin: "0 auto 12px" }} />
              <h3 style={{ fontSize: "1.1rem", fontWeight: "700" }}>No Class Assignments Found</h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: "4px" }}>
                Click "Assign New Class / TG Cohort" to configure your first class and TG batches.
              </p>
            </div>
          ) : (
            filteredAssignments.map((ca) => {
              const deptStudents = allStudents.filter((u) => u.departmentId === ca.departmentId);
              const totalAssignedInTg = (ca.tgBatches || []).reduce((sum, b) => sum + (b.studentIds?.length || 0), 0);

              return (
                <div key={ca.id} className="card" style={{ display: "flex", flexDirection: "column", gap: "16px", borderTop: "4px solid var(--color-primary)" }}>
                  {/* Card Header */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                        <Badge variant="primary">{ca.academicYear || "2026-27"}</Badge>
                        <Badge variant="purple">{ca.year} • Sem {ca.semester}</Badge>
                        <Badge variant="secondary">Div {ca.division || "A"}</Badge>
                      </div>
                      <h3 style={{ fontSize: "1.2rem", fontWeight: "800", color: "var(--text-main)" }}>
                        {ca.className}
                      </h3>
                      <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: "2px" }}>
                        {ca.departmentName} • Room: <strong>{ca.classroom || "Smart Room"}</strong>
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: "6px" }}>
                      <button
                        onClick={() => handleOpenEdit(ca)}
                        className="btn btn-ghost btn-sm"
                        title="Edit Class Assignment"
                        style={{ padding: "6px" }}
                      >
                        <Edit size={16} color="var(--primary-600)" />
                      </button>
                      <button
                        onClick={() => setDeletingAssignmentId(ca.id)}
                        className="btn btn-ghost btn-sm"
                        title="Delete Class Assignment"
                        style={{ padding: "6px" }}
                      >
                        <Trash2 size={16} color="var(--danger-solid)" />
                      </button>
                    </div>
                  </div>

                  {/* Class Teacher Section */}
                  <div
                    style={{
                      background: "rgba(37, 99, 235, 0.05)",
                      border: "1px solid rgba(37, 99, 235, 0.15)",
                      padding: "14px",
                      borderRadius: "10px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "12px"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div
                        style={{
                          width: "38px",
                          height: "38px",
                          borderRadius: "50%",
                          background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
                          color: "white",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: "800",
                          fontSize: "0.85rem"
                        }}
                      >
                        🎓
                      </div>
                      <div>
                        <div style={{ fontSize: "0.72rem", textTransform: "uppercase", fontWeight: "700", color: "var(--color-primary)" }}>
                          Assigned Class Teacher
                        </div>
                        <div style={{ fontSize: "0.95rem", fontWeight: "800", color: "var(--text-main)" }}>
                          {ca.classTeacherName || "Not Assigned"}
                        </div>
                      </div>
                    </div>

                    <div style={{ textAlign: "right" }}>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block" }}>Enrolled Roster</span>
                      <strong style={{ fontSize: "1rem", color: "var(--text-main)" }}>{deptStudents.length} Students</strong>
                    </div>
                  </div>

                  {/* TG Batches Overview */}
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                      <div style={{ fontSize: "0.82rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--text-muted)" }}>
                        Teacher Guardian (TG) Batches ({ca.tgBatches?.length || 0})
                      </div>
                      <button
                        onClick={() => {
                          autoDistributeStudentsToTg(ca.id, ca.tgBatches?.length || 3);
                        }}
                        className="btn btn-ghost btn-sm"
                        style={{ fontSize: "0.75rem", color: "var(--color-primary)", display: "flex", alignItems: "center", gap: "4px" }}
                        title="Evenly distribute students across batches"
                      >
                        <Shuffle size={13} /> Auto-Distribute ({deptStudents.length} Students)
                      </button>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      {(ca.tgBatches || []).map((batch, idx) => (
                        <div
                          key={batch.id || idx}
                          style={{
                            background: "var(--bg-surface-secondary)",
                            padding: "10px 14px",
                            borderRadius: "8px",
                            border: "1px solid var(--border-subtle)",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: "12px",
                            fontSize: "0.85rem"
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <Badge variant="purple" style={{ fontWeight: "700" }}>{batch.name}</Badge>
                            <div>
                              <strong style={{ color: "var(--text-main)" }}>{batch.teacherName}</strong>
                              <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Guardian / Mentor</div>
                            </div>
                          </div>

                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                              <strong>{batch.studentIds?.length || 0}</strong> Students
                            </span>
                            <button
                              onClick={() => setAllocatingBatch({ classId: ca.id, batch, deptId: ca.departmentId })}
                              className="btn btn-secondary btn-sm"
                              style={{ padding: "4px 10px", fontSize: "0.75rem" }}
                            >
                              Manage Students
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                      Total Allocated to TGs: <strong>{totalAssignedInTg} / {deptStudents.length}</strong>
                    </span>
                    <button
                      onClick={() => setSelectedClassForTg(ca)}
                      className="btn btn-primary btn-sm"
                      style={{ fontSize: "0.78rem" }}
                    >
                      <ShieldCheck size={14} /> Configure TG Faculty
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* Workload & Responsibility Matrix */
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: "700" }}>
              Faculty Responsibility & Workload Matrix
            </h3>
            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "2px" }}>
              Overview of faculty members assigned as Subject Teachers, Class Teachers, and Teacher Guardians
            </p>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Faculty Name</th>
                  <th>Designation / Dept</th>
                  <th>Class Teacher Role</th>
                  <th>TG Batch Assignments</th>
                  <th>Active Workload Status</th>
                </tr>
              </thead>
              <tbody>
                {teachers.map((t) => {
                  const ctClasses = (classAssignments || []).filter((ca) => ca.classTeacherId === t.id);
                  const tgBatches = (classAssignments || []).flatMap((ca) =>
                    (ca.tgBatches || []).filter((b) => b.teacherId === t.id).map((b) => ({ ...b, className: ca.className }))
                  );

                  return (
                    <tr key={t.id}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div
                            style={{
                              width: "32px",
                              height: "32px",
                              borderRadius: "50%",
                              background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                              color: "white",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontWeight: "700",
                              fontSize: "0.75rem"
                            }}
                          >
                            {t.name.split(" ").slice(0, 2).map((n) => n[0]).join("")}
                          </div>
                          <div>
                            <strong>{t.name}</strong>
                            <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{t.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: "0.82rem" }}>{t.designation || "Assistant Professor"}</div>
                        <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{t.departmentName}</div>
                      </td>
                      <td>
                        {ctClasses.length > 0 ? (
                          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                            {ctClasses.map((c) => (
                              <Badge key={c.id} variant="primary" style={{ fontSize: "0.72rem" }}>
                                🎓 {c.className}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>None</span>
                        )}
                      </td>
                      <td>
                        {tgBatches.length > 0 ? (
                          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                            {tgBatches.map((b, i) => (
                              <Badge key={i} variant="purple" style={{ fontSize: "0.72rem" }}>
                                🛡️ {b.name} ({b.className}) • {b.studentIds?.length || 0} Students
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>None</span>
                        )}
                      </td>
                      <td>
                        <Badge
                          variant={ctClasses.length > 0 && tgBatches.length > 0 ? "success" : ctClasses.length > 0 || tgBatches.length > 0 ? "info" : "secondary"}
                        >
                          {ctClasses.length > 0 && tgBatches.length > 0
                            ? "Multi-Role Faculty (CT + TG)"
                            : ctClasses.length > 0
                            ? "Class Teacher Active"
                            : tgBatches.length > 0
                            ? "TG Mentor Active"
                            : "Subject Teacher Only"}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 1: CREATE NEW CLASS ASSIGNMENT */}
      {/* ========================================================= */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Assign Class Teacher & Create TG Batches"
        maxWidth="680px"
      >
        <form onSubmit={handleCreateSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Step 1: Department</label>
              <select
                className="form-control"
                value={formData.departmentId}
                onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Academic Year</label>
              <input
                type="text"
                className="form-control"
                value={formData.academicYear}
                onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                required
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Step 2: Academic Year</label>
              <select
                className="form-control"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
              >
                <option value="First Year">First Year (FE)</option>
                <option value="Second Year">Second Year (SE)</option>
                <option value="Third Year">Third Year (TE)</option>
                <option value="Final Year">Final Year (BE)</option>
              </select>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Semester & Division</label>
              <div style={{ display: "flex", gap: "8px" }}>
                <select
                  className="form-control"
                  value={formData.semester}
                  onChange={(e) => setFormData({ ...formData, semester: Number(e.target.value) })}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                    <option key={s} value={s}>Sem {s}</option>
                  ))}
                </select>
                <select
                  className="form-control"
                  value={formData.division}
                  onChange={(e) => setFormData({ ...formData, division: e.target.value })}
                >
                  <option value="A">Div A</option>
                  <option value="B">Div B</option>
                  <option value="C">Div C</option>
                </select>
              </div>
            </div>

            <div className="form-group" style={{ margin: 0, gridColumn: "1 / -1" }}>
              <label className="form-label">Class Name / Title</label>
              <input
                type="text"
                className="form-control"
                value={formData.className}
                onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                placeholder="e.g. TE VLSI – Semester 5 (Div A)"
                required
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Classroom / Hall</label>
              <input
                type="text"
                className="form-control"
                value={formData.classroom}
                onChange={(e) => setFormData({ ...formData, classroom: e.target.value })}
                placeholder="e.g. Room A-209"
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Step 4: Designate Class Teacher</label>
              <select
                className="form-control"
                value={formData.classTeacherId}
                onChange={(e) => setFormData({ ...formData, classTeacherId: e.target.value })}
                style={{ fontWeight: "700" }}
              >
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>{t.name} ({t.departmentName?.split(" ")[0]})</option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ margin: 0, gridColumn: "1 / -1" }}>
              <label className="form-label">Step 5: Number of TG Batches to Initialize</label>
              <select
                className="form-control"
                value={formData.numTgBatches}
                onChange={(e) => setFormData({ ...formData, numTgBatches: Number(e.target.value) })}
              >
                <option value={2}>2 Batches (TG-1, TG-2)</option>
                <option value={3}>3 Batches (TG-1, TG-2, TG-3)</option>
                <option value={4}>4 Batches (TG-1, TG-2, TG-3, TG-4)</option>
                <option value={5}>5 Batches (TG-1, TG-2, TG-3, TG-4, TG-5)</option>
              </select>
              <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "4px" }}>
                Enrolled students in this department will be automatically and equally distributed across these batches.
              </div>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "12px" }}>
            <button type="button" onClick={() => setIsCreateModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Register Class & Create Batches
            </button>
          </div>
        </form>
      </Modal>

      {/* ========================================================= */}
      {/* MODAL 2: EDIT CLASS TEACHER & CLASS DETAILS */}
      {/* ========================================================= */}
      <Modal
        isOpen={Boolean(editingAssignment)}
        onClose={() => setEditingAssignment(null)}
        title="Edit Class Assignment & Class Teacher"
      >
        <form onSubmit={handleSaveEdit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Class Name</label>
            <input
              type="text"
              className="form-control"
              value={editingAssignment?.className || ""}
              onChange={(e) => setEditingAssignment({ ...editingAssignment, className: e.target.value })}
              required
            />
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Assigned Class Teacher</label>
            <select
              className="form-control"
              value={editingAssignment?.classTeacherId || ""}
              onChange={(e) => setEditingAssignment({ ...editingAssignment, classTeacherId: e.target.value })}
              style={{ fontWeight: "700" }}
            >
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>{t.name} ({t.departmentName})</option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Classroom / Location</label>
            <input
              type="text"
              className="form-control"
              value={editingAssignment?.classroom || ""}
              onChange={(e) => setEditingAssignment({ ...editingAssignment, classroom: e.target.value })}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px" }}>
            <button type="button" onClick={() => setEditingAssignment(null)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Class Changes
            </button>
          </div>
        </form>
      </Modal>

      {/* ========================================================= */}
      {/* MODAL 3: CONFIGURE TG TEACHERS FOR A CLASS */}
      {/* ========================================================= */}
      <Modal
        isOpen={Boolean(selectedClassForTg)}
        onClose={() => setSelectedClassForTg(null)}
        title={`Configure TG Faculty: ${selectedClassForTg?.className}`}
        maxWidth="680px"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
            Assign or update Teacher Guardians for each batch under <strong>{selectedClassForTg?.className}</strong>.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {(selectedClassForTg?.tgBatches || []).map((b) => (
              <div
                key={b.id}
                style={{
                  background: "var(--bg-surface-secondary)",
                  padding: "12px 16px",
                  borderRadius: "10px",
                  border: "1px solid var(--border-subtle)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "14px"
                }}
              >
                <div>
                  <Badge variant="purple">{b.name}</Badge>
                  <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "4px" }}>
                    Current Allocation: <strong>{b.studentIds?.length || 0} students</strong>
                  </div>
                </div>

                <div style={{ flex: 1, maxWidth: "320px" }}>
                  <label style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: "700", textTransform: "uppercase" }}>
                    Assigned TG Faculty
                  </label>
                  <select
                    className="form-control"
                    style={{ fontSize: "0.85rem", fontWeight: "600" }}
                    value={b.teacherId}
                    onChange={(e) => {
                      const newT = teachers.find((t) => t.id === e.target.value);
                      if (newT) {
                        updateTgTeacher(selectedClassForTg.id, b.id, newT.id, newT.name);
                        // update local modal state view
                        setSelectedClassForTg((prev) => ({
                          ...prev,
                          tgBatches: prev.tgBatches.map((batch) =>
                            batch.id === b.id ? { ...batch, teacherId: newT.id, teacherName: newT.name } : batch
                          )
                        }));
                      }
                    }}
                  >
                    {teachers.map((t) => (
                      <option key={t.id} value={t.id}>{t.name} ({t.departmentName?.split(" ")[0]})</option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "12px" }}>
            <button onClick={() => setSelectedClassForTg(null)} className="btn btn-primary">
              Done Configuring TG Faculty
            </button>
          </div>
        </div>
      </Modal>

      {/* ========================================================= */}
      {/* MODAL 4: MANAGE & ALLOCATE STUDENTS IN A TG BATCH */}
      {/* ========================================================= */}
      <Modal
        isOpen={Boolean(allocatingBatch)}
        onClose={() => setAllocatingBatch(null)}
        title={`Student Allocation: ${allocatingBatch?.batch?.name} (${allocatingBatch?.batch?.teacherName})`}
        maxWidth="740px"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
            <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
              Check/uncheck students to allocate to <strong>{allocatingBatch?.batch?.name}</strong>.
            </div>
            <div style={{ position: "relative", minWidth: "240px" }}>
              <Search size={14} color="var(--text-muted)" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }} />
              <input
                type="text"
                placeholder="Filter by name or PRN..."
                className="form-control"
                style={{ paddingLeft: "30px", fontSize: "0.82rem" }}
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
              />
            </div>
          </div>

          <div style={{ maxHeight: "360px", overflowY: "auto", border: "1px solid var(--border-subtle)", borderRadius: "8px" }}>
            <table className="table" style={{ width: "100%", fontSize: "0.82rem" }}>
              <thead style={{ background: "var(--bg-surface-secondary)", position: "sticky", top: 0 }}>
                <tr>
                  <th style={{ width: "50px", textAlign: "center" }}>Allocated</th>
                  <th>Roll No</th>
                  <th>Student Name</th>
                  <th>PRN</th>
                  <th>Current Batch</th>
                </tr>
              </thead>
              <tbody>
                {allStudents
                  .filter((s) => s.departmentId === (allocatingBatch?.deptId || "dept-vlsi"))
                  .filter((s) => {
                    const term = studentSearch.toLowerCase();
                    return (
                      s.name.toLowerCase().includes(term) ||
                      (s.rollNo && s.rollNo.toLowerCase().includes(term)) ||
                      (s.prn && s.prn.toLowerCase().includes(term))
                    );
                  })
                  .map((stu) => {
                    const isAllocated = (allocatingBatch?.batch?.studentIds || []).includes(stu.id);

                    return (
                      <tr key={stu.id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                        <td style={{ textAlign: "center" }}>
                          <input
                            type="checkbox"
                            checked={isAllocated}
                            onChange={(e) => {
                              const currentIds = allocatingBatch.batch.studentIds || [];
                              const newIds = e.target.checked
                                ? [...currentIds, stu.id]
                                : currentIds.filter((id) => id !== stu.id);

                              assignStudentsToTgBatch(allocatingBatch.classId, allocatingBatch.batch.id, newIds);
                              setAllocatingBatch((prev) => ({
                                ...prev,
                                batch: { ...prev.batch, studentIds: newIds }
                              }));
                            }}
                          />
                        </td>
                        <td><strong>{stu.rollNo}</strong></td>
                        <td>{stu.name}</td>
                        <td style={{ fontFamily: "monospace", color: "var(--color-primary)" }}>{stu.prn || stu.prnNo}</td>
                        <td>
                          {isAllocated ? (
                            <Badge variant="success">✓ {allocatingBatch.batch.name}</Badge>
                          ) : (
                            <Badge variant="secondary">Unassigned / Other</Badge>
                          )}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
              Total Students Assigned in this Batch: <strong>{allocatingBatch?.batch?.studentIds?.length || 0}</strong>
            </span>
            <button onClick={() => setAllocatingBatch(null)} className="btn btn-primary">
              Done Allocating
            </button>
          </div>
        </div>
      </Modal>

      {/* ========================================================= */}
      {/* MODAL 5: DELETE CONFIRMATION */}
      {/* ========================================================= */}
      <Modal
        isOpen={Boolean(deletingAssignmentId)}
        onClose={() => setDeletingAssignmentId(null)}
        title="Confirm Deletion of Class Assignment"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <p style={{ fontSize: "0.88rem", color: "var(--text-main)" }}>
            Are you sure you want to remove this class assignment and its associated TG batch configurations?
          </p>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
            <button onClick={() => setDeletingAssignmentId(null)} className="btn btn-secondary">
              Cancel
            </button>
            <button
              onClick={() => {
                deleteClassAssignment(deletingAssignmentId);
                setDeletingAssignmentId(null);
              }}
              className="btn btn-danger"
            >
              Confirm Deletion
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

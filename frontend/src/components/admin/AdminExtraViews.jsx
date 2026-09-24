import React, { useState, useRef } from "react";
import { useSmartCampus } from "../../context/SmartCampusContext";
import {
  Users,
  Search,
  PlusCircle,
  ShieldCheck,
  GraduationCap,
  FileText,
  Filter,
  Download,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Copy,
  Link as LinkIcon,
  CheckCircle2,
  XCircle,
  Building2,
  Mail,
  Phone,
  Lock,
  BookOpen,
  UserCheck,
  UserPlus,
  Key,
  Save,
  AlertCircle,
  Upload,
  Camera,
  Layers,
  Sparkles,
  TrendingUp,
  Award
} from "lucide-react";
import { Badge, Modal, StatCard } from "../common/UIPrimitives";
import {
  getDepartmentYearDivisions,
  getDivisionsFromCount,
  ACADEMIC_YEARS,
  DIVISION_OPTIONS
} from "../../utils/departmentUtils";

// =========================================================================
// 1. ADMIN USER MANAGEMENT DIRECTORY (WITH EDIT, GALLERY UPLOAD & VIEW)
// =========================================================================
export function AdminUsers() {
  const { users, departments, updateUser, addUser, deleteUser, currentUser } = useSmartCampus();

  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all"); // 'all' | '2nd-year' | '3rd-year' | 'final-year'

  // Modals state
  const [editingUser, setEditingUser] = useState(null);
  const [viewingUser, setViewingUser] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [copiedLink, setCopiedLink] = useState("");

  const copyLink = (role, path) => {
    const url = `${window.location.origin}${path}`;
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(url);
    } else {
      const textarea = document.createElement("textarea");
      textarea.value = url;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
    setCopiedLink(role);
    setTimeout(() => setCopiedLink(""), 3000);
  };

  // File Input Refs for Gallery Photo Upload
  const editFileInputRef = useRef(null);
  const addFileInputRef = useRef(null);

  // Edit Form State
  const [editFormData, setEditFormData] = useState({});

  // Add Form State
  const [addFormData, setAddFormData] = useState({
    role: "student",
    name: "",
    email: "",
    dob: "",
    prn: "",
    rollNo: "",
    password: "",
    phone: "",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
    departmentId: "dept-vlsi",
    departmentName: "Electronic Engineering (VLSI Design And Technology)",
    semester: 1,
    division: "A",
    batch: "FE",
    cgpa: 8.0,
    bloodGroup: "O+",
    mentor: "",
    address: "",
    parentName: "",
    parentPhone: "",
    parentEmail: "",
    parentId: "",
    parentOccupation: "",
    relation: "Father",
    occupation: "",
    designation: "Assistant Professor",
    assignedDivisions: "Sem 1 - Div A",
    studentId: "",
    studentName: "",
    collegeName: "CSMSS Chh. Shahu College of Engineering"
  });

  // Filtered Users List
  const filtered = users.filter((u) => {
    const term = searchTerm.toLowerCase();
    const match =
      (u.name && u.name.toLowerCase().includes(term)) ||
      (u.email && u.email.toLowerCase().includes(term)) ||
      (u.rollNo && u.rollNo.toLowerCase().includes(term)) ||
      (u.prn && u.prn.toLowerCase().includes(term)) ||
      (u.phone && u.phone.toLowerCase().includes(term)) ||
      (u.departmentName && u.departmentName.toLowerCase().includes(term)) ||
      (u.designation && u.designation.toLowerCase().includes(term)) ||
      (u.studentName && u.studentName.toLowerCase().includes(term));

    if (!match) return false;
    if (roleFilter !== "all" && u.role !== roleFilter) return false;
    if (departmentFilter !== "all" && u.departmentId !== departmentFilter) return false;
    if (yearFilter !== "all" && u.role === "student") {
      if (yearFilter === "2nd-year" && !(u.semester === 3 || u.semester === 4 || u.year?.includes("Second") || u.className?.includes("SE") || u.batch?.includes("SE"))) return false;
      if (yearFilter === "3rd-year" && !(u.semester === 5 || u.semester === 6 || u.year?.includes("Third") || u.className?.includes("TE") || u.batch?.includes("TE"))) return false;
      if (yearFilter === "final-year" && !(u.semester === 7 || u.semester === 8 || u.year?.includes("Final") || u.className?.includes("BE") || u.batch?.includes("BE"))) return false;
    }
    return true;
  });

  // Role Counts
  const roleCounts = {
    all: users.length,
    student: users.filter((u) => u.role === "student").length,
    teacher: users.filter((u) => u.role === "teacher").length,
    parent: users.filter((u) => u.role === "parent").length,
    hod: users.filter((u) => u.role === "hod").length,
    principal: users.filter((u) => u.role === "principal").length,
    admin: users.filter((u) => u.role === "admin").length
  };

  const studentList = users.filter((u) => u.role === "student");

  // Open Edit Modal
  const handleOpenEdit = (user) => {
    setEditingUser(user);
    setShowPassword(false);
    setEditFormData({
      ...user,
      assignedDivisions: Array.isArray(user.assignedDivisions) ? user.assignedDivisions.join(", ") : user.assignedDivisions || ""
    });
  };

  // Gallery Photo Upload for Edit Modal
  const handleEditPhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result;
        if (base64) {
          setEditFormData((prev) => ({ ...prev, avatar: base64 }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Gallery Photo Upload for Add Modal
  const handleAddPhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result;
        if (base64) {
          setAddFormData((prev) => ({ ...prev, avatar: base64 }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit Edit User
  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editingUser) return;

    const payload = { ...editFormData };

    if (payload.departmentId) {
      const dept = departments.find((d) => d.id === payload.departmentId);
      if (dept) payload.departmentName = dept.name;
    }

    if (payload.role === "teacher" && typeof payload.assignedDivisions === "string") {
      payload.assignedDivisions = payload.assignedDivisions.split(",").map((s) => s.trim()).filter(Boolean);
    }

    if (payload.semester) payload.semester = Number(payload.semester);
    if (payload.cgpa) payload.cgpa = Number(payload.cgpa);

    if (payload.role === "parent" && payload.studentId) {
      const stu = users.find((u) => u.id === payload.studentId);
      if (stu) {
        payload.studentName = stu.name;
        payload.dob = stu.dob;
        payload.password = stu.dob;
        payload.departmentId = stu.departmentId;
        payload.departmentName = stu.departmentName;
      }
    }

    if (payload.dob && !payload.password) {
      payload.password = payload.dob;
    }

    updateUser(editingUser.id, payload);
    setEditingUser(null);
  };

  // Open Add Modal
  const handleOpenAdd = (presetRole = "student") => {
    setShowPassword(false);
    const defaultDept = departments[0] || { id: "dept-vlsi", name: "Electronic Engineering (VLSI Design And Technology)" };
    setAddFormData({
      role: presetRole,
      name: "",
      email: "",
      dob: "",
      prn: "",
      rollNo: "",
      password: "",
      phone: "",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
      departmentId: defaultDept.id,
      departmentName: defaultDept.name,
      semester: 1,
      division: "A",
      batch: "FE",
      cgpa: 8.0,
      bloodGroup: "O+",
      mentor: "",
      address: "",
      parentName: "",
      parentPhone: "",
      parentEmail: "",
      parentId: "",
      parentOccupation: "",
      designation: presetRole === "hod" ? "Head of Department" : presetRole === "principal" ? "Principal & Director" : "Assistant Professor",
      assignedDivisions: "Sem 1 - Div A",
      relation: "Father",
      occupation: "",
      studentId: "",
      studentName: "",
      collegeName: "CSMSS Chh. Shahu College of Engineering"
    });
    setIsAddModalOpen(true);
  };

  // Submit Add User
  const handleSaveAdd = (e) => {
    e.preventDefault();
    const payload = { ...addFormData };

    if (payload.departmentId) {
      const dept = departments.find((d) => d.id === payload.departmentId);
      if (dept) payload.departmentName = dept.name;
    }

    if (payload.role === "teacher" && typeof payload.assignedDivisions === "string") {
      payload.assignedDivisions = payload.assignedDivisions.split(",").map((s) => s.trim()).filter(Boolean);
    }

    if (payload.semester) payload.semester = Number(payload.semester);
    if (payload.cgpa) payload.cgpa = Number(payload.cgpa);

    // Role-specific credential rules
    if (payload.role === "student") {
      payload.prn = payload.rollNo || payload.prn;
      payload.password = payload.password || payload.dob || "password123";
    } else if (payload.role === "parent") {
      if (payload.studentId) {
        const stu = users.find((u) => u.id === payload.studentId);
        if (stu) {
          payload.studentName = stu.name;
          payload.dob = stu.dob;
          payload.password = payload.password || stu.dob;
          payload.departmentId = stu.departmentId;
          payload.departmentName = stu.departmentName;
        }
      }
      if (!payload.password && payload.dob) payload.password = payload.dob;
    } else if (["teacher", "hod", "principal", "admin"].includes(payload.role)) {
      payload.password = payload.password || payload.dob || "password123";
    }

    addUser(payload);
    setIsAddModalOpen(false);
  };

  // Delete User handler
  const handleDeleteUser = (user) => {
    if (user.id === currentUser?.id) {
      alert("You cannot delete your own logged-in Admin account.");
      return;
    }
    const confirmDelete = window.confirm(`Are you sure you want to permanently delete ${user.name} (${user.role.toUpperCase()}) from the system?`);
    if (confirmDelete) {
      deleteUser(user.id);
    }
  };

  const getRoleBadgeVariant = (role) => {
    switch (role) {
      case "student": return "primary";
      case "teacher": return "purple";
      case "parent": return "warning";
      case "hod": return "info";
      case "principal": return "success";
      case "admin": return "danger";
      default: return "gray";
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header with summary and Action Buttons */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
            <Badge variant="purple">Admin Master Control</Badge>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Central ERP Directory</span>
          </div>
          <h2 style={{ fontSize: "1.6rem", fontWeight: "800", color: "var(--text-main)" }}>
            Stakeholder Directory & Data Management
          </h2>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "2px" }}>
            Add, update, and manage complete profile records for Students, Parents, Teachers, HODs, Principals, and Admins.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button onClick={() => handleOpenAdd("student")} className="btn btn-primary btn-sm" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <UserPlus size={15} /> Add New User
          </button>
        </div>
      </div>

      {/* Shareable Self-Registration Links Card (Teacher/HOD vs Student separate links) */}
      <div
        style={{
          background: "linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%)",
          border: "1.5px solid #bfdbfe",
          borderRadius: "14px",
          padding: "16px 20px",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          boxShadow: "0 2px 8px rgba(37, 99, 235, 0.05)"
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "#2563eb", color: "white", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <LinkIcon size={18} />
            </div>
            <div>
              <div style={{ fontSize: "0.95rem", fontWeight: "800", color: "#1e3a8a" }}>
                Shareable Onboarding & Registration Links
              </div>
              <div style={{ fontSize: "0.78rem", color: "#64748b" }}>
                Send dedicated invite links to teachers, HODs, or students to self-register without admin manual typing
              </div>
            </div>
          </div>
          {copiedLink && (
            <div style={{ background: "#dcfce7", color: "#15803d", padding: "4px 12px", borderRadius: "20px", fontSize: "0.78rem", fontWeight: "700", display: "flex", alignItems: "center", gap: "6px" }}>
              <CheckCircle2 size={14} />
              <span>{copiedLink.toUpperCase()} Registration Link Copied to Clipboard!</span>
            </div>
          )}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "12px" }}>
          {/* Student Link */}
          <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "12px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px" }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: "0.84rem", fontWeight: "700", color: "#2563eb", display: "flex", alignItems: "center", gap: "6px" }}>
                <GraduationCap size={15} /> Student Enrollment Link
              </div>
              <div style={{ fontSize: "0.74rem", color: "#64748b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: "monospace", marginTop: "2px" }}>
                /?register=student
              </div>
            </div>
            <button
              type="button"
              onClick={() => copyLink("student", "/?register=student")}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: "0.74rem", display: "flex", alignItems: "center", gap: "4px", padding: "6px 10px", flexShrink: 0 }}
            >
              <Copy size={13} />
              <span>{copiedLink === "student" ? "Copied!" : "Copy Link"}</span>
            </button>
          </div>

          {/* Teacher Link */}
          <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "12px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px" }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: "0.84rem", fontWeight: "700", color: "#7c3aed", display: "flex", alignItems: "center", gap: "6px" }}>
                <Users size={15} /> Faculty / Teacher Registration Link
              </div>
              <div style={{ fontSize: "0.74rem", color: "#64748b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: "monospace", marginTop: "2px" }}>
                /?register=teacher
              </div>
            </div>
            <button
              type="button"
              onClick={() => copyLink("teacher", "/?register=teacher")}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: "0.74rem", display: "flex", alignItems: "center", gap: "4px", padding: "6px 10px", flexShrink: 0, color: "#7c3aed", borderColor: "#ddd6fe" }}
            >
              <Copy size={13} />
              <span>{copiedLink === "teacher" ? "Copied!" : "Copy Link"}</span>
            </button>
          </div>

          {/* HOD Link */}
          <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "12px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px" }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: "0.84rem", fontWeight: "700", color: "#0891b2", display: "flex", alignItems: "center", gap: "6px" }}>
                <Building2 size={15} /> Head of Dept (HOD) Registration Link
              </div>
              <div style={{ fontSize: "0.74rem", color: "#64748b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: "monospace", marginTop: "2px" }}>
                /?register=hod
              </div>
            </div>
            <button
              type="button"
              onClick={() => copyLink("hod", "/?register=hod")}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: "0.74rem", display: "flex", alignItems: "center", gap: "4px", padding: "6px 10px", flexShrink: 0, color: "#0891b2", borderColor: "#cffafe" }}
            >
              <Copy size={13} />
              <span>{copiedLink === "hod" ? "Copied!" : "Copy Link"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Role Counts Summary Bar */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "12px" }}>
        {[
          { key: "all", label: "All Users", count: roleCounts.all, color: "#475569", bg: "#f1f5f9" },
          { key: "student", label: "Students", count: roleCounts.student, color: "#2563eb", bg: "#eff6ff" },
          { key: "teacher", label: "Teachers", count: roleCounts.teacher, color: "#7c3aed", bg: "#f5f3ff" },
          { key: "parent", label: "Parents", count: roleCounts.parent, color: "#d97706", bg: "#fffbeb" },
          { key: "hod", label: "HODs", count: roleCounts.hod, color: "#0891b2", bg: "#ecfeff" },
          { key: "principal", label: "Principal", count: roleCounts.principal, color: "#059669", bg: "#ecfdf5" },
          { key: "admin", label: "Admins", count: roleCounts.admin, color: "#dc2626", bg: "#fef2f2" }
        ].map((item) => (
          <div
            key={item.key}
            onClick={() => setRoleFilter(item.key)}
            style={{
              background: roleFilter === item.key ? item.bg : "var(--bg-surface)",
              border: `1.5px solid ${roleFilter === item.key ? item.color : "var(--border-subtle)"}`,
              borderRadius: "10px",
              padding: "10px 14px",
              cursor: "pointer",
              transition: "all 0.2s ease",
              boxShadow: roleFilter === item.key ? "0 4px 12px rgba(0,0,0,0.05)" : "none"
            }}
          >
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: "600" }}>{item.label}</div>
            <div style={{ fontSize: "1.3rem", fontWeight: "800", color: item.color, marginTop: "2px" }}>{item.count}</div>
          </div>
        ))}
      </div>

      {/* Filter and Search Controls */}
      <div className="card" style={{ padding: "14px 20px" }}>
        <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: "1 1 280px" }}>
            <Search size={18} color="var(--text-muted)" />
            <input
              type="text"
              className="form-control"
              style={{ border: "none", boxShadow: "none", width: "100%" }}
              placeholder="Search by name, email, roll no, PRN, phone, department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
            <select
              className="form-control"
              style={{ width: "190px", fontSize: "0.82rem" }}
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
            >
              <option value="all">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>

            <select
              className="form-control"
              style={{ width: "150px", fontSize: "0.82rem" }}
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              title="Filter students by academic year"
            >
              <option value="all">All Years</option>
              <option value="2nd-year">2nd Year (SE)</option>
              <option value="3rd-year">3rd Year (TE)</option>
              <option value="final-year">Final Year (BE)</option>
            </select>

            <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
              {["all", "student", "teacher", "parent", "hod", "principal", "admin"].map((r) => (
                <button
                  key={r}
                  onClick={() => setRoleFilter(r)}
                  className={`btn btn-sm ${roleFilter === r ? "btn-primary" : "btn-secondary"}`}
                  style={{ textTransform: "capitalize", fontSize: "0.75rem", padding: "4px 10px", display: "inline-flex", alignItems: "center", gap: "5px" }}
                >
                  <span>{r}</span>
                  <span style={{ fontSize: "0.68rem", opacity: 0.85, background: roleFilter === r ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.08)", padding: "1px 5px", borderRadius: "10px" }}>
                    {roleCounts[r]}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Registered Users Directory Table */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <Users size={18} color="var(--primary-600)" />
            <span>Registered Users Directory ({filtered.length})</span>
          </div>
          {filtered.length !== users.length && (
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
              Filtered from {users.length} total records
            </span>
          )}
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>User Details</th>
                <th>Role</th>
                <th>Department / Affiliation / Ward</th>
                <th>Login Credentials</th>
                <th>Phone & Contact</th>
                <th style={{ textAlign: "right", minWidth: "140px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center", padding: "36px", color: "var(--text-muted)" }}>
                    No users found matching your search and filter criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((u) => (
                  <tr key={u.id} style={{ transition: "background 0.15s" }}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        {u.avatar ? (
                          <img
                            src={u.avatar}
                            alt={u.name}
                            style={{ width: "38px", height: "38px", borderRadius: "50%", objectFit: "cover", border: "1px solid var(--border-subtle)" }}
                          />
                        ) : (
                          <div
                            style={{
                              width: "38px",
                              height: "38px",
                              borderRadius: "50%",
                              background: u.role === "student" ? "linear-gradient(135deg, #2563eb, #1d4ed8)" : "linear-gradient(135deg, #475569, #334155)",
                              color: "white",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontWeight: "700",
                              fontSize: "0.8rem",
                              flexShrink: 0
                            }}
                          >
                            {u.name ? u.name.split(" ").slice(0, 2).map((n) => n[0]).join("") : "U"}
                          </div>
                        )}
                        <div>
                          <div style={{ fontWeight: "700", color: "var(--text-main)", display: "flex", alignItems: "center", gap: "6px" }}>
                            {u.name}
                            {u.id === currentUser?.id && (
                              <span style={{ fontSize: "0.68rem", background: "#fef3c7", color: "#92400e", padding: "1px 5px", borderRadius: "4px" }}>
                                (You)
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{u.email || "No email"}</div>
                          <div style={{ fontSize: "0.7rem", color: "#94a3b8", fontFamily: "monospace" }}>ID: {u.id}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <Badge variant={getRoleBadgeVariant(u.role)}>
                        {u.role.toUpperCase()}
                      </Badge>
                    </td>
                    <td>
                      <div style={{ fontWeight: "600", fontSize: "0.85rem" }}>
                        {u.role === "student" && (
                          <div>
                            <div>{u.departmentName || "Engineering"}</div>
                            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                              Sem {u.semester || 1} • Div {u.division || "A"} • Roll: {u.rollNo || u.prn || "N/A"}
                            </div>
                          </div>
                        )}
                        {u.role === "teacher" && (
                          <div>
                            <div>{u.designation || "Faculty"}</div>
                            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                              {u.departmentName} {u.assignedDivisions ? `• Divs: ${Array.isArray(u.assignedDivisions) ? u.assignedDivisions.join(", ") : u.assignedDivisions}` : ""}
                            </div>
                          </div>
                        )}
                        {u.role === "parent" && (
                          <div>
                            <span style={{ color: "#d97706", fontWeight: "700" }}>
                              {u.relation || "Parent"} of: {u.studentName || "Student"}
                            </span>
                            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                              {u.departmentName || "Engineering"} {u.occupation ? `• Occ: ${u.occupation}` : ""}
                            </div>
                          </div>
                        )}
                        {u.role === "hod" && (
                          <div>
                            <div>Head of Department (HOD)</div>
                            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{u.departmentName}</div>
                          </div>
                        )}
                        {u.role === "principal" && (
                          <div>
                            <div>{u.designation || "Principal & Director"}</div>
                            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{u.collegeName || "CSMSS College of Engineering"}</div>
                          </div>
                        )}
                        {u.role === "admin" && (
                          <div>
                            <div>{u.designation || "System Administrator"}</div>
                            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Central ERP Operations</div>
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <div style={{ background: "#f8fafc", padding: "6px 10px", borderRadius: "6px", border: "1px solid #e2e8f0", fontSize: "0.78rem", display: "inline-block" }}>
                        {u.role === "student" && (
                          <div>
                            <div><strong>User:</strong> <code style={{ color: "#1d4ed8" }}>{u.rollNo || u.prn || "PRN"}</code></div>
                            <div><strong>Pass:</strong> <code style={{ color: "#475569" }}>{u.dob || u.password || "DOB"}</code></div>
                          </div>
                        )}
                        {u.role === "parent" && (
                          <div>
                            <div><strong>User:</strong> <code style={{ color: "#b45309" }}>{u.phone || "Parent Mobile"}</code></div>
                            <div><strong>Pass:</strong> <code style={{ color: "#475569" }}>{u.dob || u.password || "Student DOB"}</code></div>
                          </div>
                        )}
                        {["teacher", "hod", "principal"].includes(u.role) && (
                          <div>
                            <div><strong>User:</strong> <code style={{ color: "#0f766e" }}>{u.phone || "Mobile"}</code></div>
                            <div><strong>Pass:</strong> <code style={{ color: "#475569" }}>{u.dob || u.password || "DOB"}</code></div>
                          </div>
                        )}
                        {u.role === "admin" && (
                          <div>
                            <div><strong>User:</strong> <code style={{ color: "#b91c1c" }}>admin</code></div>
                            <div><strong>Pass:</strong> <code style={{ color: "#475569" }}>{u.password || "admin123"}</code></div>
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: "0.82rem", display: "flex", alignItems: "center", gap: "5px" }}>
                        <Phone size={13} color="var(--text-muted)" />
                        <span>{u.phone || "N/A"}</span>
                      </div>
                      {u.address && (
                        <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "2px" }}>
                          {u.address}
                        </div>
                      )}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: "6px", alignItems: "center" }}>
                        <button
                          onClick={() => handleOpenEdit(u)}
                          className="btn btn-primary btn-sm"
                          style={{
                            padding: "4px 10px",
                            fontSize: "0.75rem",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px"
                          }}
                          title={`Edit ${u.name}'s profile data`}
                        >
                          <Edit size={13} />
                          <span>Edit</span>
                        </button>

                        <button
                          onClick={() => setViewingUser(u)}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: "4px 8px", fontSize: "0.75rem" }}
                          title="View Full Profile Details"
                        >
                          <Eye size={13} />
                        </button>

                        {u.id !== currentUser?.id && (
                          <button
                            onClick={() => handleDeleteUser(u)}
                            className="btn btn-danger btn-sm"
                            style={{ padding: "4px 8px", fontSize: "0.75rem" }}
                            title="Delete user"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ==================================================== */}
      {/* EDIT USER MODAL                                      */}
      {/* ==================================================== */}
      <Modal
        isOpen={Boolean(editingUser)}
        onClose={() => setEditingUser(null)}
        title={`Edit ${editingUser?.role?.toUpperCase()} Profile: ${editingUser?.name}`}
        maxWidth="750px"
        footer={
          <>
            <button type="button" onClick={() => setEditingUser(null)} className="btn btn-secondary btn-md">
              Cancel
            </button>
            <button type="button" onClick={handleSaveEdit} className="btn btn-primary btn-md" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Save size={16} />
              <span>Save & Apply Changes</span>
            </button>
          </>
        }
      >
        {editingUser && (
          <form onSubmit={handleSaveEdit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* Header Persona Summary Banner with Gallery Photo Upload */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "20px",
                background: "linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%)",
                padding: "16px 20px",
                borderRadius: "12px",
                border: "1.5px solid #bfdbfe"
              }}
            >
              <div style={{ position: "relative", width: "68px", height: "68px" }}>
                <img
                  src={editFormData.avatar || editingUser.avatar}
                  alt={editFormData.name}
                  style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover", border: "3px solid #2563eb" }}
                />
                <button
                  type="button"
                  onClick={() => editFileInputRef.current?.click()}
                  title="Upload new photo from gallery"
                  style={{
                    position: "absolute",
                    bottom: 0,
                    right: 0,
                    background: "#2563eb",
                    color: "white",
                    border: "2px solid white",
                    borderRadius: "50%",
                    width: "24px",
                    height: "24px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer"
                  }}
                >
                  <Camera size={12} />
                </button>
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Badge variant={getRoleBadgeVariant(editingUser.role)}>
                    {editingUser.role.toUpperCase()}
                  </Badge>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontFamily: "monospace" }}>
                    ID: {editingUser.id}
                  </span>
                </div>
                <div style={{ fontSize: "1.1rem", fontWeight: "700", marginTop: "2px" }}>
                  {editFormData.name || editingUser.name}
                </div>

                <input
                  ref={editFileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleEditPhotoUpload}
                  style={{ display: "none" }}
                />

                <div style={{ marginTop: "6px" }}>
                  <button
                    type="button"
                    onClick={() => editFileInputRef.current?.click()}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: "0.72rem", padding: "3px 8px", display: "inline-flex", alignItems: "center", gap: "4px" }}
                  >
                    <Upload size={12} /> Upload Photo from Gallery / Device
                  </button>
                </div>
              </div>
            </div>

            {/* SECTION 1: CORE CREDENTIALS & CONTACT */}
            <div>
              <h4 style={{ fontSize: "0.95rem", fontWeight: "700", marginBottom: "12px", color: "var(--primary-800)", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "6px" }}>
                1. General Account Details
              </h4>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editFormData.name || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    className="form-control"
                    value={editFormData.email || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    {editingUser.role === "student" ? "Student Mobile Number" : "Mobile Phone (Login Username) *"}
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={editFormData.phone || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                    required={editingUser.role !== "student"}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    {editingUser.role === "parent" ? "Student's Date of Birth (YYYY-MM-DD)" : "Date of Birth (YYYY-MM-DD)"}
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={editFormData.dob || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, dob: e.target.value })}
                    placeholder="YYYY-MM-DD (e.g. 2004-08-22)"
                  />
                </div>

                <div className="form-group" style={{ gridColumn: "span 2" }}>
                  <label className="form-label" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontWeight: "700" }}>Account Password (Login Password) *</span>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ background: "none", border: "none", color: "#2563eb", cursor: "pointer", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "4px", fontWeight: "600" }}
                    >
                      {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                      {showPassword ? "Hide Password" : "Show Password"}
                    </button>
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showPassword ? "text" : "password"}
                      className="form-control"
                      value={editFormData.password || ""}
                      onChange={(e) => setEditFormData({ ...editFormData, password: e.target.value })}
                      placeholder="Set or change user password"
                      style={{ paddingRight: "40px" }}
                    />
                    <Key size={16} color="#94a3b8" style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)" }} />
                  </div>
                  <small style={{ color: "#64748b", fontSize: "0.74rem", marginTop: "4px", display: "block" }}>
                    💡 Admin can directly update or reset the password for {editingUser.name} ({editingUser.role.toUpperCase()}).
                  </small>
                </div>

                <div className="form-group" style={{ gridColumn: "span 2" }}>
                  <label className="form-label">Residential Address</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editFormData.address || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                    placeholder="e.g. N-6 CIDCO, Chhatrapati Sambhajinagar"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 2: ROLE SPECIFIC FIELDS */}
            <div>
              <h4 style={{ fontSize: "0.95rem", fontWeight: "700", marginBottom: "12px", color: "var(--primary-800)", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "6px" }}>
                2. {editingUser.role.toUpperCase()} Specific Attributes
              </h4>

              {/* STUDENT EDIT FIELDS */}
              {editingUser.role === "student" && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                  <div className="form-group">
                    <label className="form-label">PRN Number (Student Username) *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editFormData.rollNo || editFormData.prn || ""}
                      onChange={(e) => setEditFormData({ ...editFormData, rollNo: e.target.value, prn: e.target.value })}
                      placeholder="e.g. 24025331378056"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Department *</label>
                    <select
                      className="form-control"
                      value={editFormData.departmentId || ""}
                      onChange={(e) => setEditFormData({ ...editFormData, departmentId: e.target.value })}
                    >
                      {departments.map((d) => (
                        <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Semester</label>
                    <select
                      className="form-control"
                      value={editFormData.semester || 1}
                      onChange={(e) => setEditFormData({ ...editFormData, semester: e.target.value })}
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                        <option key={s} value={s}>Semester {s}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Division</label>
                    <select
                      className="form-control"
                      value={editFormData.division || "A"}
                      onChange={(e) => setEditFormData({ ...editFormData, division: e.target.value })}
                    >
                      {["A", "B", "C", "D"].map((div) => (
                        <option key={div} value={div}>Division {div}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Current CGPA</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="10"
                      className="form-control"
                      value={editFormData.cgpa ?? 8.0}
                      onChange={(e) => setEditFormData({ ...editFormData, cgpa: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Blood Group</label>
                    <select
                      className="form-control"
                      value={editFormData.bloodGroup || "O+"}
                      onChange={(e) => setEditFormData({ ...editFormData, bloodGroup: e.target.value })}
                    >
                      {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map((bg) => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group" style={{ gridColumn: "span 2" }}>
                    <label className="form-label">Assigned Faculty Mentor</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editFormData.mentor || ""}
                      onChange={(e) => setEditFormData({ ...editFormData, mentor: e.target.value })}
                      placeholder="e.g. Prof. T. A. Mohije"
                    />
                  </div>

                  <div style={{ gridColumn: "span 2", background: "#fffbeb", padding: "14px", borderRadius: "8px", border: "1px solid #fde68a" }}>
                    <h5 style={{ fontSize: "0.85rem", fontWeight: "700", color: "#92400e", marginBottom: "8px" }}>
                      Linked Parent / Guardian Information
                    </h5>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
                      <div>
                        <label className="form-label" style={{ fontSize: "0.75rem" }}>Parent Name</label>
                        <input
                          type="text"
                          className="form-control"
                          value={editFormData.parentName || ""}
                          onChange={(e) => setEditFormData({ ...editFormData, parentName: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="form-label" style={{ fontSize: "0.75rem" }}>Parent Phone (Parent Username)</label>
                        <input
                          type="text"
                          className="form-control"
                          value={editFormData.parentPhone || ""}
                          onChange={(e) => setEditFormData({ ...editFormData, parentPhone: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="form-label" style={{ fontSize: "0.75rem" }}>Parent Email</label>
                        <input
                          type="email"
                          className="form-control"
                          value={editFormData.parentEmail || ""}
                          onChange={(e) => setEditFormData({ ...editFormData, parentEmail: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TEACHER EDIT FIELDS */}
              {editingUser.role === "teacher" && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                  <div className="form-group">
                    <label className="form-label">Department *</label>
                    <select
                      className="form-control"
                      value={editFormData.departmentId || ""}
                      onChange={(e) => setEditFormData({ ...editFormData, departmentId: e.target.value })}
                    >
                      {departments.map((d) => (
                        <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Designation *</label>
                    <select
                      className="form-control"
                      value={editFormData.designation || "Assistant Professor"}
                      onChange={(e) => setEditFormData({ ...editFormData, designation: e.target.value })}
                    >
                      <option value="Professor">Professor</option>
                      <option value="Associate Professor">Associate Professor</option>
                      <option value="Assistant Professor">Assistant Professor</option>
                      <option value="Lecturer">Lecturer</option>
                      <option value="Adjunct Faculty">Adjunct Faculty</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ gridColumn: "span 2" }}>
                    <label className="form-label">Assigned Divisions (comma-separated)</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editFormData.assignedDivisions || ""}
                      onChange={(e) => setEditFormData({ ...editFormData, assignedDivisions: e.target.value })}
                      placeholder="e.g. Sem 5 - Div A, Sem 6 - Div B"
                    />
                  </div>
                </div>
              )}

              {/* PARENT EDIT FIELDS */}
              {editingUser.role === "parent" && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                  <div className="form-group" style={{ gridColumn: "span 2" }}>
                    <label className="form-label">Linked Student / Ward *</label>
                    <select
                      className="form-control"
                      value={editFormData.studentId || ""}
                      onChange={(e) => {
                        const sId = e.target.value;
                        const targetStudent = users.find((u) => u.id === sId);
                        setEditFormData({
                          ...editFormData,
                          studentId: sId,
                          studentName: targetStudent ? targetStudent.name : "",
                          dob: targetStudent ? targetStudent.dob : editFormData.dob,
                          password: targetStudent ? targetStudent.dob : editFormData.password,
                          departmentId: targetStudent ? targetStudent.departmentId : editFormData.departmentId,
                          departmentName: targetStudent ? targetStudent.departmentName : editFormData.departmentName
                        });
                      }}
                    >
                      <option value="">-- Select Enrolled Student --</option>
                      {studentList.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} (Roll: {s.rollNo || s.prn} • {s.departmentName})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Relationship to Student</label>
                    <select
                      className="form-control"
                      value={editFormData.relation || "Father"}
                      onChange={(e) => setEditFormData({ ...editFormData, relation: e.target.value })}
                    >
                      <option value="Father">Father</option>
                      <option value="Mother">Mother</option>
                      <option value="Guardian">Guardian</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Parent Occupation</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editFormData.occupation || ""}
                      onChange={(e) => setEditFormData({ ...editFormData, occupation: e.target.value })}
                      placeholder="e.g. Agriculture / Business / Service"
                    />
                  </div>
                </div>
              )}

              {/* HOD EDIT FIELDS */}
              {editingUser.role === "hod" && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                  <div className="form-group">
                    <label className="form-label">Department Head Of *</label>
                    <select
                      className="form-control"
                      value={editFormData.departmentId || ""}
                      onChange={(e) => setEditFormData({ ...editFormData, departmentId: e.target.value })}
                    >
                      {departments.map((d) => (
                        <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Designation Title</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editFormData.designation || "Head of Department"}
                      onChange={(e) => setEditFormData({ ...editFormData, designation: e.target.value })}
                    />
                  </div>
                </div>
              )}

              {/* PRINCIPAL EDIT FIELDS */}
              {editingUser.role === "principal" && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                  <div className="form-group">
                    <label className="form-label">Designation Title</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editFormData.designation || "Principal & Academic Director"}
                      onChange={(e) => setEditFormData({ ...editFormData, designation: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">College / Institute Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editFormData.collegeName || "CSMSS Chh. Shahu College of Engineering"}
                      onChange={(e) => setEditFormData({ ...editFormData, collegeName: e.target.value })}
                    />
                  </div>
                </div>
              )}

              {/* ADMIN EDIT FIELDS */}
              {editingUser.role === "admin" && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                  <div className="form-group">
                    <label className="form-label">Designation Title</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editFormData.designation || "ERP & Systems Administrator"}
                      onChange={(e) => setEditFormData({ ...editFormData, designation: e.target.value })}
                    />
                  </div>
                </div>
              )}
            </div>
          </form>
        )}
      </Modal>

      {/* ==================================================== */}
      {/* ADD / PROVISION NEW USER MODAL                      */}
      {/* ==================================================== */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Provision New Stakeholder Account"
        maxWidth="780px"
        footer={
          <>
            <button type="button" onClick={() => setIsAddModalOpen(false)} className="btn btn-secondary btn-md">
              Cancel
            </button>
            <button type="button" onClick={handleSaveAdd} className="btn btn-primary btn-md" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <UserPlus size={16} />
              <span>Save & Provision Account</span>
            </button>
          </>
        }
      >
        <form onSubmit={handleSaveAdd} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Role Selector Header */}
          <div style={{ background: "var(--bg-surface-secondary)", padding: "16px", borderRadius: "12px", border: "1px solid var(--border-subtle)" }}>
            <label className="form-label" style={{ fontWeight: "700", marginBottom: "8px" }}>
              Select Stakeholder Role Category *
            </label>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {[
                { r: "student", label: "🎓 Student" },
                { r: "teacher", label: "👨‍🏫 Teacher / Faculty" },
                { r: "parent", label: "👨‍👩‍👧 Parent / Guardian" },
                { r: "hod", label: "🏛️ Head of Dept (HOD)" },
                { r: "principal", label: "🏫 Principal & Director" },
                { r: "admin", label: "⚙️ System Admin" }
              ].map(({ r, label }) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setAddFormData({ ...addFormData, role: r })}
                  className={`btn btn-sm ${addFormData.role === r ? "btn-primary" : "btn-secondary"}`}
                  style={{ fontWeight: "700", fontSize: "0.78rem" }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Credentials Info Callout Banner */}
          <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", padding: "12px 16px", borderRadius: "10px", fontSize: "0.82rem", color: "#1e40af" }}>
            {addFormData.role === "student" && (
              <div>
                <strong>🎓 Student Login Format:</strong> Username = <strong>PRN / Roll Number</strong> • Password = <strong>Birthdate (YYYY-MM-DD)</strong>
              </div>
            )}
            {addFormData.role === "parent" && (
              <div>
                <strong>👨‍👩‍👧 Parent Login Format:</strong> Username = <strong>Parent Mobile Number</strong> • Password = <strong>Linked Student's Birthdate (YYYY-MM-DD)</strong>
              </div>
            )}
            {addFormData.role === "teacher" && (
              <div>
                <strong>👨‍🏫 Teacher Login Format:</strong> Username = <strong>Faculty Mobile Number</strong> • Password = <strong>Teacher's Birthdate (YYYY-MM-DD)</strong>
              </div>
            )}
            {addFormData.role === "hod" && (
              <div>
                <strong>🏛️ HOD Login Format:</strong> Username = <strong>HOD Mobile Number</strong> • Password = <strong>HOD's Birthdate (YYYY-MM-DD)</strong>
              </div>
            )}
            {addFormData.role === "principal" && (
              <div>
                <strong>🏫 Principal Login Format:</strong> Username = <strong>Principal Mobile Number</strong> • Password = <strong>Principal's Birthdate (YYYY-MM-DD)</strong>
              </div>
            )}
            {addFormData.role === "admin" && (
              <div>
                <strong>⚙️ Admin Login Format:</strong> Username = <strong>admin</strong> • Password = <strong>admin123</strong>
              </div>
            )}
          </div>

          {/* Photo & Basic Info */}
          <div>
            <h4 style={{ fontSize: "0.95rem", fontWeight: "700", marginBottom: "12px", color: "var(--primary-800)" }}>
              1. Basic Information & Photo
            </h4>

            <div style={{ display: "flex", gap: "16px", alignItems: "center", marginBottom: "16px", background: "#f8fafc", padding: "12px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
              <img
                src={addFormData.avatar}
                alt="New User"
                style={{ width: "52px", height: "52px", borderRadius: "50%", objectFit: "cover", border: "2px solid #2563eb" }}
              />
              <input
                ref={addFileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAddPhotoUpload}
                style={{ display: "none" }}
              />
              <button
                type="button"
                onClick={() => addFileInputRef.current?.click()}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "6px" }}
              >
                <Upload size={13} /> Upload Photo from Gallery / Device
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  className="form-control"
                  value={addFormData.name}
                  onChange={(e) => setAddFormData({ ...addFormData, name: e.target.value })}
                  placeholder={addFormData.role === "parent" ? "e.g. Santosh Shinde" : "e.g. Aditya Shinde"}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="form-control"
                  value={addFormData.email}
                  onChange={(e) => setAddFormData({ ...addFormData, email: e.target.value })}
                  placeholder="name@campus.edu"
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  {addFormData.role === "student"
                    ? "Student Mobile Number"
                    : "Mobile Number (Login Username) *"}
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={addFormData.phone}
                  onChange={(e) => setAddFormData({ ...addFormData, phone: e.target.value })}
                  placeholder="e.g. 7378535499"
                  required={addFormData.role !== "student"}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  {addFormData.role === "parent"
                    ? "Student's Date of Birth (YYYY-MM-DD)"
                    : "Date of Birth (YYYY-MM-DD)"}
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={addFormData.dob}
                  onChange={(e) => setAddFormData({ ...addFormData, dob: e.target.value })}
                  placeholder="YYYY-MM-DD (e.g. 2004-08-22)"
                />
              </div>

              <div className="form-group" style={{ gridColumn: "span 2" }}>
                <label className="form-label" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontWeight: "700" }}>Account Password (Login Password) *</span>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ background: "none", border: "none", color: "#2563eb", cursor: "pointer", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "4px", fontWeight: "600" }}
                  >
                    {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                    {showPassword ? "Hide Password" : "Show Password"}
                  </button>
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    className="form-control"
                    value={addFormData.password}
                    onChange={(e) => setAddFormData({ ...addFormData, password: e.target.value })}
                    placeholder={
                      addFormData.role === "teacher" || addFormData.role === "hod" || addFormData.role === "principal"
                        ? "Enter custom password for faculty/HOD (or leave blank to use DOB)"
                        : "Enter login password (or leave blank to use DOB)"
                    }
                    style={{ paddingRight: "40px" }}
                  />
                  <Key size={16} color="#94a3b8" style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)" }} />
                </div>
                <small style={{ color: "#64748b", fontSize: "0.74rem", marginTop: "4px", display: "block" }}>
                  💡 Set an explicit password for {addFormData.role.toUpperCase()} login. If blank, DOB or default password will be assigned.
                </small>
              </div>

              <div className="form-group" style={{ gridColumn: "span 2" }}>
                <label className="form-label">Residential Address</label>
                <input
                  type="text"
                  className="form-control"
                  value={addFormData.address}
                  onChange={(e) => setAddFormData({ ...addFormData, address: e.target.value })}
                  placeholder="e.g. CSMSS Campus Area, Chhatrapati Sambhajinagar"
                />
              </div>
            </div>
          </div>

          {/* DYNAMIC ROLE-SPECIFIC INFORMATION */}
          <div>
            <h4 style={{ fontSize: "0.95rem", fontWeight: "700", marginBottom: "12px", color: "var(--primary-800)" }}>
              2. {addFormData.role.toUpperCase()} Specific Information
            </h4>

            {/* STUDENT SPECIFIC FORM */}
            {addFormData.role === "student" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div className="form-group">
                  <label className="form-label">PRN / Roll Number (Student Username) *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={addFormData.rollNo}
                    onChange={(e) => setAddFormData({ ...addFormData, rollNo: e.target.value, prn: e.target.value })}
                    placeholder="e.g. 24025331378056 or VLSI3152"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Department *</label>
                  <select
                    className="form-control"
                    value={addFormData.departmentId}
                    onChange={(e) => setAddFormData({ ...addFormData, departmentId: e.target.value })}
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Semester</label>
                  <select
                    className="form-control"
                    value={addFormData.semester}
                    onChange={(e) => setAddFormData({ ...addFormData, semester: e.target.value })}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <option key={s} value={s}>Semester {s}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Division</label>
                  <select
                    className="form-control"
                    value={addFormData.division}
                    onChange={(e) => setAddFormData({ ...addFormData, division: e.target.value })}
                  >
                    {["A", "B", "C", "D"].map((div) => (
                      <option key={div} value={div}>Division {div}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Current CGPA</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    className="form-control"
                    value={addFormData.cgpa}
                    onChange={(e) => setAddFormData({ ...addFormData, cgpa: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Blood Group</label>
                  <select
                    className="form-control"
                    value={addFormData.bloodGroup}
                    onChange={(e) => setAddFormData({ ...addFormData, bloodGroup: e.target.value })}
                  >
                    {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map((bg) => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>

                <div style={{ gridColumn: "span 2", background: "#fffbeb", padding: "14px", borderRadius: "8px", border: "1px solid #fde68a" }}>
                  <h5 style={{ fontSize: "0.85rem", fontWeight: "700", color: "#92400e", marginBottom: "8px" }}>
                    Linked Parent / Guardian Information (Auto-creates Parent Account)
                  </h5>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
                    <div>
                      <label className="form-label" style={{ fontSize: "0.75rem" }}>Parent Name</label>
                      <input
                        type="text"
                        className="form-control"
                        value={addFormData.parentName}
                        onChange={(e) => setAddFormData({ ...addFormData, parentName: e.target.value })}
                        placeholder="e.g. Santosh Shinde"
                      />
                    </div>
                    <div>
                      <label className="form-label" style={{ fontSize: "0.75rem" }}>Parent Mobile (Parent Username) *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={addFormData.parentPhone}
                        onChange={(e) => setAddFormData({ ...addFormData, parentPhone: e.target.value })}
                        placeholder="e.g. 9822000000"
                      />
                    </div>
                    <div>
                      <label className="form-label" style={{ fontSize: "0.75rem" }}>Parent Email</label>
                      <input
                        type="email"
                        className="form-control"
                        value={addFormData.parentEmail}
                        onChange={(e) => setAddFormData({ ...addFormData, parentEmail: e.target.value })}
                        placeholder="parent@gmail.com"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* PARENT SPECIFIC FORM */}
            {addFormData.role === "parent" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div className="form-group" style={{ gridColumn: "span 2" }}>
                  <label className="form-label" style={{ fontWeight: "700", color: "#92400e" }}>
                    Select Enrolled Student / Ward *
                  </label>
                  <select
                    className="form-control"
                    value={addFormData.studentId}
                    onChange={(e) => {
                      const sId = e.target.value;
                      const targetStudent = users.find((u) => u.id === sId);
                      if (targetStudent) {
                        setAddFormData({
                          ...addFormData,
                          studentId: sId,
                          studentName: targetStudent.name,
                          dob: targetStudent.dob || addFormData.dob,
                          password: targetStudent.dob || addFormData.password,
                          departmentId: targetStudent.departmentId,
                          departmentName: targetStudent.departmentName
                        });
                      } else {
                        setAddFormData({ ...addFormData, studentId: sId, studentName: "" });
                      }
                    }}
                    required
                  >
                    <option value="">-- Choose Enrolled Student --</option>
                    {studentList.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} (PRN/Roll: {s.rollNo || s.prn} • {s.departmentName})
                      </option>
                    ))}
                  </select>
                  {addFormData.studentId && (
                    <div style={{ marginTop: "6px", fontSize: "0.78rem", color: "#059669", fontWeight: "600" }}>
                      ✓ Linked to {addFormData.studentName} ({addFormData.departmentName}). Parent password automatically synced to student birthdate ({addFormData.dob || "Provided DOB"}).
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Relationship to Student</label>
                  <select
                    className="form-control"
                    value={addFormData.relation}
                    onChange={(e) => setAddFormData({ ...addFormData, relation: e.target.value })}
                  >
                    <option value="Father">Father</option>
                    <option value="Mother">Mother</option>
                    <option value="Guardian">Guardian</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Occupation</label>
                  <input
                    type="text"
                    className="form-control"
                    value={addFormData.occupation}
                    onChange={(e) => setAddFormData({ ...addFormData, occupation: e.target.value })}
                    placeholder="e.g. Farmer / Business / Service"
                  />
                </div>
              </div>
            )}

            {/* TEACHER SPECIFIC FORM */}
            {addFormData.role === "teacher" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div className="form-group">
                  <label className="form-label">Assigned Department *</label>
                  <select
                    className="form-control"
                    value={addFormData.departmentId}
                    onChange={(e) => setAddFormData({ ...addFormData, departmentId: e.target.value })}
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Designation *</label>
                  <select
                    className="form-control"
                    value={addFormData.designation}
                    onChange={(e) => setAddFormData({ ...addFormData, designation: e.target.value })}
                  >
                    <option value="Professor">Professor</option>
                    <option value="Associate Professor">Associate Professor</option>
                    <option value="Assistant Professor">Assistant Professor</option>
                    <option value="Lecturer">Lecturer</option>
                    <option value="Adjunct Faculty">Adjunct Faculty</option>
                  </select>
                </div>

                <div className="form-group" style={{ gridColumn: "span 2" }}>
                  <label className="form-label">Assigned Teaching Divisions / Batches</label>
                  <input
                    type="text"
                    className="form-control"
                    value={addFormData.assignedDivisions}
                    onChange={(e) => setAddFormData({ ...addFormData, assignedDivisions: e.target.value })}
                    placeholder="e.g. Sem 5 - Div A, Sem 6 - Div B"
                  />
                </div>
              </div>
            )}

            {/* HOD SPECIFIC FORM */}
            {addFormData.role === "hod" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div className="form-group">
                  <label className="form-label">Department Head Of *</label>
                  <select
                    className="form-control"
                    value={addFormData.departmentId}
                    onChange={(e) => setAddFormData({ ...addFormData, departmentId: e.target.value })}
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Designation Title</label>
                  <input
                    type="text"
                    className="form-control"
                    value={addFormData.designation || "Head of Department"}
                    onChange={(e) => setAddFormData({ ...addFormData, designation: e.target.value })}
                  />
                </div>
              </div>
            )}

            {/* PRINCIPAL SPECIFIC FORM */}
            {addFormData.role === "principal" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div className="form-group">
                  <label className="form-label">Designation Title</label>
                  <input
                    type="text"
                    className="form-control"
                    value={addFormData.designation || "Principal & Director"}
                    onChange={(e) => setAddFormData({ ...addFormData, designation: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">College / Institute Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={addFormData.collegeName || "CSMSS Chh. Shahu College of Engineering"}
                    onChange={(e) => setAddFormData({ ...addFormData, collegeName: e.target.value })}
                  />
                </div>
              </div>
            )}

            {/* ADMIN SPECIFIC FORM */}
            {addFormData.role === "admin" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div className="form-group">
                  <label className="form-label">Admin Username</label>
                  <input
                    type="text"
                    className="form-control"
                    value={addFormData.name}
                    onChange={(e) => setAddFormData({ ...addFormData, name: e.target.value })}
                    placeholder="admin"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Designation Title</label>
                  <input
                    type="text"
                    className="form-control"
                    value={addFormData.designation || "ERP & Systems Administrator"}
                    onChange={(e) => setAddFormData({ ...addFormData, designation: e.target.value })}
                  />
                </div>
              </div>
            )}
          </div>
        </form>
      </Modal>

      {/* ==================================================== */}
      {/* VIEW USER PROFILE INSPECTOR MODAL                    */}
      {/* ==================================================== */}
      <Modal
        isOpen={Boolean(viewingUser)}
        onClose={() => setViewingUser(null)}
        title={`Profile Inspector: ${viewingUser?.name}`}
        maxWidth="600px"
        footer={
          <>
            <button type="button" onClick={() => setViewingUser(null)} className="btn btn-secondary btn-md">
              Close
            </button>
            <button
              type="button"
              onClick={() => {
                const target = viewingUser;
                setViewingUser(null);
                handleOpenEdit(target);
              }}
              className="btn btn-primary btn-md"
              style={{ display: "flex", alignItems: "center", gap: "6px" }}
            >
              <Edit size={15} /> Edit This User & Photo
            </button>
          </>
        }
      >
        {viewingUser && (
          <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              {viewingUser.avatar ? (
                <img
                  src={viewingUser.avatar}
                  alt={viewingUser.name}
                  style={{ width: "64px", height: "64px", borderRadius: "50%", objectFit: "cover", border: "2px solid var(--primary-500)" }}
                />
              ) : (
                <div
                  style={{
                    width: "64px",
                    height: "64px",
                    borderRadius: "50%",
                    background: viewingUser.role === "student" ? "linear-gradient(135deg, #2563eb, #1d4ed8)" : "linear-gradient(135deg, #475569, #334155)",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "800",
                    fontSize: "1.3rem",
                    border: "2px solid var(--primary-500)",
                    flexShrink: 0
                  }}
                >
                  {viewingUser.name ? viewingUser.name.split(" ").slice(0, 2).map((n) => n[0]).join("") : "U"}
                </div>
              )}
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <h3 style={{ fontSize: "1.2rem", fontWeight: "800" }}>{viewingUser.name}</h3>
                  <Badge variant={getRoleBadgeVariant(viewingUser.role)}>{viewingUser.role.toUpperCase()}</Badge>
                </div>
                <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>{viewingUser.email}</div>
                <div style={{ fontSize: "0.78rem", color: "#94a3b8", fontFamily: "monospace" }}>ID: {viewingUser.id}</div>
              </div>
            </div>

            <div style={{ background: "var(--bg-surface-secondary)", padding: "16px", borderRadius: "10px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", fontSize: "0.85rem" }}>
              <div>
                <span style={{ color: "var(--text-muted)", display: "block", fontSize: "0.75rem" }}>Phone Number</span>
                <strong>{viewingUser.phone || "N/A"}</strong>
              </div>
              <div>
                <span style={{ color: "var(--text-muted)", display: "block", fontSize: "0.75rem" }}>Designation / Department</span>
                <strong>{viewingUser.departmentName || viewingUser.designation || viewingUser.collegeName || "N/A"}</strong>
              </div>
              {viewingUser.studentName && (
                <div style={{ gridColumn: "span 2" }}>
                  <span style={{ color: "var(--text-muted)", display: "block", fontSize: "0.75rem" }}>Linked Ward</span>
                  <strong style={{ color: "#d97706" }}>{viewingUser.studentName}</strong>
                </div>
              )}
              {viewingUser.address && (
                <div style={{ gridColumn: "span 2" }}>
                  <span style={{ color: "var(--text-muted)", display: "block", fontSize: "0.75rem" }}>Address</span>
                  <div>{viewingUser.address}</div>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

// =========================================================================
// 2. ADMIN DEPARTMENT MANAGEMENT (EDIT DEPARTMENT NAMES & CODES)
// =========================================================================
export function AdminDepartments() {
  const { departments, updateDepartment, addDepartment, deleteDepartment, users } = useSmartCampus();

  const defaultYearDivisions = {
    "1st Year": ["A", "B"],
    "2nd Year": ["A"],
    "3rd Year": ["A"],
    "4th Year": ["A"]
  };

  const [searchTerm, setSearchTerm] = useState("");
  const [editingDept, setEditingDept] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addFormData, setAddFormData] = useState({
    name: "",
    code: "",
    hod: "",
    firstYearHod: "Dr. R. S. Pawar",
    yearDivisions: { ...defaultYearDivisions },
    studentCount: 180,
    facultyCount: 12,
    avgAttendance: 80.0,
    avgMarks: 75.0
  });

  const filteredDepts = departments.filter((d) => {
    const term = searchTerm.toLowerCase();
    return (
      d.name.toLowerCase().includes(term) ||
      d.code.toLowerCase().includes(term) ||
      (d.hod && d.hod.toLowerCase().includes(term)) ||
      (d.firstYearHod && d.firstYearHod.toLowerCase().includes(term))
    );
  });

  const handleOpenEdit = (dept) => {
    setEditingDept(dept);
    const existing = dept.yearDivisions || {};
    setEditFormData({
      ...dept,
      hod: dept.hod || "",
      firstYearHod: dept.firstYearHod || "Dr. R. S. Pawar",
      yearDivisions: {
        "1st Year": Array.isArray(existing["1st Year"]) ? existing["1st Year"] : (dept.divisions || ["A", "B"]),
        "2nd Year": Array.isArray(existing["2nd Year"]) ? existing["2nd Year"] : (dept.divisions || ["A"]),
        "3rd Year": Array.isArray(existing["3rd Year"]) ? existing["3rd Year"] : (dept.divisions || ["A"]),
        "4th Year": Array.isArray(existing["4th Year"]) ? existing["4th Year"] : (dept.divisions || ["A"])
      }
    });
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editingDept) return;

    const yDivs = editFormData.yearDivisions || defaultYearDivisions;
    const allDivs = Array.from(new Set([
      ...(yDivs["1st Year"] || ["A"]),
      ...(yDivs["2nd Year"] || ["A"]),
      ...(yDivs["3rd Year"] || ["A"]),
      ...(yDivs["4th Year"] || ["A"])
    ]));

    updateDepartment(editingDept.id, {
      ...editFormData,
      divisions: allDivs,
      yearDivisions: yDivs,
      facultyCount: Number(editFormData.facultyCount || 0),
      avgAttendance: Number(editFormData.avgAttendance || 0),
      avgMarks: Number(editFormData.avgMarks || 0)
    });
    setEditingDept(null);
  };

  const handleSaveAdd = (e) => {
    e.preventDefault();
    const yDivs = addFormData.yearDivisions || defaultYearDivisions;
    const allDivs = Array.from(new Set([
      ...(yDivs["1st Year"] || ["A"]),
      ...(yDivs["2nd Year"] || ["A"]),
      ...(yDivs["3rd Year"] || ["A"]),
      ...(yDivs["4th Year"] || ["A"])
    ]));

    addDepartment({
      ...addFormData,
      divisions: allDivs,
      yearDivisions: yDivs,
      facultyCount: Number(addFormData.facultyCount || 0),
      avgAttendance: Number(addFormData.avgAttendance || 80.0),
      avgMarks: Number(addFormData.avgMarks || 75.0)
    });
    setIsAddModalOpen(false);
  };

  const handleDelete = (dept) => {
    const confirm = window.confirm(`Are you sure you want to delete the "${dept.name}" department?`);
    if (confirm) {
      deleteDepartment(dept.id);
    }
  };

  const getDeptStudents = (deptId) => users.filter((u) => u.role === "student" && u.departmentId === deptId);
  const getYearCounts = (deptId) => {
    const list = getDeptStudents(deptId);
    return {
      fe: list.filter((s) => s.year === "1st Year").length,
      se: list.filter((s) => s.year === "2nd Year").length,
      te: list.filter((s) => s.year === "3rd Year").length,
      be: list.filter((s) => s.year === "4th Year").length,
      total: list.length
    };
  };

  const enrolledStudentsTotal = users.filter((u) => u.role === "student").length;
  const totalFaculty = departments.reduce((acc, d) => acc + (d.facultyCount || 0), 0);
  const overallAvgAttendance = departments.length > 0 ? (departments.reduce((acc, d) => acc + (d.avgAttendance || 0), 0) / departments.length).toFixed(1) : 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
            <Badge variant="info">Academic Structure</Badge>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Institutional Configuration</span>
          </div>
          <h2 style={{ fontSize: "1.6rem", fontWeight: "800", color: "var(--text-main)" }}>
            Academic Departments Management
          </h2>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "2px" }}>
            Configure branches, assign active divisions (A, B, C), and track student enrollments across 1st, 2nd, 3rd & 4th year
          </p>
        </div>

        <button
          onClick={() => {
            setAddFormData({
              name: "",
              code: "",
              hod: "Dr. Shrikant Honade",
              firstYearHod: "Dr. R. S. Pawar",
              yearDivisions: { ...defaultYearDivisions },
              studentCount: 180,
              facultyCount: 12,
              avgAttendance: 80.0,
              avgMarks: 75.0
            });
            setIsAddModalOpen(true);
          }}
          className="btn btn-primary btn-sm"
          style={{ display: "flex", alignItems: "center", gap: "6px" }}
        >
          <PlusCircle size={15} /> Provision New Department
        </button>
      </div>

      {/* Summary Stat Cards */}
      <div className="stats-grid">
        <StatCard
          label="Total Departments"
          value={departments.length}
          subtext="Active engineering disciplines"
          icon={Building2}
          variant="purple"
        />
        <StatCard
          label="Total Enrolled Students"
          value={enrolledStudentsTotal}
          subtext="Verified student accounts"
          icon={Users}
          variant="primary"
        />
        <StatCard
          label="Total Faculty Members"
          value={totalFaculty}
          subtext="Teaching staff headcount"
          icon={GraduationCap}
          variant="warning"
        />
        <StatCard
          label="College Avg Attendance"
          value={`${overallAvgAttendance}%`}
          subtext="Cross-departmental metric"
          icon={TrendingUp}
          variant="success"
        />
      </div>

      {/* Search & Filter Bar */}
      <div className="card" style={{ padding: "14px 20px" }}>
        <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
          <Search size={18} color="var(--text-muted)" />
          <input
            type="text"
            className="form-control"
            style={{ flex: 1, border: "none", boxShadow: "none" }}
            placeholder="Search departments by name, code (e.g. VLSI, CE), or HOD..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Departments Table */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <Building2 size={18} color="var(--primary-600)" />
            <span>Configured Academic Departments ({filteredDepts.length})</span>
          </div>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Department Name & Code</th>
                <th>Divisions (Year-wise)</th>
                <th>Assigned HODs</th>
                <th>Enrolled by Year</th>
                <th>Faculty Count</th>
                <th>Avg Attendance</th>
                <th style={{ textAlign: "right", minWidth: "140px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDepts.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center", padding: "32px", color: "var(--text-muted)" }}>
                    No departments match your search query.
                  </td>
                </tr>
              ) : (
                filteredDepts.map((d) => {
                  const counts = getYearCounts(d.id);
                  const feDivs = getDepartmentYearDivisions(d, "1st Year");
                  const seDivs = getDepartmentYearDivisions(d, "2nd Year");
                  const teDivs = getDepartmentYearDivisions(d, "3rd Year");
                  const beDivs = getDepartmentYearDivisions(d, "4th Year");
                  return (
                    <tr key={d.id}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div
                            style={{
                              width: "40px",
                              height: "40px",
                              borderRadius: "10px",
                              background: "var(--primary-50)",
                              color: "var(--primary-700)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontWeight: "800",
                              fontSize: "0.85rem",
                              border: "1px solid var(--primary-200)"
                            }}
                          >
                            {d.code}
                          </div>
                          <div>
                            <strong style={{ fontSize: "0.95rem", color: "var(--text-main)" }}>{d.name}</strong>
                            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontFamily: "monospace" }}>ID: {d.id}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "0.75rem" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                            <span style={{ fontWeight: "700", color: "var(--primary-700)", minWidth: "26px" }}>FE:</span>
                            {feDivs.map((v) => (
                              <Badge key={v} variant="primary" style={{ padding: "1px 6px", fontSize: "0.7rem" }}>
                                {v}
                              </Badge>
                            ))}
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                            <span style={{ fontWeight: "600", color: "#64748b", minWidth: "26px" }}>SE:</span>
                            {seDivs.map((v) => (
                              <Badge key={v} variant="neutral" style={{ padding: "1px 6px", fontSize: "0.7rem" }}>
                                {v}
                              </Badge>
                            ))}
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                            <span style={{ fontWeight: "600", color: "#64748b", minWidth: "26px" }}>TE:</span>
                            {teDivs.map((v) => (
                              <Badge key={v} variant="neutral" style={{ padding: "1px 6px", fontSize: "0.7rem" }}>
                                {v}
                              </Badge>
                            ))}
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                            <span style={{ fontWeight: "600", color: "#64748b", minWidth: "26px" }}>BE:</span>
                            {beDivs.map((v) => (
                              <Badge key={v} variant="neutral" style={{ padding: "1px 6px", fontSize: "0.7rem" }}>
                                {v}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                          <div>
                            <div style={{ fontWeight: "700", fontSize: "0.85rem", color: "var(--text-main)" }}>
                              {d.hod || "Unassigned"}
                            </div>
                            <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Branch HOD (2nd, 3rd, 4th Year)</div>
                          </div>
                          <div style={{ borderTop: "1px dashed #e2e8f0", paddingTop: "3px" }}>
                            <div style={{ fontWeight: "600", fontSize: "0.82rem", color: "var(--primary-700)" }}>
                              {d.firstYearHod || "Dr. R. S. Pawar"}
                            </div>
                            <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>FE HOD (1st Year Students)</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div>
                          <div style={{ fontWeight: "700", fontSize: "0.88rem", color: "var(--text-main)", marginBottom: "3px" }}>
                            {counts.total} Registered
                          </div>
                          <div style={{ display: "flex", gap: "6px", fontSize: "0.75rem", color: "var(--text-muted)", flexWrap: "wrap" }}>
                            <span style={{ background: "#f1f5f9", padding: "2px 6px", borderRadius: "4px" }}>FE: <strong>{counts.fe}</strong></span>
                            <span style={{ background: "#f1f5f9", padding: "2px 6px", borderRadius: "4px" }}>SE: <strong>{counts.se}</strong></span>
                            <span style={{ background: "#f1f5f9", padding: "2px 6px", borderRadius: "4px" }}>TE: <strong>{counts.te}</strong></span>
                            <span style={{ background: "#f1f5f9", padding: "2px 6px", borderRadius: "4px" }}>BE: <strong>{counts.be}</strong></span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <strong>{d.facultyCount || 0}</strong>
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}> professors</span>
                      </td>
                      <td>
                        <Badge variant={d.avgAttendance >= 75 ? "success" : "danger"}>
                          {d.avgAttendance}%
                        </Badge>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <div style={{ display: "inline-flex", gap: "6px" }}>
                          <button
                            onClick={() => handleOpenEdit(d)}
                            className="btn btn-primary btn-sm"
                            style={{ display: "flex", alignItems: "center", gap: "4px", padding: "4px 10px", fontSize: "0.75rem" }}
                            title={`Edit ${d.name}`}
                          >
                            <Edit size={13} />
                            <span>Edit</span>
                          </button>

                          <button
                            onClick={() => handleDelete(d)}
                            className="btn btn-danger btn-sm"
                            style={{ padding: "4px 8px", fontSize: "0.75rem" }}
                            title="Delete department"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ==================================================== */}
      {/* EDIT DEPARTMENT MODAL                                */}
      {/* ==================================================== */}
      <Modal
        isOpen={Boolean(editingDept)}
        onClose={() => setEditingDept(null)}
        title={`Edit Department: ${editingDept?.name}`}
        maxWidth="750px"
        footer={
          <>
            <button type="button" onClick={() => setEditingDept(null)} className="btn btn-secondary btn-md">
              Cancel
            </button>
            <button type="button" onClick={handleSaveEdit} className="btn btn-primary btn-md" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Save size={16} />
              <span>Save Department Changes</span>
            </button>
          </>
        }
      >
        {editingDept && (
          <form onSubmit={handleSaveEdit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            <div style={{ background: "var(--bg-surface-secondary)", padding: "14px", borderRadius: "10px", border: "1px solid var(--border-subtle)", fontSize: "0.82rem", color: "var(--text-muted)" }}>
              💡 Configure year-wise divisions independently. 1st Year students are automatically linked to the <strong>First Year HOD</strong>, while 2nd, 3rd & 4th Year students report to the <strong>Branch HOD</strong>.
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "14px" }}>
              <div className="form-group">
                <label className="form-label">Department Name *</label>
                <input
                  type="text"
                  className="form-control"
                  value={editFormData.name || ""}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  placeholder="e.g. Electronic Engineering (VLSI)"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Dept Code *</label>
                <input
                  type="text"
                  className="form-control"
                  value={editFormData.code || ""}
                  onChange={(e) => setEditFormData({ ...editFormData, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. VLSI, CE"
                  required
                />
              </div>
            </div>

            {/* HOD Configuration: Branch HOD + First Year HOD */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
              <div className="form-group">
                <label className="form-label">Branch HOD (2nd, 3rd, 4th Year)</label>
                <input
                  type="text"
                  className="form-control"
                  value={editFormData.hod || ""}
                  onChange={(e) => setEditFormData({ ...editFormData, hod: e.target.value })}
                  placeholder="e.g. Dr. Shrikant Honade"
                />
                <small style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "2px", display: "block" }}>
                  Shown to SE, TE, and BE students of this department.
                </small>
              </div>

              <div className="form-group">
                <label className="form-label">First Year HOD (FE Coordinator)</label>
                <input
                  type="text"
                  className="form-control"
                  value={editFormData.firstYearHod || ""}
                  onChange={(e) => setEditFormData({ ...editFormData, firstYearHod: e.target.value })}
                  placeholder="e.g. Dr. R. S. Pawar"
                />
                <small style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "2px", display: "block" }}>
                  Shown to ALL 1st Year (FE) students as their designated HOD.
                </small>
              </div>
            </div>

            {/* Year-Wise Division Setting (4 Years) */}
            <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <div>
                  <label style={{ fontSize: "0.88rem", fontWeight: "700", color: "#1e293b", margin: 0 }}>
                    Year-Wise Division Configuration (All 4 Years)
                  </label>
                  <p style={{ fontSize: "0.75rem", color: "#64748b", margin: "2px 0 0 0" }}>
                    Configure how many divisions exist for 1st, 2nd, 3rd and 4th Year individually.
                  </p>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px" }}>
                {ACADEMIC_YEARS.map((yr) => {
                  const currentDivs = editFormData.yearDivisions?.[yr.key] || ["A"];
                  const currentCount = currentDivs.length;
                  return (
                    <div
                      key={yr.key}
                      style={{
                        background: yr.key === "1st Year" ? "#eff6ff" : "#ffffff",
                        border: yr.key === "1st Year" ? "1px solid #93c5fd" : "1px solid #cbd5e1",
                        borderRadius: "8px",
                        padding: "10px 12px"
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                        <span style={{ fontWeight: "700", fontSize: "0.82rem", color: yr.key === "1st Year" ? "#1d4ed8" : "#334155" }}>
                          {yr.label}
                        </span>
                        <Badge variant={yr.key === "1st Year" ? "primary" : "neutral"} style={{ fontSize: "0.68rem" }}>
                          {currentDivs.join(", ")}
                        </Badge>
                      </div>

                      <select
                        className="form-control"
                        style={{ fontSize: "0.82rem", padding: "6px 8px" }}
                        value={currentCount}
                        onChange={(e) => {
                          const count = Number(e.target.value);
                          const newDivs = getDivisionsFromCount(count);
                          setEditFormData((prev) => ({
                            ...prev,
                            yearDivisions: {
                              ...(prev.yearDivisions || defaultYearDivisions),
                              [yr.key]: newDivs
                            }
                          }));
                        }}
                      >
                        {DIVISION_OPTIONS.map((opt) => (
                          <option key={opt.count} value={opt.count}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
              <div className="form-group">
                <label className="form-label">Faculty Headcount</label>
                <input
                  type="number"
                  className="form-control"
                  value={editFormData.facultyCount ?? 0}
                  onChange={(e) => setEditFormData({ ...editFormData, facultyCount: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Average Attendance Target (%)</label>
                <input
                  type="number"
                  step="0.1"
                  className="form-control"
                  value={editFormData.avgAttendance ?? 80.0}
                  onChange={(e) => setEditFormData({ ...editFormData, avgAttendance: e.target.value })}
                />
              </div>
            </div>

            {/* Current Year-Wise Student Enrollment Breakdown */}
            <div style={{ background: "#f8fafc", padding: "14px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
              <label style={{ fontSize: "0.8rem", fontWeight: "700", color: "#334155", display: "block", marginBottom: "8px" }}>
                Current Registered Students Breakdown by Year:
              </label>
              {(() => {
                const c = getYearCounts(editingDept.id);
                return (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px", textAlign: "center" }}>
                    <div style={{ background: "#fff", padding: "8px", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
                      <div style={{ fontSize: "0.72rem", color: "#64748b" }}>1st Year (FE)</div>
                      <div style={{ fontSize: "1.1rem", fontWeight: "800", color: "#2563eb" }}>{c.fe}</div>
                    </div>
                    <div style={{ background: "#fff", padding: "8px", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
                      <div style={{ fontSize: "0.72rem", color: "#64748b" }}>2nd Year (SE)</div>
                      <div style={{ fontSize: "1.1rem", fontWeight: "800", color: "#2563eb" }}>{c.se}</div>
                    </div>
                    <div style={{ background: "#fff", padding: "8px", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
                      <div style={{ fontSize: "0.72rem", color: "#64748b" }}>3rd Year (TE)</div>
                      <div style={{ fontSize: "1.1rem", fontWeight: "800", color: "#2563eb" }}>{c.te}</div>
                    </div>
                    <div style={{ background: "#fff", padding: "8px", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
                      <div style={{ fontSize: "0.72rem", color: "#64748b" }}>4th Year (BE)</div>
                      <div style={{ fontSize: "1.1rem", fontWeight: "800", color: "#2563eb" }}>{c.be}</div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </form>
        )}
      </Modal>

      {/* ==================================================== */}
      {/* ADD DEPARTMENT MODAL                                 */}
      {/* ==================================================== */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Provision New Academic Department"
        maxWidth="750px"
        footer={
          <>
            <button type="button" onClick={() => setIsAddModalOpen(false)} className="btn btn-secondary btn-md">
              Cancel
            </button>
            <button type="button" onClick={handleSaveAdd} className="btn btn-primary btn-md" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <PlusCircle size={16} />
              <span>Create Department</span>
            </button>
          </>
        }
      >
        <form onSubmit={handleSaveAdd} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "14px" }}>
            <div className="form-group">
              <label className="form-label">Department Name *</label>
              <input
                type="text"
                className="form-control"
                value={addFormData.name}
                onChange={(e) => setAddFormData({ ...addFormData, name: e.target.value })}
                placeholder="e.g. Computer Engineering"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Dept Code *</label>
              <input
                type="text"
                className="form-control"
                value={addFormData.code}
                onChange={(e) => setAddFormData({ ...addFormData, code: e.target.value.toUpperCase() })}
                placeholder="e.g. CE, CSE"
                required
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <div className="form-group">
              <label className="form-label">Branch HOD (2nd, 3rd, 4th Year)</label>
              <input
                type="text"
                className="form-control"
                value={addFormData.hod}
                onChange={(e) => setAddFormData({ ...addFormData, hod: e.target.value })}
                placeholder="e.g. Dr. A. P. Deshmukh"
              />
              <small style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "2px", display: "block" }}>
                Reports for higher years (SE, TE, BE).
              </small>
            </div>

            <div className="form-group">
              <label className="form-label">First Year HOD (FE Coordinator)</label>
              <input
                type="text"
                className="form-control"
                value={addFormData.firstYearHod}
                onChange={(e) => setAddFormData({ ...addFormData, firstYearHod: e.target.value })}
                placeholder="e.g. Dr. R. S. Pawar"
              />
              <small style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "2px", display: "block" }}>
                Designated HOD for 1st Year (FE) students.
              </small>
            </div>
          </div>

          {/* Year-Wise Division Setting (All 4 Years) */}
          <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
            <div style={{ marginBottom: "12px" }}>
              <label style={{ fontSize: "0.88rem", fontWeight: "700", color: "#1e293b", margin: 0 }}>
                Set Divisions for Each Year (1st, 2nd, 3rd & 4th Year)
              </label>
              <p style={{ fontSize: "0.75rem", color: "#64748b", margin: "2px 0 0 0" }}>
                Each year can have different division counts (e.g. 1st Year: Div A & B, 2nd Year: Div A only).
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px" }}>
              {ACADEMIC_YEARS.map((yr) => {
                const currentDivs = addFormData.yearDivisions?.[yr.key] || ["A"];
                const currentCount = currentDivs.length;
                return (
                  <div
                    key={yr.key}
                    style={{
                      background: yr.key === "1st Year" ? "#eff6ff" : "#ffffff",
                      border: yr.key === "1st Year" ? "1px solid #93c5fd" : "1px solid #cbd5e1",
                      borderRadius: "8px",
                      padding: "10px 12px"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                      <span style={{ fontWeight: "700", fontSize: "0.82rem", color: yr.key === "1st Year" ? "#1d4ed8" : "#334155" }}>
                        {yr.label}
                      </span>
                      <Badge variant={yr.key === "1st Year" ? "primary" : "neutral"} style={{ fontSize: "0.68rem" }}>
                        {currentDivs.join(", ")}
                      </Badge>
                    </div>

                    <select
                      className="form-control"
                      style={{ fontSize: "0.82rem", padding: "6px 8px" }}
                      value={currentCount}
                      onChange={(e) => {
                        const count = Number(e.target.value);
                        const newDivs = getDivisionsFromCount(count);
                        setAddFormData((prev) => ({
                          ...prev,
                          yearDivisions: {
                            ...(prev.yearDivisions || defaultYearDivisions),
                            [yr.key]: newDivs
                          }
                        }));
                      }}
                    >
                      {DIVISION_OPTIONS.map((opt) => (
                        <option key={opt.count} value={opt.count}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <div className="form-group">
              <label className="form-label">Faculty Headcount</label>
              <input
                type="number"
                className="form-control"
                value={addFormData.facultyCount}
                onChange={(e) => setAddFormData({ ...addFormData, facultyCount: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Initial Avg Attendance (%)</label>
              <input
                type="number"
                step="0.1"
                className="form-control"
                value={addFormData.avgAttendance}
                onChange={(e) => setAddFormData({ ...addFormData, avgAttendance: e.target.value })}
              />
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}

// =========================================================================
// 3. ADMIN AUDIT LOGS COMPONENT
// =========================================================================
export function AdminAuditLogs() {
  const { auditLogs } = useSmartCampus();
  const [filterModule, setFilterModule] = useState("all");

  const filtered = auditLogs.filter((l) => {
    if (filterModule === "all") return true;
    return l.module === filterModule;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: "800", color: "var(--text-main)" }}>
            Institutional Audit Trail & Compliance Ledger
          </h2>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "4px" }}>
            Immutable trace recording actor, action, timestamp, and module for complete accountability
          </p>
        </div>

        <button onClick={() => alert("Downloading CSV Audit Logs...")} className="btn btn-secondary btn-sm">
          <Download size={14} /> Export Audit Trail
        </button>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <FileText size={18} color="var(--primary-600)" />
            Logged System Actions ({filtered.length})
          </div>

          <select
            className="form-control"
            style={{ width: "180px", fontSize: "0.82rem" }}
            value={filterModule}
            onChange={(e) => setFilterModule(e.target.value)}
          >
            <option value="all">All Modules</option>
            <option value="Attendance">Attendance</option>
            <option value="Marks">Marks</option>
            <option value="Leave">Leave</option>
            <option value="Complaints">Complaints</option>
            <option value="Settings">Settings</option>
            <option value="User Management">User Management</option>
            <option value="Academic Structure">Academic Structure</option>
          </select>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Actor User</th>
                <th>Role</th>
                <th>Action Taken</th>
                <th>Action Details</th>
                <th>Module</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((log) => (
                <tr key={log.id}>
                  <td>
                    <span style={{ fontFamily: "monospace", fontSize: "0.78rem" }}>{log.timestamp}</span>
                  </td>
                  <td><strong>{log.user}</strong></td>
                  <td><Badge variant="gray">{log.role}</Badge></td>
                  <td><Badge variant="purple">{log.action}</Badge></td>
                  <td><span style={{ fontSize: "0.85rem" }}>{log.details}</span></td>
                  <td><Badge variant="info">{log.module}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

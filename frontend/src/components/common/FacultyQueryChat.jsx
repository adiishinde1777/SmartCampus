import React, { useState, useEffect, useMemo } from "react";
import { useSmartCampus } from "../../context/SmartCampusContext";
import {
  MessageSquare,
  Send,
  User,
  Users,
  Search,
  ShieldCheck,
  GraduationCap,
  Building2,
  CheckCheck,
  Clock,
  Sparkles,
  Info,
  ChevronRight,
  Filter,
  PlusCircle,
  HelpCircle,
  ArrowRight,
  Lock,
  MessageCircle
} from "lucide-react";
import { Badge } from "./UIPrimitives";
import { getEffectiveHOD } from "../../utils/departmentUtils";

export default function FacultyQueryChat({ onNavigate, initialRecipientId = null }) {
  const {
    currentUser,
    users = [],
    departments = [],
    directMessages = [],
    sendDirectMessage,
    markMessagesAsRead,
    systemSettings
  } = useSmartCampus();

  const role = currentUser?.role || "student";
  const myDeptId = currentUser?.departmentId || "dept-vlsi";
  const studentDept = departments.find((d) => d.id === myDeptId) || {
    id: myDeptId,
    name: currentUser?.departmentName || "Electronic Engineering (VLSI Design And Technology)",
    code: "VLSI",
    hod: "Dr. Shrikant Honade",
    firstYearHod: "Dr. R. S. Pawar"
  };

  const myDeptName = currentUser?.departmentName || studentDept.name;

  const effectiveHOD = getEffectiveHOD({
    studentYear: currentUser?.year,
    department: studentDept,
    users,
    systemSettings
  });

  // Strict Same Department Matcher (फक्त आपल्याच डिपार्टमेंटच्या फॅकल्टी, HOD आणि विद्यार्थ्यांसाठी)
  const isSameDept = (u) => {
    if (!u) return false;
    // Principal has college-wide authority
    if (u.role === "principal") return true;

    // First Year HOD exception for 1st Year students
    if (
      (u.isFirstYearHOD || u.departmentId === "dept-fe" || (u.designation && u.designation.toLowerCase().includes("first year"))) &&
      (currentUser?.year === "1st Year" || currentUser?.year === "First Year")
    ) {
      return true;
    }

    if (u.departmentId && myDeptId) {
      return u.departmentId === myDeptId;
    }
    if (u.departmentName && myDeptName) {
      return (
        u.departmentName.toLowerCase().includes(myDeptName.toLowerCase()) ||
        myDeptName.toLowerCase().includes(u.departmentName.toLowerCase())
      );
    }
    return u.departmentId === "dept-vlsi" || myDeptId === "dept-vlsi";
  };

  // Build eligible contacts strictly within current user's department
  const eligibleRecipients = useMemo(() => {
    let list = [];

    // Baseline designated HOD & Principal fallbacks
    const defaultHOD = {
      id: "fac-hod-vlsi",
      name: effectiveHOD.name || "Dr. Shrikant Honade",
      role: "hod",
      designation: "Head of Department (HOD)",
      departmentId: myDeptId,
      departmentName: myDeptName,
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80"
    };

    const defaultPrincipal = {
      id: "fac-principal",
      name: "Dr. S. K. Patil",
      role: "principal",
      designation: "Principal & Director",
      departmentName: "CSMSS Chh. Shahu College of Engineering",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80"
    };

    // Department faculty fallbacks if database is currently clean
    const defaultTeachers = [
      {
        id: "fac-prof-kulkarni",
        name: "Prof. S. P. Kulkarni",
        role: "teacher",
        designation: "Assistant Professor (VLSI & Embedded Systems)",
        departmentId: myDeptId,
        departmentName: myDeptName,
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80"
      },
      {
        id: "fac-prof-deshmukh",
        name: "Prof. Priya Deshmukh",
        role: "teacher",
        designation: "Assistant Professor (CMOS & Analog Layout)",
        departmentId: myDeptId,
        departmentName: myDeptName,
        avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80"
      }
    ];

    const registeredTeachers = users.filter((u) => u.role === "teacher" && u.id !== currentUser?.id && isSameDept(u));
    const registeredHODs = users.filter((u) => u.role === "hod" && u.id !== currentUser?.id && isSameDept(u));
    const registeredPrincipals = users.filter((u) => u.role === "principal" && u.id !== currentUser?.id);
    const registeredStudents = users.filter((u) => u.role === "student" && u.id !== currentUser?.id && isSameDept(u));

    if (role === "student") {
      // Student can ONLY talk with Teachers & HOD of their own department
      list = [...registeredHODs, ...registeredTeachers];
      if (!list.some((u) => u.role === "hod")) {
        list.unshift(defaultHOD);
      }
      if (!list.some((u) => u.role === "teacher")) {
        list.push(...defaultTeachers);
      }
    } else if (role === "teacher") {
      // Teacher can chat with:
      // 1. HOD of their department
      // 2. Principal
      // 3. Fellow Teachers of their department
      // 4. Students of their department (open personal chat - either can message first)
      list = [...registeredHODs, ...registeredPrincipals, ...registeredTeachers, ...registeredStudents];
      if (!list.some((u) => u.role === "hod")) list.unshift(defaultHOD);
      if (!list.some((u) => u.role === "principal")) list.push(defaultPrincipal);
      if (!list.some((u) => u.role === "teacher")) list.push(...defaultTeachers);

      // Ensure at least baseline student is visible if none in state
      if (!list.some((u) => u.role === "student")) {
        list.push({
          id: "stu-1",
          name: "Aditya Shinde",
          role: "student",
          designation: "Student (VL3152)",
          departmentId: myDeptId,
          departmentName: myDeptName,
          avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80"
        });
      }
    } else if (role === "hod") {
      // HOD can chat with Principal, Teachers of their department, and Students of their department
      list = [...registeredPrincipals, ...registeredTeachers, ...registeredStudents];
      if (!list.some((u) => u.role === "principal")) list.unshift(defaultPrincipal);
      if (!list.some((u) => u.role === "teacher")) list.push(...defaultTeachers);
      if (!list.some((u) => u.role === "student")) {
        list.push({
          id: "stu-1",
          name: "Aditya Shinde",
          role: "student",
          designation: "Student (VL3152)",
          departmentId: myDeptId,
          departmentName: myDeptName,
          avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80"
        });
      }
    } else if (role === "principal") {
      // Principal can chat with HODs and Teachers
      list = [...registeredHODs, ...registeredTeachers];
      if (!list.some((u) => u.role === "hod")) list.unshift(defaultHOD);
      if (!list.some((u) => u.role === "teacher")) list.push(...defaultTeachers);
    } else {
      list = users.filter((u) => u.id !== currentUser?.id);
    }

    return list;
  }, [role, users, currentUser, effectiveHOD, myDeptId, myDeptName]);

  // Selected active conversation partner
  const [selectedRecipientId, setSelectedRecipientId] = useState(
    initialRecipientId || (eligibleRecipients[0]?.id || null)
  );

  const [messageText, setMessageText] = useState("");
  const [queryCategory, setQueryCategory] = useState("Academic Guidance");
  const [searchFilter, setSearchFilter] = useState("");
  const [roleTabFilter, setRoleTabFilter] = useState("all");

  const activePartner = eligibleRecipients.find((r) => r.id === selectedRecipientId) || eligibleRecipients[0];

  // Auto-mark incoming messages from activePartner as read
  useEffect(() => {
    if (activePartner?.id && markMessagesAsRead) {
      markMessagesAsRead(activePartner.id);
    }
  }, [activePartner?.id]);

  // Conversation thread
  const conversationMessages = useMemo(() => {
    if (!activePartner) return [];
    return directMessages
      .filter(
        (m) =>
          (m.senderId === currentUser?.id && m.recipientId === activePartner.id) ||
          (m.senderId === activePartner.id && m.recipientId === currentUser?.id)
      )
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  }, [directMessages, currentUser, activePartner]);

  // Handle Send Query / Chat message
  const handleSendMessage = (e, quickText = null) => {
    if (e) e.preventDefault();
    const textToSend = quickText || messageText;
    if (!textToSend.trim() || !activePartner) return;

    sendDirectMessage({
      recipientId: activePartner.id,
      recipientName: activePartner.name,
      recipientRole: activePartner.role,
      message: textToSend,
      subject: `${queryCategory} Query`,
      category: queryCategory
    });

    setMessageText("");
  };

  const getRoleBadge = (partnerRole) => {
    switch (partnerRole) {
      case "hod":
        return (
          <span style={{ background: "#fef3c7", color: "#b45309", padding: "2px 8px", borderRadius: "10px", fontSize: "0.72rem", fontWeight: "800" }}>
            🏛️ Head of Dept (HOD)
          </span>
        );
      case "principal":
        return (
          <span style={{ background: "#dcfce7", color: "#15803d", padding: "2px 8px", borderRadius: "10px", fontSize: "0.72rem", fontWeight: "800" }}>
            🎓 Principal & Director
          </span>
        );
      case "teacher":
        return (
          <span style={{ background: "#ede9fe", color: "#6d28d9", padding: "2px 8px", borderRadius: "10px", fontSize: "0.72rem", fontWeight: "800" }}>
            👨‍🏫 Professor / Faculty
          </span>
        );
      case "student":
        return (
          <span style={{ background: "#dbeafe", color: "#1d4ed8", padding: "2px 8px", borderRadius: "10px", fontSize: "0.72rem", fontWeight: "800" }}>
            🎒 Student
          </span>
        );
      default:
        return (
          <span style={{ background: "#f1f5f9", color: "#475569", padding: "2px 8px", borderRadius: "10px", fontSize: "0.72rem", fontWeight: "800" }}>
            Staff
          </span>
        );
    }
  };

  // Role Tab Filter for contacts list
  const tabFilteredRecipients = useMemo(() => {
    return eligibleRecipients.filter((r) => {
      const matchesSearch =
        !searchFilter.trim() ||
        r.name?.toLowerCase().includes(searchFilter.toLowerCase()) ||
        r.designation?.toLowerCase().includes(searchFilter.toLowerCase()) ||
        r.role?.toLowerCase().includes(searchFilter.toLowerCase());

      if (!matchesSearch) return false;

      if (roleTabFilter === "all") return true;
      if (roleTabFilter === "hod") return r.role === "hod";
      if (roleTabFilter === "faculty") return r.role === "teacher" || r.role === "hod";
      if (roleTabFilter === "teachers") return r.role === "teacher";
      if (roleTabFilter === "students") return r.role === "student";
      return true;
    });
  }, [eligibleRecipients, searchFilter, roleTabFilter]);

  // Suggested Prompts based on who is chatting with whom
  const quickSuggestions = useMemo(() => {
    if (!activePartner) return [];
    if (activePartner.role === "student") {
      return [
        "Please meet me in the staff room after lecture",
        "Kindly submit your pending assignment by tomorrow",
        "Regarding your attendance in practical sessions",
        "Well done on your Unit Test score!"
      ];
    }
    if (activePartner.role === "hod") {
      return [
        "Respected Sir, requesting guidance regarding project review",
        "Sir, submitting official query regarding syllabus completion",
        "Requesting approval for academic seminar participation"
      ];
    }
    // Teacher
    return [
      "Sir/Madam, I had a doubt regarding today's lecture",
      "Regarding assignment submission deadline extension",
      "Requesting guidance on lab practical experiment",
      "When can I meet you in the department for doubt clearing?"
    ];
  }, [activePartner]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "18px", height: "calc(100vh - 150px)" }}>
      {/* Header Banner with Department Lock */}
      <div
        style={{
          background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 60%, #1e40af 100%)",
          borderRadius: "16px",
          padding: "20px 24px",
          color: "white",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "14px",
          boxShadow: "0 10px 25px -5px rgba(30, 27, 75, 0.3)"
        }}
      >
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(255,255,255,0.15)", padding: "3px 10px", borderRadius: "16px", fontSize: "0.74rem", fontWeight: "800", marginBottom: "6px", color: "#c7d2fe" }}>
            <Lock size={12} />
            DEPARTMENT EXCLUSIVE • {myDeptName.toUpperCase()}
          </div>
          <h2 style={{ fontSize: "1.45rem", fontWeight: "800", margin: "2px 0 4px 0", color: "#ffffff" }}>
            {role === "student"
              ? "Open 1-on-1 Chat with Department Faculty & HOD"
              : role === "teacher"
              ? "Open Department Messaging (Students, HOD & Faculty)"
              : "Department Communication & Mentorship Portal"}
          </h2>
          <p style={{ margin: 0, fontSize: "0.84rem", color: "#cbd5e1" }}>
            🔒 <strong>Strict Department Protocol:</strong> You can only message faculty, HOD, and students belonging to <strong>{myDeptName}</strong>. No outsider cross-department communication.
          </p>
        </div>

        {/* Live status badge */}
        <div style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.25)", borderRadius: "12px", padding: "8px 16px", fontSize: "0.8rem", textAlign: "right" }}>
          <div style={{ color: "#86efac", fontWeight: "800", display: "flex", alignItems: "center", gap: "6px", justifyContent: "flex-end" }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#22c55e", display: "inline-block" }} />
            Open 1-on-1 Chat Active
          </div>
          <div style={{ color: "#e2e8f0", fontSize: "0.74rem", marginTop: "2px" }}>
            Anyone can initiate personal message
          </div>
        </div>
      </div>

      {/* Main Chat Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "330px 1fr",
          gap: "18px",
          flex: 1,
          minHeight: 0,
          background: "white",
          borderRadius: "16px",
          border: "1px solid #e2e8f0",
          overflow: "hidden",
          boxShadow: "0 4px 20px rgba(0,0,0,0.04)"
        }}
      >
        {/* Left Contacts Sidebar */}
        <div style={{ borderRight: "1px solid #e2e8f0", display: "flex", flexDirection: "column", height: "100%", background: "#f8fafc" }}>
          {/* Search Contacts */}
          <div style={{ padding: "14px", borderBottom: "1px solid #e2e8f0", background: "white" }}>
            <div style={{ position: "relative" }}>
              <Search size={15} style={{ position: "absolute", left: "10px", top: "10px", color: "#94a3b8" }} />
              <input
                type="text"
                placeholder={role === "student" ? "Search your faculty / HOD..." : "Search contact..."}
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 12px 8px 32px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "0.82rem",
                  background: "#f8fafc"
                }}
              />
            </div>

            {/* Role Filter Tabs */}
            <div style={{ display: "flex", gap: "4px", marginTop: "10px", overflowX: "auto" }}>
              <button
                onClick={() => setRoleTabFilter("all")}
                style={{
                  padding: "4px 10px",
                  borderRadius: "6px",
                  fontSize: "0.72rem",
                  fontWeight: "700",
                  border: "none",
                  cursor: "pointer",
                  background: roleTabFilter === "all" ? "#4f46e5" : "#e2e8f0",
                  color: roleTabFilter === "all" ? "white" : "#475569"
                }}
              >
                All ({eligibleRecipients.length})
              </button>

              {(role === "teacher" || role === "hod") ? (
                <>
                  <button
                    onClick={() => setRoleTabFilter("students")}
                    style={{
                      padding: "4px 10px",
                      borderRadius: "6px",
                      fontSize: "0.72rem",
                      fontWeight: "700",
                      border: "none",
                      cursor: "pointer",
                      background: roleTabFilter === "students" ? "#4f46e5" : "#e2e8f0",
                      color: roleTabFilter === "students" ? "white" : "#475569"
                    }}
                  >
                    🎒 Students ({eligibleRecipients.filter((r) => r.role === "student").length})
                  </button>
                  <button
                    onClick={() => setRoleTabFilter("faculty")}
                    style={{
                      padding: "4px 10px",
                      borderRadius: "6px",
                      fontSize: "0.72rem",
                      fontWeight: "700",
                      border: "none",
                      cursor: "pointer",
                      background: roleTabFilter === "faculty" ? "#4f46e5" : "#e2e8f0",
                      color: roleTabFilter === "faculty" ? "white" : "#475569"
                    }}
                  >
                    👨‍🏫 Faculty & HOD
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setRoleTabFilter("hod")}
                    style={{
                      padding: "4px 10px",
                      borderRadius: "6px",
                      fontSize: "0.72rem",
                      fontWeight: "700",
                      border: "none",
                      cursor: "pointer",
                      background: roleTabFilter === "hod" ? "#4f46e5" : "#e2e8f0",
                      color: roleTabFilter === "hod" ? "white" : "#475569"
                    }}
                  >
                    🏛️ HOD
                  </button>
                  <button
                    onClick={() => setRoleTabFilter("teachers")}
                    style={{
                      padding: "4px 10px",
                      borderRadius: "6px",
                      fontSize: "0.72rem",
                      fontWeight: "700",
                      border: "none",
                      cursor: "pointer",
                      background: roleTabFilter === "teachers" ? "#4f46e5" : "#e2e8f0",
                      color: roleTabFilter === "teachers" ? "white" : "#475569"
                    }}
                  >
                    👨‍🏫 Professors
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Contacts List */}
          <div style={{ flex: 1, overflowY: "auto", padding: "8px" }}>
            {tabFilteredRecipients.map((partner) => {
              const isSelected = activePartner?.id === partner.id;

              // Check unread count
              const unreadCount = directMessages.filter(
                (m) => m.senderId === partner.id && m.recipientId === currentUser?.id && !m.read
              ).length;

              // Last message preview
              const partnerMsgs = directMessages.filter(
                (m) =>
                  (m.senderId === currentUser?.id && m.recipientId === partner.id) ||
                  (m.senderId === partner.id && m.recipientId === currentUser?.id)
              );
              const lastMsg = partnerMsgs[partnerMsgs.length - 1];

              return (
                <div
                  key={partner.id}
                  onClick={() => setSelectedRecipientId(partner.id)}
                  style={{
                    padding: "10px 12px",
                    borderRadius: "10px",
                    cursor: "pointer",
                    marginBottom: "6px",
                    background: isSelected ? "#ede9fe" : "transparent",
                    border: isSelected ? "1.5px solid #a78bfa" : "1px solid transparent",
                    transition: "all 0.15s ease",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px"
                  }}
                >
                  <img
                    src={partner.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"}
                    alt={partner.name}
                    style={{
                      width: "42px",
                      height: "42px",
                      borderRadius: "50%",
                      objectFit: "cover",
                      border: isSelected ? "2px solid #7c3aed" : "1px solid #cbd5e1",
                      flexShrink: 0
                    }}
                  />

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontWeight: isSelected ? "800" : "700", fontSize: "0.86rem", color: isSelected ? "#4c1d95" : "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {partner.name}
                      </span>
                      {unreadCount > 0 && (
                        <span style={{ background: "#ef4444", color: "white", fontSize: "0.68rem", fontWeight: "800", padding: "1px 6px", borderRadius: "10px" }}>
                          {unreadCount}
                        </span>
                      )}
                    </div>

                    <div style={{ fontSize: "0.72rem", color: "#64748b", marginTop: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {partner.designation || partner.role?.toUpperCase()}
                    </div>

                    {lastMsg ? (
                      <div style={{ fontSize: "0.73rem", color: "#94a3b8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginTop: "3px" }}>
                        {lastMsg.senderId === currentUser?.id ? "You: " : ""}{lastMsg.message}
                      </div>
                    ) : (
                      <div style={{ fontSize: "0.7rem", color: "#a855f7", marginTop: "3px", fontWeight: "600" }}>
                        ✨ Click to start chat
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Active Conversation Area */}
        {activePartner ? (
          <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "#ffffff" }}>
            {/* Conversation Header */}
            <div
              style={{
                padding: "14px 20px",
                borderBottom: "1px solid #e2e8f0",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "#ffffff"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <img
                  src={activePartner.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"}
                  alt={activePartner.name}
                  style={{ width: "46px", height: "46px", borderRadius: "50%", objectFit: "cover", border: "2px solid #7c3aed" }}
                />
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                    <h3 style={{ fontSize: "1.08rem", fontWeight: "800", margin: 0, color: "#0f172a" }}>
                      {activePartner.name}
                    </h3>
                    {getRoleBadge(activePartner.role)}
                  </div>
                  <div style={{ fontSize: "0.76rem", color: "#64748b", marginTop: "2px" }}>
                    {activePartner.departmentName || myDeptName} • {activePartner.designation || "Department Member"}
                  </div>
                </div>
              </div>

              {/* Topic Category */}
              {role === "student" && (
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "0.74rem", color: "#64748b", fontWeight: "700" }}>Query Topic:</span>
                  <select
                    value={queryCategory}
                    onChange={(e) => setQueryCategory(e.target.value)}
                    style={{
                      fontSize: "0.76rem",
                      padding: "4px 8px",
                      borderRadius: "6px",
                      border: "1.5px solid #cbd5e1",
                      background: "#f8fafc",
                      fontWeight: "700"
                    }}
                  >
                    <option value="Academic Guidance">Academic Guidance (अभ्यास / शंका)</option>
                    <option value="Lab & Practical">Lab & Practical (प्रॅक्टिकल / प्रयोग)</option>
                    <option value="Attendance / Leave">Attendance / Leave (हजेरी / रजा)</option>
                    <option value="Project & Mentorship">Project & Mentorship (प्रकल्प / मार्गदर्शन)</option>
                    <option value="General Inquiry">General Inquiry (इतर विचारणा)</option>
                  </select>
                </div>
              )}
            </div>

            {/* Messages Thread Feed */}
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "20px",
                display: "flex",
                flexDirection: "column",
                gap: "14px",
                background: "#f8fafc"
              }}
            >
              {/* Security Banner */}
              <div
                style={{
                  background: "#eff6ff",
                  border: "1px solid #bfdbfe",
                  borderRadius: "10px",
                  padding: "8px 16px",
                  textAlign: "center",
                  fontSize: "0.76rem",
                  color: "#1e40af",
                  maxWidth: "600px",
                  margin: "0 auto"
                }}
              >
                🔒 <strong>Department Personal Channel:</strong> Communication is secured between <strong>{currentUser?.name}</strong> and <strong>{activePartner.name}</strong> within {myDeptName}.
              </div>

              {conversationMessages.length === 0 ? (
                <div style={{ margin: "auto", textAlign: "center", color: "#94a3b8", padding: "30px 20px" }}>
                  <div
                    style={{
                      width: "56px",
                      height: "56px",
                      borderRadius: "50%",
                      background: "#ede9fe",
                      color: "#7c3aed",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 12px auto"
                    }}
                  >
                    <MessageCircle size={28} />
                  </div>
                  <h4 style={{ fontSize: "1.05rem", fontWeight: "800", color: "#334155" }}>
                    Start Personal Chat with {activePartner.name}
                  </h4>
                  <p style={{ fontSize: "0.82rem", maxWidth: "420px", margin: "6px auto 16px auto", color: "#64748b" }}>
                    {role === "student"
                      ? "Have a doubt or need guidance? Type your message below or pick a quick suggestion to message your faculty directly."
                      : "Send an official direct message or query response to this department member."}
                  </p>
                </div>
              ) : (
                conversationMessages.map((msg) => {
                  const isMe = msg.senderId === currentUser?.id;
                  return (
                    <div
                      key={msg.id}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: isMe ? "flex-end" : "flex-start",
                        maxWidth: "75%",
                        alignSelf: isMe ? "flex-end" : "flex-start"
                      }}
                    >
                      <div
                        style={{
                          fontSize: "0.7rem",
                          fontWeight: "700",
                          color: "#64748b",
                          marginBottom: "3px",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px"
                        }}
                      >
                        <span>{isMe ? "You" : msg.senderName}</span>
                        {msg.category && (
                          <span style={{ background: "#e2e8f0", padding: "1px 6px", borderRadius: "6px", fontSize: "0.68rem" }}>
                            {msg.category}
                          </span>
                        )}
                      </div>

                      <div
                        style={{
                          background: isMe ? "linear-gradient(135deg, #4f46e5, #4338ca)" : "#ffffff",
                          color: isMe ? "#ffffff" : "#0f172a",
                          padding: "12px 16px",
                          borderRadius: isMe ? "14px 14px 2px 14px" : "14px 14px 14px 2px",
                          fontSize: "0.88rem",
                          lineHeight: 1.5,
                          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                          border: isMe ? "none" : "1px solid #e2e8f0"
                        }}
                      >
                        {msg.message}
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.68rem", color: "#94a3b8", marginTop: "3px" }}>
                        <Clock size={10} />
                        <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                        {isMe && <CheckCheck size={12} color="#4f46e5" />}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Quick Suggestions Chips */}
            {quickSuggestions.length > 0 && (
              <div
                style={{
                  padding: "8px 18px",
                  background: "#ffffff",
                  borderTop: "1px solid #f1f5f9",
                  display: "flex",
                  gap: "6px",
                  overflowX: "auto"
                }}
              >
                {quickSuggestions.map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendMessage(null, s)}
                    style={{
                      background: "#f1f5f9",
                      border: "1px solid #e2e8f0",
                      borderRadius: "16px",
                      padding: "4px 12px",
                      fontSize: "0.74rem",
                      color: "#334155",
                      fontWeight: "600",
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      transition: "all 0.15s ease"
                    }}
                  >
                    <span>{s}</span>
                    <Send size={10} color="#6366f1" />
                  </button>
                ))}
              </div>
            )}

            {/* Message Input Box */}
            <form
              onSubmit={(e) => handleSendMessage(e)}
              style={{
                padding: "14px 18px",
                borderTop: "1px solid #e2e8f0",
                display: "flex",
                gap: "10px",
                background: "#ffffff",
                alignItems: "center"
              }}
            >
              <input
                type="text"
                placeholder={
                  role === "student"
                    ? `Write your message to ${activePartner.name} (Sir/Madam)...`
                    : `Write your message to ${activePartner.name}...`
                }
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                style={{
                  flex: 1,
                  padding: "11px 16px",
                  borderRadius: "10px",
                  border: "1.5px solid #cbd5e1",
                  fontSize: "0.88rem",
                  outline: "none"
                }}
              />

              <button
                type="submit"
                disabled={!messageText.trim()}
                className="btn btn-primary"
                style={{
                  padding: "11px 22px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  fontWeight: "700"
                }}
              >
                <Send size={15} />
                <span>Send</span>
              </button>
            </form>
          </div>
        ) : (
          <div style={{ margin: "auto", textAlign: "center", color: "#94a3b8" }}>
            <Users size={48} style={{ margin: "0 auto 12px auto", color: "#cbd5e1" }} />
            <h3 style={{ fontSize: "1.1rem", fontWeight: "700", color: "#475569" }}>No Contacts Available</h3>
            <p style={{ fontSize: "0.85rem" }}>Select a faculty member from your department to start chat.</p>
          </div>
        )}
      </div>
    </div>
  );
}

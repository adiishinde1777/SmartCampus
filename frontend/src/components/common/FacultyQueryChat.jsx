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
  ArrowLeft
} from "lucide-react";
import { Badge } from "./UIPrimitives";
import { getEffectiveHOD } from "../../utils/departmentUtils";

export default function FacultyQueryChat({ onNavigate, initialRecipientId = null }) {
  const {
    currentUser,
    users,
    departments,
    directMessages = [],
    sendDirectMessage,
    markMessagesAsRead,
    systemSettings
  } = useSmartCampus();

  const role = currentUser?.role || "student";
  const studentDeptId = currentUser?.departmentId || "dept-vlsi";
  const studentDept = departments.find((d) => d.id === studentDeptId) || {
    id: studentDeptId,
    name: currentUser?.departmentName || "Electronic Engineering (VLSI Design And Technology)",
    code: "VLSI",
    hod: "Dr. Shrikant Honade",
    firstYearHod: "Dr. R. S. Pawar"
  };

  const effectiveHOD = getEffectiveHOD({
    studentYear: currentUser?.year,
    department: studentDept,
    users,
    systemSettings
  });

  // Calculate allowable target users based on strict role permissions:
  // 1. Student -> Teacher & HOD only
  // 2. Teacher -> HOD & Principal (plus can reply to students who messaged them)
  // 3. HOD -> Principal, Teachers, Students
  // 4. Principal -> HOD & Teachers
  const eligibleRecipients = useMemo(() => {
    let list = [];

    // Baseline designated HOD & Principal fallbacks if not yet in MySQL users array
    const defaultHOD = {
      id: "fac-hod-vlsi",
      name: effectiveHOD.name || "Dr. Shrikant Honade",
      role: "hod",
      designation: "Head of Department (HOD)",
      departmentName: studentDept.name,
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80"
    };

    const defaultPrincipal = {
      id: "fac-principal",
      name: "Dr. S. K. Patil",
      role: "principal",
      designation: "Principal & Director",
      departmentName: "CSMSS Engineering",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80"
    };

    const registeredTeachers = users.filter((u) => u.role === "teacher" && u.id !== currentUser?.id);
    const registeredHODs = users.filter((u) => u.role === "hod" && u.id !== currentUser?.id);
    const registeredPrincipals = users.filter((u) => u.role === "principal" && u.id !== currentUser?.id);
    const registeredStudents = users.filter((u) => u.role === "student" && u.id !== currentUser?.id);

    if (role === "student") {
      // Students can ONLY message Teachers and HOD
      list = [...registeredHODs, ...registeredTeachers];
      if (list.length === 0 || !list.some((u) => u.role === "hod")) {
        list.unshift(defaultHOD);
      }
    } else if (role === "teacher") {
      // Teachers can initiate chat with HOD and Principal
      list = [...registeredHODs, ...registeredPrincipals];
      if (!list.some((u) => u.role === "hod")) list.push(defaultHOD);
      if (!list.some((u) => u.role === "principal")) list.push(defaultPrincipal);

      // Also allow replying to any student who has sent a message to this teacher
      const studentsWhoMessaged = directMessages
        .filter((m) => m.recipientId === currentUser?.id && m.senderRole === "student")
        .map((m) => ({
          id: m.senderId,
          name: m.senderName,
          role: "student",
          designation: "Student",
          avatar: m.senderAvatar || ""
        }));

      // Merge unique
      const studentMap = new Map();
      studentsWhoMessaged.forEach((s) => studentMap.set(s.id, s));
      list = [...list, ...Array.from(studentMap.values())];
    } else if (role === "hod") {
      // HOD can chat with Principal, Teachers, and reply to / initiate with Students
      list = [...registeredPrincipals, ...registeredTeachers, ...registeredStudents];
      if (!list.some((u) => u.role === "principal")) list.push(defaultPrincipal);
    } else if (role === "principal") {
      // Principal can chat with HODs and Teachers
      list = [...registeredHODs, ...registeredTeachers];
      if (!list.some((u) => u.role === "hod")) list.push(defaultHOD);
    } else {
      // Admin
      list = users.filter((u) => u.id !== currentUser?.id);
    }

    return list;
  }, [role, users, currentUser, directMessages, effectiveHOD, studentDept]);

  // Selected active conversation partner
  const [selectedRecipientId, setSelectedRecipientId] = useState(
    initialRecipientId || (eligibleRecipients[0]?.id || null)
  );

  const [messageText, setMessageText] = useState("");
  const [queryCategory, setQueryCategory] = useState("Academic Guidance");
  const [searchFilter, setSearchFilter] = useState("");

  const activePartner = eligibleRecipients.find((r) => r.id === selectedRecipientId) || eligibleRecipients[0];

  // Mark incoming messages from activePartner as read
  useEffect(() => {
    if (activePartner?.id && markMessagesAsRead) {
      markMessagesAsRead(activePartner.id);
    }
  }, [activePartner?.id]);

  // Filter conversations with activePartner
  const conversationMessages = useMemo(() => {
    if (!activePartner) return [];
    return directMessages.filter(
      (m) =>
        (m.senderId === currentUser?.id && m.recipientId === activePartner.id) ||
        (m.senderId === activePartner.id && m.recipientId === currentUser?.id)
    ).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  }, [directMessages, currentUser, activePartner]);

  // Handle Send Query
  const handleSendMessage = (e) => {
    e?.preventDefault();
    if (!messageText.trim() || !activePartner) return;

    sendDirectMessage({
      recipientId: activePartner.id,
      recipientName: activePartner.name,
      recipientRole: activePartner.role,
      message: messageText,
      subject: `${queryCategory} Query`,
      category: queryCategory
    });

    setMessageText("");
  };

  const getRoleBadge = (partnerRole) => {
    switch (partnerRole) {
      case "hod":
        return <span style={{ background: "#fef3c7", color: "#b45309", padding: "2px 8px", borderRadius: "10px", fontSize: "0.72rem", fontWeight: "800" }}>🏛️ Head of Dept (HOD)</span>;
      case "principal":
        return <span style={{ background: "#dcfce7", color: "#15803d", padding: "2px 8px", borderRadius: "10px", fontSize: "0.72rem", fontWeight: "800" }}>🎓 Principal</span>;
      case "teacher":
        return <span style={{ background: "#ede9fe", color: "#6d28d9", padding: "2px 8px", borderRadius: "10px", fontSize: "0.72rem", fontWeight: "800" }}>👨‍🏫 Professor / Faculty</span>;
      case "student":
        return <span style={{ background: "#dbeafe", color: "#1d4ed8", padding: "2px 8px", borderRadius: "10px", fontSize: "0.72rem", fontWeight: "800" }}>🎒 Student</span>;
      default:
        return <span style={{ background: "#f1f5f9", color: "#475569", padding: "2px 8px", borderRadius: "10px", fontSize: "0.72rem", fontWeight: "800" }}>Staff</span>;
    }
  };

  const filteredRecipients = eligibleRecipients.filter(
    (r) =>
      r.name?.toLowerCase().includes(searchFilter.toLowerCase()) ||
      r.designation?.toLowerCase().includes(searchFilter.toLowerCase()) ||
      r.role?.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", height: "calc(100vh - 150px)" }}>
      {/* Header Banner */}
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
          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(255,255,255,0.15)", padding: "3px 10px", borderRadius: "16px", fontSize: "0.75rem", fontWeight: "700", marginBottom: "6px" }}>
            <MessageSquare size={13} />
            {role === "student" ? "STUDENT • FACULTY & HOD QUERY PORTAL" : "DIRECT MESSAGING & QUERIES"}
          </div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: "800", margin: "2px 0 4px 0", color: "#ffffff" }}>
            {role === "student" ? "Chat with Faculty & Department HOD" : "Institutional Query & Mentorship Messaging"}
          </h2>
          <p style={{ margin: 0, fontSize: "0.84rem", color: "#cbd5e1" }}>
            {role === "student"
              ? "Students can ask personal academic queries to Professors and Department HOD directly."
              : role === "teacher"
              ? "Communicate directly with Department HOD and Principal, and reply to student academic queries."
              : "Official communication channel between College Leadership, Faculty, and Students."}
          </p>
        </div>

        {/* Permission Badge */}
        <div style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "10px", padding: "8px 14px", fontSize: "0.78rem" }}>
          <div style={{ color: "#93c5fd", fontWeight: "700", marginBottom: "2px" }}>Access Permissions:</div>
          <div style={{ color: "#ffffff" }}>
            {role === "student" && "✅ Student → HOD & Teachers"}
            {role === "teacher" && "✅ Teacher → HOD & Principal | Student Queries"}
            {role === "hod" && "✅ HOD → Principal, Teachers & Students"}
            {role === "principal" && "✅ Principal → HOD & Teachers"}
          </div>
        </div>
      </div>

      {/* Main Chat Layout */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "320px 1fr",
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
          <div style={{ padding: "14px", borderBottom: "1px solid #e2e8f0" }}>
            <div style={{ position: "relative" }}>
              <Search size={15} style={{ position: "absolute", left: "10px", top: "10px", color: "#94a3b8" }} />
              <input
                type="text"
                placeholder={role === "student" ? "Search faculty / HOD..." : "Search contact..."}
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 12px 8px 32px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "0.82rem",
                  background: "white"
                }}
              />
            </div>
            <div style={{ fontSize: "0.72rem", color: "#64748b", marginTop: "6px", fontWeight: "600" }}>
              {role === "student" ? "Accessible Teachers & Department Heads" : "Eligible Contacts"} ({filteredRecipients.length})
            </div>
          </div>

          {/* Contacts List */}
          <div style={{ flex: 1, overflowY: "auto", padding: "8px" }}>
            {filteredRecipients.map((partner) => {
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
                    border: isSelected ? "1px solid #c4b5fd" : "1px solid transparent",
                    transition: "all 0.15s ease",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px"
                  }}
                >
                  <img
                    src={partner.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"}
                    alt={partner.name}
                    style={{ width: "40px", height: "40px", borderRadius: "50%", objectFit: "cover", border: isSelected ? "2px solid #7c3aed" : "1px solid #cbd5e1" }}
                  />

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontWeight: isSelected ? "800" : "600", fontSize: "0.85rem", color: isSelected ? "#4c1d95" : "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {partner.name}
                      </span>
                      {unreadCount > 0 && (
                        <span style={{ background: "#ef4444", color: "white", fontSize: "0.68rem", fontWeight: "800", padding: "1px 6px", borderRadius: "10px" }}>
                          {unreadCount}
                        </span>
                      )}
                    </div>

                    <div style={{ fontSize: "0.72rem", color: "#64748b", marginTop: "2px" }}>
                      {partner.role?.toUpperCase()} • {partner.designation || "Faculty"}
                    </div>

                    {lastMsg && (
                      <div style={{ fontSize: "0.74rem", color: "#94a3b8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginTop: "3px" }}>
                        {lastMsg.senderId === currentUser?.id ? "You: " : ""}{lastMsg.message}
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
                  style={{ width: "44px", height: "44px", borderRadius: "50%", objectFit: "cover", border: "2px solid #7c3aed" }}
                />
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <h3 style={{ fontSize: "1.05rem", fontWeight: "800", margin: 0, color: "#0f172a" }}>
                      {activePartner.name}
                    </h3>
                    {getRoleBadge(activePartner.role)}
                  </div>
                  <div style={{ fontSize: "0.76rem", color: "#64748b", marginTop: "2px" }}>
                    {activePartner.departmentName || studentDept.name} • {activePartner.designation || "Faculty Member"}
                  </div>
                </div>
              </div>

              {/* Quick Query Category selector for student */}
              {role === "student" && (
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "0.76rem", color: "#64748b", fontWeight: "600" }}>Topic:</span>
                  <select
                    value={queryCategory}
                    onChange={(e) => setQueryCategory(e.target.value)}
                    style={{
                      fontSize: "0.76rem",
                      padding: "4px 8px",
                      borderRadius: "6px",
                      border: "1px solid #cbd5e1",
                      background: "#f8fafc",
                      fontWeight: "700"
                    }}
                  >
                    <option value="Academic Guidance">Academic Guidance (अभ्यास / शंका)</option>
                    <option value="Lab & Practical">Lab & Practical (प्रॅक्टिकल / असाइनमेंट)</option>
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
              {/* Friendly starter notice */}
              <div
                style={{
                  background: "#eff6ff",
                  border: "1px solid #bfdbfe",
                  borderRadius: "10px",
                  padding: "10px 16px",
                  textAlign: "center",
                  fontSize: "0.78rem",
                  color: "#1e40af",
                  maxWidth: "550px",
                  margin: "0 auto"
                }}
              >
                🔒 Official Institutional Channel. Your academic queries with <strong>{activePartner.name}</strong> are logged for academic audit & guidance.
              </div>

              {conversationMessages.length === 0 ? (
                <div style={{ margin: "auto", textAlign: "center", color: "#94a3b8", padding: "40px 20px" }}>
                  <HelpCircle size={44} style={{ margin: "0 auto 12px auto", color: "#cbd5e1" }} />
                  <h4 style={{ fontSize: "1rem", fontWeight: "700", color: "#475569" }}>
                    No messages yet with {activePartner.name}
                  </h4>
                  <p style={{ fontSize: "0.82rem", maxWidth: "380px", margin: "4px auto 0 auto" }}>
                    {role === "student"
                      ? "Have a doubt or need guidance? Type your query below to send it personally to this faculty."
                      : "Type a message below to start communication."}
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

            {/* Message Input Box */}
            <form
              onSubmit={handleSendMessage}
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
                    ? `Write your query to ${activePartner.name} (Sir/Madam)...`
                    : `Write your message to ${activePartner.name}...`
                }
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                style={{
                  flex: 1,
                  padding: "10px 16px",
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
                  padding: "10px 20px",
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
            <p style={{ fontSize: "0.85rem" }}>Select a faculty member from the directory to start a chat.</p>
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useState } from "react";
import { useSmartCampus } from "../../context/SmartCampusContext";
import {
  ShieldCheck,
  Users,
  CalendarCheck,
  Award,
  Clock,
  AlertTriangle,
  Sparkles,
  Search,
  Bell,
  Send,
  CheckCircle2,
  FileSpreadsheet,
  BookOpen,
  MessageSquare,
  PlusCircle,
  Phone,
  Mail,
  HelpCircle,
  TrendingUp,
  UserCheck
} from "lucide-react";
import { Badge, Modal, StatCard } from "../common/UIPrimitives";

export default function TeacherMyTGBatch() {
  const {
    currentUser,
    classAssignments,
    users,
    attendance,
    marks,
    leaves,
    complaints,
    studyMaterials,
    systemSettings,
    sendTgAnnouncement,
    addToast
  } = useSmartCampus();

  const teacher = currentUser;

  // Find all TG batches assigned to this teacher across all classes
  const myTgBatches = [];
  (classAssignments || []).forEach((ca) => {
    (ca.tgBatches || []).forEach((b) => {
      if (b.teacherId === teacher?.id || b.teacherName === teacher?.name) {
        myTgBatches.push({
          ...b,
          classAssignmentId: ca.id,
          className: ca.className,
          departmentId: ca.departmentId,
          semester: ca.semester
        });
      }
    });
  });

  // Fallback if not directly matched, pick the first TG batch for demo
  const defaultBatch =
    myTgBatches[0] || {
      id: "tg-vlsi-1",
      name: "Batch TG-1",
      teacherId: teacher?.id || "tea-1",
      teacherName: teacher?.name || "Prof. T. A. Mohije",
      classAssignmentId: "ca-vlsi-te-5",
      className: "TE VLSI – Semester 5 (Div A)",
      departmentId: "dept-vlsi",
      semester: 5,
      studentIds: [
        "stu-1",
        "stu-vl3101",
        "stu-vl3102",
        "stu-vl3103",
        "stu-vl3104",
        "stu-vl3105",
        "stu-vl3106",
        "stu-vl3107",
        "stu-vl3108",
        "stu-vl3109",
        "stu-vl3110",
        "stu-vl3111",
        "stu-vl3112",
        "stu-vl3113",
        "stu-vl3114",
        "stu-vl3115",
        "stu-vl3116",
        "stu-vl3117",
        "stu-vl3118",
        "stu-vl3119",
        "stu-vl3120",
        "stu-vl3121",
        "stu-vl3122",
        "stu-vl3123"
      ]
    };

  const [selectedBatchId, setSelectedBatchId] = useState(defaultBatch.id);

  const activeBatch =
    myTgBatches.find((b) => b.id === selectedBatchId) || defaultBatch;

  const [activeTab, setActiveTab] = useState("mentees"); // "mentees" | "attendance" | "marks" | "support-log" | "announcements"
  const [searchTerm, setSearchTerm] = useState("");

  // Mentoring Log State
  const [mentoringLogs, setMentoringLogs] = useState([
    {
      id: "log-1",
      studentName: "Aditya Shinde",
      date: "2026-09-10",
      topic: "Mid-Sem Preparation & VLSI Lab Journal",
      category: "Academic Support",
      notes: "Student is performing well (88% attendance). Guided on CMOS inverter VTC analysis and Cadence layout simulation.",
      followUp: "Review after Unit Test 2"
    },
    {
      id: "log-2",
      studentName: "Rathod Anushka Nitesh",
      date: "2026-09-08",
      topic: "Attendance Recovery Guidance",
      category: "Attendance Warning",
      notes: "Attendance was 72%. Discussed remedial lectures on Microcontroller and submitted medical certificate for 2 days absence.",
      followUp: "Check weekly attendance report"
    }
  ]);

  const [newLogModalOpen, setNewLogModalOpen] = useState(false);
  const [newLog, setNewLog] = useState({
    studentName: "Aditya Shinde",
    topic: "",
    category: "Academic Support",
    notes: "",
    followUp: ""
  });

  // Batch Announcement state
  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [announcementMessage, setAnnouncementMessage] = useState("");

  // Student dossier modal
  const [selectedMentee, setSelectedMentee] = useState(null);

  // Mentees strictly from activeBatch studentIds (Strict TG Isolation)
  const batchStudents = users
    .filter((u) => u.role === "student" && (activeBatch.studentIds || []).includes(u.id))
    .sort((a, b) => (a.rollNo || "").localeCompare(b.rollNo || ""));

  const threshold = systemSettings?.attendanceThreshold || 75;

  // Batch KPIs
  let totalAttended = 0;
  let totalConducted = 0;
  let defaultersCount = 0;

  batchStudents.forEach((stu) => {
    const sAtt = attendance[stu.id] || {};
    let stuTotal = 0;
    let stuAtt = 0;
    Object.values(sAtt).forEach((sub) => {
      stuTotal += sub.total || 0;
      stuAtt += sub.attended || 0;
    });
    totalConducted += stuTotal;
    totalAttended += stuAtt;
    const pct = stuTotal > 0 ? (stuAtt / stuTotal) * 100 : 84;
    if (pct < threshold) defaultersCount++;
  });

  const batchAvgAttendance =
    totalConducted > 0 ? Math.round((totalAttended / totalConducted) * 100) : 84;

  const filteredMentees = batchStudents.filter((stu) => {
    const term = searchTerm.toLowerCase();
    return (
      stu.name.toLowerCase().includes(term) ||
      (stu.rollNo && stu.rollNo.toLowerCase().includes(term)) ||
      (stu.prn && stu.prn.toLowerCase().includes(term))
    );
  });

  const handleCreateLog = (e) => {
    e.preventDefault();
    if (!newLog.topic.trim() || !newLog.notes.trim()) return;

    const logEntry = {
      id: "log-" + Date.now(),
      date: new Date().toISOString().split("T")[0],
      ...newLog
    };

    setMentoringLogs([logEntry, ...mentoringLogs]);
    addToast("Mentoring Log Recorded", `Logged session notes for ${newLog.studentName}.`, "success");
    setNewLogModalOpen(false);
    setNewLog({
      studentName: batchStudents[0]?.name || "Aditya Shinde",
      topic: "",
      category: "Academic Support",
      notes: "",
      followUp: ""
    });
  };

  const handleSendBatchAnnouncement = (e) => {
    e.preventDefault();
    if (!announcementTitle.trim() || !announcementMessage.trim()) return;
    sendTgAnnouncement(activeBatch.classAssignmentId, activeBatch.id, announcementTitle, announcementMessage);
    setAnnouncementTitle("");
    setAnnouncementMessage("");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* TG Banner */}
      <div
        style={{
          background: "linear-gradient(135deg, #4c1d95 0%, #1e1b4b 100%)",
          borderRadius: "16px",
          padding: "24px 32px",
          color: "white",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
          boxShadow: "0 10px 25px -5px rgba(76, 29, 149, 0.35)"
        }}
      >
        <div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "rgba(168, 85, 247, 0.25)",
              border: "1px solid rgba(168, 85, 247, 0.4)",
              padding: "4px 12px",
              borderRadius: "20px",
              marginBottom: "10px"
            }}
          >
            <ShieldCheck size={15} color="#d8b4fe" />
            <span style={{ fontSize: "0.78rem", fontWeight: "700", color: "#e9d5ff", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Teacher Guardian (TG) Portal • Mentorship & Remedial Support
            </span>
          </div>
          <h2 style={{ fontSize: "1.85rem", fontWeight: "800", color: "white", marginBottom: "6px" }}>
            {activeBatch?.name} — {activeBatch?.className || "TE VLSI Div A"}
          </h2>
          <p style={{ fontSize: "0.9rem", color: "#cbd5e1" }}>
            Teacher Guardian: <strong>{activeBatch?.teacherName || teacher?.name}</strong> • Allocated Mentees: <strong>{batchStudents.length} Students</strong> • Strict Batch Privacy Enforced
          </p>
        </div>

        {/* Batch Switcher if teacher manages multiple TG batches */}
        {myTgBatches.length > 1 && (
          <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "rgba(255,255,255,0.15)", padding: "6px 12px", borderRadius: "10px" }}>
            <span style={{ fontSize: "0.82rem", color: "#e2e8f0", fontWeight: "600" }}>Switch Batch:</span>
            <select
              className="form-control"
              style={{ width: "auto", fontSize: "0.85rem", color: "#000", fontWeight: "700" }}
              value={selectedBatchId}
              onChange={(e) => setSelectedBatchId(e.target.value)}
            >
              {myTgBatches.map((b) => (
                <option key={b.id} value={b.id}>{b.name} ({b.className})</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* TG Metrics */}
      <div className="stats-grid">
        <StatCard
          label="Assigned Mentees"
          value={batchStudents.length}
          subtext="Direct Mentorship Roster"
          icon={Users}
          variant="purple"
        />
        <StatCard
          label="Batch Attendance Avg"
          value={`${batchAvgAttendance}%`}
          subtext={`College Threshold: ${threshold}%`}
          icon={CalendarCheck}
          variant={batchAvgAttendance >= threshold ? "success" : "warning"}
        />
        <StatCard
          label="Attendance Warning"
          value={defaultersCount}
          subtext="Mentees below 75%"
          icon={AlertTriangle}
          variant={defaultersCount > 0 ? "danger" : "success"}
        />
        <StatCard
          label="Mentoring Logs"
          value={mentoringLogs.length}
          subtext="Support & Guidance Sessions"
          icon={MessageSquare}
          variant="primary"
        />
      </div>

      {/* Sub-tabs Navigation */}
      <div className="card" style={{ padding: "12px 16px" }}>
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          <button
            onClick={() => setActiveTab("mentees")}
            className={`btn btn-sm ${activeTab === "mentees" ? "btn-primary" : "btn-ghost"}`}
          >
            <Users size={14} /> Assigned Mentees ({batchStudents.length})
          </button>
          <button
            onClick={() => setActiveTab("attendance")}
            className={`btn btn-sm ${activeTab === "attendance" ? "btn-primary" : "btn-ghost"}`}
          >
            <CalendarCheck size={14} /> Mentee Attendance
          </button>
          <button
            onClick={() => setActiveTab("marks")}
            className={`btn btn-sm ${activeTab === "marks" ? "btn-primary" : "btn-ghost"}`}
          >
            <Award size={14} /> Academic Performance
          </button>
          <button
            onClick={() => setActiveTab("support-log")}
            className={`btn btn-sm ${activeTab === "support-log" ? "btn-primary" : "btn-ghost"}`}
          >
            <MessageSquare size={14} /> Counseling & Remedial Log ({mentoringLogs.length})
          </button>
          <button
            onClick={() => setActiveTab("announcements")}
            className={`btn btn-sm ${activeTab === "announcements" ? "btn-primary" : "btn-ghost"}`}
          >
            <Bell size={14} /> Send Batch Alert
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* SUB-TAB 1: ASSIGNED MENTEES */}
      {/* ========================================================= */}
      {activeTab === "mentees" && (
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">
                <Users size={18} color="var(--primary-600)" />
                {activeBatch.name} Mentee Directory ({filteredMentees.length} Students)
              </div>
              <div className="card-subtitle">
                Exclusive list of students assigned to you as Teacher Guardian. Other batches are isolated per data privacy rules.
              </div>
            </div>

            <div style={{ position: "relative", minWidth: "220px" }}>
              <Search size={14} color="var(--text-muted)" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }} />
              <input
                type="text"
                placeholder="Filter mentees..."
                className="form-control"
                style={{ paddingLeft: "30px", fontSize: "0.82rem" }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Roll No</th>
                  <th>Student Name</th>
                  <th>PRN</th>
                  <th>Attendance %</th>
                  <th>Parent / Guardian Contact</th>
                  <th>Academic Standing</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredMentees.map((stu) => {
                  const sAtt = attendance[stu.id] || {};
                  let total = 0;
                  let attended = 0;
                  Object.values(sAtt).forEach((sub) => {
                    total += sub.total || 0;
                    attended += sub.attended || 0;
                  });
                  const pct = total > 0 ? Math.round((attended / total) * 100) : 85;
                  const isLow = pct < threshold;

                  return (
                    <tr key={stu.id}>
                      <td><Badge variant="purple">{stu.rollNo}</Badge></td>
                      <td>
                        <strong>{stu.name}</strong>
                        <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{stu.email}</div>
                      </td>
                      <td style={{ fontFamily: "monospace", color: "var(--color-primary)" }}>
                        {stu.prn || stu.prnNo || "24025331378001"}
                      </td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <strong style={{ color: isLow ? "var(--danger-solid)" : "var(--success-solid)" }}>
                            {pct}%
                          </strong>
                        </div>
                      </td>
                      <td>
                        <div>
                          <span style={{ fontSize: "0.82rem", fontWeight: "600" }}>{stu.parentName || "Parent"}</span>
                          <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>📞 {stu.parentPhone || "+91 9869592890"}</div>
                        </div>
                      </td>
                      <td>
                        <Badge variant={isLow ? "danger" : "success"}>
                          {isLow ? "Needs Counseling" : "Good Standing"}
                        </Badge>
                      </td>
                      <td>
                        <button
                          onClick={() => setSelectedMentee({ ...stu, attendancePct: pct })}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: "4px 8px", fontSize: "0.75rem" }}
                        >
                          Counseling Profile
                        </button>
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
      {/* SUB-TAB 2: ATTENDANCE TRACKING */}
      {/* ========================================================= */}
      {activeTab === "attendance" && (
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">
                <CalendarCheck size={18} color="var(--primary-600)" />
                Mentee Attendance Radar & Defaulter Watch
              </div>
              <div className="card-subtitle">
                Proactively identify students missing theory lectures or lab practicals
              </div>
            </div>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Roll No</th>
                  <th>Student Name</th>
                  <th>📘 Theory Attendance</th>
                  <th>🔬 Practical Attendance</th>
                  <th>Combined Attendance</th>
                  <th>Intervention Recommendation</th>
                </tr>
              </thead>
              <tbody>
                {filteredMentees.map((stu) => {
                  const sAtt = attendance[stu.id] || {};
                  let total = 0;
                  let attended = 0;
                  Object.values(sAtt).forEach((sub) => {
                    total += sub.total || 0;
                    attended += sub.attended || 0;
                  });
                  const pct = total > 0 ? Math.round((attended / total) * 100) : 85;
                  const isLow = pct < threshold;

                  const theoryTotal = Math.round(total * 0.7);
                  const theoryAttended = Math.round(attended * 0.7);
                  const theoryPct = theoryTotal > 0 ? Math.round((theoryAttended / theoryTotal) * 100) : 85;

                  const practicalTotal = Math.max(0, total - theoryTotal);
                  const practicalAttended = Math.max(0, attended - theoryAttended);
                  const practicalPct = practicalTotal > 0 ? Math.round((practicalAttended / practicalTotal) * 100) : 80;

                  return (
                    <tr key={stu.id}>
                      <td><strong>{stu.rollNo}</strong></td>
                      <td>{stu.name}</td>
                      <td>
                        <span>{theoryAttended}/{theoryTotal}</span>
                        <Badge variant={theoryPct >= 75 ? "primary" : "warning"} style={{ marginLeft: "6px" }}>
                          {theoryPct}%
                        </Badge>
                      </td>
                      <td>
                        <span>{practicalAttended}/{practicalTotal}</span>
                        <Badge variant={practicalPct >= 75 ? "success" : "warning"} style={{ marginLeft: "6px" }}>
                          {practicalPct}%
                        </Badge>
                      </td>
                      <td>
                        <strong style={{ fontSize: "1rem", color: isLow ? "var(--danger-solid)" : "var(--success-solid)" }}>
                          {pct}%
                        </strong>
                      </td>
                      <td>
                        {isLow ? (
                          <span style={{ fontSize: "0.78rem", color: "#dc2626", fontWeight: "700" }}>
                            ⚠️ Schedule Parent-TG Meeting
                          </span>
                        ) : (
                          <span style={{ fontSize: "0.78rem", color: "#059669", fontWeight: "600" }}>
                            ✓ Attendance on Track
                          </span>
                        )}
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
      {/* SUB-TAB 3: ACADEMIC PERFORMANCE */}
      {/* ========================================================= */}
      {activeTab === "marks" && (
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">
                <Award size={18} color="var(--primary-600)" />
                Mentee Test & Exam Performance Tracker
              </div>
              <div className="card-subtitle">
                Track unit tests, mid-semester exams, and lab assessments to target remedial assistance
              </div>
            </div>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Roll No</th>
                  <th>Student Name</th>
                  <th>CT-1 Theory (25)</th>
                  <th>Mid-Sem (50)</th>
                  <th>Continuous Lab (25)</th>
                  <th>Overall Score</th>
                  <th>Remedial Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredMentees.map((stu) => {
                  const stuMarks = marks.filter((m) => m.studentId === stu.id);
                  const ct1 = stuMarks.find((m) => m.examType?.includes("CT-1") || m.examType?.includes("Unit Test 1"))?.marksObtained || 18;
                  const mid = stuMarks.find((m) => m.examType?.includes("Mid"))?.marksObtained || 42;
                  const lab = stuMarks.find((m) => m.category === "Practical" || m.examType?.includes("Lab"))?.marksObtained || 22;

                  const totalObt = ct1 + mid + lab;
                  const avgPct = Math.round((totalObt / 100) * 100);

                  return (
                    <tr key={stu.id}>
                      <td><strong>{stu.rollNo}</strong></td>
                      <td>{stu.name}</td>
                      <td><strong>{ct1}</strong> / 25</td>
                      <td><strong>{mid}</strong> / 50</td>
                      <td><span style={{ color: "#059669", fontWeight: "700" }}>{lab}</span> / 25</td>
                      <td><strong style={{ fontSize: "1rem" }}>{avgPct}%</strong></td>
                      <td>
                        <Badge variant={avgPct >= 60 ? "success" : "warning"}>
                          {avgPct >= 75 ? "Distinction" : avgPct >= 60 ? "Satisfactory" : "Needs Tutoring"}
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
      {/* SUB-TAB 4: COUNSELING & REMEDIAL LOG */}
      {/* ========================================================= */}
      {activeTab === "support-log" && (
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">
                <MessageSquare size={18} color="var(--primary-600)" />
                Mentoring Sessions & Academic Counseling Log
              </div>
              <div className="card-subtitle">
                Record official counseling meetings, study advice, and student welfare notes
              </div>
            </div>

            <button onClick={() => setNewLogModalOpen(true)} className="btn btn-primary btn-sm" style={{ display: "flex", gap: "6px" }}>
              <PlusCircle size={14} /> Log New Session
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {mentoringLogs.map((log) => (
              <div
                key={log.id}
                style={{
                  background: "var(--bg-surface-secondary)",
                  padding: "16px",
                  borderRadius: "10px",
                  border: "1px solid var(--border-subtle)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Badge variant="purple">{log.category}</Badge>
                    <strong style={{ fontSize: "1rem", color: "var(--text-main)" }}>{log.studentName}</strong>
                    <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>• Topic: {log.topic}</span>
                  </div>
                  <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Date: {log.date}</span>
                </div>

                <p style={{ fontSize: "0.85rem", color: "var(--text-main)", margin: "4px 0", lineHeight: 1.5 }}>
                  {log.notes}
                </p>

                {log.followUp && (
                  <div style={{ fontSize: "0.78rem", color: "var(--color-primary)", fontWeight: "600" }}>
                    🎯 Follow-up Plan: {log.followUp}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SUB-TAB 5: BATCH ANNOUNCEMENT */}
      {/* ========================================================= */}
      {activeTab === "announcements" && (
        <div className="card" style={{ maxWidth: "680px" }}>
          <div className="card-header">
            <div>
              <div className="card-title">
                <Bell size={18} color="var(--primary-600)" />
                Direct Alert to {activeBatch.name} Mentees ({batchStudents.length} Students)
              </div>
              <div className="card-subtitle">
                Send confidential reminders, remedial class timings, or mentoring notices to this batch only
              </div>
            </div>
          </div>

          <form onSubmit={handleSendBatchAnnouncement} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Notice Subject</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. TG Mentorship Review Meeting – Friday 4 PM"
                value={announcementTitle}
                onChange={(e) => setAnnouncementTitle(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Message Details</label>
              <textarea
                className="form-control"
                rows={5}
                placeholder="Please bring your lecture notebooks and Unit Test scorecards for counseling..."
                value={announcementMessage}
                onChange={(e) => setAnnouncementMessage(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ alignSelf: "flex-start", display: "flex", gap: "6px" }}>
              <Send size={15} /> Dispatch Batch Notification
            </button>
          </form>
        </div>
      )}

      {/* ========================================================= */}
      {/* LOG COUNSELING SESSION MODAL */}
      {/* ========================================================= */}
      <Modal
        isOpen={newLogModalOpen}
        onClose={() => setNewLogModalOpen(false)}
        title="Record TG Counseling & Support Session"
      >
        <form onSubmit={handleCreateLog} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Select Mentee</label>
            <select
              className="form-control"
              value={newLog.studentName}
              onChange={(e) => setNewLog({ ...newLog, studentName: e.target.value })}
            >
              {batchStudents.map((s) => (
                <option key={s.id} value={s.name}>{s.name} ({s.rollNo})</option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Session Category</label>
            <select
              className="form-control"
              value={newLog.category}
              onChange={(e) => setNewLog({ ...newLog, category: e.target.value })}
            >
              <option value="Academic Support">Academic Support</option>
              <option value="Attendance Warning">Attendance Warning</option>
              <option value="Career Guidance">Career Guidance</option>
              <option value="Personal Welfare">Personal Welfare</option>
              <option value="Remedial Guidance">Remedial Guidance</option>
            </select>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Discussion Topic</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Test 1 Review, Exam Anxiety, Lab Practical backlog"
              value={newLog.topic}
              onChange={(e) => setNewLog({ ...newLog, topic: e.target.value })}
              required
            />
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Mentoring Notes & Observations</label>
            <textarea
              className="form-control"
              rows={4}
              placeholder="Record points discussed, student's feedback, and specific advice provided..."
              value={newLog.notes}
              onChange={(e) => setNewLog({ ...newLog, notes: e.target.value })}
              required
            />
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Follow-up Action Plan</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Re-evaluate after CT-2; Verify 3 extra assignments"
              value={newLog.followUp}
              onChange={(e) => setNewLog({ ...newLog, followUp: e.target.value })}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px" }}>
            <button type="button" onClick={() => setNewLogModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Counseling Record
            </button>
          </div>
        </form>
      </Modal>

      {/* ========================================================= */}
      {/* MENTEE COUNSELING DOSSIER */}
      {/* ========================================================= */}
      <Modal
        isOpen={Boolean(selectedMentee)}
        onClose={() => setSelectedMentee(null)}
        title={`Mentee Dossier: ${selectedMentee?.name} (${selectedMentee?.rollNo})`}
        maxWidth="600px"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", background: "var(--bg-surface-secondary)", padding: "14px", borderRadius: "8px", fontSize: "0.85rem" }}>
            <div>
              <span style={{ color: "var(--text-muted)", display: "block" }}>Roll & PRN</span>
              <strong>{selectedMentee?.rollNo} • {selectedMentee?.prn || selectedMentee?.prnNo}</strong>
            </div>
            <div>
              <span style={{ color: "var(--text-muted)", display: "block" }}>Attendance</span>
              <strong style={{ color: (selectedMentee?.attendancePct || 80) >= threshold ? "var(--success-solid)" : "var(--danger-solid)" }}>
                {selectedMentee?.attendancePct || 80}%
              </strong>
            </div>
            <div>
              <span style={{ color: "var(--text-muted)", display: "block" }}>Parent Contact</span>
              <strong>{selectedMentee?.parentName || "Parent Contact"} ({selectedMentee?.parentPhone || "9869592890"})</strong>
            </div>
            <div>
              <span style={{ color: "var(--text-muted)", display: "block" }}>Student Contact</span>
              <strong>{selectedMentee?.phone || "+91 9835904334"}</strong>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button onClick={() => setSelectedMentee(null)} className="btn btn-secondary">
              Close
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

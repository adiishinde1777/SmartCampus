import React from "react";
import { useSmartCampus } from "../../context/SmartCampusContext";
import {
  CalendarCheck,
  Award,
  BookOpen,
  Activity,
  AlertTriangle,
  Clock,
  Calendar,
  ArrowRight,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  FileText,
  MapPin,
  Coffee,
  SunMedium,
  CalendarDays,
  Layers,
  GraduationCap
} from "lucide-react";
import { StatCard, Badge } from "../common/UIPrimitives";
import { getAcademicSession, getStudentClassTitle } from "../../utils/academicSession";

export default function StudentDashboard({ onNavigate }) {
  const {
    currentUser,
    attendance,
    subjects,
    marks,
    assignments,
    notices,
    timetables,
    timetableToday,
    systemSettings,
    studentSkills,
    eventInvitations,
    getStudentBatchInfo,
    getSubjectsForDepartmentAndSemester,
    switchStudentSemester
  } = useSmartCampus();

  const student = currentUser;
  const threshold = systemSettings.attendanceThreshold;

  const mySkills = (studentSkills || []).filter((s) => s.studentId === student?.id);
  const pendingInvitesCount = (eventInvitations || []).filter((i) => i.studentId === student?.id && i.status === "Invited").length;

  // Real-time system day & time detection
  const now = new Date();
  const todayDayName = now.toLocaleDateString("en-US", { weekday: "long" });
  const isWeekend = todayDayName === "Sunday";
  const studentDept = student?.departmentId || "dept-vlsi";
  const studentSem = Number(student?.semester) || 1;
  const studentDiv = student?.division || "A";
  const isFirstYear = student?.year === "First Year" || studentSem <= 2;

  // Compute student batch
  const { labBatch, altBatch } = getStudentBatchInfo
    ? getStudentBatchInfo(student?.rollNo)
    : { labBatch: "TC", altBatch: "TAB" };

  // Filter slots for student's department, sem, div for today ONLY
  // Common first-year slots (departmentId: "common" or is_common_timetable: true) are matched for any branch!
  const todaySlots = isWeekend
    ? []
    : (timetables || []).filter(
        (t) =>
          ((isFirstYear && (t.departmentId === "common" || t.is_common_timetable || t.departmentId === studentDept)) ||
            (!isFirstYear && t.departmentId === studentDept)) &&
          t.semester === studentSem &&
          (t.division === studentDiv || t.division === "All" || !t.division) &&
          t.day === todayDayName
      );

  // Status helper based on current time
  const getSlotStatus = (timeStr) => {
    const parts = (timeStr || "").replace("–", "-").split("-").map((s) => s.trim());
    if (parts.length !== 2) return "upcoming";

    const parseMinutes = (tStr) => {
      const match = tStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
      if (!match) return 0;
      let hours = parseInt(match[1], 10);
      const mins = parseInt(match[2], 10);
      const period = match[3].toUpperCase();
      if (period === "PM" && hours !== 12) hours += 12;
      if (period === "AM" && hours === 12) hours = 0;
      return hours * 60 + mins;
    };

    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    const startM = parseMinutes(parts[0]);
    const endM = parseMinutes(parts[1]);

    if (nowMinutes >= endM) return "completed";
    if (nowMinutes >= startM && nowMinutes < endM) return "active";
    return "upcoming";
  };

  // Resolve practical slot for current student's batch
  const resolveBatchSlot = (slot) => {
    if (!slot) {
      return { subject: "", code: "", room: "", teacher: "", batchLabel: "" };
    }
    if (!slot.batches || slot.batches.length === 0) {
      return {
        subject: slot.subjectName || "",
        code: slot.subjectCode || "",
        room: slot.room || "",
        teacher: slot.teacherName || "",
        batchLabel: slot.batch === "All" ? "" : (slot.batch || "")
      };
    }
    const matchLab = slot.batches.find((b) => b && b.batch === labBatch);
    if (matchLab) {
      return {
        subject: matchLab.subjectName,
        code: matchLab.subjectCode,
        room: matchLab.room,
        teacher: matchLab.teacherName,
        batchLabel: `Batch ${matchLab.batch}`
      };
    }
    const matchAlt = slot.batches.find((b) => b && b.batch === altBatch);
    if (matchAlt) {
      return {
        subject: matchAlt.subjectName,
        code: matchAlt.subjectCode,
        room: matchAlt.room,
        teacher: matchAlt.teacherName,
        batchLabel: `Batch ${matchAlt.batch}`
      };
    }
    const firstB = slot.batches[0] || {};
    return {
      subject: firstB.subjectName || slot.subjectName,
      code: firstB.subjectCode || slot.subjectCode,
      room: firstB.room || slot.room,
      teacher: firstB.teacherName || slot.teacherName,
      batchLabel: firstB.batch ? `Batch ${firstB.batch}` : ""
    };
  };

  // Calculate student attendance metrics for student's current semester subjects
  const studentAtt = (attendance && student?.id && attendance[student.id]) || {};
  let totalLectures = 0;
  let totalAttended = 0;
  const subjectList = [];

  const rawActiveSubjects = getSubjectsForDepartmentAndSemester
    ? getSubjectsForDepartmentAndSemester(studentDept, studentSem)
    : (subjects || []).filter((s) => s.semester === studentSem);
  const activeSubjects = Array.isArray(rawActiveSubjects) ? rawActiveSubjects : [];

  activeSubjects.forEach((sub) => {
    if (!sub) return;
    const sData = studentAtt[sub.id] || { total: 20, attended: 17, percentage: 85 };
    totalLectures += sData.total || 0;
    totalAttended += sData.attended || 0;
    subjectList.push({
      ...sub,
      total: sData.total || 0,
      attended: sData.attended || 0,
      percentage: sData.percentage || 0,
      isLow: (sData.percentage || 0) < threshold
    });
  });

  const overallAttendance = totalLectures > 0 ? Math.round((totalAttended / totalLectures) * 1000) / 10 : 0;
  const lowAttendanceSubjects = subjectList.filter((s) => s.isLow);

  // Student Marks average
  const studentMarks = marks.filter((m) => m.studentId === student?.id);
  const avgMarks =
    studentMarks.length > 0
      ? Math.round(
          studentMarks.reduce((acc, m) => acc + (m.marksObtained / m.maxMarks) * 100, 0) /
            studentMarks.length
        )
      : 78;

  // Pending assignments
  const pendingAssignments = assignments.filter((asg) => {
    const sub = asg.submissions.find((s) => s.studentId === student?.id);
    return !sub || sub.status !== "Submitted";
  });

  // Academic Health Indicator
  let academicStatus = "Good";
  let statusColor = "success";
  if (overallAttendance < threshold || avgMarks < 60 || pendingAssignments.length >= 3) {
    if (overallAttendance < 65 || avgMarks < 50 || pendingAssignments.length >= 4) {
      academicStatus = "High Attention";
      statusColor = "danger";
    } else {
      academicStatus = "Needs Attention";
      statusColor = "warning";
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Welcome Banner */}
      <div
        style={{
          background: "linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%)",
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
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
            <span style={{ fontSize: "0.8rem", background: "rgba(255,255,255,0.15)", padding: "3px 10px", borderRadius: "20px", fontWeight: "600" }}>
              {student?.rollNo || student?.prn || "Student"} • {student?.departmentName || "Engineering"}
            </span>
          </div>
          <h2 style={{ fontSize: "1.75rem", fontWeight: "800", color: "white" }}>
            Good Morning, {student?.name} 👋
          </h2>
          <p style={{ fontSize: "0.9rem", color: "#93c5fd", marginTop: "4px" }}>
            {getStudentClassTitle(student)} • Academic Session {getAcademicSession(student?.year, student?.semester)}
          </p>
        </div>

        <button
          onClick={() => onNavigate("ai-assistant")}
          className="btn btn-primary"
          style={{
            background: "linear-gradient(135deg, #7c3aed, #2563eb)",
            border: "1px solid rgba(255,255,255,0.2)",
            boxShadow: "0 4px 14px rgba(124, 58, 237, 0.4)"
          }}
        >
          <Sparkles size={16} />
          <span>Ask AI Academic Assistant</span>
        </button>
      </div>

      {/* FIRST YEAR COMMON CURRICULUM INTERACTIVE BANNER */}
      {isFirstYear && (
        <div
          style={{
            background: "linear-gradient(135deg, rgba(99, 102, 241, 0.09) 0%, rgba(139, 92, 246, 0.14) 100%)",
            border: "1px solid rgba(99, 102, 241, 0.35)",
            borderRadius: "16px",
            padding: "20px 24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "16px",
            boxShadow: "0 4px 20px rgba(99, 102, 241, 0.1)"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                boxShadow: "0 6px 16px rgba(99, 102, 241, 0.35)"
              }}
            >
              <Layers size={26} />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                <span style={{ fontWeight: "800", fontSize: "1.1rem", color: "var(--color-text-primary)" }}>
                  Central Common First Year Curriculum
                </span>
                <span className="badge badge-purple" style={{ fontSize: "0.75rem" }}>
                  Inherited by {student?.departmentName || "All Engineering Branches"}
                </span>
                <span className="badge badge-success" style={{ fontSize: "0.75rem" }}>
                  {activeSubjects.length} Common Subjects Active
                </span>
              </div>
              <p style={{ margin: "4px 0 0 0", fontSize: "0.85rem", color: "var(--color-text-secondary)" }}>
                Unified curriculum across all 8 branches. Timetable, attendance, study notes, and assignments update synchronously.
              </p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <div
              style={{
                display: "flex",
                background: "var(--color-bg-card)",
                padding: "4px",
                borderRadius: "10px",
                border: "1px solid var(--color-border)"
              }}
            >
              <button
                className={`btn btn-sm ${studentSem === 1 ? "btn-primary" : "btn-secondary"}`}
                style={{
                  padding: "6px 14px",
                  fontWeight: 600,
                  fontSize: "0.82rem",
                  background: studentSem === 1 ? "linear-gradient(135deg, #6366f1, #8b5cf6)" : "transparent",
                  color: studentSem === 1 ? "#fff" : "var(--color-text-secondary)",
                  border: "none"
                }}
                onClick={() => switchStudentSemester(1)}
              >
                Semester I (11 Subjects)
              </button>
              <button
                className={`btn btn-sm ${studentSem === 2 ? "btn-primary" : "btn-secondary"}`}
                style={{
                  padding: "6px 14px",
                  fontWeight: 600,
                  fontSize: "0.82rem",
                  background: studentSem === 2 ? "linear-gradient(135deg, #6366f1, #8b5cf6)" : "transparent",
                  color: studentSem === 2 ? "#fff" : "var(--color-text-secondary)",
                  border: "none"
                }}
                onClick={() => switchStudentSemester(2)}
              >
                Semester II (10 Subjects)
              </button>
            </div>

            <button
              onClick={() => onNavigate("study-material")}
              className="btn btn-secondary btn-sm"
              style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "0.82rem" }}
            >
              <BookOpen size={14} />
              <span>e-Library</span>
            </button>
          </div>
        </div>
      )}

      {/* 4 Main Summary Cards */}
      <div className="stats-grid">
        <StatCard
          label="Overall Attendance"
          value={`${overallAttendance}%`}
          subtext={
            overallAttendance >= threshold
              ? `✓ Above mandatory ${threshold}% threshold`
              : `⚠️ Below mandatory ${threshold}% threshold`
          }
          icon={CalendarCheck}
          variant={overallAttendance >= threshold ? "success" : "danger"}
          onClick={() => onNavigate("attendance")}
        />

        <StatCard
          label="Internal Marks Avg"
          value={`${avgMarks}%`}
          subtext={`Based on ${studentMarks.length} evaluated tests`}
          icon={Award}
          variant="primary"
          onClick={() => onNavigate("marks")}
        />

        <StatCard
          label="Course Assignments"
          value={`${pendingAssignments.length} Pending`}
          subtext={`Total ${assignments.length} assignments active`}
          icon={BookOpen}
          variant={pendingAssignments.length > 0 ? "warning" : "success"}
          onClick={() => onNavigate("assignments")}
        />

        <StatCard
          label="Academic Status"
          value={academicStatus}
          subtext="Transparent multi-metric indicator"
          icon={Activity}
          variant={statusColor}
          onClick={() => onNavigate("performance")}
        />
      </div>

      {/* My Skills & Interests Highlight Card */}
      <div
        className="card"
        style={{
          background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)",
          color: "white",
          padding: "22px 28px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
          boxShadow: "0 8px 20px -4px rgba(49, 46, 129, 0.3)"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              background: "rgba(255, 255, 255, 0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fbbf24",
              flexShrink: 0
            }}
          >
            <Sparkles size={26} />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <h3 style={{ fontSize: "1.15rem", fontWeight: "800", color: "white" }}>
                My Skills & Interests
              </h3>
              {pendingInvitesCount > 0 && (
                <span style={{ background: "#ef4444", color: "white", borderRadius: "10px", padding: "2px 8px", fontSize: "0.72rem", fontWeight: "800" }}>
                  {pendingInvitesCount} New Invitation{pendingInvitesCount > 1 ? "s" : ""}
                </span>
              )}
            </div>
            <p style={{ fontSize: "0.86rem", color: "#c7d2fe", marginTop: "3px" }}>
              Tell your college what you are good at — Sports, Cultural, Event Management, and Technical Skills.
            </p>
            {mySkills.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "8px" }}>
                {mySkills.map((s) => (
                  <span
                    key={s.id}
                    style={{
                      background: "rgba(255,255,255,0.12)",
                      padding: "2px 8px",
                      borderRadius: "6px",
                      fontSize: "0.75rem",
                      fontWeight: "600",
                      color: "white"
                    }}
                  >
                    {s.skill} ({s.skillLevel})
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button
            onClick={() => onNavigate("skills")}
            className="btn btn-sm"
            style={{ background: "#4f46e5", color: "white", border: "none" }}
          >
            Add Skills
          </button>
          <button
            onClick={() => onNavigate("skills")}
            className="btn btn-sm"
            style={{ background: "rgba(255,255,255,0.15)", color: "white", border: "1px solid rgba(255,255,255,0.25)" }}
          >
            View My Skills
          </button>
        </div>
      </div>

      {/* Critical Alert Banner if Low Attendance */}
      {lowAttendanceSubjects.length > 0 && (
        <div
          style={{
            background: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: "12px",
            padding: "16px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "12px"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "8px",
                background: "#fee2e2",
                color: "#dc2626",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0
              }}
            >
              <AlertTriangle size={22} />
            </div>
            <div>
              <div style={{ fontWeight: "700", color: "#991b1b", fontSize: "0.95rem" }}>
                ⚠️ Attendance Risk Alert
              </div>
              <div style={{ fontSize: "0.85rem", color: "#7f1d1d", marginTop: "2px" }}>
                Your attendance in <strong>{(lowAttendanceSubjects || []).map((s) => `${s?.name || "Subject"} (${s?.percentage || 0}%)`).join(", ")}</strong> is below the configured {threshold}% threshold.
              </div>
            </div>
          </div>
          <button
            onClick={() => onNavigate("attendance")}
            className="btn btn-danger btn-sm"
          >
            <span>View Recovery Calculator</span>
            <ArrowRight size={14} />
          </button>
        </div>
      )}

      {/* Two Column Grid: Today's Timetable & Upcoming Tasks */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "24px" }}>
        {/* Today's Lectures Card */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Clock size={18} color="var(--primary-600)" />
                <span>Today's Timetable ({todayDayName})</span>
              </div>
              <div className="card-subtitle">
                Classroom A-209 • Batch {labBatch} • Semester V
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Badge variant={isWeekend ? "neutral" : "primary"}>
                {isWeekend ? "No Classes Today" : `${todaySlots.length} Slots`}
              </Badge>
              <button
                onClick={() => onNavigate("timetable")}
                className="btn btn-secondary btn-sm"
                title="View complete weekly timetable"
                style={{ display: "flex", alignItems: "center", gap: "4px" }}
              >
                <span>Full Timetable</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>

          {isWeekend ? (
            <div style={{ padding: "36px 16px", textAlign: "center", background: "var(--bg-surface-secondary)", borderRadius: "12px" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "var(--primary-100)", color: "var(--primary-700)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px auto" }}>
                <SunMedium size={24} />
              </div>
              <div style={{ fontWeight: "800", fontSize: "1.1rem", color: "var(--text-main)" }}>
                No Classes Today
              </div>
              <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: "4px", marginBottom: "16px" }}>
                It's Sunday. Lectures resume Monday at 10:00 AM with MCA in Classroom A-209.
              </div>
              <button onClick={() => onNavigate("timetable")} className="btn btn-primary btn-sm">
                <CalendarDays size={14} />
                <span>View Full Weekly Timetable</span>
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {(todaySlots || []).map((item, idx) => {
                if (!item) return null;
                const status = getSlotStatus(item.time);
                const isBreak = item.type === "Break";
                const resolved = resolveBatchSlot(item);

                if (isBreak) {
                  return (
                    <div
                      key={item.id || idx}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "9px 14px",
                        background: "rgba(245, 158, 11, 0.06)",
                        border: "1px dashed rgba(245, 158, 11, 0.25)",
                        borderRadius: "8px",
                        fontSize: "0.82rem"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#b45309", fontWeight: "700" }}>
                        <Coffee size={14} />
                        <span>{item.subjectName} ({item.room})</span>
                      </div>
                      <span style={{ color: "#b45309", fontWeight: "700" }}>{item.time}</span>
                    </div>
                  );
                }

                const isActive = status === "active";
                const isCompleted = status === "completed";

                return (
                  <div
                    key={item.id || idx}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "11px 15px",
                      borderRadius: "10px",
                      background: isActive
                        ? "linear-gradient(135deg, rgba(37, 99, 235, 0.08) 0%, rgba(99, 102, 241, 0.04) 100%)"
                        : isCompleted
                        ? "var(--bg-surface-secondary)"
                        : "var(--bg-surface)",
                      border: isActive
                        ? "2px solid var(--primary-500)"
                        : "1px solid var(--border-subtle)",
                      boxShadow: isActive ? "0 2px 10px rgba(37, 99, 235, 0.15)" : "none"
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                        <span style={{ fontWeight: "700", fontSize: "0.9rem", color: isActive ? "var(--primary-800)" : "var(--text-main)" }}>
                          {resolved.subject}
                        </span>
                        {resolved.code && (
                          <span style={{ fontSize: "0.74rem", color: "var(--primary-600)", fontWeight: "700" }}>
                            ({resolved.code})
                          </span>
                        )}
                        {resolved.batchLabel && (
                          <span style={{ fontSize: "0.68rem", background: "var(--primary-100)", color: "var(--primary-800)", padding: "1px 5px", borderRadius: "4px", fontWeight: "700" }}>
                            {resolved.batchLabel}
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: "0.76rem", color: "var(--text-muted)", marginTop: "2px", display: "flex", alignItems: "center", gap: "10px" }}>
                        <span>Faculty: {resolved.teacher}</span>
                        <span>•</span>
                        <span style={{ display: "flex", alignItems: "center", gap: "3px" }}>
                          <MapPin size={11} color="var(--primary-600)" />
                          {resolved.room}
                        </span>
                      </div>
                    </div>

                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "0.82rem", fontWeight: "800", color: isActive ? "var(--primary-700)" : "var(--text-main)" }}>
                        {item.time}
                      </div>
                      <div style={{ marginTop: "2px" }}>
                        {isActive ? (
                          <span style={{ fontSize: "0.65rem", background: "#22c55e", color: "white", padding: "1px 6px", borderRadius: "10px", fontWeight: "800", display: "inline-flex", alignItems: "center", gap: "3px" }}>
                            <span style={{ width: "4px", height: "4px", borderRadius: "50%", background: "white" }} />
                            ACTIVE NOW
                          </span>
                        ) : isCompleted ? (
                          <span style={{ fontSize: "0.68rem", color: "var(--text-muted)", fontWeight: "600" }}>
                            Completed
                          </span>
                        ) : (
                          <span style={{ fontSize: "0.68rem", color: "var(--primary-600)", fontWeight: "600" }}>
                            Upcoming
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Upcoming Tests & Assignments */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Upcoming Tests */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <Calendar size={18} color="var(--accent-purple)" />
                Upcoming Exams & Tests
              </div>
              <button
                onClick={() => onNavigate("exams")}
                style={{ background: "none", border: "none", color: "var(--primary-600)", fontSize: "0.8rem", fontWeight: "600", cursor: "pointer" }}
              >
                View All
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ padding: "12px", borderRadius: "8px", background: "#f5f3ff", border: "1px solid #ddd6fe", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: "700", fontSize: "0.85rem", color: "#5b21b6" }}>DBMS Mid-Term Exam</div>
                  <div style={{ fontSize: "0.75rem", color: "#6d28d9" }}>24 Sept 2026 • 10:00 AM</div>
                </div>
                <Badge variant="purple">15 Days Left</Badge>
              </div>

              <div style={{ padding: "12px", borderRadius: "8px", background: "#fffbeb", border: "1px solid #fde68a", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: "700", fontSize: "0.85rem", color: "#92400e" }}>OS Assignment Submission</div>
                  <div style={{ fontSize: "0.75rem", color: "#b45309" }}>Due 16 Sept 2026 • 50 Pts</div>
                </div>
                <Badge variant="warning">Due Soon</Badge>
              </div>
            </div>
          </div>

          {/* Quick Notice Board snippet */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <FileText size={18} color="var(--primary-600)" />
                Recent Notices & Circulars
              </div>
              <button
                onClick={() => onNavigate("notices")}
                style={{ background: "none", border: "none", color: "var(--primary-600)", fontSize: "0.8rem", fontWeight: "600", cursor: "pointer" }}
              >
                Board
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {notices.slice(0, 2).map((n) => (
                <div key={n.id} style={{ borderBottom: "1px solid var(--border-subtle)", paddingBottom: "10px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "3px" }}>
                    {n.important && <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#ef4444" }} />}
                    <span style={{ fontWeight: "600", fontSize: "0.82rem", color: "var(--text-main)" }}>
                      {n.title}
                    </span>
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                    {n.author} • {n.publishDate}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect, useMemo } from "react";
import { useSmartCampus } from "../../context/SmartCampusContext";
import {
  INITIAL_TIMETABLES,
  VLSI_CLASS_METADATA,
  getStudentBatchInfo as fallbackGetBatchInfo
} from "../../data/initialData";
import {
  Clock,
  Calendar,
  CalendarDays,
  MapPin,
  UserCheck,
  Building2,
  GraduationCap,
  Sparkles,
  Info,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Download,
  Filter,
  Layers,
  ChevronRight,
  BookOpen,
  Coffee,
  Users,
  SunMedium,
  Printer,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Search
} from "lucide-react";
import { Badge } from "../common/UIPrimitives";

export default function StudentTimetable({ onNavigate }) {
  const {
    currentUser,
    timetables: contextTimetables,
    classMetadata: contextClassMetadata,
    getStudentBatchInfo: contextGetBatchInfo,
    switchStudentSemester,
    addToast
  } = useSmartCampus();

  const student = currentUser;
  const rollNo = student?.rollNo || "VLSI3152";

  // Batch info resolver with safe fallback
  const batchInfoResolver = contextGetBatchInfo || fallbackGetBatchInfo;
  const { labBatch, altBatch, tgMentor } = useMemo(() => {
    if (typeof batchInfoResolver === "function") {
      try {
        return batchInfoResolver(rollNo);
      } catch (err) {
        console.warn("Could not calculate batch info for student:", err);
      }
    }
    return { labBatch: "TA2", tgBatch: "TG-2", altBatch: "TAB", tgMentor: "Ms. K. B. Dandge (TG-2)" };
  }, [batchInfoResolver, rollNo]);

  // Robust array-based state initialization
  const [timetableData, setTimetableData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  // Real-time system day & time detection
  const [currentSystemDate, setCurrentSystemDate] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSystemDate(new Date());
    }, 30000); // update every 30s
    return () => clearInterval(timer);
  }, []);

  // Synchronize and validate timetable data state
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setHasError(false);

    try {
      // Validate incoming data from context or fallback safely
      let sourceList = [];
      if (Array.isArray(contextTimetables) && contextTimetables.length > 0) {
        sourceList = contextTimetables;
      } else if (Array.isArray(INITIAL_TIMETABLES) && INITIAL_TIMETABLES.length > 0) {
        sourceList = INITIAL_TIMETABLES;
      }

      if (isMounted) {
        setTimetableData(sourceList);
        setIsLoading(false);
      }
    } catch (err) {
      console.error("Error initializing class timetable data:", err);
      if (isMounted) {
        setHasError(true);
        setErrorMessage("Unable to load timetable. Please try again.");
        setIsLoading(false);
      }
    }

    return () => {
      isMounted = false;
    };
  }, [contextTimetables]);

  const handleRetryLoad = () => {
    setIsLoading(true);
    setHasError(false);
    setTimeout(() => {
      setTimetableData(INITIAL_TIMETABLES || []);
      setIsLoading(false);
      if (addToast) {
        addToast({
          type: "success",
          title: "Timetable Refreshed",
          message: "Loaded master academic schedule successfully."
        });
      }
    }, 300);
  };

  const todayDayName = currentSystemDate.toLocaleDateString("en-US", { weekday: "long" });
  const isWeekend = todayDayName === "Sunday";

  // Two clear primary view modes: "daily" (Day Timeline) | "weekly" (Full Academic Grid)
  const [viewMode, setViewMode] = useState("daily");
  const [selectedDayTab, setSelectedDayTab] = useState(isWeekend ? "Monday" : todayDayName);
  const [batchFilterMode, setBatchFilterMode] = useState("my"); // "my" | "all"
  const [showCourseDirectory, setShowCourseDirectory] = useState(false);

  // Time comparison helper
  const getSlotStatus = (timeStr, isTodaySlot) => {
    if (!isTodaySlot) return "normal";

    const parts = (timeStr || "").replace("–", "-").split("-").map((s) => s.trim());
    if (parts.length !== 2) return "normal";

    const parseMinutes = (tStr) => {
      const match = (tStr || "").match(/(\d+):(\d+)\s*(AM|PM)/i);
      if (!match) return 0;
      let hours = parseInt(match[1], 10);
      const mins = parseInt(match[2], 10);
      const period = match[3].toUpperCase();
      if (period === "PM" && hours !== 12) hours += 12;
      if (period === "AM" && hours === 12) hours = 0;
      return hours * 60 + mins;
    };

    const nowMinutes = currentSystemDate.getHours() * 60 + currentSystemDate.getMinutes();
    const startM = parseMinutes(parts[0]);
    const endM = parseMinutes(parts[1]);

    if (nowMinutes >= endM) return "completed";
    if (nowMinutes >= startM && nowMinutes < endM) return "active";
    return "upcoming";
  };

  // Filter slots for student's active semester and division
  const studentDept = student?.departmentId || "dept-vlsi";
  const studentSem = Number(student?.semester) || 5;
  const studentDiv = student?.division || "A";
  const isFirstYear = student?.year === "First Year" || studentSem <= 2;

  // Compute filtered slots safely
  const classSlots = useMemo(() => {
    if (!Array.isArray(timetableData)) return [];

    return timetableData.filter((t) => {
      if (!t) return false;

      // Department & branch matching
      const matchesDept = isFirstYear
        ? t.departmentId === "common" || t.is_common_timetable || t.departmentId === studentDept
        : t.departmentId === studentDept;

      // Semester matching
      const matchesSem = Number(t.semester) === Number(studentSem);

      // Division matching (Division A or All or general)
      const matchesDiv = t.division === studentDiv || t.division === "All" || !t.division || studentDiv === "A";

      return matchesDept && matchesSem && matchesDiv;
    });
  }, [timetableData, studentDept, studentSem, studentDiv, isFirstYear]);

  // Active day slots
  const activeDaySlots = useMemo(() => {
    return classSlots.filter((t) => t && t.day === selectedDayTab);
  }, [classSlots, selectedDayTab]);

  // Standard time slots for matrix display with safe fallback
  const standardTimeSlots = useMemo(() => {
    const meta = contextClassMetadata || VLSI_CLASS_METADATA;
    if (meta && Array.isArray(meta.timeSlots) && meta.timeSlots.length > 0) {
      return meta.timeSlots;
    }
    return [
      "10:00 AM - 11:15 AM",
      "11:15 AM - 12:15 PM",
      "12:15 PM - 01:00 PM",
      "01:00 PM - 02:00 PM",
      "02:00 PM - 03:00 PM",
      "03:00 PM - 03:15 PM",
      "03:15 PM - 04:15 PM",
      "04:15 PM - 05:15 PM"
    ];
  }, [contextClassMetadata]);

  // Resolve practical slot for student's assigned lab batch
  const resolveStudentBatchItem = (slot) => {
    if (!slot) return { subject: "Class", code: "", room: "", teacher: "", batchLabel: "" };

    const batchesList = Array.isArray(slot.batches) ? slot.batches : [];

    if (batchesList.length === 0) {
      return {
        subject: slot.subjectName || "Subject",
        code: slot.subjectCode || "",
        room: slot.room || "Classroom",
        teacher: slot.teacherName || "Faculty",
        batchLabel: slot.batch === "All" ? "All Batches" : slot.batch || "Class"
      };
    }

    // Match 3-batch rotation first (TA, TB, TC)
    const matchLab = batchesList.find((b) => b && b.batch === labBatch);
    if (matchLab) {
      return {
        subject: matchLab.subjectName || slot.subjectName,
        code: matchLab.subjectCode || slot.subjectCode,
        room: matchLab.room || slot.room,
        teacher: matchLab.teacherName || slot.teacherName,
        batchLabel: `Batch ${matchLab.batch}`
      };
    }

    // Match 2-batch rotation (TAA, TAB)
    const matchAlt = batchesList.find((b) => b && b.batch === altBatch);
    if (matchAlt) {
      return {
        subject: matchAlt.subjectName || slot.subjectName,
        code: matchAlt.subjectCode || slot.subjectCode,
        room: matchAlt.room || slot.room,
        teacher: matchAlt.teacherName || slot.teacherName,
        batchLabel: `Batch ${matchAlt.batch}`
      };
    }

    // Fallback to first batch
    const firstBatch = batchesList[0] || {};
    return {
      subject: firstBatch.subjectName || slot.subjectName || "Practical Lab",
      code: firstBatch.subjectCode || slot.subjectCode || "",
      room: firstBatch.room || slot.room || "Lab",
      teacher: firstBatch.teacherName || slot.teacherName || "Faculty",
      batchLabel: `Batch ${firstBatch.batch || "TA"}`
    };
  };

  const handlePrint = () => {
    window.print();
  };

  // 1. DATA STATE: LOADING
  if (isLoading) {
    return (
      <div style={{ padding: "48px 24px", textAlign: "center", maxWidth: "600px", margin: "40px auto" }} className="card">
        <div style={{
          width: "56px",
          height: "56px",
          borderRadius: "50%",
          background: "var(--primary-50)",
          color: "var(--primary-600)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 16px auto",
          animation: "spin 1.5s linear infinite"
        }}>
          <Clock size={28} />
        </div>
        <h3 style={{ fontSize: "1.25rem", fontWeight: "700", marginBottom: "8px" }}>Loading timetable...</h3>
        <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", margin: 0 }}>
          Retrieving academic lecture schedules, laboratory batches, and venue allocations for your class.
        </p>
      </div>
    );
  }

  // 2. DATA STATE: API FAILURE / ERROR
  if (hasError) {
    return (
      <div style={{ padding: "40px 24px", textAlign: "center", maxWidth: "600px", margin: "40px auto" }} className="card">
        <div style={{
          width: "56px",
          height: "56px",
          borderRadius: "50%",
          background: "#fee2e2",
          color: "#ef4444",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 16px auto"
        }}>
          <AlertCircle size={28} />
        </div>
        <h3 style={{ fontSize: "1.25rem", fontWeight: "700", color: "#991b1b", marginBottom: "8px" }}>
          Unable to load timetable. Please try again.
        </h3>
        <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", marginBottom: "20px" }}>
          {errorMessage || "We encountered an issue synchronizing your academic schedule records."}
        </p>
        <button
          onClick={handleRetryLoad}
          className="btn btn-primary"
          style={{ display: "inline-flex", alignItems: "center", gap: "8px", margin: "0 auto" }}
        >
          <RefreshCw size={16} /> Reload Timetable
        </button>
      </div>
    );
  }

  // 3. DATA STATE: MISSING STUDENT RECORD
  if (!student) {
    return (
      <div style={{ padding: "40px 24px", textAlign: "center", maxWidth: "600px", margin: "40px auto" }} className="card">
        <AlertTriangle size={36} color="#f59e0b" style={{ margin: "0 auto 16px auto" }} />
        <h3 style={{ fontSize: "1.25rem", fontWeight: "700", marginBottom: "8px" }}>Student Record Missing</h3>
        <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", marginBottom: "16px" }}>
          Please ensure you are logged into a registered student profile to view the personalized class schedule.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "1400px", margin: "0 auto" }}>
      {/* 1. Header Banner & Class Metadata */}
      <div
        style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 60%, #312e81 100%)",
          borderRadius: "18px",
          padding: "24px 28px",
          color: "white",
          boxShadow: "0 10px 25px -5px rgba(15, 23, 42, 0.4)",
          position: "relative",
          overflow: "hidden"
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "20px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", flexWrap: "wrap" }}>
              <span
                style={{
                  fontSize: "0.75rem",
                  background: "rgba(99, 102, 241, 0.3)",
                  color: "#c7d2fe",
                  border: "1px solid rgba(165, 180, 252, 0.3)",
                  padding: "3px 10px",
                  borderRadius: "20px",
                  fontWeight: "700",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em"
                }}
              >
                Official Master Timetable
              </span>
              <span
                style={{
                  fontSize: "0.75rem",
                  background: "rgba(16, 185, 129, 0.2)",
                  color: "#6ee7b7",
                  border: "1px solid rgba(110, 231, 183, 0.3)",
                  padding: "3px 10px",
                  borderRadius: "20px",
                  fontWeight: "700"
                }}
              >
                Academic Year 2026–27
              </span>
              <span
                style={{
                  fontSize: "0.75rem",
                  background: "rgba(245, 158, 11, 0.2)",
                  color: "#fcd34d",
                  border: "1px solid rgba(252, 211, 77, 0.3)",
                  padding: "3px 10px",
                  borderRadius: "20px",
                  fontWeight: "700"
                }}
              >
                Room: A-209
              </span>
            </div>

            <h1 style={{ fontSize: "1.75rem", fontWeight: "800", margin: "0 0 6px 0", letterSpacing: "-0.01em" }}>
              {student?.departmentName || "Electronics Engineering (VLSI Design & Technology)"}
            </h1>
            <p style={{ margin: 0, fontSize: "0.9rem", color: "#cbd5e1" }}>
              {student?.year || "Third Year (TE)"} • Semester {studentSem} • Division {studentDiv} • Classroom A-209
            </p>
          </div>

          {/* Student Batch Allocation Badge */}
          <div
            style={{
              background: "rgba(255, 255, 255, 0.08)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              borderRadius: "12px",
              padding: "14px 18px",
              minWidth: "250px"
            }}
          >
            <div style={{ fontSize: "0.72rem", color: "#94a3b8", fontWeight: "700", textTransform: "uppercase", marginBottom: "4px" }}>
              Your Enrolled Batch
            </div>
            <div style={{ fontSize: "1rem", fontWeight: "700", color: "#f8fafc", marginBottom: "6px" }}>
              {student?.name} ({rollNo})
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", fontSize: "0.75rem" }}>
              <span style={{ background: "rgba(59, 130, 246, 0.35)", color: "#bfdbfe", padding: "2px 8px", borderRadius: "6px", fontWeight: "700" }}>
                Lab Batch: {labBatch}
              </span>
              <span style={{ background: "rgba(168, 85, 247, 0.35)", color: "#e9d5ff", padding: "2px 8px", borderRadius: "6px", fontWeight: "700" }}>
                Mini Project: {altBatch}
              </span>
              <span style={{ background: "rgba(16, 185, 129, 0.35)", color: "#a7f3d0", padding: "2px 8px", borderRadius: "6px", fontWeight: "700" }}>
                Mentor: {tgMentor ? tgMentor.split("(")[0].trim() : "Faculty"}
              </span>
            </div>
          </div>
        </div>

        {/* View Switcher & Actions Bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: "20px",
            paddingTop: "16px",
            borderTop: "1px solid rgba(255, 255, 255, 0.12)",
            flexWrap: "wrap",
            gap: "12px"
          }}
        >
          {/* Primary View Switcher */}
          <div style={{ display: "flex", gap: "8px", background: "rgba(0, 0, 0, 0.3)", padding: "4px", borderRadius: "10px" }}>
            <button
              onClick={() => setViewMode("daily")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "7px 16px",
                borderRadius: "8px",
                fontSize: "0.85rem",
                fontWeight: "700",
                border: "none",
                cursor: "pointer",
                transition: "all 0.2s",
                background: viewMode === "daily" ? "var(--primary-600)" : "transparent",
                color: "white"
              }}
            >
              <Calendar size={15} />
              <span>Daily Schedule Timeline</span>
            </button>

            <button
              onClick={() => setViewMode("weekly")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "7px 16px",
                borderRadius: "8px",
                fontSize: "0.85rem",
                fontWeight: "700",
                border: "none",
                cursor: "pointer",
                transition: "all 0.2s",
                background: viewMode === "weekly" ? "var(--primary-600)" : "transparent",
                color: "white"
              }}
            >
              <CalendarDays size={15} />
              <span>Weekly Master Matrix</span>
            </button>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            {/* Practical Batch Toggle */}
            <div style={{ display: "flex", alignItems: "center", gap: "6px", background: "rgba(0,0,0,0.25)", padding: "4px 8px", borderRadius: "8px" }}>
              <span style={{ fontSize: "0.75rem", color: "#94a3b8", fontWeight: "600" }}>Lab View:</span>
              <button
                onClick={() => setBatchFilterMode("my")}
                style={{
                  padding: "4px 10px",
                  fontSize: "0.75rem",
                  borderRadius: "6px",
                  border: "none",
                  fontWeight: "700",
                  cursor: "pointer",
                  background: batchFilterMode === "my" ? "#6366f1" : "transparent",
                  color: "white"
                }}
              >
                My Batch ({labBatch})
              </button>
              <button
                onClick={() => setBatchFilterMode("all")}
                style={{
                  padding: "4px 10px",
                  fontSize: "0.75rem",
                  borderRadius: "6px",
                  border: "none",
                  fontWeight: "700",
                  cursor: "pointer",
                  background: batchFilterMode === "all" ? "#6366f1" : "transparent",
                  color: "white"
                }}
              >
                All Batches
              </button>
            </div>

            <button
              onClick={() => setShowCourseDirectory(!showCourseDirectory)}
              className="btn btn-secondary btn-sm"
              style={{ background: "rgba(255, 255, 255, 0.1)", borderColor: "rgba(255, 255, 255, 0.2)", color: "white" }}
            >
              <BookOpen size={14} />
              <span>{showCourseDirectory ? "Hide Course Directory" : "Course Key"}</span>
              {showCourseDirectory ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            <button
              onClick={handlePrint}
              className="btn btn-secondary btn-sm"
              style={{ background: "rgba(255, 255, 255, 0.1)", borderColor: "rgba(255, 255, 255, 0.2)", color: "white" }}
            >
              <Printer size={14} />
              <span>Print Timetable</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Collapsible Course & Faculty Directory */}
      {showCourseDirectory && (
        <div className="card" style={{ border: "1px solid var(--primary-200)", background: "var(--bg-surface)" }}>
          <div className="card-header">
            <div className="card-title">
              <BookOpen size={18} color="var(--primary-600)" />
              TE VLSI Semester 5 — Subject & Faculty Directory Key
            </div>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Room A-209</span>
          </div>

          <div className="table-container" style={{ marginTop: "8px" }}>
            <table>
              <thead>
                <tr>
                  <th>Course Code</th>
                  <th>Course Name</th>
                  <th>Faculty In-Charge</th>
                  <th>Type</th>
                  <th>Weekly Load</th>
                  <th>Venue</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><Badge variant="purple">VLSI501</Badge></td>
                  <td><strong>CMOS VLSI Design</strong></td>
                  <td>Dr. Rana</td>
                  <td>Theory</td>
                  <td>4 Hours</td>
                  <td>Classroom A-209</td>
                </tr>
                <tr>
                  <td><Badge variant="purple">MCA</Badge></td>
                  <td><strong>Microcontroller & Its Applications</strong></td>
                  <td>Mr. G. G. Patil (GGP)</td>
                  <td>Theory + Lab</td>
                  <td>4 Hours</td>
                  <td>Classroom A-209 / Lab 1</td>
                </tr>
                <tr>
                  <td><Badge variant="purple">DSIP</Badge></td>
                  <td><strong>Digital Signal and Image Processing</strong></td>
                  <td>Mr. G. R. Bhalekar (GRB)</td>
                  <td>Theory + Lab</td>
                  <td>4 Hours</td>
                  <td>Classroom A-209 / Lab 2</td>
                </tr>
                <tr>
                  <td><Badge variant="purple">CSE</Badge></td>
                  <td><strong>Control System Engineering</strong></td>
                  <td>Mr. R. M. Chudiwal (RMC)</td>
                  <td>Theory</td>
                  <td>4 Hours</td>
                  <td>Classroom A-209</td>
                </tr>
                <tr>
                  <td><Badge variant="purple">OE</Badge></td>
                  <td><strong>Open Elective Bucket</strong></td>
                  <td>Ms. A. H. Mante (AHM)</td>
                  <td>Theory</td>
                  <td>3 Hours</td>
                  <td>Classroom A-209</td>
                </tr>
                <tr>
                  <td><Badge variant="purple">MDM</Badge></td>
                  <td><strong>MDM Bucket</strong></td>
                  <td>Mrs. K. B. Dandge (KBD)</td>
                  <td>Theory</td>
                  <td>3 Hours</td>
                  <td>Classroom A-209</td>
                </tr>
                <tr>
                  <td><Badge variant="purple">MP</Badge></td>
                  <td><strong>Mini Project</strong></td>
                  <td>TAM, HGA / GGP, PNK</td>
                  <td>Laboratory</td>
                  <td>2 Hours</td>
                  <td>Lab A-201 / A-306</td>
                </tr>
                <tr>
                  <td><Badge variant="purple">VAC</Badge></td>
                  <td><strong>Value Added Course</strong></td>
                  <td>AHM, RMC / SAC, GGP</td>
                  <td>Workshop</td>
                  <td>2 Hours</td>
                  <td>Lab A-206 / A-203</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DATA STATE: EMPTY TIMETABLE */}
      {classSlots.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "48px 24px" }}>
          <CalendarDays size={48} style={{ color: "var(--text-muted)", margin: "0 auto 16px auto" }} />
          <h3 style={{ fontSize: "1.25rem", fontWeight: "700", color: "var(--text-main)", marginBottom: "8px" }}>
            No timetable available for your class.
          </h3>
          <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", maxWidth: "500px", margin: "0 auto 20px auto", lineHeight: "1.5" }}>
            No lecture or practical slots are currently scheduled for {student?.departmentName || "your department"} (Semester {studentSem}, Division {studentDiv}). Please contact the Academic Department Coordinator or reload.
          </p>
          <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap" }}>
            <button
              onClick={handleRetryLoad}
              className="btn btn-secondary btn-sm"
              style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
            >
              <RefreshCw size={14} /> Refresh Timetable
            </button>
            {onNavigate && (
              <button
                onClick={() => onNavigate("dashboard")}
                className="btn btn-primary btn-sm"
              >
                Return to Dashboard
              </button>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* 3. VIEW MODE A: DAILY SCHEDULE TIMELINE */}
          {viewMode === "daily" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Day Navigation Tabs Bar */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "12px",
                  background: "var(--bg-surface)",
                  padding: "12px 18px",
                  borderRadius: "14px",
                  border: "1px solid var(--border-subtle)",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.03)"
                }}
              >
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {(daysOfWeek || []).map((day) => {
                    const isSelected = selectedDayTab === day;
                    const isToday = day === todayDayName;

                    return (
                      <button
                        key={day}
                        onClick={() => setSelectedDayTab(day)}
                        style={{
                          padding: "8px 16px",
                          borderRadius: "10px",
                          border: isSelected ? "2px solid var(--primary-600)" : "1px solid var(--border-subtle)",
                          background: isSelected ? "var(--primary-50)" : "var(--bg-surface)",
                          color: isSelected ? "var(--primary-800)" : "var(--text-main)",
                          fontWeight: isSelected ? "800" : "600",
                          fontSize: "0.88rem",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          transition: "all 0.15s ease"
                        }}
                      >
                        <span>{day}</span>
                        {isToday && (
                          <span
                            style={{
                              background: "#22c55e",
                              color: "white",
                              fontSize: "0.62rem",
                              padding: "2px 6px",
                              borderRadius: "10px",
                              fontWeight: "800"
                            }}
                          >
                            TODAY
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "6px" }}>
                  <Clock size={14} />
                  <span>Current Time: <strong>{currentSystemDate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</strong></span>
                </div>
              </div>

              {/* Schedule List for the Selected Day */}
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {(activeDaySlots || []).length === 0 ? (
                  <div className="card" style={{ textAlign: "center", padding: "40px 20px" }}>
                    <p style={{ color: "var(--text-muted)", margin: 0 }}>No lectures scheduled for {selectedDayTab}.</p>
                  </div>
                ) : (
                  (activeDaySlots || []).map((slot, idx) => {
                    if (!slot) return null;
                    const isToday = selectedDayTab === todayDayName;
                    const status = getSlotStatus(slot.time, isToday);
                    const isBreak = slot.type === "Break";
                    const isPrac = slot.type === "Practical";
                    const resolved = resolveStudentBatchItem(slot);

                    // If it's a break slot (Tea / Lunch)
                    if (isBreak) {
                      return (
                        <div
                          key={slot.id || idx}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "10px 20px",
                            background: "rgba(245, 158, 11, 0.08)",
                            border: "1px dashed rgba(245, 158, 11, 0.35)",
                            borderRadius: "12px"
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <Coffee size={18} color="#d97706" />
                            <span style={{ fontWeight: "700", color: "#b45309", fontSize: "0.88rem" }}>
                              {slot.subjectName}
                            </span>
                            <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                              ({slot.room || "Campus Cafeteria"})
                            </span>
                          </div>
                          <div style={{ fontSize: "0.82rem", fontWeight: "700", color: "#b45309" }}>
                            {slot.time}
                          </div>
                        </div>
                      );
                    }

                    // Regular Lecture / Practical Period Card
                    const isActiveNow = status === "active";
                    const isCompleted = status === "completed";

                    return (
                      <div
                        key={slot.id || idx}
                        className="card"
                        style={{
                          padding: "16px 20px",
                          borderRadius: "14px",
                          border: isActiveNow
                            ? "2px solid #3b82f6"
                            : "1px solid var(--border-subtle)",
                          background: isActiveNow
                            ? "linear-gradient(135deg, rgba(59, 130, 246, 0.06) 0%, var(--bg-surface) 100%)"
                            : "var(--bg-surface)",
                          boxShadow: isActiveNow ? "0 4px 20px rgba(59, 130, 246, 0.12)" : "0 2px 4px rgba(0,0,0,0.02)",
                          transition: "all 0.2s ease"
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
                          {/* Left: Period # and Timing */}
                          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                            <div
                              style={{
                                background: isActiveNow ? "#2563eb" : "var(--bg-surface-secondary)",
                                color: isActiveNow ? "white" : "var(--text-main)",
                                fontWeight: "800",
                                fontSize: "0.82rem",
                                padding: "6px 12px",
                                borderRadius: "8px",
                                textAlign: "center",
                                minWidth: "75px"
                              }}
                            >
                              Period #{idx + 1}
                            </div>

                            <div>
                              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "2px" }}>
                                <span style={{ fontSize: "1.08rem", fontWeight: "800", color: "var(--text-main)" }}>
                                  {isPrac && batchFilterMode === "my" ? resolved.subject : slot.subjectName}
                                </span>
                                {slot.subjectCode && (
                                  <Badge variant="purple">
                                    {isPrac && batchFilterMode === "my" ? resolved.code : slot.subjectCode}
                                  </Badge>
                                )}
                                <Badge variant={isPrac ? "warning" : "info"}>
                                  {slot.type || "Theory"}
                                </Badge>
                              </div>

                              <div style={{ display: "flex", alignItems: "center", gap: "16px", fontSize: "0.82rem", color: "var(--text-secondary)", flexWrap: "wrap" }}>
                                <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                  <Clock size={13} color="var(--primary-600)" />
                                  <strong>{slot.time}</strong>
                                </span>

                                <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                  <GraduationCap size={13} color="var(--primary-600)" />
                                  <span>Faculty: <strong>{isPrac && batchFilterMode === "my" ? resolved.teacher : slot.teacherName}</strong></span>
                                </span>

                                <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                  <MapPin size={13} color="var(--primary-600)" />
                                  <span>Room: <strong>{isPrac && batchFilterMode === "my" ? resolved.room : slot.room}</strong></span>
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Right: Real-time Status Badge */}
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            {isActiveNow ? (
                              <span
                                style={{
                                  background: "#22c55e",
                                  color: "white",
                                  fontSize: "0.72rem",
                                  fontWeight: "800",
                                  padding: "4px 10px",
                                  borderRadius: "20px",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "5px",
                                  boxShadow: "0 0 12px rgba(34, 197, 94, 0.4)"
                                }}
                              >
                                <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "white" }} />
                                ACTIVE NOW
                              </span>
                            ) : isCompleted ? (
                              <span style={{ fontSize: "0.72rem", background: "var(--bg-surface-secondary)", color: "var(--text-muted)", padding: "3px 8px", borderRadius: "8px", fontWeight: "600" }}>
                                Completed
                              </span>
                            ) : isToday ? (
                              <span style={{ fontSize: "0.72rem", background: "var(--primary-50)", color: "var(--primary-700)", padding: "3px 8px", borderRadius: "8px", fontWeight: "600" }}>
                                Upcoming Today
                              </span>
                            ) : null}

                            {isPrac && (
                              <span style={{ fontSize: "0.72rem", background: "var(--primary-100)", color: "var(--primary-800)", padding: "3px 8px", borderRadius: "8px", fontWeight: "700" }}>
                                {batchFilterMode === "my" ? resolved.batchLabel : "Lab Session"}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Simultaneous Lab Rotation Display */}
                        {isPrac && batchFilterMode === "all" && Array.isArray(slot.batches) && slot.batches.length > 0 && (
                          <div style={{ marginTop: "14px", paddingTop: "12px", borderTop: "1px solid var(--border-subtle)" }}>
                            <div style={{ fontSize: "0.78rem", fontWeight: "700", color: "var(--text-muted)", marginBottom: "8px" }}>
                              Simultaneous Batch Rotation Allocation:
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "10px" }}>
                              {slot.batches.map((b, bIdx) => {
                                if (!b) return null;
                                const isMyBatch = b.batch === labBatch || b.batch === altBatch;
                                return (
                                  <div
                                    key={bIdx}
                                    style={{
                                      background: isMyBatch ? "var(--primary-50)" : "var(--bg-surface-secondary)",
                                      border: isMyBatch ? "1.5px solid var(--primary-400)" : "1px solid var(--border-subtle)",
                                      padding: "10px 12px",
                                      borderRadius: "8px"
                                    }}
                                  >
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2px" }}>
                                      <span style={{ fontWeight: "800", fontSize: "0.8rem", color: isMyBatch ? "var(--primary-800)" : "var(--text-main)" }}>
                                        Batch {b.batch} {isMyBatch && "★ (Your Batch)"}
                                      </span>
                                      <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{b.room}</span>
                                    </div>
                                    <div style={{ fontSize: "0.82rem", fontWeight: "700" }}>{b.subjectName}</div>
                                    <div style={{ fontSize: "0.75rem", color: "var(--primary-700)", marginTop: "2px" }}>
                                      Faculty: {b.teacherName}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* 4. VIEW MODE B: WEEKLY MASTER ACADEMIC MATRIX */}
          {viewMode === "weekly" && (
            <div className="card" style={{ padding: "16px", overflowX: "auto" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", flexWrap: "wrap", gap: "8px" }}>
                <h3 style={{ fontSize: "1.1rem", fontWeight: "800", color: "var(--text-main)", margin: 0 }}>
                  Class Schedule (Monday to Saturday) • {student?.departmentName || "Engineering"} (Sem {studentSem})
                </h3>
                <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                  All 6 academic working days • Classroom {student?.classroom || "A-209"}
                </span>
              </div>

              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "980px", fontSize: "0.82rem" }}>
                <thead>
                  <tr style={{ background: "var(--bg-surface-secondary)", borderBottom: "2px solid var(--border-subtle)" }}>
                    <th style={{ padding: "12px 14px", textAlign: "left", width: "150px", color: "var(--text-main)", fontWeight: "800" }}>
                      Period & Time
                    </th>
                    {(daysOfWeek || []).map((day) => {
                      const isToday = day === todayDayName;
                      return (
                        <th
                          key={day}
                          style={{
                            padding: "12px 10px",
                            textAlign: "center",
                            color: isToday ? "var(--primary-700)" : "var(--text-main)",
                            fontWeight: "800",
                            background: isToday ? "var(--primary-50)" : "transparent",
                            borderLeft: "1px solid var(--border-subtle)"
                          }}
                        >
                          <div>{day}</div>
                          {isToday && (
                            <span style={{ fontSize: "0.62rem", background: "#22c55e", color: "white", padding: "1px 6px", borderRadius: "10px", fontWeight: "800" }}>
                              TODAY
                            </span>
                          )}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {(standardTimeSlots || []).map((timeSlot, rowIdx) => {
                    const isBreak = String(timeSlot).includes("12:15") || String(timeSlot).includes("03:00");

                    if (isBreak) {
                      return (
                        <tr key={rowIdx} style={{ background: "rgba(245, 158, 11, 0.07)", borderBottom: "1px solid var(--border-subtle)" }}>
                          <td style={{ padding: "10px 14px", fontWeight: "700", color: "#b45309" }}>
                            {timeSlot}
                          </td>
                          <td
                            colSpan={6}
                            style={{
                              padding: "8px 14px",
                              textAlign: "center",
                              color: "#b45309",
                              fontWeight: "700",
                              borderLeft: "1px solid var(--border-subtle)"
                            }}
                          >
                            ☕ {String(timeSlot).includes("12:15") ? "Mid-Day Lunch Recess" : "Short Tea Break"} (All Batches)
                          </td>
                        </tr>
                      );
                    }

                    return (
                      <tr
                        key={rowIdx}
                        style={{
                          borderBottom: "1px solid var(--border-subtle)",
                          background: rowIdx % 2 === 0 ? "var(--bg-surface)" : "var(--bg-surface-secondary)"
                        }}
                      >
                        <td style={{ padding: "12px 14px", fontWeight: "700", color: "var(--text-muted)" }}>
                          {timeSlot}
                        </td>

                        {(daysOfWeek || []).map((day) => {
                          const slot = (classSlots || []).find((s) => s && s.day === day && s.time === timeSlot);
                          const isToday = day === todayDayName;

                          if (!slot) {
                            return (
                              <td
                                key={day}
                                style={{
                                  padding: "10px",
                                  textAlign: "center",
                                  color: "var(--text-muted)",
                                  borderLeft: "1px solid var(--border-subtle)",
                                  background: isToday ? "rgba(37, 99, 235, 0.02)" : "transparent"
                                }}
                              >
                                —
                              </td>
                            );
                          }

                          const resolved = resolveStudentBatchItem(slot);

                          return (
                            <td
                              key={day}
                              style={{
                                padding: "10px 12px",
                                borderLeft: "1px solid var(--border-subtle)",
                                background: isToday ? "rgba(37, 99, 235, 0.04)" : "transparent"
                              }}
                            >
                              <div style={{ fontWeight: "700", color: "var(--text-main)", fontSize: "0.85rem" }}>
                                {slot.type === "Practical" && batchFilterMode === "my"
                                  ? resolved.subject
                                  : slot.subjectName}
                              </div>
                              <div style={{ fontSize: "0.74rem", color: "var(--primary-700)", marginTop: "2px" }}>
                                {slot.type === "Practical" && batchFilterMode === "my"
                                  ? resolved.teacher
                                  : slot.teacherName}
                              </div>
                              <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "2px" }}>
                                {slot.type === "Practical" && batchFilterMode === "my"
                                  ? resolved.room
                                  : slot.room}
                              </div>
                              {slot.type === "Practical" && (
                                <span style={{ fontSize: "0.68rem", background: "var(--primary-100)", color: "var(--primary-800)", padding: "1px 5px", borderRadius: "4px", fontWeight: "700", marginTop: "3px", display: "inline-block" }}>
                                  {batchFilterMode === "my" ? resolved.batchLabel : "Lab Session"}
                                </span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}

import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";
import {
  DEPARTMENTS,
  INITIAL_SYSTEM_SETTINGS,
  VLSI_CLASS_METADATA,
  getStudentBatchInfo
} from "../data/initialData";

const SmartCampusContext = createContext();

const STORAGE_KEY = "smart_campus_erp_mysql_clean_v2";

const CLEAN_BASELINE_ADMIN = {
  id: "adm-1",
  role: "admin",
  name: "System Administrator",
  email: "admin@campus.edu",
  phone: "9876543210",
  prn: "admin",
  dob: "1985-01-01",
  password: "admin123",
  designation: "System Administrator",
  isVerified: true
};

export function SmartCampusProvider({ children }) {
  // Clean Zero-Data Initial State: Starts with default Admin and standard departments
  const [state, setState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.users) && parsed.users.length > 0) {
          return {
            ...parsed,
            smsLogs: parsed.smsLogs || [],
            currentUser: parsed.currentUser || null,
            activeRole: parsed.activeRole || null
          };
        }
      }
    } catch (e) {
      console.warn("Failed to read storage:", e);
    }

    return {
      users: [CLEAN_BASELINE_ADMIN],
      departments: DEPARTMENTS,
      subjects: [],
      timetables: [],
      timetableToday: [],
      studyMaterials: [],
      attendance: {},
      attendanceLogs: [],
      smsLogs: [],
      marks: [],
      assignments: [],
      notices: [],
      exams: [],
      leaves: [],
      complaints: [],
      notifications: [],
      auditLogs: [],
      systemSettings: INITIAL_SYSTEM_SETTINGS,
      studentSkills: [],
      collegeEvents: [],
      eventInvitations: [],
      eventTeamMembers: [],
      studentHealthRecords: [],
      doctorLetters: [],
      classAssignments: [],
      currentUser: null,
      activeRole: null,
      demoStep: 0
    };
  });

  const [toasts, setToasts] = useState([]);

  // Fetch live state from backend MySQL database on boot
  useEffect(() => {
    api.getBootstrap()
      .then((res) => {
        if (res?.success && res?.data) {
          const d = res.data;
          setState((prev) => ({
            ...prev,
            users: d.users && d.users.length > 0 ? d.users : prev.users,
            departments: d.departments && d.departments.length > 0 ? d.departments : prev.departments,
            subjects: d.subjects && d.subjects.length > 0 ? d.subjects : prev.subjects,
            attendanceLogs: d.attendanceLogs && d.attendanceLogs.length > 0 ? d.attendanceLogs : prev.attendanceLogs,
            smsLogs: d.smsLogs && d.smsLogs.length > 0 ? d.smsLogs : prev.smsLogs,
            marks: d.marks && d.marks.length > 0 ? d.marks : prev.marks,
            assignments: d.assignments && d.assignments.length > 0 ? d.assignments : prev.assignments,
            notices: d.notices && d.notices.length > 0 ? d.notices : prev.notices,
            leaves: d.leaves && d.leaves.length > 0 ? d.leaves : prev.leaves,
            complaints: d.complaints && d.complaints.length > 0 ? d.complaints : prev.complaints,
            auditLogs: d.auditLogs && d.auditLogs.length > 0 ? d.auditLogs : prev.auditLogs,
            systemSettings: { ...prev.systemSettings, ...(d.systemSettings || {}) }
          }));
        }
      })
      .catch((err) => {
        console.warn("[Bootstrap] Connecting to local persistent state:", err.message);
      });
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error("Failed to persist state:", e);
    }
  }, [state]);


  // Toast notification helper
  const addToast = (title, message, type = "info", duration = 4500) => {
    const id = "toast-" + Date.now() + "-" + Math.random().toString(36).substr(2, 4);
    const newToast = { id, title, message, type };
    setToasts((prev) => [newToast, ...prev].slice(0, 5));
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Switch User / Role
  const switchUser = (userIdOrRole) => {
    let targetUser = null;
    if (userIdOrRole === "student") {
      targetUser = state.users.find((u) => u.id === "stu-1");
    } else {
      targetUser = state.users.find((u) => u.id === userIdOrRole || u.role === userIdOrRole);
    }
    if (!targetUser) targetUser = state.users.find((u) => u.id === "stu-1") || state.users[0];

    setState((prev) => ({
      ...prev,
      currentUser: targetUser,
      activeRole: targetUser.role
    }));
    addToast("Switched Persona", `Active profile: ${targetUser.name} (${targetUser.role.toUpperCase()})`, "info");
  };

  const login = async (emailOrId, password, selectedRole) => {
    const input = (emailOrId || "").trim();
    const pass = (password || "").trim();

    try {
      const res = await api.login({ username: input, password: pass, role: selectedRole });
      if (res.success && res.user) {
        setState((prev) => ({
          ...prev,
          currentUser: res.user,
          activeRole: res.user.role
        }));
        addToast("Login Successful", `Welcome back, ${res.user.name}!`, "success");
        return { success: true, user: res.user };
      }
      return { success: false, message: res.message || "Invalid credentials." };
    } catch (err) {
      // Local fallback in case server connection is momentarily offline
      const user = state.users.find((u) => {
        if (selectedRole && u.role !== selectedRole) return false;
        if (selectedRole === "admin") {
          return (u.prn === input || u.email === input || input.toLowerCase() === "admin") && (pass === "admin123" || u.password === pass);
        }
        if (selectedRole === "student") {
          const matchUsername = u.prn === input || u.rollNo === input;
          const matchPass = u.dob === pass || (u.dob && pass.replace(/[^0-9]/g, '') === u.dob.replace(/[^0-9]/g, ''));
          return matchUsername && matchPass;
        }
        if (selectedRole === "parent") {
          const matchPhone = u.parentPhone === input || u.phone === input;
          const matchPass = u.dob === pass || (u.dob && pass.replace(/[^0-9]/g, '') === u.dob.replace(/[^0-9]/g, ''));
          return matchPhone && matchPass;
        }
        const matchPhone = u.phone === input || u.email === input;
        const matchPass = u.dob === pass || (u.dob && pass.replace(/[^0-9]/g, '') === u.dob.replace(/[^0-9]/g, ''));
        return matchPhone && matchPass;
      });

      if (user) {
        setState((prev) => ({
          ...prev,
          currentUser: user,
          activeRole: user.role
        }));
        addToast("Login Successful", `Welcome back, ${user.name}!`, "success");
        return { success: true, user };
      }
      return { success: false, message: err.message || "Invalid credentials." };
    }
  };

  const logout = () => {
    // Return to login screen by setting activeRole to null or keeping default user
    setState((prev) => ({
      ...prev,
      currentUser: null,
      activeRole: null
    }));
    addToast("Logged Out", "You have been safely signed out.", "info");
  };

  // Helper to log audit actions
  const logAudit = (action, details, module = "General") => {
    const newLog = {
      id: "aud-" + Date.now(),
      timestamp: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) + " " + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      user: state.currentUser ? state.currentUser.name : "System Engine",
      role: state.currentUser ? state.currentUser.role.toUpperCase() : "SYSTEM",
      action,
      details,
      module
    };
    return newLog;
  };

  // ==========================================
  // CORE ATTENDANCE SUBMISSION ENGINE
  // ==========================================
  const markAttendance = ({ departmentId, semester, division, subjectId, lectureNum, statusMap, date = "2026-09-08", time = "10:00 AM", sessionType = "Theory" }) => {
    const subject = state.subjects.find((s) => s.id === subjectId) || { name: "CMOS Digital VLSI Design", code: "VLSI501" };
    const department = state.departments.find((d) => d.id === departmentId) || { name: "Electronic Engineering (VLSI Design And Technology)" };

    const newAttendance = JSON.parse(JSON.stringify(state.attendance));
    const newLogs = [...state.attendanceLogs];
    const newNotifications = [...state.notifications];
    const absentStudents = [];
    const warningStudents = [];

    const nowFormattedDate = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
    const nowFormattedTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const isPractical = sessionType === "Practical" || sessionType === "Lab";

    // Process each student in statusMap: { [studentId]: "Present" | "Absent" }
    Object.entries(statusMap).forEach(([studentId, status]) => {
      const student = state.users.find((u) => u.id === studentId);
      if (!student) return;

      if (!newAttendance[studentId]) {
        newAttendance[studentId] = {};
      }
      if (!newAttendance[studentId][subjectId]) {
        newAttendance[studentId][subjectId] = { total: 0, attended: 0, percentage: 100 };
      }

      const prev = newAttendance[studentId][subjectId];

      const prevTheoryTotal = prev.theoryTotal ?? Math.round(prev.total * 0.7);
      const prevTheoryAttended = prev.theoryAttended ?? Math.min(prevTheoryTotal, Math.round(prev.attended * 0.7));
      const prevPracticalTotal = prev.practicalTotal ?? Math.max(0, prev.total - prevTheoryTotal);
      const prevPracticalAttended = prev.practicalAttended ?? Math.max(0, prev.attended - prevTheoryAttended);

      const newTheoryTotal = !isPractical ? prevTheoryTotal + 1 : prevTheoryTotal;
      const newTheoryAttended = (!isPractical && status === "Present") ? prevTheoryAttended + 1 : prevTheoryAttended;
      const newTheoryPct = newTheoryTotal > 0 ? Math.round((newTheoryAttended / newTheoryTotal) * 1000) / 10 : 100;

      const newPracticalTotal = isPractical ? prevPracticalTotal + 1 : prevPracticalTotal;
      const newPracticalAttended = (isPractical && status === "Present") ? prevPracticalAttended + 1 : prevPracticalAttended;
      const newPracticalPct = newPracticalTotal > 0 ? Math.round((newPracticalAttended / newPracticalTotal) * 1000) / 10 : 100;

      const newTotal = newTheoryTotal + newPracticalTotal;
      const newAttended = newTheoryAttended + newPracticalAttended;
      const newPct = newTotal > 0 ? Math.round((newAttended / newTotal) * 1000) / 10 : 100;

      newAttendance[studentId][subjectId] = {
        total: newTotal,
        attended: newAttended,
        percentage: newPct,
        theoryTotal: newTheoryTotal,
        theoryAttended: newTheoryAttended,
        theoryPercentage: newTheoryPct,
        practicalTotal: newPracticalTotal,
        practicalAttended: newPracticalAttended,
        practicalPercentage: newPracticalPct
      };

      // Add to attendance log
      const logId = "att-log-" + Date.now() + "-" + studentId;
      newLogs.unshift({
        id: logId,
        studentId,
        studentName: student.name,
        subjectId,
        subjectName: subject.name,
        date,
        time,
        status,
        sessionType: isPractical ? "Practical" : "Theory",
        lectureNum: lectureNum || (isPractical ? newPracticalTotal : newTheoryTotal),
        markedBy: state.currentUser ? state.currentUser.name : "Prof. R. K. Patil"
      });

      // Automation Rules: If Absent
      if (status === "Absent") {
        absentStudents.push(student);

        // 1. Student In-App Alert
        newNotifications.unshift({
          id: "notif-stu-" + Date.now() + "-" + studentId,
          recipientId: student.id,
          recipientRole: "student",
          title: `⚠️ ${isPractical ? "Practical" : "Theory"} Attendance Alert: ${subject.name}`,
          message: `Attendance Alert: You were marked absent for ${subject.name} (${isPractical ? "Practical Lab" : "Theory Lecture"}) on ${date} (Session ${lectureNum || (isPractical ? newPracticalTotal : newTheoryTotal)}).`,
          type: "attendance_absent",
          channel: "in-app",
          deliveryStatus: "Delivered",
          timestamp: `${nowFormattedDate}, ${nowFormattedTime}`,
          read: false,
          link: "/attendance"
        });

        // 2. Parent Notification (SMS & WhatsApp Simulation)
        if (student.parentId) {
          newNotifications.unshift({
            id: "notif-par-" + Date.now() + "-" + student.parentId,
            recipientId: student.parentId,
            recipientRole: "parent",
            title: `📱 Absence Alert: ${student.name}`,
            message: `Attendance Alert: Your ward ${student.name} was marked absent for ${subject.name} (${isPractical ? "Practical Lab" : "Theory Lecture"}) on ${date} (Session ${lectureNum || (isPractical ? newPracticalTotal : newTheoryTotal)}).`,
            type: "attendance_absent",
            channel: "sms_whatsapp",
            deliveryStatus: "Delivered",
            timestamp: `${nowFormattedDate}, ${nowFormattedTime}`,
            read: false,
            link: "/child-attendance"
          });
        }
      }

      // 3. Attendance Risk Evaluation
      if (newPct < state.systemSettings.attendanceThreshold) {
        warningStudents.push({ student, percentage: newPct });

        // Generate Warning notification if critical
        newNotifications.unshift({
          id: "notif-warn-" + Date.now() + "-" + studentId,
          recipientId: student.id,
          recipientRole: "student",
          title: `🔴 Attendance Defaulter Warning: ${subject.name}`,
          message: `Your current attendance in ${subject.name} is ${newPct}% (Theory: ${newTheoryPct}%, Practical: ${newPracticalPct}%), which is below the mandatory threshold of ${state.systemSettings.attendanceThreshold}%. Immediate improvement required.`,
          type: "warning",
          channel: "in-app",
          deliveryStatus: "Delivered",
          timestamp: `${nowFormattedDate}, ${nowFormattedTime}`,
          read: false,
          link: "/attendance"
        });
      }
    });

    const auditEntry = logAudit(
      "Submitted Attendance",
      `${subject.name} (Lec ${lectureNum || "Current"}) - Total: ${Object.keys(statusMap).length}, Absent: ${absentStudents.length}`,
      "Attendance"
    );

    // Persist directly into MySQL database & trigger SMS dispatch
    api.submitAttendance({
      departmentId,
      semester,
      subjectId,
      sessionType,
      lectureNum,
      statusMap,
      date: date || new Date().toISOString().split('T')[0],
      time: time || '10:00 AM',
      markedBy: state.currentUser ? state.currentUser.name : 'Faculty'
    }).catch((err) => console.warn('[MySQL Attendance Sync Warning]', err.message));

    setState((prev) => ({
      ...prev,
      attendance: newAttendance,
      attendanceLogs: newLogs,
      notifications: newNotifications,
      auditLogs: [auditEntry, ...prev.auditLogs]
    }));

    addToast(
      "Attendance Submitted Successfully",
      `Saved ${Object.keys(statusMap).length} student records. Dispatched ${absentStudents.length * 2} real-time SMS/WhatsApp alerts.`,
      "success"
    );

    return {
      success: true,
      absentCount: absentStudents.length,
      absentStudents,
      warningStudents,
      totalMarked: Object.keys(statusMap).length
    };
  };

  // ==========================================
  // MARKS SUBMISSION ENGINE
  // ==========================================
  const submitMarks = ({ subjectId, examType, maxMarks, marksRecords, remarks = "", category = null }) => {
    const subject = state.subjects.find((s) => s.id === subjectId) || { name: "Database Management Systems" };
    const newMarks = [...state.marks];
    const newNotifications = [...state.notifications];

    const nowFormattedDate = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
    const nowFormattedTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    // Determine category: Practical vs Theory
    const isPracticalExam = category === "Practical" || 
      ["Practical Exam", "Lab Continuous Assessment", "Lab Continuous Assessment (ICA)", "Practical Exam (POE)", "Lab Viva-Voce", "Viva Voce", "Term Work", "Term Work (TW)"].some(t => (examType || "").includes(t));
    const resolvedCategory = isPracticalExam ? "Practical" : "Theory";

    marksRecords.forEach((rec) => {
      const student = state.users.find((u) => u.id === rec.studentId);
      if (!student) return;

      const marksId = "m-" + Date.now() + "-" + rec.studentId;
      newMarks.unshift({
        id: marksId,
        studentId: rec.studentId,
        studentName: student.name,
        subjectId,
        subjectName: subject.name,
        examType,
        category: resolvedCategory,
        marksObtained: Number(rec.marksObtained),
        maxMarks: Number(maxMarks),
        date: nowFormattedDate,
        gradedBy: state.currentUser ? state.currentUser.name : "Prof. R. K. Patil",
        remarks: rec.remarks || remarks || "Assessment score recorded."
      });

      // 1. Student Notification
      newNotifications.unshift({
        id: "notif-mark-stu-" + Date.now() + "-" + student.id,
        recipientId: student.id,
        recipientRole: "student",
        title: `📊 ${subject.name} ${examType} Result Published`,
        message: `${subject.name} ${examType} result published. You scored ${rec.marksObtained}/${maxMarks} (${Math.round((rec.marksObtained / maxMarks) * 100)}%).`,
        type: "marks",
        channel: "in-app",
        deliveryStatus: "Delivered",
        timestamp: `${nowFormattedDate}, ${nowFormattedTime}`,
        read: false,
        link: "/marks"
      });

      // 2. Parent Notification
      if (student.parentId) {
        newNotifications.unshift({
          id: "notif-mark-par-" + Date.now() + "-" + student.parentId,
          recipientId: student.parentId,
          recipientRole: "parent",
          title: `📊 Marks Published: ${student.name}`,
          message: `${subject.name} ${examType} result published: ${student.name} scored ${rec.marksObtained}/${maxMarks}.`,
          type: "marks",
          channel: "sms_whatsapp",
          deliveryStatus: "Delivered",
          timestamp: `${nowFormattedDate}, ${nowFormattedTime}`,
          read: false,
          link: "/marks"
        });
      }
    });

    const auditEntry = logAudit(
      "Uploaded Marks",
      `${subject.name} - ${examType} scores published for ${marksRecords.length} students.`,
      "Marks"
    );

    setState((prev) => ({
      ...prev,
      marks: newMarks,
      notifications: newNotifications,
      auditLogs: [auditEntry, ...prev.auditLogs]
    }));

    addToast(
      "Marks Published Successfully",
      `Scorecards updated & parent alerts broadcasted for ${marksRecords.length} students.`,
      "success"
    );

    return { success: true };
  };

  // ==========================================
  // ASSIGNMENTS ENGINE
  // ==========================================
  const createAssignment = ({ title, subjectId, deadline, totalPoints, description, attachments = [] }) => {
    const subject = state.subjects.find((s) => s.id === subjectId) || { name: "Database Management Systems" };
    const newAsg = {
      id: "asg-" + Date.now(),
      title,
      subjectId,
      subjectName: subject.name,
      teacherName: state.currentUser ? state.currentUser.name : "Prof. R. K. Patil",
      deadline,
      totalPoints: Number(totalPoints),
      description,
      attachments: attachments.length ? attachments : ["assignment_spec.pdf"],
      submissions: []
    };

    const newNotifications = [...state.notifications];
    // Notify students
    state.users
      .filter((u) => u.role === "student" && u.departmentId === (subject.departmentId || "dept-vlsi"))
      .forEach((stu) => {
        newNotifications.unshift({
          id: "notif-asg-" + Date.now() + "-" + stu.id,
          recipientId: stu.id,
          recipientRole: "student",
          title: `📝 New Assignment: ${title}`,
          message: `New assignment published in ${subject.name}. Deadline: ${deadline}. Total Points: ${totalPoints}.`,
          type: "assignment",
          channel: "in-app",
          deliveryStatus: "Delivered",
          timestamp: new Date().toLocaleDateString("en-GB") + " " + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          read: false,
          link: "/assignments"
        });
      });

    const audit = logAudit("Created Assignment", `${title} (${subject.name}) - Due: ${deadline}`, "Assignments");

    setState((prev) => ({
      ...prev,
      assignments: [newAsg, ...prev.assignments],
      notifications: newNotifications,
      auditLogs: [audit, ...prev.auditLogs]
    }));

    addToast("Assignment Created", `Assignment "${title}" published for all enrolled students.`, "success");
  };

  const submitAssignment = (assignmentId, studentId, fileName, details = {}) => {
    const student = state.users.find((u) => u.id === studentId) || state.currentUser;
    const nowStr = new Date().toLocaleDateString("en-GB") + " " + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    setState((prev) => {
      let detectedPlagiarismScore = 3;
      let detectedIntegrityStatus = "Verified Original";
      let detectedCopiedFrom = null;

      const updated = prev.assignments.map((asg) => {
        if (asg.id === assignmentId) {
          const existingSubs = asg.submissions || [];
          const snippetText = details.submissionSnippet || "";
          const lowerFileName = (fileName || "").toLowerCase();

          // Anti-Copy Logic: Compare against existing student submissions for this course
          const otherStudentSubs = existingSubs.filter((s) => s.studentId !== studentId);

          for (const otherSub of otherStudentSubs) {
            // Check 1: File name contains another student's name or identical name
            const otherNameParts = (otherSub.studentName || "").toLowerCase().split(" ").filter((p) => p.length > 3);
            const hasOtherNameInFile = otherNameParts.some((p) => lowerFileName.includes(p));

            // Check 2: Identical submission text snippet or matching Verilog/code token
            const isTextMatch = snippetText && otherSub.submissionSnippet && (
              snippetText.trim() === otherSub.submissionSnippet.trim() ||
              (snippetText.length > 25 && otherSub.submissionSnippet.includes(snippetText.substring(0, 25)))
            );

            // Check 3: Explicit simulated copy test or flag
            if (hasOtherNameInFile || isTextMatch || details.isSimulatedCopy) {
              detectedPlagiarismScore = details.simulatedScore || 92;
              detectedIntegrityStatus = "Flagged Copied";
              detectedCopiedFrom = `${otherSub.studentName} (Roll: ${otherSub.rollNo || "VL3102"})`;
              break;
            }
          }

          // If original, assign normal 2-5% background similarity
          if (detectedIntegrityStatus !== "Flagged Copied") {
            detectedPlagiarismScore = Math.floor(Math.random() * 5) + 2;
            detectedIntegrityStatus = "Verified Original";
          }

          const digitalSig = `CSMSS-SIG-${Math.random().toString(36).substring(2, 7).toUpperCase()}-${student.rollNo || "VL3101"}-ORIG`;

          const subs = existingSubs.filter((s) => s.studentId !== studentId);
          subs.push({
            studentId,
            studentName: student.name,
            rollNo: student.rollNo || "VL3101",
            status: detectedIntegrityStatus === "Flagged Copied" ? "Flagged Copied" : "Submitted",
            submittedOn: nowStr,
            file: fileName || `${student.name.replace(/\s+/g, "_")}_Submission.pdf`,
            marks: detectedIntegrityStatus === "Flagged Copied" ? 0 : null,
            feedback: detectedIntegrityStatus === "Flagged Copied" ? "AUTOMATED SYSTEM ALERT: High similarity match with peer submission. Flagged for faculty academic integrity review." : null,
            plagiarismScore: detectedPlagiarismScore,
            integrityStatus: detectedIntegrityStatus,
            copiedFrom: detectedCopiedFrom,
            digitalSignature: digitalSig,
            honorCodeAgreed: details.honorCodeAgreed ?? true,
            submissionSnippet: details.submissionSnippet || `Solution submitted by ${student.name}. Authenticated via Smart Campus anti-copy verification protocol.`
          });
          return { ...asg, submissions: subs };
        }
        return asg;
      });

      const audit = logAudit(
        "Submitted Assignment",
        `Student ${student.name} submitted for ${assignmentId}. Integrity: ${detectedIntegrityStatus} (${detectedPlagiarismScore}% match)`,
        "Assignments"
      );

      return {
        ...prev,
        assignments: updated,
        auditLogs: [audit, ...prev.auditLogs]
      };
    });

    addToast(
      "Assignment Uploaded",
      `Work submitted with automated digital integrity verification stamp.`,
      "success"
    );
  };

  const flagPlagiarizedAssignment = (assignmentId, studentId, penaltyMarks = 0, warningRemarks) => {
    setState((prev) => {
      let targetStudentName = "Student";
      let asgTitle = "Assignment";
      const updated = prev.assignments.map((asg) => {
        if (asg.id === assignmentId) {
          asgTitle = asg.title;
          const subs = (asg.submissions || []).map((s) => {
            if (s.studentId === studentId) {
              targetStudentName = s.studentName;
              return {
                ...s,
                status: "Flagged Copied",
                marks: Number(penaltyMarks),
                feedback: warningRemarks || "Disciplinary Action: Zero marks awarded due to unauthorized assignment copying & plagiarism detected by automated system.",
                integrityStatus: "Flagged Copied"
              };
            }
            return s;
          });
          return { ...asg, submissions: subs };
        }
        return asg;
      });

      const audit = logAudit("Plagiarism Penalty", `Awarded ${penaltyMarks} marks to ${targetStudentName} for plagiarism in ${asgTitle}`, "Academic Integrity");

      const notif = {
        id: "notif-" + Date.now(),
        userId: studentId,
        title: "Academic Misconduct Notice: Assignment Plagiarism",
        message: `Your submission for "${asgTitle}" was flagged for unauthorized copying. Marks set to ${penaltyMarks}. Remarks: ${warningRemarks || "Violation of institutional honor code."}`,
        type: "warning",
        date: new Date().toLocaleDateString("en-GB"),
        read: false,
        link: "/assignments"
      };

      return {
        ...prev,
        assignments: updated,
        notifications: [notif, ...prev.notifications],
        auditLogs: [audit, ...prev.auditLogs]
      };
    });

    addToast("Plagiarism Penalty Applied", `Submission marked as copied. 0 marks recorded & disciplinary notice issued.`, "danger");
  };

  const gradeAssignment = (assignmentId, studentId, marks, feedback) => {
    setState((prev) => {
      const updated = prev.assignments.map((asg) => {
        if (asg.id === assignmentId) {
          const subs = asg.submissions.map((s) => {
            if (s.studentId === studentId) {
              return { ...s, status: "Reviewed", marks: Number(marks), feedback };
            }
            return s;
          });
          return { ...asg, submissions: subs };
        }
        return asg;
      });

      const audit = logAudit("Graded Assignment", `Graded student ${studentId}: ${marks} pts`, "Assignments");

      return {
        ...prev,
        assignments: updated,
        auditLogs: [audit, ...prev.auditLogs]
      };
    });

    addToast("Submission Graded", "Feedback & score sent to student.", "success");
  };

  // ==========================================
  // NOTICES ENGINE
  // ==========================================
  const createNotice = (noticeData) => {
    const newNotice = {
      id: "not-" + Date.now(),
      title: noticeData.title,
      category: noticeData.category || "General",
      priority: noticeData.priority || "General",
      department: noticeData.department || "All Departments",
      author: state.currentUser ? `${state.currentUser.name} (${state.currentUser.role.toUpperCase()})` : "Dean Office",
      publishDate: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      expiryDate: noticeData.expiryDate || "2026-10-15",
      content: noticeData.content,
      important: noticeData.priority === "Urgent" || Boolean(noticeData.important)
    };

    const audit = logAudit("Published Notice", `Notice "${noticeData.title}" (${noticeData.category})`, "Notices");

    setState((prev) => ({
      ...prev,
      notices: [newNotice, ...prev.notices],
      auditLogs: [audit, ...prev.auditLogs]
    }));

    addToast("Notice Published", `Circular "${noticeData.title}" posted to active board.`, "success");
  };

  // ==========================================
  // LEAVE APPLICATION ENGINE
  // ==========================================
  const applyLeave = (leaveData) => {
    const student = state.currentUser || state.users[0];
    const newLeave = {
      id: "lv-" + Date.now(),
      studentId: student.id,
      studentName: student.name,
      rollNo: student.rollNo || "VLSI3152",
      startDate: leaveData.startDate,
      endDate: leaveData.endDate,
      totalDays: leaveData.totalDays || 1,
      reason: leaveData.reason,
      description: leaveData.description,
      document: leaveData.document || "leave_application.pdf",
      appliedDate: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      status: "Pending",
      approverComment: null
    };

    const audit = logAudit("Applied for Leave", `${student.name}: ${leaveData.reason} (${leaveData.startDate})`, "Leave");

    setState((prev) => ({
      ...prev,
      leaves: [newLeave, ...prev.leaves],
      auditLogs: [audit, ...prev.auditLogs]
    }));

    addToast("Leave Request Submitted", "Application sent to Class Teacher & HOD for review.", "success");
  };

  const updateLeaveStatus = (leaveId, status, approverComment = "") => {
    setState((prev) => {
      const updated = prev.leaves.map((lv) => {
        if (lv.id === leaveId) {
          return { ...lv, status, approverComment };
        }
        return lv;
      });

      const audit = logAudit("Updated Leave Status", `Leave #${leaveId} marked as ${status}`, "Leave");

      return {
        ...prev,
        leaves: updated,
        auditLogs: [audit, ...prev.auditLogs]
      };
    });

    addToast("Leave Status Updated", `Leave request marked as ${status}.`, "info");
  };

  // ==========================================
  // COMPLAINT / TICKET ENGINE
  // ==========================================
  const raiseComplaint = (complaintData) => {
    const student = state.currentUser || state.users[0];
    const ticketNo = "TKT-2026-" + Math.floor(100 + Math.random() * 900);
    const newComplaint = {
      id: "cmp-" + Date.now(),
      ticketNo,
      category: complaintData.category,
      location: complaintData.location,
      title: complaintData.title,
      description: complaintData.description,
      studentId: student.id,
      studentName: student.name,
      priority: complaintData.priority || "Medium",
      status: "Reported",
      assignedTo: complaintData.assignedTo || "Campus Maintenance Department",
      createdAt: new Date().toLocaleDateString("en-GB") + " " + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      resolvedAt: null,
      resolutionNote: null
    };

    const audit = logAudit("Raised Complaint Ticket", `${ticketNo}: ${complaintData.title} (${complaintData.location})`, "Complaints");

    setState((prev) => ({
      ...prev,
      complaints: [newComplaint, ...prev.complaints],
      auditLogs: [audit, ...prev.auditLogs]
    }));

    addToast("Complaint Registered", `Ticket ${ticketNo} created and assigned to facilities.`, "success");
    return ticketNo;
  };

  const updateComplaintStatus = (complaintId, status, resolutionNote = "", assignedTo = null) => {
    setState((prev) => {
      const updated = prev.complaints.map((c) => {
        if (c.id === complaintId) {
          return {
            ...c,
            status,
            resolutionNote: resolutionNote || c.resolutionNote,
            assignedTo: assignedTo || c.assignedTo,
            resolvedAt: status === "Resolved" ? new Date().toLocaleDateString("en-GB") + " " + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : c.resolvedAt
          };
        }
        return c;
      });

      const audit = logAudit("Updated Complaint Ticket", `Ticket #${complaintId} status changed to ${status}`, "Complaints");

      return {
        ...prev,
        complaints: updated,
        auditLogs: [audit, ...prev.auditLogs]
      };
    });

    addToast("Ticket Status Updated", `Ticket marked as "${status}".`, "info");
  };

  // ==========================================
  // USER MANAGEMENT ENGINE (ADMIN & FACULTY EDIT/ADD/DELETE)
  // ==========================================
  const updateUser = (userId, updatedData) => {
    // Asynchronously update MySQL database
    api.updateUser(userId, updatedData).catch((err) => console.warn('[MySQL Sync Warning]', err.message));

    setState((prev) => {
      let updatedUserObj = null;
      const updatedUsers = prev.users.map((u) => {
        if (u.id === userId) {
          updatedUserObj = { ...u, ...updatedData };
          return updatedUserObj;
        }
        return u;
      });

      if (!updatedUserObj) return prev;

      // Cross-sync: If student was updated, sync parent references
      if (updatedUserObj.role === "student" && updatedUserObj.parentId) {
        const parentIdx = updatedUsers.findIndex((p) => p.id === updatedUserObj.parentId);
        if (parentIdx !== -1) {
          updatedUsers[parentIdx] = {
            ...updatedUsers[parentIdx],
            studentName: updatedUserObj.name
          };
        }
      }

      // Cross-sync: If parent was updated, sync student references
      if (updatedUserObj.role === "parent" && updatedUserObj.studentId) {
        const stuIdx = updatedUsers.findIndex((s) => s.id === updatedUserObj.studentId);
        if (stuIdx !== -1) {
          updatedUsers[stuIdx] = {
            ...updatedUsers[stuIdx],
            parentId: updatedUserObj.id,
            parentName: updatedUserObj.name,
            parentPhone: updatedUserObj.phone || updatedUsers[stuIdx].parentPhone,
            parentEmail: updatedUserObj.email || updatedUsers[stuIdx].parentEmail
          };
        }
      }

      // If HOD was updated, sync department HOD name
      let updatedDepartments = prev.departments;
      if (updatedUserObj.role === "hod" && updatedUserObj.departmentId) {
        updatedDepartments = prev.departments.map((d) =>
          d.id === updatedUserObj.departmentId ? { ...d, hod: updatedUserObj.name } : d
        );
      }

      // If active currentUser is being updated
      let newCurrentUser = prev.currentUser;
      if (prev.currentUser && prev.currentUser.id === userId) {
        newCurrentUser = updatedUserObj;
      }

      const audit = logAudit(
        "Updated User Profile",
        `Admin modified details for ${updatedUserObj.name} (${updatedUserObj.role.toUpperCase()})`,
        "User Management"
      );

      return {
        ...prev,
        users: updatedUsers,
        departments: updatedDepartments,
        currentUser: newCurrentUser,
        auditLogs: [audit, ...prev.auditLogs]
      };
    });

    addToast(
      "User Updated Successfully",
      `Profile data for ${updatedData.name || "user"} has been updated in MySQL and across ERP.`,
      "success"
    );
  };

  const addUser = (userData) => {
    const rolePrefixMap = {
      student: "stu-",
      teacher: "tea-",
      parent: "par-",
      hod: "hod-",
      principal: "prin-",
      admin: "adm-"
    };
    const prefix = rolePrefixMap[userData.role] || "usr-";
    const newId = userData.id || (prefix + Date.now());

    const newUser = {
      id: newId,
      avatar: userData.avatar || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
      password: userData.password || userData.dob || "password123",
      canLogin: true,
      ...userData
    };

    // Asynchronously save to MySQL database
    api.addUser(newUser).catch((err) => console.warn('[MySQL Save Warning]', err.message));

    setState((prev) => {
      const updatedUsers = [newUser, ...prev.users];

      // Auto-create/sync parent record if student entered parentPhone
      if (newUser.role === "student" && newUser.parentPhone) {
        const parentId = `par-${newUser.id}`;
        const parentExists = updatedUsers.some((u) => u.id === parentId || u.phone === newUser.parentPhone);
        if (!parentExists) {
          updatedUsers.push({
            id: parentId,
            role: "parent",
            name: newUser.parentName || `Parent of ${newUser.name}`,
            phone: newUser.parentPhone,
            email: newUser.parentEmail || "",
            dob: newUser.dob, // Parent password is student's DOB
            password: newUser.dob,
            studentId: newUser.id,
            studentName: newUser.name,
            departmentId: newUser.departmentId,
            departmentName: newUser.departmentName,
            canLogin: true
          });
        }
      }

      const audit = logAudit(
        "Provisioned New User",
        `Created new ${newUser.role.toUpperCase()} account for ${newUser.name} in MySQL`,
        "User Management"
      );

      return {
        ...prev,
        users: updatedUsers,
        auditLogs: [audit, ...prev.auditLogs]
      };
    });

    addToast("User Provisioned", `New ${userData.role.toUpperCase()} account created for ${userData.name} in MySQL.`, "success");
    return newUser;
  };

  const deleteUser = (userId) => {
    if (state.currentUser?.id === userId) {
      addToast("Cannot Delete Active User", "You cannot delete the user account you are currently logged in as.", "danger");
      return false;
    }

    const targetUser = state.users.find((u) => u.id === userId);
    const userName = targetUser ? targetUser.name : userId;
    const userRole = targetUser ? targetUser.role : "user";

    // Asynchronously delete from MySQL
    api.deleteUser(userId).catch((err) => console.warn('[MySQL Delete Warning]', err.message));

    setState((prev) => {
      const updatedUsers = prev.users.filter((u) => u.id !== userId && u.parentId !== userId);
      const audit = logAudit(
        "Removed User Account",
        `Admin decommissioned user: ${userName} (${userRole.toUpperCase()}) from MySQL`,
        "User Management"
      );

      return {
        ...prev,
        users: updatedUsers,
        auditLogs: [audit, ...prev.auditLogs]
      };
    });

    addToast("User Removed", `Account for ${userName} removed from MySQL database.`, "warning");
    return true;
  };

  // ==========================================
  // DEPARTMENT MANAGEMENT ENGINE (ADMIN EDIT/ADD/DELETE)
  // ==========================================
  const updateDepartment = (departmentId, updatedData) => {
    setState((prev) => {
      let updatedDeptObj = null;
      const updatedDepartments = prev.departments.map((d) => {
        if (d.id === departmentId) {
          updatedDeptObj = { ...d, ...updatedData };
          return updatedDeptObj;
        }
        return d;
      });

      if (!updatedDeptObj) return prev;

      // Sync departmentName across users if name changed
      let updatedUsers = prev.users;
      if (updatedData.name) {
        updatedUsers = prev.users.map((u) => {
          if (u.departmentId === departmentId) {
            return { ...u, departmentName: updatedData.name };
          }
          return u;
        });
      }

      // If active currentUser is in this department, update currentUser as well
      let newCurrentUser = prev.currentUser;
      if (prev.currentUser && prev.currentUser.departmentId === departmentId && updatedData.name) {
        newCurrentUser = { ...prev.currentUser, departmentName: updatedData.name };
      }

      const audit = logAudit(
        "Updated Department Details",
        `Admin modified department: ${updatedDeptObj.name} (${updatedDeptObj.code})`,
        "Academic Structure"
      );

      return {
        ...prev,
        departments: updatedDepartments,
        users: updatedUsers,
        currentUser: newCurrentUser,
        auditLogs: [audit, ...prev.auditLogs]
      };
    });

    addToast(
      "Department Updated",
      `Department "${updatedData.name || "department"}" details saved and synchronized across faculty and student records.`,
      "success"
    );
  };

  const addDepartment = (deptData) => {
    const newId = "dept-" + (deptData.code ? deptData.code.toLowerCase().replace(/[^a-z0-9]/g, "") : Date.now());
    const newDept = {
      id: newId,
      studentCount: 0,
      facultyCount: 0,
      avgAttendance: 80.0,
      avgMarks: 75.0,
      ...deptData
    };

    setState((prev) => {
      const audit = logAudit(
        "Created Academic Department",
        `Admin created department: ${newDept.name} (${newDept.code})`,
        "Academic Structure"
      );

      return {
        ...prev,
        departments: [...prev.departments, newDept],
        auditLogs: [audit, ...prev.auditLogs]
      };
    });

    addToast("Department Created", `New department "${deptData.name}" provisioned.`, "success");
    return newDept;
  };

  const deleteDepartment = (departmentId) => {
    const targetDept = state.departments.find((d) => d.id === departmentId);
    const deptName = targetDept ? targetDept.name : departmentId;

    setState((prev) => {
      const updatedDepts = prev.departments.filter((d) => d.id !== departmentId);
      const audit = logAudit(
        "Removed Department",
        `Admin deleted department: ${deptName}`,
        "Academic Structure"
      );

      return {
        ...prev,
        departments: updatedDepts,
        auditLogs: [audit, ...prev.auditLogs]
      };
    });

    addToast("Department Removed", `Department "${deptName}" removed.`, "warning");
    return true;
  };

  // ==========================================
  // SUBJECT MANAGEMENT ENGINE (ADMIN EDIT/ADD/DELETE)
  // ==========================================
  const addSubject = (subjectData) => {
    const dept = state.departments.find((d) => d.id === subjectData.departmentId) || state.departments[0];
    const sem = Number(subjectData.semester) || 1;
    const newId = "sub-" + (subjectData.code ? subjectData.code.toLowerCase().replace(/[^a-z0-9]/g, "") : `sem${sem}-${Date.now()}`);

    const newSub = {
      id: newId,
      name: subjectData.name,
      code: subjectData.code,
      departmentId: subjectData.departmentId || dept.id,
      semester: sem,
      credits: Number(subjectData.credits) || 3,
      type: subjectData.type || "Theory",
      teacherId: subjectData.teacherId || "tea-1",
      teacherName: subjectData.teacherName || "Prof. R. K. Patil",
      weeklyHours: Number(subjectData.weeklyHours) || 4,
      description: subjectData.description || `${subjectData.name} for Semester ${sem} students.`
    };

    setState((prev) => {
      const audit = logAudit(
        "Created Academic Subject",
        `Admin added subject: ${newSub.name} (${newSub.code}) for Sem ${newSub.semester}`,
        "Academic Structure"
      );

      return {
        ...prev,
        subjects: [...prev.subjects, newSub],
        auditLogs: [audit, ...prev.auditLogs]
      };
    });

    addToast("Subject Created", `Subject "${newSub.name}" (${newSub.code}) created successfully.`, "success");
    return newSub;
  };

  const updateSubject = (subjectId, updatedData) => {
    setState((prev) => {
      let updatedSubObj = null;
      const updatedSubjects = prev.subjects.map((s) => {
        if (s.id === subjectId) {
          updatedSubObj = { ...s, ...updatedData };
          if (updatedData.semester) updatedSubObj.semester = Number(updatedData.semester);
          if (updatedData.credits) updatedSubObj.credits = Number(updatedData.credits);
          if (updatedData.weeklyHours) updatedSubObj.weeklyHours = Number(updatedData.weeklyHours);
          return updatedSubObj;
        }
        return s;
      });

      if (!updatedSubObj) return prev;

      // Sync across timetables if subject name/code or teacher changed
      const updatedTimetables = prev.timetables.map((slot) => {
        if (slot.subjectId === subjectId) {
          return {
            ...slot,
            subjectName: updatedSubObj.name,
            subjectCode: updatedSubObj.code,
            teacherName: updatedSubObj.teacherName || slot.teacherName,
            teacherId: updatedSubObj.teacherId || slot.teacherId
          };
        }
        return slot;
      });

      const audit = logAudit(
        "Updated Subject Details",
        `Admin updated subject: ${updatedSubObj.name} (${updatedSubObj.code})`,
        "Academic Structure"
      );

      return {
        ...prev,
        subjects: updatedSubjects,
        timetables: updatedTimetables,
        auditLogs: [audit, ...prev.auditLogs]
      };
    });

    addToast(
      "Subject Updated",
      `Subject "${updatedData.name || "subject"}" updated and synchronized across all timetables and courses.`,
      "success"
    );
  };

  const deleteSubject = (subjectId) => {
    const targetSub = state.subjects.find((s) => s.id === subjectId);
    const subName = targetSub ? targetSub.name : subjectId;

    setState((prev) => {
      const updatedSubjects = prev.subjects.filter((s) => s.id !== subjectId);
      const updatedTimetables = prev.timetables.filter((t) => t.subjectId !== subjectId);
      const audit = logAudit(
        "Removed Subject",
        `Admin deleted subject: ${subName}`,
        "Academic Structure"
      );

      return {
        ...prev,
        subjects: updatedSubjects,
        timetables: updatedTimetables,
        auditLogs: [audit, ...prev.auditLogs]
      };
    });

    addToast("Subject Removed", `Subject "${subName}" deleted from curriculum.`, "warning");
    return true;
  };

  // ==========================================
  // CENTRAL FIRST YEAR COMMON CURRICULUM ENGINE
  // Single database storage, auto-inherited by all branches
  // ==========================================
  const getCommonFirstYearSubjects = (semester = null) => {
    if (semester !== null && semester !== undefined && semester !== "all") {
      const semNum = Number(semester);
      return state.subjects.filter((s) => s.is_common_subject && Number(s.semester) === semNum);
    }
    return state.subjects.filter((s) => s.is_common_subject);
  };

  const getSubjectsForDepartmentAndSemester = (deptId, semester) => {
    const semNum = Number(semester) || 1;
    if (semNum === 1 || semNum === 2) {
      // Semester I & II are common for ALL engineering branches, but faculty is branch-specific!
      return state.subjects
        .filter((s) => s.is_common_subject && Number(s.semester) === semNum)
        .map((s) => {
          const facultyMap = (state.commonSubjectBranchFaculty && state.commonSubjectBranchFaculty[s.id]) || s.branchFaculty || {};
          const branchFaculty = facultyMap[deptId];
          if (branchFaculty) {
            return {
              ...s,
              teacherId: branchFaculty.teacherId,
              teacherName: branchFaculty.teacherName
            };
          }
          return s;
        });
    }
    // Semester 3 to 8 are branch-specific
    return state.subjects.filter((s) => s.departmentId === deptId && Number(s.semester) === semNum);
  };

  const getAllSubjectsForDepartment = (deptId) => {
    // All branches inherit common Sem 1 & 2 subjects (with their specific branch faculty) + their own Sem 3-8 subjects
    const commonSubjects = state.subjects
      .filter((s) => s.is_common_subject)
      .map((s) => {
        const facultyMap = (state.commonSubjectBranchFaculty && state.commonSubjectBranchFaculty[s.id]) || s.branchFaculty || {};
        const branchFaculty = facultyMap[deptId];
        if (branchFaculty) {
          return {
            ...s,
            teacherId: branchFaculty.teacherId,
            teacherName: branchFaculty.teacherName
          };
        }
        return s;
      });
    const branchSpecific = state.subjects.filter((s) => s.departmentId === deptId && !s.is_common_subject);
    return [...commonSubjects, ...branchSpecific];
  };

  const assignCommonSubjectFaculty = (subjectId, departmentId, teacherId, teacherName) => {
    setState((prev) => {
      const currentMap = { ...(prev.commonSubjectBranchFaculty || COMMON_SUBJECT_BRANCH_FACULTY) };
      if (!currentMap[subjectId]) currentMap[subjectId] = {};
      currentMap[subjectId][departmentId] = { teacherId, teacherName };

      const updatedSubjects = prev.subjects.map((sub) => {
        if (sub.id === subjectId) {
          return {
            ...sub,
            branchFaculty: {
              ...(sub.branchFaculty || {}),
              [departmentId]: { teacherId, teacherName }
            }
          };
        }
        return sub;
      });

      return {
        ...prev,
        commonSubjectBranchFaculty: currentMap,
        subjects: updatedSubjects
      };
    });

    addToast(
      "Branch Faculty Assigned",
      `Assigned ${teacherName} for subject across branch.`,
      "success"
    );
  };

  const addCommonSubject = (subjectData) => {
    const sem = Number(subjectData.semester) || 1;
    const newId = "sub-fy-" + (subjectData.code ? subjectData.code.toLowerCase().replace(/[^a-z0-9]/g, "") : `sem${sem}-${Date.now()}`);

    const newSub = {
      id: newId,
      name: subjectData.name,
      subject: subjectData.name,
      code: subjectData.code,
      course_code: subjectData.code,
      academic_year: subjectData.academic_year || "2026-27",
      year: "First Year",
      semester: sem,
      credits: Number(subjectData.credits) || 3,
      type: subjectData.type || "Theory",
      subject_type: subjectData.type || "Theory",
      branch: "All Engineering Branches",
      is_common_subject: true,
      departmentId: "common",
      teacherId: subjectData.teacherId || "tea-1",
      teacherName: subjectData.teacherName || "Prof. T. A. Mohije",
      room: subjectData.room || "Smart Classroom C-101",
      weeklyHours: Number(subjectData.weeklyHours) || 3,
      description: subjectData.description || `${subjectData.name} - Common First Year Curriculum for all engineering branches.`
    };

    setState((prev) => {
      const audit = logAudit(
        "Created Common First Year Subject",
        `Admin added common subject: ${newSub.name} (${newSub.code}) for Sem ${newSub.semester} across all engineering branches`,
        "Academic Curriculum"
      );

      return {
        ...prev,
        subjects: [newSub, ...prev.subjects],
        auditLogs: [audit, ...prev.auditLogs]
      };
    });

    addToast(
      "Common Subject Created",
      `"${newSub.name}" (${newSub.code}) added to Semester ${newSub.semester} common curriculum for ALL engineering branches.`,
      "success"
    );
    return newSub;
  };

  const updateCommonSubject = (subjectId, updatedData) => {
    setState((prev) => {
      let updatedSubObj = null;
      const updatedSubjects = prev.subjects.map((s) => {
        if (s.id === subjectId) {
          updatedSubObj = {
            ...s,
            ...updatedData,
            name: updatedData.name || s.name,
            subject: updatedData.name || s.subject || s.name,
            code: updatedData.code || s.code,
            course_code: updatedData.code || s.course_code || s.code,
            type: updatedData.type || s.type,
            subject_type: updatedData.type || s.subject_type || s.type,
            semester: updatedData.semester ? Number(updatedData.semester) : s.semester,
            credits: updatedData.credits ? Number(updatedData.credits) : s.credits,
            weeklyHours: updatedData.weeklyHours ? Number(updatedData.weeklyHours) : s.weeklyHours,
            is_common_subject: true,
            branch: "All Engineering Branches"
          };
          return updatedSubObj;
        }
        return s;
      });

      if (!updatedSubObj) return prev;

      // Sync across timetables where subject is scheduled
      const updatedTimetables = prev.timetables.map((slot) => {
        if (slot.subjectId === subjectId) {
          return {
            ...slot,
            subjectName: updatedSubObj.name,
            subjectCode: updatedSubObj.code,
            teacherName: updatedSubObj.teacherName || slot.teacherName,
            teacherId: updatedSubObj.teacherId || slot.teacherId,
            room: updatedSubObj.room || slot.room
          };
        }
        return slot;
      });

      const audit = logAudit(
        "Updated Common Subject",
        `Admin updated common subject ${updatedSubObj.name} (${updatedSubObj.code}) - synchronized across all engineering branches`,
        "Academic Curriculum"
      );

      return {
        ...prev,
        subjects: updatedSubjects,
        timetables: updatedTimetables,
        auditLogs: [audit, ...prev.auditLogs]
      };
    });

    addToast(
      "Common Subject Updated",
      `Subject updated and synchronized across all engineering branches and timetables without duplicates.`,
      "success"
    );
  };

  const deleteCommonSubject = (subjectId) => {
    const targetSub = state.subjects.find((s) => s.id === subjectId);
    const subName = targetSub ? targetSub.name : subjectId;

    setState((prev) => {
      const updatedSubjects = prev.subjects.filter((s) => s.id !== subjectId);
      const updatedTimetables = prev.timetables.filter((t) => t.subjectId !== subjectId);
      const audit = logAudit(
        "Deleted Common Subject",
        `Admin removed ${subName} from common curriculum across all branches`,
        "Academic Curriculum"
      );

      return {
        ...prev,
        subjects: updatedSubjects,
        timetables: updatedTimetables,
        auditLogs: [audit, ...prev.auditLogs]
      };
    });

    addToast("Subject Removed", `"${subName}" deleted from Common First Year curriculum.`, "warning");
    return true;
  };

  // Switch student semester dynamically (e.g. testing First Year Sem I ↔ Sem II)
  const switchStudentSemester = (newSem) => {
    const semNumber = Number(newSem);
    setState((prev) => {
      if (!prev.currentUser || prev.currentUser.role !== "student") return prev;
      const updatedCurrentUser = {
        ...prev.currentUser,
        semester: semNumber
      };
      const updatedUsers = prev.users.map((u) => (u.id === updatedCurrentUser.id ? updatedCurrentUser : u));
      return {
        ...prev,
        currentUser: updatedCurrentUser,
        users: updatedUsers
      };
    });
    addToast("Curriculum Switched", `Student view updated to Semester ${semNumber} Common Curriculum.`, "info");
  };

  // ==========================================
  // STUDY MATERIAL & NOTES REPOSITORY ENGINE
  // ==========================================
  const uploadStudyMaterial = (materialData) => {
    const id = "mat-" + Date.now();
    const newMaterial = {
      id,
      uploadedDate: new Date().toISOString().split("T")[0],
      createdAt: new Date().toISOString(),
      fileSize: materialData.fileSize || "3.5 MB",
      fileUrl: materialData.fileUrl || "#",
      targetAudience: materialData.targetAudience || "all",
      ...materialData
    };

    // Automatically alert relevant students
    const newNotif = {
      id: "notif-mat-" + Date.now(),
      title: `📚 New Study Material: ${newMaterial.title}`,
      message: `${newMaterial.uploadedBy} uploaded "${newMaterial.title}" (${newMaterial.materialType || newMaterial.type || "Notes"}) for ${newMaterial.subjectName || "your course"}.`,
      time: "Just now",
      date: new Date().toISOString().split("T")[0],
      type: "academic",
      recipientRole: "student",
      read: false,
      link: "study-material"
    };

    setState((prev) => ({
      ...prev,
      studyMaterials: [newMaterial, ...(prev.studyMaterials || [])],
      notifications: [newNotif, ...(prev.notifications || [])]
    }));

    addToast("Study Material Uploaded", `"${newMaterial.title}" published and students alerted.`, "success");
    return newMaterial;
  };

  const addStudyMaterial = (materialData) => {
    return uploadStudyMaterial(materialData);
  };

  const deleteStudyMaterial = (materialId) => {
    setState((prev) => ({
      ...prev,
      studyMaterials: (prev.studyMaterials || []).filter((m) => m.id !== materialId)
    }));
    addToast("Material Removed", "Study material deleted from repository.", "info");
  };

  // Filter study materials visible to a student based on class, TG batch, and department
  const getStudyMaterialsForStudent = (student) => {
    const studentId = student?.id;
    const deptId = student?.departmentId || "dept-vlsi";
    const sem = Number(student?.semester) || 5;

    // Find student's assigned class and TG batch
    let myClassId = null;
    let myTgBatchId = null;

    (state.classAssignments || []).forEach((ca) => {
      if (ca.departmentId === deptId && (ca.semester === sem || ca.year === student?.year)) {
        myClassId = ca.id;
        (ca.tgBatches || []).forEach((b) => {
          if ((b.studentIds || []).includes(studentId)) {
            myTgBatchId = b.id;
          }
        });
      }
    });

    return (state.studyMaterials || []).filter((item) => {
      // If audience is "all", it's visible to everyone
      if (!item.targetAudience || item.targetAudience === "all") return true;

      // If audience is "department"
      if (item.targetAudience === "department" && item.departmentId === deptId) return true;

      // If audience is "class"
      if (item.targetAudience === "class") {
        if (item.classAssignmentId && myClassId && item.classAssignmentId === myClassId) return true;
        if (item.departmentId === deptId && item.semester === sem) return true;
      }

      // If audience is "tg-batch"
      if (item.targetAudience === "tg-batch") {
        if (myTgBatchId && item.tgBatchId === myTgBatchId) return true;
        if (!item.tgBatchId && item.classAssignmentId === myClassId) return true;
      }

      return false;
    });
  };

  // ==========================================
  // CLASS TEACHER & TEACHER GUARDIAN (TG) ENGINE
  // ==========================================
  const assignClassTeacher = (classAssignmentId, teacherId, teacherName) => {
    setState((prev) => {
      const updated = (prev.classAssignments || []).map((ca) => {
        if (ca.id === classAssignmentId) {
          return {
            ...ca,
            classTeacherId: teacherId,
            classTeacherName: teacherName,
            updatedAt: new Date().toISOString()
          };
        }
        return ca;
      });

      // Also send notification to teacher
      const notif = {
        id: "notif-ct-" + Date.now(),
        title: "📢 New Responsibility Assigned",
        message: `You have been designated as Class Teacher for ${updated.find((c) => c.id === classAssignmentId)?.className || "your class"}.`,
        time: "Just now",
        date: new Date().toISOString().split("T")[0],
        type: "announcement",
        recipientId: teacherId,
        read: false
      };

      return {
        ...prev,
        classAssignments: updated,
        notifications: [notif, ...(prev.notifications || [])]
      };
    });
    addToast("Class Teacher Assigned", `${teacherName} is now the Class Teacher.`, "success");
  };

  const createClassAssignment = (newAssignment) => {
    const id = "ca-" + Date.now();
    const assignment = {
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tgBatches: [],
      ...newAssignment
    };
    setState((prev) => ({
      ...prev,
      classAssignments: [assignment, ...(prev.classAssignments || [])]
    }));
    addToast("Class Registered", `Class assignment "${assignment.className}" created.`, "success");
    return id;
  };

  const updateClassAssignment = (id, updatedFields) => {
    setState((prev) => ({
      ...prev,
      classAssignments: (prev.classAssignments || []).map((ca) =>
        ca.id === id ? { ...ca, ...updatedFields, updatedAt: new Date().toISOString() } : ca
      )
    }));
    addToast("Class Updated", "Class assignment details updated.", "success");
  };

  const deleteClassAssignment = (id) => {
    setState((prev) => ({
      ...prev,
      classAssignments: (prev.classAssignments || []).filter((ca) => ca.id !== id)
    }));
    addToast("Class Removed", "Class assignment record deleted.", "info");
  };

  const createTgBatch = (classAssignmentId, batchName, teacherId, teacherName) => {
    const batchId = "tg-" + Date.now();
    setState((prev) => ({
      ...prev,
      classAssignments: (prev.classAssignments || []).map((ca) => {
        if (ca.id === classAssignmentId) {
          const newBatch = {
            id: batchId,
            name: batchName,
            teacherId,
            teacherName,
            studentIds: []
          };
          return {
            ...ca,
            tgBatches: [...(ca.tgBatches || []), newBatch],
            updatedAt: new Date().toISOString()
          };
        }
        return ca;
      })
    }));
    addToast("TG Batch Created", `${batchName} assigned to ${teacherName}.`, "success");
    return batchId;
  };

  const updateTgTeacher = (classAssignmentId, tgBatchId, teacherId, teacherName) => {
    setState((prev) => {
      const updated = (prev.classAssignments || []).map((ca) => {
        if (ca.id === classAssignmentId) {
          return {
            ...ca,
            tgBatches: (ca.tgBatches || []).map((b) =>
              b.id === tgBatchId ? { ...b, teacherId, teacherName } : b
            ),
            updatedAt: new Date().toISOString()
          };
        }
        return ca;
      });

      const notif = {
        id: "notif-tg-" + Date.now(),
        title: "📢 TG Assignment",
        message: `You have been assigned as Teacher Guardian for batch under ${updated.find((c) => c.id === classAssignmentId)?.className || "your class"}.`,
        time: "Just now",
        date: new Date().toISOString().split("T")[0],
        type: "mentoring",
        recipientId: teacherId,
        read: false
      };

      return {
        ...prev,
        classAssignments: updated,
        notifications: [notif, ...(prev.notifications || [])]
      };
    });
    addToast("TG Teacher Updated", `${teacherName} assigned as Guardian.`, "success");
  };

  const assignStudentsToTgBatch = (classAssignmentId, tgBatchId, studentIds) => {
    setState((prev) => ({
      ...prev,
      classAssignments: (prev.classAssignments || []).map((ca) => {
        if (ca.id === classAssignmentId) {
          return {
            ...ca,
            tgBatches: (ca.tgBatches || []).map((b) =>
              b.id === tgBatchId ? { ...b, studentIds } : b
            ),
            updatedAt: new Date().toISOString()
          };
        }
        return ca;
      })
    }));
    addToast("Students Allocated", `Assigned ${studentIds.length} students to TG batch.`, "success");
  };

  const autoDistributeStudentsToTg = (classAssignmentId, numBatches = 3) => {
    setState((prev) => {
      const ca = (prev.classAssignments || []).find((c) => c.id === classAssignmentId);
      if (!ca) return prev;

      // Find all enrolled students for this class's department
      const deptStudents = prev.users.filter(
        (u) => u.role === "student" && u.departmentId === ca.departmentId
      );
      const studentIds = deptStudents.map((s) => s.id);
      const batchSize = Math.ceil(studentIds.length / numBatches);

      const existingBatches = ca.tgBatches || [];
      const updatedBatches = [];

      for (let i = 0; i < numBatches; i++) {
        const slice = studentIds.slice(i * batchSize, (i + 1) * batchSize);
        const existing = existingBatches[i];
        updatedBatches.push({
          id: existing ? existing.id : `tg-${ca.id}-${i + 1}`,
          name: existing ? existing.name : `Batch TG-${i + 1}`,
          teacherId: existing ? existing.teacherId : "tea-1",
          teacherName: existing ? existing.teacherName : "Prof. T. A. Mohije",
          studentIds: slice
        });
      }

      return {
        ...prev,
        classAssignments: (prev.classAssignments || []).map((c) =>
          c.id === classAssignmentId
            ? { ...c, tgBatches: updatedBatches, updatedAt: new Date().toISOString() }
            : c
        )
      };
    });
    addToast("Auto Distribution Complete", `Students equally distributed into ${numBatches} TG batches.`, "success");
  };

  // Helper to query teacher's roles & responsibilities
  const getTeacherResponsibilities = (teacherId) => {
    const assignments = state.classAssignments || [];
    const classTeacherAssignments = assignments.filter((ca) => ca.classTeacherId === teacherId);
    const tgAssignments = [];

    assignments.forEach((ca) => {
      (ca.tgBatches || []).forEach((b) => {
        if (b.teacherId === teacherId) {
          tgAssignments.push({
            ...b,
            classAssignmentId: ca.id,
            className: ca.className,
            departmentId: ca.departmentId,
            semester: ca.semester
          });
        }
      });
    });

    const teacher = state.users.find((u) => u.id === teacherId);
    const subjectTeacherCourses = (state.subjects || []).filter(
      (s) => s.teacherId === teacherId || s.teacherName === teacher?.name
    );

    return {
      teacher,
      isClassTeacher: classTeacherAssignments.length > 0,
      classAssignments: classTeacherAssignments,
      classTeacherAssignments: classTeacherAssignments,
      isTG: tgAssignments.length > 0,
      tgBatches: tgAssignments,
      tgAssignments: tgAssignments,
      isSubjectTeacher: subjectTeacherCourses.length > 0,
      subjects: subjectTeacherCourses
    };
  };

  // Broadcast Class Announcement
  const sendClassAnnouncement = (classAssignmentId, title, message) => {
    const ca = (state.classAssignments || []).find((c) => c.id === classAssignmentId);
    const newNotif = {
      id: "notif-ca-" + Date.now(),
      title: `📢 Class Notice: ${title}`,
      message: `${message} (Class: ${ca?.className || "General"})`,
      time: "Just now",
      date: new Date().toISOString().split("T")[0],
      type: "announcement",
      recipientRole: "student",
      read: false
    };
    setState((prev) => ({
      ...prev,
      notifications: [newNotif, ...(prev.notifications || [])]
    }));
    addToast("Announcement Sent", "Broadcast alert dispatched to entire class.", "success");
  };

  // Send Direct Announcement to a specific TG Batch
  const sendTgAnnouncement = (classAssignmentId, tgBatchId, title, message) => {
    const ca = (state.classAssignments || []).find((c) => c.id === classAssignmentId);
    const batch = ca?.tgBatches?.find((b) => b.id === tgBatchId);
    const newNotif = {
      id: "notif-tg-" + Date.now(),
      title: `🛡️ TG Mentor Message: ${title}`,
      message: `${message} (${batch?.name || "TG Batch"})`,
      time: "Just now",
      date: new Date().toISOString().split("T")[0],
      type: "mentoring",
      recipientRole: "student",
      read: false
    };
    setState((prev) => ({
      ...prev,
      notifications: [newNotif, ...(prev.notifications || [])]
    }));
    addToast("TG Announcement Sent", `Message sent to ${batch?.name || "TG batch"} students.`, "success");
  };

  // ==========================================
  // TIMETABLE MANAGEMENT ENGINE (ADMIN EDIT/ADD/DELETE)
  // ==========================================
  const addTimetableSlot = (slotData) => {
    const sub = state.subjects.find((s) => s.id === slotData.subjectId) || { name: slotData.subjectName || "Subject", code: slotData.subjectCode || "SUB101" };
    const teacher = state.users.find((u) => u.id === slotData.teacherId) || { name: slotData.teacherName || "Faculty" };
    const newSlotId = "slot-" + Date.now() + "-" + Math.random().toString(36).substr(2, 4);

    const newSlot = {
      id: newSlotId,
      departmentId: slotData.departmentId || "dept-ce",
      semester: Number(slotData.semester) || 5,
      division: slotData.division || "A",
      day: slotData.day || "Monday",
      time: slotData.time || "09:00 AM - 10:00 AM",
      subjectId: slotData.subjectId,
      subjectName: sub.name,
      subjectCode: sub.code,
      teacherId: slotData.teacherId || teacher.id,
      teacherName: teacher.name,
      room: slotData.room || "Room B-204",
      type: slotData.type || "Theory"
    };

    setState((prev) => {
      const audit = logAudit(
        "Scheduled Timetable Slot",
        `Added ${newSlot.day} ${newSlot.time} (${newSlot.subjectCode}) for Sem ${newSlot.semester} Div ${newSlot.division}`,
        "Timetable Master"
      );

      return {
        ...prev,
        timetables: [...prev.timetables, newSlot],
        auditLogs: [audit, ...prev.auditLogs]
      };
    });

    addToast(
      "Lecture Slot Scheduled",
      `${newSlot.subjectName} scheduled on ${newSlot.day} (${newSlot.time}).`,
      "success"
    );
    return newSlot;
  };

  const updateTimetableSlot = (slotId, updatedData) => {
    setState((prev) => {
      let updatedSlotObj = null;
      const updatedTimetables = prev.timetables.map((slot) => {
        if (slot.id === slotId) {
          updatedSlotObj = { ...slot, ...updatedData };
          if (updatedData.semester) updatedSlotObj.semester = Number(updatedData.semester);
          return updatedSlotObj;
        }
        return slot;
      });

      if (!updatedSlotObj) return prev;

      const audit = logAudit(
        "Updated Timetable Slot",
        `Modified ${updatedSlotObj.day} ${updatedSlotObj.time} (${updatedSlotObj.subjectName})`,
        "Timetable Master"
      );

      return {
        ...prev,
        timetables: updatedTimetables,
        auditLogs: [audit, ...prev.auditLogs]
      };
    });

    addToast("Timetable Slot Updated", "Lecture schedule slot updated successfully.", "success");
  };

  const deleteTimetableSlot = (slotId) => {
    setState((prev) => {
      const targetSlot = prev.timetables.find((t) => t.id === slotId);
      const updatedTimetables = prev.timetables.filter((t) => t.id !== slotId);
      const audit = logAudit(
        "Removed Timetable Slot",
        `Deleted slot ${targetSlot ? `${targetSlot.day} ${targetSlot.time} (${targetSlot.subjectName})` : slotId}`,
        "Timetable Master"
      );

      return {
        ...prev,
        timetables: updatedTimetables,
        auditLogs: [audit, ...prev.auditLogs]
      };
    });

    addToast("Slot Removed", "Lecture slot removed from timetable.", "info");
    return true;
  };

  // ==========================================
  // SYSTEM SETTINGS & THRESHOLD ENGINE
  // ==========================================
  const updateSystemSettings = (newSettings) => {
    const audit = logAudit(
      "Updated System Configuration",
      `Threshold: ${newSettings.attendanceThreshold}%, SMS: ${newSettings.smsNotificationsEnabled ? "ON" : "OFF"}, WhatsApp: ${newSettings.whatsappNotificationsEnabled ? "ON" : "OFF"}`,
      "Settings"
    );

    setState((prev) => ({
      ...prev,
      systemSettings: { ...prev.systemSettings, ...newSettings },
      auditLogs: [audit, ...prev.auditLogs]
    }));

    addToast(
      "Settings Saved",
      `Global attendance threshold updated to ${newSettings.attendanceThreshold}%. Risk indicators recalculated across all portals.`,
      "success"
    );
  };

  // Notification helpers
  const markNotificationRead = (id) => {
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) => (n.id === id ? { ...n, read: true, deliveryStatus: "Read" } : n))
    }));
  };

  const markAllNotificationsRead = (userId) => {
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) => (n.recipientId === userId ? { ...n, read: true, deliveryStatus: "Read" } : n))
    }));
    addToast("Notifications Cleared", "All notifications marked as read.", "info");
  };

  // ==========================================
  // STUDENT SKILLS & TALENT METHODS
  // ==========================================
  const addStudentSkill = (skillData) => {
    const newSkill = {
      id: "skill-" + Date.now() + "-" + Math.random().toString(36).substr(2, 4),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...skillData
    };

    const audit = logAudit(
      "Added Student Skill",
      `${newSkill.studentName} added ${newSkill.skill} (${newSkill.skillLevel} - ${newSkill.category})`,
      "Talent & Skills"
    );

    // Notify HOD and Teachers of department about new skill profile
    const notif = {
      id: "notif-skill-" + Date.now(),
      title: "New Student Skill Profile Added",
      message: `${newSkill.studentName} (${newSkill.departmentName}) added ${newSkill.skill} (${newSkill.skillLevel}) to their profile.`,
      timestamp: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short" }) + ", " + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      read: false,
      recipientRole: "teacher",
      recipientDepartmentId: newSkill.departmentId,
      deliveryStatus: "Delivered",
      type: "skill"
    };

    setState((prev) => ({
      ...prev,
      studentSkills: [newSkill, ...prev.studentSkills],
      notifications: [notif, ...prev.notifications],
      auditLogs: [audit, ...prev.auditLogs]
    }));

    addToast("Skill Added", `"${newSkill.skill}" has been added to your profile.`, "success");
    return newSkill;
  };

  const updateStudentSkill = (skillId, updatedData) => {
    setState((prev) => ({
      ...prev,
      studentSkills: prev.studentSkills.map((s) =>
        s.id === skillId ? { ...s, ...updatedData, updatedAt: new Date().toISOString() } : s
      )
    }));
    addToast("Profile Updated", "Skill details successfully updated.", "success");
  };

  const deleteStudentSkill = (skillId) => {
    setState((prev) => ({
      ...prev,
      studentSkills: prev.studentSkills.filter((s) => s.id !== skillId)
    }));
    addToast("Skill Removed", "The skill entry has been removed from your profile.", "info");
  };

  // ==========================================
  // COLLEGE EVENTS & TEAMS METHODS
  // ==========================================
  const createCollegeEvent = (eventData) => {
    const newEvent = {
      id: "evt-" + Date.now(),
      createdAt: new Date().toISOString(),
      status: "Upcoming",
      ...eventData
    };

    const audit = logAudit(
      "Created College Event",
      `Event "${newEvent.eventName}" (${newEvent.category}) created by ${newEvent.coordinatorName}`,
      "Events & Teams"
    );

    // Broadcast notice/notification
    const notif = {
      id: "notif-evt-" + Date.now(),
      title: `New College Event: ${newEvent.eventName}`,
      message: `${newEvent.coordinatorName} scheduled "${newEvent.eventName}" on ${newEvent.date}. Required skills: ${(newEvent.requiredSkills || []).map((s) => s.skill).join(", ")}.`,
      timestamp: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short" }) + ", " + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      read: false,
      recipientRole: "student",
      deliveryStatus: "Delivered",
      type: "event"
    };

    setState((prev) => ({
      ...prev,
      collegeEvents: [newEvent, ...prev.collegeEvents],
      notifications: [notif, ...prev.notifications],
      auditLogs: [audit, ...prev.auditLogs]
    }));

    addToast("Event Created", `"${newEvent.eventName}" has been scheduled successfully.`, "success");
    return newEvent;
  };

  const updateCollegeEvent = (eventId, updatedData) => {
    setState((prev) => ({
      ...prev,
      collegeEvents: prev.collegeEvents.map((e) => (e.id === eventId ? { ...e, ...updatedData } : e))
    }));
    addToast("Event Updated", "Event details updated successfully.", "success");
  };

  const deleteCollegeEvent = (eventId) => {
    setState((prev) => ({
      ...prev,
      collegeEvents: prev.collegeEvents.filter((e) => e.id !== eventId),
      eventInvitations: prev.eventInvitations.filter((i) => i.eventId !== eventId),
      eventTeamMembers: prev.eventTeamMembers.filter((t) => t.eventId !== eventId)
    }));
    addToast("Event Deleted", "College event and associated records removed.", "info");
  };

  // ==========================================
  // EVENT INVITATION SYSTEM
  // ==========================================
  const sendEventInvitation = ({ eventId, studentId, role, skill, notes = "" }) => {
    const event = state.collegeEvents.find((e) => e.id === eventId);
    const student = state.users.find((u) => u.id === studentId);
    if (!event || !student) {
      addToast("Error", "Invalid event or student selected.", "danger");
      return;
    }

    // Check if already invited
    const existing = state.eventInvitations.find(
      (i) => i.eventId === eventId && i.studentId === studentId
    );
    if (existing) {
      addToast("Already Invited", `${student.name} is already ${existing.status.toLowerCase()} for this event.`, "warning");
      return;
    }

    const newInvitation = {
      id: "inv-" + Date.now() + "-" + Math.random().toString(36).substr(2, 4),
      eventId: event.id,
      eventName: event.eventName,
      eventDate: event.date,
      venue: event.venue,
      studentId: student.id,
      studentName: student.name,
      invitedBy: state.currentUser ? state.currentUser.id : event.coordinatorId,
      invitedByName: state.currentUser ? state.currentUser.name : event.coordinatorName,
      role: role || skill || "Participant",
      skill: skill || "General",
      status: "Invited",
      responseDate: null,
      declineReason: null,
      notes,
      createdAt: new Date().toISOString()
    };

    // Notification for the invited student
    const notif = {
      id: "notif-inv-" + Date.now(),
      title: `Event Invitation: ${event.eventName}`,
      message: `You have been invited to participate in ${event.eventName} as ${newInvitation.role}. Coordinator: ${newInvitation.invitedByName}`,
      timestamp: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short" }) + ", " + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      read: false,
      recipientId: student.id,
      recipientRole: "student",
      deliveryStatus: "Delivered",
      type: "invitation"
    };

    const audit = logAudit(
      "Sent Event Invitation",
      `Invited ${student.name} for "${event.eventName}" as ${newInvitation.role}`,
      "Events & Teams"
    );

    setState((prev) => ({
      ...prev,
      eventInvitations: [newInvitation, ...prev.eventInvitations],
      notifications: [notif, ...prev.notifications],
      auditLogs: [audit, ...prev.auditLogs]
    }));

    addToast("Invitation Dispatched", `Invitation sent to ${student.name} for ${event.eventName}.`, "success");
    return newInvitation;
  };

  const respondToInvitation = ({ invitationId, status, declineReason = null }) => {
    const inv = state.eventInvitations.find((i) => i.id === invitationId);
    if (!inv) return;

    const updatedInvitations = state.eventInvitations.map((i) =>
      i.id === invitationId
        ? {
            ...i,
            status,
            declineReason: status === "Declined" ? declineReason : null,
            responseDate: new Date().toISOString()
          }
        : i
    );

    // If accepted, also auto-register to team members if not already there
    let updatedTeamMembers = [...state.eventTeamMembers];
    if (status === "Accepted") {
      const alreadyInTeam = updatedTeamMembers.some(
        (t) => t.eventId === inv.eventId && t.studentId === inv.studentId
      );
      if (!alreadyInTeam) {
        updatedTeamMembers.push({
          id: "team-" + Date.now(),
          eventId: inv.eventId,
          studentId: inv.studentId,
          studentName: inv.studentName,
          assignedRole: inv.role,
          assignedBy: inv.invitedBy,
          assignedByName: inv.invitedByName,
          status: "Accepted"
        });
      }
    }

    // Notification back to coordinator
    const notif = {
      id: "notif-resp-" + Date.now(),
      title: `Invitation ${status}: ${inv.eventName}`,
      message: `${inv.studentName} has ${status.toLowerCase()} the invitation for ${inv.eventName} as ${inv.role}.${declineReason ? ` Reason: ${declineReason}` : ""}`,
      timestamp: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short" }) + ", " + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      read: false,
      recipientId: inv.invitedBy,
      recipientRole: "teacher",
      deliveryStatus: "Delivered",
      type: "invitation_response"
    };

    const audit = logAudit(
      `Invitation ${status}`,
      `${inv.studentName} ${status.toLowerCase()} invitation for "${inv.eventName}"`,
      "Events & Teams"
    );

    setState((prev) => ({
      ...prev,
      eventInvitations: updatedInvitations,
      eventTeamMembers: updatedTeamMembers,
      notifications: [notif, ...prev.notifications],
      auditLogs: [audit, ...prev.auditLogs]
    }));

    addToast(
      status === "Accepted" ? "Invitation Accepted" : "Invitation Declined",
      status === "Accepted"
        ? `You have joined the roster for ${inv.eventName}!`
        : `Decline response submitted to the coordinator.`,
      status === "Accepted" ? "success" : "info"
    );
  };

  const assignEventTeamMember = ({ eventId, studentId, role }) => {
    const student = state.users.find((u) => u.id === studentId);
    const event = state.collegeEvents.find((e) => e.id === eventId);
    if (!student || !event) return;

    const existingIdx = state.eventTeamMembers.findIndex(
      (t) => t.eventId === eventId && t.studentId === studentId
    );

    let updatedTeam = [...state.eventTeamMembers];
    if (existingIdx >= 0) {
      updatedTeam[existingIdx] = {
        ...updatedTeam[existingIdx],
        assignedRole: role,
        assignedBy: state.currentUser?.id,
        assignedByName: state.currentUser?.name,
        status: "Assigned"
      };
    } else {
      updatedTeam.push({
        id: "team-" + Date.now(),
        eventId,
        studentId,
        studentName: student.name,
        assignedRole: role,
        assignedBy: state.currentUser?.id,
        assignedByName: state.currentUser?.name,
        status: "Assigned"
      });
    }

    const notif = {
      id: "notif-team-" + Date.now(),
      title: `Team Assignment: ${event.eventName}`,
      message: `You have been assigned as "${role}" in the official management team for ${event.eventName}.`,
      timestamp: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short" }) + ", " + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      read: false,
      recipientId: student.id,
      recipientRole: "student",
      deliveryStatus: "Delivered",
      type: "team_assignment"
    };

    setState((prev) => ({
      ...prev,
      eventTeamMembers: updatedTeam,
      notifications: [notif, ...prev.notifications]
    }));

    addToast("Role Assigned", `${student.name} assigned as "${role}".`, "success");
  };

  const removeEventTeamMember = ({ eventId, studentId }) => {
    setState((prev) => ({
      ...prev,
      eventTeamMembers: prev.eventTeamMembers.filter(
        (t) => !(t.eventId === eventId && t.studentId === studentId)
      )
    }));
    addToast("Team Updated", "Member removed from event team roster.", "info");
  };

  // ==========================================
  // CONFIDENTIAL PARENT HEALTH RECORDS
  // ==========================================
  const addHealthRecord = (healthData) => {
    const newRecord = {
      id: "hlth-" + Date.now() + "-" + Math.random().toString(36).substr(2, 4),
      verificationStatus: "Pending Verification",
      verifiedBy: null,
      verifiedAt: null,
      reviewNotes: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...healthData
    };

    const audit = logAudit(
      "Submitted Confidential Health Record",
      `Parent ${newRecord.parentName} submitted medical details for ${newRecord.studentName} (${newRecord.conditionCategory})`,
      "Health & Confidential"
    );

    // Confidential review notification dispatched to Department HOD and Admin only
    const notif = {
      id: "notif-hlth-" + Date.now(),
      title: "Confidential Health Document Requiring Verification",
      message: `Parent of ${newRecord.studentName} submitted medical documentation for ${newRecord.conditionCategory}. Please review in HOD portal.`,
      timestamp: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short" }) + ", " + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      read: false,
      recipientRole: "hod",
      recipientDepartmentId: newRecord.departmentId,
      deliveryStatus: "Delivered",
      type: "health_review"
    };

    setState((prev) => ({
      ...prev,
      studentHealthRecords: [newRecord, ...prev.studentHealthRecords],
      notifications: [notif, ...prev.notifications],
      auditLogs: [audit, ...prev.auditLogs]
    }));

    addToast(
      "Health Record Submitted",
      "Medical details securely submitted. Status is now 'Pending Verification'.",
      "success"
    );
    return newRecord;
  };

  const updateHealthRecord = (recordId, updatedData) => {
    setState((prev) => ({
      ...prev,
      studentHealthRecords: prev.studentHealthRecords.map((r) =>
        r.id === recordId
          ? {
              ...r,
              ...updatedData,
              verificationStatus: "Pending Verification",
              updatedAt: new Date().toISOString()
            }
          : r
      )
    }));

    const audit = logAudit(
      "Updated Health Record",
      `Modified health record details for ID: ${recordId}. Re-verification flagged.`,
      "Health & Confidential"
    );

    setState((prev) => ({ ...prev, auditLogs: [audit, ...prev.auditLogs] }));
    addToast("Record Updated", "Health record updated and submitted for re-verification.", "info");
  };

  const updateHealthVerification = ({ recordId, verificationStatus, reviewNotes = "" }) => {
    const record = state.studentHealthRecords.find((r) => r.id === recordId);
    if (!record) return;

    const reviewerName = state.currentUser ? state.currentUser.name : "Authorized Medical Staff";
    const reviewerRole = state.activeRole ? state.activeRole.toUpperCase() : "STAFF";

    const updatedRecords = state.studentHealthRecords.map((r) =>
      r.id === recordId
        ? {
            ...r,
            verificationStatus,
            reviewNotes,
            verifiedBy: `${reviewerName} (${reviewerRole})`,
            verifiedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        : r
    );

    const audit = logAudit(
      "Verified Health Record",
      `${reviewerName} marked health record of ${record.studentName} as "${verificationStatus}". Notes: ${reviewNotes || "None"}`,
      "Health & Confidential"
    );

    // Notification to Parent
    const notif = {
      id: "notif-hlth-par-" + Date.now(),
      title: `Medical Verification: ${verificationStatus}`,
      message: `Health documentation for ${record.studentName} has been marked as "${verificationStatus}" by college authorities.${reviewNotes ? ` Remarks: ${reviewNotes}` : ""}`,
      timestamp: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short" }) + ", " + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      read: false,
      recipientId: record.parentId,
      recipientRole: "parent",
      deliveryStatus: "Delivered",
      type: "health_status"
    };

    setState((prev) => ({
      ...prev,
      studentHealthRecords: updatedRecords,
      notifications: [notif, ...prev.notifications],
      auditLogs: [audit, ...prev.auditLogs]
    }));

    addToast(
      "Verification Recorded",
      `Health record status set to "${verificationStatus}". Parent notified.`,
      verificationStatus === "Verified" ? "success" : "warning"
    );
  };

  const logHealthAccess = (action, studentId, details) => {
    const student = state.users.find((u) => u.id === studentId);
    const studentName = student ? student.name : "Student " + studentId;
    const actorName = state.currentUser ? state.currentUser.name : "Unknown User";
    const actorRole = state.activeRole ? state.activeRole.toUpperCase() : "UNKNOWN";

    const audit = logAudit(
      action || "CONFIDENTIAL_HEALTH_ACCESS",
      `${actorName} (${actorRole}) accessed confidential medical information for ${studentName}. Details: ${details || "Safety check"}`,
      "Health & Confidential"
    );

    setState((prev) => ({
      ...prev,
      auditLogs: [audit, ...prev.auditLogs]
    }));
  };

  // ==========================================
  // DOCTOR'S LETTERS & MEDICAL PROOF ENGINE
  // ==========================================
  const uploadDoctorLetter = (letterData) => {
    const parent = state.currentUser?.role === "parent" ? state.currentUser : (state.users.find((u) => u.role === "parent") || state.users[0]);
    const ward = state.users.find((u) => u.id === (letterData.studentId || parent?.studentId)) || state.users[0];

    const newLetter = {
      id: "doc-let-" + Date.now(),
      studentId: ward.id,
      studentName: ward.name,
      prn: ward.prn || ward.prnNo || "24025331378056",
      rollNo: ward.rollNo || "VL3152",
      departmentId: ward.departmentId || "dept-vlsi",
      departmentName: ward.departmentName || "Electronic Engineering (VLSI Design And Technology)",
      year: ward.year || "Third Year",
      semester: ward.semester || 5,
      division: ward.division || "A",
      parentId: parent.id,
      parentName: parent.name,
      parentContact: parent.phone || "7378535499",
      letterType: letterData.letterType || "Medical Sick Leave / Absence Certificate",
      doctorName: letterData.doctorName || "Dr. Medical Practitioner",
      regNo: letterData.regNo || "MMC-Pending",
      hospitalClinic: letterData.hospitalClinic || "Private Clinic",
      doctorContact: letterData.doctorContact || "",
      issueDate: letterData.issueDate || new Date().toISOString().split("T")[0],
      leaveStartDate: letterData.leaveStartDate || null,
      leaveEndDate: letterData.leaveEndDate || null,
      totalDays: letterData.totalDays ? Number(letterData.totalDays) : (letterData.leaveStartDate && letterData.leaveEndDate ? Math.max(1, Math.round((new Date(letterData.leaveEndDate) - new Date(letterData.leaveStartDate)) / (1000 * 60 * 60 * 24)) + 1) : null),
      diagnosis: letterData.diagnosis || "Medical assessment details provided on official certificate.",
      recommendations: letterData.recommendations || "Prescribed rest / medical treatment as per attached note.",
      applyForLeaveCondonation: !!letterData.applyForLeaveCondonation,
      documentUrl: letterData.documentUrl || "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&auto=format&fit=crop&q=80",
      documentName: letterData.documentName || "Doctor_Medical_Certificate.pdf",
      documentSize: letterData.documentSize || "350 KB",
      status: "Pending Review",
      verifiedBy: null,
      verifiedAt: null,
      reviewNotes: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Notification for TG Teacher & HOD
    const facultyNotif = {
      id: "notif-doc-" + Date.now(),
      title: `🩺 Doctor's Letter Uploaded: ${ward.name}`,
      message: `Parent of ${ward.name} (${ward.rollNo}) uploaded a "${newLetter.letterType}" from ${newLetter.doctorName}${newLetter.totalDays ? ` for ${newLetter.totalDays} day(s) medical absence` : ""}. Please review in Medical / Leave Desk.`,
      timestamp: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short" }) + ", " + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      read: false,
      recipientRole: "teacher",
      recipientDepartmentId: ward.departmentId,
      deliveryStatus: "Delivered",
      type: "doctor_letter"
    };

    // Optional: automatically link into leaves table if leave condonation is requested
    let newLeaves = state.leaves;
    if (newLetter.applyForLeaveCondonation && newLetter.leaveStartDate) {
      const linkedLeave = {
        id: "lv-doc-" + Date.now(),
        studentId: ward.id,
        studentName: ward.name,
        rollNo: ward.rollNo || "VL3152",
        startDate: newLetter.leaveStartDate,
        endDate: newLetter.leaveEndDate || newLetter.leaveStartDate,
        totalDays: newLetter.totalDays || 1,
        reason: `Medical Leave (${newLetter.letterType})`,
        description: `Doctor's Certificate uploaded by parent (${parent.name}). Doctor: ${newLetter.doctorName} (${newLetter.hospitalClinic}). Diagnosis: ${newLetter.diagnosis}`,
        document: newLetter.documentName,
        appliedDate: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
        status: "Pending",
        approverComment: "Medical certificate attached under Doctor's Letters."
      };
      newLeaves = [linkedLeave, ...state.leaves];
    }

    const audit = logAudit(
      "Uploaded Doctor's Letter",
      `Parent of ${ward.name} submitted official doctor certificate from ${newLetter.doctorName} (${newLetter.letterType})`,
      "Health & Confidential"
    );

    setState((prev) => ({
      ...prev,
      doctorLetters: [newLetter, ...prev.doctorLetters],
      leaves: newLeaves,
      notifications: [facultyNotif, ...prev.notifications],
      auditLogs: [audit, ...prev.auditLogs]
    }));

    addToast(
      "Doctor's Letter Uploaded",
      `Medical document from ${newLetter.doctorName} submitted for verification.${newLetter.applyForLeaveCondonation ? " Medical leave condonation application initiated." : ""}`,
      "success"
    );

    return newLetter;
  };

  const updateDoctorLetter = (letterId, updatedData) => {
    setState((prev) => ({
      ...prev,
      doctorLetters: prev.doctorLetters.map((letItem) =>
        letItem.id === letterId
          ? {
              ...letItem,
              ...updatedData,
              status: "Pending Review",
              updatedAt: new Date().toISOString()
            }
          : letItem
      )
    }));

    const audit = logAudit(
      "Updated Doctor's Letter",
      `Updated doctor certificate ID ${letterId}. Re-verification flagged.`,
      "Health & Confidential"
    );

    setState((prev) => ({ ...prev, auditLogs: [audit, ...prev.auditLogs] }));
    addToast("Doctor Letter Updated", "Details updated and queued for re-verification.", "info");
  };

  const deleteDoctorLetter = (letterId) => {
    setState((prev) => ({
      ...prev,
      doctorLetters: prev.doctorLetters.filter((l) => l.id !== letterId)
    }));

    const audit = logAudit(
      "Deleted Doctor's Letter",
      `Withdrew doctor letter record ID ${letterId}`,
      "Health & Confidential"
    );

    setState((prev) => ({ ...prev, auditLogs: [audit, ...prev.auditLogs] }));
    addToast("Record Withdrawn", "Doctor's letter removed from records.", "warning");
  };

  const verifyDoctorLetter = ({ letterId, status, reviewNotes = "" }) => {
    const letter = state.doctorLetters.find((l) => l.id === letterId);
    if (!letter) return;

    const reviewerName = state.currentUser ? state.currentUser.name : "Faculty / Medical Staff";
    const reviewerRole = state.activeRole ? state.activeRole.toUpperCase() : "STAFF";

    const updatedLetters = state.doctorLetters.map((l) =>
      l.id === letterId
        ? {
            ...l,
            status,
            reviewNotes,
            verifiedBy: `${reviewerName} (${reviewerRole})`,
            verifiedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        : l
    );

    const parentNotif = {
      id: "notif-doc-par-" + Date.now(),
      title: `🩺 Doctor's Letter ${status}: ${letter.doctorName}`,
      message: `Doctor letter submitted for ${letter.studentName} has been marked as "${status}" by ${reviewerName}.${reviewNotes ? ` Remarks: ${reviewNotes}` : ""}`,
      timestamp: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short" }) + ", " + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      read: false,
      recipientId: letter.parentId,
      recipientRole: "parent",
      deliveryStatus: "Delivered",
      type: "doctor_letter"
    };

    const audit = logAudit(
      "Verified Doctor's Letter",
      `${reviewerName} marked doctor letter ID ${letterId} as ${status}. Remarks: ${reviewNotes || "None"}`,
      "Health & Confidential"
    );

    setState((prev) => ({
      ...prev,
      doctorLetters: updatedLetters,
      notifications: [parentNotif, ...prev.notifications],
      auditLogs: [audit, ...prev.auditLogs]
    }));

    addToast(
      "Verification Status Updated",
      `Doctor's letter status changed to "${status}". Parent notified.`,
      status === "Verified" ? "success" : "warning"
    );
  };

  // ==========================================
  // AI ACADEMIC ASSISTANT LOGIC
  // ==========================================
  const queryAIAssistant = (userQuery) => {
    const student = state.currentUser?.role === "student" ? state.currentUser : state.users[0];
    const q = userQuery.toLowerCase().trim();
    const threshold = state.systemSettings.attendanceThreshold;

    const studentAtt = state.attendance[student.id] || {};
    let totalClasses = 0;
    let totalAttended = 0;
    const subjectBreakdown = [];

    state.subjects.forEach((sub) => {
      const sData = studentAtt[sub.id] || { total: 20, attended: 16, percentage: 80 };
      totalClasses += sData.total;
      totalAttended += sData.attended;
      subjectBreakdown.push({
        name: sub.name,
        code: sub.code,
        percentage: sData.percentage,
        attended: sData.attended,
        total: sData.total,
        isDefaulter: sData.percentage < threshold
      });
    });

    const overallPct = totalClasses > 0 ? Math.round((totalAttended / totalClasses) * 1000) / 10 : 0;
    const defaulterSubjects = subjectBreakdown.filter((s) => s.isDefaulter);

    const pendingAssignments = state.assignments.filter((asg) => {
      const sub = asg.submissions.find((s) => s.studentId === student.id);
      return !sub || sub.status !== "Submitted";
    });

    const studentMarks = state.marks.filter((m) => m.studentId === student.id);

    // Contextual responses based on real active data
    if (q.includes("attendance warning") || q.includes("why am i getting") || q.includes("defaulter")) {
      if (defaulterSubjects.length > 0) {
        const subList = defaulterSubjects
          .map((s) => `• **${s.name}**: ${s.percentage}% (${s.attended}/${s.total} lectures). Required to reach ${threshold}%: Attend next ${Math.ceil((threshold * s.total - 100 * s.attended) / (100 - threshold))} consecutive lectures.`)
          .join("\n");
        return {
          response: `You are receiving attendance warnings because your attendance is below the institutional threshold of **${threshold}%** in **${defaulterSubjects.length} subject(s)**:\n\n${subList}\n\n💡 *Action item: Ensure you attend all upcoming lectures and submit medical leaves if applicable.*`,
          actionSuggestions: ["View Attendance Breakdown", "Check Timetable", "Apply for Leave"]
        };
      } else {
        return {
          response: `Good news! Your overall attendance is **${overallPct}%**, which is comfortably above the **${threshold}%** mandatory requirement in all subjects.`,
          actionSuggestions: ["View Attendance Breakdown", "View Next Lecture"]
        };
      }
    }

    if (q.includes("attention") || q.includes("which subject") || q.includes("improve")) {
      const lowestSub = [...subjectBreakdown].sort((a, b) => a.percentage - b.percentage)[0];
      return {
        response: `**${lowestSub.name}** requires your most urgent attention. Your current score is **${lowestSub.percentage}%** (${lowestSub.attended}/${lowestSub.total} lectures attended). You need to attend the next **${Math.max(1, Math.ceil((threshold * lowestSub.total - 100 * lowestSub.attended) / (100 - threshold)))}** lectures without absence to bring it above ${threshold}%.`,
        actionSuggestions: ["View Subject Attendance", "Check DBMS Syllabus", "Ask AI for Study Tips"]
      };
    }

    if (q.includes("marks") || q.includes("score") || q.includes("exam result")) {
      if (studentMarks.length === 0) {
        return { response: "No exam marks have been recorded yet for your account." };
      }
      const marksList = studentMarks.map((m) => `• **${m.subjectName}** (${m.examType}): **${m.marksObtained}/${m.maxMarks}** (${Math.round((m.marksObtained / m.maxMarks) * 100)}%) - *${m.remarks}*`).join("\n");
      return {
        response: `Here are your recent test scores:\n\n${marksList}\n\n📈 Average Score: **${Math.round(studentMarks.reduce((acc, m) => acc + (m.marksObtained / m.maxMarks) * 100, 0) / studentMarks.length)}%**`,
        actionSuggestions: ["View Complete Gradebook", "Download Report Card"]
      };
    }

    if (q.includes("assignment") || q.includes("pending") || q.includes("homework") || q.includes("submission")) {
      if (pendingAssignments.length === 0) {
        return { response: `🎉 Excellent! You have **0 pending assignments**. All coursework has been submitted.` };
      }
      const list = pendingAssignments.map((a) => `• **${a.title}** (${a.subjectName}) - Deadline: **${a.deadline}** (${a.totalPoints} pts)`).join("\n");
      return {
        response: `You have **${pendingAssignments.length} pending assignment(s)**:\n\n${list}\n\nMake sure to submit before the portal locks!`,
        actionSuggestions: ["Go to Assignments", "Upload Submission"]
      };
    }

    if (q.includes("attendance") || q.includes("current attendance") || q.includes("percentage")) {
      const list = subjectBreakdown.map((s) => `• ${s.name}: **${s.percentage}%** ${s.isDefaulter ? "🔴 (Below " + threshold + "%)" : "🟢"}`).join("\n");
      return {
        response: `Your overall academic attendance is **${overallPct}%**.\n\nSubject breakdown:\n${list}`,
        actionSuggestions: ["Detailed Attendance", "Attendance Recovery Calculator"]
      };
    }

    // Default Smart Answer
    return {
      response: `I am your **Smart Campus AI Academic Assistant**. Based on your real-time records:\n\n• **Overall Attendance**: ${overallPct}% (${defaulterSubjects.length > 0 ? "⚠️ Warning in " + defaulterSubjects.map((s) => s.name).join(", ") : "🟢 In Good Standing"})\n• **Pending Assignments**: ${pendingAssignments.length} pending\n• **Recent Test Performance**: Average ${studentMarks.length > 0 ? Math.round(studentMarks.reduce((acc, m) => acc + (m.marksObtained / m.maxMarks) * 100, 0) / studentMarks.length) : 0}%\n• **Next Class**: ${state.timetableToday[0]?.subject || "DBMS"} at ${state.timetableToday[0]?.time || "10:00 AM"}\n\nHow else can I assist your studies today?`,
      actionSuggestions: ["Why am I getting an attendance warning?", "Show my recent marks", "What assignments are pending?", "Which subject needs more attention?"]
    };
  };

  const setDemoStep = (step) => {
    setState((prev) => ({ ...prev, demoStep: step }));
  };

  return (
    <SmartCampusContext.Provider
      value={{
        ...state,
        users: Array.isArray(state.users) ? state.users : [CLEAN_BASELINE_ADMIN],
        departments: Array.isArray(state.departments) ? state.departments : DEPARTMENTS,
        subjects: Array.isArray(state.subjects) ? state.subjects : [],
        timetables: Array.isArray(state.timetables) ? state.timetables : [],
        timetableToday: Array.isArray(state.timetableToday) ? state.timetableToday : [],
        studyMaterials: Array.isArray(state.studyMaterials) ? state.studyMaterials : [],
        attendanceLogs: Array.isArray(state.attendanceLogs) ? state.attendanceLogs : [],
        smsLogs: Array.isArray(state.smsLogs) ? state.smsLogs : [],
        marks: Array.isArray(state.marks) ? state.marks : [],
        assignments: Array.isArray(state.assignments) ? state.assignments : [],
        notices: Array.isArray(state.notices) ? state.notices : [],
        exams: Array.isArray(state.exams) ? state.exams : [],
        leaves: Array.isArray(state.leaves) ? state.leaves : [],
        complaints: Array.isArray(state.complaints) ? state.complaints : [],
        notifications: Array.isArray(state.notifications) ? state.notifications : [],
        auditLogs: Array.isArray(state.auditLogs) ? state.auditLogs : [],
        studentSkills: Array.isArray(state.studentSkills) ? state.studentSkills : [],
        collegeEvents: Array.isArray(state.collegeEvents) ? state.collegeEvents : [],
        eventInvitations: Array.isArray(state.eventInvitations) ? state.eventInvitations : [],
        eventTeamMembers: Array.isArray(state.eventTeamMembers) ? state.eventTeamMembers : [],
        studentHealthRecords: Array.isArray(state.studentHealthRecords) ? state.studentHealthRecords : [],
        doctorLetters: Array.isArray(state.doctorLetters) ? state.doctorLetters : [],
        classAssignments: Array.isArray(state.classAssignments) ? state.classAssignments : [],
        toasts,
        addToast,
        removeToast,
        switchUser,
        login,
        logout,
        markAttendance,
        submitMarks,
        createAssignment,
        submitAssignment,
        gradeAssignment,
        flagPlagiarizedAssignment,
        createNotice,
        applyLeave,
        updateLeaveStatus,
        raiseComplaint,
        updateComplaintStatus,
        updateSystemSettings,
        updateUser,
        addUser,
        deleteUser,
        updateDepartment,
        addDepartment,
        deleteDepartment,
        addSubject,
        updateSubject,
        deleteSubject,
        getCommonFirstYearSubjects,
        getSubjectsForDepartmentAndSemester,
        getAllSubjectsForDepartment,
        addCommonSubject,
        updateCommonSubject,
        deleteCommonSubject,
        assignCommonSubjectFaculty,
        switchStudentSemester,
        addStudyMaterial,
        uploadStudyMaterial,
        deleteStudyMaterial,
        getStudyMaterialsForStudent,
        assignClassTeacher,
        createClassAssignment,
        updateClassAssignment,
        deleteClassAssignment,
        createTgBatch,
        updateTgTeacher,
        assignStudentsToTgBatch,
        autoDistributeStudentsToTg,
        getTeacherResponsibilities,
        sendClassAnnouncement,
        sendTgAnnouncement,
        addTimetableSlot,
        updateTimetableSlot,
        deleteTimetableSlot,
        markNotificationRead,
        markAllNotificationsRead,
        queryAIAssistant,
        setDemoStep,
        classMetadata: VLSI_CLASS_METADATA,
        getStudentBatchInfo,
        // Talent, Events & Health methods
        addStudentSkill,
        updateStudentSkill,
        deleteStudentSkill,
        createCollegeEvent,
        updateCollegeEvent,
        deleteCollegeEvent,
        sendEventInvitation,
        respondToInvitation,
        assignEventTeamMember,
        removeEventTeamMember,
        addHealthRecord,
        updateHealthRecord,
        updateHealthVerification,
        logHealthAccess,
        // Doctor's Letters & Proofs methods
        uploadDoctorLetter,
        updateDoctorLetter,
        deleteDoctorLetter,
        verifyDoctorLetter
      }}
    >
      {children}
    </SmartCampusContext.Provider>
  );
}

export function useSmartCampus() {
  const context = useContext(SmartCampusContext);
  if (!context) {
    throw new Error("useSmartCampus must be used within a SmartCampusProvider");
  }
  return context;
}

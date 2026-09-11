import React, { createContext, useContext, useState, useEffect } from "react";
import {
  INITIAL_USERS,
  DEPARTMENTS,
  SUBJECTS,
  INITIAL_TIMETABLES,
  INITIAL_TIMETABLE_TODAY,
  INITIAL_ATTENDANCE,
  INITIAL_ATTENDANCE_LOGS,
  INITIAL_MARKS,
  INITIAL_ASSIGNMENTS,
  INITIAL_NOTICES,
  INITIAL_EXAMS,
  INITIAL_LEAVES,
  INITIAL_COMPLAINTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_AUDIT_LOGS,
  INITIAL_SYSTEM_SETTINGS
} from "../data/initialData";

const SmartCampusContext = createContext();

const STORAGE_KEY = "smart_campus_erp_state_v1";

export function SmartCampusProvider({ children }) {
  // Load state from localStorage or fallback to seeds
  const [state, setState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Ensure subjects contains the full 8-semester library if the saved subjects were from older minimal seed
        let mergedSubjects = parsed.subjects || SUBJECTS;
        if (Array.isArray(mergedSubjects) && mergedSubjects.length <= 5) {
          const existingIds = new Set(mergedSubjects.map((s) => s.id));
          const missing = SUBJECTS.filter((s) => !existingIds.has(s.id));
          mergedSubjects = [...mergedSubjects, ...missing];
        }

        return {
          users: parsed.users || INITIAL_USERS,
          departments: parsed.departments || DEPARTMENTS,
          subjects: mergedSubjects,
          timetables: parsed.timetables && parsed.timetables.length > 0 ? parsed.timetables : INITIAL_TIMETABLES,
          timetableToday: parsed.timetableToday || INITIAL_TIMETABLE_TODAY,
          attendance: parsed.attendance || INITIAL_ATTENDANCE,
          attendanceLogs: parsed.attendanceLogs || INITIAL_ATTENDANCE_LOGS,
          marks: parsed.marks || INITIAL_MARKS,
          assignments: parsed.assignments || INITIAL_ASSIGNMENTS,
          notices: parsed.notices || INITIAL_NOTICES,
          exams: parsed.exams || INITIAL_EXAMS,
          leaves: parsed.leaves || INITIAL_LEAVES,
          complaints: parsed.complaints || INITIAL_COMPLAINTS,
          notifications: parsed.notifications || INITIAL_NOTIFICATIONS,
          auditLogs: parsed.auditLogs || INITIAL_AUDIT_LOGS,
          systemSettings: parsed.systemSettings || INITIAL_SYSTEM_SETTINGS,
          currentUser: parsed.currentUser || INITIAL_USERS[0], // Default logged-in as Rahul Patil (Student)
          activeRole: parsed.activeRole || "student",
          demoStep: parsed.demoStep ?? 0
        };
      }
    } catch (e) {
      console.warn("Failed to load state from localStorage:", e);
    }
    return {
      users: INITIAL_USERS,
      departments: DEPARTMENTS,
      subjects: SUBJECTS,
      timetables: INITIAL_TIMETABLES,
      timetableToday: INITIAL_TIMETABLE_TODAY,
      attendance: INITIAL_ATTENDANCE,
      attendanceLogs: INITIAL_ATTENDANCE_LOGS,
      marks: INITIAL_MARKS,
      assignments: INITIAL_ASSIGNMENTS,
      notices: INITIAL_NOTICES,
      exams: INITIAL_EXAMS,
      leaves: INITIAL_LEAVES,
      complaints: INITIAL_COMPLAINTS,
      notifications: INITIAL_NOTIFICATIONS,
      auditLogs: INITIAL_AUDIT_LOGS,
      systemSettings: INITIAL_SYSTEM_SETTINGS,
      currentUser: INITIAL_USERS[0], // Default logged-in as Rahul Patil (Student)
      activeRole: "student",
      demoStep: 0 // 0 to 6 for the interactive guided demo
    };
  });

  const [toasts, setToasts] = useState([]);

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
    const targetUser = state.users.find((u) => u.id === userIdOrRole || u.role === userIdOrRole) || state.users[0];
    setState((prev) => ({
      ...prev,
      currentUser: targetUser,
      activeRole: targetUser.role
    }));
    addToast("Switched Persona", `Active profile: ${targetUser.name} (${targetUser.role.toUpperCase()})`, "info");
  };

  const login = (emailOrId, password, selectedRole) => {
    const user = state.users.find(
      (u) =>
        (u.email.toLowerCase() === emailOrId.toLowerCase() || u.id === emailOrId) &&
        (selectedRole ? u.role === selectedRole : true)
    );
    if (user) {
      setState((prev) => ({
        ...prev,
        currentUser: user,
        activeRole: user.role
      }));
      addToast("Login Successful", `Welcome back, ${user.name}!`, "success");
      return { success: true, user };
    }
    return { success: false, message: "Invalid credentials or role mismatch." };
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
  const markAttendance = ({ departmentId, semester, division, subjectId, lectureNum, statusMap, date = "2026-09-08", time = "10:00 AM" }) => {
    const subject = state.subjects.find((s) => s.id === subjectId) || { name: "Database Management Systems", code: "CE501" };
    const department = state.departments.find((d) => d.id === departmentId) || { name: "Computer Engineering" };

    const newAttendance = JSON.parse(JSON.stringify(state.attendance));
    const newLogs = [...state.attendanceLogs];
    const newNotifications = [...state.notifications];
    const absentStudents = [];
    const warningStudents = [];

    const nowFormattedDate = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
    const nowFormattedTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

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
      const newTotal = prev.total + 1;
      const newAttended = status === "Present" ? prev.attended + 1 : prev.attended;
      const newPct = Math.round((newAttended / newTotal) * 1000) / 10;

      newAttendance[studentId][subjectId] = {
        total: newTotal,
        attended: newAttended,
        percentage: newPct
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
        lectureNum: lectureNum || prev.total + 1,
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
          title: `⚠️ Attendance Alert: ${subject.name}`,
          message: `Attendance Alert: You were marked absent for ${subject.name} on ${date} (Lecture ${lectureNum || newTotal}).`,
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
            message: `Attendance Alert: Your ward ${student.name} was marked absent for ${subject.name} on ${date} (Lecture ${lectureNum || newTotal}).`,
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
          message: `Your current attendance in ${subject.name} is ${newPct}%, which is below the mandatory threshold of ${state.systemSettings.attendanceThreshold}%. Immediate improvement required.`,
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
  const submitMarks = ({ subjectId, examType, maxMarks, marksRecords, remarks = "" }) => {
    const subject = state.subjects.find((s) => s.id === subjectId) || { name: "Database Management Systems" };
    const newMarks = [...state.marks];
    const newNotifications = [...state.notifications];

    const nowFormattedDate = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
    const nowFormattedTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

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
        marksObtained: Number(rec.marksObtained),
        maxMarks: Number(maxMarks),
        date: nowFormattedDate,
        gradedBy: state.currentUser ? state.currentUser.name : "Prof. R. K. Patil",
        remarks: rec.remarks || remarks || "Exam score recorded."
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
      .filter((u) => u.role === "student" && u.departmentId === (subject.departmentId || "dept-ce"))
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

  const submitAssignment = (assignmentId, studentId, fileName) => {
    const student = state.users.find((u) => u.id === studentId) || state.currentUser;
    const nowStr = new Date().toLocaleDateString("en-GB") + " " + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    setState((prev) => {
      const updated = prev.assignments.map((asg) => {
        if (asg.id === assignmentId) {
          const subs = asg.submissions.filter((s) => s.studentId !== studentId);
          subs.push({
            studentId,
            studentName: student.name,
            status: "Submitted",
            submittedOn: nowStr,
            file: fileName || `${student.name.replace(/\s+/g, "_")}_Submission.pdf`,
            marks: null,
            feedback: null
          });
          return { ...asg, submissions: subs };
        }
        return asg;
      });

      const audit = logAudit("Submitted Assignment", `Student ${student.name} submitted for ${assignmentId}`, "Assignments");

      return {
        ...prev,
        assignments: updated,
        auditLogs: [audit, ...prev.auditLogs]
      };
    });

    addToast("Assignment Submitted", `Your work has been uploaded for teacher evaluation.`, "success");
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
      rollNo: student.rollNo || "CE-2024-042",
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
  // USER MANAGEMENT ENGINE (ADMIN EDIT/ADD/DELETE)
  // ==========================================
  const updateUser = (userId, updatedData) => {
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
      `Profile data for ${updatedData.name || "user"} has been updated across the ERP.`,
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
    const newId = prefix + Date.now();

    const newUser = {
      id: newId,
      avatar: userData.avatar || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
      password: userData.password || "password123",
      ...userData
    };

    setState((prev) => {
      const updatedUsers = [newUser, ...prev.users];

      if (newUser.role === "student" && newUser.parentId) {
        const pIdx = updatedUsers.findIndex((p) => p.id === newUser.parentId);
        if (pIdx !== -1) {
          updatedUsers[pIdx] = { ...updatedUsers[pIdx], studentId: newUser.id, studentName: newUser.name };
        }
      }

      const audit = logAudit(
        "Provisioned New User",
        `Created new ${newUser.role.toUpperCase()} account for ${newUser.name} (${newUser.email})`,
        "User Management"
      );

      return {
        ...prev,
        users: updatedUsers,
        auditLogs: [audit, ...prev.auditLogs]
      };
    });

    addToast("User Provisioned", `New ${userData.role.toUpperCase()} account created for ${userData.name}.`, "success");
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

    setState((prev) => {
      const updatedUsers = prev.users.filter((u) => u.id !== userId);
      const audit = logAudit(
        "Removed User Account",
        `Admin decommissioned user: ${userName} (${userRole.toUpperCase()})`,
        "User Management"
      );

      return {
        ...prev,
        users: updatedUsers,
        auditLogs: [audit, ...prev.auditLogs]
      };
    });

    addToast("User Removed", `Account for ${userName} has been removed from ERP.`, "warning");
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
        addTimetableSlot,
        updateTimetableSlot,
        deleteTimetableSlot,
        markNotificationRead,
        markAllNotificationsRead,
        queryAIAssistant,
        setDemoStep
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

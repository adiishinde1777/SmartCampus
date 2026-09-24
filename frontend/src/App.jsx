import React, { useState } from "react";
import { SmartCampusProvider, useSmartCampus } from "./context/SmartCampusContext";
import ToastContainer from "./components/common/ToastContainer";
import ErrorBoundary from "./components/common/ErrorBoundary";
import UnifiedNotifications from "./components/common/UnifiedNotifications";
import Sidebar from "./components/layout/Sidebar";
import TopNavbar from "./components/layout/TopNavbar";
import NotificationDrawer from "./components/layout/NotificationDrawer";
import MobileBottomNav from "./components/layout/MobileBottomNav";
import LoginPage from "./components/auth/LoginPage";

// Student Views
import StudentDashboard from "./components/student/StudentDashboard";
import StudentAttendance from "./components/student/StudentAttendance";
import StudentMarks from "./components/student/StudentMarks";
import StudentAssignments from "./components/student/StudentAssignments";
import StudentNotices from "./components/student/StudentNotices";
import StudentExamSchedule from "./components/student/StudentExamSchedule";
import StudentLeave from "./components/student/StudentLeave";
import StudentComplaints from "./components/student/StudentComplaints";
import StudentPerformance from "./components/student/StudentPerformance";
import StudentAIAssistant from "./components/student/StudentAIAssistant";
import StudentProfile from "./components/student/StudentProfile";
import StudentTimetable from "./components/student/StudentTimetable";
import StudentStudyMaterial from "./components/student/StudentStudyMaterial";
import StudentSkills from "./components/student/StudentSkills";
import StudentFacultyDirectory from "./components/student/StudentFacultyDirectory";

// Teacher Views
import TeacherDashboard from "./components/teacher/TeacherDashboard";
import TeacherTalentFinder from "./components/teacher/TeacherTalentFinder";
import TeacherAttendance from "./components/teacher/TeacherAttendance";
import TeacherMarks from "./components/teacher/TeacherMarks";
import TeacherAssignments from "./components/teacher/TeacherAssignments";
import TeacherNotices from "./components/teacher/TeacherNotices";
import TeacherLeaveRequests from "./components/teacher/TeacherLeaveRequests";
import TeacherClasses from "./components/teacher/TeacherClasses";
import TeacherPerformance from "./components/teacher/TeacherPerformance";
import TeacherReports from "./components/teacher/TeacherReports";
import TeacherProfile from "./components/teacher/TeacherProfile";
import TeacherMyClass from "./components/teacher/TeacherMyClass";
import TeacherMyTGBatch from "./components/teacher/TeacherMyTGBatch";
import TeacherStudyMaterial from "./components/teacher/TeacherStudyMaterial";

// Parent Views
import ParentDashboard from "./components/parent/ParentDashboard";
import ParentDoctorLetters from "./components/parent/ParentDoctorLetters";
import ParentHealthInfo from "./components/parent/ParentHealthInfo";
import ParentAttendance from "./components/parent/ParentAttendance";
import ParentMarks from "./components/parent/ParentMarks";
import ParentAssignments from "./components/parent/ParentAssignments";
import ParentNotifications from "./components/parent/ParentNotifications";
import ParentProfile from "./components/parent/ParentProfile";

// HOD Views
import HODDashboard from "./components/hod/HODDashboard";
import HODTalentEvents from "./components/hod/HODTalentEvents";
import HODStudents from "./components/hod/HODStudents";
import HODFaculty from "./components/hod/HODFaculty";
import HODComplaints from "./components/hod/HODComplaints";
import HODAnalytics from "./components/hod/HODAnalytics";
import HODMarks from "./components/hod/HODMarks";
import HODReports from "./components/hod/HODReports";
import HODProfile from "./components/hod/HODProfile";

// Principal Views
import PrincipalDashboard from "./components/principal/PrincipalDashboard";
import PrincipalTalentOverview from "./components/principal/PrincipalTalentOverview";
import PrincipalPlacementSkills from "./components/principal/PrincipalPlacementSkills";
import PrincipalCollegeOverview from "./components/principal/PrincipalCollegeOverview";
import { PrincipalAttendanceAnalytics, PrincipalAcademicAnalytics } from "./components/principal/PrincipalAnalyticsViews";
import PrincipalProfile from "./components/principal/PrincipalProfile";

// Admin Views
import { AdminDashboard, AdminAttendanceThreshold } from "./components/admin/AdminDashboardViews";
import { AdminUsers, AdminAuditLogs, AdminDepartments } from "./components/admin/AdminExtraViews";
import AdminTalentHealth from "./components/admin/AdminTalentHealth";
import AdminSubjects from "./components/admin/AdminSubjects";
import AdminTimetable from "./components/admin/AdminTimetable";
import AdminCommonCurriculum from "./components/admin/AdminCommonCurriculum";
import AdminClassTGManagement from "./components/admin/AdminClassTGManagement";

import StudentRegisterPage from "./components/auth/StudentRegisterPage";

function MainApp() {
  const { currentUser, activeRole, toasts, removeToast } = useSmartCampus();

  const [currentView, setCurrentView] = useState("dashboard");
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // If path is /register-student or has registration token, render registration page directly
  const isRegisterRoute = typeof window !== "undefined" && (
    window.location.pathname.includes("register-student") ||
    window.location.search.includes("token=")
  );

  if (isRegisterRoute) {
    return (
      <>
        <StudentRegisterPage onBackToLogin={() => { window.location.href = "/"; }} />
        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </>
    );
  }

  // If no user is logged in, show the login portal
  if (!currentUser || !activeRole) {
    return (
      <>
        <LoginPage />
        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </>
    );
  }

  // Render view based on active role and selected view
  const renderViewContent = () => {
    // 1. STUDENT VIEWS
    if (activeRole === "student") {
      switch (currentView) {
        case "dashboard": return <StudentDashboard onNavigate={setCurrentView} />;
        case "faculty": return <StudentFacultyDirectory onNavigate={setCurrentView} />;
        case "skills": return <StudentSkills onNavigate={setCurrentView} />;
        case "attendance": return <StudentAttendance onNavigate={setCurrentView} />;
        case "marks": return <StudentMarks onNavigate={setCurrentView} />;
        case "assignments": return <StudentAssignments onNavigate={setCurrentView} />;
        case "study-material": return <StudentStudyMaterial onNavigate={setCurrentView} />;
        case "timetable": return <StudentTimetable onNavigate={setCurrentView} />;
        case "notices": return <StudentNotices onNavigate={setCurrentView} />;
        case "exams": return <StudentExamSchedule onNavigate={setCurrentView} />;
        case "leave": return <StudentLeave onNavigate={setCurrentView} />;
        case "complaints": return <StudentComplaints onNavigate={setCurrentView} />;
        case "performance": return <StudentPerformance onNavigate={setCurrentView} />;
        case "notifications": return <UnifiedNotifications onNavigate={setCurrentView} />;
        case "ai-assistant": return <StudentDashboard onNavigate={setCurrentView} />;
        case "profile": return <StudentProfile onNavigate={setCurrentView} />;
        default: return <StudentDashboard onNavigate={setCurrentView} />;
      }
    }

    // 2. TEACHER VIEWS
    if (activeRole === "teacher") {
      switch (currentView) {
        case "dashboard": return <TeacherDashboard onNavigate={setCurrentView} />;
        case "talent-finder": return <TeacherTalentFinder onNavigate={setCurrentView} />;
        case "my-class": return <TeacherMyClass onNavigate={setCurrentView} />;
        case "my-tg-batch": return <TeacherMyTGBatch onNavigate={setCurrentView} />;
        case "teacher-study-material": return <TeacherStudyMaterial onNavigate={setCurrentView} />;
        case "classes": return <TeacherClasses onNavigate={setCurrentView} />;
        case "attendance": return <TeacherAttendance onNavigate={setCurrentView} />;
        case "marks": return <TeacherMarks onNavigate={setCurrentView} />;
        case "assignments": return <TeacherAssignments onNavigate={setCurrentView} />;
        case "notices": return <TeacherNotices onNavigate={setCurrentView} />;
        case "leaves": return <TeacherLeaveRequests onNavigate={setCurrentView} />;
        case "performance": return <TeacherPerformance onNavigate={setCurrentView} />;
        case "reports": return <TeacherReports onNavigate={setCurrentView} />;
        case "notifications": return <UnifiedNotifications onNavigate={setCurrentView} />;
        case "profile": return <TeacherProfile onNavigate={setCurrentView} />;
        default: return <TeacherDashboard onNavigate={setCurrentView} />;
      }
    }

    // 3. PARENT VIEWS
    if (activeRole === "parent") {
      switch (currentView) {
        case "dashboard": return <ParentDashboard onNavigate={setCurrentView} />;
        case "doctor-letters": return <ParentDoctorLetters onNavigate={setCurrentView} />;
        case "health-info": return <ParentHealthInfo onNavigate={setCurrentView} />;
        case "attendance": return <ParentAttendance onNavigate={setCurrentView} />;
        case "marks": return <ParentMarks onNavigate={setCurrentView} />;
        case "assignments": return <ParentAssignments onNavigate={setCurrentView} />;
        case "notices": return <StudentNotices onNavigate={setCurrentView} />;
        case "academic-status": return <StudentPerformance onNavigate={setCurrentView} />;
        case "notifications": return <ParentNotifications onNavigate={setCurrentView} />;
        case "profile": return <ParentProfile onNavigate={setCurrentView} />;
        default: return <ParentDashboard onNavigate={setCurrentView} />;
      }
    }

    // 4. HOD VIEWS
    if (activeRole === "hod") {
      switch (currentView) {
        case "dashboard": return <HODDashboard onNavigate={setCurrentView} />;
        case "department-talent": return <HODTalentEvents onNavigate={setCurrentView} />;
        case "students": return <HODStudents onNavigate={setCurrentView} />;
        case "faculty": return <HODFaculty onNavigate={setCurrentView} />;
        case "attendance": return <HODReports onNavigate={setCurrentView} />;
        case "marks": return <HODMarks onNavigate={setCurrentView} />;
        case "assignments": return <TeacherAssignments onNavigate={setCurrentView} />;
        case "complaints": return <HODComplaints onNavigate={setCurrentView} />;
        case "notices": return <TeacherNotices onNavigate={setCurrentView} />;
        case "analytics": return <HODAnalytics onNavigate={setCurrentView} />;
        case "reports": return <HODReports onNavigate={setCurrentView} />;
        case "notifications": return <UnifiedNotifications onNavigate={setCurrentView} />;
        case "profile": return <HODProfile onNavigate={setCurrentView} />;
        default: return <HODDashboard onNavigate={setCurrentView} />;
      }
    }

    // 5. PRINCIPAL VIEWS
    if (activeRole === "principal") {
      switch (currentView) {
        case "dashboard": return <PrincipalDashboard onNavigate={setCurrentView} />;
        case "placement-skills": return <PrincipalPlacementSkills onNavigate={setCurrentView} />;
        case "college-talent": return <PrincipalTalentOverview onNavigate={setCurrentView} />;
        case "departments": return <PrincipalCollegeOverview onNavigate={setCurrentView} />;
        case "attendance-analytics": return <PrincipalAttendanceAnalytics onNavigate={setCurrentView} />;
        case "academic-analytics": return <PrincipalAcademicAnalytics onNavigate={setCurrentView} />;
        case "complaints": return <HODComplaints onNavigate={setCurrentView} />;
        case "notices": return <StudentNotices onNavigate={setCurrentView} />;
        case "reports": return <TeacherReports onNavigate={setCurrentView} />;
        case "drilldown": return <PrincipalCollegeOverview onNavigate={setCurrentView} />;
        case "notifications": return <UnifiedNotifications onNavigate={setCurrentView} />;
        case "profile": return <PrincipalProfile onNavigate={setCurrentView} />;
        default: return <PrincipalDashboard onNavigate={setCurrentView} />;
      }
    }

    // 6. ADMIN VIEWS
    if (activeRole === "admin") {
      switch (currentView) {
        case "dashboard": return <AdminDashboard onNavigate={setCurrentView} />;
        case "talent-admin": return <AdminTalentHealth onNavigate={setCurrentView} />;
        case "class-tg-management": return <AdminClassTGManagement onNavigate={setCurrentView} />;
        case "users": return <AdminUsers onNavigate={setCurrentView} />;
        case "departments": return <AdminDepartments onNavigate={setCurrentView} />;
        case "common-curriculum": return <AdminCommonCurriculum onNavigate={setCurrentView} />;
        case "subjects": return <AdminSubjects onNavigate={setCurrentView} />;
        case "timetable": return <AdminTimetable onNavigate={setCurrentView} />;
        case "threshold": return <AdminAttendanceThreshold onNavigate={setCurrentView} />;
        case "notices": return <TeacherNotices onNavigate={setCurrentView} />;
        case "complaints": return <HODComplaints onNavigate={setCurrentView} />;
        case "audit-logs": return <AdminAuditLogs onNavigate={setCurrentView} />;
        case "settings": return <AdminAttendanceThreshold onNavigate={setCurrentView} />;
        case "notifications": return <UnifiedNotifications onNavigate={setCurrentView} />;
        case "profile": return <HODProfile onNavigate={setCurrentView} />;
        default: return <AdminDashboard onNavigate={setCurrentView} />;
      }
    }

    return <StudentDashboard onNavigate={setCurrentView} />;
  };

  return (
    <div className="app-container">
      {/* Mobile Drawer Overlay Backdrop */}
      {isMobileOpen && (
        <div
          className="mobile-overlay-backdrop"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <Sidebar
        currentView={currentView}
        setCurrentView={(view) => {
          setCurrentView(view);
          setIsMobileOpen(false);
        }}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* Main Content Area */}
      <div className="main-content-wrapper">
        {/* Top Navbar */}
        <TopNavbar
          currentView={currentView}
          onNavigate={setCurrentView}
          onToggleMobile={() => setIsMobileOpen(!isMobileOpen)}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
        />

        {/* Page Content Body */}
        <main className="page-body">
          <ErrorBoundary>
            {renderViewContent()}
          </ErrorBoundary>
        </main>
      </div>

      {/* Mobile Sticky Bottom Navigation Bar */}
      <MobileBottomNav
        currentView={currentView}
        onNavigate={(view) => {
          setCurrentView(view);
          setIsMobileOpen(false);
        }}
        onToggleMobile={() => setIsMobileOpen(!isMobileOpen)}
      />

      {/* Slide-over Notification Drawer */}
      <NotificationDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />

      {/* Real-time Toast Alerts */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}

export default function App() {
  return (
    <SmartCampusProvider>
      <MainApp />
    </SmartCampusProvider>
  );
}

import React, { useState } from "react";
import { SmartCampusProvider, useSmartCampus } from "./context/SmartCampusContext";
import DemoScenarioBar from "./components/common/DemoScenarioBar";
import ToastContainer from "./components/common/ToastContainer";
import Sidebar from "./components/layout/Sidebar";
import TopNavbar from "./components/layout/TopNavbar";
import NotificationDrawer from "./components/layout/NotificationDrawer";
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

// Teacher Views
import TeacherDashboard from "./components/teacher/TeacherDashboard";
import TeacherAttendance from "./components/teacher/TeacherAttendance";
import TeacherMarks from "./components/teacher/TeacherMarks";
import TeacherAssignments from "./components/teacher/TeacherAssignments";
import TeacherNotices from "./components/teacher/TeacherNotices";
import TeacherLeaveRequests from "./components/teacher/TeacherLeaveRequests";
import TeacherClasses from "./components/teacher/TeacherClasses";
import TeacherPerformance from "./components/teacher/TeacherPerformance";
import TeacherReports from "./components/teacher/TeacherReports";
import TeacherProfile from "./components/teacher/TeacherProfile";

// Parent Views
import ParentDashboard from "./components/parent/ParentDashboard";
import ParentAttendance from "./components/parent/ParentAttendance";
import ParentMarks from "./components/parent/ParentMarks";
import ParentAssignments from "./components/parent/ParentAssignments";
import ParentNotifications from "./components/parent/ParentNotifications";
import ParentProfile from "./components/parent/ParentProfile";

// HOD Views
import HODDashboard from "./components/hod/HODDashboard";
import HODStudents from "./components/hod/HODStudents";
import HODFaculty from "./components/hod/HODFaculty";
import HODComplaints from "./components/hod/HODComplaints";
import HODAnalytics from "./components/hod/HODAnalytics";
import HODProfile from "./components/hod/HODProfile";

// Principal Views
import PrincipalDashboard from "./components/principal/PrincipalDashboard";
import PrincipalCollegeOverview from "./components/principal/PrincipalCollegeOverview";
import { PrincipalAttendanceAnalytics, PrincipalAcademicAnalytics } from "./components/principal/PrincipalAnalyticsViews";
import PrincipalProfile from "./components/principal/PrincipalProfile";

// Admin Views
import { AdminDashboard, AdminAttendanceThreshold } from "./components/admin/AdminDashboardViews";
import { AdminUsers, AdminAuditLogs, AdminDepartments } from "./components/admin/AdminExtraViews";
import AdminSubjects from "./components/admin/AdminSubjects";
import AdminTimetable from "./components/admin/AdminTimetable";

function MainApp() {
  const { currentUser, activeRole, toasts, removeToast } = useSmartCampus();

  const [currentView, setCurrentView] = useState("dashboard");
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

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
        case "attendance": return <StudentAttendance />;
        case "marks": return <StudentMarks />;
        case "assignments": return <StudentAssignments />;
        case "notices": return <StudentNotices />;
        case "exams": return <StudentExamSchedule />;
        case "leave": return <StudentLeave />;
        case "complaints": return <StudentComplaints />;
        case "performance": return <StudentPerformance />;
        case "notifications": return <StudentAttendance />;
        case "ai-assistant": return <StudentAIAssistant />;
        case "profile": return <StudentProfile />;
        default: return <StudentDashboard onNavigate={setCurrentView} />;
      }
    }

    // 2. TEACHER VIEWS
    if (activeRole === "teacher") {
      switch (currentView) {
        case "dashboard": return <TeacherDashboard onNavigate={setCurrentView} />;
        case "classes": return <TeacherClasses onNavigate={setCurrentView} />;
        case "attendance": return <TeacherAttendance />;
        case "marks": return <TeacherMarks />;
        case "assignments": return <TeacherAssignments />;
        case "notices": return <TeacherNotices />;
        case "leaves": return <TeacherLeaveRequests />;
        case "performance": return <TeacherPerformance />;
        case "reports": return <TeacherReports />;
        case "profile": return <TeacherProfile />;
        default: return <TeacherDashboard onNavigate={setCurrentView} />;
      }
    }

    // 3. PARENT VIEWS
    if (activeRole === "parent") {
      switch (currentView) {
        case "dashboard": return <ParentDashboard onNavigate={setCurrentView} />;
        case "attendance": return <ParentAttendance />;
        case "marks": return <ParentMarks />;
        case "assignments": return <ParentAssignments />;
        case "notices": return <StudentNotices />;
        case "academic-status": return <StudentPerformance />;
        case "notifications": return <ParentNotifications />;
        case "profile": return <ParentProfile />;
        default: return <ParentDashboard onNavigate={setCurrentView} />;
      }
    }

    // 4. HOD VIEWS
    if (activeRole === "hod") {
      switch (currentView) {
        case "dashboard": return <HODDashboard onNavigate={setCurrentView} />;
        case "students": return <HODStudents />;
        case "faculty": return <HODFaculty />;
        case "attendance": return <HODDashboard onNavigate={setCurrentView} />;
        case "marks": return <TeacherPerformance />;
        case "assignments": return <TeacherAssignments />;
        case "complaints": return <HODComplaints />;
        case "notices": return <TeacherNotices />;
        case "analytics": return <HODAnalytics />;
        case "reports": return <TeacherReports />;
        case "profile": return <HODProfile />;
        default: return <HODDashboard onNavigate={setCurrentView} />;
      }
    }

    // 5. PRINCIPAL VIEWS
    if (activeRole === "principal") {
      switch (currentView) {
        case "dashboard": return <PrincipalDashboard onNavigate={setCurrentView} />;
        case "departments": return <PrincipalDashboard onNavigate={setCurrentView} />;
        case "attendance-analytics": return <PrincipalAttendanceAnalytics />;
        case "academic-analytics": return <PrincipalAcademicAnalytics />;
        case "complaints": return <HODComplaints />;
        case "notices": return <StudentNotices />;
        case "reports": return <TeacherReports />;
        case "drilldown": return <PrincipalCollegeOverview />;
        case "profile": return <PrincipalProfile />;
        default: return <PrincipalDashboard onNavigate={setCurrentView} />;
      }
    }

    // 6. ADMIN VIEWS
    if (activeRole === "admin") {
      switch (currentView) {
        case "dashboard": return <AdminDashboard onNavigate={setCurrentView} />;
        case "users": return <AdminUsers />;
        case "departments": return <AdminDepartments />;
        case "subjects": return <AdminSubjects />;
        case "timetable": return <AdminTimetable />;
        case "threshold": return <AdminAttendanceThreshold />;
        case "notices": return <TeacherNotices />;
        case "complaints": return <HODComplaints />;
        case "audit-logs": return <AdminAuditLogs />;
        case "settings": return <AdminAttendanceThreshold />;
        case "profile": return <HODProfile />;
        default: return <AdminDashboard onNavigate={setCurrentView} />;
      }
    }

    return <StudentDashboard onNavigate={setCurrentView} />;
  };

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <Sidebar
        currentView={currentView}
        setCurrentView={setCurrentView}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* Main Content Area */}
      <div className="main-content-wrapper">
        {/* Top Floating Demo Scenario Stepper */}
        <DemoScenarioBar />

        {/* Top Navbar */}
        <TopNavbar
          currentView={currentView}
          onToggleMobile={() => setIsMobileOpen(!isMobileOpen)}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
        />

        {/* Page Content Body */}
        <main className="page-body">
          {renderViewContent()}
        </main>
      </div>

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

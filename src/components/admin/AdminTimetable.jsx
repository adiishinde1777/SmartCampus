import React, { useState } from "react";
import { useSmartCampus } from "../../context/SmartCampusContext";
import {
  CalendarDays,
  Clock,
  PlusCircle,
  Edit,
  Trash2,
  Filter,
  Building2,
  GraduationCap,
  Layers,
  MapPin,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  Download,
  Calendar,
  Sparkles,
  BookOpen
} from "lucide-react";
import { Badge, Modal, StatCard } from "../common/UIPrimitives";

export default function AdminTimetable() {
  const {
    timetables,
    subjects,
    departments,
    users,
    addTimetableSlot,
    updateTimetableSlot,
    deleteTimetableSlot
  } = useSmartCampus();

  // Filters for which timetable we are viewing/editing
  const [selectedDept, setSelectedDept] = useState("dept-vlsi");
  const [selectedSem, setSelectedSem] = useState(5);
  const [selectedDiv, setSelectedDiv] = useState("A");
  const [selectedDayTab, setSelectedDayTab] = useState("all"); // "all" | "Monday" | ... | "Saturday"

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  const [deletingSlot, setDeletingSlot] = useState(null);

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const standardTimeSlots = [
    "10:00 AM - 11:15 AM",
    "11:15 AM - 12:15 PM",
    "12:15 PM - 01:00 PM",
    "01:00 PM - 02:00 PM",
    "02:00 PM - 03:00 PM",
    "03:00 PM - 03:15 PM",
    "03:15 PM - 04:15 PM",
    "04:15 PM - 05:15 PM"
  ];

  const teachers = users.filter((u) => u.role === "teacher");

  // Get available subjects for the chosen Department and Semester
  const availableSubjects = subjects.filter(
    (s) => s.departmentId === selectedDept && s.semester === Number(selectedSem)
  );

  // Filtered timetable slots for the selected Department + Semester + Division
  const activeTimetableSlots = (timetables || []).filter(
    (t) =>
      t.departmentId === selectedDept &&
      t.semester === Number(selectedSem) &&
      t.division === selectedDiv
  );

  // Form State
  const [formData, setFormData] = useState({
    day: "Monday",
    time: "10:00 AM - 11:15 AM",
    subjectId: "",
    teacherId: "tea-1",
    room: "Classroom A-209",
    type: "Theory"
  });

  const handleOpenAdd = (presetDay = null) => {
    const defaultSub = availableSubjects[0] || subjects[0] || { id: "sub-vlsi501", teacherId: "tea-1" };
    const defaultTeacher = teachers.find((t) => t.id === defaultSub.teacherId) || teachers[0];

    setFormData({
      day: presetDay || (selectedDayTab !== "all" ? selectedDayTab : "Monday"),
      time: "10:00 AM - 11:15 AM",
      subjectId: defaultSub.id,
      teacherId: defaultTeacher ? defaultTeacher.id : "tea-1",
      room: "Classroom A-209",
      type: defaultSub.type === "Lab" ? "Lab" : "Theory"
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (slot) => {
    setEditingSlot(slot);
    setFormData({
      day: slot.day,
      time: slot.time,
      subjectId: slot.subjectId,
      teacherId: slot.teacherId || "tea-1",
      room: slot.room,
      type: slot.type || "Theory"
    });
  };

  const handleSubjectChange = (subId) => {
    const sub = subjects.find((s) => s.id === subId);
    if (sub) {
      setFormData((prev) => ({
        ...prev,
        subjectId: subId,
        teacherId: sub.teacherId || prev.teacherId,
        type: sub.type === "Lab" ? "Lab" : "Theory"
      }));
    } else {
      setFormData((prev) => ({ ...prev, subjectId: subId }));
    }
  };

  const handleSaveAdd = (e) => {
    e.preventDefault();
    const sub = subjects.find((s) => s.id === formData.subjectId) || { name: "Subject", code: "SUB" };
    const teacher = teachers.find((t) => t.id === formData.teacherId) || { name: "Faculty" };

    addTimetableSlot({
      departmentId: selectedDept,
      semester: Number(selectedSem),
      division: selectedDiv,
      day: formData.day,
      time: formData.time,
      subjectId: formData.subjectId,
      subjectName: sub.name,
      subjectCode: sub.code,
      teacherId: teacher.id,
      teacherName: teacher.name,
      room: formData.room,
      type: formData.type
    });
    setIsAddModalOpen(false);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editingSlot) return;

    const sub = subjects.find((s) => s.id === formData.subjectId) || { name: editingSlot.subjectName, code: editingSlot.subjectCode };
    const teacher = teachers.find((t) => t.id === formData.teacherId) || { name: editingSlot.teacherName };

    updateTimetableSlot(editingSlot.id, {
      day: formData.day,
      time: formData.time,
      subjectId: formData.subjectId,
      subjectName: sub.name,
      subjectCode: sub.code,
      teacherId: teacher.id,
      teacherName: teacher.name,
      room: formData.room,
      type: formData.type
    });
    setEditingSlot(null);
  };

  const handleConfirmDelete = () => {
    if (deletingSlot) {
      deleteTimetableSlot(deletingSlot.id);
      setDeletingSlot(null);
    }
  };

  const activeDeptObj = departments.find((d) => d.id === selectedDept);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Top Banner */}
      <div
        style={{
          background: "linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)",
          borderRadius: "16px",
          padding: "24px 32px",
          color: "white",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
          boxShadow: "0 10px 25px -5px rgba(30, 27, 75, 0.4)"
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
            <span
              style={{
                fontSize: "0.75rem",
                background: "rgba(139, 92, 246, 0.2)",
                color: "#c084fc",
                border: "1px solid rgba(192, 132, 252, 0.3)",
                padding: "3px 10px",
                borderRadius: "20px",
                fontWeight: "700",
                letterSpacing: "0.03em"
              }}
            >
              INSTITUTION TIMETABLE MASTER
            </span>
          </div>
          <h2 style={{ fontSize: "1.75rem", fontWeight: "800", color: "white" }}>
            Timetable & Class Schedule Master
          </h2>
          <p style={{ fontSize: "0.9rem", color: "#cbd5e1", marginTop: "4px" }}>
            Configure and customize individual lecture timetables for each Department, Semester (1 to 8), and Division.
          </p>
        </div>

        <button
          onClick={() => handleOpenAdd()}
          className="btn btn-primary btn-lg"
          style={{
            background: "linear-gradient(135deg, #8b5cf6, #6d28d9)",
            boxShadow: "0 4px 14px rgba(139, 92, 246, 0.4)",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px"
          }}
        >
          <PlusCircle size={18} />
          <span>Add Lecture Slot</span>
        </button>
      </div>

      {/* Class Schedule Selector Toolbar */}
      <div className="card" style={{ padding: "20px 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
          {/* Department Selector */}
          <div>
            <label className="form-label" style={{ fontWeight: "700" }}>
              🏢 Department:
            </label>
            <select
              className="form-control"
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
            >
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.code})
                </option>
              ))}
            </select>
          </div>

          {/* Semester Selector */}
          <div>
            <label className="form-label" style={{ fontWeight: "700" }}>
              🎓 Semester (1 to 8):
            </label>
            <select
              className="form-control"
              value={selectedSem}
              onChange={(e) => setSelectedSem(Number(e.target.value))}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                <option key={s} value={s}>
                  Semester {s} ({s <= 2 ? "1st Yr" : s <= 4 ? "2nd Yr" : s <= 6 ? "3rd Yr" : "4th Yr"})
                </option>
              ))}
            </select>
          </div>

          {/* Division Selector */}
          <div>
            <label className="form-label" style={{ fontWeight: "700" }}>
              👥 Class Division:
            </label>
            <select
              className="form-control"
              value={selectedDiv}
              onChange={(e) => setSelectedDiv(e.target.value)}
            >
              <option value="A">Division A</option>
              <option value="B">Division B</option>
              <option value="C">Division C</option>
            </select>
          </div>
        </div>

        {/* Selected Class Highlight Status */}
        <div
          style={{
            marginTop: "16px",
            padding: "12px 16px",
            borderRadius: "10px",
            background: "var(--bg-surface-secondary)",
            border: "1px solid var(--border-subtle)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "10px"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <CalendarDays size={18} color="var(--primary-600)" />
            <span style={{ fontWeight: "700", color: "var(--text-main)" }}>
              Active Timetable: {activeDeptObj?.name} • Semester {selectedSem} • Division {selectedDiv}
            </span>
          </div>

          <div style={{ display: "flex", gap: "8px" }}>
            <Badge variant="primary">{activeTimetableSlots.length} Total Slots</Badge>
            <Badge variant="info">{availableSubjects.length} Registered Courses</Badge>
          </div>
        </div>
      </div>

      {/* Day Selector Tabs */}
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        <button
          onClick={() => setSelectedDayTab("all")}
          className={`btn btn-sm ${selectedDayTab === "all" ? "btn-primary" : "btn-secondary"}`}
          style={{ borderRadius: "20px", padding: "6px 16px" }}
        >
          Weekly Matrix (All Days)
        </button>
        {daysOfWeek.map((day) => {
          const daySlotsCount = activeTimetableSlots.filter((t) => t.day === day).length;
          return (
            <button
              key={day}
              onClick={() => setSelectedDayTab(day)}
              className={`btn btn-sm ${selectedDayTab === day ? "btn-primary" : "btn-secondary"}`}
              style={{
                borderRadius: "20px",
                padding: "6px 16px",
                border: selectedDayTab === day ? undefined : "1px solid var(--border-subtle)"
              }}
            >
              {day} ({daySlotsCount})
            </button>
          );
        })}
      </div>

      {/* Timetable Weekly Columns / Schedule View */}
      {selectedDayTab === "all" ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px" }}>
          {daysOfWeek.map((day) => {
            const daySlots = activeTimetableSlots
              .filter((t) => t.day === day)
              .sort((a, b) => a.time.localeCompare(b.time));

            return (
              <div key={day} className="card" style={{ display: "flex", flexDirection: "column", gap: "12px", borderTop: "4px solid var(--primary-600)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <Calendar size={16} color="var(--primary-600)" />
                    <h3 style={{ fontSize: "1.1rem", fontWeight: "800" }}>{day}</h3>
                  </div>
                  <button
                    onClick={() => handleOpenAdd(day)}
                    className="btn btn-sm btn-secondary"
                    style={{ fontSize: "0.75rem", padding: "3px 8px" }}
                  >
                    + Add Slot
                  </button>
                </div>

                {daySlots.length === 0 ? (
                  <div
                    style={{
                      padding: "24px",
                      textAlign: "center",
                      color: "var(--text-muted)",
                      background: "var(--bg-surface-secondary)",
                      borderRadius: "8px",
                      fontSize: "0.85rem"
                    }}
                  >
                    No lectures scheduled for {day}.
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {daySlots.map((slot) => (
                      <div
                        key={slot.id}
                        style={{
                          padding: "12px",
                          borderRadius: "8px",
                          background: "var(--bg-surface-secondary)",
                          border: "1px solid var(--border-subtle)",
                          display: "flex",
                          flexDirection: "column",
                          gap: "6px"
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontSize: "0.8rem", fontWeight: "700", color: "var(--primary-600)" }}>
                            <Clock size={12} style={{ display: "inline", marginRight: "4px" }} />
                            {slot.time}
                          </span>
                          <Badge variant={slot.type === "Lab" ? "purple" : slot.type === "Tutorial" ? "warning" : "info"}>
                            {slot.type || "Theory"}
                          </Badge>
                        </div>

                        <div style={{ fontWeight: "700", fontSize: "0.95rem", color: "var(--text-main)" }}>
                          {slot.subjectName} ({slot.subjectCode})
                        </div>

                        <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "flex", justifyContent: "space-between" }}>
                          <span>👨‍🏫 {slot.teacherName}</span>
                          <span>📍 {slot.room}</span>
                        </div>

                        {/* Actions */}
                        <div style={{ display: "flex", justifyContent: "flex-end", gap: "6px", marginTop: "4px", paddingTop: "6px", borderTop: "1px dashed var(--border-subtle)" }}>
                          <button
                            onClick={() => handleOpenEdit(slot)}
                            className="btn btn-sm btn-secondary"
                            style={{ padding: "2px 8px", fontSize: "0.72rem" }}
                          >
                            <Edit size={11} /> Edit
                          </button>
                          <button
                            onClick={() => setDeletingSlot(slot)}
                            className="btn btn-sm btn-secondary"
                            style={{ padding: "2px 8px", fontSize: "0.72rem", color: "#ef4444" }}
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* Single Day Detailed View */
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">
                <CalendarDays size={18} color="var(--primary-600)" />
                {selectedDayTab} Schedule (Sem {selectedSem} - Div {selectedDiv})
              </div>
              <div className="card-subtitle">{activeDeptObj?.name}</div>
            </div>
            <button
              onClick={() => handleOpenAdd(selectedDayTab)}
              className="btn btn-primary btn-sm"
            >
              + Add Slot for {selectedDayTab}
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {activeTimetableSlots
              .filter((t) => t.day === selectedDayTab)
              .sort((a, b) => a.time.localeCompare(b.time))
              .map((slot) => (
                <div
                  key={slot.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "16px",
                    borderRadius: "10px",
                    background: "var(--bg-surface-secondary)",
                    border: "1px solid var(--border-subtle)",
                    flexWrap: "wrap",
                    gap: "12px"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <div
                      style={{
                        background: "var(--primary-100)",
                        color: "var(--primary-700)",
                        fontWeight: "800",
                        padding: "8px 12px",
                        borderRadius: "8px",
                        fontSize: "0.85rem",
                        minWidth: "160px",
                        textAlign: "center"
                      }}
                    >
                      {slot.time}
                    </div>

                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <h4 style={{ fontSize: "1.05rem", fontWeight: "700" }}>
                          {slot.subjectName}
                        </h4>
                        <span style={{ fontFamily: "monospace", fontSize: "0.8rem", color: "var(--text-muted)" }}>
                          ({slot.subjectCode})
                        </span>
                        <Badge variant={slot.type === "Lab" ? "purple" : "info"}>{slot.type || "Theory"}</Badge>
                      </div>
                      <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "4px" }}>
                        Faculty: <strong>{slot.teacherName}</strong> • Venue: <strong>{slot.room}</strong>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      onClick={() => handleOpenEdit(slot)}
                      className="btn btn-secondary btn-sm"
                    >
                      <Edit size={14} /> Edit Slot
                    </button>
                    <button
                      onClick={() => setDeletingSlot(slot)}
                      className="btn btn-secondary btn-sm"
                      style={{ color: "#ef4444" }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Add Slot Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={`Add Lecture Slot (Sem ${selectedSem} - Div ${selectedDiv})`}
      >
        <form onSubmit={handleSaveAdd} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <div>
              <label className="form-label">Day of Week *</label>
              <select
                className="form-control"
                value={formData.day}
                onChange={(e) => setFormData({ ...formData, day: e.target.value })}
              >
                {daysOfWeek.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="form-label">Time Slot *</label>
              <select
                className="form-control"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              >
                {standardTimeSlots.map((ts) => (
                  <option key={ts} value={ts}>
                    {ts}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="form-label">Course / Subject *</label>
            <select
              className="form-control"
              value={formData.subjectId}
              onChange={(e) => handleSubjectChange(e.target.value)}
              required
            >
              {availableSubjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.code}) - {s.type}
                </option>
              ))}
              {availableSubjects.length === 0 && (
                <option value="">No subjects found for this semester. Add subjects in Subject Master first.</option>
              )}
            </select>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <div>
              <label className="form-label">Assigned Teacher *</label>
              <select
                className="form-control"
                value={formData.teacherId}
                onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
              >
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.departmentName})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="form-label">Slot Type *</label>
              <select
                className="form-control"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="Theory">Theory Lecture</option>
                <option value="Lab">Practical / Lab Session</option>
                <option value="Tutorial">Tutorial</option>
                <option value="Seminar">Seminar</option>
              </select>
            </div>
          </div>

          <div>
            <label className="form-label">Classroom / Laboratory Venue *</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Room B-204, Computer Lab 3, Workshop 1"
              value={formData.room}
              onChange={(e) => setFormData({ ...formData, room: e.target.value })}
              required
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "12px" }}>
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Slot to Timetable
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Slot Modal */}
      <Modal
        isOpen={Boolean(editingSlot)}
        onClose={() => setEditingSlot(null)}
        title="Edit Lecture Slot"
      >
        <form onSubmit={handleSaveEdit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <div>
              <label className="form-label">Day of Week *</label>
              <select
                className="form-control"
                value={formData.day}
                onChange={(e) => setFormData({ ...formData, day: e.target.value })}
              >
                {daysOfWeek.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="form-label">Time Slot *</label>
              <select
                className="form-control"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              >
                {standardTimeSlots.map((ts) => (
                  <option key={ts} value={ts}>
                    {ts}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="form-label">Subject *</label>
            <select
              className="form-control"
              value={formData.subjectId}
              onChange={(e) => handleSubjectChange(e.target.value)}
              required
            >
              {availableSubjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.code}) - {s.type}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <div>
              <label className="form-label">Assigned Teacher *</label>
              <select
                className="form-control"
                value={formData.teacherId}
                onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
              >
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.departmentName})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="form-label">Slot Type *</label>
              <select
                className="form-control"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="Theory">Theory Lecture</option>
                <option value="Lab">Practical / Lab Session</option>
                <option value="Tutorial">Tutorial</option>
                <option value="Seminar">Seminar</option>
              </select>
            </div>
          </div>

          <div>
            <label className="form-label">Room / Lab Venue *</label>
            <input
              type="text"
              className="form-control"
              value={formData.room}
              onChange={(e) => setFormData({ ...formData, room: e.target.value })}
              required
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "12px" }}>
            <button
              type="button"
              onClick={() => setEditingSlot(null)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Update Slot
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Slot Confirmation Modal */}
      <Modal
        isOpen={Boolean(deletingSlot)}
        onClose={() => setDeletingSlot(null)}
        title="Confirm Delete Lecture Slot"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <p style={{ color: "var(--text-main)" }}>
            Are you sure you want to remove the lecture slot for <strong>{deletingSlot?.subjectName}</strong> on{" "}
            <strong>{deletingSlot?.day} ({deletingSlot?.time})</strong>?
          </p>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
            <button
              onClick={() => setDeletingSlot(null)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmDelete}
              className="btn btn-sm btn-secondary"
              style={{ background: "#dc2626", color: "white", borderColor: "#dc2626" }}
            >
              Delete Slot
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

import React, { useState, useRef, useEffect } from "react";
import { useSmartCampus } from "../../context/SmartCampusContext";
import {
  Sparkles,
  Send,
  Bot,
  User,
  RotateCcw,
  Copy,
  Check,
  AlertTriangle,
  FileText,
  Users,
  BookOpen,
  ArrowRight
} from "lucide-react";
import { Badge } from "../common/UIPrimitives";

export default function TeacherAIAssistant({ onNavigate }) {
  const {
    currentUser,
    users = [],
    attendance = {},
    subjects = [],
    marks = [],
    systemSettings,
    createNotice,
    addToast
  } = useSmartCampus();

  const threshold = systemSettings?.attendanceThreshold || 75;
  const teacherDept = currentUser?.departmentName || "Electronic Engineering (VLSI Design And Technology)";
  const students = users.filter((u) => u.role === "student");

  // Calculate live defaulters
  const defaulterStudents = students.filter((stu) => {
    const sAtt = attendance[stu.id] || {};
    let totalL = 0;
    let attL = 0;
    Object.values(sAtt).forEach((sub) => {
      totalL += sub.total || 0;
      attL += sub.attended || 0;
    });
    const pct = totalL > 0 ? (attL / totalL) * 100 : 85; // default if not yet recorded
    return pct < threshold;
  });

  const [inputQuery, setInputQuery] = useState("");
  const [copiedId, setCopiedId] = useState(null);
  const [messages, setMessages] = useState([
    {
      id: "init-1",
      sender: "bot",
      text: `Namaskar Prof. ${currentUser?.name || "Faculty"}! 🙏\n\nI am your **SmartCampus AI Teaching Assistant & Academic Co-Pilot**.\n\nI have direct access to your department's attendance records, defaulter radar, student marks, and class rosters.\n\nHow can I help you today? Choose a quick action below or type any prompt:`,
      suggestions: [
        "Show all defaulter students below 75%",
        "Draft parent warning letter for low attendance",
        "Generate 5 Unit Test questions for VLSI / Electronics",
        "Create weekly lecture and lab lesson plan",
        "Suggest remedial measures for weak students"
      ]
    }
  ]);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    addToast("Copied to Clipboard", "Text copied successfully.", "success");
    setTimeout(() => setCopiedId(null), 2500);
  };

  const generateAIResponse = (query) => {
    const q = query.toLowerCase().trim();

    if (q.includes("defaulter") || q.includes("below 75") || q.includes("low attendance")) {
      if (defaulterStudents.length > 0) {
        const listStr = defaulterStudents
          .map((s) => `• **${s.name}** (Roll: ${s.rollNo || s.prn || "N/A"}) — Attendance critical under ${threshold}%`)
          .join("\n");
        return {
          response: `### 🚨 Department Defaulter Radar (Below ${threshold}% Attendance)\n\nFound **${defaulterStudents.length} student(s)** currently in the defaulter category:\n\n${listStr}\n\n**Recommended Faculty Actions:**\n1. Dispatch official SMS/WhatsApp absence warning to parents.\n2. Schedule a 1-on-1 counseling session before Unit Test 1.\n3. Verify medical certificates / doctor letters submitted by students.`,
          suggestions: [
            "Draft parent warning letter for low attendance",
            "Suggest remedial measures for weak students"
          ]
        };
      } else {
        return {
          response: `### ✅ Excellent Class Discipline!\n\nCurrently, all registered students in **${teacherDept}** have attendance above the mandatory **${threshold}%** cutoff.\n\nKeep maintaining regular attendance tracking after each lecture and practical.`,
          suggestions: [
            "Generate 5 Unit Test questions for VLSI / Electronics",
            "Create weekly lecture and lab lesson plan"
          ]
        };
      }
    }

    if (q.includes("parent warning") || q.includes("warning letter") || q.includes("sms") || q.includes("whatsapp")) {
      return {
        response: `### 📱 Official Absence Warning Template (Parents Communication)\n\n**English Version (SMS / WhatsApp):**\n\`\`\`text\nDear Parent, this is an official academic alert from CSMSS Chh. Shahu College of Engineering. Your ward's attendance in ${teacherDept} is currently below the mandatory ${threshold}% threshold required by university norms. Kindly ensure regular lecture attendance to avoid detention. Contact Class Teacher / HOD for details.\n\`\`\`\n\n**मराठी आवृत्ती (पालकांसाठी अधिकृत संदेश):**\n\`\`\`text\nआदरणीय पालक, CSMSS छत्रपती शाहू अभियांत्रिकी महाविद्यालयाकडून अधिकृत सूचना: आपल्या पाल्याची हजेरी विद्यापीठाच्या नियमानुसार आवश्यक असलेल्या ${threshold}% पेक्षा कमी आहे. परीक्षेसाठी पात्र राहण्यासाठी आपल्या पाल्यास दररोज वर्गात उपस्थित राहण्यास सांगावे. अधिक माहितीसाठी वर्गशिक्षक किंवा HOD यांच्याशी संपर्क साधावा.\n\`\`\``,
        suggestions: [
          "Show all defaulter students below 75%",
          "Create weekly lecture and lab lesson plan"
        ]
      };
    }

    if (q.includes("unit test") || q.includes("questions") || q.includes("exam")) {
      return {
        response: `### 📝 Recommended Unit Test 1 Question Paper Draft\n**Subject:** CMOS VLSI Design & Microelectronics\n**Total Marks:** 25 | **Time:** 1 Hour\n\n**Section A: Conceptual Knowledge (2 Marks each)**\n1. Explain the working principle of CMOS inverter with a neat transfer characteristic curve. (2M)\n2. Define Velocity Saturation and Channel Length Modulation in sub-micron MOSFETs. (2M)\n\n**Section B: Analytical & Design (5 Marks each)**\n3. Calculate noise margins ($V_{IL}, V_{IH}, V_{OL}, V_{OH}$) for a symmetric CMOS inverter. (5M)\n4. Draw stick diagram and Euler path layout for 2-input NAND gate. (5M)\n\n**Section C: Comprehensive Theory (8 Marks)**\n5. Compare static CMOS logic versus Dynamic CMOS logic with respect to power consumption, area footprint, and charge leakage. (8M)\n\n*(Feel free to copy and tweak the marks distribution for your class!)*`,
        suggestions: [
          "Create weekly lecture and lab lesson plan",
          "Suggest remedial measures for weak students"
        ]
      };
    }

    if (q.includes("lesson plan") || q.includes("lecture plan") || q.includes("syllabus")) {
      return {
        response: `### 📅 1-Week Teaching & Laboratory Lesson Plan\n**Department:** ${teacherDept}\n\n**Day 1 (Lecture 1):**\n• *Topic:* MOSFET Second-Order Effects (Body effect, drain-induced barrier lowering).\n• *Outcome:* Students will understand subthreshold conduction mechanisms.\n\n**Day 2 (Lecture 2):**\n• *Topic:* Resistive vs Active Load Inverter Design & DC Characteristics.\n• *Outcome:* Derive inverter threshold voltage $V_{th}$.\n\n**Day 3 (Practical / Hands-on Lab Session):**\n• *Experiment:* SPICE simulation of CMOS Inverter transient response and propagation delay ($t_{PLH}, t_{PHL}$).\n• *Deliverable:* Students submit simulation wave plots in Cadence/LTspice.\n\n**Day 4 (Remedial & Mentorship Slot):**\n• Numerical problem solving on dynamic power dissipation $P = C V^2 f$.`,
        suggestions: [
          "Generate 5 Unit Test questions for VLSI / Electronics",
          "Draft parent warning letter for low attendance"
        ]
      };
    }

    if (q.includes("remedial") || q.includes("weak") || q.includes("counseling")) {
      return {
        response: `### 🎯 Remedial Action Plan for Low-Scoring / Irregular Students\n\n1. **Peer Study Batches:** Pair students scoring below 40% with high-performing students during practical batches.\n2. **Question Bank Distribution:** Share previous 3 years' university question banks with solved answers via the Study Material portal.\n3. **Weekly 30-min Doubt Clearing Slot:** Announce an open query session every Friday after 4:00 PM in the Faculty Query Chat.\n4. **Continuous Assessment Bonus:** Award incremental marks for timely assignment submissions to boost student motivation.`,
        suggestions: [
          "Show all defaulter students below 75%",
          "Create weekly lecture and lab lesson plan"
        ]
      };
    }

    // Default intelligent response
    return {
      response: `Thank you Prof. ${currentUser?.name || "Faculty"}. Regarding **"${query}"**:\n\nBased on your active teaching assignments in **${teacherDept}**, you can track real-time attendance in the *Mark Attendance* module, inspect semester performance in *Student Performance*, or dispatch urgent notices using the *Publish Notices* dashboard.\n\nWould you like me to generate a circular, analyze attendance trends, or draft test questions for this?`,
      suggestions: [
        "Show all defaulter students below 75%",
        "Draft parent warning letter for low attendance",
        "Generate 5 Unit Test questions for VLSI / Electronics"
      ]
    };
  };

  const handleSend = (text) => {
    const queryToSend = text || inputQuery;
    if (!queryToSend.trim()) return;

    const userMsg = {
      id: "u-" + Date.now(),
      sender: "user",
      text: queryToSend
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery("");

    setTimeout(() => {
      const res = generateAIResponse(queryToSend);
      const botMsg = {
        id: "b-" + Date.now(),
        sender: "bot",
        text: res.response,
        suggestions: res.suggestions || []
      };
      setMessages((prev) => [...prev, botMsg]);
    }, 300);
  };

  const handleReset = () => {
    setMessages([
      {
        id: "init-reset",
        sender: "bot",
        text: `Conversation cleared! How can I assist you with your class, attendance tracking, or lecture planning today?`,
        suggestions: [
          "Show all defaulter students below 75%",
          "Draft parent warning letter for low attendance",
          "Generate 5 Unit Test questions for VLSI / Electronics"
        ]
      }
    ]);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", height: "calc(100vh - 160px)" }}>
      {/* Header Banner */}
      <div
        style={{
          background: "linear-gradient(135deg, #4338ca 0%, #312e81 60%, #1e1b4b 100%)",
          borderRadius: "16px",
          padding: "20px 24px",
          color: "white",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "14px",
          boxShadow: "0 10px 25px -5px rgba(49, 46, 129, 0.4)"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "14px",
              background: "linear-gradient(135deg, #a855f7, #6366f1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 20px rgba(168, 85, 247, 0.5)"
            }}
          >
            <Sparkles size={24} color="white" />
          </div>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(255,255,255,0.15)", padding: "2px 10px", borderRadius: "12px", fontSize: "0.72rem", fontWeight: "800", color: "#c7d2fe", marginBottom: "4px" }}>
              FACULTY AI CO-PILOT • DEFTER RADAR
            </div>
            <h2 style={{ fontSize: "1.45rem", fontWeight: "800", margin: 0, color: "#ffffff" }}>
              AI Teaching Assistant & Academic Co-Pilot
            </h2>
            <p style={{ margin: "2px 0 0 0", fontSize: "0.84rem", color: "#94a3b8" }}>
              Automated defaulter analysis, parent letter drafting, lesson plans, and exam question generation
            </p>
          </div>
        </div>

        <button onClick={handleReset} className="btn btn-secondary btn-sm" style={{ background: "rgba(255,255,255,0.15)", color: "white", border: "1px solid rgba(255,255,255,0.2)" }}>
          <RotateCcw size={14} /> Clear Chat
        </button>
      </div>

      {/* Chat Container */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          background: "white",
          borderRadius: "16px",
          border: "1px solid #e2e8f0",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          boxShadow: "0 4px 20px rgba(0,0,0,0.04)"
        }}
      >
        {/* Messages List */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
          {messages.map((m) => {
            const isMe = m.sender === "user";
            return (
              <div
                key={m.id}
                style={{
                  display: "flex",
                  gap: "12px",
                  alignSelf: isMe ? "flex-end" : "flex-start",
                  maxWidth: isMe ? "80%" : "88%",
                  flexDirection: isMe ? "row-reverse" : "row"
                }}
              >
                {/* Avatar */}
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    background: isMe ? "#4f46e5" : "linear-gradient(135deg, #7c3aed, #4338ca)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    flexShrink: 0
                  }}
                >
                  {isMe ? <User size={18} /> : <Bot size={18} />}
                </div>

                {/* Message Body */}
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <div
                    style={{
                      background: isMe ? "linear-gradient(135deg, #4f46e5, #4338ca)" : "#f8fafc",
                      color: isMe ? "white" : "#0f172a",
                      padding: "14px 18px",
                      borderRadius: isMe ? "16px 16px 2px 16px" : "16px 16px 16px 2px",
                      border: isMe ? "none" : "1px solid #e2e8f0",
                      fontSize: "0.92rem",
                      lineHeight: 1.6,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                      whiteSpace: "pre-line"
                    }}
                  >
                    {m.text}
                  </div>

                  {/* Actions / Copy button for bot message */}
                  {!isMe && (
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <button
                        onClick={() => handleCopy(m.id, m.text)}
                        style={{
                          background: "transparent",
                          border: "none",
                          fontSize: "0.74rem",
                          color: "#64748b",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          padding: "2px 6px"
                        }}
                      >
                        {copiedId === m.id ? <Check size={12} color="#16a34a" /> : <Copy size={12} />}
                        <span>{copiedId === m.id ? "Copied!" : "Copy text"}</span>
                      </button>
                    </div>
                  )}

                  {/* Suggestion Chips */}
                  {m.suggestions && m.suggestions.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "4px" }}>
                      {m.suggestions.map((s, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSend(s)}
                          style={{
                            background: "#ede9fe",
                            color: "#5b21b6",
                            border: "1px solid #ddd6fe",
                            borderRadius: "14px",
                            padding: "4px 12px",
                            fontSize: "0.76rem",
                            fontWeight: "700",
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                            transition: "all 0.15s ease"
                          }}
                        >
                          <span>{s}</span>
                          <ArrowRight size={11} />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          style={{
            padding: "14px 20px",
            borderTop: "1px solid #e2e8f0",
            display: "flex",
            gap: "10px",
            background: "#ffffff",
            alignItems: "center"
          }}
        >
          <input
            type="text"
            placeholder="Ask AI Assistant (e.g. 'Draft notice for Unit Test 1' or 'Show defaulters below 75%')..."
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            style={{
              flex: 1,
              padding: "12px 18px",
              borderRadius: "12px",
              border: "1.5px solid #cbd5e1",
              fontSize: "0.9rem",
              outline: "none"
            }}
          />

          <button
            type="submit"
            disabled={!inputQuery.trim()}
            className="btn btn-primary"
            style={{
              padding: "12px 22px",
              borderRadius: "12px",
              fontWeight: "700",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "linear-gradient(135deg, #7c3aed, #4f46e5)"
            }}
          >
            <Send size={16} />
            <span>Send</span>
          </button>
        </form>
      </div>
    </div>
  );
}

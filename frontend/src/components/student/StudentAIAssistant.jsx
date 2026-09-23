import React, { useState, useRef, useEffect } from "react";
import { useSmartCampus } from "../../context/SmartCampusContext";
import {
  Sparkles,
  Send,
  Bot,
  User,
  HelpCircle,
  ArrowRight,
  RotateCcw
} from "lucide-react";

export default function StudentAIAssistant() {
  const { queryAIAssistant, currentUser } = useSmartCampus();

  const [inputQuery, setInputQuery] = useState("");
  const [messages, setMessages] = useState([
    {
      id: "m-init",
      sender: "bot",
      text: `Hello ${currentUser?.name}! I am your **Smart Campus AI Academic Assistant**.\n\nI have real-time access to your attendance logs, marks, assignments, and timetable.\n\nAsk me anything about your academic standing or choose a quick prompt below:`,
      suggestions: [
        "Why am I getting an attendance warning?",
        "Which subject needs more attention?",
        "Show my recent marks",
        "What assignments are pending?",
        "What is my current attendance?"
      ]
    }
  ]);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (queryText) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim()) return;

    const userMsg = {
      id: "u-" + Date.now(),
      sender: "user",
      text: textToSend
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery("");

    // Query context assistant
    setTimeout(() => {
      const botResponse = queryAIAssistant(textToSend);
      const botMsg = {
        id: "b-" + Date.now(),
        sender: "bot",
        text: botResponse.response,
        suggestions: botResponse.actionSuggestions || []
      };
      setMessages((prev) => [...prev, botMsg]);
    }, 300);
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: "m-init-2",
        sender: "bot",
        text: `Chat cleared! How else can I assist with your studies today?`,
        suggestions: [
          "Why am I getting an attendance warning?",
          "Show my recent marks",
          "What assignments are pending?"
        ]
      }
    ]);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", height: "calc(100vh - 170px)" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                background: "linear-gradient(135deg, #7c3aed, #2563eb)",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <Sparkles size={18} />
            </div>
            <h2 style={{ fontSize: "1.4rem", fontWeight: "800", color: "var(--text-main)" }}>
              AI Academic Advisor & Defaulter Assistant
            </h2>
          </div>
          <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: "2px" }}>
            Contextual AI analysis connected directly to your active semester records
          </p>
        </div>

        <button onClick={handleResetChat} className="btn btn-secondary btn-sm">
          <RotateCcw size={14} /> Clear Chat
        </button>
      </div>

      {/* Chat Container */}
      <div className="ai-chat-box">
        {/* Messages List */}
        <div className="ai-messages-list">
          {messages.map((m) => (
            <div
              key={m.id}
              style={{
                display: "flex",
                gap: "10px",
                alignSelf: m.sender === "user" ? "flex-end" : "flex-start",
                maxWidth: "85%"
              }}
            >
              {m.sender === "bot" && (
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #7c3aed, #2563eb)",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0
                  }}
                >
                  <Bot size={18} />
                </div>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <div className={`ai-bubble ${m.sender}`}>
                  <div style={{ whiteSpace: "pre-line" }}>{m.text}</div>
                </div>

                {/* Suggestion Chips */}
                {m.suggestions && m.suggestions.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "4px" }}>
                    {m.suggestions.map((sug, sIdx) => (
                      <button
                        key={sIdx}
                        onClick={() => handleSend(sug)}
                        style={{
                          background: "white",
                          border: "1px solid #cbd5e1",
                          borderRadius: "16px",
                          padding: "5px 12px",
                          fontSize: "0.78rem",
                          fontWeight: "600",
                          color: "var(--primary-700)",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                          transition: "all 0.15s ease"
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--primary-600)"; e.currentTarget.style.background = "var(--primary-50)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#cbd5e1"; e.currentTarget.style.background = "white"; }}
                      >
                        <span>{sug}</span>
                        <ArrowRight size={12} />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {m.sender === "user" && (
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    background: "var(--primary-600)",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0
                  }}
                >
                  <User size={18} />
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div
          style={{
            padding: "16px 20px",
            background: "white",
            borderTop: "1px solid var(--border-subtle)",
            display: "flex",
            gap: "10px"
          }}
        >
          <input
            type="text"
            className="form-control"
            placeholder="Type your academic query (e.g. 'Why is my DBMS attendance low?')..."
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleSend(); }}
            style={{ flex: 1 }}
          />
          <button
            onClick={() => handleSend()}
            className="btn btn-primary"
            style={{ padding: "0 20px" }}
          >
            <Send size={16} />
            <span>Ask</span>
          </button>
        </div>
      </div>
    </div>
  );
}

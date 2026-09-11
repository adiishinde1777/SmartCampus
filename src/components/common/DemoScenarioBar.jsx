import React from "react";
import { useSmartCampus } from "../../context/SmartCampusContext";
import { Play } from "lucide-react";

export default function DemoScenarioBar() {
  const {
    activeRole,
    switchUser,
    setDemoStep
  } = useSmartCampus();

  const demoSteps = [
    { step: 1, role: "teacher", label: "Step 1: Teacher Marks Absent", targetRoute: "/attendance" },
    { step: 2, role: "student", label: "Step 2: Student Alert & Risk", targetRoute: "/dashboard" },
    { step: 3, role: "parent", label: "Step 3: Parent WhatsApp/SMS", targetRoute: "/dashboard" },
    { step: 4, role: "teacher", label: "Step 4: Upload Marks (18/25)", targetRoute: "/marks" },
    { step: 5, role: "hod", label: "Step 5: HOD Dept Radar", targetRoute: "/dashboard" },
    { step: 6, role: "principal", label: "Step 6: Principal Institution Analytics", targetRoute: "/dashboard" }
  ];

  const handleStepClick = (s) => {
    setDemoStep(s.step);
    switchUser(s.role);
  };

  return (
    <div className="demo-scenario-bar">
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "5px",
            background: "#2563eb",
            color: "white",
            padding: "3px 8px",
            borderRadius: "4px",
            fontWeight: "800",
            fontSize: "0.7rem",
            letterSpacing: "0.04em"
          }}
        >
          <Play size={10} fill="white" /> LIVE DEMO FLOW
        </span>
        <span style={{ color: "#94a3b8", fontSize: "0.78rem" }} className="hide-on-mobile">
          6-Role Automated Pipeline:
        </span>
      </div>

      <div className="demo-step-pills">
        {demoSteps.map((s) => (
          <button
            key={s.step}
            className={`demo-step-pill ${activeRole === s.role ? "active" : ""}`}
            onClick={() => handleStepClick(s)}
            title={`Switch to ${s.role.toUpperCase()} View`}
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}

import React from "react";
import { useSmartCampus } from "../../context/SmartCampusContext";
import { Building2, Award } from "lucide-react";

export default function PrintHeader({ title, subtitle, documentType = "OFFICIAL ACADEMIC RECORD" }) {
  const { currentUser, departments } = useSmartCampus();

  const dept = departments.find((d) => d.id === currentUser?.departmentId) || {
    name: currentUser?.departmentName || "Electronics Engineering (VLSI Design & Technology)"
  };

  const currentDate = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  });

  return (
    <div className="print-header-container">
      <div className="print-header-main">
        <div className="print-college-info">
          <div className="print-college-title">
            CSMSS CHH. SHAHU COLLEGE OF ENGINEERING
          </div>
          <div className="print-college-subtitle">
            Kanchanwadi, Paithan Road, Chhatrapati Sambhajinagar (Aurangabad) - 431002 (M.S.)
          </div>
          <div className="print-college-accreditation">
            Approved by AICTE New Delhi, DTE Govt. of Maharashtra & Affiliated to Dr. BATU, Lonere
          </div>
          <div className="print-department-title">
            {dept.name.toUpperCase()}
          </div>
        </div>
      </div>

      <div className="print-doc-meta-bar">
        <div>
          <span className="print-meta-label">DOCUMENT:</span>{" "}
          <strong className="print-meta-value">{documentType}</strong>
        </div>
        {title && (
          <div>
            <span className="print-meta-label">TITLE:</span>{" "}
            <strong className="print-meta-value">{title}</strong>
          </div>
        )}
        <div>
          <span className="print-meta-label">ACADEMIC YEAR:</span>{" "}
          <strong className="print-meta-value">2026-27 (Odd Sem)</strong>
        </div>
        <div>
          <span className="print-meta-label">DATE GENERATED:</span>{" "}
          <strong className="print-meta-value">{currentDate}</strong>
        </div>
      </div>
      {subtitle && <div className="print-doc-sub">{subtitle}</div>}
    </div>
  );
}

export function PrintSignatures() {
  return (
    <div className="print-signatures-container">
      <div className="print-signature-box">
        <div className="print-signature-line"></div>
        <div className="print-signature-label">Class Teacher / Subject In-charge</div>
      </div>
      <div className="print-signature-box">
        <div className="print-signature-line"></div>
        <div className="print-signature-label">Academic Coordinator</div>
      </div>
      <div className="print-signature-box">
        <div className="print-signature-line"></div>
        <div className="print-signature-label">Head of Department (HOD)</div>
      </div>
      <div className="print-signature-box">
        <div className="print-signature-line"></div>
        <div className="print-signature-label">Principal / Director</div>
      </div>
    </div>
  );
}

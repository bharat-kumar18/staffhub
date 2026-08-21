import React, { useState } from "react";
import "./Dashboard.css";
import { assets } from "../../assets/assets.js";

import ManageEmployees from "../employeeuser/ManageEmployees";
import Attendance from "../attendance/Attendance";
import Settings from "../settings/Settings";
import Leave from "../leave/Leave.jsx";

/* ---------------------------------------------------------
   SELF CONTAINED ICONS
--------------------------------------------------------- */

const Icon = {
  Grid: (p) => (
    <svg
      viewBox="0 0 24 24"
      width={p.size || 18}
      height={p.size || 18}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  ),

  Users: (p) => (
    <svg
      viewBox="0 0 24 24"
      width={p.size || 18}
      height={p.size || 18}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),

  Check: (p) => (
    <svg
      viewBox="0 0 24 24"
      width={p.size || 18}
      height={p.size || 18}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),

  X: (p) => (
    <svg
      viewBox="0 0 24 24"
      width={p.size || 18}
      height={p.size || 18}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),

  Wallet: (p) => (
    <svg
      viewBox="0 0 24 24"
      width={p.size || 18}
      height={p.size || 18}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
      <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
      <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
    </svg>
  ),

  Phone: (p) => (
    <svg
      viewBox="0 0 24 24"
      width={p.size || 18}
      height={p.size || 18}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="5" y="2" width="14" height="20" rx="2" />
      <line x1="12" y1="18" x2="12.01" y2="18" />
    </svg>
  ),

  Rocket: (p) => (
    <svg
      viewBox="0 0 24 24"
      width={p.size || 18}
      height={p.size || 18}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
      <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
    </svg>
  ),

  LogOut: (p) => (
    <svg
      viewBox="0 0 24 24"
      width={p.size || 18}
      height={p.size || 18}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  ),

  Trend: (p) => (
    <svg
      viewBox="0 0 24 24"
      width={p.size || 18}
      height={p.size || 18}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  ),

  Folder: (p) => (
    <svg
      viewBox="0 0 24 24"
      width={p.size || 18}
      height={p.size || 18}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  ),

  Box: (p) => (
    <svg
      viewBox="0 0 24 24"
      width={p.size || 18}
      height={p.size || 18}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  ),

  Headphones: (p) => (
    <svg
      viewBox="0 0 24 24"
      width={p.size || 18}
      height={p.size || 18}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
      <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3z" />
      <path d="M3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
    </svg>
  ),

  FileText: (p) => (
    <svg
      viewBox="0 0 24 24"
      width={p.size || 18}
      height={p.size || 18}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  ),

  Moon: (p) => (
    <svg
      viewBox="0 0 24 24"
      width={p.size || 17}
      height={p.size || 17}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  ),

  Settings: (p) => (
    <svg
      viewBox="0 0 24 24"
      width={p.size || 17}
      height={p.size || 17}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),

  Help: (p) => (
    <svg
      viewBox="0 0 24 24"
      width={p.size || 17}
      height={p.size || 17}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),

  Bell: (p) => (
    <svg
      viewBox="0 0 24 24"
      width={p.size || 17}
      height={p.size || 17}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  ),

  Globe: (p) => (
    <svg
      viewBox="0 0 24 24"
      width={p.size || 17}
      height={p.size || 17}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  ),

  Building: (p) => (
    <svg
      viewBox="0 0 24 24"
      width={p.size || 17}
      height={p.size || 17}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="4" y="2" width="16" height="20" rx="1" />
      <line x1="9" y1="6" x2="9" y2="6.01" />
      <line x1="15" y1="6" x2="15" y2="6.01" />
      <line x1="9" y1="10" x2="9" y2="10.01" />
      <line x1="15" y1="10" x2="15" y2="10.01" />
      <line x1="9" y1="14" x2="9" y2="14.01" />
      <line x1="15" y1="14" x2="15" y2="14.01" />
      <line x1="9" y1="18" x2="15" y2="18" />
    </svg>
  ),

  Chevron: (p) => (
    <svg
      viewBox="0 0 24 24"
      width={p.size || 16}
      height={p.size || 16}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  ),

  Calendar: (p) => (
    <svg
      viewBox="0 0 24 24"
      width={p.size || 14}
      height={p.size || 14}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),

  Plus: (p) => (
    <svg
      viewBox="0 0 24 24"
      width={p.size || 16}
      height={p.size || 16}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
};

/* ---------------------------------------------------------
   NAVIGATION ITEMS
--------------------------------------------------------- */

const NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard", icon: Icon.Grid },
  { key: "employee", label: "Employee", icon: Icon.Users },
  { key: "attendance", label: "Attendance", icon: Icon.Check },
  { key: "leave", label: "Leave", icon: Icon.X },
  { key: "payroll", label: "Payroll", icon: Icon.Wallet },
  { key: "recruitment", label: "Recruitment", icon: Icon.Phone },
  { key: "onboarding", label: "Onboarding", icon: Icon.Rocket },
  { key: "offboarding", label: "Offboarding", icon: Icon.LogOut },
  { key: "performance", label: "Performance", icon: Icon.Trend },
  { key: "project", label: "Project", icon: Icon.Folder },
  { key: "assets", label: "Assets", icon: Icon.Box },
  { key: "helpdesk", label: "Helpdesk", icon: Icon.Headphones },
  { key: "reports", label: "Reports", icon: Icon.FileText },
];

/* ---------------------------------------------------------
   SETUP STEPS
--------------------------------------------------------- */

const SETUP_STEPS = [
  { label: "Company", status: "done" },
  { label: "Departments", status: "done" },
  { label: "Job Positions", status: "done" },
  { label: "Shift", status: "done" },
  { label: "Shift Schedule", status: "done" },
  { label: "Work Type", status: "done" },
  { label: "Mail Server", status: "current", number: 7 },
  { label: "First Employee", status: "done" },
];

/* ---------------------------------------------------------
   STAT CARDS
--------------------------------------------------------- */

const STAT_CARDS = [
  {
    icon: Icon.Users,
    iconBg: "#e9ecfb",
    iconColor: "#6a5cf5",
    label: "TOTAL EMPLOYEES",
    value: "29",
    footer: "No new joiners",
    footerType: "muted",
  },
  {
    icon: Icon.Check,
    iconBg: "#dff5ec",
    iconColor: "#22a06b",
    label: "PRESENT TODAY",
    value: "19",
    footer: "65.5% rate",
    footerType: "pill-green",
  },
  {
    icon: Icon.Calendar,
    iconBg: "#fdefd6",
    iconColor: "#e8a13a",
    label: "ON LEAVE",
    value: "3",
    footer: "12 pending",
    footerType: "pill-amber",
  },
  {
    icon: Icon.Folder,
    iconBg: "#f2e6fb",
    iconColor: "#9b5de5",
    label: "OPEN RECRUITMENTS",
    value: "0",
    footer: "Active hiring",
    footerType: "muted",
  },
];

/* =========================================================
   DASHBOARD COMPONENT
========================================================= */

export default function Dashboard() {
  const [activePage, setActivePage] = useState(
    sessionStorage.getItem("activePage") || "dashboard"
  );

  const [activeNav, setActiveNav] = useState(
    sessionStorage.getItem("activePage") || "dashboard"
  );

  const [showSetupBanner, setShowSetupBanner] = useState(true);

  const completedSteps = SETUP_STEPS.filter(
    (step) => step.status === "done"
  ).length;

  /* -------------------------------------------------------
     SIDEBAR NAVIGATION
  ------------------------------------------------------- */

  const handleNavigation = (key) => {
    setActiveNav(key);
    setActivePage(key);

    sessionStorage.setItem("activePage", key);
  };

  /* -------------------------------------------------------
     SETTINGS
  ------------------------------------------------------- */

  const handleSettingsClick = () => {
    setActiveNav("settings");
    setActivePage("settings");

    sessionStorage.setItem("activePage", "settings");
  };

  return (
    <div className="hr-app">

      {/* ================= SIDEBAR ================= */}

      <aside className="hr-sidebar">

        <div className="hr-sidebar-header">

          <div className="hr-brand">

            <span className="hr-brand-icon">
              <img
                src={assets.logo1}
                alt="StaffHub"
              />
            </span>

            <div className="hr-brand-text">

              <span className="hr-brand-name">
                StaffHub
              </span>

              <span className="hr-brand-sub">
                My Company
              </span>

            </div>

          </div>

        </div>

        <nav className="hr-nav">

          {NAV_ITEMS.map(
            ({ key, label, icon: IconCmp }) => (

              <button
                key={key}
                type="button"
                className={`hr-nav-item ${
                  activeNav === key ? "active" : ""
                }`}
                onClick={() => handleNavigation(key)}
              >

                <IconCmp size={18} />

                <span>
                  {label}
                </span>

              </button>

            )
          )}

        </nav>

      </aside>

      {/* ================= MAIN ================= */}

      <div className="hr-main">

        {/* ================= TOPBAR ================= */}

        <header className="hr-topbar">

          <span className="hr-topbar-title">
            ADMIN PANNEL
          </span>

          <div className="hr-topbar-actions">

            <button
              type="button"
              className="hr-checkout-btn"
            >
              <Icon.LogOut size={15} />
              Check Out
            </button>

            <button
              type="button"
              className="hr-icon-btn"
              aria-label="Night mode"
              title="Night mode"
            >
              <Icon.Moon />
            </button>

            <button
              type="button"
              className={`hr-icon-btn ${
                activePage === "settings" ? "active" : ""
              }`}
              aria-label="Settings"
              title="Settings"
              onClick={handleSettingsClick}
            >
              <Icon.Settings />
            </button>

            <button
              type="button"
              className="hr-icon-btn"
              aria-label="Help"
              title="Help"
            >
              <Icon.Help />
            </button>

            <button
              type="button"
              className="hr-icon-btn"
              aria-label="Notifications"
              title="Notifications"
            >
              <Icon.Bell />
            </button>

            <button
              type="button"
              className="hr-icon-btn"
              aria-label="Language"
              title="Language"
            >
              <Icon.Globe />
            </button>

            <button
              type="button"
              className="hr-icon-btn"
              aria-label="Company"
              title="Company"
            >
              <Icon.Building />
            </button>

            <div className="hr-profile">

              <div className="hr-avatar" />

              <div className="hr-profile-text">

                <span className="hr-profile-name">
                  Adam Admin
                </span>

                <span className="hr-profile-status">
                  Offline
                </span>

              </div>

              <Icon.Chevron size={16} />

            </div>

          </div>

        </header>

        {/* ================= PAGE CONTENT ================= */}

        <main className="hr-content">

          {/* =================================================
              EMPLOYEE
          ================================================= */}

          {activePage === "employee" && (
            <ManageEmployees />
          )}

          {/* =================================================
              ATTENDANCE
          ================================================= */}

          {activePage === "attendance" && (
            <Attendance />
          )}

          {/* =================================================
              LEAVE
          ================================================= */}

          {activePage === "leave" && (
            <Leave />
          )}

          {/* =================================================
              SETTINGS
          ================================================= */}

          {activePage === "settings" && (
            <Settings />
          )}

          {/* =================================================
              DASHBOARD
          ================================================= */}

          {activePage === "dashboard" && (
            <>

              <div className="hr-page-heading">

                <div>

                  <h3>
                    Dashboard
                  </h3>

                  <div className="hr-date-row">

                    <span>
                      Saturday, August 1, 2026
                    </span>

                    <span className="hr-live-dot">

                      <i />

                      Just now

                      <span className="hr-refresh">
                        ⟳
                      </span>

                    </span>

                  </div>

                </div>

                <div className="hr-filters">

                  <button
                    type="button"
                    className="hr-filter-btn active"
                  >
                    This Month
                  </button>

                  <button
                    type="button"
                    className="hr-filter-btn"
                  >
                    Last Month
                  </button>

                  <button
                    type="button"
                    className="hr-filter-btn"
                  >
                    Quarter
                  </button>

                  <div className="hr-date-input">
                    01-08-2026
                    <Icon.Calendar />
                  </div>

                  <span className="hr-arrow">
                    →
                  </span>

                  <div className="hr-date-input">
                    31-08-2026
                    <Icon.Calendar />
                  </div>

                  <button
                    type="button"
                    className="hr-customize-btn"
                  >
                    <Icon.Settings size={15} />
                    Customize
                  </button>

                </div>

              </div>

              {/* STAT CARDS */}

              <section className="hr-stats-grid">

                {STAT_CARDS.map((card) => {

                  const CardIcon = card.icon;

                  return (
                    <div
                      className="hr-stat-card"
                      key={card.label}
                    >

                      <div
                        className="hr-stat-icon"
                        style={{
                          background: card.iconBg,
                          color: card.iconColor,
                        }}
                      >
                        <CardIcon size={20} />
                      </div>

                      <span className="hr-stat-label">
                        {card.label}
                      </span>

                      <span className="hr-stat-value">
                        {card.value}
                      </span>

                      <span
                        className={`hr-stat-footer ${
                          card.footerType === "pill-green"
                            ? "pill green"
                            : card.footerType === "pill-amber"
                            ? "pill amber"
                            : ""
                        }`}
                      >
                        {card.footer}
                      </span>

                    </div>
                  );

                })}

              </section>

              {/* BOTTOM WIDGETS */}

              <section className="hr-widgets-grid">

                <div className="hr-widget">

                  <div className="hr-widget-topbar purple" />

                  <div className="hr-widget-body">

                    <h3>
                      Department Headcount
                    </h3>

                    <p className="hr-widget-sub">
                      Top 10 departments
                    </p>

                  </div>

                </div>

                <div className="hr-widget">

                  <div className="hr-widget-topbar purple" />

                  <div className="hr-widget-body">

                    <h3>
                      Leave Trends
                    </h3>

                    <p className="hr-widget-sub">
                      Daily leaves — current week
                    </p>

                  </div>

                </div>

                <div className="hr-widget">

                  <div className="hr-widget-body">

                    <div className="hr-widget-header-row">

                      <h3>
                        Announcements
                      </h3>

                      <button
                        type="button"
                        className="hr-add-btn"
                        aria-label="Add announcement"
                      >
                        <Icon.Plus />
                      </button>

                    </div>

                    <div className="hr-announcement">

                      <span className="hr-announcement-flag">
                        🏳️
                      </span>

                      <span>
                        New Referral Bonus Program —
                        Earn Up to ₹10,000
                      </span>

                    </div>

                  </div>

                </div>

              </section>

            </>
          )}

          {/* =================================================
              OTHER MODULES
          ================================================= */}

          {![
            "dashboard",
            "employee",
            "attendance",
            "leave",
            "settings",
          ].includes(activePage) && (

            <div
              style={{
                padding: "40px",
                textAlign: "center",
              }}
            >

              <h2>
                {NAV_ITEMS.find(
                  (item) => item.key === activePage
                )?.label || "Module"}
              </h2>

              <p>
                This module is coming soon.
              </p>

            </div>

          )}

        </main>

      </div>

    </div>
  );
}
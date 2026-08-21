import React, { useEffect, useState } from "react";
import "./SuperAdminDashboard.css";

import ManageUsers from "../users/ManageUsers";
import { assets } from "../../assets/assets";

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

  Star: (p) => (
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
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),

  Layers: (p) => (
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
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
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

  Settings: (p) => (
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
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
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

  Trend: (p) => (
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
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  ),

  Lock: (p) => (
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
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  ),
};

const NAV_ITEMS = [
  {
    key: "dashboard",
    label: "Dashboard",
    icon: Icon.Grid,
  },
  {
    key: "products",
    label: "Products",
    icon: Icon.Box,
  },
  {
    key: "manage-users",
    label: "Manage Users",
    icon: Icon.Users,
  },
  {
    key: "payment",
    label: "Payment",
    icon: Icon.Wallet,
  },
  {
    key: "review",
    label: "Review",
    icon: Icon.Star,
  },
  {
    key: "assets",
    label: "Assets",
    icon: Icon.Layers,
  },
  {
    key: "report",
    label: "Report",
    icon: Icon.FileText,
  },
  {
    key: "settings",
    label: "Settings",
    icon: Icon.Settings,
  },
];

const STAT_CARDS = [
  {
    icon: Icon.Box,
    iconBg: "#e9ecfb",
    iconColor: "#6a5cf5",
    label: "TOTAL PRODUCTS",
    value: "184",
    footer: "12 added this month",
    footerType: "muted",
  },
  {
    icon: Icon.Users,
    iconBg: "#dff5ec",
    iconColor: "#22a06b",
    label: "TOTAL USERS",
    value: "1,240",
    footer: "+38 this week",
    footerType: "pill-green",
  },
  {
    icon: Icon.Wallet,
    iconBg: "#fdefd6",
    iconColor: "#e8a13a",
    label: "PAYMENTS",
    value: "₹4.2L",
    footer: "6 pending",
    footerType: "pill-amber",
  },
  {
    icon: Icon.Star,
    iconBg: "#f2e6fb",
    iconColor: "#9b5de5",
    label: "PENDING REVIEWS",
    value: "9",
    footer: "Needs action",
    footerType: "pill-amber",
  },
];

export default function SuperAdminDashboard() {

  // =====================================================
  // ACTIVE NAV
  // localStorage se previous selected page milega
  // =====================================================

  const [activeNav, setActiveNav] = useState(() => {
    return localStorage.getItem("superAdminActiveNav") || "dashboard";
  });

  // =====================================================
  // ACTIVE NAV KO localStorage ME SAVE KARNA
  // =====================================================

  useEffect(() => {
    localStorage.setItem("superAdminActiveNav", activeNav);
  }, [activeNav]);

  // =====================================================
  // NAVIGATION CLICK
  // NOTE: yahan koi navigate() nahi hai
  // =====================================================

  const handleNavClick = (key) => {
    setActiveNav(key);
  };

  return (
    <div className="sa-app">

      {/* ================= SIDEBAR ================= */}

      <aside className="sa-sidebar">

        <div className="sa-sidebar-header">

    

          <div className="sa-brand">

            <span className="sa-brand-icon">
              <img src={assets.logo1} alt="" />
            </span>

            <div className="sa-brand-text">

              <span className="sa-brand-name">
                Super Admin
              </span>

              <span className="sa-brand-sub">
                Control Panel
              </span>

            </div>

          </div>

        </div>

        {/* ================= NAVIGATION ================= */}

        <nav className="sa-nav">

          {NAV_ITEMS.map(
            ({
              key,
              label,
              icon: IconCmp,
            }) => (

              <button
                key={key}
                className={`sa-nav-item ${
                  activeNav === key
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  handleNavClick(key)
                }
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

      <div className="sa-main">

        {/* ================= TOPBAR ================= */}

        <header className="sa-topbar">

          <span className="sa-topbar-title">
            Super Admin Panel
          </span>

          <div className="sa-topbar-actions">

            <button
              className="sa-icon-btn"
              aria-label="Settings"
            >
              <Icon.Settings size={17} />
            </button>

            <button
              className="sa-icon-btn"
              aria-label="Help"
            >
              <Icon.Help size={17} />
            </button>

            <button
              className="sa-icon-btn"
              aria-label="Notifications"
            >
              <Icon.Bell size={17} />
            </button>

            <div className="sa-profile">

              <div className="sa-avatar" />

              <div className="sa-profile-text">

                <span className="sa-profile-name">
                  Super Admin
                </span>

                <span className="sa-profile-status">
                  Online
                </span>

              </div>

              <Icon.Chevron size={16} />

            </div>

          </div>

        </header>

        {/* ================= PAGE BODY ================= */}

        <main className="sa-content">

          {/* =================================================
              DASHBOARD
          ================================================= */}

          {activeNav === "dashboard" && (

            <>

              <div className="sa-page-heading">

                <div>

                  <h1>
                    Dashboard
                  </h1>

                  <div className="sa-date-row">

                    <span>
                      Wednesday, August 12, 2026
                    </span>

                    <span className="sa-live-dot">

                      <i />

                      Just now

                    </span>

                  </div>

                </div>

                <div className="sa-filters">

                  <button className="sa-filter-btn active">
                    This Month
                  </button>

                  <button className="sa-filter-btn">
                    Last Month
                  </button>

                  <div className="sa-date-input">

                    12-08-2026

                    <Icon.Calendar />

                  </div>

                </div>

              </div>

              {/* ================= STAT CARDS ================= */}

              <section className="sa-stats-grid">

                {STAT_CARDS.map(
                  (card) => (

                    <div
                      className="sa-stat-card"
                      key={card.label}
                    >

                      <div
                        className="sa-stat-icon"
                        style={{
                          background:
                            card.iconBg,
                          color:
                            card.iconColor,
                        }}
                      >

                        <card.icon size={20} />

                      </div>

                      <span className="sa-stat-label">
                        {card.label}
                      </span>

                      <span className="sa-stat-value">
                        {card.value}
                      </span>

                      <span
                        className={`sa-stat-footer ${
                          card.footerType ===
                          "pill-green"
                            ? "pill green"
                            : card.footerType ===
                              "pill-amber"
                            ? "pill amber"
                            : ""
                        }`}
                      >
                        {card.footer}
                      </span>

                    </div>

                  )
                )}

              </section>

              {/* ================= WIDGETS ================= */}

              <section className="sa-widgets-grid">

                <div className="sa-widget">

                  <div className="sa-widget-topbar purple" />

                  <div className="sa-widget-body">

                    <div className="sa-widget-header-row">

                      <h3>
                        Sales Overview
                      </h3>

                      <Icon.Trend size={16} />

                    </div>

                    <p className="sa-widget-sub">
                      Revenue trend — last 30 days
                    </p>

                  </div>

                </div>

                <div className="sa-widget">

                  <div className="sa-widget-topbar purple" />

                  <div className="sa-widget-body">

                    <h3>
                      User Growth
                    </h3>

                    <p className="sa-widget-sub">
                      New signups this week
                    </p>

                  </div>

                </div>

                <div className="sa-widget">

                  <div className="sa-widget-body">

                    <h3>
                      Recent Reviews
                    </h3>

                    <p className="sa-widget-sub">
                      Latest product feedback
                    </p>

                    <div className="sa-review-row">

                      <Icon.Star size={14} />

                      <span>
                        "Great quality, fast delivery" — 5.0
                      </span>

                    </div>

                  </div>

                </div>

              </section>

            </>

          )}

          {/* =================================================
              MANAGE USERS
              SAME DASHBOARD KE ANDAR
          ================================================= */}

          {activeNav === "manage-users" && (

            <ManageUsers />

          )}

          {/* =================================================
              PRODUCTS
          ================================================= */}

          {activeNav === "products" && (

            <div>

              <h1>
                Products
              </h1>

              <p>
                Products section coming soon.
              </p>

            </div>

          )}

          {/* =================================================
              PAYMENT
          ================================================= */}

          {activeNav === "payment" && (

            <div>

              <h1>
                Payment
              </h1>

              <p>
                Payment section coming soon.
              </p>

            </div>

          )}

          {/* =================================================
              REVIEW
          ================================================= */}

          {activeNav === "review" && (

            <div>

              <h1>
                Review
              </h1>

              <p>
                Review section coming soon.
              </p>

            </div>

          )}

          {/* =================================================
              ASSETS
          ================================================= */}

          {activeNav === "assets" && (

            <div>

              <h1>
                Assets
              </h1>

              <p>
                Assets section coming soon.
              </p>

            </div>

          )}

          {/* =================================================
              REPORT
          ================================================= */}

          {activeNav === "report" && (

            <div>

              <h1>
                Report
              </h1>

              <p>
                Report section coming soon.
              </p>

            </div>

          )}

          {/* =================================================
              SETTINGS
          ================================================= */}

          {activeNav === "settings" && (

            <div>

              <h1>
                Settings
              </h1>

              <p>
                Settings section coming soon.
              </p>

            </div>

          )}

        </main>

      </div>

    </div>
  );
}
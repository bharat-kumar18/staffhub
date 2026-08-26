import React, { useEffect, useState } from "react";
import "./EmployeeDashboard.css";

import { assets } from "../../assets/assets";

import {
  checkIn,
  checkOut,
  getAttendance,
  getMyAttendance,
} from "../../Services/api.js";

import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import EmployeeLeave from "./EmployeeLeave";

/* =========================================================
   ICONS
========================================================= */

const Icon = {
  Grid: ({ size = 18 }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
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

  Check: ({ size = 18 }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),

  Calendar: ({ size = 18 }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
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

  Wallet: ({ size = 18 }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
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

  User: ({ size = 18 }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="7" r="4" />
      <path d="M5.5 21a6.5 6.5 0 0 1 13 0" />
    </svg>
  ),

  LogOut: ({ size = 18 }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
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
};

/* =========================================================
   NAV ITEMS
========================================================= */

const NAV_ITEMS = [
  {
    key: "dashboard",
    label: "Dashboard",
    icon: Icon.Grid,
  },
  {
    key: "attendance",
    label: "My Attendance",
    icon: Icon.Check,
  },
  {
    key: "leave",
    label: "My Leave",
    icon: Icon.Calendar,
  },
  {
    key: "payroll",
    label: "My Payroll",
    icon: Icon.Wallet,
  },
  {
    key: "profile",
    label: "My Profile",
    icon: Icon.User,
  },
];

/* =========================================================
   FORMAT TIME
========================================================= */

const formatTime = (time) => {
  if (!time) {
    return "--";
  }

  try {
    const timeString = String(time);

    const [hours, minutes] = timeString.split(":");

    let hour = parseInt(hours, 10);

    if (isNaN(hour)) {
      return "--";
    }

    const ampm = hour >= 12 ? "PM" : "AM";

    hour = hour % 12;

    if (hour === 0) {
      hour = 12;
    }

    return `${String(hour).padStart(2, "0")}:${minutes || "00"} ${ampm}`;
  } catch (error) {
    return "--";
  }
};

/* =========================================================
   FORMAT DATE
========================================================= */

const formatAttendanceDate = (date) => {
  if (!date) {
    return "--";
  }

  try {
    const parsedDate = new Date(date);

    if (isNaN(parsedDate.getTime())) {
      return String(date);
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch (error) {
    return "--";
  }
};

/* =========================================================
   CALCULATE WORKING HOURS
========================================================= */

const calculateDuration = (checkInTime, checkOutTime) => {
  if (!checkInTime || !checkOutTime) {
    return "--";
  }

  try {
    const inParts = String(checkInTime)
      .split(":")
      .map(Number);

    const outParts = String(checkOutTime)
      .split(":")
      .map(Number);

    const inHours = inParts[0] || 0;
    const inMinutes = inParts[1] || 0;

    const outHours = outParts[0] || 0;
    const outMinutes = outParts[1] || 0;

    let startMinutes =
      inHours * 60 + inMinutes;

    let endMinutes =
      outHours * 60 + outMinutes;

    if (endMinutes < startMinutes) {
      endMinutes += 24 * 60;
    }

    const totalMinutes =
      endMinutes - startMinutes;

    if (totalMinutes < 0) {
      return "--";
    }

    const hours =
      Math.floor(totalMinutes / 60);

    const minutes =
      totalMinutes % 60;

    return `${String(hours).padStart(2, "0")}:${String(
      minutes
    ).padStart(2, "0")}`;
  } catch (error) {
    return "--";
  }
};

/* =========================================================
   NORMALIZE ATTENDANCE
========================================================= */

const normalizeAttendance = (record) => {
  if (!record) {
    return null;
  }

  return {
    ...record,

    id:
      record.id ??
      record.attendance_id ??
      record.attendanceId,

    date:
      record.date ??
      record.attendance_date ??
      record.attendanceDate ??
      record.created_at ??
      record.createdAt,

    check_in:
      record.check_in ??
      record.checkIn ??
      null,

    check_out:
      record.check_out ??
      record.checkOut ??
      null,

    worked_hours:
      record.worked_hours ??
      record.workedHours ??
      null,

    late_hours:
      record.late_hours ??
      record.lateHours ??
      null,

    status:
      record.status ??
      "present",

    remarks:
      record.remarks ??
      null,
  };
};

/* =========================================================
   GET ATTENDANCE ARRAY
========================================================= */

const getAttendanceRecords = (response) => {
  const raw =
    response?.data?.attendance ??
    response?.data?.data ??
    response?.data;

  if (Array.isArray(raw)) {
    return raw;
  }

  if (raw) {
    return [raw];
  }

  return [];
};

/* =========================================================
   EMPLOYEE DASHBOARD
========================================================= */

export default function EmployeeDashboard() {
  /* =======================================================
     ACTIVE PAGE
  ======================================================= */

  const [activePage, setActivePage] = useState(
    () =>
      sessionStorage.getItem("activePage") ||
      "dashboard"
  );

  /* =======================================================
     EMPLOYEE
  ======================================================= */

  const [employeeName, setEmployeeName] =
    useState("Employee");

  /* =======================================================
     TODAY ATTENDANCE
  ======================================================= */

  const [attendance, setAttendance] =
    useState(null);

  /* =======================================================
     ATTENDANCE HISTORY
  ======================================================= */

  const [attendanceHistory, setAttendanceHistory] =
    useState([]);

  /* =======================================================
     LOADING
  ======================================================= */

  const [checkInLoading, setCheckInLoading] =
    useState(false);

  const [checkOutLoading, setCheckOutLoading] =
    useState(false);

  const [attendanceLoading, setAttendanceLoading] =
    useState(false);

  /* =======================================================
     GET MY ATTENDANCE

     ONLY runs when sidebar My Attendance is clicked.
  ======================================================= */

  useEffect(() => {
    if (activePage !== "attendance") {
      return;
    }

    const fetchMyAttendance = async () => {
      try {
        setAttendanceLoading(true);

        console.log(
          "Calling getMyAttendance API..."
        );

        const response =
          await getMyAttendance({
            page: 1,
            limit: 100,
          });

        console.log(
          "GET MY ATTENDANCE RESPONSE:",
          response.data
        );

        const records =
          Array.isArray(
            response.data?.attendance
          )
            ? response.data.attendance
            : [];

        const normalizedRecords =
          records
            .map(normalizeAttendance)
            .filter(Boolean);

        normalizedRecords.sort((a, b) => {
          const dateA =
            new Date(
              a.date || 0
            ).getTime();

          const dateB =
            new Date(
              b.date || 0
            ).getTime();

          return dateB - dateA;
        });

        setAttendanceHistory(
          normalizedRecords
        );
      } catch (error) {
        console.error(
          "GET MY ATTENDANCE ERROR:",
          error
        );

        console.error(
          "STATUS:",
          error.response?.status
        );

        console.error(
          "BACKEND RESPONSE:",
          error.response?.data
        );

        setAttendanceHistory([]);

        toast.error(
          error.response?.data?.message ||
            error.message ||
            "Unable to load attendance history"
        );
      } finally {
        setAttendanceLoading(false);
      }
    };

    fetchMyAttendance();
  }, [activePage]);

  /* =======================================================
     GET TODAY ATTENDANCE

     Dashboard ke liye.
  ======================================================= */

  useEffect(() => {
    if (activePage !== "dashboard") {
      return;
    }

    const fetchTodayAttendance = async () => {
      try {
        setAttendanceLoading(true);

        const response =
          await getAttendance({
            page: 1,
            limit: 100,
          });

        console.log(
          "Today Attendance Response:",
          response.data
        );

        const records =
          getAttendanceRecords(response);

        const normalizedRecords =
          records
            .map(normalizeAttendance)
            .filter(Boolean);

        if (
          normalizedRecords.length > 0
        ) {
          normalizedRecords.sort((a, b) => {
            const dateA =
              new Date(
                a.date || 0
              ).getTime();

            const dateB =
              new Date(
                b.date || 0
              ).getTime();

            return dateB - dateA;
          });

          setAttendance(
            normalizedRecords[0]
          );
        } else {
          setAttendance(null);
        }
      } catch (error) {
        console.log(
          "No attendance found:",
          error.response?.data?.message ||
            error.message
        );

        setAttendance(null);
      } finally {
        setAttendanceLoading(false);
      }
    };

    fetchTodayAttendance();
  }, [activePage]);

  /* =======================================================
     GET CURRENT LOCATION
  ======================================================= */

  const getCurrentLocation = () => {
    return new Promise(
      (resolve, reject) => {
        if (!navigator.geolocation) {
          reject(
            new Error(
              "Geolocation is not supported by your browser"
            )
          );

          return;
        }

        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              latitude:
                position.coords.latitude,

              longitude:
                position.coords.longitude,
            });
          },

          (error) => {
            let message =
              "Unable to get current location";

            if (error.code === 1) {
              message =
                "Location permission denied. Please allow location access.";
            } else if (error.code === 2) {
              message =
                "Current location is unavailable.";
            } else if (error.code === 3) {
              message =
                "Location request timed out.";
            }

            reject(
              new Error(message)
            );
          },

          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
          }
        );
      }
    );
  };

  /* =======================================================
     CHECK IN
  ======================================================= */

  const handleCheckIn = async () => {
    try {
      setCheckInLoading(true);

      const location =
        await getCurrentLocation();

      const response =
        await checkIn({
          latitude:
            location.latitude,

          longitude:
            location.longitude,
        });

      console.log(
        "Check In Response:",
        response.data
      );

      if (response.data?.success) {
        const attendanceData =
          normalizeAttendance(
            response.data.attendance
          );

        setAttendance(
          attendanceData
        );

        toast.success(
          response.data.message ||
            "Check-in successful!",
          {
            autoClose: 1500,
          }
        );
      } else {
        if (
          response.data?.attendance
        ) {
          setAttendance(
            normalizeAttendance(
              response.data.attendance
            )
          );
        }

        toast.error(
          response.data?.message ||
            "Check-in failed"
        );
      }
    } catch (error) {
      console.error(
        "Check In Error:",
        error
      );

      if (
        error.response?.data?.attendance
      ) {
        setAttendance(
          normalizeAttendance(
            error.response.data
              .attendance
          )
        );
      }

      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Unable to check-in"
      );
    } finally {
      setCheckInLoading(false);
    }
  };

  /* =======================================================
     CHECK OUT
  ======================================================= */

  const handleCheckOut = async () => {
    try {
      setCheckOutLoading(true);

      const response =
        await checkOut();

      console.log(
        "Check Out Response:",
        response.data
      );

      if (response.data?.success) {
        const attendanceData =
          normalizeAttendance(
            response.data.attendance
          );

        setAttendance(
          attendanceData
        );

        toast.success(
          response.data.message ||
            "Check-out successful!",
          {
            autoClose: 1500,
          }
        );
      } else {
        if (
          response.data?.attendance
        ) {
          setAttendance(
            normalizeAttendance(
              response.data.attendance
            )
          );
        }

        toast.error(
          response.data?.message ||
            "Check-out failed"
        );
      }
    } catch (error) {
      console.error(
        "Check Out Error:",
        error
      );

      if (
        error.response?.data?.attendance
      ) {
        setAttendance(
          normalizeAttendance(
            error.response.data
              .attendance
          )
        );
      }

      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Unable to check-out"
      );
    } finally {
      setCheckOutLoading(false);
    }
  };

  /* =======================================================
     NAVIGATION
  ======================================================= */

  const handleNavigation = (page) => {
    setActivePage(page);

    sessionStorage.setItem(
      "activePage",
      page
    );
  };

  /* =======================================================
     LOGOUT
  ======================================================= */

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    sessionStorage.removeItem(
      "activePage"
    );

    window.location.href = "/login";
  };

  /* =======================================================
     ATTENDANCE STATUS
  ======================================================= */

  const isCheckedIn =
    Boolean(
      attendance?.check_in
    );

  const isCheckedOut =
    Boolean(
      attendance?.check_out
    );

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="employee-app">

      {/* =================================================
          SIDEBAR
      ================================================= */}

      <aside className="employee-sidebar">

        {/* BRAND */}

        <div className="employee-brand">

          <div className="employee-logo">
            <img
              src={assets.logo1}
              alt="StaffHub"
            />
          </div>

          <div>
            <div className="employee-brand-name">
              StaffHub
            </div>

            <div className="employee-brand-sub">
              Employee Panel
            </div>
          </div>

        </div>

        {/* NAVIGATION */}

        <nav className="employee-nav">

          {NAV_ITEMS.map((item) => {
            const ItemIcon =
              item.icon;

            return (
              <button
                key={item.key}
                type="button"
                className={`employee-nav-item ${
                  activePage === item.key
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  handleNavigation(
                    item.key
                  )
                }
              >
                <ItemIcon size={18} />

                <span>
                  {item.label}
                </span>
              </button>
            );
          })}

        </nav>

        {/* LOGOUT */}

        <button
          type="button"
          className="employee-logout"
          onClick={handleLogout}
        >
          <Icon.LogOut size={18} />
          Logout
        </button>

      </aside>

      {/* =================================================
          MAIN
      ================================================= */}

      <div className="employee-main">

        {/* TOPBAR */}

        <header className="employee-topbar">

          <div>
            <span className="employee-top-title">
              EMPLOYEE PANEL
            </span>
          </div>

          <div className="employee-profile">

            <div className="employee-avatar">
              {employeeName
                .charAt(0)
                .toUpperCase()}
            </div>

            <div>
              <div className="employee-name">
                {employeeName}
              </div>

              <div className="employee-role">
                Employee
              </div>
            </div>

          </div>

        </header>

        {/* =================================================
            CONTENT
        ================================================= */}

        <main className="employee-content">

          {/* =================================================
              DASHBOARD
          ================================================= */}

          {activePage === "dashboard" && (
            <>
              <div className="employee-heading">

                <div>
                  <h2>
                    Good Morning,{" "}
                    {employeeName}
                  </h2>

                  <p>
                    Here's what's happening
                    with your work today.
                  </p>
                </div>

                {/* ATTENDANCE ACTIONS */}

                <div className="attendance-actions">

                  {/* CHECK IN */}

                  <button
                    type="button"
                    className="employee-checkin-btn"
                    onClick={
                      handleCheckIn
                    }
                    disabled={
                      checkInLoading ||
                      isCheckedIn ||
                      attendanceLoading
                    }
                  >
                    <Icon.Check size={18} />

                    {checkInLoading
                      ? "Checking In..."
                      : isCheckedIn
                      ? "Checked In"
                      : "Check In"}
                  </button>

                  {/* CHECK OUT */}

                  <button
                    type="button"
                    className="employee-checkout-btn"
                    onClick={
                      handleCheckOut
                    }
                    disabled={
                      checkOutLoading ||
                      !isCheckedIn ||
                      isCheckedOut ||
                      attendanceLoading
                    }
                  >
                    <Icon.LogOut size={18} />

                    {checkOutLoading
                      ? "Checking Out..."
                      : isCheckedOut
                      ? "Checked Out"
                      : "Check Out"}
                  </button>

                </div>

              </div>

              {/* =================================================
                  STATS
              ================================================= */}

              <section className="employee-stats">

                <div className="employee-stat-card">

                  <div className="employee-stat-icon green">
                    <Icon.Check size={20} />
                  </div>

                  <span>
                    Present Days
                  </span>

                  <strong>
                    18
                  </strong>

                  <small>
                    This month
                  </small>

                </div>

                <div className="employee-stat-card">

                  <div className="employee-stat-icon orange">
                    <Icon.Calendar size={20} />
                  </div>

                  <span>
                    Leave
                  </span>

                  <strong>
                    2
                  </strong>

                  <small>
                    This month
                  </small>

                </div>

                <div className="employee-stat-card">

                  <div className="employee-stat-icon blue">
                    <Icon.Check size={20} />
                  </div>

                  <span>
                    Working Hours
                  </span>

                  <strong>
                    {attendance?.check_in &&
                    attendance?.check_out
                      ? calculateDuration(
                          attendance.check_in,
                          attendance.check_out
                        )
                      : attendance?.check_in
                      ? "Working..."
                      : "--"}
                  </strong>

                  <small>
                    Today
                  </small>

                </div>

                <div className="employee-stat-card">

                  <div className="employee-stat-icon purple">
                    <Icon.Wallet size={20} />
                  </div>

                  <span>
                    Salary
                  </span>

                  <strong>
                    ₹45,000
                  </strong>

                  <small>
                    Current month
                  </small>

                </div>

              </section>

              {/* =================================================
                  TODAY ATTENDANCE
              ================================================= */}

              <section className="employee-card">

                <div className="employee-card-header">

                  <div>
                    <h3>
                      Today's Attendance
                    </h3>

                    <p>
                      Track your check-in
                      and check-out
                    </p>
                  </div>

                  <span
                    className={`employee-status ${
                      attendance
                        ? attendance.status
                        : "not-marked"
                    }`}
                  >
                    {attendance?.status
                      ? attendance.status
                          .charAt(0)
                          .toUpperCase() +
                        attendance.status.slice(1)
                      : "Not Marked"}
                  </span>

                </div>

                <div className="attendance-today">

                  <div>
                    <span>
                      Check In
                    </span>

                    <strong>
                      {formatTime(
                        attendance?.check_in
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Check Out
                    </span>

                    <strong>
                      {formatTime(
                        attendance?.check_out
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Working Hours
                    </span>

                    <strong>
                      {attendance?.check_in &&
                      attendance?.check_out
                        ? calculateDuration(
                            attendance.check_in,
                            attendance.check_out
                          )
                        : attendance?.check_in
                        ? "Working..."
                        : "--"}
                    </strong>
                  </div>

                </div>

                {attendance && (
                  <div className="attendance-location">
                    <small>
                      📍 Attendance location
                      recorded
                    </small>
                  </div>
                )}

              </section>
            </>
          )}

          {/* =================================================
              MY ATTENDANCE
          ================================================= */}

          {activePage === "attendance" && (
            <div className="employee-module-page">

              <div className="employee-module-header">

                <div>
                  <h2>
                    My Attendance
                  </h2>

                  <p>
                    View your complete
                    attendance history.
                  </p>
                </div>

              </div>

              <div className="employee-card attendance-history-card">

                <div className="employee-card-header">

                  <div>
                    <h3>
                      Attendance History
                    </h3>

                    <p>
                      Your check-in and
                      check-out records
                    </p>
                  </div>

                </div>

                {/* LOADING */}

                {attendanceLoading ? (
                  <div className="attendance-loading">
                    <div className="attendance-loader">
                      Loading attendance...
                    </div>
                  </div>
                ) : attendanceHistory.length ===
                  0 ? (

                  <div className="attendance-empty">

                    <Icon.Calendar size={35} />

                    <h4>
                      No Attendance Found
                    </h4>

                    <p>
                      Your attendance records
                      will appear here.
                    </p>

                  </div>

                ) : (

                  <div className="attendance-table-wrapper">

                    <table className="attendance-history-table">

                      <thead>
                        <tr>

                          <th>
                            #
                          </th>

                          <th>
                            Date
                          </th>

                          <th>
                            Check In
                          </th>

                          <th>
                            Check Out
                          </th>

                          <th>
                            Working Hours
                          </th>

                          <th>
                            Late Hours
                          </th>

                          <th>
                            Status
                          </th>

                          <th>
                            Remarks
                          </th>

                        </tr>
                      </thead>

                      <tbody>

                        {attendanceHistory.map(
                          (
                            record,
                            index
                          ) => {

                            /*
                              Backend agar worked_hours
                              bhej raha hai to wahi use
                              karo.
                              
                              Agar nahi bhej raha,
                              to frontend calculate karega.
                            */

                            const duration =
                              record.worked_hours ||
                              calculateDuration(
                                record.check_in,
                                record.check_out
                              );

                            const status =
                              record.status ||
                              "present";

                            return (
                              <tr
                                key={
                                  record.id ||
                                  record.attendance_id ||
                                  `${record.date}-${index}`
                                }
                              >

                                <td>
                                  {index + 1}
                                </td>

                                <td>
                                  <span className="attendance-date">
                                    {formatAttendanceDate(
                                      record.date
                                    )}
                                  </span>
                                </td>

                                <td>
                                  <span className="attendance-time check-in-time">
                                    {formatTime(
                                      record.check_in
                                    )}
                                  </span>
                                </td>

                                <td>
                                  <span className="attendance-time check-out-time">
                                    {formatTime(
                                      record.check_out
                                    )}
                                  </span>
                                </td>

                                <td>
                                  <strong className="attendance-duration">
                                    {duration}
                                  </strong>
                                </td>

                                <td>
                                  {record.late_hours ||
                                    "00:00"}
                                </td>

                                <td>
                                  <span
                                    className={`attendance-status ${status
                                      .toLowerCase()
                                      .replace(
                                        /\s+/g,
                                        "-"
                                      )}`}
                                  >
                                    {status
                                      .charAt(0)
                                      .toUpperCase() +
                                      status.slice(1)}
                                  </span>
                                </td>

                                <td>
                                  {record.remarks ||
                                    "--"}
                                </td>

                              </tr>
                            );
                          }
                        )}

                      </tbody>

                    </table>

                  </div>

                )}

              </div>

            </div>
          )}

          {/* =================================================
              LEAVE
          ================================================= */}

          {activePage === "leave" && (
            <EmployeeLeave />
          )}

          {/* =================================================
              PAYROLL
          ================================================= */}

          {activePage === "payroll" && (
            <div className="employee-module-page">

              <h2>
                My Payroll
              </h2>

              <p>
                Your salary and payroll
                information will appear here.
              </p>

            </div>
          )}

          {/* =================================================
              PROFILE
          ================================================= */}

          {activePage === "profile" && (
            <div className="employee-module-page">

              <h2>
                My Profile
              </h2>

              <p>
                Your profile information
                will appear here.
              </p>

            </div>
          )}

        </main>

      </div>

    </div>
  );
}
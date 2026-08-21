import React, { useState, useEffect } from "react";
import "./Settings.css";
import { getOfficeTiming, addOfficeTiming, updateOfficeTiming } from "../../Services/api";// 👈 apne api.js ka sahi path daal dena

const Icon = {
    Clock: ({ size = 20 }) => (
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
            <circle cx="12" cy="12" r="9" />
            <polyline points="12 7 12 12 15 14" />
        </svg>
    ),

    Building: ({ size = 20 }) => (
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
            <rect x="4" y="3" width="16" height="18" rx="2" />
            <path d="M8 7h2" />
            <path d="M14 7h2" />
            <path d="M8 11h2" />
            <path d="M14 11h2" />
            <path d="M8 15h2" />
            <path d="M14 15h2" />
            <path d="M10 21v-3h4v3" />
        </svg>
    ),

    Bell: ({ size = 20 }) => (
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
            <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
            <path d="M10 21h4" />
        </svg>
    ),

    Shield: ({ size = 20 }) => (
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
            <path d="M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7l8-4z" />
            <polyline points="9 12 11 14 15 10" />
        </svg>
    ),

    Save: ({ size = 18 }) => (
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
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
            <polyline points="17 21 17 13 7 13 7 21" />
            <polyline points="7 3 7 8 15 8" />
        </svg>
    ),
};

export default function Settings() {
    const [activeSetting, setActiveSetting] = useState("office");

    // ================= OFFICE TIMING STATE =================
    const [officeData, setOfficeData] = useState({
        office_start_time: "",
        office_end_time: "",
        late_after: "",
    });

    const [officeTimingExists, setOfficeTimingExists] = useState(false);
    const [officeLoading, setOfficeLoading] = useState(true);
    const [officeSaving, setOfficeSaving] = useState(false);
    const [officeError, setOfficeError] = useState("");

    const [companyData, setCompanyData] = useState({
        companyName: "My Company",
        email: "",
        phone: "",
        address: "",
    });

    const [notificationData, setNotificationData] = useState({
        attendanceNotification: true,
        leaveNotification: true,
        payrollNotification: true,
    });

    // ================= FETCH OFFICE TIMING ON LOAD =================
    useEffect(() => {
        const fetchOfficeTiming = async () => {
            try {
                setOfficeLoading(true);
                setOfficeError("");

                const res = await getOfficeTiming();

                if (res.data.success) {
                    const t = res.data.officeTiming;

                    setOfficeData({
                        office_start_time: t.office_start_time?.slice(0, 5) || "",
                        office_end_time: t.office_end_time?.slice(0, 5) || "",
                        late_after: t.late_after?.slice(0, 5) || "",
                    });

                    setOfficeTimingExists(true);
                }
            } catch (error) {
                // 404 matlab abhi tak timing set nahi hui -> add wala flow chalega
                if (error.response && error.response.status === 404) {
                    setOfficeTimingExists(false);
                } else {
                    console.error("Get Office Timing Error:", error);
                    setOfficeError(
                        error.response?.data?.message ||
                        "Office timing load karne mein error aaya"
                    );
                }
            } finally {
                setOfficeLoading(false);
            }
        };

        fetchOfficeTiming();
    }, []);

    const handleOfficeChange = (e) => {
        const { name, value } = e.target;

        setOfficeData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleCompanyChange = (e) => {
        const { name, value } = e.target;

        setCompanyData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleNotificationChange = (name) => {
        setNotificationData((prev) => ({
            ...prev,
            [name]: !prev[name],
        }));
    };

    // ================= SUBMIT OFFICE TIMING (ADD or UPDATE) =================
    const handleOfficeSubmit = async (e) => {
        e.preventDefault();

        if (
            !officeData.office_start_time ||
            !officeData.office_end_time ||
            !officeData.late_after
        ) {
            toast.warn("Office start time, end time aur late after — sab required hain");
            return;
        }

        try {
            setOfficeSaving(true);
            setOfficeError("");

            const payload = {
                office_start_time: officeData.office_start_time,
                office_end_time: officeData.office_end_time,
                late_after: officeData.late_after,
            };

            let res;

            if (officeTimingExists) {
                res = await updateOfficeTiming(payload);
            } else {
                res = await addOfficeTiming(payload);
            }

            if (res.data.success) {
                setOfficeTimingExists(true);
                alert(res.data.message || "Office timing saved successfully");
            }
        } catch (error) {
            console.error("Office Timing Save Error:", error);

            // Agar "already exists" wala 409 error aaya, toh update pe switch kar do
            if (error.response && error.response.status === 409) {
                setOfficeTimingExists(true);
                setOfficeError("Timing pehle se hai, update kar rahe hain...");
            } else {
                setOfficeError(
                    error.response?.data?.message || "Office timing save nahi hui"
                );
            }
        } finally {
            setOfficeSaving(false);
        }
    };

    const handleCompanySubmit = (e) => {
        e.preventDefault();

        console.log("Company Data:", companyData);

        alert("Company information saved successfully");
    };

    const handleNotificationSubmit = (e) => {
        e.preventDefault();

        console.log("Notification Settings:", notificationData);

        alert("Notification settings saved successfully");
    };

    return (
        <div className="settings-page">

            {/* HEADER */}
            <div className="settings-page-header">
                <div>
                    <h1>Settings</h1>

                    <p>
                        Manage your company and employee management settings.
                    </p>
                </div>
            </div>

            {/* SETTINGS BODY */}
            <div className="settings-layout">

                {/* LEFT SETTINGS MENU */}
                <aside className="settings-menu">

                    <button
                        type="button"
                        className={
                            activeSetting === "office"
                                ? "settings-menu-item active"
                                : "settings-menu-item"
                        }
                        onClick={() => setActiveSetting("office")}
                    >
                        <span className="settings-menu-icon">
                            <Icon.Clock size={19} />
                        </span>

                        <span>
                            <strong>Office Timing</strong>
                            <small>Work hours & attendance</small>
                        </span>
                    </button>

                    <button
                        type="button"
                        className={
                            activeSetting === "company"
                                ? "settings-menu-item active"
                                : "settings-menu-item"
                        }
                        onClick={() => setActiveSetting("company")}
                    >
                        <span className="settings-menu-icon">
                            <Icon.Building size={19} />
                        </span>

                        <span>
                            <strong>Company</strong>
                            <small>Company information</small>
                        </span>
                    </button>

                    <button
                        type="button"
                        className={
                            activeSetting === "notifications"
                                ? "settings-menu-item active"
                                : "settings-menu-item"
                        }
                        onClick={() => setActiveSetting("notifications")}
                    >
                        <span className="settings-menu-icon">
                            <Icon.Bell size={19} />
                        </span>

                        <span>
                            <strong>Notifications</strong>
                            <small>Notification preferences</small>
                        </span>
                    </button>

                    <button
                        type="button"
                        className={
                            activeSetting === "security"
                                ? "settings-menu-item active"
                                : "settings-menu-item"
                        }
                        onClick={() => setActiveSetting("security")}
                    >
                        <span className="settings-menu-icon">
                            <Icon.Shield size={19} />
                        </span>

                        <span>
                            <strong>Security</strong>
                            <small>Account & security</small>
                        </span>
                    </button>

                </aside>

                {/* RIGHT CONTENT */}
                <section className="settings-content">

                    {/* =========================================
              OFFICE TIMING
          ========================================= */}
                    {activeSetting === "office" && (
                        <div className="settings-card">

                            <div className="settings-card-header">
                                <div className="settings-card-title-icon">
                                    <Icon.Clock size={21} />
                                </div>

                                <div>
                                    <h2>Office Timing</h2>

                                    <p>
                                        Configure office working hours and late attendance
                                        rules.
                                    </p>
                                </div>
                            </div>

                            {officeLoading ? (
                                <p style={{ padding: "12px 0" }}>Loading office timing...</p>
                            ) : (
                                <form onSubmit={handleOfficeSubmit}>

                                    {officeError && (
                                        <div
                                            className="settings-info-box"
                                            style={{ borderColor: "#ef4444", marginBottom: "12px" }}
                                        >
                                            <p style={{ margin: 0, color: "#ef4444" }}>
                                                {officeError}
                                            </p>
                                        </div>
                                    )}

                                    <div className="settings-form-grid">

                                        <div className="settings-form-group">
                                            <label>
                                                Office Start Time
                                            </label>

                                            <input
                                                type="time"
                                                name="office_start_time"
                                                value={officeData.office_start_time}
                                                onChange={handleOfficeChange}
                                            />
                                        </div>

                                        <div className="settings-form-group">
                                            <label>
                                                Office End Time
                                            </label>

                                            <input
                                                type="time"
                                                name="office_end_time"
                                                value={officeData.office_end_time}
                                                onChange={handleOfficeChange}
                                            />
                                        </div>

                                        <div className="settings-form-group">
                                            <label>
                                                Late After
                                            </label>

                                            <input
                                                type="time"
                                                name="late_after"
                                                value={officeData.late_after}
                                                onChange={handleOfficeChange}
                                            />

                                            <small>
                                                Employees checking in after this time
                                                will be marked as late.
                                            </small>
                                        </div>

                                    </div>

                                    <div className="settings-info-box">
                                        <Icon.Clock size={18} />

                                        <div>
                                            <strong>
                                                Attendance rule
                                            </strong>

                                            <p>
                                                Employees checking in after the
                                                configured "Late After" time will
                                                automatically receive the
                                                <b> Late </b>
                                                attendance status.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="settings-form-footer">

                                        <button
                                            type="submit"
                                            className="settings-save-btn"
                                            disabled={officeSaving}
                                        >
                                            <Icon.Save size={17} />
                                            {officeSaving
                                                ? "Saving..."
                                                : officeTimingExists
                                                    ? "Update Changes"
                                                    : "Save Changes"}
                                        </button>

                                    </div>

                                </form>
                            )}

                        </div>
                    )}

                    {/* =========================================
              COMPANY
          ========================================= */}
                    {activeSetting === "company" && (
                        <div className="settings-card">

                            <div className="settings-card-header">
                                <div className="settings-card-title-icon">
                                    <Icon.Building size={21} />
                                </div>

                                <div>
                                    <h2>Company Information</h2>

                                    <p>
                                        Update your company information.
                                    </p>
                                </div>
                            </div>

                            <form onSubmit={handleCompanySubmit}>

                                <div className="settings-form-grid">

                                    <div className="settings-form-group full">
                                        <label>
                                            Company Name
                                        </label>

                                        <input
                                            type="text"
                                            name="companyName"
                                            value={companyData.companyName}
                                            onChange={handleCompanyChange}
                                            placeholder="Enter company name"
                                        />
                                    </div>

                                    <div className="settings-form-group">
                                        <label>
                                            Company Email
                                        </label>

                                        <input
                                            type="email"
                                            name="email"
                                            value={companyData.email}
                                            onChange={handleCompanyChange}
                                            placeholder="company@example.com"
                                        />
                                    </div>

                                    <div className="settings-form-group">
                                        <label>
                                            Phone Number
                                        </label>

                                        <input
                                            type="text"
                                            name="phone"
                                            value={companyData.phone}
                                            onChange={handleCompanyChange}
                                            placeholder="Enter phone number"
                                        />
                                    </div>

                                    <div className="settings-form-group full">
                                        <label>
                                            Address
                                        </label>

                                        <textarea
                                            name="address"
                                            value={companyData.address}
                                            onChange={handleCompanyChange}
                                            placeholder="Enter company address"
                                            rows="4"
                                        />
                                    </div>

                                </div>

                                <div className="settings-form-footer">

                                    <button
                                        type="submit"
                                        className="settings-save-btn"
                                    >
                                        <Icon.Save size={17} />
                                        Save Changes
                                    </button>

                                </div>

                            </form>

                        </div>
                    )}

                    {/* =========================================
              NOTIFICATIONS
          ========================================= */}
                    {activeSetting === "notifications" && (
                        <div className="settings-card">

                            <div className="settings-card-header">
                                <div className="settings-card-title-icon">
                                    <Icon.Bell size={21} />
                                </div>

                                <div>
                                    <h2>Notifications</h2>

                                    <p>
                                        Control which notifications you receive.
                                    </p>
                                </div>
                            </div>

                            <div className="settings-toggle-list">

                                <div className="settings-toggle-item">

                                    <div>
                                        <strong>
                                            Attendance Notifications
                                        </strong>

                                        <p>
                                            Get notified when employees check-in
                                            or check-out.
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        className={
                                            notificationData.attendanceNotification
                                                ? "settings-toggle active"
                                                : "settings-toggle"
                                        }
                                        onClick={() =>
                                            handleNotificationChange(
                                                "attendanceNotification"
                                            )
                                        }
                                    >
                                        <span />
                                    </button>

                                </div>

                                <div className="settings-toggle-item">

                                    <div>
                                        <strong>
                                            Leave Notifications
                                        </strong>

                                        <p>
                                            Receive notifications for employee
                                            leave requests.
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        className={
                                            notificationData.leaveNotification
                                                ? "settings-toggle active"
                                                : "settings-toggle"
                                        }
                                        onClick={() =>
                                            handleNotificationChange(
                                                "leaveNotification"
                                            )
                                        }
                                    >
                                        <span />
                                    </button>

                                </div>

                                <div className="settings-toggle-item">

                                    <div>
                                        <strong>
                                            Payroll Notifications
                                        </strong>

                                        <p>
                                            Receive payroll related notifications.
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        className={
                                            notificationData.payrollNotification
                                                ? "settings-toggle active"
                                                : "settings-toggle"
                                        }
                                        onClick={() =>
                                            handleNotificationChange(
                                                "payrollNotification"
                                            )
                                        }
                                    >
                                        <span />
                                    </button>

                                </div>

                            </div>

                            <div className="settings-form-footer">

                                <button
                                    type="button"
                                    className="settings-save-btn"
                                    onClick={handleNotificationSubmit}
                                >
                                    <Icon.Save size={17} />
                                    Save Changes
                                </button>

                            </div>

                        </div>
                    )}

                    {/* =========================================
              SECURITY
          ========================================= */}
                    {activeSetting === "security" && (
                        <div className="settings-card">

                            <div className="settings-card-header">
                                <div className="settings-card-title-icon">
                                    <Icon.Shield size={21} />
                                </div>

                                <div>
                                    <h2>Security</h2>

                                    <p>
                                        Manage account and security preferences.
                                    </p>
                                </div>
                            </div>

                            <div className="security-section">

                                <div className="security-row">

                                    <div>
                                        <strong>
                                            Account Security
                                        </strong>

                                        <p>
                                            Your account is protected using
                                            authentication and authorization.
                                        </p>
                                    </div>

                                    <span className="security-status">
                                        Protected
                                    </span>

                                </div>

                                <div className="security-row">

                                    <div>
                                        <strong>
                                            Password
                                        </strong>

                                        <p>
                                            Change your account password regularly.
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        className="security-action-btn"
                                    >
                                        Change Password
                                    </button>

                                </div>

                            </div>

                        </div>
                    )}

                </section>

            </div>

        </div>
    );
}
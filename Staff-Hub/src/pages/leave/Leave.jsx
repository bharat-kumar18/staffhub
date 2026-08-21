import React, { useEffect, useState } from "react";
import "./Leave.css";

import {
    getLeaveRequests,
    decideLeave,
    getHolidays,
    addHoliday,
    updateHoliday,
    deleteHoliday
} from "../../Services/api";

/* =========================================================
   ICONS
========================================================= */

const Icon = {
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

    Check: ({ size = 17 }) => (
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

    X: ({ size = 17 }) => (
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
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
    ),

    Plus: ({ size = 17 }) => (
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
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
    ),

    Edit: ({ size = 16 }) => (
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
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
        </svg>
    ),

    Trash: ({ size = 16 }) => (
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
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
            <path d="M10 11v6" />
            <path d="M14 11v6" />
            <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
        </svg>
    ),

    Search: ({ size = 17 }) => (
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
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
    ),

    Close: ({ size = 18 }) => (
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
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
    )
};

/* =========================================================
   GET ARRAY FROM API RESPONSE
========================================================= */

const extractArray = (response) => {
    const data = response?.data;

    console.log("API Response:", data);

    // Direct array
    if (Array.isArray(data)) {
        return data;
    }

    // Common response structures
    if (Array.isArray(data?.data)) {
        return data.data;
    }

    if (Array.isArray(data?.leaves)) {
        return data.leaves;
    }

    if (Array.isArray(data?.holidays)) {
        return data.holidays;
    }

    if (Array.isArray(data?.results)) {
        return data.results;
    }

    if (Array.isArray(data?.rows)) {
        return data.rows;
    }

    return [];
};

/* =========================================================
   COMPONENT
========================================================= */

export default function Leave() {

    const [activeTab, setActiveTab] = useState("leaves");

    const [leaves, setLeaves] = useState([]);
    const [holidays, setHolidays] = useState([]);

    const [loading, setLoading] = useState(false);
    const [holidayLoading, setHolidayLoading] = useState(false);

    const [actionLoading, setActionLoading] = useState(null);

    const [search, setSearch] = useState("");

    const [showHolidayModal, setShowHolidayModal] =
        useState(false);

    const [editingHoliday, setEditingHoliday] =
        useState(null);

    const [holidayForm, setHolidayForm] = useState({
        holiday_name: "",
        holiday_date: "",
        description: ""
    });

    /* =========================================================
       FETCH LEAVES
    ========================================================= */

    const fetchLeaves = async () => {

        try {

            setLoading(true);

            const response = await getLeaveRequests();

            console.log(
                "================================="
            );

            console.log(
                "GET LEAVE REQUESTS RESPONSE:",
                response
            );

            console.log(
                "LEAVE RESPONSE DATA:",
                response?.data
            );

            console.log(
                "================================="
            );

            const list = extractArray(response);

            console.log(
                "FINAL LEAVE LIST:",
                list
            );

            setLeaves(list);

        } catch (error) {

            console.error(
                "Fetch leaves error:",
                error
            );

            console.error(
                "Backend error:",
                error?.response?.data
            );

            setLeaves([]);

        } finally {

            setLoading(false);

        }
    };

    /* =========================================================
       FETCH HOLIDAYS
    ========================================================= */

    const fetchHolidays = async () => {

        try {

            setHolidayLoading(true);

            const response = await getHolidays();

            console.log(
                "GET HOLIDAYS RESPONSE:",
                response
            );

            const list = extractArray(response);

            console.log(
                "FINAL HOLIDAY LIST:",
                list
            );

            setHolidays(list);

        } catch (error) {

            console.error(
                "Fetch holidays error:",
                error
            );

            console.error(
                "Backend error:",
                error?.response?.data
            );

            setHolidays([]);

        } finally {

            setHolidayLoading(false);

        }
    };

    /* =========================================================
       INITIAL LOAD
    ========================================================= */

    useEffect(() => {

        fetchLeaves();
        fetchHolidays();

    }, []);

    /* =========================================================
       APPROVE LEAVE
    ========================================================= */

    const handleApprove = async (leave) => {

        const leaveId =
            leave?.id ??
            leave?.leave_id ??
            leave?.leaveId;

        console.log(
            "Approving Leave ID:",
            leaveId
        );

        if (!leaveId) {

            alert("Leave ID not found");

            console.log(
                "Leave object:",
                leave
            );

            return;
        }

        try {

            setActionLoading(leaveId);

            const response = await decideLeave({
                leave_id: leaveId,
                status: "approved"
            });

            console.log(
                "Approve response:",
                response
            );

            alert(
                "Leave approved successfully"
            );

            await fetchLeaves();

        } catch (error) {

            console.error(
                "Approve leave error:",
                error
            );

            console.error(
                "Backend response:",
                error?.response?.data
            );

            alert(
                error?.response?.data?.message ||
                error?.response?.data?.error ||
                "Unable to approve leave"
            );

        } finally {

            setActionLoading(null);

        }
    };

    /* =========================================================
       REJECT LEAVE
    ========================================================= */

    const handleReject = async (leave) => {

        const leaveId =
            leave?.id ??
            leave?.leave_id ??
            leave?.leaveId;

        console.log(
            "Rejecting Leave ID:",
            leaveId
        );

        if (!leaveId) {

            alert("Leave ID not found");

            console.log(
                "Leave object:",
                leave
            );

            return;
        }

        try {

            setActionLoading(leaveId);

            const response = await decideLeave({
                leave_id: leaveId,
                status: "rejected"
            });

            console.log(
                "Reject response:",
                response
            );

            alert(
                "Leave rejected successfully"
            );

            await fetchLeaves();

        } catch (error) {

            console.error(
                "Reject leave error:",
                error
            );

            console.error(
                "Backend response:",
                error?.response?.data
            );

            alert(
                error?.response?.data?.message ||
                error?.response?.data?.error ||
                "Unable to reject leave"
            );

        } finally {

            setActionLoading(null);

        }
    };

    /* =========================================================
       HOLIDAY FORM CHANGE
    ========================================================= */

    const handleHolidayChange = (e) => {

        const {
            name,
            value
        } = e.target;

        setHolidayForm((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    /* =========================================================
       ADD HOLIDAY MODAL
    ========================================================= */

    const openAddHoliday = () => {

        setEditingHoliday(null);

        setHolidayForm({
            holiday_name: "",
            holiday_date: "",
            description: ""
        });

        setShowHolidayModal(true);
    };

    /* =========================================================
       EDIT HOLIDAY
    ========================================================= */

    const openEditHoliday = (holiday) => {

        setEditingHoliday(holiday);

        setHolidayForm({

            holiday_name:
                holiday?.holiday_name ||
                holiday?.name ||
                holiday?.title ||
                "",

            holiday_date:
                holiday?.holiday_date ||
                holiday?.date ||
                "",

            description:
                holiday?.description ||
                ""

        });

        setShowHolidayModal(true);
    };

    /* =========================================================
       SAVE HOLIDAY
    ========================================================= */

    const handleHolidaySubmit = async (e) => {

        e.preventDefault();

        if (!holidayForm.holiday_name.trim()) {

            alert(
                "Holiday name is required"
            );

            return;
        }

        if (!holidayForm.holiday_date) {

            alert(
                "Holiday date is required"
            );

            return;
        }

        try {

            setHolidayLoading(true);

            /* =========================
               UPDATE
            ========================= */

            if (editingHoliday) {

                const holidayId =
                    editingHoliday?.id ??
                    editingHoliday?.holiday_id ??
                    editingHoliday?.holidayId;

                console.log(
                    "Updating Holiday:",
                    holidayId,
                    holidayForm
                );

                if (!holidayId) {

                    alert(
                        "Holiday ID not found"
                    );

                    return;
                }

                const response =
                    await updateHoliday(
                        holidayId,
                        holidayForm
                    );

                console.log(
                    "Update holiday response:",
                    response
                );

                alert(
                    "Holiday updated successfully"
                );

            }

            /* =========================
               ADD
            ========================= */

            else {

                console.log(
                    "Adding Holiday:",
                    holidayForm
                );

                const response =
                    await addHoliday(
                        holidayForm
                    );

                console.log(
                    "Add holiday response:",
                    response
                );

                alert(
                    "Holiday added successfully"
                );
            }

            setShowHolidayModal(false);

            setEditingHoliday(null);

            setHolidayForm({
                holiday_name: "",
                holiday_date: "",
                description: ""
            });

            await fetchHolidays();

        } catch (error) {

            console.error(
                "Holiday save error:",
                error
            );

            console.error(
                "Backend response:",
                error?.response?.data
            );

            alert(
                error?.response?.data?.message ||
                error?.response?.data?.error ||
                "Unable to save holiday"
            );

        } finally {

            setHolidayLoading(false);

        }
    };

    /* =========================================================
       DELETE HOLIDAY
    ========================================================= */

    const handleDeleteHoliday = async (holiday) => {

        const holidayId =
            holiday?.id ??
            holiday?.holiday_id ??
            holiday?.holidayId;

        console.log(
            "Deleting Holiday ID:",
            holidayId
        );

        if (!holidayId) {

            alert(
                "Holiday ID not found"
            );

            return;
        }

        const confirmDelete =
            window.confirm(
                "Are you sure you want to delete this holiday?"
            );

        if (!confirmDelete) {
            return;
        }

        try {

            setHolidayLoading(true);

            const response =
                await deleteHoliday(
                    holidayId
                );

            console.log(
                "Delete holiday response:",
                response
            );

            alert(
                "Holiday deleted successfully"
            );

            await fetchHolidays();

        } catch (error) {

            console.error(
                "Delete holiday error:",
                error
            );

            console.error(
                "Backend response:",
                error?.response?.data
            );

            alert(
                error?.response?.data?.message ||
                error?.response?.data?.error ||
                "Unable to delete holiday"
            );

        } finally {

            setHolidayLoading(false);

        }
    };

    /* =========================================================
       FILTER LEAVES
    ========================================================= */

    const filteredLeaves = leaves.filter(
        (leave) => {

            const employeeName =
                leave?.employee_name ||
                leave?.employeeName ||
                leave?.employee?.name ||
                leave?.name ||
                "";

            const leaveType =
                leave?.leave_type ||
                leave?.leaveType ||
                leave?.type ||
                "";

            const keyword =
                search.trim().toLowerCase();

            return (
                String(employeeName)
                    .toLowerCase()
                    .includes(keyword) ||

                String(leaveType)
                    .toLowerCase()
                    .includes(keyword)
            );
        }
    );

    /* =========================================================
       STATUS
    ========================================================= */

    const getStatus = (status) => {

        const value =
            String(
                status || "pending"
            ).toLowerCase();

        if (
            value === "approved" ||
            value === "approve"
        ) {
            return "approved";
        }

        if (
            value === "rejected" ||
            value === "reject"
        ) {
            return "rejected";
        }

        return "pending";
    };

    /* =========================================================
       FORMAT DATE
    ========================================================= */

    const formatDate = (date) => {

        if (!date) {
            return "-";
        }

        try {

            return new Date(date)
                .toLocaleDateString(
                    "en-IN",
                    {
                        day: "2-digit",
                        month: "short",
                        year: "numeric"
                    }
                );

        } catch {

            return date;

        }
    };

    /* =========================================================
       RENDER
    ========================================================= */

    return (
        <div className="admin-leave-page">

            {/* HEADER */}

            <div className="admin-leave-header">

                <div>

                    <h2>
                        Leave Management
                    </h2>

                    <p>
                        Manage employee leave requests
                        and company holidays
                    </p>

                </div>

            </div>


            {/* TABS */}

            <div className="admin-leave-tabs">

                <button
                    type="button"
                    className={
                        activeTab === "leaves"
                            ? "active"
                            : ""
                    }
                    onClick={() =>
                        setActiveTab("leaves")
                    }
                >
                    <Icon.Calendar size={16} />
                    Leave Requests
                </button>


                <button
                    type="button"
                    className={
                        activeTab === "holidays"
                            ? "active"
                            : ""
                    }
                    onClick={() =>
                        setActiveTab("holidays")
                    }
                >
                    <Icon.Calendar size={16} />
                    Holidays
                </button>

            </div>


            {/* =================================================
                LEAVE REQUESTS
            ================================================= */}

            {activeTab === "leaves" && (

                <section className="admin-leave-card">

                    <div className="admin-leave-card-header">

                        <div>

                            <h3>
                                Employee Leave Requests
                            </h3>

                            <p>
                                Review and manage
                                employee leave applications
                            </p>

                        </div>


                        <div className="admin-leave-search">

                            <Icon.Search size={16} />

                            <input
                                type="text"
                                placeholder="Search employee..."
                                value={search}
                                onChange={(e) =>
                                    setSearch(
                                        e.target.value
                                    )
                                }
                            />

                        </div>

                    </div>


                    <div className="admin-leave-table-wrapper">

                        <table className="admin-leave-table">

                            <thead>

                                <tr>

                                    <th>
                                        Employee
                                    </th>

                                    <th>
                                        Leave Type
                                    </th>

                                    <th>
                                        From
                                    </th>

                                    <th>
                                        To
                                    </th>

                                    <th>
                                        Reason
                                    </th>

                                    <th>
                                        Status
                                    </th>

                                    <th>
                                        Action
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {loading ? (

                                    <tr>

                                        <td
                                            colSpan="7"
                                            className="admin-leave-empty"
                                        >
                                            Loading leaves...
                                        </td>

                                    </tr>

                                ) : filteredLeaves.length === 0 ? (

                                    <tr>

                                        <td
                                            colSpan="7"
                                            className="admin-leave-empty"
                                        >
                                            No leave requests found
                                        </td>

                                    </tr>

                                ) : (

                                    filteredLeaves.map(
                                        (leave, index) => {

                                            const status =
                                                getStatus(
                                                    leave?.status
                                                );

                                            const leaveId =
                                                leave?.id ??
                                                leave?.leave_id ??
                                                leave?.leaveId ??
                                                index;

                                            const employeeName =
                                                leave?.employee_name ||
                                                leave?.employeeName ||
                                                leave?.employee?.name ||
                                                leave?.name ||
                                                "Employee";

                                            const employeeEmail =
                                                leave?.employee_email ||
                                                leave?.employeeEmail ||
                                                leave?.employee?.email ||
                                                leave?.email ||
                                                "";

                                            const leaveType =
                                                leave?.leave_type ||
                                                leave?.leaveType ||
                                                leave?.type ||
                                                "-";

                                            const startDate =
                                                leave?.start_date ||
                                                leave?.from_date ||
                                                leave?.startDate ||
                                                leave?.fromDate;

                                            const endDate =
                                                leave?.end_date ||
                                                leave?.to_date ||
                                                leave?.endDate ||
                                                leave?.toDate;

                                            return (

                                                <tr
                                                    key={leaveId}
                                                >

                                                    {/* EMPLOYEE */}

                                                    <td>

                                                        <div className="admin-employee-cell">

                                                            <div className="admin-employee-avatar">

                                                                {String(
                                                                    employeeName
                                                                )
                                                                    .charAt(0)
                                                                    .toUpperCase()}

                                                            </div>


                                                            <div>

                                                                <strong>
                                                                    {
                                                                        employeeName
                                                                    }
                                                                </strong>

                                                                <span>
                                                                    {
                                                                        employeeEmail
                                                                    }
                                                                </span>

                                                            </div>

                                                        </div>

                                                    </td>


                                                    {/* LEAVE TYPE */}

                                                    <td>
                                                        {
                                                            leaveType
                                                        }
                                                    </td>


                                                    {/* FROM */}

                                                    <td>
                                                        {formatDate(
                                                            startDate
                                                        )}
                                                    </td>


                                                    {/* TO */}

                                                    <td>
                                                        {formatDate(
                                                            endDate
                                                        )}
                                                    </td>


                                                    {/* REASON */}

                                                    <td className="reason-cell">

                                                        {
                                                            leave?.reason ||
                                                            "-"
                                                        }

                                                    </td>


                                                    {/* STATUS */}

                                                    <td>

                                                        <span
                                                            className={`leave-status ${status}`}
                                                        >
                                                            {status}
                                                        </span>

                                                    </td>


                                                    {/* ACTION */}

                                                    <td>

                                                        {status ===
                                                        "pending" ? (

                                                            <div className="leave-action-buttons">

                                                                <button
                                                                    type="button"
                                                                    className="leave-approve-btn"
                                                                    disabled={
                                                                        actionLoading ===
                                                                        leaveId
                                                                    }
                                                                    onClick={() =>
                                                                        handleApprove(
                                                                            leave
                                                                        )
                                                                    }
                                                                    title="Approve"
                                                                >

                                                                    <Icon.Check />

                                                                </button>


                                                                <button
                                                                    type="button"
                                                                    className="leave-reject-btn"
                                                                    disabled={
                                                                        actionLoading ===
                                                                        leaveId
                                                                    }
                                                                    onClick={() =>
                                                                        handleReject(
                                                                            leave
                                                                        )
                                                                    }
                                                                    title="Reject"
                                                                >

                                                                    <Icon.X />

                                                                </button>

                                                            </div>

                                                        ) : (

                                                            <span className="leave-action-done">
                                                                —
                                                            </span>

                                                        )}

                                                    </td>

                                                </tr>

                                            );

                                        }
                                    )

                                )}

                            </tbody>

                        </table>

                    </div>

                </section>

            )}


            {/* =================================================
                HOLIDAYS
            ================================================= */}

            {activeTab === "holidays" && (

                <section className="admin-leave-card">

                    <div className="admin-leave-card-header">

                        <div>

                            <h3>
                                Company Holidays
                            </h3>

                            <p>
                                Manage holidays for your
                                company
                            </p>

                        </div>


                        <button
                            type="button"
                            className="add-holiday-btn"
                            onClick={
                                openAddHoliday
                            }
                        >

                            <Icon.Plus size={16} />

                            Add Holiday

                        </button>

                    </div>


                    <div className="admin-holiday-table-wrapper">

                        <table className="admin-leave-table">

                            <thead>

                                <tr>

                                    <th>
                                        Holiday
                                    </th>

                                    <th>
                                        Date
                                    </th>

                                    <th>
                                        Description
                                    </th>

                                    <th>
                                        Action
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {holidayLoading ? (

                                    <tr>

                                        <td
                                            colSpan="4"
                                            className="admin-leave-empty"
                                        >
                                            Loading holidays...
                                        </td>

                                    </tr>

                                ) : holidays.length === 0 ? (

                                    <tr>

                                        <td
                                            colSpan="4"
                                            className="admin-leave-empty"
                                        >
                                            No holidays found
                                        </td>

                                    </tr>

                                ) : (

                                    holidays.map(
                                        (holiday, index) => {

                                            const holidayId =
                                                holiday?.id ??
                                                holiday?.holiday_id ??
                                                holiday?.holidayId ??
                                                index;

                                            return (

                                                <tr
                                                    key={
                                                        holidayId
                                                    }
                                                >

                                                    <td>

                                                        <div className="holiday-name">

                                                            <div className="holiday-icon">

                                                                <Icon.Calendar
                                                                    size={16}
                                                                />

                                                            </div>


                                                            <strong>

                                                                {
                                                                    holiday?.holiday_name ||
                                                                    holiday?.name ||
                                                                    holiday?.title ||
                                                                    "-"
                                                                }

                                                            </strong>

                                                        </div>

                                                    </td>


                                                    <td>

                                                        {formatDate(
                                                            holiday?.holiday_date ||
                                                            holiday?.date
                                                        )}

                                                    </td>


                                                    <td>

                                                        {
                                                            holiday?.description ||
                                                            "-"
                                                        }

                                                    </td>


                                                    <td>

                                                        <div className="holiday-action-buttons">

                                                            <button
                                                                type="button"
                                                                className="holiday-edit-btn"
                                                                onClick={() =>
                                                                    openEditHoliday(
                                                                        holiday
                                                                    )
                                                                }
                                                                title="Edit"
                                                            >

                                                                <Icon.Edit />

                                                            </button>


                                                            <button
                                                                type="button"
                                                                className="holiday-delete-btn"
                                                                onClick={() =>
                                                                    handleDeleteHoliday(
                                                                        holiday
                                                                    )
                                                                }
                                                                title="Delete"
                                                            >

                                                                <Icon.Trash />

                                                            </button>

                                                        </div>

                                                    </td>

                                                </tr>

                                            );

                                        }
                                    )

                                )}

                            </tbody>

                        </table>

                    </div>

                </section>

            )}


            {/* =================================================
                HOLIDAY MODAL
            ================================================= */}

            {showHolidayModal && (

                <div
                    className="admin-leave-modal-overlay"
                    onClick={() =>
                        setShowHolidayModal(false)
                    }
                >

                    <div
                        className="admin-leave-modal"
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                    >

                        <div className="admin-leave-modal-header">

                            <div>

                                <h3>

                                    {editingHoliday
                                        ? "Update Holiday"
                                        : "Add Holiday"}

                                </h3>

                                <p>
                                    Enter holiday details
                                </p>

                            </div>


                            <button
                                type="button"
                                className="modal-close-btn"
                                onClick={() =>
                                    setShowHolidayModal(
                                        false
                                    )
                                }
                            >

                                <Icon.Close />

                            </button>

                        </div>


                        <form
                            onSubmit={
                                handleHolidaySubmit
                            }
                        >

                            <div className="admin-leave-form-group">

                                <label>

                                    Holiday Name
                                    <span>*</span>

                                </label>


                                <input
                                    type="text"
                                    name="holiday_name"
                                    value={
                                        holidayForm.holiday_name
                                    }
                                    onChange={
                                        handleHolidayChange
                                    }
                                    placeholder="Enter holiday name"
                                    required
                                />

                            </div>


                            <div className="admin-leave-form-group">

                                <label>

                                    Holiday Date
                                    <span>*</span>

                                </label>


                                <input
                                    type="date"
                                    name="holiday_date"
                                    value={
                                        holidayForm.holiday_date
                                    }
                                    onChange={
                                        handleHolidayChange
                                    }
                                    required
                                />

                            </div>


                            <div className="admin-leave-form-group">

                                <label>
                                    Description
                                </label>


                                <textarea
                                    name="description"
                                    value={
                                        holidayForm.description
                                    }
                                    onChange={
                                        handleHolidayChange
                                    }
                                    placeholder="Enter description"
                                    rows="3"
                                />

                            </div>


                            <div className="admin-leave-modal-actions">

                                <button
                                    type="button"
                                    className="cancel-holiday-btn"
                                    onClick={() =>
                                        setShowHolidayModal(
                                            false
                                        )
                                    }
                                >
                                    Cancel
                                </button>


                                <button
                                    type="submit"
                                    className="save-holiday-btn"
                                    disabled={
                                        holidayLoading
                                    }
                                >

                                    {holidayLoading
                                        ? "Saving..."
                                        : editingHoliday
                                        ? "Update Holiday"
                                        : "Add Holiday"}

                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

        </div>
    );
}
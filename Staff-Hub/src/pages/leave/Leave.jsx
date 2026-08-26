import React, { useEffect, useState } from "react";
import "./Leave.css";

import {
    getLeaveRequests,
    decideLeave
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
    )
};


/* =========================================================
   LEAVE COMPONENT
========================================================= */

export default function Leave() {

    const [leaves, setLeaves] = useState([]);

    const [loading, setLoading] = useState(false);

    const [search, setSearch] = useState("");

    const [summary, setSummary] = useState({
        total_requests: 0,
        pending: 0,
        approved: 0,
        rejected: 0
    });


    /* =====================================================
       FETCH ADMIN LEAVE REQUESTS
    ===================================================== */

    const fetchLeaves = async () => {

        try {

            setLoading(true);

            console.log(
                "Fetching admin leave requests..."
            );

            const response = await getLeaveRequests();

            console.log(
                "================================="
            );

            console.log(
                "ADMIN LEAVE API RESPONSE:",
                response.data
            );

            console.log(
                "LEAVE LIST:",
                response.data?.leaves
            );

            console.log(
                "SUMMARY:",
                response.data?.summary
            );

            console.log(
                "================================="
            );


            if (
                response.data?.success &&
                Array.isArray(response.data?.leaves)
            ) {

                setLeaves(
                    response.data.leaves
                );

                setSummary(
                    response.data.summary || {
                        total_requests: 0,
                        pending: 0,
                        approved: 0,
                        rejected: 0
                    }
                );

            } else {

                setLeaves([]);

                setSummary({
                    total_requests: 0,
                    pending: 0,
                    approved: 0,
                    rejected: 0
                });

            }

        } catch (error) {

            console.error(
                "================================="
            );

            console.error(
                "ADMIN LEAVE FETCH ERROR"
            );

            console.error(
                "Status:",
                error.response?.status
            );

            console.error(
                "Response:",
                error.response?.data
            );

            console.error(
                "Message:",
                error.message
            );

            console.error(
                "================================="
            );

            setLeaves([]);

            setSummary({
                total_requests: 0,
                pending: 0,
                approved: 0,
                rejected: 0
            });

        } finally {

            setLoading(false);

        }

    };


    /* =====================================================
       INITIAL LOAD
    ===================================================== */

    useEffect(() => {

        fetchLeaves();

    }, []);


    /* =====================================================
       APPROVE LEAVE
    ===================================================== */

    const handleApprove = async (leave) => {

        const leaveId = leave.leave_id;

        console.log(
            "Approving Leave ID:",
            leaveId
        );

        if (!leaveId) {

            alert("Leave ID not found");

            console.log(
                "Invalid leave object:",
                leave
            );

            return;
        }

        try {

            setLoading(true);

            const response = await decideLeave({

                leave_id: leaveId,

                status: "approved"

            });

            console.log(
                "Approve Leave Response:",
                response.data
            );

            alert(
                "Leave approved successfully"
            );

            await fetchLeaves();

        } catch (error) {

            console.error(
                "Approve Leave Error:",
                error.response?.data || error
            );

            alert(
                error.response?.data?.message ||
                error.response?.data?.error ||
                "Unable to approve leave"
            );

        } finally {

            setLoading(false);

        }

    };


    /* =====================================================
       REJECT LEAVE
    ===================================================== */

    const handleReject = async (leave) => {

        const leaveId = leave.leave_id;

        if (!leaveId) {

            alert("Leave ID not found");

            return;
        }


        const rejectionReason =
            window.prompt(
                "Enter rejection reason:"
            );


        if (
            !rejectionReason ||
            rejectionReason.trim() === ""
        ) {

            return;

        }


        try {

            setLoading(true);

            const response = await decideLeave({

                leave_id: leaveId,

                status: "rejected",

                rejection_reason:
                    rejectionReason.trim()

            });


            console.log(
                "Reject Leave Response:",
                response.data
            );


            alert(
                "Leave rejected successfully"
            );


            await fetchLeaves();

        } catch (error) {

            console.error(
                "Reject Leave Error:",
                error.response?.data || error
            );

            alert(
                error.response?.data?.message ||
                error.response?.data?.error ||
                "Unable to reject leave"
            );

        } finally {

            setLoading(false);

        }

    };


    /* =====================================================
       FILTER LEAVES
    ===================================================== */

    const filteredLeaves =
        leaves.filter((leave) => {

            const employeeName =
                leave.employee_name || "";

            const employeeEmail =
                leave.employee_email || "";

            const leaveType =
                leave.leave_type || "";

            const department =
                leave.department || "";

            const keyword =
                search
                    .toLowerCase()
                    .trim();


            return (

                employeeName
                    .toLowerCase()
                    .includes(keyword) ||

                employeeEmail
                    .toLowerCase()
                    .includes(keyword) ||

                leaveType
                    .toLowerCase()
                    .includes(keyword) ||

                department
                    .toLowerCase()
                    .includes(keyword)

            );

        });


    /* =====================================================
       STATUS
    ===================================================== */

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


    /* =====================================================
       FORMAT DATE
    ===================================================== */

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


    /* =====================================================
       RENDER
    ===================================================== */

    return (

        <div className="admin-leave-page">


            {/* =================================================
                HEADER
            ================================================= */}

            <div className="admin-leave-header">

                <div>

                    <h2>
                        Leave Management
                    </h2>

                    <p>
                        Review and manage employee
                        leave requests
                    </p>

                </div>

            </div>


            {/* =================================================
                SUMMARY
            ================================================= */}

            <div className="leave-summary-grid">

                <div className="leave-summary-card">

                    <span>
                        Total Requests
                    </span>

                    <strong>
                        {summary.total_requests}
                    </strong>

                </div>


                <div className="leave-summary-card">

                    <span>
                        Pending
                    </span>

                    <strong>
                        {summary.pending}
                    </strong>

                </div>


                <div className="leave-summary-card">

                    <span>
                        Approved
                    </span>

                    <strong>
                        {summary.approved}
                    </strong>

                </div>


                <div className="leave-summary-card">

                    <span>
                        Rejected
                    </span>

                    <strong>
                        {summary.rejected}
                    </strong>

                </div>

            </div>


            {/* =================================================
                LEAVE TABLE
            ================================================= */}

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
                                        Loading leave requests...
                                    </td>

                                </tr>

                            ) : filteredLeaves.length === 0 ? (

                                <tr>

                                    <td
                                        colSpan="7"
                                        className="admin-leave-empty"
                                    >

                                        {search
                                            ? "No matching leave requests found"
                                            : "No leave requests found"}

                                    </td>

                                </tr>

                            ) : (

                                filteredLeaves.map(
                                    (leave) => {

                                        const status =
                                            getStatus(
                                                leave.status
                                            );


                                        return (

                                            <tr
                                                key={
                                                    leave.leave_id
                                                }
                                            >


                                                {/* Employee */}

                                                <td>

                                                    <div className="admin-employee-cell">

                                                        <div className="admin-employee-avatar">

                                                            {(
                                                                leave.employee_name ||
                                                                "E"
                                                            )
                                                                .charAt(0)
                                                                .toUpperCase()}

                                                        </div>


                                                        <div>

                                                            <strong>

                                                                {
                                                                    leave.employee_name ||
                                                                    "Employee"
                                                                }

                                                            </strong>

                                                            <span>

                                                                {
                                                                    leave.employee_email ||
                                                                    "-"
                                                                }

                                                            </span>

                                                        </div>

                                                    </div>

                                                </td>


                                                {/* Leave Type */}

                                                <td>

                                                    {
                                                        leave.leave_type ||
                                                        "-"
                                                    }

                                                </td>


                                                {/* From */}

                                                <td>

                                                    {formatDate(
                                                        leave.from_date
                                                    )}

                                                </td>


                                                {/* To */}

                                                <td>

                                                    {formatDate(
                                                        leave.to_date
                                                    )}

                                                </td>


                                                {/* Reason */}

                                                <td className="reason-cell">

                                                    {
                                                        leave.reason ||
                                                        "-"
                                                    }

                                                </td>


                                                {/* Status */}

                                                <td>

                                                    <span
                                                        className={`leave-status ${status}`}
                                                    >

                                                        {status}

                                                    </span>

                                                </td>


                                                {/* Actions */}

                                                <td>

                                                    {status === "pending" ? (

                                                        <div className="leave-action-buttons">

                                                            <button
                                                                type="button"
                                                                className="leave-approve-btn"
                                                                onClick={() =>
                                                                    handleApprove(
                                                                        leave
                                                                    )
                                                                }
                                                                disabled={
                                                                    loading
                                                                }
                                                                title="Approve"
                                                            >

                                                                <Icon.Check />

                                                            </button>


                                                            <button
                                                                type="button"
                                                                className="leave-reject-btn"
                                                                onClick={() =>
                                                                    handleReject(
                                                                        leave
                                                                    )
                                                                }
                                                                disabled={
                                                                    loading
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

        </div>

    );

}
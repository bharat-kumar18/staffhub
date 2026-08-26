import React, { useEffect, useState } from "react";
import "./EmployeeLeave.css";

import {
    applyLeave,
    getMyLeaves,
    deleteLeave,
} from "../../Services/api.js";

import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function EmployeeLeave() {

    /* =====================================================
       FORM STATE
    ===================================================== */

    const [formData, setFormData] = useState({
        leave_type: "",
        from_date: "",
        to_date: "",
        reason: "",
    });

    /* =====================================================
       UI STATES
    ===================================================== */

    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);

    /* =====================================================
       LEAVE HISTORY
    ===================================================== */

    const [leaves, setLeaves] = useState([]);
    const [tableLoading, setTableLoading] = useState(true);

    /* =====================================================
       DELETE STATE
    ===================================================== */

    const [deletingId, setDeletingId] = useState(null);

    /* =====================================================
       FETCH MY LEAVES
    ===================================================== */

    const fetchLeaves = async () => {
        try {
            setTableLoading(true);

            const response = await getMyLeaves();

            console.log(
                "Get My Leaves Response:",
                response.data
            );

            const payload = response.data;

            /*
             * Handle different possible backend responses
             */

            let list = [];

            if (Array.isArray(payload)) {
                list = payload;
            }
            else if (Array.isArray(payload?.leaves)) {
                list = payload.leaves;
            }
            else if (Array.isArray(payload?.leaveHistory)) {
                list = payload.leaveHistory;
            }
            else if (Array.isArray(payload?.leaveRequests)) {
                list = payload.leaveRequests;
            }
            else if (Array.isArray(payload?.data)) {
                list = payload.data;
            }
            else if (Array.isArray(payload?.data?.leaves)) {
                list = payload.data.leaves;
            }
            else if (Array.isArray(payload?.data?.leaveHistory)) {
                list = payload.data.leaveHistory;
            }
            else if (payload?.leave) {
                list = [payload.leave];
            }

            console.log(
                "Parsed Leave History:",
                list
            );

            setLeaves(
                Array.isArray(list)
                    ? list
                    : []
            );

        } catch (error) {

            console.error(
                "Fetch Leaves Error:",
                error
            );

            setLeaves([]);

            toast.error(
                error.response?.data?.message ||
                "Unable to load leave history"
            );

        } finally {

            setTableLoading(false);

        }
    };

    /* =====================================================
       LOAD LEAVE HISTORY ON PAGE LOAD / REFRESH
    ===================================================== */

    useEffect(() => {
        fetchLeaves();
    }, []);

    /* =====================================================
       HANDLE INPUT CHANGE
    ===================================================== */

    const handleChange = (e) => {

        const {
            name,
            value
        } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    /* =====================================================
       RESET FORM
    ===================================================== */

    const resetForm = () => {

        setFormData({
            leave_type: "",
            from_date: "",
            to_date: "",
            reason: "",
        });

    };

    /* =====================================================
       TOGGLE FORM
    ===================================================== */

    const handleToggleForm = () => {

        if (showForm) {
            resetForm();
        }

        setShowForm((prev) => !prev);
    };

    /* =====================================================
       DELETE LEAVE
    ===================================================== */

    const handleDelete = async (leave) => {

        const id =
            leave._id ||
            leave.id ||
            leave.leave_id;

        if (!id) {

            toast.error(
                "Leave ID not found"
            );

            return;
        }

        const confirmed = window.confirm(
            "Are you sure you want to delete this leave request?"
        );

        if (!confirmed) {
            return;
        }

        try {

            setDeletingId(id);

            const response = await deleteLeave(id);

            console.log(
                "Delete Leave Response:",
                response.data
            );

            if (response.data?.success !== false) {

                toast.success(
                    response.data?.message ||
                    "Leave request deleted successfully"
                );

                /*
                 * Remove deleted leave from UI
                 */

                setLeaves((prev) =>
                    prev.filter(
                        (item) =>
                            (
                                item._id ||
                                item.id ||
                                item.leave_id
                            ) !== id
                    )
                );

            } else {

                toast.error(
                    response.data?.message ||
                    "Unable to delete leave"
                );

            }

        } catch (error) {

            console.error(
                "Delete Leave Error:",
                error
            );

            toast.error(
                error.response?.data?.message ||
                "Unable to delete leave"
            );

        } finally {

            setDeletingId(null);

        }
    };

    /* =====================================================
       APPLY LEAVE
    ===================================================== */

    const handleSubmit = async (e) => {

        e.preventDefault();

        /* =================================================
           VALIDATION
        ================================================= */

        if (!formData.leave_type) {

            toast.error(
                "Please select leave type"
            );

            return;
        }

        if (!formData.from_date) {

            toast.error(
                "Please select from date"
            );

            return;
        }

        if (!formData.to_date) {

            toast.error(
                "Please select to date"
            );

            return;
        }

        if (!formData.reason.trim()) {

            toast.error(
                "Please enter leave reason"
            );

            return;
        }

        if (
            new Date(formData.from_date) >
            new Date(formData.to_date)
        ) {

            toast.error(
                "From date cannot be greater than to date"
            );

            return;
        }

        try {

            setLoading(true);

            /* =================================================
               APPLY LEAVE API
            ================================================= */

            const response = await applyLeave(
                formData
            );

            console.log(
                "Apply Leave Response:",
                response.data
            );

            if (response.data?.success !== false) {

                toast.success(
                    response.data?.message ||
                    "Leave request submitted successfully",
                    {
                        autoClose: 1500,
                    }
                );

                /*
                 * If API returns newly created leave,
                 * add it directly to UI.
                 */

                const savedLeave =
                    response.data?.leave ||
                    response.data?.leaveRequest ||
                    response.data?.data?.leave ||
                    response.data?.data;

                if (
                    savedLeave &&
                    typeof savedLeave === "object" &&
                    !Array.isArray(savedLeave)
                ) {

                    setLeaves((prev) => [
                        savedLeave,
                        ...prev,
                    ]);

                } else {

                    /*
                     * If API doesn't return leave object,
                     * fetch complete history from backend.
                     */

                    await fetchLeaves();
                }

                resetForm();
                setShowForm(false);

            } else {

                toast.error(
                    response.data?.message ||
                    "Unable to apply leave"
                );

            }

        } catch (error) {

            console.error(
                "Apply Leave Error:",
                error
            );

            toast.error(
                error.response?.data?.message ||
                "Unable to apply leave"
            );

        } finally {

            setLoading(false);

        }
    };

    /* =====================================================
       FORMAT DATE
    ===================================================== */

    const formatDate = (date) => {

        if (!date) {
            return "-";
        }

        try {

            return new Date(date).toLocaleDateString(
                "en-IN",
                {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                }
            );

        } catch {

            return "-";

        }
    };

    /* =====================================================
       STATUS CLASS
    ===================================================== */

    const statusClass = (status) => {

        const value = (
            status || "pending"
        ).toLowerCase();

        return `employee-leave-status employee-leave-status-${value}`;
    };

    /* =====================================================
       GET LEAVE FIELD
    ===================================================== */

    const getLeaveType = (leave) => {
        return (
            leave.leave_type ||
            leave.leaveType ||
            leave.type ||
            "-"
        );
    };

    const getFromDate = (leave) => {
        return (
            leave.from_date ||
            leave.fromDate ||
            leave.start_date ||
            leave.startDate
        );
    };

    const getToDate = (leave) => {
        return (
            leave.to_date ||
            leave.toDate ||
            leave.end_date ||
            leave.endDate
        );
    };

    const getReason = (leave) => {
        return (
            leave.reason ||
            leave.leave_reason ||
            "-"
        );
    };

    const getStatus = (leave) => {
        return (
            leave.status ||
            leave.leave_status ||
            "pending"
        );
    };

    const getLeaveId = (leave) => {
        return (
            leave._id ||
            leave.id ||
            leave.leave_id
        );
    };

    /* =====================================================
       RENDER
    ===================================================== */

    return (

        <div className="employee-leave-page">

            {/* =================================================
                PAGE HEADER
            ================================================= */}

            <div className="employee-leave-header">

                <div>

                    <h2>
                        My Leave
                    </h2>

                    <p>
                        Apply for leave and manage your leave request.
                    </p>

                </div>

                <button
                    type="button"
                    className="employee-leave-toggle-btn"
                    onClick={handleToggleForm}
                >

                    {showForm
                        ? "Close Form"
                        : "+ Apply Leave"}

                </button>

            </div>


            {/* =================================================
                APPLY LEAVE FORM
            ================================================= */}

            {showForm && (

                <div className="employee-leave-card">

                    <div className="employee-leave-card-header">

                        <div>

                            <h3>
                                Apply Leave
                            </h3>

                            <p>
                                Submit your leave request to your admin.
                            </p>

                        </div>

                    </div>


                    <form
                        className="employee-leave-form"
                        onSubmit={handleSubmit}
                    >

                        {/* LEAVE TYPE */}

                        <div className="employee-leave-form-group">

                            <label htmlFor="leave_type">

                                Leave Type

                                <span>*</span>

                            </label>

                            <select
                                id="leave_type"
                                name="leave_type"
                                value={formData.leave_type}
                                onChange={handleChange}
                                disabled={loading}
                            >

                                <option value="">
                                    Select leave type
                                </option>

                                <option value="casual">
                                    Casual Leave
                                </option>

                                <option value="sick">
                                    Sick Leave
                                </option>

                                <option value="earned">
                                    Earned Leave
                                </option>

                                <option value="unpaid">
                                    Unpaid Leave
                                </option>

                            </select>

                        </div>


                        {/* DATE ROW */}

                        <div className="employee-leave-date-row">

                            {/* FROM DATE */}

                            <div className="employee-leave-form-group">

                                <label htmlFor="from_date">

                                    From Date

                                    <span>*</span>

                                </label>

                                <input
                                    id="from_date"
                                    type="date"
                                    name="from_date"
                                    value={formData.from_date}
                                    onChange={handleChange}
                                    disabled={loading}
                                />

                            </div>


                            {/* TO DATE */}

                            <div className="employee-leave-form-group">

                                <label htmlFor="to_date">

                                    To Date

                                    <span>*</span>

                                </label>

                                <input
                                    id="to_date"
                                    type="date"
                                    name="to_date"
                                    value={formData.to_date}
                                    onChange={handleChange}
                                    disabled={loading}
                                />

                            </div>

                        </div>


                        {/* REASON */}

                        <div className="employee-leave-form-group">

                            <label htmlFor="reason">

                                Reason

                                <span>*</span>

                            </label>

                            <textarea
                                id="reason"
                                name="reason"
                                value={formData.reason}
                                onChange={handleChange}
                                placeholder="Enter reason for leave..."
                                rows="5"
                                disabled={loading}
                            />

                        </div>


                        {/* SUBMIT */}

                        <div className="employee-leave-form-actions">

                            <button
                                type="submit"
                                className="employee-leave-submit-btn"
                                disabled={loading}
                            >

                                {loading
                                    ? "Submitting..."
                                    : "Apply Leave"}

                            </button>

                        </div>

                    </form>

                </div>

            )}


            {/* =================================================
                LEAVE HISTORY
            ================================================= */}

            <div className="employee-leave-card employee-leave-table-card">

                <div className="employee-leave-card-header">

                    <div>

                        <h3>
                            My Leave History
                        </h3>

                        <p>
                            View your submitted leave requests.
                        </p>

                    </div>

                </div>


                <div className="employee-leave-table-wrapper">

                    <table className="employee-leave-table">

                        <thead>

                            <tr>

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
                                    Actions
                                </th>

                            </tr>

                        </thead>


                        <tbody>

                            {/* LOADING */}

                            {tableLoading && (

                                <tr>

                                    <td
                                        colSpan="6"
                                        className="employee-leave-table-empty"
                                    >
                                        Loading leave history...
                                    </td>

                                </tr>

                            )}


                            {/* EMPTY */}

                            {!tableLoading &&
                                leaves.length === 0 && (

                                    <tr>

                                        <td
                                            colSpan="6"
                                            className="employee-leave-table-empty"
                                        >
                                            No leave requests found.
                                        </td>

                                    </tr>

                                )}


                            {/* LEAVE LIST */}

                            {!tableLoading &&
                                leaves.length > 0 &&
                                leaves.map((leave, index) => {

                                    const id =
                                        getLeaveId(leave) ||
                                        `leave-${index}`;

                                    const status =
                                        getStatus(leave);

                                    return (

                                        <tr key={id}>

                                            {/* LEAVE TYPE */}

                                            <td className="employee-leave-type-cell">

                                                {getLeaveType(
                                                    leave
                                                )}

                                            </td>


                                            {/* FROM */}

                                            <td>

                                                {formatDate(
                                                    getFromDate(
                                                        leave
                                                    )
                                                )}

                                            </td>


                                            {/* TO */}

                                            <td>

                                                {formatDate(
                                                    getToDate(
                                                        leave
                                                    )
                                                )}

                                            </td>


                                            {/* REASON */}

                                            <td className="employee-leave-reason-cell">

                                                {getReason(
                                                    leave
                                                )}

                                            </td>


                                            {/* STATUS */}

                                            <td>

                                                <span
                                                    className={statusClass(
                                                        status
                                                    )}
                                                >

                                                    {String(
                                                        status
                                                    )}

                                                </span>

                                            </td>


                                            {/* DELETE */}

                                            <td>

                                                <div className="employee-leave-actions-cell">

                                                    <button
                                                        type="button"
                                                        className="employee-leave-action-btn employee-leave-delete-btn"
                                                        onClick={() =>
                                                            handleDelete(
                                                                leave
                                                            )
                                                        }
                                                        disabled={
                                                            deletingId ===
                                                            id
                                                        }
                                                        title="Delete leave request"
                                                    >

                                                        {deletingId ===
                                                        id
                                                            ? "Deleting..."
                                                            : "Delete"}

                                                    </button>

                                                </div>

                                            </td>

                                        </tr>

                                    );

                                })}

                        </tbody>

                    </table>

                </div>

            </div>

        </div>
    );
}
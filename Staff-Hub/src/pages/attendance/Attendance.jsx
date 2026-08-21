import React, { useEffect, useState } from "react";
import "./Attendance.css";

import {
    getAttendance,
    checkIn,
    checkOut,
    modifyAttendance,
} from "../../Services/api";

import { toast } from "react-toastify";


/* =====================================================
   ICONS
===================================================== */

const Icon = {

    Search: () => (
        <svg
            viewBox="0 0 24 24"
            width="18"
            height="18"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="11" cy="11" r="7" />
            <line x1="16" y1="16" x2="21" y2="21" />
        </svg>
    ),

    Filter: () => (
        <svg
            viewBox="0 0 24 24"
            width="18"
            height="18"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="7" y1="12" x2="17" y2="12" />
            <line x1="10" y1="18" x2="14" y2="18" />
        </svg>
    ),

    Plus: () => (
        <svg
            viewBox="0 0 24 24"
            width="17"
            height="17"
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

    Edit: () => (
        <svg
            viewBox="0 0 24 24"
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" />
        </svg>
    ),

    Check: () => (
        <svg
            viewBox="0 0 24 24"
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <polyline points="20 6 9 17 4 12" />
        </svg>
    ),

    More: () => (
        <svg
            viewBox="0 0 24 24"
            width="18"
            height="18"
            fill="currentColor"
        >
            <circle cx="12" cy="5" r="1.5" />
            <circle cx="12" cy="12" r="1.5" />
            <circle cx="12" cy="19" r="1.5" />
        </svg>
    ),

    Sliders: () => (
        <svg
            viewBox="0 0 24 24"
            width="18"
            height="18"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <line x1="4" y1="6" x2="20" y2="6" />
            <circle cx="9" cy="6" r="2" />

            <line x1="4" y1="12" x2="20" y2="12" />
            <circle cx="15" cy="12" r="2" />

            <line x1="4" y1="18" x2="20" y2="18" />
            <circle cx="11" cy="18" r="2" />
        </svg>
    ),

    Location: () => (
        <svg
            viewBox="0 0 24 24"
            width="17"
            height="17"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
            <circle cx="12" cy="10" r="2.5" />
        </svg>
    ),

};


/* =====================================================
   ATTENDANCE COMPONENT
===================================================== */

export default function Attendance() {

    const [attendance, setAttendance] = useState([]);

    const [loading, setLoading] = useState(false);

    const [search, setSearch] = useState("");

    const [activeTab, setActiveTab] = useState("validate");

    const [selectedRows, setSelectedRows] = useState([]);

    const [showEditModal, setShowEditModal] = useState(false);

    const [editingAttendance, setEditingAttendance] = useState(null);

    const [updateLoading, setUpdateLoading] = useState(false);

    const [locationLoading, setLocationLoading] = useState(false);

    const [editForm, setEditForm] = useState({
        check_in: "",
        check_out: "",
        status: "present",
    });


    /* =====================================================
       GET CURRENT LOCATION
    ===================================================== */

    const getCurrentLocation = () => {

        return new Promise((resolve, reject) => {

            if (!navigator.geolocation) {

                reject(
                    new Error(
                        "Geolocation is not supported by your browser."
                    )
                );

                return;
            }


            navigator.geolocation.getCurrentPosition(

                (position) => {

                    const latitude =
                        position.coords.latitude;

                    const longitude =
                        position.coords.longitude;


                    console.log(
                        "Current Latitude:",
                        latitude
                    );

                    console.log(
                        "Current Longitude:",
                        longitude
                    );


                    resolve({
                        latitude,
                        longitude,
                    });

                },

                (error) => {

                    console.error(
                        "Location Error:",
                        error
                    );


                    switch (error.code) {

                        case error.PERMISSION_DENIED:

                            reject(
                                new Error(
                                    "Location permission denied. Please allow location access."
                                )
                            );

                            break;


                        case error.POSITION_UNAVAILABLE:

                            reject(
                                new Error(
                                    "Location information is unavailable."
                                )
                            );

                            break;


                        case error.TIMEOUT:

                            reject(
                                new Error(
                                    "Location request timed out. Please try again."
                                )
                            );

                            break;


                        default:

                            reject(
                                new Error(
                                    "Unable to get your current location."
                                )
                            );

                    }

                },

                {
                    enableHighAccuracy: true,
                    timeout: 15000,
                    maximumAge: 0,
                }

            );

        });

    };


    /* =====================================================
       FETCH ATTENDANCE
    ===================================================== */

    const fetchAttendance = async () => {

        try {

            setLoading(true);


            const response = await getAttendance({

                searchByKeyword: search,

                page: 1,

                limit: 50,

            });


            console.log(
                "Attendance API Response:",
                response.data
            );


            const result = response.data;


            const rows =
                result?.data ||
                result?.attendance ||
                result?.attendances ||
                result?.rows ||
                [];


            setAttendance(
                Array.isArray(rows)
                    ? rows
                    : []
            );


        } catch (error) {

            console.error(
                "Attendance fetch error:",
                error
            );


            toast.error(
                error?.response?.data?.message ||
                "Unable to fetch attendance"
            );


        } finally {

            setLoading(false);

        }

    };


    /* =====================================================
       INITIAL FETCH
    ===================================================== */

    useEffect(() => {

        fetchAttendance();

    }, []);


    /* =====================================================
       SEARCH
    ===================================================== */

    const filteredAttendance =
        attendance.filter((item) => {

            const employeeName =
                item.employee_name ||
                item.employeeName ||
                item.name ||
                item.employee?.name ||
                "";


            return employeeName
                .toLowerCase()
                .includes(
                    search.toLowerCase()
                );

        });


    /* =====================================================
       SELECT ALL
    ===================================================== */

    const handleSelectAll = (e) => {

        if (e.target.checked) {

            setSelectedRows(

                filteredAttendance.map(
                    (item) =>
                        item.id ||
                        item.attendance_id ||
                        item.attendanceId
                )

            );

        } else {

            setSelectedRows([]);

        }

    };


    /* =====================================================
       SELECT SINGLE
    ===================================================== */

    const handleSelectRow = (id) => {

        setSelectedRows((prev) => {

            if (prev.includes(id)) {

                return prev.filter(
                    (item) => item !== id
                );

            }

            return [
                ...prev,
                id
            ];

        });

    };


    /* =====================================================
       EDIT ATTENDANCE
    ===================================================== */

    const handleEdit = (item) => {

        setEditingAttendance(item);


        setEditForm({

            check_in:
                item.check_in ||
                item.checkIn ||
                "",

            check_out:
                item.check_out ||
                item.checkOut ||
                "",

            status:
                item.status ||
                "present",

        });


        setShowEditModal(true);

    };


    /* =====================================================
       UPDATE ATTENDANCE
    ===================================================== */

    const handleUpdate = async (e) => {

        e.preventDefault();


        const attendanceId =
            editingAttendance?.id ||
            editingAttendance?.attendance_id ||
            editingAttendance?.attendanceId;


        if (!attendanceId) {

            toast.error(
                "Attendance ID missing, cannot update"
            );

            return;

        }


        try {

            setUpdateLoading(true);


            const payload = {

                id: attendanceId,

                status: editForm.status,

                check_in:
                    editForm.check_in.trim() === ""
                        ? undefined
                        : editForm.check_in,

                check_out:
                    editForm.check_out.trim() === ""
                        ? undefined
                        : editForm.check_out,

            };


            const response =
                await modifyAttendance(
                    payload
                );


            console.log(
                "Modify Attendance Response:",
                response.data
            );


            if (response?.data?.success) {

                toast.success(
                    response?.data?.message ||
                    "Attendance updated successfully"
                );


                setShowEditModal(false);

                setEditingAttendance(null);


                fetchAttendance();

            } else {

                toast.error(
                    response?.data?.message ||
                    "Unable to update attendance"
                );

            }


        } catch (error) {

            console.error(
                "Modify attendance error:",
                error
            );


            toast.error(
                error?.response?.data?.message ||
                "Unable to update attendance"
            );


        } finally {

            setUpdateLoading(false);

        }

    };


    /* =====================================================
       CHECK IN WITH CURRENT LOCATION
    ===================================================== */

    const handleCheckIn = async () => {

        if (locationLoading) {
            return;
        }


        try {

            setLocationLoading(true);


            toast.info(
                "Getting your current location..."
            );


            const location =
                await getCurrentLocation();


            console.log(
                "Check-In Location:",
                location
            );


            const payload = {

                latitude:
                    location.latitude,

                longitude:
                    location.longitude,

            };


            console.log(
                "Check-In Payload:",
                payload
            );


            const response =
                await checkIn(payload);


            console.log(
                "Check-In Response:",
                response.data
            );


            if (response?.data?.success) {

                toast.success(
                    response?.data?.message ||
                    "Check-in successful"
                );


                fetchAttendance();

            } else {

                toast.error(
                    response?.data?.message ||
                    "Check-in failed"
                );

            }


        } catch (error) {

            console.error(
                "Check-in error:",
                error
            );


            toast.error(
                error?.response?.data?.message ||
                error?.message ||
                "Check-in failed"
            );


        } finally {

            setLocationLoading(false);

        }

    };


    /* =====================================================
       CHECK OUT WITH CURRENT LOCATION
    ===================================================== */

    const handleCheckOut = async () => {

        if (locationLoading) {
            return;
        }


        try {

            setLocationLoading(true);


            toast.info(
                "Getting your current location..."
            );


            const location =
                await getCurrentLocation();


            console.log(
                "Check-Out Location:",
                location
            );


            const payload = {

                latitude:
                    location.latitude,

                longitude:
                    location.longitude,

            };


            console.log(
                "Check-Out Payload:",
                payload
            );


            const response =
                await checkOut(payload);


            console.log(
                "Check-Out Response:",
                response.data
            );


            if (response?.data?.success) {

                toast.success(
                    response?.data?.message ||
                    "Check-out successful"
                );


                fetchAttendance();

            } else {

                toast.error(
                    response?.data?.message ||
                    "Check-out failed"
                );

            }


        } catch (error) {

            console.error(
                "Check-out error:",
                error
            );


            toast.error(
                error?.response?.data?.message ||
                error?.message ||
                "Check-out failed"
            );


        } finally {

            setLocationLoading(false);

        }

    };


    /* =====================================================
       FORMAT VALUES
    ===================================================== */

    const getEmployeeName = (item) => {

        return (
            item.employee_name ||
            item.employeeName ||
            item.name ||
            item.employee?.name ||
            "Unknown Employee"
        );

    };


    const getEmployeeCode = (item) => {

        return (
            item.employee_code ||
            item.employeeCode ||
            item.employee?.employee_code ||
            item.employee?.employeeCode ||
            ""
        );

    };


    const getDate = (item) => {

        return (
            item.date ||
            item.attendance_date ||
            item.attendanceDate ||
            "-"
        );

    };


    const getCheckIn = (item) => {

        return (
            item.check_in ||
            item.checkIn ||
            "None"
        );

    };


    const getCheckOut = (item) => {

        return (
            item.check_out ||
            item.checkOut ||
            "None"
        );

    };


    const getShift = (item) => {

        return (
            item.shift ||
            item.shift_name ||
            item.shiftName ||
            "Regular Shift"
        );

    };


    const getAtWork = (item) => {

        return (
            item.at_work ||
            item.atWork ||
            item.work_duration ||
            item.workDuration ||
            "00:00"
        );

    };


    /* =====================================================
       JSX
    ===================================================== */

    return (

        <div className="attendance-page">


            {/* =================================================
                PAGE HEADER
            ================================================= */}

            <div className="attendance-header">

                <h2>
                    Attendances
                </h2>


                <div className="attendance-header-actions">


                    {/* SEARCH */}

                    <div className="attendance-search">

                        <Icon.Search />

                        <input
                            type="text"
                            placeholder="Search"
                            value={search}
                            onChange={(e) =>
                                setSearch(
                                    e.target.value
                                )
                            }
                        />

                    </div>


                    {/* FILTER */}

                    <button
                        className="attendance-outline-btn"
                    >

                        <Icon.Filter />

                        Filter

                    </button>


                    {/* ACTIONS */}

                    <button
                        className="attendance-outline-btn"
                    >

                        <Icon.Sliders />

                        Actions

                    </button>


                    {/* CHECK IN */}

                    <button
                        className="attendance-create-btn"
                        onClick={handleCheckIn}
                        disabled={locationLoading}
                    >

                        <Icon.Location />

                        {locationLoading
                            ? "Getting Location..."
                            : "Check In"}

                    </button>


                    {/* CHECK OUT */}

                    <button
                        className="attendance-outline-btn"
                        onClick={handleCheckOut}
                        disabled={locationLoading}
                    >

                        <Icon.Check />

                        {locationLoading
                            ? "Please Wait..."
                            : "Check Out"}

                    </button>


                </div>

            </div>


            {/* =================================================
                ATTENDANCE CARD
            ================================================= */}

            <div className="attendance-container">


                {/* =================================================
                    TABS
                ================================================= */}

                <div className="attendance-tabs">


                    <button
                        className={`attendance-tab ${
                            activeTab === "validate"
                                ? "active"
                                : ""
                        }`}
                        onClick={() =>
                            setActiveTab(
                                "validate"
                            )
                        }
                    >

                        <span className="attendance-count">
                            1
                        </span>

                        Attendance To Validate

                        <Icon.More />

                    </button>


                    <button
                        className={`attendance-tab ${
                            activeTab === "ot"
                                ? "active"
                                : ""
                        }`}
                        onClick={() =>
                            setActiveTab("ot")
                        }
                    >

                        <span className="attendance-count">
                            721
                        </span>

                        OT Attendances

                        <Icon.More />

                    </button>


                    <button
                        className={`attendance-tab ${
                            activeTab === "validated"
                                ? "active"
                                : ""
                        }`}
                        onClick={() =>
                            setActiveTab(
                                "validated"
                            )
                        }
                    >

                        <span className="attendance-count">
                            761
                        </span>

                        Validated Attendances

                    </button>


                </div>


                {/* =================================================
                    SELECT BUTTON
                ================================================= */}

                <div className="attendance-select-row">

                    <button
                        className="attendance-select-btn"
                    >

                        Select (
                        {selectedRows.length}
                        )

                    </button>

                </div>


                {/* =================================================
                    TABLE
                ================================================= */}

                <div className="attendance-table-wrapper">

                    <table className="attendance-table">


                        <thead>

                            <tr>


                                {/* CHECKBOX */}

                                <th className="check-column">

                                    <input
                                        type="checkbox"
                                        onChange={
                                            handleSelectAll
                                        }
                                    />

                                </th>


                                {/* EMPLOYEE */}

                                <th>

                                    <span className="sort-icon">
                                        ↕
                                    </span>

                                    Employee

                                </th>


                                {/* DATE */}

                                <th>

                                    <span className="sort-icon">
                                        ↕
                                    </span>

                                    Date

                                </th>


                                {/* CHECK IN */}

                                <th>

                                    <span className="sort-icon">
                                        ↕
                                    </span>

                                    Check-In

                                </th>


                                {/* CHECK OUT */}

                                <th>

                                    <span className="sort-icon">
                                        ↕
                                    </span>

                                    Check-Out

                                </th>


                                {/* SHIFT */}

                                <th>

                                    <span className="sort-icon">
                                        ↕
                                    </span>

                                    Shift

                                </th>


                                {/* AT WORK */}

                                <th>

                                    <span className="sort-icon">
                                        ↕
                                    </span>

                                    At Work

                                </th>


                                {/* ACTIONS */}

                                <th>

                                    Actions

                                    <span className="table-settings">

                                        <Icon.Sliders />

                                    </span>

                                </th>


                            </tr>

                        </thead>


                        <tbody>


                            {/* LOADING */}

                            {loading ? (

                                <tr>

                                    <td
                                        colSpan="8"
                                        className="attendance-loading"
                                    >

                                        Loading attendance...

                                    </td>

                                </tr>


                            ) : filteredAttendance.length === 0 ? (

                                /* EMPTY */

                                <tr>

                                    <td
                                        colSpan="8"
                                        className="attendance-empty"
                                    >

                                        No attendance records found

                                    </td>

                                </tr>


                            ) : (

                                /* DATA */

                                filteredAttendance.map(
                                    (item, index) => {


                                        const id =
                                            item.id ||
                                            item.attendance_id ||
                                            item.attendanceId ||
                                            index;


                                        const employeeName =
                                            getEmployeeName(
                                                item
                                            );


                                        const employeeCode =
                                            getEmployeeCode(
                                                item
                                            );


                                        return (

                                            <tr
                                                key={id}
                                            >


                                                {/* CHECKBOX */}

                                                <td>

                                                    <input
                                                        type="checkbox"
                                                        checked={
                                                            selectedRows.includes(
                                                                id
                                                            )
                                                        }
                                                        onChange={() =>
                                                            handleSelectRow(
                                                                id
                                                            )
                                                        }
                                                    />

                                                </td>


                                                {/* EMPLOYEE */}

                                                <td>

                                                    <div className="employee-cell">


                                                        <div className="employee-avatar">

                                                            {employeeName
                                                                .substring(
                                                                    0,
                                                                    2
                                                                )
                                                                .toUpperCase()}

                                                        </div>


                                                        <div>

                                                            <span className="employee-name">

                                                                {
                                                                    employeeName
                                                                }

                                                            </span>


                                                            {employeeCode && (

                                                                <span className="employee-code">

                                                                    (
                                                                    {
                                                                        employeeCode
                                                                    }
                                                                    )

                                                                </span>

                                                            )}

                                                        </div>


                                                    </div>

                                                </td>


                                                {/* DATE */}

                                                <td>

                                                    {
                                                        getDate(
                                                            item
                                                        )
                                                    }

                                                </td>


                                                {/* CHECK IN */}

                                                <td>

                                                    {
                                                        getCheckIn(
                                                            item
                                                        )
                                                    }

                                                </td>


                                                {/* CHECK OUT */}

                                                <td>

                                                    {
                                                        getCheckOut(
                                                            item
                                                        )
                                                    }

                                                </td>


                                                {/* SHIFT */}

                                                <td>

                                                    {
                                                        getShift(
                                                            item
                                                        )
                                                    }

                                                </td>


                                                {/* AT WORK */}

                                                <td>

                                                    {
                                                        getAtWork(
                                                            item
                                                        )
                                                    }

                                                </td>


                                                {/* ACTION */}

                                                <td>

                                                    <div className="attendance-actions">


                                                        <button
                                                            className="row-action edit"
                                                            title="Edit"
                                                            onClick={() =>
                                                                handleEdit(
                                                                    item
                                                                )
                                                            }
                                                        >

                                                            <Icon.Edit />

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

            </div>


            {/* =================================================
                EDIT MODAL
            ================================================= */}

            {showEditModal && (

                <div className="attendance-modal-overlay">


                    <div className="attendance-modal">


                        {/* MODAL HEADER */}

                        <div className="attendance-modal-header">

                            <h3>
                                Modify Attendance
                            </h3>


                            <button
                                type="button"
                                onClick={() =>
                                    setShowEditModal(
                                        false
                                    )
                                }
                            >

                                ×

                            </button>

                        </div>


                        {/* FORM */}

                        <form
                            onSubmit={
                                handleUpdate
                            }
                        >


                            <div className="attendance-form-grid">


                                {/* CHECK IN */}

                                <div className="attendance-form-group">

                                    <label>
                                        Check-In
                                    </label>


                                    <input
                                        type="text"
                                        value={
                                            editForm.check_in
                                        }
                                        onChange={(e) =>
                                            setEditForm({
                                                ...editForm,
                                                check_in:
                                                    e.target
                                                        .value,
                                            })
                                        }
                                        placeholder="07:10:00"
                                    />

                                </div>


                                {/* CHECK OUT */}

                                <div className="attendance-form-group">

                                    <label>
                                        Check-Out
                                    </label>


                                    <input
                                        type="text"
                                        value={
                                            editForm.check_out
                                        }
                                        onChange={(e) =>
                                            setEditForm({
                                                ...editForm,
                                                check_out:
                                                    e.target
                                                        .value,
                                            })
                                        }
                                        placeholder="18:00:00"
                                    />

                                </div>


                                {/* STATUS */}

                                <div className="attendance-form-group">

                                    <label>
                                        Status
                                    </label>


                                    <select
                                        value={
                                            editForm.status
                                        }
                                        onChange={(e) =>
                                            setEditForm({
                                                ...editForm,
                                                status:
                                                    e.target
                                                        .value,
                                            })
                                        }
                                    >

                                        <option value="present">
                                            Present
                                        </option>

                                        <option value="late">
                                            Late
                                        </option>

                                        <option value="absent">
                                            Absent
                                        </option>

                                    </select>

                                </div>


                            </div>


                            {/* MODAL FOOTER */}

                            <div className="attendance-modal-footer">


                                <button
                                    type="button"
                                    className="modal-cancel"
                                    onClick={() =>
                                        setShowEditModal(
                                            false
                                        )
                                    }
                                >

                                    Cancel

                                </button>


                                <button
                                    type="submit"
                                    className="modal-save"
                                    disabled={
                                        updateLoading
                                    }
                                >

                                    {updateLoading
                                        ? "Updating..."
                                        : "Update Attendance"}

                                </button>


                            </div>


                        </form>


                    </div>

                </div>

            )}


        </div>

    );

}
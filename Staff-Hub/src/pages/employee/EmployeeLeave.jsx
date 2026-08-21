
import React, { useState } from "react";
import "./EmployeeLeave.css";

import { applyLeave } from "../../Services/api.js";

import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


export default function EmployeeLeave() {

    const [formData, setFormData] = useState({
        leave_type: "",
        from_date: "",
        to_date: "",
        reason: "",
    });

    const [loading, setLoading] = useState(false);


    /* =====================================================
       HANDLE INPUT CHANGE
    ===================================================== */

    const handleChange = (e) => {

        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

    };


    /* =====================================================
       APPLY LEAVE
    ===================================================== */

    const handleSubmit = async (e) => {

        e.preventDefault();

        /* -----------------------------------------------
           FRONTEND VALIDATION
        ------------------------------------------------ */

        if (!formData.leave_type) {

            toast.error("Please select leave type");
            return;

        }

        if (!formData.from_date) {

            toast.error("Please select from date");
            return;

        }

        if (!formData.to_date) {

            toast.error("Please select to date");
            return;

        }

        if (!formData.reason.trim()) {

            toast.error("Please enter leave reason");
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


            /* -------------------------------------------
               APPLY LEAVE API
            ------------------------------------------- */

            const response = await applyLeave(formData);

            console.log(
                "Apply Leave Response:",
                response.data
            );


            if (response.data?.success) {

                toast.success(
                    response.data.message ||
                    "Leave request submitted successfully",
                    {
                        autoClose: 1500,
                    }
                );


                /* ---------------------------------------
                   RESET FORM
                --------------------------------------- */

                setFormData({
                    leave_type: "",
                    from_date: "",
                    to_date: "",
                    reason: "",
                });

            }
            else {

                toast.error(
                    response.data?.message ||
                    "Unable to apply leave"
                );

            }

        }
        catch (error) {

            console.error(
                "Apply Leave Error:",
                error
            );


            toast.error(
                error.response?.data?.message ||
                "Unable to apply leave"
            );

        }
        finally {

            setLoading(false);

        }

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

            </div>


            {/* =================================================
                APPLY LEAVE CARD
            ================================================= */}

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


                {/* =================================================
                    FORM
                ================================================= */}

                <form
                    className="employee-leave-form"
                    onSubmit={handleSubmit}
                >


                    {/* =================================================
                        LEAVE TYPE
                    ================================================= */}

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


                    {/* =================================================
                        DATE ROW
                    ================================================= */}

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


                    {/* =================================================
                        REASON
                    ================================================= */}

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


                    {/* =================================================
                        SUBMIT
                    ================================================= */}

                    <div className="employee-leave-form-actions">

                        <button
                            type="submit"
                            className="employee-leave-submit-btn"
                            disabled={loading}
                        >

                            {loading
                                ? "Submitting..."
                                : "Apply Leave"
                            }

                        </button>

                    </div>


                </form>

            </div>

        </div>

    );

}


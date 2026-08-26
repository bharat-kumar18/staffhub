import React, { useEffect, useState } from "react";
import "./Holidays.css";

import {
  getHolidays,
  addHoliday,
  updateHoliday,
  deleteHoliday,
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
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
      <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
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
  ),
};

/* =========================================================
   HOLIDAYS COMPONENT
========================================================= */

export default function Holidays() {
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState(null);

  const [formData, setFormData] = useState({
    holiday_name: "",
    holiday_date: "",
    description: "",
  });

  /* =========================================================
     EXTRACT HOLIDAY LIST
  ========================================================= */

  const extractHolidayList = (response) => {
    const data = response?.data ?? response;

    console.log("Holiday response:", data);

    if (Array.isArray(data)) {
      return data;
    }

    if (Array.isArray(data?.holidays)) {
      return data.holidays;
    }

    if (Array.isArray(data?.data)) {
      return data.data;
    }

    if (Array.isArray(data?.results)) {
      return data.results;
    }

    return null;
  };

  /* =========================================================
     FETCH HOLIDAYS
  ========================================================= */

 /* =====================================================
   FETCH HOLIDAYS
===================================================== */

const fetchHolidays = async () => {
    try {
        setLoading(true);   // ✅ fixed (pehle setHolidayLoading tha, jo defined hi nahi tha)

        const response = await getHolidays({
            page: 1,
            limit: 100,
            sortedBy: "holiday_date",
            sortOrder: "ASC",
            searchByKeyword: "",
            isActive: true,
        });

        console.log("HOLIDAYS API RESPONSE:", response.data);

        if (response?.data?.success) {
            const holidayList = Array.isArray(response.data.holidays)
                ? response.data.holidays
                : [];

            console.log("HOLIDAY LIST:", holidayList);
            setHolidays(holidayList);
        } else {
            setHolidays([]);
            console.error("Holiday API failed:", response?.data);
        }
    } catch (error) {
        console.error("FETCH HOLIDAYS ERROR:", error);
        console.error("BACKEND RESPONSE:", error?.response?.data);
        setHolidays([]);
    } finally {
        setLoading(false);   // ✅ fixed
    }
};
  /* =========================================================
     INITIAL LOAD
  ========================================================= */

  useEffect(() => {
    fetchHolidays();
  }, []);

  /* =========================================================
     FORM CHANGE
  ========================================================= */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* =========================================================
     OPEN ADD MODAL
  ========================================================= */

  const openAddModal = () => {
    setEditingHoliday(null);

    setFormData({
      holiday_name: "",
      holiday_date: "",
      description: "",
    });

    setShowModal(true);
  };

  /* =========================================================
     FORMAT DATE FOR INPUT
  ========================================================= */

  const getInputDate = (date) => {
    if (!date) {
      return "";
    }

    /*
     * If already YYYY-MM-DD
     */
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return date;
    }

    /*
     * Backend may return:
     * 2026-09-04T18:30:00.000Z
     */
    try {
      const parsedDate = new Date(date);

      if (Number.isNaN(parsedDate.getTime())) {
        return "";
      }

      /*
       * Use local date parts instead of UTC conversion
       * to avoid one-day date shifting.
       */
      const year = parsedDate.getFullYear();
      const month = String(
        parsedDate.getMonth() + 1
      ).padStart(2, "0");

      const day = String(
        parsedDate.getDate()
      ).padStart(2, "0");

      return `${year}-${month}-${day}`;
    } catch {
      return "";
    }
  };

  /* =========================================================
     OPEN EDIT MODAL
  ========================================================= */

  const openEditModal = (holiday) => {
    setEditingHoliday(holiday);

    setFormData({
      holiday_name:
        holiday?.holiday_name ||
        holiday?.name ||
        "",

      holiday_date: getInputDate(
        holiday?.holiday_date ||
          holiday?.date
      ),

      description:
        holiday?.description || "",
    });

    setShowModal(true);
  };

  /* =========================================================
     CLOSE MODAL
  ========================================================= */

  const closeModal = () => {
    setShowModal(false);
    setEditingHoliday(null);

    setFormData({
      holiday_name: "",
      holiday_date: "",
      description: "",
    });
  };

  /* =========================================================
     UPDATE LOCAL HOLIDAY
  ========================================================= */

  const updateHolidayInState = (
    holidayId,
    updatedData,
    apiHoliday = null
  ) => {
    setHolidays((prev) =>
      prev.map((holiday) => {
        const currentId =
          holiday?.id ||
          holiday?.holiday_id;

        if (Number(currentId) !== Number(holidayId)) {
          return holiday;
        }

        return {
          ...holiday,

          /*
           * If backend returned updated holiday,
           * use it.
           */
          ...(apiHoliday || {}),

          /*
           * Otherwise use form data.
           */
          holiday_name:
            apiHoliday?.holiday_name ??
            updatedData.holiday_name,

          holiday_date:
            apiHoliday?.holiday_date ??
            updatedData.holiday_date,

          description:
            apiHoliday?.description ??
            updatedData.description,
        };
      })
    );
  };

  /* =========================================================
     ADD / UPDATE HOLIDAY
  ========================================================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.holiday_name.trim()) {
      alert("Holiday name is required");
      return;
    }

    if (!formData.holiday_date) {
      alert("Holiday date is required");
      return;
    }

    try {
      setLoading(true);

      /* =====================================================
         UPDATE
      ===================================================== */

      if (editingHoliday) {
        const holidayId =
          editingHoliday?.id ||
          editingHoliday?.holiday_id;

        if (!holidayId) {
          alert("Holiday ID not found");
          return;
        }

        console.log(
          "Updating holiday:",
          holidayId,
          formData
        );

        const response = await updateHoliday(
          holidayId,
          formData
        );

        console.log(
          "Update Holiday Response:",
          response?.data || response
        );

        /*
         * Backend response agar holiday deta hai
         * to usko use karenge.
         */
        const responseData =
          response?.data || response;

        const updatedHoliday =
          responseData?.holiday ||
          responseData?.data?.holiday ||
          null;

        /*
         * IMPORTANT:
         * API response empty ho tab bhi UI update hogi.
         */
        updateHolidayInState(
          holidayId,
          formData,
          updatedHoliday
        );

        closeModal();

        alert(
          "Holiday updated successfully"
        );

        /*
         * Yahan fetchHolidays() intentionally
         * immediately call nahi kar rahe.
         *
         * Isse agar GET API empty response de,
         * to UI ki existing list disappear nahi hogi.
         */

        return;
      }

      /* =====================================================
         ADD
      ===================================================== */

      const response = await addHoliday(
        formData
      );

      console.log(
        "Add Holiday Response:",
        response?.data || response
      );

      const responseData =
        response?.data || response;

      const newHoliday =
        responseData?.holiday ||
        responseData?.data?.holiday ||
        null;

      /*
       * Backend response me holiday object
       * aa raha hai, isliye directly list me add.
       */

      if (newHoliday) {
        setHolidays((prev) => [
          ...prev,
          newHoliday,
        ]);
      } else {
        /*
         * Agar add API holiday object nahi deti
         * to fresh list fetch karenge.
         */
        await fetchHolidays();
      }

      closeModal();

      alert(
        "Holiday added successfully"
      );
    } catch (error) {
      console.error(
        "Holiday save error:",
        error?.response?.data || error
      );

      alert(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          "Unable to save holiday"
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     DELETE HOLIDAY
  ========================================================= */

  const handleDelete = async (holiday) => {
    const holidayId =
      holiday?.id ||
      holiday?.holiday_id;

    if (!holidayId) {
      alert("Holiday ID not found");
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
      setLoading(true);

      await deleteHoliday(holidayId);

      /*
       * Directly remove from UI.
       * GET API ki dependency nahi.
       */
      setHolidays((prev) =>
        prev.filter((item) => {
          const id =
            item?.id ||
            item?.holiday_id;

          return Number(id) !== Number(holidayId);
        })
      );

      alert(
        "Holiday deleted successfully"
      );
    } catch (error) {
      console.error(
        "Delete holiday error:",
        error?.response?.data || error
      );

      alert(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          "Unable to delete holiday"
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     FORMAT DATE
  ========================================================= */

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
      return date;
    }
  };

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="holidays-page">

      {/* HEADER */}

      <div className="holidays-header">

        <div>
          <h2>Company Holidays</h2>

          <p>
            Manage holidays for your company
          </p>
        </div>

        <button
          type="button"
          className="add-holiday-btn"
          onClick={openAddModal}
        >
          <Icon.Plus size={17} />
          Add Holiday
        </button>

      </div>

      {/* CARD */}

      <section className="holidays-card">

        <div className="holidays-card-header">

          <div>
            <h3>Holiday List</h3>

            <p>
              All company holidays are listed
              below
            </p>
          </div>

          <div className="holiday-count">
            {holidays.length} Holidays
          </div>

        </div>

        {/* TABLE */}

        <div className="holidays-table-wrapper">

          <table className="holidays-table">

            <thead>
              <tr>
                <th>Holiday</th>
                <th>Date</th>
                <th>Description</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>

              {loading && holidays.length === 0 ? (

                <tr>
                  <td
                    colSpan="4"
                    className="holiday-empty"
                  >
                    Loading holidays...
                  </td>
                </tr>

              ) : holidays.length === 0 ? (

                <tr>
                  <td
                    colSpan="4"
                    className="holiday-empty"
                  >
                    No holidays found
                  </td>
                </tr>

              ) : (

                holidays.map((holiday) => {

                  const holidayId =
                    holiday?.id ||
                    holiday?.holiday_id;

                  return (
                    <tr
                      key={holidayId}
                    >

                      {/* HOLIDAY */}

                      <td>

                        <div className="holiday-name">

                          <div className="holiday-icon">
                            <Icon.Calendar
                              size={17}
                            />
                          </div>

                          <strong>
                            {
                              holiday?.holiday_name ||
                              holiday?.name ||
                              "-"
                            }
                          </strong>

                        </div>

                      </td>

                      {/* DATE */}

                      <td>
                        {formatDate(
                          holiday?.holiday_date ||
                            holiday?.date
                        )}
                      </td>

                      {/* DESCRIPTION */}

                      <td className="holiday-description">
                        {
                          holiday?.description ||
                          "-"
                        }
                      </td>

                      {/* ACTION */}

                      <td>

                        <div className="holiday-actions">

                          <button
                            type="button"
                            className="holiday-edit-btn"
                            onClick={() =>
                              openEditModal(
                                holiday
                              )
                            }
                            title="Edit Holiday"
                          >
                            <Icon.Edit />
                          </button>

                          <button
                            type="button"
                            className="holiday-delete-btn"
                            onClick={() =>
                              handleDelete(
                                holiday
                              )
                            }
                            title="Delete Holiday"
                          >
                            <Icon.Trash />
                          </button>

                        </div>

                      </td>

                    </tr>
                  );
                })

              )}

            </tbody>

          </table>

        </div>

      </section>

      {/* =====================================================
          MODAL
      ===================================================== */}

      {showModal && (

        <div
          className="holiday-modal-overlay"
          onClick={closeModal}
        >

          <div
            className="holiday-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            {/* MODAL HEADER */}

            <div className="holiday-modal-header">

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
                className="holiday-modal-close"
                onClick={closeModal}
              >
                <Icon.Close />
              </button>

            </div>

            {/* FORM */}

            <form
              onSubmit={handleSubmit}
              className="holiday-form"
            >

              <div className="holiday-form-group">

                <label>
                  Holiday Name
                  <span>*</span>
                </label>

                <input
                  type="text"
                  name="holiday_name"
                  value={
                    formData.holiday_name
                  }
                  onChange={handleChange}
                  placeholder="Enter holiday name"
                  required
                />

              </div>

              <div className="holiday-form-group">

                <label>
                  Holiday Date
                  <span>*</span>
                </label>

                <input
                  type="date"
                  name="holiday_date"
                  value={
                    formData.holiday_date
                  }
                  onChange={handleChange}
                  required
                />

              </div>

              <div className="holiday-form-group">

                <label>
                  Description
                </label>

                <textarea
                  name="description"
                  value={
                    formData.description
                  }
                  onChange={handleChange}
                  placeholder="Enter description"
                  rows="4"
                />

              </div>

              {/* ACTIONS */}

              <div className="holiday-modal-actions">

                <button
                  type="button"
                  className="holiday-cancel-btn"
                  onClick={closeModal}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="holiday-save-btn"
                  disabled={loading}
                >
                  {loading
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
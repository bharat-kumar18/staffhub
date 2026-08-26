import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:3000/api",
});

/* =========================================================
   REQUEST INTERCEPTOR
   - Auto attaches Authorization token (no need to repeat
     "headers: { Authorization: ... }" in every function)
   - Auto cache-busts GET requests so refresh always gets
     fresh data (fixes the 304 Not Modified / stale list bug)
========================================================= */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (config.method === "get") {
      config.headers["Cache-Control"] = "no-cache, no-store, must-revalidate";
      config.headers["Pragma"] = "no-cache";
      config.params = {
        ...config.params,
        _t: Date.now(),
      };
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/* =========================================================
   AUTH APIs
========================================================= */

export const SignupUser = (data) => {
    return api.post("/signup", data);
};

export const LoginUser = (data) => {
    return api.post("/login", data);
};

export const getUsers = () => {
    return api.get("/users");
};

export const forgetPassword = (data) => {
    return api.post("/forgotPassword", data);
};

export const verifyOTP = (data) => {
    return api.post("/verifyOtp", data);
};

export const resetPassword = (data) => {
    return api.post("/reset-password", data);
};

// =====================================================
// SUPER ADMIN APIs
// =====================================================

// Get all Admin users
export const getAdmins = (data) => {
    return api.post("/admins", data);
};

// Add new Admin/User
export const addUser = (data) => {
    return api.post("/add-user", data);
};

// Update Admin/User
export const updateUser = (data) => {
    return api.put("/update-user", data);
};

// Soft Delete Admin/User
export const softDeleteUser = (data) => {
    return api.patch("/users/soft-delete", data);
};

// =====================================================
// EMPLOYEE APIs
// =====================================================

// Add Employee
export const addEmployee = (data) => {
    return api.post("/employees", data);
};

// Get Employees
export const getEmployees = (data = {}) => {
    return api.post("/employees-get", data);
};

// Get Single Employee
export const getEmployeeById = (data) => {
    return api.post("/employeesById", data);
};

// Update Employee
export const updateEmployee = (data) => {
    return api.put("/employees-update", data);
};

// Delete Employee
export const deleteEmployee = (data) => {
    return api.patch("/employees-delete", data);
};

// =====================================================
// ATTENDANCE APIs
// =====================================================

// Get Attendance
export const getAttendance = (data = {}) => {
    return api.post("/attendance", data);
};
// Employee - Get My Attendance
export const getMyAttendance = (params = {}) => {
    return api.post("/myAttendance", {
        params,
    });
};
// Modify Attendance
export const modifyAttendance = (data) => {
    return api.patch("/attendance/modify", data);
};

// Employee Check-In
export const checkIn = (data) => {
    return api.post("/attendance/check-in", data);
};

// Employee Check-Out
export const checkOut = (data) => {
    return api.post("/attendance/check-out", data);
};

// =====================================================
// OFFICE TIMING APIs
// =====================================================

// Add Office Timing
export const addOfficeTiming = (data) => {
    return api.post("/office-timing", data);
};

// Get Office Timing
export const getOfficeTiming = () => {
    return api.get("/getOffice-timing");
};

// Update Office Timing
export const updateOfficeTiming = (data) => {
    return api.put("/updateOffice-timing", data);
};

// =====================================================
// LEAVE APIs
// =====================================================

// Employee Apply Leave
export const applyLeave = (data) => {
    return api.post("/leave/apply", data);
};

// Employee - Get My Leaves
export const getMyLeaves = () => {
    return api.get("/myLeaves");
};

// Employee - Update My Leave (only pending)
export const updateLeave = (leaveId, data) => {
    return api.put(`/leave/update/${leaveId}`, data);
};

// Employee - Delete My Leave (only pending)
export const deleteLeave = (leaveId) => {
    return api.delete(`/leave/delete/${leaveId}`);
};

// Admin - Get Leave Requests
export const getLeaveRequests = () => {
    return api.get("/admin/leaves");
};

// Admin - Approve / Reject Leave
export const decideLeave = (data) => {
    return api.patch("/leave/decision", data);
};

// =====================================================
// HOLIDAY APIs
// =====================================================

// Get Holidays
export const getHolidays = (data = {}) => {
    return api.post("/holidays/list", data);
};

// Add Holiday
export const addHoliday = (data) => {
    return api.post("/holidays", data);
};

// Update Holiday
export const updateHoliday = (holidayId, data) => {
    return api.put("/holidays/update", { id: holidayId, ...data });
};

// Delete Holiday
export const deleteHoliday = (holidayId) => {
    return api.patch("/holidays/delete", { id: holidayId });
};

export default api;
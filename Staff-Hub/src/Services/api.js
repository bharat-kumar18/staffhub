import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:3000/api"
})


api.interceptors.request.use(
  (config) => {

    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },

  (error) => {
    return Promise.reject(error);
  }
);



export const SignupUser=(data)=>{
    return api.post("/signup",data);
};


export const LoginUser=(data)=>{
    return api.post("/login",data);
}

export const getUsers = () => {
  return api.get("/users");
};


export const forgetPassword = (data)=>{
    return api.post("/forgotPassword",data);
}
   

export const verifyOTP = (data)=>{
    return api.post("/verifyOtp",data);
}


export const resetPassword = (data)=>{
    return api.post("/reset-password",data);
}

// ================= SUPER ADMIN APIs =================

// ================= SUPER ADMIN APIs =================

// Get all Admin users
export const getAdmins = (data) => {
    return api.post("/admins", data, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
    });
};
// Add new Admin/User
export const addUser = (data) => {
    return api.post("/add-user", data, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
    });
};


// Update Admin/User
export const updateUser = (data) => {
    return api.put("/update-user", data, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
    });
};


// Soft Delete Admin/User
export const softDeleteUser = (data) => {
    return api.patch("/users/soft-delete", data, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
    });
};

// =====================================================
// EMPLOYEE APIs
// =====================================================

// Get Employees
// =====================================================
// EMPLOYEE APIs
// =====================================================

// Add Employee
export const addEmployee = (data) => {
    return api.post("/employees", data, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
    });
};


// Get Employees
export const getEmployees = (data = {}) => {
    return api.post("/employees-get", data, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
    });
};


// Get Single Employee
export const getEmployeeById = (data) => {
    return api.post("/employeesById", data, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
    });
};


// Update Employee
export const updateEmployee = (data) => {
    return api.put("/employees-update", data, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
    });
};


// Delete Employee
export const deleteEmployee = (data) => {
    return api.patch("/employees-delete", data, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
    });
};

// =====================================================
// =====================================================
// ATTENDANCE APIs
// =====================================================

// Get Attendance
export const getAttendance = (data = {}) => {
    return api.post("/attendance", data);
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


/// =====================================================
// OFFICE TIMING APIs
// =====================================================

// Add Office Timing
export const addOfficeTiming = (data) => {
    return api.post("/office-timing", data, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
    });
};

// Get Office Timing
export const getOfficeTiming = () => {
    return api.get("/getOffice-timing", {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
    });
};

// Update Office Timing
export const updateOfficeTiming = (data) => {
    return api.put("/updateOffice-timing", data, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
    });
};
// =====================================================
// LEAVE APIs
// =====================================================

// Employee Apply Leave
export const applyLeave = (data) => {
    return api.post("/leave/apply", data);
};

// Admin - Get Leave Requests
export const getLeaveRequests = () => {
    return api.get("/leave/list", {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
    });
};

// Admin - Approve / Reject Leave
export const decideLeave = (data) => {
    return api.patch("/leave/decision", data, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
    });
};


// =====================================================
// HOLIDAY APIs
// =====================================================

// Get Holidays
export const getHolidays = () => {
    return api.get("/holidays/list", {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
    });
};

// Add Holiday
export const addHoliday = (data) => {
    return api.post("/holidays", data, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
    });
};

// Update Holiday
export const updateHoliday = (holidayId, data) => {
    return api.put(`/holidays/update/${holidayId}`, data, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
    });
};

// Delete Holiday
export const deleteHoliday = (holidayId) => {
    return api.delete(`/holidays/delete/${holidayId}`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
    });
};
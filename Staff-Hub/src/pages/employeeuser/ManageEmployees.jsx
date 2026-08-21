import React, { useEffect, useState } from "react";
import "./ManageEmployees.css";

import {
  FaSearch,
  FaPlus,
  FaEdit,
  FaTrash,
  FaEllipsisH,
  FaTimes,
  FaEye,
} from "react-icons/fa";

import {
  ToastContainer,
  toast,
} from "react-toastify";

import "react-toastify/dist/ReactToastify.css";

import {
  getEmployees,
  addEmployee,
  updateEmployee,
  deleteEmployee,
  getEmployeeById,
} from "../../Services/api";


const ManageEmployees = () => {

  // =====================================================
  // EMPLOYEES
  // =====================================================

  const [employees, setEmployees] = useState([]);


  // =====================================================
  // LOADING
  // =====================================================

  const [loading, setLoading] = useState(false);


  // =====================================================
  // FORM LOADING
  // =====================================================

  const [formLoading, setFormLoading] = useState(false);


  // =====================================================
  // VIEW LOADING
  // =====================================================

  const [viewLoading, setViewLoading] = useState(false);


  // =====================================================
  // SEARCH
  // =====================================================

  const [search, setSearch] = useState("");


  // =====================================================
  // ACTION MENU
  // =====================================================

  const [openMenu, setOpenMenu] = useState(null);


  // =====================================================
  // ADD / UPDATE MODAL
  // =====================================================

  const [showForm, setShowForm] = useState(false);


  // =====================================================
  // VIEW MODAL
  // =====================================================

  const [showView, setShowView] = useState(false);


  // =====================================================
  // EDITING EMPLOYEE
  // =====================================================

  const [editingEmployee, setEditingEmployee] = useState(null);


  // =====================================================
  // VIEW EMPLOYEE
  // =====================================================

  const [viewEmployee, setViewEmployee] = useState(null);


  // =====================================================
  // FORM DATA
  // =====================================================

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    company: "",
    department: "",
    designation: "",
    phone: "",
    address: "",
  });


  // =====================================================
  // GET COMPANY NAME FROM LOGGED-IN USER
  // =====================================================

  const getCompanyName = () => {

    try {

      const userData = localStorage.getItem("user");

      if (!userData) {
        return "";
      }

      const user = JSON.parse(userData);

      return (
        user.company_name ||
        user.companyName ||
        user.company ||
        ""
      );

    } catch (error) {

      console.error(
        "User data parse error:",
        error
      );

      return "";

    }

  };


  // =====================================================
  // GET EMPLOYEE ID
  // =====================================================

  const getEmployeeId = (employee) => {

    return (
      employee?.id ||
      employee?.employee_id ||
      employee?.employeeId
    );

  };


  // =====================================================
  // NORMALIZE EMPLOYEE
  // =====================================================

  const normalizeEmployee = (raw) => {

    if (!raw) {
      return null;
    }

    return {

      id:
        raw.id ||
        raw.employee_id ||
        raw.employeeId,

      name:
        raw.name ||
        raw.fullName ||
        raw.full_name,

      email:
        raw.email,

      department:
        raw.department ||
        raw.dept,

      designation:
        raw.designation ||
        raw.role,

      phone:
        raw.phone ||
        raw.phoneNumber ||
        raw.phone_number ||
        raw.mobile,

      address:
        raw.address,

      isActive:
        raw.is_active ??
        raw.isActive ??
        raw.active,

      companyName:
        raw.company_name ||
        raw.companyName ||
        raw.company,

    };

  };


  // =====================================================
  // FETCH EMPLOYEES
  // =====================================================

  const fetchEmployees = async () => {

    try {

      setLoading(true);

      const response = await getEmployees({

        page: 1,

        limit: 100,

        sortedBy: "created_at",

        sortOrder: "DESC",

        searchByKeyword: "",

        isActive: true,

      });


      console.log(
        "FULL EMPLOYEES RESPONSE:",
        response
      );


      console.log(
        "EMPLOYEES RESPONSE DATA:",
        response.data
      );


      if (response.data?.success) {

        const employeeList =
          response.data?.employees ||
          response.data?.data?.employees ||
          response.data?.data ||
          [];


        console.log(
          "FINAL EMPLOYEE LIST:",
          employeeList
        );


        setEmployees(
          Array.isArray(employeeList)
            ? employeeList
            : []
        );

      } else {

        setEmployees([]);

        toast.error(
          response.data?.message ||
          "Unable to fetch employees"
        );

      }

    } catch (error) {

      console.error(
        "Get employees error:",
        error
      );


      console.error(
        "Backend response:",
        error.response?.data
      );


      setEmployees([]);


      toast.error(

        error.response?.data?.message ||
        "Unable to fetch employees",

        {
          toastId:
            "get-employees-error",
        }

      );

    } finally {

      setLoading(false);

    }

  };


  // =====================================================
  // FETCH ON PAGE LOAD
  // =====================================================

  useEffect(() => {

    fetchEmployees();

  }, []);


  // =====================================================
  // INPUT CHANGE
  // =====================================================

  const handleChange = (e) => {

    const {
      name,
      value,
    } = e.target;


    setFormData(
      (previousData) => ({

        ...previousData,

        [name]: value,

      })
    );

  };


  // =====================================================
  // RESET FORM
  // =====================================================

  const resetForm = () => {

    setFormData({

      name: "",

      email: "",

      password: "",

      company: "",

      department: "",

      designation: "",

      phone: "",

      address: "",

    });


    setEditingEmployee(null);

  };


  // =====================================================
  // ADD EMPLOYEE
  // =====================================================

  const handleAddEmployee = () => {

    resetForm();


    const companyName =
      getCompanyName();


    setFormData({

      name: "",

      email: "",

      password: "",

      company: companyName,

      department: "",

      designation: "",

      phone: "",

      address: "",

    });


    setOpenMenu(null);

    setShowForm(true);

  };


  // =====================================================
  // UPDATE / EDIT EMPLOYEE
  // =====================================================

  const handleEdit = (employee) => {

    console.log(
      "EDIT EMPLOYEE:",
      employee
    );


    setOpenMenu(null);

    setEditingEmployee(employee);


    setFormData({

      name:
        employee.name ||
        "",

      email:
        employee.email ||
        "",

      password: "",

      company:
        employee.company_name ||
        employee.companyName ||
        employee.company ||
        getCompanyName(),

      department:
        employee.department ||
        "",

      designation:
        employee.designation ||
        "",

      phone:
        employee.phone ||
        "",

      address:
        employee.address ||
        "",

    });


    setShowForm(true);

  };


  // =====================================================
  // VIEW EMPLOYEE
  // =====================================================

  const handleView = async (employee) => {

    const employeeId =
      getEmployeeId(employee);


    console.log(
      "VIEW EMPLOYEE:",
      employee
    );


    console.log(
      "VIEW EMPLOYEE ID:",
      employeeId
    );


    if (!employeeId) {

      toast.error(
        "Employee ID is missing"
      );

      return;

    }


    try {

      setOpenMenu(null);

      setViewLoading(true);

      setShowView(true);

      setViewEmployee(null);


      const response =
        await getEmployeeById({

          id: employeeId,

        });


      console.log(
        "VIEW EMPLOYEE RESPONSE:",
        response.data
      );


      if (response.data?.success) {

        const rawEmployee =
          response.data.employee ||
          response.data.data ||
          response.data.user ||
          null;


        const employeeData =
          normalizeEmployee(
            rawEmployee
          );


        setViewEmployee(
          employeeData
        );


        if (!employeeData) {

          toast.error(
            "Employee details not found"
          );

        }

      } else {

        setShowView(false);


        toast.error(

          response.data?.message ||
          "Unable to fetch employee"

        );

      }

    } catch (error) {

      console.error(
        "View employee error:",
        error
      );


      console.error(
        "Backend response:",
        error.response?.data
      );


      setShowView(false);


      toast.error(

        error.response?.data?.message ||
        "Unable to fetch employee"

      );

    } finally {

      setViewLoading(false);

    }

  };


  // =====================================================
  // CLOSE VIEW
  // =====================================================

  const closeView = () => {

    if (viewLoading) {

      return;
    }


    setShowView(false);

    setViewEmployee(null);

  };


  // =====================================================
  // CLOSE FORM
  // =====================================================

  const closeForm = () => {

    if (formLoading) {
      return;
    }


    setShowForm(false);

    resetForm();

  };


  // =====================================================
  // FORM VALIDATION
  // =====================================================

  const validateForm = () => {

    if (!formData.name.trim()) {

      toast.error(
        "Name is required"
      );

      return false;

    }


    if (!formData.email.trim()) {

      toast.error(
        "Email is required"
      );

      return false;

    }


    if (
      !editingEmployee &&
      !formData.password.trim()
    ) {

      toast.error(
        "Password is required"
      );

      return false;

    }


    if (!formData.company.trim()) {

      toast.error(
        "Company is required"
      );

      return false;

    }


    if (!formData.department.trim()) {

      toast.error(
        "Department is required"
      );

      return false;

    }


    if (!formData.designation.trim()) {

      toast.error(
        "Designation is required"
      );

      return false;

    }


    if (!formData.phone.trim()) {

      toast.error(
        "Phone is required"
      );

      return false;

    }


    if (!formData.address.trim()) {

      toast.error(
        "Address is required"
      );

      return false;

    }


    return true;

  };


  // =====================================================
  // SUBMIT FORM
  // =====================================================

  const handleSubmit = async (e) => {

    e.preventDefault();


    if (!validateForm()) {
      return;
    }


    try {

      setFormLoading(true);


      let response;


      // =================================================
      // UPDATE
      // =================================================

      if (editingEmployee) {

        const employeeId =
          getEmployeeId(
            editingEmployee
          );


        if (!employeeId) {

          toast.error(
            "Employee ID is missing"
          );

          return;

        }


        const updateData = {

          id:
            employeeId,

          name:
            formData.name.trim(),

          email:
            formData.email.trim(),

          department:
            formData.department.trim(),

          designation:
            formData.designation.trim(),

          phone:
            formData.phone.trim(),

          address:
            formData.address.trim(),

        };


        console.log(
          "UPDATE EMPLOYEE PAYLOAD:",
          updateData
        );


        response =
          await updateEmployee(
            updateData
          );


        console.log(
          "UPDATE EMPLOYEE RESPONSE:",
          response.data
        );


        if (response.data?.success) {

          toast.success(

            response.data?.message ||
            "Employee updated successfully"

          );

        } else {

          toast.error(

            response.data?.message ||
            "Unable to update employee"

          );

          return;

        }

      }


      // =================================================
      // ADD
      // =================================================

      else {

        const addData = {

          name:
            formData.name.trim(),

          email:
            formData.email.trim(),

          password:
            formData.password,

          department:
            formData.department.trim(),

          designation:
            formData.designation.trim(),

          phone:
            formData.phone.trim(),

          address:
            formData.address.trim(),

        };


        /*
          Company frontend me show ho rahi hai,
          lekin backend ko company send nahi kar rahe.

          Backend logged-in admin ke ID se
          automatically company determine karta hai.
        */


        console.log(
          "ADD EMPLOYEE PAYLOAD:",
          addData
        );


        response =
          await addEmployee(
            addData
          );


        console.log(
          "ADD EMPLOYEE RESPONSE:",
          response.data
        );


        if (response.data?.success) {

          toast.success(

            response.data?.message ||
            "Employee added successfully"

          );

        } else {

          toast.error(

            response.data?.message ||
            "Unable to add employee"

          );

          return;

        }

      }


      setShowForm(false);

      resetForm();

      await fetchEmployees();


    } catch (error) {

      console.error(
        "Employee save error:",
        error
      );


      console.error(
        "Backend response:",
        error.response?.data
      );


      toast.error(

        error.response?.data?.message ||
        "Unable to save employee"

      );

    } finally {

      setFormLoading(false);

    }

  };


  // =====================================================
  // DELETE EMPLOYEE
  // =====================================================

  const handleDelete = (id) => {

    setOpenMenu(null);


    if (!id) {

      toast.error(
        "Employee ID is missing"
      );

      return;

    }


    toast.warn(

      ({ closeToast }) => (

        <div className="employee-delete-toast">

          <strong>
            Delete Employee?
          </strong>


          <span>
            Are you sure you want to delete this employee?
          </span>


          <div className="employee-delete-actions">

            <button
              type="button"
              className="employee-cancel-btn"
              onClick={closeToast}
            >
              Cancel
            </button>


            <button
              type="button"
              className="employee-delete-btn"
              onClick={async () => {

                try {

                  closeToast();


                  const deleteData = {

                    id: id,

                  };


                  console.log(
                    "DELETE EMPLOYEE PAYLOAD:",
                    deleteData
                  );


                  const response =
                    await deleteEmployee(
                      deleteData
                    );


                  console.log(
                    "DELETE EMPLOYEE RESPONSE:",
                    response.data
                  );


                  if (response.data?.success) {

                    toast.success(

                      response.data?.message ||
                      "Employee deleted successfully"

                    );


                    await fetchEmployees();

                  } else {

                    toast.error(

                      response.data?.message ||
                      "Unable to delete employee"

                    );

                  }

                } catch (error) {

                  console.error(
                    "Delete employee error:",
                    error
                  );


                  console.error(
                    "Backend response:",
                    error.response?.data
                  );


                  toast.error(

                    error.response?.data?.message ||
                    "Unable to delete employee"

                  );

                }

              }}
            >

              <FaTrash />

              <span>
                Delete
              </span>

            </button>

          </div>

        </div>

      ),

      {
        position: "top-right",
        autoClose: false,
        closeOnClick: false,
        closeButton: false,
        draggable: false,
      }

    );

  };


  // =====================================================
  // FILTER EMPLOYEES
  // =====================================================

  const filteredEmployees =
    employees.filter((employee) => {

      const keyword =
        search
          .trim()
          .toLowerCase();


      if (!keyword) {
        return true;
      }


      return (

        employee.name
          ?.toLowerCase()
          .includes(keyword)

        ||

        employee.email
          ?.toLowerCase()
          .includes(keyword)

        ||

        employee.designation
          ?.toLowerCase()
          .includes(keyword)

      );

    });


  // =====================================================
  // RETURN
  // =====================================================

  return (

    <div className="manage-employees">


      {/* =================================================
          TOAST
      ================================================= */}

      <ToastContainer

        position="top-right"

        autoClose={3000}

        newestOnTop

        closeOnClick

        pauseOnHover

        limit={3}

      />


      {/* =================================================
          HEADER
      ================================================= */}

      <div className="manage-employees-header">

        <div>

          <h1>
            Manage Employees
          </h1>

          <p>
            Manage employees and their information.
          </p>

        </div>


        <button
          type="button"
          className="employee-add-btn"
          onClick={handleAddEmployee}
        >

          <FaPlus />

          <span>
            Add Employee
          </span>

        </button>

      </div>


      {/* =================================================
          TOOLBAR
      ================================================= */}

      <div className="employee-toolbar">

        <div className="employee-search">

          <FaSearch />

          <input
            type="text"
            placeholder="Search employees..."
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
          />

        </div>


        <div className="employee-total">

          Total Employees:

          <strong>
            {filteredEmployees.length}
          </strong>

        </div>

      </div>


      {/* =================================================
          TABLE
      ================================================= */}

      <div className="employees-card">

        <div className="employees-table-wrapper">

          <table>

            <thead>

              <tr>

                <th>
                  Sr.
                </th>

                <th>
                  Name
                </th>

                <th>
                  Email
                </th>

                <th>
                  Designation
                </th>

                <th className="employee-action-header">
                  Action
                </th>

              </tr>

            </thead>


            <tbody>


              {/* LOADING */}

              {loading ? (

                <tr>

                  <td
                    colSpan="5"
                    className="employee-table-message"
                  >
                    Loading employees...
                  </td>

                </tr>

              )


              /* EMPTY */

              : filteredEmployees.length === 0 ? (

                <tr>

                  <td
                    colSpan="5"
                    className="employee-table-message"
                  >
                    No employees found
                  </td>

                </tr>

              )


              /* DATA */

              : (

                filteredEmployees.map(
                  (employee, index) => {

                    const employeeId =
                      getEmployeeId(
                        employee
                      );


                    return (

                      <tr
                        key={
                          employeeId ||
                          index
                        }
                      >


                        {/* SR */}

                        <td>
                          {index + 1}
                        </td>


                        {/* NAME */}

                        <td>

                          <div className="employee-name">

                            <div className="employee-avatar">

                              {employee.name
                                ?.charAt(0)
                                ?.toUpperCase()}

                            </div>

                            <span>
                              {employee.name ||
                                "-"}
                            </span>

                          </div>

                        </td>


                        {/* EMAIL */}

                        <td>
                          {employee.email ||
                            "-"}
                        </td>


                        {/* DESIGNATION */}

                        <td>
                          {employee.designation ||
                            "-"}
                        </td>


                        {/* ACTION */}

                        <td className="employee-action-cell">

                          <div className="employee-action-menu">


                            {/* THREE DOT */}

                            <button
                              type="button"
                              className="employee-three-dot"
                              title="Actions"
                              aria-label="Employee actions"
                              onClick={() => {

                                setOpenMenu(

                                  openMenu ===
                                    employeeId

                                    ? null

                                    : employeeId

                                );

                              }}
                            >

                              <FaEllipsisH />

                            </button>


                            {/* DROPDOWN */}

                            {openMenu ===
                              employeeId && (

                              <div
                                className="employee-dropdown"
                                onClick={(e) =>
                                  e.stopPropagation()
                                }
                              >


                                {/* VIEW */}

                                <button
                                  type="button"
                                  className="employee-dropdown-view"
                                  onClick={() =>
                                    handleView(
                                      employee
                                    )
                                  }
                                >

                                  <FaEye
                                    className="employee-action-icon"
                                  />

                                  <span>
                                    View
                                  </span>

                                </button>


                                {/* UPDATE */}

                                <button
                                  type="button"
                                  className="employee-dropdown-edit"
                                  onClick={() =>
                                    handleEdit(
                                      employee
                                    )
                                  }
                                >

                                  <FaEdit
                                    className="employee-action-icon"
                                  />

                                  <span>
                                    Update
                                  </span>

                                </button>


                                {/* DELETE */}

                                <button
                                  type="button"
                                  className="employee-dropdown-delete"
                                  onClick={() =>
                                    handleDelete(
                                      employeeId
                                    )
                                  }
                                >

                                  <FaTrash
                                    className="employee-action-icon"
                                  />

                                  <span>
                                    Delete
                                  </span>

                                </button>


                              </div>

                            )}

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


      {/* =====================================================
          ADD / UPDATE MODAL
      ===================================================== */}

      {showForm && (

        <div className="employee-modal-overlay">

          <div className="employee-modal">


            {/* HEADER */}

            <div className="employee-modal-header">

              <div>

                <h2>

                  {editingEmployee
                    ? "Update Employee"
                    : "Add New Employee"}

                </h2>

                <p>
                  Enter employee information below
                </p>

              </div>


              <button
                type="button"
                className="employee-modal-close"
                onClick={closeForm}
                disabled={formLoading}
              >

                <FaTimes />

              </button>

            </div>


            {/* FORM */}

            <form
              className="employee-form"
              onSubmit={handleSubmit}
            >

              <div className="employee-form-grid">


                {/* =================================================
                    NAME
                ================================================= */}

                <div className="employee-form-group">

                  <label>
                    Name
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter employee name"
                    disabled={formLoading}
                  />

                </div>


                {/* =================================================
                    EMAIL
                ================================================= */}

                <div className="employee-form-group">

                  <label>
                    Email
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter email address"
                    disabled={formLoading}
                  />

                </div>


                {/* =================================================
                    COMPANY
                ================================================= */}



                {/* =================================================
                    PASSWORD
                ================================================= */}

                {!editingEmployee && (

                  <div className="employee-form-group">

                    <label>
                      Password
                    </label>

                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter employee password"
                      disabled={formLoading}
                    />

                  </div>

                )}


                {/* =================================================
                    DEPARTMENT
                ================================================= */}

                <div className="employee-form-group">

                  <label>
                    Department
                  </label>

                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    placeholder="Enter department"
                    disabled={formLoading}
                  />

                </div>


                {/* =================================================
                    DESIGNATION
                ================================================= */}

                <div className="employee-form-group">

                  <label>
                    Designation
                  </label>

                  <input
                    type="text"
                    name="designation"
                    value={formData.designation}
                    onChange={handleChange}
                    placeholder="Enter designation"
                    disabled={formLoading}
                  />

                </div>


                {/* =================================================
                    PHONE
                ================================================= */}

                <div className="employee-form-group">

                  <label>
                    Phone
                  </label>

                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter phone number"
                    disabled={formLoading}
                  />

                </div>


                {/* =================================================
                    ADDRESS
                ================================================= */}

                <div className="employee-form-group employee-full-width">

                  <label>
                    Address
                  </label>

                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Enter complete address"
                    rows="4"
                    disabled={formLoading}
                  />

                </div>

              </div>


              {/* =================================================
                  FORM ACTIONS
              ================================================= */}

              <div className="employee-form-actions">

              


                <button
                  type="submit"
                  className="employee-form-save"
                  disabled={formLoading}
                >

                  {formLoading

                    ? (

                      editingEmployee
                        ? "Updating..."
                        : "Adding..."

                    )

                    : (

                      editingEmployee
                        ? "Update Employee"
                        : "Add Employee"

                    )}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}


      {/* =====================================================
          VIEW EMPLOYEE MODAL
      ===================================================== */}

      {showView && (

        <div className="employee-modal-overlay">

          <div className="employee-modal employee-view-modal">


            {/* VIEW HEADER */}

            <div className="employee-modal-header">

              <div>

                <h2>
                  Employee Details
                </h2>

                <p>
                  View employee information
                </p>

              </div>


              <button
                type="button"
                className="employee-modal-close"
                onClick={closeView}
                disabled={viewLoading}
              >

                <FaTimes />

              </button>

            </div>


            {/* VIEW LOADING */}

            {viewLoading ? (

              <div className="employee-view-loading">

                Loading employee details...

              </div>

            )


            /* VIEW DATA */

            : viewEmployee ? (

              <div className="employee-view-content">


                {/* NAME */}

                <div className="employee-view-item">

                  <span>
                    Name
                  </span>

                  <strong>
                    {viewEmployee.name ||
                      "-"}
                  </strong>

                </div>


                {/* EMAIL */}

                <div className="employee-view-item">

                  <span>
                    Email
                  </span>

                  <strong>
                    {viewEmployee.email ||
                      "-"}
                  </strong>

                </div>


                {/* COMPANY */}

                <div className="employee-view-item">

                  <span>
                    Company
                  </span>

                  <strong>
                    {viewEmployee.companyName ||
                      "-"}
                  </strong>

                </div>


                {/* DEPARTMENT */}

                <div className="employee-view-item">

                  <span>
                    Department
                  </span>

                  <strong>
                    {viewEmployee.department ||
                      "-"}
                  </strong>

                </div>


                {/* DESIGNATION */}

                <div className="employee-view-item">

                  <span>
                    Designation
                  </span>

                  <strong>
                    {viewEmployee.designation ||
                      "-"}
                  </strong>

                </div>


                {/* PHONE */}

                <div className="employee-view-item">

                  <span>
                    Phone
                  </span>

                  <strong>
                    {viewEmployee.phone ||
                      "-"}
                  </strong>

                </div>


                {/* STATUS */}

                <div className="employee-view-item">

                  <span>
                    Status
                  </span>

                  <strong>
                    {viewEmployee.isActive
                      ? "Active"
                      : "Inactive"}
                  </strong>

                </div>


                {/* ADDRESS */}

                <div className="employee-view-item employee-view-full">

                  <span>
                    Address
                  </span>

                  <strong>
                    {viewEmployee.address ||
                      "-"}
                  </strong>

                </div>


                {/* CLOSE */}

             

              </div>

            )


            /* NO DATA */

            : (

              <div className="employee-view-loading">

                Employee details not found.

              </div>

            )}

          </div>

        </div>

      )}

    </div>

  );

};


export default ManageEmployees;
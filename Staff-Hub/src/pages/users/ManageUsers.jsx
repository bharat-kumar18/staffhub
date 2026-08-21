import React, {
    useEffect,
    useRef,
    useState
} from "react";

import "./ManageUsers.css";

import {
    FaPlus,
    FaSearch,
    FaEdit,
    FaTrash,
    FaTimes,
    FaEllipsisH,
    FaSortAmountDown,
    FaUserShield,
    FaBuilding,
    FaEnvelope,
    FaLock,
    FaUser
} from "react-icons/fa";

import {
    toast
} from "react-toastify";

// NOTE: react-toastify ka CSS aur <ToastContainer /> sirf ek hi
// jagah (App.jsx / root layout) me rakho. Yahan dubara render
// karne se har toast 2 baar dikhta hai kyunki toastId sirf
// same container ke andar duplicate-check karta hai.

import {
    getAdmins,
    addUser,
    updateUser,
    softDeleteUser
} from "../../Services/api";


const ManageUsers = () => {


    // =====================================================
    // USERS
    // =====================================================

    const [users, setUsers] = useState([]);


    // =====================================================
    // PAGINATION
    // =====================================================

    const [page, setPage] = useState(1);

    const [limit, setLimit] = useState(10);

    const [totalPages, setTotalPages] = useState(1);

    const [totalUsers, setTotalUsers] = useState(0);


    // =====================================================
    // SEARCH
    // =====================================================

    const [search, setSearch] = useState("");


    // =====================================================
    // SORTING
    // =====================================================

    const [sortedBy, setSortedBy] = useState("created_at");

    const [sortOrder, setSortOrder] = useState("DESC");


    // =====================================================
    // ACTIVE FILTER
    // =====================================================

    const [isActive, setIsActive] = useState("true");


    // =====================================================
    // FORM
    // =====================================================

    const [showForm, setShowForm] = useState(false);

    const [editingUser, setEditingUser] = useState(null);


    // =====================================================
    // LOADING
    // =====================================================

    const [loading, setLoading] = useState(false);


    // =====================================================
    // ACTION MENU
    // =====================================================

    const [openMenu, setOpenMenu] = useState(null);


    // =====================================================
    // DOUBLE SUBMIT PROTECTION
    // =====================================================

    const submittingRef = useRef(false);

    const deletingRef = useRef(false);


    // =====================================================
    // FORM DATA
    // =====================================================

    const [formData, setFormData] = useState({

        name: "",

        email: "",

        password: "",

        companyName: "",

        role_id: 2

    });


    // =====================================================
    // FETCH USERS
    // =====================================================

    const fetchUsers = async () => {

        try {

            setLoading(true);


            // =================================================
            // REQUEST DATA
            // =================================================

            const requestData = {

                page: page,

                limit: limit,

                sortedBy: sortedBy,

                sortOrder: sortOrder,

                searchByKeyword: search.trim()

            };


            // =================================================
            // ACTIVE FILTER
            // =================================================

            // "all" bhejne par isActive nahi bhejenge
            // true = active users
            // false = inactive users

            if (isActive !== "all") {

                requestData.isActive =
                    isActive === "true";

            }


            console.log(
                "GET ADMINS REQUEST:",
                requestData
            );


            // =================================================
            // API CALL
            // =================================================

            const response =
                await getAdmins(requestData);


            console.log(
                "ADMINS RESPONSE:",
                response.data
            );


            // =================================================
            // USERS
            // =================================================

            setUsers(
                response.data?.users || []
            );


            // =================================================
            // PAGINATION
            // =================================================

            setTotalPages(
                response.data?.pagination?.totalPages || 1
            );


            setTotalUsers(
                response.data?.pagination?.totalUsers || 0
            );


        } catch (error) {

            console.error(
                "Get admins error:",
                error
            );


            console.log(
                "Error response:",
                error.response?.data
            );


            toast.error(

                error.response?.data?.message ||
                "Unable to fetch users",

                {
                    toastId: "fetch-users-error"
                }

            );


        } finally {

            setLoading(false);

        }

    };


    // =====================================================
    // FETCH USERS WHEN FILTER / SEARCH / PAGE CHANGES
    // =====================================================

    useEffect(() => {

        fetchUsers();

    }, [
        page,
        limit,
        search,
        sortedBy,
        sortOrder,
        isActive
    ]);


    // =====================================================
    // FORM INPUT CHANGE
    // =====================================================

    const handleChange = (e) => {

        const {
            name,
            value
        } = e.target;


        setFormData(
            (previousData) => ({

                ...previousData,

                [name]: value

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

            companyName: "",

            role_id: 2

        });


        setEditingUser(null);

    };


    // =====================================================
    // CLOSE FORM
    // =====================================================

    const closeForm = () => {

        if (submittingRef.current) {

            return;

        }


        setShowForm(false);

        resetForm();

    };


    // =====================================================
    // ADD / UPDATE USER
    // =====================================================

    const handleSubmit = async (e) => {

        e.preventDefault();


        // =================================================
        // PREVENT DOUBLE SUBMIT
        // =================================================

        if (submittingRef.current) {

            return;

        }


        submittingRef.current = true;


        // =================================================
        // VALIDATION
        // =================================================

        if (!formData.name.trim()) {

            toast.error(
                "Name is required",
                {
                    toastId: "name-required"
                }
            );


            submittingRef.current = false;

            return;

        }


        if (!formData.companyName.trim()) {

            toast.error(
                "Company name is required",
                {
                    toastId: "company-required"
                }
            );


            submittingRef.current = false;

            return;

        }


        if (!formData.email.trim()) {

            toast.error(
                "Email is required",
                {
                    toastId: "email-required"
                }
            );


            submittingRef.current = false;

            return;

        }


        // Password only required during ADD

        if (
            !editingUser &&
            !formData.password.trim()
        ) {

            toast.error(
                "Password is required",
                {
                    toastId: "password-required"
                }
            );


            submittingRef.current = false;

            return;

        }


        try {

            setLoading(true);


            let response;


            // =================================================
            // UPDATE USER
            // =================================================

            if (editingUser) {

                response = await updateUser({

                    id: editingUser.id,

                    name:
                        formData.name.trim(),

                    email:
                        formData.email.trim(),

                    companyName:
                        formData.companyName.trim(),

                    role_id:
                        Number(formData.role_id)

                });

            }


            // =================================================
            // ADD USER
            // =================================================

            else {

                response = await addUser({

                    name:
                        formData.name.trim(),

                    email:
                        formData.email.trim(),

                    password:
                        formData.password,

                    companyName:
                        formData.companyName.trim(),

                    role_id:
                        Number(formData.role_id)

                });

            }


            console.log(
                "USER SAVE RESPONSE:",
                response.data
            );


            // =================================================
            // SUCCESS TOAST
            // =================================================

            toast.success(

                response.data?.message ||

                (
                    editingUser
                        ? "User updated successfully"
                        : "User added successfully"
                ),

                {

                    toastId:
                        editingUser
                            ? "user-update-success"
                            : "user-add-success"

                }

            );


            // =================================================
            // CLOSE MODAL
            // =================================================

            setShowForm(false);


            // =================================================
            // RESET FORM
            // =================================================

            resetForm();


            // =================================================
            // CLOSE MENU
            // =================================================

            setOpenMenu(null);


            // =================================================
            // REFRESH USERS
            // =================================================

            await fetchUsers();


        } catch (error) {

            console.error(
                "Save user error:",
                error
            );


            console.log(
                "Save error response:",
                error.response?.data
            );


            toast.error(

                error.response?.data?.message ||

                (
                    editingUser
                        ? "Unable to update user"
                        : "Unable to add user"
                ),

                {

                    toastId:
                        editingUser
                            ? "user-update-error"
                            : "user-add-error"

                }

            );


        } finally {

            setLoading(false);

            submittingRef.current = false;

        }

    };


    // =====================================================
    // EDIT USER
    // =====================================================

    const handleEdit = (user) => {

        console.log(
            "EDIT USER:",
            user
        );


        setOpenMenu(null);


        setEditingUser(user);


        setFormData({

            name:
                user.name || "",

            email:
                user.email || "",

            password: "",

            companyName:
                user.company_name ||
                user.companyName ||
                "",

            role_id:
                user.role_id || 2

        });


        setShowForm(true);

    };


    // =====================================================
    // ACTUAL DELETE API
    // =====================================================

    const confirmDeleteUser = async (id) => {

        if (deletingRef.current) {

            return;

        }


        deletingRef.current = true;


        try {

            setLoading(true);


            const response =
                await softDeleteUser({

                    id: id

                });


            toast.success(

                response.data?.message ||
                "User deleted successfully",

                {

                    toastId:
                        `delete-success-${id}`

                }

            );


            setOpenMenu(null);


            await fetchUsers();


        } catch (error) {

            console.error(
                "Delete error:",
                error
            );


            toast.error(

                error.response?.data?.message ||
                "Unable to delete user",

                {

                    toastId:
                        `delete-error-${id}`

                }

            );


        } finally {

            setLoading(false);

            deletingRef.current = false;

        }

    };


    // =====================================================
    // DELETE CONFIRMATION TOAST
    // =====================================================

    const handleDelete = (id) => {

        setOpenMenu(null);


        toast.warn(

            ({ closeToast }) => (

                <div className="delete-confirm-toast">

                    <div className="delete-confirm-message">

                        <strong>
                            Delete User?
                        </strong>

                        <span>
                            Are you sure you want to delete this user?
                        </span>

                    </div>


                    <div className="delete-confirm-actions">

                        <button

                            type="button"

                            className="toast-cancel-btn"

                            onClick={closeToast}

                        >
                            Cancel
                        </button>


                        <button

                            type="button"

                            className="toast-delete-btn"

                            onClick={() => {

                                closeToast();

                                confirmDeleteUser(id);

                            }}

                        >
                            Delete
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

                pauseOnHover: true,

                toastId:
                    `delete-confirm-${id}`

            }

        );

    };


    // =====================================================
    // ADD USER
    // =====================================================

    const handleAddUser = () => {

        resetForm();

        setOpenMenu(null);

        setShowForm(true);

    };


    // =====================================================
    // ACTION MENU
    // =====================================================

    const toggleActionMenu = (userId) => {

        if (loading) {

            return;

        }


        setOpenMenu(

            openMenu === userId
                ? null
                : userId

        );

    };


    // =====================================================
    // SORT CHANGE
    // =====================================================

    const handleSortByChange = (e) => {

        setSortedBy(e.target.value);

        setPage(1);

    };


    // =====================================================
    // SORT ORDER CHANGE
    // =====================================================

    const handleSortOrderChange = (e) => {

        setSortOrder(e.target.value);

        setPage(1);

    };


    // =====================================================
    // ACTIVE FILTER CHANGE
    // =====================================================

    const handleActiveFilterChange = (e) => {

        setIsActive(e.target.value);

        setPage(1);

    };


    // =====================================================
    // PAGE LIMIT CHANGE
    // =====================================================

    const handleLimitChange = (e) => {

        setLimit(Number(e.target.value));

        setPage(1);

    };


    // =====================================================
    // RETURN
    // =====================================================

    return (

        <div className="manage-users">


            {/* =================================================
                HEADER
            ================================================= */}

            <div className="manage-users-header">

                <div>

                    <h1>
                        Manage Users
                    </h1>

                    <p>
                        Manage Admin users and their access.
                    </p>

                </div>


                <button

                    type="button"

                    className="add-user-btn"

                    onClick={handleAddUser}

                    disabled={loading}

                >

                    <FaPlus />

                    <span>
                        Add User
                    </span>

                </button>

            </div>


            {/* =================================================
                TOOLBAR
            ================================================= */}

            <div className="users-toolbar">


                {/* =================================================
                    SEARCH
                ================================================= */}

                <div className="user-search">

                    <FaSearch />

                    <input

                        type="text"

                        placeholder="Search users..."

                        value={search}

                        onChange={(e) => {

                            setSearch(
                                e.target.value
                            );

                            setPage(1);

                        }}

                    />

                </div>


                {/* =================================================
                    SORT BY
                ================================================= */}

                <div className="filter-group">

                    <label>
                        Sort By
                    </label>

                    <div className="filter-select">

                        <FaSortAmountDown />

                        <select

                            value={sortedBy}

                            onChange={
                                handleSortByChange
                            }

                            disabled={loading}

                        >

                            <option value="created_at">
                                Created Date
                            </option>

                            <option value="name">
                                Name
                            </option>

                            <option value="email">
                                Email
                            </option>

                            <option value="company_name">
                                Company Name
                            </option>

                            <option value="id">
                                ID
                            </option>

                            <option value="role_id">
                                Role
                            </option>

                        </select>

                    </div>

                </div>


                {/* =================================================
                    SORT ORDER
                ================================================= */}

                <div className="filter-group">

                    <label>
                        Order
                    </label>

                    <select

                        className="normal-filter-select"

                        value={sortOrder}

                        onChange={
                            handleSortOrderChange
                        }

                        disabled={loading}

                    >

                        <option value="DESC">
                            Descending
                        </option>

                        <option value="ASC">
                            Ascending
                        </option>

                    </select>

                </div>


                {/* =================================================
                    ACTIVE FILTER
                ================================================= */}

                <div className="filter-group">

                    <label>
                        Status
                    </label>

                    <select

                        className="normal-filter-select"

                        value={isActive}

                        onChange={
                            handleActiveFilterChange
                        }

                        disabled={loading}

                    >

                        <option value="all">
                            All Users
                        </option>

                        <option value="true">
                            Active
                        </option>

                        <option value="false">
                            Inactive
                        </option>

                    </select>

                </div>


                {/* =================================================
                    LIMIT
                ================================================= */}

                <div className="filter-group">

                    <label>
                        Per Page
                    </label>

                    <select

                        className="normal-filter-select"

                        value={limit}

                        onChange={
                            handleLimitChange
                        }

                        disabled={loading}

                    >

                        <option value={10}>
                            10
                        </option>

                        <option value={20}>
                            20
                        </option>

                        <option value={50}>
                            50
                        </option>

                        <option value={100}>
                            100
                        </option>

                    </select>

                </div>

            </div>


            {/* =================================================
                USER COUNT
            ================================================= */}

            <div className="users-count">

                Total Users: <strong>{totalUsers}</strong>

            </div>


            {/* =================================================
                USER TABLE
            ================================================= */}

            <div className="users-card">

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
                                Company Name
                            </th>

                            <th>
                                Email
                            </th>

                            <th>
                                Role
                            </th>

                            <th>
                                Status
                            </th>

                            <th className="action-header">
                                Action
                            </th>

                        </tr>

                    </thead>


                    <tbody>


                        {/* =================================================
                            LOADING
                        ================================================= */}

                        {loading ? (

                            <tr>

                                <td
                                    colSpan="7"
                                    className="table-message"
                                >

                                    Loading...

                                </td>

                            </tr>

                        )


                            /* =================================================
                               NO USERS
                            ================================================= */

                            : users.length === 0 ? (

                                <tr>

                                    <td
                                        colSpan="7"
                                        className="table-message"
                                    >

                                        No users found

                                    </td>

                                </tr>

                            )


                                /* =================================================
                                   USERS
                                ================================================= */

                                : (

                                    users.map(
                                        (user, index) => (

                                            <tr
                                                key={user.id}
                                            >


                                                {/* SR */}

                                                <td>

                                                    {(
                                                        (page - 1) *
                                                        limit
                                                    ) +
                                                        index +
                                                        1}

                                                </td>


                                                {/* NAME */}

                                                <td>

                                                    {user.name}

                                                </td>


                                                {/* COMPANY */}

                                                <td>

                                                    {
                                                        user.company_name ||
                                                        user.companyName ||
                                                        "-"
                                                    }

                                                </td>


                                                {/* EMAIL */}

                                                <td>

                                                    {user.email}

                                                </td>


                                                {/* ROLE */}

                                                <td>

                                                    <span className="role-badge">

                                                        {
                                                            user.role_name ||
                                                            user.role ||
                                                            "admin"
                                                        }

                                                    </span>

                                                </td>


                                                {/* STATUS */}

                                                <td>

                                                    <span

                                                        className={
                                                            user.is_active
                                                                ? "status-badge active"
                                                                : "status-badge inactive"
                                                        }

                                                    >

                                                        {
                                                            user.is_active
                                                                ? "Active"
                                                                : "Inactive"
                                                        }

                                                    </span>

                                                </td>


                                                {/* ACTION */}

                                                <td className="action-cell">

                                                    <div className="action-menu">


                                                        {/* THREE DOT */}

                                                        <button

                                                            type="button"

                                                            className="three-dot-btn"

                                                            onClick={() =>
                                                                toggleActionMenu(
                                                                    user.id
                                                                )
                                                            }

                                                            disabled={loading}

                                                            aria-label="User actions"

                                                        >

                                                            <FaEllipsisH />

                                                        </button>


                                                        {/* DROPDOWN */}

                                                        {openMenu === user.id && (

                                                            <div className="action-dropdown">


                                                                {/* UPDATE */}

                                                                <button

                                                                    type="button"

                                                                    className="dropdown-edit"

                                                                    onClick={() =>
                                                                        handleEdit(
                                                                            user
                                                                        )
                                                                    }

                                                                    disabled={loading}

                                                                >

                                                                    <FaEdit />

                                                                    <span>
                                                                        Update
                                                                    </span>

                                                                </button>


                                                                {/* DELETE */}

                                                                <button

                                                                    type="button"

                                                                    className="dropdown-delete"

                                                                    onClick={() =>
                                                                        handleDelete(
                                                                            user.id
                                                                        )
                                                                    }

                                                                    disabled={loading}

                                                                >

                                                                    <FaTrash />

                                                                    <span>
                                                                        Delete
                                                                    </span>

                                                                </button>


                                                            </div>

                                                        )}

                                                    </div>

                                                </td>

                                            </tr>

                                        )

                                    )

                                )}

                    </tbody>

                </table>

            </div>


            {/* =================================================
                PAGINATION
            ================================================= */}

            <div className="pagination">


                <button

                    type="button"

                    onClick={() =>
                        setPage(
                            previousPage =>
                                previousPage - 1
                        )
                    }

                    disabled={
                        page === 1 ||
                        loading
                    }

                >

                    Previous

                </button>


                <span>

                    Page {page} of {totalPages}

                </span>


                <button

                    type="button"

                    onClick={() =>
                        setPage(
                            previousPage =>
                                previousPage + 1
                        )
                    }

                    disabled={
                        page === totalPages ||
                        loading
                    }

                >

                    Next

                </button>

            </div>


            {/* =================================================
                ADD / UPDATE MODAL
            ================================================= */}

            {showForm && (

                <div

                    className="modal-overlay"

                    onMouseDown={(e) => {

                        if (
                            e.target === e.currentTarget &&
                            !submittingRef.current
                        ) {

                            closeForm();

                        }

                    }}

                >


                    <div className="user-modal">


                        {/* =================================================
                            MODAL HEADER
                        ================================================= */}

                        <div className="modal-header">

                            <div className="modal-header-text">

                                <span className="modal-eyebrow">

                                    {
                                        editingUser
                                            ? "Edit Details"
                                            : "New Account"
                                    }

                                </span>

                                <h2>

                                    {
                                        editingUser
                                            ? "Update User"
                                            : "Add New User"
                                    }

                                </h2>

                            </div>


                            <button

                                type="button"

                                className="modal-close-btn"

                                onClick={closeForm}

                                disabled={loading}

                                aria-label="Close"

                            >

                                <FaTimes />

                            </button>

                        </div>


                        {/* =================================================
                            FORM
                        ================================================= */}

                        <form

                            className="user-form"

                            onSubmit={handleSubmit}

                        >

                            <div className="user-form-body">


                                {/* =========================================
                                    ROW 1 - NAME / COMPANY
                                ========================================= */}

                                <div className="form-row">


                                    {/* NAME */}

                                    <div className="form-group">

                                        <label htmlFor="user-name">

                                            <FaUser />

                                            <span>
                                                Full Name
                                            </span>

                                        </label>

                                        <input

                                            id="user-name"

                                            type="text"

                                            name="name"

                                            value={
                                                formData.name
                                            }

                                            onChange={
                                                handleChange
                                            }

                                            placeholder="e.g. Vishvjeet Gupta"

                                            disabled={loading}

                                            autoComplete="off"

                                        />

                                    </div>


                                    {/* COMPANY NAME */}

                                    <div className="form-group">

                                        <label htmlFor="user-company">

                                            <FaBuilding />

                                            <span>
                                                Company Name
                                            </span>

                                        </label>

                                        <input

                                            id="user-company"

                                            type="text"

                                            name="companyName"

                                            value={
                                                formData.companyName
                                            }

                                            onChange={
                                                handleChange
                                            }

                                            placeholder="e.g. Staff-Hub Pvt Ltd"

                                            disabled={loading}

                                            autoComplete="off"

                                        />

                                    </div>

                                </div>


                                {/* =========================================
                                    ROW 2 - EMAIL / ROLE
                                ========================================= */}

                                <div className="form-row">


                                    {/* EMAIL */}

                                    <div className="form-group">

                                        <label htmlFor="user-email">

                                            <FaEnvelope />

                                            <span>
                                                Email Address
                                            </span>

                                        </label>

                                        <input

                                            id="user-email"

                                            type="email"

                                            name="email"

                                            value={
                                                formData.email
                                            }

                                            onChange={
                                                handleChange
                                            }

                                            placeholder="name@company.com"

                                            disabled={loading}

                                            autoComplete="off"

                                        />

                                    </div>


                                    {/* ROLE */}

                                    <div className="form-group">

                                        <label htmlFor="user-role">

                                            <FaUserShield />

                                            <span>
                                                Role
                                            </span>

                                        </label>

                                        <select

                                            id="user-role"

                                            name="role_id"

                                            value={
                                                formData.role_id
                                            }

                                            onChange={
                                                handleChange
                                            }

                                            disabled={loading}

                                        >

                                            <option value="2">
                                                Admin
                                            </option>

                                            <option value="3">
                                                Employee
                                            </option>

                                        </select>

                                    </div>

                                </div>


                                {/* =========================================
                                    ROW 3 - PASSWORD (ADD ONLY)
                                ========================================= */}

                                {!editingUser && (

                                    <div className="form-row">

                                        <div className="form-group form-group-full">

                                            <label htmlFor="user-password">

                                                <FaLock />

                                                <span>
                                                    Password
                                                </span>

                                            </label>

                                            <input

                                                id="user-password"

                                                type="password"

                                                name="password"

                                                value={
                                                    formData.password
                                                }

                                                onChange={
                                                    handleChange
                                                }

                                                placeholder="Enter a strong password"

                                                disabled={loading}

                                                autoComplete="new-password"

                                            />

                                        </div>

                                    </div>

                                )}

                            </div>


                            {/* =====================================
                                MODAL FOOTER
                            ===================================== */}

                            <div className="modal-footer">

                                <button

                                    type="button"

                                    className="cancel-user-btn"

                                    onClick={closeForm}

                                    disabled={loading}

                                >

                                    Cancel

                                </button>


                                <button

                                    type="submit"

                                    className="save-user-btn"

                                    disabled={loading}

                                >

                                    {

                                        loading

                                            ? "Saving..."

                                            : editingUser

                                                ? "Update User"

                                                : "Add User"

                                    }

                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

        </div>

    );

};


export default ManageUsers;

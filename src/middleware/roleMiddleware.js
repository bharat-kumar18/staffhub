const SuperAdmin = (req, res, next) => {

    try {

        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }

        const roleId = req.user.role_id;

        console.log("========== SUPER ADMIN CHECK ==========");
        console.log("User ID:", req.user.id);
        console.log("Email:", req.user.email);
        console.log("Role ID:", roleId);
        console.log("Role:", req.user.role);
        console.log("=======================================");

        if (Number(roleId) !== 1) {

            return res.status(403).json({
                success: false,
                message: "Access denied. Super Admin only"
            });

        }

        next();

    } catch (error) {

        console.error("Super Admin Middleware Error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error"
        });

    }
};


// ==========================================
// ADMIN MIDDLEWARE
// ==========================================

const Admin = (req, res, next) => {

    try {

        if (!req.user) {

            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });

        }

        const roleId = req.user.role_id;

        console.log("========== ADMIN CHECK ==========");
        console.log("User ID:", req.user.id);
        console.log("Email:", req.user.email);
        console.log("Role ID:", roleId);
        console.log("Role:", req.user.role);
        console.log("=================================");


        // Admin role_id = 2

        if (Number(roleId) !== 2) {

            return res.status(403).json({
                success: false,
                message: "Access denied. Admin only"
            });

        }

        next();

    } catch (error) {

        console.error("Admin Middleware Error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error"
        });

    }

};


module.exports = {
    SuperAdmin,
    Admin
};
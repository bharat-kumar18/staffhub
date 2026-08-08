const SuperAdmin = (req, res, next) => {

    try {

        // authMiddleware must run before this middleware

        if (!req.user) {

            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });

        }


        // Get role_id from JWT

        const roleId = req.user.role_id;


        console.log("========== ROLE CHECK ==========");
        console.log("User ID:", req.user.id);
        console.log("Email:", req.user.email);
        console.log("Role ID:", roleId);
        console.log("Role:", req.user.role);
        console.log("================================");


        // Super Admin role_id = 1

        if (Number(roleId) !== 1) {

            return res.status(403).json({
                success: false,
                message: "Access denied. Super Admin only"
            });

        }


        // Super Admin allowed

        next();

    } catch (error) {

        console.error("Super Admin Middleware Error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error"
        });

    }

};


module.exports = {
    SuperAdmin
};
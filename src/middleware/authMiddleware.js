const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {

    try {

        // 1. Get Authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                success: false,
                message: "Authorization token is required"
            });
        }


        // 2. Get token from "Bearer TOKEN"
        const token = authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Invalid authorization format"
            });
        }


        // 3. Verify JWT token
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );


        // 4. Store decoded user information in request
        req.user = decoded;


        // 5. Continue to next middleware/controller
        next();

    } catch (error) {

        console.error("JWT Error:", error.message);

        return res.status(401).json({
            success: false,
            message: "Invalid or expired token"
        });

    }
};


module.exports = authMiddleware;
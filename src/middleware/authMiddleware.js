const jwt = require("jsonwebtoken");

exports.authMiddlewaree = (req, res, next) => {

    try {

        // 1. Get Authorization header

        const authHeader = req.headers.authorization;

        if (!authHeader) {

            return res.status(401).json({
                success: false,
                message: "Authorization token is required"
            });

        }


        // 2. Check Bearer format

        const parts = authHeader.split(" ");

        if (
            parts.length !== 2 ||
            parts[0] !== "Bearer"
        ) {

            return res.status(401).json({
                success: false,
                message: "Invalid authorization format"
            });

        }


        const token = parts[1];


        // 3. Verify JWT

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );


        // 4. Store decoded information

        req.user = decoded;


        // 5. Continue

        next();

    } catch (error) {

        console.error(
            "JWT Error:",
            error.message
        );

        return res.status(401).json({

            success: false,

            message: "Invalid or expired token"

        });

    }

};


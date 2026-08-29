const swaggerJsdoc = require("swagger-jsdoc");

const options = {
    definition: {
        openapi: "3.0.0",

        info: {
            title: "StaffHUB API",
            version: "1.0.0",
            description: "API documentation for StaffHUB Employment Management System"
        },

        servers: [
            {
                url: "http://localhost:3000",
                description: "Local Development Server"
            }
        ],

        tags: [
            {
                name: "Authentication",
                description: "Authentication APIs"
            },
            {
                name: "Super Admin",
                description: "Super Admin APIs"
            }
        ],

        // JWT Authentication
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                    description: "Enter JWT token"
                }
            }
        }
    },

    apis: [
        "./src/routes/*.js",
        "./src/controller/*.js"
    ]
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
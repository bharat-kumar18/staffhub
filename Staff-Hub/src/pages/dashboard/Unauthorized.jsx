import React from "react";
import { useNavigate } from "react-router-dom";

const Unauthorized = () => {
    const navigate = useNavigate();

    return (
        <div
            style={{
                minHeight: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "column",
                textAlign: "center",
                padding: "20px"
            }}
        >
            <h1>403</h1>

            <h2>Access Denied</h2>

            <p>
                You are not authorized to access this page.
            </p>

            <button
                onClick={() => navigate(-1)}
                style={{
                    padding: "10px 20px",
                    marginTop: "15px",
                    cursor: "pointer",
                    width:"120px"
                }}
            >
                Go Back
            </button>
        </div>
    );
};

export default Unauthorized;
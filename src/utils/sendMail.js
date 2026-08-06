const nodemailer = require("nodemailer");
const path = require("path");


// EMAIL TRANSPORTER

const transporter = nodemailer.createTransport({

    service: "gmail",

    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }

});

// SEND WELCOME EMAIL

const sendWelcomeEmail = async (name, email) => {
    try {
        await transporter.sendMail({
            from: `YourApp Name <${process.env.EMAIL_USER}>`,
            to: `${email}`,
            subject: "Signup Successful 🎉",
            html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0"
    >

    <title>
        Welcome to StaffHUB
    </title>
</head>

<body
    style="
        margin:0;
        padding:0;
        background:#f1f5f9;
        font-family:Arial,Helvetica,sans-serif;
    "
>

<table
    width="100%"
    cellpadding="0"
    cellspacing="0"
    border="0"
    style="
        background:#f1f5f9;
        padding:45px 20px;
    "
>
<tr>
<td align="center">

<table
    width="600"
    cellpadding="0"
    cellspacing="0"
    border="0"
    style="
        width:100%;
        max-width:600px;
        background:#ffffff;
        border-radius:14px;
        overflow:hidden;
        box-shadow:0 4px 20px rgba(15,23,42,.08);
    "
>

<!-- HEADER -->

<tr>
<td
    align="center"
    style="
        background:#256eeb;
        border-top:5px solid #212224a9;
        padding:32px 25px;
    "
>

<img
    src="cid:staffhub-logo"
    width="95"
    alt="StaffHUB Logo"
    style="
        display:block;
        margin:0 auto 10px;
    "
>

<div
    style="
        color:#fff;
        font-size:28px;
        font-weight:bold;
    "
>
    StaffHUB
</div>

<div
    style="
        margin-top:6px;
        color:#dbeafe;
        font-size:12px;
        letter-spacing:1.5px;
    "
>
    EMPLOYEE MANAGEMENT SYSTEM
</div>

</td>
</tr>

<tr>
<td
    style="
        height:4px;
        background:#dbeafe;
    "
></td>
</tr>

<!-- BODY -->

<tr>
<td style="padding:45px;">

<h2
    style="
        margin:0 0 20px;
        color:#111827;
    "
>
    Welcome to StaffHUB 🎉
</h2>

<p
    style="
        color:#475569;
        font-size:16px;
        line-height:26px;
    "
>
    Hello <strong>${name}</strong>,
</p>

<p
    style="
        color:#475569;
        font-size:16px;
        line-height:26px;
    "
>
    Congratulations! Your StaffHUB account has been created successfully.
    You can now securely log in and start managing your employee dashboard.
</p>

<!-- SUCCESS BOX -->

<table
    width="100%"
    cellpadding="0"
    cellspacing="0"
    border="0"
    style="
        margin-top:30px;
        background:#f0fdf4;
        border:1px solid #bbf7d0;
        border-radius:10px;
        padding:20px;
    "
>

<tr>
<td>

<p
    style="
        margin:0;
        color:#166534;
        font-size:16px;
        font-weight:bold;
    "
>
    ✅ Registration Successful
</p>

</td>
</tr>

</table>

<!-- NEXT STEP -->

<p
    style="
        margin-top:30px;
        color:#475569;
        line-height:26px;
    "
>
    You can now log in to your StaffHUB account and begin using all available features.
</p>

<!-- NOTICE -->

<table
    width="100%"
    cellpadding="0"
    cellspacing="0"
    border="0"
    style="
        margin-top:30px;
        background:#fffbeb;
        border:1px solid #fde68a;
        border-radius:10px;
    "
>

<tr>
<td style="padding:18px;">

<p
    style="
        margin:0;
        color:#92400e;
        line-height:22px;
    "
>
<strong>Security Tip:</strong>
If you did not create this account, please contact StaffHUB support immediately.
</p>

</td>
</tr>

</table>

</td>
</tr>

<!-- FOOTER -->

<tr>
<td
    align="center"
    style="
        background:#f8fafc;
        border-top:1px solid #e2e8f0;
        padding:25px;
    "
>

<p
    style="
        margin:0 0 8px;
        color:#475569;
        font-size:13px;
    "
>
Need help? Contact StaffHUB Support.
</p>

<p
    style="
        margin:0;
        color:#94a3b8;
        font-size:12px;
    "
>
© ${new Date().getFullYear()} StaffHUB.
All rights reserved.
</p>

<p
    style="
        margin-top:6px;
        color:#cbd5e1;
        font-size:11px;
    "
>
This is an automated email. Please do not reply.
</p>

</td>
</tr>

</table>

</td>
</tr>
</table>

</body>
</html>
`,
attachments: [

                {

                    filename: "staffhub.png",

                    path: path.join(
                        __dirname,
                        "../images/staffhub.png"
                    ),

                    cid: "staffhub-logo",

                    contentType: "image/png"

                }

            ]





        });
        console.log("Welcome email sent to:", `${email}`);
    } catch (error) {
        console.error("Error sending email:", error);
    }
};



// SEND OTP EMAIL

const sendOTPEmail = async (email, otp) => {

    try {

        // -------------------------------------------------
        // Convert OTP into individual digits
        // -------------------------------------------------

        const otpDigits = otp.toString().split("");


        // -------------------------------------------------
        // Create OTP boxes
        // -------------------------------------------------

        const otpBoxes = otpDigits.map((digit) => {

            return `
                <td
                    align="center"
                    style="
                        width: 42px;
                        height: 48px;
                        background-color: #eff6ff;
                        border: 1px solid #bfdbfe;
                        border-radius: 8px;
                        color: #2563eb;
                        font-size: 24px;
                        font-weight: bold;
                        font-family: Arial, Helvetica, sans-serif;
                    "
                >
                    ${digit}
                </td>

                <td style="width: 7px;"></td>
            `;

        }).join("");


        // =================================================
        // MAIL OPTIONS
        // =================================================

        const mailOptions = {

            from: `"StaffHUB" <${process.env.EMAIL_USER}>`,

            to: email,

            subject: "StaffHUB | Password Reset Verification Code",


            // =================================================
            // HTML TEMPLATE
            // =================================================

            html: `

            <!DOCTYPE html>

            <html>

            <head>

                <meta charset="UTF-8">

                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1.0"
                >

                <title>
                    StaffHUB Password Reset
                </title>

            </head>


            <body
                style="
                    margin: 0;
                    padding: 0;
                    background-color: #f1f5f9;
                    font-family: Arial, Helvetica, sans-serif;
                "
            >


                <!-- ========================================= -->
                <!-- PAGE BACKGROUND -->
                <!-- ========================================= -->

                <table
                    width="100%"
                    cellpadding="0"
                    cellspacing="0"
                    border="0"
                    style="
                        background-color: #f1f5f9;
                        padding: 45px 20px;
                    "
                >

                    <tr>

                        <td align="center">


                            <!-- ================================= -->
                            <!-- MAIN EMAIL CONTAINER -->
                            <!-- ================================= -->

                            <table
                                width="600"
                                cellpadding="0"
                                cellspacing="0"
                                border="0"
                                style="
                                    width: 100%;
                                    max-width: 600px;
                                    background-color: #ffffff;
                                    border-radius: 14px;
                                    overflow: hidden;
                                    box-shadow:
                                        0 4px 20px
                                        rgba(15, 23, 42, 0.08);
                                "
                            >


                                <!-- ================================= -->
                                <!-- HEADER -->
                                <!-- ================================= -->

                                <tr>

                                    <td
                                        align="center"
                                        style="
                                            background-color: #256eeb;
                                            border-top: 5px solid #212224a9;
                                            padding: 32px 25px 30px;
                                        "
                                    >


                                        <!-- LOGO -->

                                        <img
                                            src="cid:staffhub-logo"
                                            alt="StaffHUB Logo"
                                            width="95"
                                            style="
                                                display: block;
                                                width: 95px;
                                                max-width: 95px;
                                                height: auto;
                                                margin: 0 auto 10px;
                                            "
                                        >


                                        <!-- BRAND NAME -->

                                        <div
                                            style="
                                                color: #ffffff;
                                                font-size: 28px;
                                                line-height: 34px;
                                                font-weight: 700;
                                                letter-spacing: -0.5px;
                                            "
                                        >
                                            StaffHUB
                                        </div>


                                        <!-- TAGLINE -->

                                        <div
                                            style="
                                                margin-top: 7px;
                                                color: #dbeafe;
                                                font-size: 12px;
                                                line-height: 18px;
                                                font-weight: 600;
                                                letter-spacing: 1.5px;
                                            "
                                        >
                                            EMPLOYEE MANAGEMENT SYSTEM
                                        </div>


                                    </td>

                                </tr>


                                <!-- ================================= -->
                                <!-- HEADER ACCENT -->
                                <!-- ================================= -->

                                <tr>

                                    <td
                                        style="
                                            height: 4px;
                                            background-color: #dbeafe;
                                            font-size: 0;
                                            line-height: 0;
                                        "
                                    >
                                        &nbsp;
                                    </td>

                                </tr>


                                <!-- ================================= -->
                                <!-- BODY -->
                                <!-- ================================= -->

                                <tr>

                                    <td
                                        style="
                                            padding: 42px 48px 45px;
                                        "
                                    >


                                        <!-- HEADING -->

                                        <h2
                                            style="
                                                margin: 0 0 18px;
                                                color: #111827;
                                                font-size: 26px;
                                                line-height: 34px;
                                                font-weight: 700;
                                            "
                                        >
                                            Password Reset Request
                                        </h2>


                                        <!-- GREETING -->

                                        <p
                                            style="
                                                margin: 0 0 16px;
                                                color: #475569;
                                                font-size: 16px;
                                                line-height: 25px;
                                            "
                                        >
                                            Hello,
                                        </p>


                                        <!-- DESCRIPTION -->

                                        <p
                                            style="
                                                margin: 0 0 28px;
                                                color: #475569;
                                                font-size: 16px;
                                                line-height: 26px;
                                            "
                                        >
                                            We received a request to reset
                                            the password for your
                                            <strong style="color: #eba225;">
                                                StaffHUB
                                            </strong>
                                            account.
                                            Use the verification code below
                                            to continue.
                                        </p>



                                        <!-- ================================= -->
                                        <!-- OTP SECTION -->
                                        <!-- ================================= -->

                                        <table
                                            width="100%"
                                            cellpadding="0"
                                            cellspacing="0"
                                            border="0"
                                            style="
                                                background-color: #f8fafc;
                                                border: 1px solid #e2e8f0;
                                                border-radius: 12px;
                                                padding: 25px 15px;
                                            "
                                        >

                                            <tr>

                                                <td align="center">


                                                    <!-- OTP LABEL -->

                                                    <div
                                                        style="
                                                            color: #313335;
                                                            font-size: 12px;
                                                            line-height: 18px;
                                                            font-weight: 700;
                                                            letter-spacing: 2px;
                                                            margin-bottom: 18px;
                                                        "
                                                    >
                                                        YOUR VERIFICATION CODE
                                                    </div>


                                                    <!-- OTP DIGITS -->

                                                    <table
                                                        cellpadding="0"
                                                        cellspacing="0"
                                                        border="0"
                                                        align="center"
                                                    >

                                                        <tr>

                                                            ${otpBoxes}

                                                        </tr>

                                                    </table>


                                                </td>

                                            </tr>

                                        </table>



                                        <!-- ================================= -->
                                        <!-- EXPIRY -->
                                        <!-- ================================= -->

                                        <table
                                            width="100%"
                                            cellpadding="0"
                                            cellspacing="0"
                                            border="0"
                                            style="
                                                margin-top: 20px;
                                            "
                                        >

                                            <tr>

                                                <td
                                                    align="center"
                                                    style="
                                                        color: #3e4247;
                                                        font-size: 14px;
                                                        line-height: 22px;
                                                    "
                                                >

                                                    ⏱

                                                    This verification code
                                                    expires in

                                                    <strong
                                                        style="
                                                            color: #475569;
                                                        "
                                                    >
                                                        10 minutes
                                                    </strong>.

                                                </td>

                                            </tr>

                                        </table>



                                        <!-- ================================= -->
                                        <!-- SECURITY NOTICE -->
                                        <!-- ================================= -->

                                        <table
                                            width="100%"
                                            cellpadding="0"
                                            cellspacing="0"
                                            border="0"
                                            style="
                                                margin-top: 28px;
                                                background-color: #fffbeb;
                                                border: 1px solid #fde68a;
                                                border-radius: 10px;
                                            "
                                        >

                                            <tr>

                                                <td
                                                    style="
                                                        padding: 16px 18px;
                                                    "
                                                >

                                                    <p
                                                        style="
                                                            margin: 0;
                                                            color: #92400e;
                                                            font-size: 13px;
                                                            line-height: 20px;
                                                        "
                                                    >

                                                        <strong>
                                                            Security Notice:
                                                        </strong>

                                                        Never share this
                                                        verification code
                                                        with anyone.

                                                        StaffHUB will never
                                                        ask you to share
                                                        your OTP.

                                                    </p>

                                                </td>

                                            </tr>

                                        </table>



                                        <!-- ================================= -->
                                        <!-- FALLBACK MESSAGE -->
                                        <!-- ================================= -->

                                        <p
                                            style="
                                                margin: 28px 0 0;
                                                color: #64748b;
                                                font-size: 14px;
                                                line-height: 23px;
                                            "
                                        >

                                            If you didn't request a password
                                            reset, please ignore this email
                                            or contact our support team if
                                            you believe your account may be
                                            at risk.

                                        </p>


                                    </td>

                                </tr>


                                <!-- ================================= -->
                                <!-- FOOTER -->
                                <!-- ================================= -->

                                <tr>

                                    <td
                                        align="center"
                                        style="
                                            background-color: #f8fafc;
                                            border-top: 1px solid #e2e8f0;
                                            padding: 25px 20px;
                                        "
                                    >


                                        <!-- SUPPORT -->

                                        <p
                                            style="
                                                margin: 0 0 8px;
                                                color: #475569;
                                                font-size: 13px;
                                                line-height: 20px;
                                            "
                                        >

                                            Need help?
                                            Contact StaffHUB Support.

                                        </p>


                                        <!-- COPYRIGHT -->

                                        <p
                                            style="
                                                margin: 0;
                                                color: #94a3b8;
                                                font-size: 12px;
                                                line-height: 18px;
                                            "
                                        >

                                            © ${new Date().getFullYear()}
                                            StaffHUB.
                                            All rights reserved.

                                        </p>


                                        <!-- AUTOMATED EMAIL -->

                                        <p
                                            style="
                                                margin: 6px 0 0;
                                                color: #cbd5e1;
                                                font-size: 11px;
                                                line-height: 17px;
                                            "
                                        >

                                            This is an automated email.
                                            Please do not reply.

                                        </p>


                                    </td>

                                </tr>


                            </table>


                        </td>

                    </tr>

                </table>


            </body>

            </html>

            `,


            // =================================================
            // STAFFHUB LOGO
            // =================================================

            attachments: [

                {

                    filename: "staffhub.png",

                    path: path.join(
                        __dirname,
                        "../images/staffhub.png"
                    ),

                    cid: "staffhub-logo",

                    contentType: "image/png"

                }

            ]

        };


        // =================================================
        // SEND EMAIL
        // =================================================

        await transporter.sendMail(mailOptions);


        console.log(
            "OTP email sent successfully to:",
            email
        );


    } catch (error) {

        console.error(
            "Send OTP Email Error:",
            error
        );

        throw error;

    }

};


// EXPORT


module.exports = { sendOTPEmail, sendWelcomeEmail };
// module.exports= sendWelcomeEmail;
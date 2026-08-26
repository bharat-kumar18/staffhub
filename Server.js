const express = require('express');
const app = express();
const cors = require("cors");

require('dotenv').config();

// const authRoutes = require("./src/routes/auth.routes");

const path = require("path");

app.use(express.json());
app.use(cors())


const port = 3000



// Auth

const authRouter = require("./src/routes/auth.routes");
app.use('/api', authRouter);


// employees

const employeeRoutes = require("./src/routes/employee.routes");
app.use("/api", employeeRoutes);



// Office Timing
const officeTimingRoutes = require("./src/routes/officeTiming.routes");
app.use("/api", officeTimingRoutes);

const attendanceRoutes =require("./src/routes/attendance.routes");
app.use("/api", attendanceRoutes);



// Leave 
const leaveRoutes =require("./src/routes/leave.routes");
app.use("/api", leaveRoutes);

// Profile route
const profileRoutes = require("./src/routes/profile.routes");
app.use("/api", profileRoutes);



app.use("/uploads", express.static(path.join(__dirname, "uploads")));




app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})

app.use('/', (req, res) => {
    res.send("backend running")
});
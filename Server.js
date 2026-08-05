const express = require('express');
const app = express();
const cors = require("cors");

require('dotenv').config();

const authRoutes = require("./src/routes/auth.routes");


app.use(express.json());
app.use(cors())


const port = 3000


const authRouter = require("./src/routes/auth.routes");
app.use('/api', authRouter);


app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})

app.use('/', (req, res) => {
    res.send("backend running")
});
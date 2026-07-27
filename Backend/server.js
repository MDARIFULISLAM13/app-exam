const express = require('express');
const dotenv = require('dotenv');
const { ConnectDb } = require('./DB/dbconfig');
const router = require('./Routers/router');
const cors = require('cors');
const path = require('path');
dotenv.config();

const app = express();
ConnectDb();
app.use(express.json());
app.use(cors());
const multer = require("multer");
const fs = require("fs");
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));


//security
// -----------------------------
// RATE LIMIT (per IP) - pre hour =400


const rateLimit = require("express-rate-limit");



const perHourLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 1000,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many requests in 1 hour. Try again later." },
});

app.use(perHourLimiter);

// -----------------------------
// END RATE LIMIT
// -----------------------------

const helmet = require("helmet");

// Helmet middleware globally apply
app.use(helmet());

// manually also hide express signature (optional but recommended)
app.disable("x-powered-by");

// -----------------------------
// END HELMET

app.use('/api', router);



//error log
// ================================
// VERY SIMPLE & PRODUCTION-READY ERROR LOGGER
// সব error -> error.log ফাইলে save হবে
// ================================

// file system module (built-in)
// error log file path
const errorLogPath = path.join(__dirname, "error.log");

// error logging function
function saveErrorLog(message) {
    const logLine = `[${new Date().toISOString()}] ${message}\n`;
    fs.appendFile(errorLogPath, logLine, (err) => {
        if (err) console.error("Error writing log:", err);
    });
}

// global error handler (must be placed AFTER routes)
app.use((err, req, res, next) => {
    console.error(err); // terminal output

    // save error in log file
    saveErrorLog(`${err.message} - ${err.stack}`);

    res.status(500).json({
        message: "Internal Server Error"
    });
});

// Catch errors outside Express (server crash prevent)
process.on("uncaughtException", (err) => {
    saveErrorLog(`Uncaught Exception: ${err.message} - ${err.stack}`);
});

process.on("unhandledRejection", (err) => {
    saveErrorLog(`Unhandled Promise Rejection: ${err?.message} - ${err?.stack}`);
});






const PORT = process.env.PORT;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
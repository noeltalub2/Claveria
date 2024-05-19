// app.js
import express from "express";
import cookieParser from "cookie-parser";
import connectFlash from "connect-flash";
import cookieSession from "cookie-session";
import http from "http";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import indexRoutes from "./routes/indexRoutes.js";
import conductorRoutes from "./routes/conductorRoutes.js";
import inspectorRoutes from "./routes/inspectorRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import cron from "node-cron";

import db from "./database/connect_db.js";

const app = express();
const server = http.createServer(app);

// Set EJS as the view engine
app.set("view engine", "ejs");

// __dirname is not available in ES modules, so we need to derive it
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

//Middlewares
app.set("views", path.join(__dirname, "views"));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// Session configuration
app.use(
	cookieSession({
		name: "session",
		keys: [process.env.SESSION_SECRET],
		cookie: {
			secure: true,
			httpOnly: true,
		},
	})
);

app.use(connectFlash());

// Global variables for flash messages
app.use((req, res, next) => {
	res.locals.success_msg = req.flash("success_msg");
	res.locals.error_msg = req.flash("error_msg");
	res.locals.error = req.flash("error");
	next();
});
//Database connection
db.getConnection((err, connection) => {
	if (err) throw err;
	console.log("Database connected successfully");
	connection.release();
});

// Function to update schedule statuses
const updateScheduleStatus = () => {
    const query = `
      UPDATE schedules
      SET status = 'Inactive'
      WHERE (CURDATE() > departure_date OR (CURDATE() = departure_date AND CURTIME() > arrival_time)) AND status = 'Active';
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error("Error updating schedules:", err);
            return;
        }
        console.log("Schedules updated:", results.affectedRows);
    });
};


// Schedule the status update to run every minute
cron.schedule("*/15 * * * *", () => {
	console.log("Running scheduled task to update schedule statuses");
	updateScheduleStatus();
});

cron.schedule("0 12 * * *", () => {
	console.log("Running a task every day at 12:00 PM");

	dq.query(updateBookings, (err, results) => {
		if (err) {
			return console.error("error: " + err.message);
		}
		console.log("Updated bookings:", results.affectedRows);
	});
});

// Use routes
app.use("/admin", adminRoutes);
app.use("/inspector", inspectorRoutes);
app.use("/conductor", conductorRoutes);
app.use("/", indexRoutes);

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});

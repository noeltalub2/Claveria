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

// Use routes
app.use("/conductor", conductorRoutes);
app.use("/", indexRoutes);

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});

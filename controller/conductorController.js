import query from "../database/query_db.js";
import db from "../database/connect_db.js";
import bcrypt from "bcrypt";
import createToken from "../utils/token.js";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const getLogin = (req, res) => {
	res.render("Conductor/login", { username: req.flash("username")[0] });
};

const postLogin = async (req, res) => {
	try {
		const { username, password } = req.body;
		const findUser = "SELECT * from conductors WHERE username = ?";

		db.query(findUser, [username], async (err, result) => {
			if (err) {
				console.log(err);
				req.flash("error_msg", "Authentication failed.");
				res.redirect("/conductor/login");
			} else {
				if (result.length > 0) {
					const match_password = await bcrypt.compare(
						password,
						result[0].password
					);

					if (match_password) {
						const generateToken = createToken(
							result[0].cnd_id,
							result[0].username,
							"conductor"
						);
						res.cookie("token", generateToken, {
							httpOnly: true,
						});
						res.redirect("/conductor/");
					} else {
						req.flash(
							"error_msg",
							"Incorrect username or password"
						);
						req.flash("username", username); // Flash the username
						res.redirect("/conductor/login");
					}
				} else {
					req.flash("error_msg", "Could'nt find your account");
					res.redirect("/conductor/login");
				}
			}
		});
	} catch {
		throw err;
	}
};

const getRoutes = async (req, res) => {
	const available_schedule = await query(
		"SELECT COUNT(pp.psg_id) AS passenger_count, b.bus_number, sch.schedule_id, sch.route_id, sch.bus_id,  DATE_FORMAT(sch.departure_time, '%r') AS departure_time, DATE_FORMAT(sch.arrival_time, '%r') AS arrival_time, sch.departure_date, rt.fare, rt.start_point, rt.end_point, rt.route_id FROM schedules sch JOIN routes rt ON sch.route_id = rt.route_id JOIN buses b ON sch.bus_id = b.bus_id JOIN conductors c ON c.cnd_id = sch.conductor_id LEFT JOIN pickup_passenger pp ON pp.schedule_id = sch.schedule_id WHERE sch.departure_date = CURDATE() AND sch.status = 'Active' AND sch.conductor_id = ? GROUP BY sch.schedule_id, sch.route_id, sch.bus_id, sch.departure_time, sch.arrival_time, sch.departure_date, rt.fare, rt.start_point, rt.end_point, b.bus_number;",
		[res.locals.user.id]
	);

	const history = await query(
		"SELECT b.bus_number, pp.origin, DATE_FORMAT(sch.departure_time, '%r') AS departure_time, DATE_FORMAT(sch.arrival_time, '%r') AS arrival_time, sch.departure_date, pp.fare_paid, rt.start_point, rt.end_point, pp.fullname FROM pickup_passenger pp INNER JOIN schedules sch ON pp.schedule_id = sch.schedule_id JOIN routes rt ON sch.route_id = rt.route_id JOIN buses b ON sch.bus_id = b.bus_id WHERE pp.conductor_id = ? ORDER BY pp.psg_id DESC",
		[res.locals.user.id]
	);

	let sub_routes;
	if (available_schedule.length > 0) {
		sub_routes = await query(
			"SELECT * FROM sub_routes WHERE route_id = ?",
			[available_schedule[0].route_id]
		);
	} else {
		sub_routes = [];
	}

	res.render("Conductor/routes", {
		available_schedule,
		sub_routes,
		history,
	});
};

const postAddPassenger = async (req, res) => {
	const { origin, destination, fare, schedule_id, passenger_count } =
		req.body;

	let fullname = req.body.fullname;
	if (!fullname) {
		fullname = "PICK UP";
	}

	// Calculate fare per passenger
	const farePerPassenger = fare / passenger_count;

	try {
		const query =
			"INSERT INTO pickup_passenger (fullname, origin, destination, fare_paid, schedule_id, conductor_id) VALUES (?, ?, ?, ?, ?, ?)";

		// Loop to insert each passenger
		for (let i = 0; i < passenger_count; i++) {
			db.query(
				query,
				[
					fullname,
					origin,
					destination,
					farePerPassenger,
					schedule_id,
					res.locals.user.id,
				],
				(error, results) => {
					if (error) {
						console.log(error);
						return res.status(500).json({
							success: false,
							message:
								"There was an error adding the passenger(s).",
						});
					}

					
				}
			);
		}

		// Return a JSON response indicating success
		return res.status(200).json({
			success: true,
			message: "Passenger(s) added successfully.",
		});
	} catch (err) {
		console.error(err);
		return res.status(500).json({
			success: false,
			message: "There was an error adding the passenger(s).",
		});
	}
};

const getLogout = (req, res) => {
	res.clearCookie("token");
	res.redirect("/");
};
export default {
	getLogin,
	postLogin,
	getRoutes,
	postAddPassenger,
	getLogout,
};

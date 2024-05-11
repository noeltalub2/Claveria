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
	res.render("Inspector/login", { username: req.flash("username")[0] });
};

const postLogin = async (req, res) => {
	try {
		const { username, password } = req.body;
		const findUser = "SELECT * from inspectors WHERE username = ?";

		db.query(findUser, [username], async (err, result) => {
			if (err) {
				console.log(err);
				req.flash("error_msg", "Authentication failed.");
				res.redirect("/inspector/login");
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
							"inspector"
						);
						res.cookie("token", generateToken, {
							httpOnly: true,
						});
						res.redirect("/inspector/");
					} else {
						req.flash(
							"error_msg",
							"Incorrect username or password"
						);
						req.flash("username", username); // Flash the username
						res.redirect("/inspector/login");
					}
				} else {
					req.flash("error_msg", "Could'nt find your account");
					res.redirect("/inspector/login");
				}
			}
		});
	} catch {
		throw err;
	}
};

const getRoutes = async (req, res) => {
	const date = new Date(new Date().setDate(new Date().getDate()))
		.toISOString()
		.slice(0, 10);
	
	const available_schedule = await query(
		"SELECT COUNT(pp.psg_id) AS passenger_count, b.bus_number, sch.schedule_id, sch.route_id, sch.bus_id, sch.departure_time, sch.arrival_time, sch.departure_date,SUM(pp.fare_paid) as total_fare, rt.fare, rt.start_point, rt.end_point, c.fullname FROM schedules sch JOIN routes rt ON sch.route_id = rt.route_id JOIN buses b ON sch.bus_id = b.bus_id JOIN conductors c ON c.cnd_id = sch.conductor_id LEFT JOIN pickup_passenger pp ON pp.schedule_id = sch.schedule_id WHERE sch.departure_date = ? AND sch.status = 'Active' GROUP BY sch.schedule_id, sch.route_id, sch.bus_id, sch.departure_time, sch.arrival_time, sch.departure_date, rt.fare, rt.start_point, rt.end_point, b.bus_number;",
		[date]
	);

	res.render("Inspector/routes", {
		available_schedule,
	
	});
};

const postAddPassenger = async (req, res) => {
	const { fullname, origin, destination, fare, schedule_id } = req.body;

	try {
		const query =
			"INSERT INTO pickup_passenger (fullname, origin, destination, fare_paid, schedule_id, conductor_id) VALUES (?, ?, ?, ?, ?,?)";

		db.query(
			query,
			[
				fullname,
				origin,
				destination,
				fare,
				schedule_id,
				res.locals.user.id,
			],
			(err, results) => {
				if (err) {
					console.log(err);
					return res.status(500).json({
						success: false,
						message: "There was an error adding the passenger.",
					});
				}
				// Return a JSON response indicating success
				res.status(200).json({
					success: true,
					message: "Passenger added successfully.",
				});
			}
		);
	} catch (e) {
		return res.status(500).json({
			success: false,
			message: "There was an error.",
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

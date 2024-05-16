import query from "../database/query_db.js";
import db from "../database/connect_db.js";
import bcrypt from "bcrypt";
import PDFDocument from "pdfkit";
import createToken from "../utils/token.js";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const getIndex = async (req, res) => {
	const announcements = await query("SELECT * FROM announcement")
	const routes = await query("SELECT * FROM routes");
	res.render("Home/index", { routes,announcements });
};

const getLogin = (req, res) => {
	res.render("Home/login", { username: req.flash("username")[0] });
};

const postLogin = async (req, res) => {
	try {
		const { username, password } = req.body;
		const findUser = "SELECT * from users WHERE username = ?";

		db.query(findUser, [username], async (err, result) => {
			if (err) {
				req.flash("error_msg", "Authentication failed.");
				res.redirect("/login");
			} else {
				if (result.length > 0) {
					const match_password = await bcrypt.compare(
						password,
						result[0].password
					);

					if (match_password) {
						const generateToken = createToken(
							result[0].acc_id,
							result[0].username,
							"user"
						);
						res.cookie("token", generateToken, {
							httpOnly: true,
						});
						res.redirect("/");
					} else {
						req.flash(
							"error_msg",
							"Incorrect username or password"
						);
						req.flash("username", username); // Flash the username
						res.redirect("/login");
					}
				} else {
					req.flash("error_msg", "Could'nt find your account");
					res.redirect("/login");
				}
			}
		});
	} catch {
		throw err;
	}
};

const getRegister = (req, res) => {
	res.render("Home/register");
};

const postRegister = async (req, res) => {
	const { fullname, email, contact, address, username, password } = req.body;

	let errors = [];
	//Sql statement if there is duplciate in database
	var username_exist =
		"SELECT COUNT(*) as `count` FROM users WHERE username = ?";
	var email_exist = "Select count(*) as `count` from users where email = ?";
	var contact_exist =
		"Select count(*) as `count` from users where contact = ?";
	//Query statement
	const username_count = (await query(username_exist, [username]))[0].count;
	const email_count = (await query(email_exist, [email]))[0].count;
	const contact_count = (await query(contact_exist, [contact]))[0].count;

	if (email_count > 0) {
		errors.push({ msg: "Email is already registered" });
	}
	if (contact_count > 0) {
		errors.push({ msg: "Contact is already registered" });
	}
	if (username_count > 0) {
		errors.push({ msg: "Username is already registered" });
	}
	//To encrypt the password using hash
	const salt = bcrypt.genSaltSync(12);
	const hash = bcrypt.hashSync(password, salt);
	//Data to insert in sql
	var data = {
		fullname,
		email,
		contact,
		address,
		username,
		password: hash,
	};
	//Add account to database
	var sql = "INSERT INTO users SET ?";
	db.query(sql, data, (err, rset) => {
		if (err) {
			res.render("Home/register", {
				errors,
			});
		} else {
			req.flash("success_msg", "Account created successfully.");
			res.redirect("/register");
		}
	});
};

const getBooking = async (req, res) => {
	const route = req.query.destination;
	const departure = req.query.departure;
	const passengerCount = req.query.passengerCount;
	const routes = await query("SELECT * FROM routes");
	const route_details = (
		await query("SELECT * FROM routes WHERE route_id = ?", [route])
	)[0];

	const available_schedule = await query(
		"SELECT sch.schedule_id, sch.route_id, sch.bus_id,DATE_FORMAT(sch.departure_time, '%r') AS departure_time, DATE_FORMAT(sch.arrival_time, '%r') AS arrival_time, sch.departure_date, rt.fare, rt.start_point, rt.end_point, b.bus_number, (b.capacity - IFNULL(bc.booked_count, 0)) AS available_seats FROM schedules sch JOIN routes rt ON sch.route_id = rt.route_id JOIN buses b ON sch.bus_id = b.bus_id LEFT JOIN (SELECT bk.schedule_id, COUNT(*) AS booked_count FROM bookings bk JOIN seats s ON bk.booking_id = s.booking_id WHERE bk.status IN ('Pending','Paid') GROUP BY bk.schedule_id) bc ON sch.schedule_id = bc.schedule_id WHERE sch.route_id = ? AND sch.departure_date = ? AND sch.status = 'Active';",
		[route, departure]
	);
	const sub_routes = await query(
		"SELECT sr.* FROM sub_routes sr INNER JOIN routes r ON r.route_id = sr.route_id WHERE sr.destination = ?",
		[route_details.start_point]
	);

	res.render("Home/booking", {
		available_schedule,
		route_details,
		departure,
		routeId: route,
		routes,
		passengerCount,
		sub_routes,
	});
};
const getBookingDetails = async (req, res) => {
	try {
		const available_seats = await query(
			"SELECT seat_number FROM seats s INNER JOIN bookings b ON b.booking_id = s.booking_id WHERE schedule_id = ? AND b.status IN ('Pending', 'Paid');",
			[req.body.sch_id]
		);

		const scheduleDetails = await query(
			"SELECT r.fare, r.end_point as destination, DATE_FORMAT(s.departure_time, '%r') AS departure_time, s.departure_date FROM routes r JOIN schedules s ON r.route_id = s.route_id WHERE s.schedule_id = ?;",
			[req.body.sch_id]
		);

		if (scheduleDetails.length > 0) {
			const details = scheduleDetails[0];

			res.json({
				sch_id: req.body.sch_id,
				available_seats: available_seats.map(
					(seat) => seat.seat_number
				),
				fare: details.fare,
				destination: details.destination,
				departure_time: details.departure_time,
				departure_date: `${new Intl.DateTimeFormat("en-US", {
					month: "short",
					day: "2-digit",
					year: "numeric",
				}).format(
					new Date(details.departure_date)
				)} ${new Intl.DateTimeFormat("en-US", {
					weekday: "short",
				}).format(new Date(details.departure_date))}`,
			});
		} else {
			res.status(404).json({
				message: "No schedule details found for the provided ID.",
			});
		}
	} catch (e) {
		console.error(e);
		res.status(500).json({ error: "Internal Server Error" });
	}
};
const postBookingDetails = async (req, res) => {
	try {
		const schedule_id = req.body.sch_inp;
		const fare_paid = req.body.fare_inp;
		const seats = req.body.selectedSeatIds;
		const drop_off = req.body.drop_off;
		const id_number = req.body.id_number
		let booking = {
			user_id: res.locals.user.id,
			schedule_id,
			fare_paid: fare_paid,
			status: "Pending",
			booking_type: "Online",
			drop_off: drop_off,
			id_number: id_number,
			booking_date: new Date().toISOString().slice(0, 10),
			booking_expiration: new Date(
				new Date().setDate(new Date().getDate() + 1)
			)
				.toISOString()
				.slice(0, 10),
		};

		let sql = "INSERT INTO bookings SET ?";
		let query = db.query(sql, booking, (err, result) => {
			if (err) {
				throw err;
			} else {
				seats.forEach(async (seat) => {
					const bookingId = result.insertId;
					let seats = {
						booking_id: bookingId,
						seat_number: seat,
					};
					let sql = "INSERT INTO seats SET ?";
					let query = db.query(sql, seats, (err, result) => {
						if (err) throw err;
					});
				});
			}
		});
		res.status(200).json({ message: "Successfully booked bus" });
	} catch (e) {
		console.error(e);
		res.status(500).json({ error: "Internal Server Error" });
	}
};

const getAccount = async (req, res) => {
	const user = (
		await query("SELECT * FROM users WHERE acc_id = ?", [
			res.locals.user.id,
		])
	)[0];

	const active_bookings = await query(
		"SELECT b.drop_off,b.booking_id, b.fare_paid, b.booking_expiration, b.status, r.fare, r.end_point as destination, r.start_point as origin, DATE_FORMAT(s.departure_time, '%r') AS departure_time, s.departure_date, b.dateAdded, GROUP_CONCAT(st.seat_number ORDER BY st.seat_number SEPARATOR ', ') AS seat_numbers FROM routes r JOIN schedules s ON r.route_id = s.route_id JOIN bookings b ON b.schedule_id = s.schedule_id JOIN seats st ON st.booking_id = b.booking_id WHERE b.status IN ('Pending', 'Paid') AND b.user_id = ? AND s.departure_date >= CURDATE() GROUP BY b.booking_id ORDER BY b.dateAdded DESC;",
		[res.locals.user.id]
	);

	const history_bookings = await query(
		"SELECT b.drop_off,b.booking_id, b.fare_paid, b.booking_expiration, b.status, r.fare, r.end_point as destination, r.start_point as origin, DATE_FORMAT(s.departure_time, '%r') AS departure_time, s.departure_date, b.dateAdded, GROUP_CONCAT(st.seat_number ORDER BY st.seat_number SEPARATOR ', ') AS seat_numbers FROM routes r JOIN schedules s ON r.route_id = s.route_id JOIN bookings b ON b.schedule_id = s.schedule_id JOIN seats st ON st.booking_id = b.booking_id WHERE (b.status = 'Cancelled' OR (b.status = 'Paid' AND s.departure_date < CURDATE())) AND b.user_id = ? GROUP BY b.booking_id ORDER BY b.dateModified DESC;",
		[res.locals.user.id]
	);

	res.render("Home/account", { active_bookings, user, history_bookings });
};

const getUserBookingDetails = async (req, res) => {
	const booking_id = req.params.id;

	const booking_details = (
		await query(
			"SELECT COUNT(*) AS 'count', b.status, b.drop_off,b.id_number, b.booking_id, b.user_id, GROUP_CONCAT(st.seat_number ORDER BY st.seat_number SEPARATOR ', ') AS seat_numbers, b.fare_paid, r.end_point, r.start_point, DATE_FORMAT(s.departure_time, '%r') AS departure_time, r.fare, s.departure_date FROM routes r JOIN schedules s ON r.route_id = s.route_id JOIN bookings b ON b.schedule_id = s.schedule_id JOIN seats st ON st.booking_id = b.booking_id WHERE b.booking_id = ? AND b.user_id = ? AND b.status IN ('Pending', 'Paid') GROUP BY b.booking_id;",
			[booking_id, res.locals.user.id]
		)
	)[0];

	if (booking_details) {
		res.render("Home/get_booking", { booking_details });
	} else {
		res.render("Home/notfound");
	}
};

const postUpdateProfile = async (req, res) => {
	const { fullname, email, contact, address, username, password } = req.body;

	// Assuming you pass the user's ID as part of the session or a hidden input field
	const userId = res.locals.user.id; // or however you store/access the logged-in user's ID
	let errors = [];
	// Check for existing data conflicts
	var username_exist =
		"SELECT COUNT(*) as `count` FROM users WHERE username = ? AND acc_id != ?";
	var email_exist =
		"SELECT COUNT(*) as `count` from users where email = ? AND acc_id != ?";
	var contact_exist =
		"SELECT COUNT(*) as `count` from users where contact = ? AND acc_id != ?";

	// Query to check existing data
	const username_count = (await query(username_exist, [username, userId]))[0]
		.count;
	const email_count = (await query(email_exist, [email, userId]))[0].count;
	const contact_count = (await query(contact_exist, [contact, userId]))[0]
		.count;

	if (email_count > 0) {
		errors.push({ msg: "Email is already registered to another account" });
	}
	if (contact_count > 0) {
		errors.push({
			msg: "Contact number is already registered to another account",
		});
	}
	if (username_count > 0) {
		errors.push({ msg: "Username is already taken by another account" });
	}

	// Prepare data for update
	let data = { fullname, email, contact, address, username };

	// Update password if provided
	if (password && password.trim() !== "") {
		const salt = bcrypt.genSaltSync(12);
		const hash = bcrypt.hashSync(password, salt);
		data.password = hash;
	}

	// SQL to update user data
	var sql = "UPDATE users SET ? WHERE acc_id = ?";
	db.query(sql, [data, userId], (err, result) => {
		if (err) {
			req.flash("error", errors);
			return res.redirect("/account");
		}
		req.flash("success_msg", "Profile updated successfully.");
		res.redirect("/account");
	});
};

const cancelBooking = async (req, res) => {
	const { id } = req.body;

	var updateSql =
		"UPDATE bookings SET status = 'Cancelled', dateModified = CURRENT_TIMESTAMP WHERE booking_id = ?";

	db.query(updateSql, [id], (err, rset) => {
		if (err) {
			console.log(err);
			// Return a JSON response indicating failure
			return res.status(500).json({
				success: false,
				message: "There was an error updating the booking.",
			});
		}
		// Return a JSON response indicating success
		res.status(200).json({
			success: true,
			message: "Reservation cancelled successfully.",
		});
	});
};

const getTicket = async (req, res) => {
	const booking_id = req.params.id;

	const details = (
		await query(
			"SELECT COUNT(*) AS 'count', b.status, b.booking_id, b.user_id, GROUP_CONCAT(st.seat_number ORDER BY st.seat_number SEPARATOR ', ') AS seat_numbers, b.fare_paid, r.end_point, r.start_point, s.departure_time, r.fare, s.departure_date FROM routes r JOIN schedules s ON r.route_id = s.route_id JOIN bookings b ON b.schedule_id = s.schedule_id JOIN seats st ON st.booking_id = b.booking_id WHERE b.booking_id = ? AND b.user_id = ? AND b.status IN ('Pending', 'Paid') GROUP BY b.booking_id;",
			[booking_id, res.locals.user.id]
		)
	)[0];

	const doc = new PDFDocument();

	let fileName = `Claveria_Bus_Ticket_${Date.now()}.pdf`;
	res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
	res.setHeader("Content-Type", "application/pdf");

	// Logo
	const logoPath = path.join(__dirname, "..", "public", "images", "logo.png");

	doc.image(logoPath, 180, 40, { width: 40 }).moveDown(0.5);

	// Title and Subtitle
	doc.fontSize(24)
		.text("Claveria Tour Inc.", 120, 50, { align: "center" })
		.fontSize(10)
		.text("Official Ticket", 110, 80, { align: "center" });

	// Horizontal Line to separate header
	doc.moveTo(50, 120).lineTo(550, 120).stroke();
	doc.fontSize(14).text(`OR Number: ${details.booking_id}`, 70, 130);
	// Ticket Details
	doc.fontSize(12)
		.text(
			`Departure Date: ${new Intl.DateTimeFormat("en-US", {
				month: "short",
				day: "2-digit",
				year: "numeric",
			}).format(
				new Date(details.departure_date)
			)} ${new Intl.DateTimeFormat("en-US", {
				weekday: "short",
			}).format(new Date(details.departure_date))}`,
			70,
			150
		)
		.text(`Departure Time: ${details.departure_time}`, 70, 170)
		.text(`Origin: ${details.start_point}`, 70, 190)
		.text(`Destination: ${details.end_point}`, 70, 210)
		.text(`Seat Number(s): ${details.seat_numbers}`, 70, 230)
		.text(`Total Amount: ${details.fare_paid}`, 70, 250)
		.text(`Status: ${details.status}`, 70, 270);

	doc.fontSize(9)
		.text("TERMS AND CONDITION", 70, 300)
		.text("• This Reservation Slip is non-refundable.", 90, 320)
		.text(
			"• Strictly no boarding/rebooking is allowed for lost reservation slip.",
			90,
			330
		)
		.text("• Request for rebooking shall only be allowed once.", 90, 340)
		.text(
			"• Re-scheduling/Rebooking may be allowed only if the next reservation is not fully booked.",
			90,
			350
		)
		.text(
			"• All passengers are expected to board 15minutes before the scheduled time of departure.",
			90,
			360
		)
		.text(
			"• Always keep your Reservation Slip and/or Ticket while on board.",
			90,
			370
		)
		.text(
			"• Present your Reservation Slip and/or Ticket upon inspection.",
			90,
			380
		);
	// Footer
	doc.fontSize(10)
		.fillColor("grey")
		.text("Thank you for choosing our service!", 50, 450, {
			align: "center",
			width: 500,
		});

	doc.pipe(res);
	doc.end();
};

const getError403 = (req, res) => {
	res.render("Home/unauthorized");
};
const getError404 = (req, res) => {
	res.render("Home/notfound");
};

const getLogout = (req, res) => {
	res.clearCookie("token");
	res.redirect("/");
};
export default {
	getIndex,
	getLogin,
	postLogin,
	getRegister,
	postRegister,
	getBooking,
	getBookingDetails,
	postBookingDetails,
	getAccount,
	getUserBookingDetails,
	postUpdateProfile,
	cancelBooking,
	getTicket,
	getLogout,
	getError403,
	getError404,
};

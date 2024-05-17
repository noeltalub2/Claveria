import query from "../database/query_db.js";
import db from "../database/connect_db.js";
import PDFDocument from "pdfkit";
import bcrypt from "bcrypt";
import createToken from "../utils/token.js";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const getLogin = (req, res) => {
	res.render("Admin/login", { username: req.flash("username")[0] });
};

const postLogin = async (req, res) => {
	try {
		const { username, password } = req.body;
		const findUser = "SELECT * from admin WHERE username = ?";

		db.query(findUser, [username], async (err, result) => {
			if (err) {
				console.log(err);
				req.flash("error_msg", "Authentication failed.");
				res.redirect("/admin/login");
			} else {
				if (result.length > 0) {
					const match_password = await bcrypt.compare(
						password,
						result[0].password
					);

					if (match_password) {
						const generateToken = createToken(
							result[0].admin_id,
							result[0].username,
							"admin"
						);
						res.cookie("token", generateToken, {
							httpOnly: true,
						});
						res.redirect("/admin/");
					} else {
						req.flash(
							"error_msg",
							"Incorrect username or password"
						);
						req.flash("username", username); // Flash the username
						res.redirect("/admin/login");
					}
				} else {
					req.flash("error_msg", "Could'nt find your account");
					res.redirect("/admin/login");
				}
			}
		});
	} catch {
		throw err;
	}
};

const getDashboard = async (req, res) => {
	const total_sales = (
		await query(
			"SELECT SUM(CAST(p.fare_paid AS DECIMAL(10,2))) AS total_paid FROM pickup_passenger p JOIN bookings b ON p.schedule_id = b.schedule_id WHERE b.status = 'Paid' AND b.booking_date = CURDATE();"
		)
	)[0].total_paid;

	const total_bookings = (
		await query(
			"SELECT COUNT(*) AS total_bookings FROM bookings WHERE booking_date = CURDATE();"
		)
	)[0].total_bookings;

	const total_schedule = (
		await query(
			"SELECT COUNT(*) AS 'count' FROM schedules WHERE departure_date = CURDATE() AND status = 'Active';"
		)
	)[0].count;

	const total_user = (
		await query("SELECT COUNT(*) AS 'count' FROM users;")
	)[0].count;

	const booking_schedule = await query(
		"SELECT u.fullname, u.contact, b.booking_id,b.booking_date, b.fare_paid, b.booking_expiration, b.status,s.departure_time, s.departure_date, b.dateAdded, GROUP_CONCAT(st.seat_number ORDER BY st.seat_number SEPARATOR ', ') AS seat_numbers FROM routes r JOIN schedules s ON r.route_id = s.route_id JOIN bookings b ON b.schedule_id = s.schedule_id JOIN seats st ON st.booking_id = b.booking_id JOIN users u ON u.acc_id = b.user_id GROUP BY b.booking_id ORDER BY b.booking_id DESC;"
	);

	const booking_type = await query(
		"SELECT booking_type, COUNT(*) AS count FROM bookings GROUP BY booking_type;"
	);

	res.render("Admin/dashboard", {
		title: "Dashboard",
		page: "dashboard",
		total_sales,
		total_bookings,
		total_schedule,
		total_user,
		booking_schedule,
		booking_type,
	});
};

const getBooking = async (req, res) => {
	const routes = await query("SELECT * FROM routes");
	res.render("Admin/booking", {
		title: "Booking",
		page: "booking",
		routes,
	});
};

const getBookingRoute = async (req, res) => {
	const id = req.params.id;
	const date = req.query.date || new Date().toISOString().split('T')[0];

	
	const routes_schedule = await query(
		"SELECT routes.start_point, routes.end_point, schedules.departure_time, schedules.schedule_id, schedules.arrival_time, schedules.departure_date FROM schedules JOIN routes ON schedules.route_id = routes.route_id WHERE schedules.status = 'Active' AND (routes.route_id = ? AND schedules.departure_date = ?) ORDER BY schedules.departure_date ASC;",
		[id, date]
	);

	res.render("Admin/booking_route", {
		title: "Booking Route",
		page: "booking",
		routes_schedule,
		route_id: id,
		cur_date: date
	});
};

const getBookingRouteSchedule = async (req, res) => {
	const id = req.params.id;
	const booking_schedule = await query(
		"SELECT u.fullname, u.contact, b.booking_id,b.booking_date, b.fare_paid, b.booking_expiration, b.status,s.departure_time, s.departure_date, b.dateAdded, GROUP_CONCAT(st.seat_number ORDER BY st.seat_number SEPARATOR ', ') AS seat_numbers FROM routes r JOIN schedules s ON r.route_id = s.route_id JOIN bookings b ON b.schedule_id = s.schedule_id JOIN seats st ON st.booking_id = b.booking_id JOIN users u ON u.acc_id = b.user_id WHERE s.schedule_id = ? GROUP BY b.booking_id ORDER BY b.booking_id DESC;",
		[id]
	);

	const schedule_details = (
		await query(
			"SELECT r.route_id, r.end_point as destination, r.start_point as origin, s.departure_time, s.departure_date FROM routes r JOIN schedules s ON r.route_id = s.route_id WHERE s.schedule_id = ?;",
			[id]
		)
	)[0];

	res.render("Admin/booking_schedule", {
		title: "Booking Schedules",
		page: "booking",
		booking_schedule,
		schedule_details,
		route_id: schedule_details.route_id,
	});
};
const getUserBookingDetails = async (req, res) => {
	const id = req.params.id;

	const booking_details = (
		await query(
			"SELECT COUNT(*) AS 'count', bs.bus_number, b.id_number, s.bus_id, b.drop_off, r.route_id, s.schedule_id, u.fullname, b.status, b.booking_id, b.user_id, b.discount_id, GROUP_CONCAT(st.seat_number ORDER BY st.seat_number SEPARATOR ', ') AS seat_numbers, b.fare_paid, r.end_point, r.start_point, s.departure_time, r.fare, s.departure_date FROM routes r JOIN schedules s ON r.route_id = s.route_id JOIN bookings b ON b.schedule_id = s.schedule_id JOIN seats st ON st.booking_id = b.booking_id JOIN users u ON u.acc_id = b.user_id INNER JOIN buses bs ON bs.bus_id = s.bus_id WHERE b.booking_id = ? GROUP BY b.booking_id;",
			[id]
		)
	)[0];
	const discounts = await query("SELECT * FROM discounts");
	const sub_routes = await query(
		"SELECT sr.* FROM sub_routes sr INNER JOIN routes r ON r.route_id = sr.route_id WHERE sr.destination = ?",
		[booking_details.start_point]
	);

	res.render("Admin/booking_view", {
		title: "View Booking",
		page: "booking",
		booking_details,
		sub_routes,
		discounts,

		route_id: booking_details.route_id,
		schedule_id: booking_details.schedule_id,
	});
};

const postUserEditBookingDetails = async (req, res) => {
	const { drop_off, fare, booking_id, discount, id_number } = req.body;

	try {
		const data = {
			drop_off,
			fare_paid: fare,
			id_number: id_number || null,
			discount_id: discount || null,
			dateModified: "CURRENT_TIMESTAMP()",
		};

		const sql = "UPDATE bookings SET ? WHERE booking_id = ?";
		db.query(sql, [data, booking_id], (err, result) => {
			if (err) {
				console.log(err);
				req.flash("error_msg", "There was an error");
				return res.redirect(
					`/admin/booking/route/schedule/view/${booking_id}`
				);
			}
			req.flash("success_msg", "Booking updated successfully.");
			res.redirect(`/admin/booking/route/schedule/view/${booking_id}`);
		});
	} catch (e) {
		console.log(e);
		req.flash("error_msg", "There was an error");
		return res.redirect(`/admin/booking/route/schedule/view/${booking_id}`);
	}
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
			message: "Booking cancelled successfully.",
		});
	});
};

const paidBooking = async (req, res) => {
	const { id } = req.body;

	var updateSql =
		"UPDATE bookings SET status = 'Paid', dateModified = CURRENT_TIMESTAMP WHERE booking_id = ?";

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
			message: "Booking paid successfully.",
		});
	});
};

const downloadBooking = async (req, res) => {};

const getRouteSchedule = async (req, res) => {
	const route_schedule = await query(
		"SELECT r.start_point, r.end_point, s.*, b.bus_number, b.bus_status, b.bus_id, s.schedule_id FROM schedules s INNER JOIN buses b ON s.bus_id = b.bus_id JOIN routes r ON r.route_id = s.route_id ORDER BY s.schedule_id DESC"
	);

	const buses = await query(
		"SELECT * FROM buses WHERE bus_status = 'Active'"
	);
	const routes = await query("SELECT * FROM routes");

	const conductors = await query("SELECT * FROM conductors");

	res.render("Admin/route_schedule", {
		title: "Route Schedule",
		page: "route_schedule",
		route_schedule,
		buses,
		routes,
		conductors,
	});
};

const postRouteScheduleAdd = async (req, res) => {
	const { departureDate, route, bus, departureTime, arrivalTime, conductor } =
		req.body;
	const insertSql = `
        INSERT INTO schedules (route_id, bus_id, conductor_id, departure_time, arrival_time, departure_date, status)
        VALUES (?, ?, ?, ?, ?, ?, 'Active')
    `;

	db.query(
		insertSql,
		[route, bus, conductor, departureTime, arrivalTime, departureDate],
		(error, results) => {
			if (error) {
				console.log(error);
				req.flash("error_msg", "There was an error");
				return res.redirect("/admin/route-schedule");
			}

			req.flash("success_msg", "Schedule added successfully.");
			res.redirect("/admin/route-schedule");
		}
	);
};

const postRouteScheduleEdit = async (req, res) => {
	const {
		schedule_id,
		departureDate,
		route,
		bus,
		departureTime,
		arrivalTime,
		conductor,
	} = req.body;
	const updateSql = `
        UPDATE schedules
        SET route_id = ?, bus_id = ?, conductor_id = ?, departure_time = ?, arrival_time = ?, departure_date = ?
        WHERE schedule_id = ?
    `;

	db.query(
		updateSql,
		[
			route,
			bus,
			conductor,
			departureTime,
			arrivalTime,
			departureDate,
			schedule_id,
		],
		(error, results) => {
			if (error) {
				console.log(error);
				req.flash(
					"error_msg",
					"There was an error updating the schedule"
				);
				return res.redirect("/admin/route-schedule");
			}

			req.flash("success_msg", "Schedule updated successfully.");
			res.redirect("/admin/route-schedule");
		}
	);
};

const deleteRouteSchedule = async (req, res) => {
	try {
		const schedule_id = req.body.id;

		await query("SET FOREIGN_KEY_CHECKS=0;");
		await query("DELETE FROM schedules WHERE schedule_id  = ?;", [
			schedule_id,
		]);
		await query("SET FOREIGN_KEY_CHECKS=1;");

		res.status(200).json({
			success: true,
			message: "Successfully deleted schedule",
		});
	} catch (e) {
		console.error(e);
		res.status(500).json({
			success: false,
			error: "Internal Server Error",
		});
	}
};

const getRouteScheduleWalkIn = async (req, res) => {
	const id = req.params.id;
	const route_details = (
		await query(
			"SELECT r.route_id, r.start_point, r.end_point, s.schedule_id, s.departure_date, s.departure_time FROM routes r INNER JOIN schedules s ON s.route_id = r.route_id WHERE s.schedule_id = ?",
			[id]
		)
	)[0];
	const available_seats = await query(
		"SELECT seat_number FROM seats s INNER JOIN bookings b ON b.booking_id = s.booking_id WHERE schedule_id = ? AND b.status IN ('Pending', 'Paid');",
		[id]
	);

	const sub_routes = await query(
		"SELECT sr.* FROM sub_routes sr INNER JOIN routes r ON r.route_id = sr.route_id WHERE sr.destination = ?",
		[route_details.start_point]
	);

	const bookings = await query(
		"SELECT b.*,u.fullname,u.contact, s.seat_number FROM bookings b INNER JOIN users u ON u.acc_id = b.user_id LEFT JOIN seats s ON s.booking_id = b.booking_id WHERE b.schedule_id = ? AND b.user_id = 1 ORDER BY b.booking_id DESC",
		[id]
	);

	const discounts = await query("SELECT * FROM discounts");

	res.render("Admin/route_schedule_walkin", {
		title: "Add Passenger",
		page: "route_schedule",
		route_details,
		sub_routes,
		discounts,
		available_seats: available_seats.map((seat) => seat.seat_number),
		schedule_id: route_details.schedule_id,
		bookings,
	});
};

const getTicket = async (req, res) => {
	const booking_id = req.params.id;
	const user_id = req.params.user;

	const details = (
		await query(
			"SELECT COUNT(*) AS 'count', b.status,bs.bus_number, b.booking_id, b.user_id, GROUP_CONCAT(st.seat_number ORDER BY st.seat_number SEPARATOR ', ') AS seat_numbers, b.fare_paid, r.end_point, r.start_point, s.departure_time, r.fare, s.departure_date FROM routes r JOIN schedules s ON r.route_id = s.route_id JOIN bookings b ON b.schedule_id = s.schedule_id JOIN seats st ON st.booking_id = b.booking_id INNER JOIN buses bs ON bs.bus_id = s.bus_id WHERE b.booking_id = ? AND b.user_id = ? AND b.status IN ('Pending', 'Paid') GROUP BY b.booking_id;",
			[booking_id, user_id]
		)
	)[0];

	const doc = new PDFDocument({
		size: [144, 792],
		margins: { top: 0, bottom: 0, left: 0, right: 0 }, // 2 inches wide by 11 inches tall (144 points = 2 inches)
	});

	let fileName = `Claveria_Bus_Ticket_${Date.now()}.pdf`;
	res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
	res.setHeader("Content-Type", "application/pdf");

	// Logo
	const logoPath = path.join(__dirname, "..", "public", "images", "logo.png");
	doc.image(logoPath, 12, 15, { width: 25 });

	// Title and Subtitle
	doc.fontSize(8) // Smaller font size for the narrow format
		.text("Claveria Tour Inc.", 20, 20, { align: "center" })
		.fontSize(6) // Even smaller for subtext
		.text("Official Ticket", 20, 30, { align: "center" });

	// Ticket Details moved closer to the logo
	doc.fontSize(6)
		.text(`OR Number: ${details.booking_id}`, 10, 50) // Start immediately after subtitle
		.text(
			`Departure Date: ${new Intl.DateTimeFormat("en-US", {
				month: "short",
				day: "2-digit",
				year: "numeric",
			}).format(new Date(details.departure_date))}`,
			10,
			60
		)
		.text(`Departure Time: ${details.departure_time}`, 10, 70)
		.text(`Origin: ${details.start_point}`, 10, 80)
		.text(`Destination: ${details.end_point}`, 10, 90)
		.text(`Bus Number: ${details.bus_number}`, 10, 100)
		.text(`Seat Number(s): ${details.seat_numbers}`, 10, 110)
		.text(`Total Amount: ${details.fare_paid}`, 10, 120)
		.text(`Status: ${details.status}`, 10, 130);

	// Footer
	doc.fontSize(6)
		.fillColor("grey")
		.text("Thank you for choosing our service!", 10, 140, {
			align: "center",
			width: 144,
		});

	doc.pipe(res);
	doc.end();
};

const postRouteScheduleWalkIn = async (req, res) => {
	try {
		const schedule_id = req.body.sch_inp;
		const fare_paid = req.body.fare_inp;
		const discount_id = req.body.dis_inp;
		const drop_off = req.body.drop_off;
		const seats = req.body.selectedSeatIds;
		const id_number = req.body.id_number;
		let booking = {
			user_id: 1,
			schedule_id,
			fare_paid: fare_paid * seats.length,
			status: "Paid",
			booking_type: "Walk In",
			drop_off: drop_off,
			id_number: id_number || null,
			discount_id: discount_id || null,
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
		res.status(200).json({
			success: true,
			message: "Successfully booked bus",
		});
	} catch (e) {
		console.error(e);
		res.status(500).json({
			success: false,
			error: "Internal Server Error",
		});
	}
};

const getRoutes = async (req, res) => {
	const routes = await query("SELECT * FROM routes");
	res.render("Admin/routes", {
		title: "Routes",
		page: "routes",
		routes,
	});
};

const postRoutesAdd = async (req, res) => {
	const { origin, destination } = req.body;
	const insertSql = `
        INSERT INTO routes (start_point, end_point)
        VALUES (?, ?)
    `;

	db.query(insertSql, [origin, destination], (error, results) => {
		if (error) {
			console.log(error);
			req.flash("error_msg", "There was an error");
			return res.redirect("/admin/routes");
		}

		req.flash("success_msg", "Routes added successfully.");
		res.redirect("/admin/routes");
	});
};
const postRoutesEdit = async (req, res) => {
	const { route_id, origin, destination } = req.body;

	const data = {
		start_point: origin,
		end_point: destination,
	};

	const sql = "UPDATE routes SET ? WHERE route_id = ?";

	db.query(sql, [data, route_id], (error, results) => {
		if (error) {
			console.log(error);
			req.flash("error_msg", "There was an error");
			return res.redirect("/admin/routes");
		}

		req.flash("success_msg", "Schedule edited successfully.");
		res.redirect("/admin/routes");
	});
};

const deleteRoute = async (req, res) => {
	try {
		const route_id = req.body.id;
		console.log(route_id);
		await query("SET FOREIGN_KEY_CHECKS=0;");
		await query("DELETE FROM `routes` WHERE `routes`.`route_id` = ?;", [
			route_id,
		]);
		await query("SET FOREIGN_KEY_CHECKS=1;");

		res.status(200).json({
			success: true,
			message: "Successfully deleted route",
		});
	} catch (e) {
		console.error(e);
		res.status(500).json({
			success: false,
			error: "Internal Server Error",
		});
	}
};

const getRouteSub = async (req, res) => {
	const id = req.params.id;

	const sub_routes = await query(
		"SELECT * FROM sub_routes WHERE route_id = ?",
		[id]
	);
	const routes = (
		await query(
			"SELECT start_point,end_point FROM routes WHERE route_id = ?",
			[id]
		)
	)[0];
	res.render("Admin/routes_sub_route", {
		title: "Routes",
		page: "routes",
		sub_routes,
		route_id: id,
		routes,
	});
};

const postRoutesSubAdd = async (req, res) => {
	const { fare, route_id, origin, destination } = req.body;
	const insertSql = `
        INSERT INTO sub_routes (route_id,origin,destination, fare)
        VALUES (?, ?,?,?)
    `;

	db.query(
		insertSql,
		[route_id, origin, destination, fare],
		(error, results) => {
			if (error) {
				console.log(error);
				req.flash("error_msg", "There was an error");
				return res.redirect(`/admin/routes/subroutes/${route_id}`);
			}

			req.flash("success_msg", "Sub routes added successfully.");
			res.redirect(`/admin/routes/subroutes/${route_id}`);
		}
	);
};

const postRoutesSubEdit = async (req, res) => {
	const { sr_id, origin, destination, fare, route_id } = req.body;

	const data = {
		origin,
		destination,
		fare,
	};

	const sql = "UPDATE sub_routes SET ? WHERE sr_id = ?";

	db.query(sql, [data, sr_id], (error, results) => {
		if (error) {
			console.log(error);
			req.flash("error_msg", "There was an error");
			return res.redirect(`/admin/routes/subroutes/${route_id}`);
		}

		req.flash("success_msg", "Sub routes edited successfully.");
		res.redirect(`/admin/routes/subroutes/${route_id}`);
	});
};

const deleteRouteSub = async (req, res) => {
	try {
		const sr_id = req.body.id;

		await query("DELETE FROM sub_routes WHERE sr_id  = ?;", [sr_id]);

		res.status(200).json({
			success: true,
			message: "Successfully deleted sub route",
		});
	} catch (e) {
		console.error(e);
		res.status(500).json({
			success: false,
			error: "Internal Server Error",
		});
	}
};

const getTransaction = async (req, res) => {
	const route_schedule = await query(
		"SELECT b.bus_number, CONCAT(r.start_point, ' - ', r.end_point) AS route, s.departure_date, u.fullname AS passenger_name, bk.booking_type, COUNT(se.seat_id) AS ticket_qty, bk.fare_paid AS total, bk.dateAdded FROM bookings bk JOIN schedules s ON bk.schedule_id = s.schedule_id JOIN buses b ON s.bus_id = b.bus_id JOIN routes r ON s.route_id = r.route_id JOIN users u ON bk.user_id = u.acc_id JOIN seats se ON bk.booking_id = se.booking_id WHERE bk.status = 'Paid' GROUP BY bk.booking_id UNION ALL SELECT b.bus_number, CONCAT(r.start_point, ' - ', r.end_point) AS route, s.departure_date, pp.fullname AS passenger_name, 'Pickup' AS booking_type, 1 AS ticket_qty, pp.fare_paid AS total, pp.dateAdded FROM pickup_passenger pp JOIN schedules s ON pp.schedule_id = s.schedule_id JOIN buses b ON s.bus_id = b.bus_id JOIN routes r ON s.route_id = r.route_id JOIN conductors c ON pp.conductor_id = c.cnd_id WHERE pp.status = 'Paid' ORDER BY dateAdded DESC;"
	);

	res.render("Admin/transaction", {
		title: "Transaction History",
		page: "transaction",
		route_schedule,
	});
};

const getTransactionSearch = async (req, res) => {
	const { from_date, to_date } = req.query;
	const transactions = await query(
		"SELECT b.bus_number, s.departure_date, CONCAT(r.start_point, ' to ', r.end_point, ' ', TIME_FORMAT(s.departure_time, '%h:%i %p')) AS 'schedule', (COUNT(DISTINCT bk.booking_id) + COUNT(DISTINCT pp.psg_id)) AS 'total_passenger', (SUM(bk.fare_paid) + SUM(pp.fare_paid)) AS 'total_sales' FROM schedules s JOIN routes r ON s.route_id = r.route_id JOIN buses b ON s.bus_id = b.bus_id LEFT JOIN bookings bk ON s.schedule_id = bk.schedule_id AND bk.status = 'Paid' LEFT JOIN pickup_passenger pp ON s.schedule_id = pp.schedule_id AND pp.status = 'Paid' WHERE s.departure_date BETWEEN ? AND ? GROUP BY s.schedule_id HAVING (SUM(bk.fare_paid) + SUM(pp.fare_paid)) > 0 ORDER BY s.departure_date DESC, s.departure_time DESC;",
		[from_date, to_date]
	);

	res.render("Admin/transaction_search", {
		title: "Transaction Search",
		page: "transaction",
		transactions,
		from_date,
		to_date,
	});
};

const getBus = async (req, res) => {
	const buses = await query("SELECT * FROM buses");
	res.render("Admin/bus", {
		title: "Bus",
		page: "bus",
		buses,
	});
};

const postBusAdd = async (req, res) => {
	const { bus_number, capacity, bus_status } = req.body;
	const insertSql = `
        INSERT INTO buses (bus_number,capacity,bus_status)
        VALUES (?, ?,?)
    `;

	db.query(
		insertSql,
		[bus_number, capacity, bus_status],
		(error, results) => {
			if (error) {
				console.log(error);
				req.flash("error_msg", "There was an error");
				return res.redirect(`/admin/bus/`);
			}

			req.flash("success_msg", "Bus added successfully.");
			res.redirect(`/admin/bus`);
		}
	);
};

const postBusEdit = async (req, res) => {
	const { bus_id, bus_number, capacity, bus_status } = req.body;

	const data = {
		bus_number,
		capacity,

		bus_status,
	};

	const sql = "UPDATE buses SET ? WHERE bus_id = ?";

	db.query(sql, [data, bus_id], (error, results) => {
		if (error) {
			console.log(error);
			req.flash("error_msg", "There was an error");
			return res.redirect(`/admin/bus`);
		}

		req.flash("success_msg", "Bus edited successfully.");
		res.redirect(`/admin/bus`);
	});
};

const deleteBus = async (req, res) => {
	try {
		const bus_id = req.body.id;

		await query("SET FOREIGN_KEY_CHECKS=0;");
		await query("DELETE FROM `buses` WHERE `buses`.`bus_id` = ?;", [
			bus_id,
		]);
		await query("SET FOREIGN_KEY_CHECKS=1;");

		res.status(200).json({
			success: true,
			message: "Successfully deleted bus",
		});
	} catch (e) {
		console.error(e);
		res.status(500).json({
			success: false,
			error: "Internal Server Error",
		});
	}
};

const getInspector = async (req, res) => {
	const inspectors = await query("SELECT * FROM inspectors");
	res.render("Admin/inspector", {
		title: "Inspector",
		page: "inspector",
		inspectors,
	});
};
const postInspectorAdd = async (req, res) => {
	const { fullname, email, contact, address, username, password } = req.body;
	let errors = [];
	//Sql statement if there is duplciate in database
	var username_exist =
		"SELECT COUNT(*) as `count` FROM inspectors WHERE username = ?";
	var email_exist =
		"Select count(*) as `count` from inspectors where email = ?";
	var contact_exist =
		"Select count(*) as `count` from inspectors where contact = ?";
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
	var sql = "INSERT INTO inspectors SET ?";
	db.query(sql, data, (err, rset) => {
		if (err) {
			req.flash("error", errors);
			return res.redirect("/admin/inspector");
		} else {
			req.flash("success_msg", "Account created successfully.");
			res.redirect("/admin/inspector");
		}
	});
};
const postInspectorEdit = async (req, res) => {
	const {
		inspector_id,
		fullname,
		email,
		contact,
		address,
		username,
		password,
	} = req.body;

	// Assuming you pass the user's ID as part of the session or a hidden input field
	const userId = inspector_id; // or however you store/access the logged-in user's ID
	let errors = [];
	// Check for existing data conflicts
	var username_exist =
		"SELECT COUNT(*) as `count` FROM inspectors WHERE username = ? AND ins_id != ?";
	var email_exist =
		"SELECT COUNT(*) as `count` from inspectors where email = ? AND ins_id != ?";
	var contact_exist =
		"SELECT COUNT(*) as `count` from inspectors where contact = ? AND ins_id != ?";

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
	var sql = "UPDATE inspectors SET ? WHERE ins_id = ?";
	db.query(sql, [data, userId], (err, result) => {
		if (err) {
			req.flash("error", errors);
			return res.redirect("/admin/inspector");
		}
		req.flash("success_msg", "Inspector profile updated successfully.");
		res.redirect("/admin/inspector");
	});
};

const deleteInspector = async (req, res) => {
	try {
		const bus_id = req.body.id;

		await query("SET FOREIGN_KEY_CHECKS=0;");
		await query("DELETE FROM inspectors WHERE  ins_id = ?;", [bus_id]);
		await query("SET FOREIGN_KEY_CHECKS=1;");

		res.status(200).json({
			success: true,
			message: "Successfully deleted inspector",
		});
	} catch (e) {
		console.error(e);
		res.status(500).json({
			success: false,
			error: "Internal Server Error",
		});
	}
};

const getInspectorReport = async (req, res) => {
	const id = req.params.id;

	const inspector_report = await query(
		"SELECT ir.*, s.route_id, b.bus_number FROM inspector_report ir LEFT JOIN schedules s ON s.schedule_id = ir.schedule_id LEFT JOIN buses b ON b.bus_id = s.bus_id WHERE ir.inspector_id = ?	",
		[id]
	);

	res.render("Admin/inspector_view", {
		title: "Inspector Report",
		page: "inspector",
		inspector_report,
	});
};

const getConductor = async (req, res) => {
	const conductors = await query("SELECT * FROM conductors");
	res.render("Admin/conductor", {
		title: "Conductor",
		page: "conductor",
		conductors,
	});
};

const postConductorAdd = async (req, res) => {
	const { fullname, email, contact, address, username, password } = req.body;
	let errors = [];
	//Sql statement if there is duplciate in database
	var username_exist =
		"SELECT COUNT(*) as `count` FROM conductors WHERE username = ?";
	var email_exist =
		"Select count(*) as `count` from conductors where email = ?";
	var contact_exist =
		"Select count(*) as `count` from conductors where contact = ?";
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
	var sql = "INSERT INTO conductors SET ?";
	db.query(sql, data, (err, rset) => {
		if (err) {
			req.flash("error", errors);
			return res.redirect("/admin/conductor");
		} else {
			req.flash("success_msg", "Account created successfully.");
			res.redirect("/admin/conductor");
		}
	});
};
const postConductorEdit = async (req, res) => {
	const {
		conductor_id,
		fullname,
		email,
		contact,
		address,
		username,
		password,
	} = req.body;

	// Assuming you pass the user's ID as part of the session or a hidden input field
	const userId = conductor_id; // or however you store/access the logged-in user's ID
	let errors = [];
	// Check for existing data conflicts
	var username_exist =
		"SELECT COUNT(*) as `count` FROM conductors WHERE username = ? AND cnd_id != ?";
	var email_exist =
		"SELECT COUNT(*) as `count` from conductors where email = ? AND cnd_id != ?";
	var contact_exist =
		"SELECT COUNT(*) as `count` from conductors where contact = ? AND cnd_id != ?";

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
	var sql = "UPDATE conductors SET ? WHERE cnd_id = ?";
	db.query(sql, [data, userId], (err, result) => {
		if (err) {
			req.flash("error", errors);
			return res.redirect("/admin/conductor");
		}
		req.flash("success_msg", "Conductor profile updated successfully.");
		res.redirect("/admin/conductor");
	});
};

const deleteConductor = async (req, res) => {
	try {
		const cnd_id = req.body.id;

		await query("SET FOREIGN_KEY_CHECKS=0;");
		await query("DELETE FROM conductors WHERE cnd_id = ?;", [cnd_id]);
		await query("SET FOREIGN_KEY_CHECKS=1;");

		res.status(200).json({
			success: true,
			message: "Successfully deleted conductor",
		});
	} catch (e) {
		console.error(e);
		res.status(500).json({
			success: false,
			error: "Internal Server Error",
		});
	}
};

const getConductorReport = async (req, res) => {
	const id = req.params.id;

	const conductor_report = await query(
		"SELECT r.start_point,r.end_point, s.departure_date,s.departure_time,s.arrival_time, s.route_id, b.bus_number, COUNT(pp.psg_id) as 'addedPassenger', SUM(pp.fare_paid) as fare_paid FROM pickup_passenger pp LEFT JOIN schedules s ON s.schedule_id = pp.schedule_id LEFT JOIN buses b ON b.bus_id = s.bus_id LEFT JOIN routes r ON r.route_id = s.route_id WHERE pp.conductor_id = ? GROUP BY pp.schedule_id;",
		[id]
	);

	res.render("Admin/conductor_view", {
		title: "Conductor Report",
		page: "conductor",
		conductor_report,
	});
};

const getAnnouncement = async (req, res) => {
	const announcement = await query(
		"SELECT * FROM announcement ORDER BY announcement_id DESC"
	);

	res.render("Admin/announcement", {
		title: "Announcement",
		page: "announcement",
		announcement,
	});
};

const postAnnouncement = (req, res) => {
	const announceImages = req.files.announceImages[0].filename;

	const { title, message } = req.body;

	const data = {
		image: announceImages,
		title,
		message,
	};

	db.query("INSERT INTO announcement SET ?", data, (err, result) => {
		if (err) {
			console.log(err);
			req.flash("error", "Error inserting announcement");
			res.redirect("/admin/announcement");
		} else {
			req.flash("success_msg", "Successfully added announcement");
			res.redirect("/admin/announcement");
		}
	});
};

const deleteAnnouncement = (req, res) => {
	const announcementId = req.body.id;

	db.query(
		"DELETE FROM announcement WHERE announcement_id = ?",
		announcementId,
		(err, result) => {
			if (err) {
				console.log(err);
				return res.status(500).json({
					status: "error",
					message: "Error deleting announcement",
				});
			}

			if (result.affectedRows === 0) {
				return res.status(404).json({
					status: "error",
					message: "Announcement not found",
				});
			}

			return res.status(200).json({
				status: "success",
				message: "Announcement deleted successfully",
			});
		}
	);
};

const getLogout = (req, res) => {
	res.clearCookie("token");
	res.redirect("/");
};

export default {
	getLogin,
	postLogin,
	getDashboard,

	getBooking,
	getBookingRoute,
	getBookingRouteSchedule,
	getUserBookingDetails,
	postUserEditBookingDetails,
	cancelBooking,
	paidBooking,
	downloadBooking,

	getRouteSchedule,
	postRouteScheduleAdd,
	postRouteScheduleEdit,
	deleteRouteSchedule,
	getRouteScheduleWalkIn,
	postRouteScheduleWalkIn,

	getRoutes,
	postRoutesAdd,
	postRoutesEdit,
	deleteRoute,
	getRouteSub,
	postRoutesSubAdd,
	postRoutesSubEdit,
	deleteRouteSub,

	getTransaction,
	getTransactionSearch,

	getBus,
	postBusAdd,
	postBusEdit,
	deleteBus,

	getInspector,
	postInspectorAdd,
	postInspectorEdit,
	deleteInspector,
	getInspectorReport,

	getConductor,
	postConductorAdd,
	postConductorEdit,
	deleteConductor,
	getConductorReport,

	getAnnouncement,
	postAnnouncement,
	deleteAnnouncement,

	getTicket,
	getLogout,
};

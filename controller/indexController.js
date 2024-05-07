import query from "../database/query_db.js";
import db from "../database/connect_db.js";
import bcrypt from "bcrypt";
import { nanoid } from "nanoid";
import createToken from "../utils/token.js";

const getIndex = (req, res) => {
	res.render("Home/index");
};
const getBooking = async (req, res) => {
	const route = req.query.destination;
	const departure = req.query.departure;
	const passengerCount = req.query.passengerCount;

	const route_details = (
		await query("SELECT * FROM routes WHERE route_id = ?", [route])
	)[0];

	const available_schedule = await query(
		"SELECT sch.schedule_id, sch.route_id, sch.bus_id, sch.departure_time, sch.arrival_time, sch.departure_date, rt.fare, rt.start_point, rt.end_point, (b.capacity - IFNULL(bc.booked_count, 0)) AS available_seats FROM schedules sch JOIN routes rt ON sch.route_id = rt.route_id JOIN buses b ON sch.bus_id = b.bus_id LEFT JOIN (SELECT schedule_id, COUNT(*) AS booked_count FROM bookings WHERE booking_date = ? GROUP BY schedule_id) bc ON sch.schedule_id = bc.schedule_id WHERE sch.route_id = ? AND sch.departure_date = ? AND sch.status = 'Active';",
		[departure, route, departure]
	);
	res.render("Home/booking", {
		available_schedule,
		route_details,
		departure,
		route,
		passengerCount,
	});
};
const getBookingDetails = async (req, res) => {
	try {
		const available_seats = await query(
			"SELECT seat_number FROM bookings WHERE schedule_id = ? AND status IN ('Pending', 'Paid');",
			[req.body.sch_id]
		);

		const scheduleDetails = await query(
			"SELECT r.fare, r.end_point as destination, s.departure_time, s.departure_date FROM routes r JOIN schedules s ON r.route_id = s.route_id WHERE s.schedule_id = ?;",
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

		seats.forEach(async (seat) => {
			let booking = {
				user_id: 1,
				schedule_id,
				seat_number: seat,
				fare_paid,
				status: "Pending",
				booking_date: new Date().toISOString().slice(0, 10),
				booking_expiration: new Date(
					new Date().setDate(new Date().getDate() + 1)
				)
					.toISOString()
					.slice(0, 10),
			};
			console.log(booking);
			let sql = "INSERT INTO bookings SET ?";
			let query = db.query(sql, booking, (err, result) => {
				if (err) throw err;
			});
		});

		res.status(200).json({ message: "Successfully booked bus" });
	} catch (e) {
		console.error(e);
		res.status(500).json({ error: "Internal Server Error" });
	}
};

const getError403 = (req, res) => {
	res.render("Home/unauthorized");
};
const getError404 = (req, res) => {
	res.render("Home/notfound");
};
export default {
	getIndex,
	getBooking,
	getBookingDetails,
	postBookingDetails,

	getError403,
	getError404,
};

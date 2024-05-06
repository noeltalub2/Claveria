import query from "../database/query_db.js";
import db from "../database/connect_db.js";
import bcrypt from "bcrypt";
import { nanoid } from "nanoid";
import createToken from "../utils/token.js";

const getSignIn = (req, res) => {
	res.render("User/signin", { username: req.flash("username")[0] });
};
const postSignIn = (req, res) => {
	try {
		const { username, password } = req.body;
		const findUser = "SELECT * from users WHERE username = ?";

		db.query(findUser, [username], async (err, result) => {
			if (err) {
				req.flash("error_msg", "Authentication failed.");
				res.redirect("/signin");
			} else {
				if (result.length > 0) {
					if (result[0].isVerified) {
						const match_password = await bcrypt.compare(
							password,
							result[0].password
						);
						if (match_password) {
							const generateToken = createToken(
								result[0].uuid,
								result[0].username,
								"user"
							);
							res.cookie("token", generateToken, {
								httpOnly: true,
							});
							res.redirect("/home");
						} else {
							req.flash(
								"error_msg",
								"Incorrect username or password"
							);
							req.flash("username", username); // Flash the username
							res.redirect("/signin");
						}
					} else {
						req.flash(
							"error_msg",
							"Please wait while your account is being verified."
						);
						req.flash("username", username); // Flash the username
						res.redirect("/signin");
					}
					
				} else {
					req.flash("error_msg", "Could'nt find your account");
					res.redirect("/signin");
				}
			}
		});
	} catch {
		throw err;
	}
};
const getSignUp = (req, res) => {
	res.render("User/signup");
};
const postSignUp = async (req, res) => {
	const {
		firstName,
		lastName,
		middleName,
		address,
		phonenumber,
		username,
		password,
	} = req.body;

	let errors = [];
	//Sql statement if there is duplciate in database
	var username_exist =
		"SELECT COUNT(*) as `count` FROM users WHERE username = ?";
	var phone_exist =
		"Select count(*) as `count` from users where phonenumber = ?";
	//Query statement
	const username_count = (await query(username_exist, [username]))[0].count;
	const phone_count = (await query(phone_exist, [phonenumber]))[0].count;

	if (phone_count > 0) {
		errors.push({ msg: "Phonenumber is already registered" });
	}
	if (username_count > 0) {
		errors.push({ msg: "Username is already registered" });
	}
	//To encrypt the password using hash
	const salt = bcrypt.genSaltSync(12);
	const hash = bcrypt.hashSync(password, salt);
	//Data to insert in sql
	var data = {
		firstName,
		lastName,
		middleName,
		address,
		phonenumber,
		username,
		password: hash,
		profileUrl: "default.jpg",
		uuid: nanoid(),
	};
	//Add account to database
	var sql = "INSERT INTO users SET ?";
	db.query(sql, data, (err, rset) => {
		if (err) {
			res.render("User/signup", {
				errors,
			});
		} else {
			req.flash("success_msg", "Account created successfully. Please wait for verification");
			res.redirect("/signup");
		}
	});
};
const getHome = async (req, res) => {
	const user = (
		await query(
			"SELECT firstName, lastName, middleName, phoneNumber, username, joinDate FROM users WHERE uuid = ?",
			[res.locals.user.id]
		)
	)[0];

	const rfid_tag = (
		await query("SELECT cardnumber,isActive FROM rfidcards WHERE userUuid = ?", [
			res.locals.user.id,
		])
	)[0];

	const gates = await query("SELECT * FROM gate ");

	res.render("User/home", { user, gates, rfid_tag });
};
const getGatepass = async (req, res) => {
	res.render("User/gatepass");
};
const getGatepassApi = async (req, res) => {
	try {
		const gatepass = await query(
			"SELECT gatepass.*, gateEntry.gateName AS entryGateName, gateExit.gateName AS exitGateName FROM gatepass LEFT JOIN gate AS gateEntry ON gatepass.entryGate = gateEntry.id LEFT JOIN gate AS gateExit ON gatepass.exitGate = gateExit.id WHERE gatepass.userUuid = ? ORDER BY `gatepass`.`id` DESC;",
			[res.locals.user.id]
		);

		const resultData = gatepass.map((gp, index) => ({
			id: index + 1,
			entryTime: gp.entryTime,
			entryGate: gp.entryGateName,
			exitTime: gp.exitTime,
			exitGate: gp.exitGateName,
			logDate: new Date(gp.logDate).toLocaleDateString("en-US", {
				month: "long",
				day: "numeric",
				year: "numeric",
			}),
		}));

		res.json({ data: resultData });
	} catch (e) {
		res.status(500).json({ error: "Internal server error" });
	}
};
const getProfileDetails = async (req, res) => {
	const profile = (
		await query("SELECT * FROM users WHERE uuid = ?", [res.locals.user.id])
	)[0];

	res.render("User/profile", { profile });
};
const postProfileDetails = async (req, res) => {
	const profile =
		req.files && req.files.profile ? req.files.profile[0].filename : null; // Optional driver's license
	// Data from the form ../update
	const id = res.locals.user.id;
	const { firstName, lastName, middleName, address, phonenumber, username } =
		req.body;

	let errors = [];
	// Check if the username or phone number has been taken by another user
	var username_exist =
		"SELECT COUNT(*) as `count` FROM users WHERE username = ? AND uuid != ?";
	var phone_exist =
		"SELECT COUNT(*) as `count` FROM users WHERE phonenumber = ? AND uuid != ?";
	// Query statement
	const username_count = (await query(username_exist, [username, id]))[0]
		.count;
	const phone_count = (await query(phone_exist, [phonenumber, id]))[0].count;

	if (phone_count > 0) {
		errors.push({
			msg: "Phonenumber is already registered to another user",
		});
	}
	if (username_count > 0) {
		errors.push({ msg: "Username is already taken by another user" });
	}

	if (errors.length > 0) {
		res.render("User/profile", {
			errors,
			profile: req.body,
		});
	} else {
		// Data to update in sql
		var data = {
			firstName,
			lastName,
			middleName,
			address,
			phonenumber,
			username,
		};

		if (profile) {
			data.profileUrl = profile;
		}

		// Update account in database
		var sql =
			"UPDATE users SET ? , dateModified = CURRENT_TIMESTAMP WHERE uuid = ?";
		db.query(sql, [data, id], (err, rset) => {
			if (err) {
				res.render("User/profile", {
					errors: [{ msg: "Failed to update user details." }],
					profile: req.body,
				});
			} else {
				req.flash("success_msg", "Account updated successfully");
				res.redirect("/profile/account"); // Redirect to the profile page or any other page
			}
		});
	}
};
const getProfileVehicle = async (req, res) => {
	const vehicle = (
		await query("SELECT * FROM vehicle_details WHERE usersId = ?", [
			res.locals.user.id,
		])
	)[0];

	res.render("User/vehicledetails", { vehicle });
};
const postProfileVehicle = async (req, res) => {
	const certificateOfRegistration =
		req.files && req.files.certificateOfRegistration
			? req.files.certificateOfRegistration[0].filename
			: null;

	const driverlicense =
		req.files && req.files.driverlicense
			? req.files.driverlicense[0].filename
			: null;
	const { plateNumber, officialReceiptNo, vehicleDescription } = req.body;
	const userId = res.locals.user.id;

	var data = {
		plateNumber,
		officialReceiptNo,
		vehicleDescription,
		usersId: userId,
	};

	if (driverlicense) {
		data.driverlicense = driverlicense;
	}

	if (certificateOfRegistration) {
		data.certificateOfRegistration = certificateOfRegistration;
	}

	// Check if a record with the given usersId already exists
	var checkSql =
		"SELECT COUNT(*) AS count FROM vehicle_details WHERE usersId = ?";
	db.query(checkSql, [userId], (err, rset) => {
		if (err) {
			console.log(err);
			return res.status(500).send("Database error");
		}

		// If a record exists, perform an UPDATE
		if (rset[0].count > 0) {
			var updateSql =
				"UPDATE vehicle_details SET ?, dateModified = CURRENT_TIMESTAMP WHERE usersId = ?";

			db.query(updateSql, [data, userId], (err, rset) => {
				if (err) {
					console.log(err);
					req.flash("error_msg", "There was an error");
					res.redirect("/profile/vehicle");
				}
				req.flash("success_msg", "Update successfully");
				res.redirect("/profile/vehicle");
			});
		} else {
			// If no record exists, perform an INSERT INTO
			var insertSql = "INSERT INTO vehicle_details SET ?";
			db.query(insertSql, data, (err, rset) => {
				if (err) {
					console.log(err);
					req.flash("error_msg", "There was an error");
					res.redirect("/profile/vehicle");
				}
				req.flash("success_msg", "Vehicle details added successfully");
				res.redirect("/profile/vehicle");
			});
		}
	});
};
const getProfileChangePass = async (req, res) => {
	const profile = (
		await query("SELECT * FROM users WHERE uuid = ?", [res.locals.user.id])
	)[0];

	res.render("User/changepassword", { profile });
};
const postProfileChangePass = async (req, res) => {
	const { oldPassword, newPassword } = req.body;
	const userId = res.locals.user.id;

	try {
		const user = (
			await query("SELECT * FROM users WHERE uuid = ?", [userId])
		)[0];

		const match = await bcrypt.compare(oldPassword, user.password);
		if (!match) {
			req.flash("error_msg", "Old password is incorrect");
			return res.redirect("/profile/password"); // Add return here
		}

		const saltRounds = 10;
		const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

		await query("UPDATE users SET password = ? WHERE uuid = ?", [
			hashedPassword,
			userId,
		]);

		req.flash("success_msg", "Successfully changed password");
		return res.redirect("/profile/password"); // Add return here
	} catch (error) {
		console.error(error);
		req.flash("error_msg", "There was an error");
		return res.redirect("/profile/password"); // Add return here
	}
};
const getLogout = (req, res) => {
	res.clearCookie("token");
	res.redirect("/signin");
};
export default {
	getSignIn,
	postSignIn,
	getSignUp,
	postSignUp,
	getHome,
	getGatepass,
	getGatepassApi,
	getProfileDetails,
	postProfileDetails,
	getProfileVehicle,
	postProfileVehicle,
	getProfileChangePass,
	postProfileChangePass,
	getLogout,
};

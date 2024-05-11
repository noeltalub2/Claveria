import jwt from "jsonwebtoken";
import db from "../database/connect_db.js";

const queryId = async (id, role) => {
	try {
		if (role === "user") {
			const [rows] = await db
				.promise()
				.query(
					"SELECT acc_id, username FROM users WHERE username = ?",
					[id]
				);
			return rows;
		}

		if (role === "conductor") {
			const [rows] = await db
				.promise()
				.query(
					"SELECT cnd_id, username,fullname FROM conductors WHERE username = ?",
					[id]
				);
			return rows;
		}

		if (role === "inspector") {
			const [rows] = await db
				.promise()
				.query(
					"SELECT ins_id, username,fullname FROM inspectors WHERE username = ?",
					[id]
				);
			return rows;
		}
	} catch (err) {
		throw err;
	}
};

const requireAuth = async (req, res, next) => {
	const token = req.cookies.token;

	if (token) {
		jwt.verify(
			token,
			process.env.JWT_SECRET_KEY,
			async (err, decodedToken) => {
				if (err) {
					next();
				} else {
					const user = await queryId(
						decodedToken.username,
						decodedToken.role
					);
					if (
						user.length === 0 ||
						!["user", "conductor", "inspector", "admin"].includes(
							decodedToken.role
						)
					) {
						res.redirect("/unauthorized");
					} else {
						res.locals.user = {
							name: user[0].fullname,
							id: decodedToken.id,
							username: decodedToken.username,
							role: decodedToken.role,
						};

						next();
					}
				}
			}
		);
	} else {
		res.locals.user = {
			role: "guess",
		};
		next();
	}
};

const forwardAuth = async (req, res, next) => {
	const token = req.cookies.token;

	if (token) {
		jwt.verify(
			token,
			process.env.JWT_SECRET_KEY,
			async (err, decodedToken) => {
				if (err) {
					next();
				} else {
					const user = await queryId(
						decodedToken.username,
						decodedToken.role
					);

					if (
						user.length === 0 ||
						!["user", "admin", "conductor", "inspector"].includes(
							decodedToken.role
						)
					) {
						next();
					} else {
						res.locals.user = {
							name: user[0].fullname,
							id: decodedToken.id,
							username: decodedToken.username,
							role: decodedToken.role,
						};
						switch (decodedToken.role) {
							case "admin":
								res.redirect("/admin/dashboard");
								break;
							case "user":
								res.redirect("/");
								break;
							case "conductor":
								res.redirect("/conductor");
								break;
							case "inspector":
								res.redirect("/inspector");
								break;
							default:
								next();
						}
					}
				}
			}
		);
	} else {
		res.locals.user = {
			role: "guess",
		};
		next();
	}
};

const checkRole = (roles) => (req, res, next) => {
	const userRole = res.locals.user.role;

	if (roles.includes(userRole)) {
		next();
	} else {
		res.redirect("/unauthorized");
	}
};

export default {
	requireAuth,
	forwardAuth,
	checkRole,
};

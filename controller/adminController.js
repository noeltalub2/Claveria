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
	res.render("Admin/dashboard");
};

const getLogout = (req, res) => {
	res.clearCookie("token");
	res.redirect("/");
};
export default {
	getLogin,
	postLogin,
	getDashboard,

	getLogout,
};

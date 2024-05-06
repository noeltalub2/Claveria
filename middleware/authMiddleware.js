// import jwt from "jsonwebtoken";
// import db from "../database/connect_db.js";

// const queryId = async (id, role) => {
//   try {
//     if (role === "admin") {
//       const [rows] = await db
//         .promise()
//         .query("SELECT id, username FROM admin WHERE id = ?", [id]);
//       return rows;
//     } else if (role === "user") {
//       const [rows] = await db
//         .promise()
//         .query(
//           "SELECT id, profileUrl, firstName,lastName, middleName FROM users WHERE uuid = ?",
//           [id]
//         );
//       return rows;
//     } else {
//       const [rows] = await db
//         .promise()
//         .query(
//           "SELECT id,gateId,name,username FROM `gate-access` WHERE id = ?",
//           [id]
//         );
//       return rows;
//     }
//   } catch (err) {
//     throw err;
//   }
// };

// const requireAuth = async (req, res, next) => {
//   const token = req.cookies.token;

//   if (token) {
//     jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, decodedToken) => {
//       if (err) {
//         res.redirect("/unauthorized");
//       } else {
//         const user = await queryId(decodedToken.id, decodedToken.role);
//         if (
//           user.length === 0 ||
//           !["user", "admin", "gate"].includes(decodedToken.role)
//         ) {
//           res.redirect("/unauthorized");
//         } else {
//           res.locals.user = {
//             id: decodedToken.id,
//             username: decodedToken.username,
//             role: decodedToken.role,
//           };

//           if (decodedToken.role === "user") {
//             res.locals.user_info = {
//               profile_url: user[0].profileUrl,
//               fullname: `${user[0].firstName} ${user[0].middleName.charAt(
//                 0
//               )}. ${user[0].lastName}`,
//             };
//           }
//           if (decodedToken.role === "gate") {
//             res.locals.user = {
//               id: decodedToken.id,
//               gateId: user[0].gateId,
//               username: decodedToken.username,
//               role: decodedToken.role,
//             };
//           }
//           next();
//         }
//       }
//     });
//   } else {
//     res.redirect("/unauthorized");
//   }
// };

// const forwardAuth = async (req, res, next) => {
//   const token = req.cookies.token;

//   if (token) {
//     jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, decodedToken) => {
//       if (err) {
//         next();
//       } else {
//         const user = await queryId(decodedToken.id, decodedToken.role);
//         if (
//           user.length === 0 ||
//           !["user", "admin", "gate"].includes(decodedToken.role)
//         ) {
//           next();
//         } else {
//           res.locals.user = {
//             id: decodedToken.id,
//             username: decodedToken.username,
//             role: decodedToken.role,
//           };

//           if (decodedToken.role === "user") {
//             res.locals.user_info = {
//               profile_url: user[0].profileUrl,
//               fullname: `${user[0].firstName} ${user[0].middleName.charAt(
//                 0
//               )}. ${user[0].lastName}`,
//             };
//           }

//           if (decodedToken.role === "gate") {
//             res.locals.user = {
//               id: decodedToken.id,
//               gateId: user[0].gateId,
//               username: decodedToken.username,
//               role: decodedToken.role,
//             };
//           }
//           switch (decodedToken.role) {
//             case "admin":
//               res.redirect("/admin/dashboard");
//               break;
//             case "user":
//               res.redirect("/home");
//               break;
//             case "gate":
//               res.redirect("/rfid/");
//               break;
//             default:
//               next();
//           }
//         }
//       }
//     });
//   } else {
//     next();
//   }
// };

// const checkRole = (roles) => (req, res, next) => {
//   const userRole = res.locals.user.role;
//   if (roles.includes(userRole)) {
//     next();
//   } else {
//     res.redirect("/unauthorized");
//   }
// };

// export default {
//   forwardAuth,
//   requireAuth,
//   checkRole,
// };

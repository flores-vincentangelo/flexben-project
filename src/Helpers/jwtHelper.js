let DbUsers = require("../DataAccess/Database/DbUser");
let { JWT_OPTIONS } = require("../env/constants");
const jwt = require("jsonwebtoken");

let jwtHelper = {
	generateToken,
	verifyToken,
	getAudienceFromToken,
};

module.exports = jwtHelper;

function getEmployeeIdFromToken(token) {
	return jwt.decode(token)["sub"];
}

function getAudienceFromToken(token) {
	return jwt.decode(token)["aud"];
}

async function generateToken(prevToken, employeeId) {
	const id = employeeId || getEmployeeIdFromToken(prevToken);
	const account = await DbUsers.getAccountByEmployeeId(id);
	const options = {
		algorithm: process.env.ALGORITHM,
		expiresIn: process.env.EXPIRY,
		issuer: process.env.ISSUER,
		subject: employeeId || account[0].employeeId,
		audience: ["CHANGE ME LATER"],
		// user[0].role === "staff"
		// 	? JWT_OPTIONS.STAFF_AUDIENCE
		// 	: JWT_OPTIONS.CUSTOMER_AUDIENCE,
	};
	return jwt.sign({}, process.env.SECRET, options);
}

function verifyToken(req, res, next) {
	const token = req.cookies.token;
	if (!token) {
		res.status(401).json({
			status: 401,
			statusText: "Unauthorized",
			message: "Not authorized to access data",
		});
	} else {
		jwt.verify(token, process.env.SECRET, function (err) {
			if (err) {
				res.clearCookie("token");
				res.status(401).json({
					status: 401,
					statusText: "Unauthorized",
					message: "Please login again",
				});
			} else next();
		});
	}
}

let DbUsers = require("../DataAccess/Database/DbAccounts");
let { JWT_OPTIONS } = require("../env/constants");
const jwt = require("jsonwebtoken");
const responses = require("../Helpers/responsesHelper");

let jwtHelper = {
	generateToken,
	verifyToken,
	getAudienceFromToken,
};

module.exports = jwtHelper;

function getEmployeeEmailFromToken(token) {
	return jwt.decode(token)["sub"];
}

function getAudienceFromToken(token) {
	return jwt.decode(token)["aud"];
}

async function generateToken(prevToken, userEmail) {
	const email = userEmail || getEmployeeEmailFromToken(prevToken);
	const account = await DbUsers.getAccountByEmployeeEmail(email);
	const options = {
		algorithm: process.env.ALGORITHM,
		expiresIn: process.env.EXPIRY,
		issuer: process.env.ISSUER,
		subject: userEmail || account.Email,
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
			...responses.unathorizedResponseBuilder(
				"Not authorized to access data"
			),
		});
	} else {
		jwt.verify(token, process.env.SECRET, function (err) {
			if (err) {
				res.clearCookie("token");
				res.status(401).json({
					...responses.unathorizedResponseBuilder(
						"Please login again"
					),
				});
			} else next();
		});
	}
}

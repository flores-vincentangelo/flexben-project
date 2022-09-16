const DbEmployees = require("../DataAccess/Database/DbEmployees");
let { JWT_OPTIONS } = require("../env/constants");
const jwt = require("jsonwebtoken");
const responses = require("../Helpers/responsesHelper");

let jwtHelper = {
	generateToken,
	verifyToken,
	getAudienceFromToken,
	getEmployeeEmailFromToken,
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
	const employee = await DbEmployees.getEmployeeDetailsByEmail(email);

	let audience;
	switch (employee.Role) {
		case "employee":
			audience = JWT_OPTIONS.EMPLOYEE_AUDIENCE;
			break;
		case "hr":
			audience = JWT_OPTIONS.HR_AUDIENCE;
			break;
		case "payroll":
			audience = JWT_OPTIONS.PAYROLL_AUDIENCE;
			break;

		default:
			audience = [];
			break;
	}
	const options = {
		algorithm: process.env.ALGORITHM,
		expiresIn: process.env.EXPIRY,
		issuer: process.env.ISSUER,
		subject: userEmail || employee.Email,
		audience: audience,
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

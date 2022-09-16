const responses = require("../Helpers/responsesHelper");
const DbEmployees = require("../DataAccess/Database/DbEmployees");
const jwtHelper = require("../Helpers/jwtHelper");

let EmployeeRoutes = { getDetails };
module.exports = EmployeeRoutes;

async function getDetails(req, res, next) {
	let email = jwtHelper.getEmployeeEmailFromToken(req.cookies.token);
	let employee = await DbEmployees.getEmployeeDetailsByEmail(email);
	res.status(200).json({
		...responses.OkResponseBuilder("OK"),
		data: {
			firstName: employee.FirstName,
			lastName: employee.LastName,
			role: employee.Role,
		},
	});
}

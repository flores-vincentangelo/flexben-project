const responses = require("../Helpers/responsesHelper");
const DbEmployees = require("../DataAccess/Database/DbEmployees");
const jwtHelper = require("../Helpers/jwtHelper");
const { AUDIENCE_OPTIONS } = require("../env/constants");

let EmployeeRoutes = { getDetails };
module.exports = EmployeeRoutes;

async function getDetails(req, res, next) {
	try {
		if (
			jwtHelper
				.getAudienceFromToken(req.cookies.token)
				.includes(AUDIENCE_OPTIONS.EMPLOYEE_DETAILS)
		) {
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
		} else {
			res.status(403).json(responses.forbiddenResponse);
		}
	} catch (error) {
		next(error);
	}
}

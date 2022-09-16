let responses = require("../Helpers/responsesHelper");

let EmployeeRoutes = { getDetails };
module.exports = EmployeeRoutes;

async function getDetails(req, res, next) {
	res.status(200).json({
		...responses.OkResponseBuilder("OK"),
	});
}

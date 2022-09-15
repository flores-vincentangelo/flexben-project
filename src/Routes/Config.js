const responses = require("../Helpers/responses");
let Config = { tables };

module.exports = Config;

async function tables(req, res, next) {
	try {
		res.status(200).json({
			...responses.OkResponseBuilder("Tables Configured"),
		});
	} catch (error) {
		next(error);
	}
}

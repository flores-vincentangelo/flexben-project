const responses = require("../Helpers/responsesHelper");
let Config = { tables };
let DbConfigTables = require("../DataAccess/Database/DbConfigTables");

module.exports = Config;

async function tables(req, res, next) {
	try {
		await DbConfigTables.setupTables();
		res.status(200).json({
			...responses.OkResponseBuilder("Tables Configured"),
			// data: data,
		});
	} catch (error) {
		next(error);
	}
}

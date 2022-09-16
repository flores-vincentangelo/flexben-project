const bcrypt = require("bcrypt");
const responses = require("../Helpers/responsesHelper");

let User = { register };
module.exports = User;

const saltRounds = process.env.BCRYPTSALTROUNDS;

async function register(req, res, next) {
	res.status(201).json({
		...responses.createdBuilder("User Added"),
	});
}

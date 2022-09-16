const bcrypt = require("bcrypt");
const responses = require("../Helpers/responsesHelper");
const UserModel = require("../Models/UserModel");
const DbUser = require("../DataAccess/Database/DbUser");

let User = { register };
module.exports = User;

let saltRounds = 10;

async function register(req, res, next) {
	let user = new UserModel();
	user.EmployeeId = req.body.employeeId;
	user.UnhashedPassword = req.body.password;

	try {
		user.HashedPassword = await hashPassword(user.UnhashedPassword);
		await DbUser.register(user);
		res.status(201).json({
			...responses.createdBuilder("User Added"),
		});
	} catch (error) {
		next(error);
	}
}

function hashPassword(plaintextpass) {
	return new Promise((resolve, reject) => {
		bcrypt.hash(plaintextpass, saltRounds, function (err, hash) {
			if (err) reject(err);
			resolve(hash);
		});
	});
}

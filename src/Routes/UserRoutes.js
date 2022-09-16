const bcrypt = require("bcrypt");
const responses = require("../Helpers/responsesHelper");
const UserModel = require("../Models/UserModel");
const DbUser = require("../DataAccess/Database/DbUser");

let UserRoutes = { register, login };
module.exports = UserRoutes;

let saltRounds = 10;

async function register(req, res, next) {
	let user = new UserModel();
	user.EmployeeId = req.body.employeeId;
	user.UnhashedPassword = req.body.password;

	try {
		let data = await DbUser.getAccountByEmployeeId(user.EmployeeId);
		if (data.length != 0) {
			res.status(409).json({
				...responses.conflictResponseBuilder("User already exists"),
			});
			return;
		}
		user.HashedPassword = await bcrypt.hash(
			user.UnhashedPassword,
			saltRounds
		);
		await DbUser.register(user);
		res.status(201).json({
			...responses.createdBuilder("User Added"),
		});
	} catch (error) {
		next(error);
	}
}

async function login(req, res, next) {
	let invalidCredsMessage = "Invalid username or password";
	let base64Encoding = req.headers.authorization.split(" ")[1];
	let credentials = Buffer.from(base64Encoding, "base64")
		.toString()
		.split(":");
	let user = new UserModel();
	user.EmployeeId = credentials[0];
	user.UnhashedPassword = credentials[1];

	if (!user.EmployeeId || !user.UnhashedPassword) {
		res.status(401).json({
			...responses.unathorizedResponseBuilder(invalidCredsMessage),
		});
		return;
	}

	let data;
	try {
		data = await DbUser.getAccountByEmployeeId(user.EmployeeId);
	} catch (error) {
		next(error);
	}

	if (data.length != 1) {
		res.status(401).json({
			...responses.unathorizedResponseBuilder(invalidCredsMessage),
		});
	} else {
		let hashedPassword = data[0].password;
		let isMatch = await bcrypt.compare(
			user.UnhashedPassword,
			hashedPassword
		);
		if (!isMatch) {
			res.status(401).json({
				...responses.unathorizedResponseBuilder(invalidCredsMessage),
			});
		} else {
			res.status(201).json({
				...responses.createdBuilder("OK"),
				data: user,
			});
		}
	}
}

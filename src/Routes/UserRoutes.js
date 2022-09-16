const bcrypt = require("bcrypt");
const responses = require("../Helpers/responsesHelper");
const AccountModel = require("../Models/AccountModel");
const DbUser = require("../DataAccess/Database/DbUser");

let UserRoutes = { register, login };
module.exports = UserRoutes;

let saltRounds = 10;

async function register(req, res, next) {
	let user = new AccountModel();
	user.EmployeeId = req.body.employeeId;
	user.UnhashedPassword = req.body.password;

	try {
		let account = await DbUser.getAccountByEmployeeId(user.EmployeeId);
		if (account) {
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
	let user = new AccountModel();
	user.EmployeeId = credentials[0];
	user.UnhashedPassword = credentials[1];

	if (!user.EmployeeId || !user.UnhashedPassword) {
		res.status(401).json({
			...responses.unathorizedResponseBuilder(invalidCredsMessage),
		});
		return;
	}

	let account;
	try {
		account = await DbUser.getAccountByEmployeeId(user.EmployeeId);
	} catch (error) {
		next(error);
	}

	if (!account) {
		res.status(401).json({
			...responses.unathorizedResponseBuilder(invalidCredsMessage),
		});
	} else {
		let isMatch = await bcrypt.compare(
			user.UnhashedPassword,
			account.HashedPassword
		);
		if (!isMatch) {
			res.status(401).json({
				...responses.unathorizedResponseBuilder(invalidCredsMessage),
			});
		} else {
			res.status(201).json({
				...responses.createdBuilder("OK"),
				data: account,
			});
		}
	}
}

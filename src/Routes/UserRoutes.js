const bcrypt = require("bcrypt");
const responses = require("../Helpers/responsesHelper");
const CredentialsModel = require("../Models/CredentialsModel");
const DbAccounts = require("../DataAccess/Database/DbAccounts");
const jwtHelper = require("../Helpers/jwtHelper");

let UserRoutes = { login, logout };
module.exports = UserRoutes;

let saltRounds = 10;

// async function register(req, res, next) {
// 	let user = new CredentialsModel();
// 	user.EmployeeId = req.body.employeeId;
// 	user.UnhashedPassword = req.body.password;

// 	try {
// 		// let account = await DbAccounts.getAccountByEmployeeEmail(user.Email);
// 		// if (account) {
// 		// 	res.status(409).json({
// 		// 		...responses.conflictResponseBuilder("User already exists"),
// 		// 	});
// 		// 	return;
// 		// }
// 		user.HashedPassword = await bcrypt.hash(
// 			user.UnhashedPassword,
// 			saltRounds
// 		);
// 		await DbAccounts.register(user);
// 		res.status(201).json({
// 			...responses.createdBuilder("User Added"),
// 		});
// 	} catch (error) {
// 		next(error);
// 	}
// }

async function login(req, res, next) {
	let invalidCredsMessage = "Invalid username or password";
	let base64Encoding = req.headers.authorization.split(" ")[1];
	let credentials = Buffer.from(base64Encoding, "base64")
		.toString()
		.split(":");
	let user = new CredentialsModel();
	user.Email = credentials[0];
	user.UnhashedPassword = credentials[1];

	if (!user.Email || !user.UnhashedPassword) {
		res.status(401).json({
			...responses.unathorizedResponseBuilder(invalidCredsMessage),
		});
		return;
	}

	let account;
	try {
		account = await DbAccounts.getAccountByEmployeeEmail(user.Email);
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
			let token = await jwtHelper.generateToken(null, account.Email);
			res.cookie("token", token, { httpOnly: true });
			res.status(200).json({
				...responses.OkResponseBuilder("OK"),
			});
		}
	}
}

async function logout(req, res, next) {
	res.clearCookie("token");
	res.status(200).json({
		...responses.OkResponseBuilder("Cookies cleared"),
	});
}

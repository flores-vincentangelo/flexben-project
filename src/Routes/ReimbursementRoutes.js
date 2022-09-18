const responses = require("../Helpers/responsesHelper");
const ReimbursementItemModel = require("../Models/ReimbursementItemModel");
const DataValidationHelper = require("../Helpers/DataValidationHelper");
const jwtHelper = require("../Helpers/jwtHelper");
const { AUDIENCE_OPTIONS } = require("../env/constants");

const DbFlexCycleCutoff = require("../DataAccess/Database/DbFlexCycleCutoff");
const DbEmployees = require("../DataAccess/Database/DbEmployees");
const DbReimbursementTransaction = require("../DataAccess/Database/DbReimbursementTransaction");
const DbReimbursementItem = require("../DataAccess/Database/DbReimbursementItem");

let ReimbursementRoutes = {
	file,
	test,
	createTransaction,
	getLatestDraftReimbItems,
	deleteDraftReimbItem,
};
module.exports = ReimbursementRoutes;

async function file(req, res, next) {
	if (
		jwtHelper
			.getAudienceFromToken(req.cookies.token)
			.includes(AUDIENCE_OPTIONS.FILE_REIMBURSEMENT_ITEM)
	) {
		let reimbursementItem = new ReimbursementItemModel();
		reimbursementItem.Date = req.body.date;
		reimbursementItem.OrNumber = req.body.orNumber;
		reimbursementItem.NameEstablishment = req.body.nameEstablishment;
		reimbursementItem.TinEstablishment = req.body.tinEstablishment;
		reimbursementItem.Amount = req.body.amount;
		reimbursementItem.CategoryCode = req.body.category;

		let email = jwtHelper.getEmployeeEmailFromToken(req.cookies.token);

		try {
			let reimbTrans =
				await DbReimbursementTransaction.getLatestDraftByEmail(email);

			if (!reimbTrans) {
				await addReimbursementTransaction(email);
				reimbTrans =
					await DbReimbursementTransaction.getLatestDraftByEmail(
						email
					);
			}
			reimbursementItem.ReimTransId = reimbTrans.FlexReimbursementId;
			let validationResults = await validateReimbItem(
				reimbursementItem,
				reimbTrans
			);

			if (validationResults.errors.length != 0) {
				res.status(400).json({
					...responses.badRequestResponseBuilder(
						validationResults.message
					),
					data: validationResults.errors,
				});
			} else {
				reimbursementItem = { ...validationResults.reimbursementItem };

				await DbReimbursementItem.file(reimbursementItem);
				let totalAmount = await calculateTransactionAmount(
					reimbTrans.FlexReimbursementId
				);
				let token = await jwtHelper.generateToken(
					req.cookies.token,
					null
				);
				res.cookie("token", token, { httpOnly: true });
				res.status(200).json({
					...responses.createdBuilder("Reimbursement Filed"),
					data: {
						...reimbursementItem,
						TransactionTotal: totalAmount,
					},
				});
			}
		} catch (error) {
			next(error);
		}
	} else {
		res.status(403).json(responses.forbiddenResponse);
	}
}

async function getLatestDraftReimbItems(req, res, next) {
	if (
		jwtHelper
			.getAudienceFromToken(req.cookies.token)
			.includes(AUDIENCE_OPTIONS.GET_ALL_REIMBURSEMENT_ITEMS)
	) {
		let email = jwtHelper.getEmployeeEmailFromToken(req.cookies.token);

		try {
			let reimbTrans =
				await DbReimbursementTransaction.getLatestDraftByEmail(email);

			if (!reimbTrans) {
				res.status(400).json({
					...responses.badRequestResponseBuilder(
						"No draft transaction"
					),
				});
			}

			let reimbItemsArr =
				await DbReimbursementItem.getItemsByReimbTransId(
					reimbTrans.FlexReimbursementId
				);

			let token = await jwtHelper.generateToken(req.cookies.token, null);
			res.cookie("token", token, { httpOnly: true });
			res.status(200).json({
				...responses.createdBuilder("OK"),
				data: {
					length: reimbItemsArr.length,
					reimbursementItems: reimbItemsArr,
				},
			});
		} catch (error) {
			next(error);
		}
	} else {
		res.status(403).json(responses.forbiddenResponse);
	}
}

async function deleteDraftReimbItem(req, res, next) {
	if (
		jwtHelper
			.getAudienceFromToken(req.cookies.token)
			.includes(AUDIENCE_OPTIONS.GET_ALL_REIMBURSEMENT_ITEMS)
	) {
		let email = jwtHelper.getEmployeeEmailFromToken(req.cookies.token);
		// if draft : OK then delete

		try {
			let reimbTrans =
				await DbReimbursementTransaction.getLatestDraftByEmail(email);

			if (!reimbTrans) {
				res.status(400).json({
					...responses.badRequestResponseBuilder(
						"No draft transaction"
					),
				});
			}

			// get reimb trans items by reimb trans Id
			let reimbItemsArr =
				await DbReimbursementItem.getItemsByReimbTransId(
					reimbTrans.FlexReimbursementId
				);

			let token = await jwtHelper.generateToken(req.cookies.token, null);
			res.cookie("token", token, { httpOnly: true });
			res.status(200).json({
				...responses.createdBuilder("OK"),
				data: {
					length: reimbItemsArr.length,
					reimbursementItems: reimbItemsArr,
				},
			});
		} catch (error) {
			next(error);
		}
	} else {
		res.status(403).json(responses.forbiddenResponse);
	}
}

async function test(req, res, next) {
	try {
		res.redirect("/api/create-reimbursement-transaction");
	} catch (error) {
		next(error);
	}
}

async function createTransaction(req, res, next) {
	if (
		jwtHelper
			.getAudienceFromToken(req.cookies.token)
			.includes(AUDIENCE_OPTIONS.ADD_REIMB_TRANSACTION)
	) {
		try {
			let email = jwtHelper.getEmployeeEmailFromToken(req.cookies.token);
			let hasTransaction =
				await DbReimbursementTransaction.getLatestDraftByEmail(email);
			if (hasTransaction) {
				res.status(400).json({
					...responses.badRequestResponseBuilder(
						"Already have an exisiting transaction"
					),
				});
			} else {
				await addReimbursementTransaction(email);
				let token = await jwtHelper.generateToken(
					req.cookies.token,
					null
				);
				res.cookie("token", token, { httpOnly: true });
				res.status(201).json({
					...responses.createdBuilder(
						"Reimbursement Transaction Added"
					),
				});
			}
		} catch (error) {
			next(error);
		}
	} else {
		res.status(403).json(responses.forbiddenResponse);
	}
}

async function addReimbursementTransaction(email) {
	let employee = await DbEmployees.getEmployeeDetailsByEmail(email);
	let latestFlexCycleCutoff = await DbFlexCycleCutoff.getLatestFlexCycle();
	await DbReimbursementTransaction.addReimbursementTransaction(
		employee.EmployeeId,
		latestFlexCycleCutoff.FlexCutoffId
	);
}

async function validateReimbItem(reimbursementItem, reimbTrans) {
	let flexCycle = await DbFlexCycleCutoff.getByFlexCycleId(
		reimbTrans.FlexCutoffId
	);
	let newTotal =
		reimbTrans.TotalReimbursementAmount + reimbursementItem.Amount;

	let validationResults =
		await DataValidationHelper.validateReimbursementItem(reimbursementItem);

	if (newTotal > flexCycle.CutoffCapAmount) {
		validationResults.message +=
			"Adding this reimbursement item will exceed the maximum reimbursement amount for your flex cycle. ";
		validationResults.errors.push("amount");
	}

	return validationResults;
}

async function calculateTransactionAmount(reimbTransId) {
	let reimbItemsArr = await DbReimbursementItem.getItemsByReimbTransId(
		reimbTransId
	);

	let totalAmount = 0;

	reimbItemsArr.forEach(element => {
		totalAmount += element.Amount;
	});

	DbReimbursementTransaction.updateAmountOnTransactionId(
		reimbTransId,
		totalAmount
	);

	return totalAmount;
}

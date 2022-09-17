const responses = require("../Helpers/responsesHelper");
const ReimbursementItemModel = require("../Models/ReimbursementItemModel");
const DataValidationHelper = require("../Helpers/DataValidationHelper");
const jwtHelper = require("../Helpers/jwtHelper");
const { AUDIENCE_OPTIONS } = require("../env/constants");

const DbFlexCycleCutoff = require("../DataAccess/Database/DbFlexCycleCutoff");
const DbEmployees = require("../DataAccess/Database/DbEmployees");
const DbReimbursementTransaction = require("../DataAccess/Database/DbReimbursementTransaction");
const DbReimbursementItem = require("../DataAccess/Database/DbReimbursementItem");

let ReimbursementRoutes = { file, test, createTransaction };
module.exports = ReimbursementRoutes;

// "Employee should be able to add a reimbursement item to an active cut-off with the following details:
// - Date (mm/dd/yyyy) - add validation rules (you should not be able to add a different year and there should be no date greater than the current date)
// - OR Number
// - Name of establishment
// - TIN of establishment
// - Amount (minimum 500, this amount should be configurable)
// - Category (from category catalog)

// Reimbursement item should be added to the reimbursement list
// Total reimburseable amount should be returned

// The system should be able to detect if the reimbursement amount is greater than the maximum reimburseable amount for the given cut-off.

// *Initial status of the reimbursement and reimbursement items/details should be ""Draft"""

async function file(req, res, next) {
	if (
		jwtHelper
			.getAudienceFromToken(req.cookies.token)
			.includes(AUDIENCE_OPTIONS.FILE_REIMBURSEMENT)
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
				//recalculate max amount
				let token = await jwtHelper.generateToken(
					req.cookies.token,
					null
				);
				res.cookie("token", token, { httpOnly: true });
				res.status(200).json({
					...responses.createdBuilder("Reimbursement Filed"),
					data: reimbursementItem,
				});
			}
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

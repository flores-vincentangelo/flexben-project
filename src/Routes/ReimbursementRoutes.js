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

		try {
			let validationResults =
				await DataValidationHelper.validateReimbursementItem(
					reimbursementItem
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

				let email = jwtHelper.getEmployeeEmailFromToken(
					req.cookies.token
				);
				let hasTransaction =
					await DbReimbursementTransaction.getLatestDraftReimbursementTransactionByEmail(
						email
					);
				if (hasTransaction) {
					reimbursementItem.ReimTransId =
						hasTransaction.FlexReimbursementId;
					await DbReimbursementItem.file(reimbursementItem);
				} else {
					await addReimbursementTransaction(email);
					let transaction =
						await DbReimbursementTransaction.getLatestDraftReimbursementTransactionByEmail(
							email
						);
					reimbursementItem.ReimTransId =
						transaction.FlexReimbursementId;
					await DbReimbursementItem.file(reimbursementItem);
				}
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
				await DbReimbursementTransaction.getLatestDraftReimbursementTransactionByEmail(
					email
				);
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

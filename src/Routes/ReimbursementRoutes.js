const responses = require("../Helpers/responsesHelper");
const { AUDIENCE_OPTIONS } = require("../env/constants");
const jwtHelper = require("../Helpers/jwtHelper");
const DataValidationHelper = require("../Helpers/DataValidationHelper");

const ReimbursementItemModel = require("../Models/ReimbursementItemModel");
const DbFlexCycleCutoff = require("../DataAccess/Database/DbFlexCycleCutoff");
const DbEmployees = require("../DataAccess/Database/DbEmployees");
const DbReimbursementTransaction = require("../DataAccess/Database/DbReimbursementTransaction");
const DbReimbursementItem = require("../DataAccess/Database/DbReimbursementItem");
const DbCompany = require("../DataAccess/Database/DbCompany");

let ReimbursementRoutes = {
	file,

	getLatestDraftReimbItems,
	deleteDraftReimbItem,
	submitTransaction,
	printTransaction,
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
			let validationResults =
				await DataValidationHelper.validateReimbursementItem(
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
						TransactionTotal: totalAmount,
						...reimbursementItem,
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
			} else {
				let reimbItemsArr =
					await DbReimbursementItem.getItemsByReimbTransId(
						reimbTrans.FlexReimbursementId
					);

				let token = await jwtHelper.generateToken(
					req.cookies.token,
					null
				);
				res.cookie("token", token, { httpOnly: true });
				res.status(200).json({
					...responses.OkResponseBuilder("OK"),
					data: {
						transactionId: reimbTrans.FlexReimbursementId,
						totalAmount: reimbTrans.TotalReimbursementAmount,
						length: reimbItemsArr.length,
						reimbursementItems: reimbItemsArr,
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

async function deleteDraftReimbItem(req, res, next) {
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
			} else {
				let result =
					await DbReimbursementItem.deleteItemByItemIdAndTransactionId(
						req.body.itemId,
						reimbTrans.FlexReimbursementId
					);

				if (result.affectedRows === 0) {
					res.status(404).json({
						...responses.notFoundBuilder("Item not found"),
					});
				} else {
					await calculateTransactionAmount(
						reimbTrans.FlexReimbursementId
					);
					let token = await jwtHelper.generateToken(
						req.cookies.token,
						null
					);
					res.cookie("token", token, { httpOnly: true });
					res.status(200).json({
						...responses.createdBuilder("OK. Item deleted"),
					});
				}
			}
		} catch (error) {
			next(error);
		}
	} else {
		res.status(403).json(responses.forbiddenResponse);
	}
}

async function submitTransaction(req, res, next) {
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
			} else {
				await calculateTransactionAmount(
					reimbTrans.FlexReimbursementId
				);
				let validationResults =
					await DataValidationHelper.validateTransaction(reimbTrans);

				if (validationResults.errors.length != 0) {
					res.status(400).json({
						...responses.badRequestResponseBuilder(
							validationResults.message
						),
						data: validationResults.errors,
					});
				} else {
					//create transaction number
					let transactionNumber = await generateTransactionNumber(
						email,
						reimbTrans
					);
					reimbTrans.TransactionNumber = transactionNumber;
					//update transaction with transaction number and update to submitted
					DbReimbursementTransaction.updateTransactionNumberAndStatusOnTransactionId(
						reimbTrans
					);
					DbReimbursementItem.updateStatusToSubmittedOnTransactionId(
						reimbTrans.FlexReimbursementId
					);
					let token = await jwtHelper.generateToken(
						req.cookies.token,
						null
					);
					res.cookie("token", token, { httpOnly: true });
					res.status(200).json({
						...responses.createdBuilder("Transaction submitted"),
						data: reimbTrans,
					});
				}
			}
		} catch (error) {
			next(error);
		}
	} else {
		res.status(403).json(responses.forbiddenResponse);
	}
}

async function printTransaction(req, res, next) {
	if (
		jwtHelper
			.getAudienceFromToken(req.cookies.token)
			.includes(AUDIENCE_OPTIONS.PRINT_TRANSACTION)
	) {
		let email = jwtHelper.getEmployeeEmailFromToken(req.cookies.token);
		let reimbTransNumber = req.body.transactionNumber;

		try {
			let reimbTrans =
				await DbReimbursementTransaction.getByTransactionNumber(
					reimbTransNumber
				);

			if (!reimbTrans) {
				res.status(400).json({
					...responses.badRequestResponseBuilder(
						"Transaction not found"
					),
				});
			} else {
				await calculateTransactionAmount(
					reimbTrans.FlexReimbursementId
				);
				let validationResults =
					await DataValidationHelper.validateTransaction(reimbTrans);

				if (validationResults.errors.length != 0) {
					res.status(400).json({
						...responses.badRequestResponseBuilder(
							validationResults.message
						),
						data: validationResults.errors,
					});
				} else {
					//create transaction number
					let transactionNumber = await generateTransactionNumber(
						email,
						reimbTrans
					);
					reimbTrans.TransactionNumber = transactionNumber;
					//update transaction with transaction number and update to submitted
					DbReimbursementTransaction.updateTransactionNumberAndStatusOnTransactionId(
						reimbTrans
					);
					DbReimbursementItem.updateStatusToSubmittedOnTransactionId(
						reimbTrans.FlexReimbursementId
					);
					let token = await jwtHelper.generateToken(
						req.cookies.token,
						null
					);
					res.cookie("token", token, { httpOnly: true });
					res.status(200).json({
						...responses.createdBuilder("Transaction submitted"),
						data: reimbTrans,
					});
				}
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
	await DbReimbursementTransaction.add(
		employee.EmployeeId,
		latestFlexCycleCutoff.FlexCutoffId
	);
}

async function calculateTransactionAmount(reimbTransId) {
	let reimbItemsArr = await DbReimbursementItem.getItemsByReimbTransId(
		reimbTransId
	);

	let totalAmount = 0;

	reimbItemsArr.forEach(element => {
		totalAmount += element.Amount;
	});

	await DbReimbursementTransaction.updateAmountOnTransactionId(
		reimbTransId,
		totalAmount
	);

	return totalAmount;
}

async function generateTransactionNumber(email, reimbTrans) {
	let company = await DbCompany.getCompanyByEmployeeEmail(email);
	let dateNow = new Date();
	let formattedDate = `${dateNow.getFullYear()}${(dateNow.getMonth() + 1)
		.toString()
		.padStart(2, "0")}${dateNow.getDate()}`;

	let transactionNumber = `${company.Code}-${reimbTrans.FlexCutoffId}-${formattedDate}-${reimbTrans.FlexReimbursementId}`;
	return transactionNumber;
}

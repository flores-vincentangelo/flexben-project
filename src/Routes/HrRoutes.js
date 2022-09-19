const responses = require("../Helpers/responsesHelper");
const { AUDIENCE_OPTIONS } = require("../env/constants");
const jwtHelper = require("../Helpers/jwtHelper");
const DbReimbursementTransaction = require("../DataAccess/Database/DbReimbursementTransaction");
const DbReimbursementItem = require("../DataAccess/Database/DbReimbursementItem");

let HrRoutes = {
	getReimbTransByCutoff,
	getReimbTransItems,
	searchReimbTransaction,
	approveReimbTrans,
	rejectReimbTrans,
};
module.exports = HrRoutes;

async function getReimbTransByCutoff(req, res, next) {
	if (
		jwtHelper
			.getAudienceFromToken(req.cookies.token)
			.includes(AUDIENCE_OPTIONS.GET_REIMB_BY_CUTOFF)
	) {
		try {
			let flexCutoffId = parseInt(req.query.id);

			let transactionArr = await DbReimbursementTransaction.getByCutoffId(
				flexCutoffId
			);
			let formattedArr = [];

			transactionArr.forEach(reimbTrans => {
				let formattedTransaction = formatTransaction(reimbTrans);
				formattedArr.push(formattedTransaction);
			});

			let token = await jwtHelper.generateToken(req.cookies.token, null);
			res.cookie("token", token, { httpOnly: true });
			res.status(200).json({
				...responses.OkResponseBuilder("OK"),
				data: {
					length: transactionArr.length,
					transactions: formattedArr,
				},
			});
		} catch (error) {
			next(error);
		}
	} else {
		res.status(403).json(responses.forbiddenResponse);
	}
}

async function getReimbTransItems(req, res, next) {
	if (
		jwtHelper
			.getAudienceFromToken(req.cookies.token)
			.includes(AUDIENCE_OPTIONS.GET_REIMB_DETAILS)
	) {
		try {
			let transactionNumber = req.query.transactionNumber;

			let transaction =
				await DbReimbursementTransaction.getByTransactionNumber(
					transactionNumber
				);
			if (!transaction) {
				res.status(404).json({
					...responses.notFoundBuilder("Transaction not found"),
				});
			} else {
				let formattedTransaction = formatTransaction(transaction);

				let reimbItemsArr =
					await DbReimbursementItem.getItemsByReimbTransId(
						transaction.FlexReimbursementId
					);
				let formatteditemsArr = [];

				reimbItemsArr.forEach(reimbItem => {
					let formattedItem = formatItem(reimbItem);
					formatteditemsArr.push(formattedItem);
				});

				let token = await jwtHelper.generateToken(
					req.cookies.token,
					null
				);
				res.cookie("token", token, { httpOnly: true });
				res.status(200).json({
					...responses.OkResponseBuilder("OK"),
					data: { ...formattedTransaction, Items: formatteditemsArr },
				});
			}
		} catch (error) {
			next(error);
		}
	} else {
		res.status(403).json(responses.forbiddenResponse);
	}
}

async function searchReimbTransaction(req, res, next) {
	if (
		jwtHelper
			.getAudienceFromToken(req.cookies.token)
			.includes(AUDIENCE_OPTIONS.SEARCH_REIMB_TRANSACTION)
	) {
		try {
			let empNumber = req.query.employeeNumber
				? req.query.employeeNumber
				: "";
			let empLastname = req.query.employeeLastname
				? req.query.employeeLastname
				: "";
			let empFirstname = req.query.employeeFirstname
				? req.query.employeeFirstname
				: "";
			// let status = req.query.status ? req.query.status : "";
			let transactionArr =
				await DbReimbursementTransaction.searchTransactionByEmployeeIdName(
					empNumber,
					empLastname,
					empFirstname
				);
			if (transactionArr.length === 0) {
				res.status(404).json({
					...responses.notFoundBuilder("Transaction not found"),
				});
			} else {
				let formattedTransactionAndItemsArr = [];
				transactionArr.forEach(async reimbTrans => {
					let reimbItemsArr =
						await DbReimbursementItem.getItemsByReimbTransId(
							reimbTrans.FlexReimbursementId
						);
					let formatteditemsArr = [];

					reimbItemsArr.forEach(reimbItem => {
						let formattedItem = formatItem(reimbItem);
						formatteditemsArr.push(formattedItem);
					});
					let formattedTransaction = formatTransaction(reimbTrans);
					formattedTransactionAndItemsArr.push({
						...formattedTransaction,
						Items: formatteditemsArr,
					});
				});

				let token = await jwtHelper.generateToken(
					req.cookies.token,
					null
				);
				res.cookie("token", token, { httpOnly: true });
				res.status(200).json({
					...responses.OkResponseBuilder("OK"),
					data: formattedTransactionAndItemsArr,
				});
			}
		} catch (error) {
			next(error);
		}
	} else {
		res.status(403).json(responses.forbiddenResponse);
	}
}

async function approveReimbTrans(req, res, next) {
	if (
		jwtHelper
			.getAudienceFromToken(req.cookies.token)
			.includes(AUDIENCE_OPTIONS.APPROVE_REIMB_TRANSACTION)
	) {
		try {
			let reimbTransNumber = req.body.transactionNumber;

			let transaction =
				await DbReimbursementTransaction.getByTransactionNumber(
					reimbTransNumber
				);

			if (!transaction) {
				res.status(404).json({
					...responses.notFoundBuilder("Transaction not found"),
				});
			} else {
				await DbReimbursementTransaction.updateStatusToApprovedOnTransactionId(
					reimbTransNumber
				);
				await DbReimbursementItem.updateStatusToApprovedOnTransactionId(
					transaction.FlexReimbursementId
				);
				let token = await jwtHelper.generateToken(
					req.cookies.token,
					null
				);
				res.cookie("token", token, { httpOnly: true });
				res.status(200).json({
					...responses.OkResponseBuilder("OK. Transaction approved"),
				});
			}
		} catch (error) {
			next(error);
		}
	} else {
		res.status(403).json(responses.forbiddenResponse);
	}
}

async function rejectReimbTrans(req, res, next) {
	if (
		jwtHelper
			.getAudienceFromToken(req.cookies.token)
			.includes(AUDIENCE_OPTIONS.REJECT_REIMB_TRANSACTION)
	) {
		try {
			let reimbTransNumber = req.body.transactionNumber;

			let transaction =
				await DbReimbursementTransaction.getByTransactionNumber(
					reimbTransNumber
				);

			if (!transaction) {
				res.status(404).json({
					...responses.notFoundBuilder("Transaction not found"),
				});
			} else {
				await DbReimbursementTransaction.updateStatusToRejectedOnTransactionId(
					reimbTransNumber
				);
				await DbReimbursementItem.updateStatusToRejectedOnTransactionId(
					transaction.FlexReimbursementId
				);
				let token = await jwtHelper.generateToken(
					req.cookies.token,
					null
				);
				res.cookie("token", token, { httpOnly: true });
				res.status(200).json({
					...responses.OkResponseBuilder("OK. Transaction rejected"),
				});
			}
		} catch (error) {
			next(error);
		}
	} else {
		res.status(403).json(responses.forbiddenResponse);
	}
}

function formatTransaction(reimbTrans) {
	reimbTrans.EmployeeName = `${reimbTrans.LastName}, ${reimbTrans.FirstName}`;
	let formattedDate = formatDate(reimbTrans.DateSubmitted);
	return {
		"Transaction number": reimbTrans.TransactionNumber,
		"Employee Number": reimbTrans.EmployeeNumber,
		"Employee Name ": reimbTrans.EmployeeName,
		"Amount to be reimbursed": reimbTrans.TotalReimbursementAmount,
		"Date Submitted": formattedDate,
		Status: reimbTrans.Status,
	};
}

function formatItem(reimbItem) {
	let formattedDate = formatDate(reimbItem.Date);
	return {
		Date: formattedDate,
		"OR Number": reimbItem.OrNumber,
		"Name of establishment": reimbItem.NameEstablishment,
		"TIN of establishment": reimbItem.TinEstablishment,
		Amount: reimbItem.Amount,
		Category: reimbItem.CategoryName,
	};
}

function formatDate(dateToFormat) {
	let date = new Date(dateToFormat);
	let year = date.getFullYear();
	let month = (date.getMonth() + 1).toString().padStart(2, "0");
	let dateDay = date.getDate();
	return dateToFormat ? `${year}-${month}-${dateDay}` : null;
}

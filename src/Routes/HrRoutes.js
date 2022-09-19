const responses = require("../Helpers/responsesHelper");
const { AUDIENCE_OPTIONS } = require("../env/constants");
const jwtHelper = require("../Helpers/jwtHelper");
const DbReimbursementTransaction = require("../DataAccess/Database/DbReimbursementTransaction");

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

			transactionArr.forEach(element => {
				element.EmployeeName = `${element.LastName}, ${element.FirstName}`;
				let formattedDate = formatDate(element.DateSubmitted);
				let obj = {
					"Transaction number": element.TransactionNumber,
					"Employee Number": element.EmployeeNumber,
					"Employee Name ": element.EmployeeName,
					"Amount to be reimbursed": element.TotalReimbursementAmount,
					"Date Submitted": formattedDate,
					Status: element.Status,
				};
				formattedArr.push(obj);
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
			let flexCutoffId = parseInt(req.query.id);

			let transactionArr = await DbReimbursementTransaction.getByCutoffId(
				flexCutoffId
			);
			let formattedArr = [];

			transactionArr.forEach(element => {
				element.EmployeeName = `${element.LastName}, ${element.FirstName}`;
				let formattedDate = formatDate(element.DateSubmitted);
				let obj = {
					"Transaction number": element.TransactionNumber,
					"Employee Number": element.EmployeeNumber,
					"Employee Name ": element.EmployeeName,
					"Amount to be reimbursed": element.TotalReimbursementAmount,
					"Date Submitted": formattedDate,
					Status: element.Status,
				};
				formattedArr.push(obj);
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

async function searchReimbTransaction(req, res, next) {}

async function approveReimbTrans(req, res, next) {}

async function rejectReimbTrans(req, res, next) {}

function formatDate(dateToFormat) {
	let date = new Date(dateToFormat);
	let year = date.getFullYear();
	let month = (date.getMonth() + 1).toString().padStart(2, "0");
	let dateDay = date.getDate();
	return dateToFormat ? `${year}-${month}-${dateDay}` : null;
}

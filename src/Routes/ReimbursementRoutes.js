const responses = require("../Helpers/responsesHelper");
const ReimbursementModel = require("../Models/ReimbursementModel");
const DataValidationHelper = require("../Helpers/DataValidationHelper");
const jwtHelper = require("../Helpers/jwtHelper");
const { AUDIENCE_OPTIONS } = require("../env/constants");

let ReimbursementRoutes = { file, test, createTransaction };
module.exports = ReimbursementRoutes;

async function file(req, res, next) {
	if (
		jwtHelper
			.getAudienceFromToken(req.cookies.token)
			.includes(AUDIENCE_OPTIONS.FILE_REIMBURSEMENT)
	) {
		let reimbursementItem = new ReimbursementModel();
		reimbursementItem.Date = req.body.date;
		reimbursementItem.OrNumber = req.body.orNumber;
		reimbursementItem.NameEstablishment = req.body.nameEstablishment;
		reimbursementItem.TinEstablishment = req.body.tinEstablishment;
		reimbursementItem.Amount = req.body.amount;
		reimbursementItem.Category = req.body.category;

		let validationResults =
			DataValidationHelper.validateReimbursementItem(reimbursementItem);

		if (validationResults.errors.length != 0) {
			res.status(400).json({
				...responses.badRequestResponseBuilder(
					validationResults.message
				),
				data: validationResults.errors,
			});
		} else {
			//check if user has an existing reimbursement transaction
			// if not exist,  create reimbursement transaction
			// if exists okay
			//db function
			res.status(200).json({
				...responses.createdBuilder("Reimbursement Filed"),
				data: reimbursementItem,
			});
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
	//get email of user from jwt
	//get latest flex cycle
	res.status(200).json({
		...responses.OkResponseBuilder("from createTransaction"),
	});
}

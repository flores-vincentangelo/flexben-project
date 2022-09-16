const responses = require("../Helpers/responsesHelper");
const ReimbursementModel = require("../Models/ReimbursementModel");
const DataValidationHelper = require("../Helpers/DataValidationHelper");
const jwtHelper = require("../Helpers/jwtHelper");
const { AUDIENCE_OPTIONS } = require("../env/constants");
const e = require("express");

let ReimbursementRoutes = { file };
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

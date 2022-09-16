const responses = require("../Helpers/responsesHelper");
const ReimbursementModel = require("../Models/ReimbursementModel");
const DataValidationHelper = require("../Helpers/DataValidationHelper");

let ReimbursementRoutes = { file };
module.exports = ReimbursementRoutes;

async function file(req, res, next) {
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
			...responses.badRequestResponseBuilder(validationResults.message),
			data: validationResults.errors,
		});
	}
}

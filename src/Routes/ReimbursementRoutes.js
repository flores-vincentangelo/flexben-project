const responses = require("../Helpers/responsesHelper");
const ReimbursementModel = require("../Models/ReimbursementModel");

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

	res.status(200).json({
		...responses.OkResponseBuilder("OK"),
		data: req.body,
	});
}

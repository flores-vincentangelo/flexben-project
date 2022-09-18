const responses = require("../Helpers/responsesHelper");
const { AUDIENCE_OPTIONS } = require("../env/constants");
const jwtHelper = require("../Helpers/jwtHelper");

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

async function getReimbTransItems(req, res, next) {}

async function searchReimbTransaction(req, res, next) {}

async function approveReimbTrans(req, res, next) {}

async function rejectReimbTrans(req, res, next) {}

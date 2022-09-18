const responses = require("../Helpers/responsesHelper");
const { AUDIENCE_OPTIONS } = require("../env/constants");
const jwtHelper = require("../Helpers/jwtHelper");

let FlexPointsRoutes = {
	calculateFlexPoints,
};

module.exports = FlexPointsRoutes;

async function calculateFlexPoints(req, res, next) {
	if (
		jwtHelper
			.getAudienceFromToken(req.cookies.token)
			.includes(AUDIENCE_OPTIONS.CALCULATE_FLEX_POINTS)
	) {
		//         "Employee should be able to calculate their own flex points based on the following parameters:
		// - Number of flex credits
		// - Monthly rate
		// Flex Point = (monthly rate/21.75)*FlexCredits
		// ***take into consideration tax deductions, but tax for now is 0% (should be configurable)
		// * is a stand-alone function (i.e. current flex credits of logged-in user does not affect computation in any way)"

		try {
			let flexCredits = req.body.flexCredits ? req.body.flexCredits : 0;
			let monthlyRate = req.body.monthlyRate ? req.body.monthlyRate : 0;

			let flexPoints = (monthlyRate / 21.75) * flexCredits;

			res.status(200).json({
				...responses.OkResponseBuilder("Flex points calculated"),
				data: flexPoints,
			});
		} catch (error) {
			next(error);
		}
	} else {
		res.status(403).json(responses.forbiddenResponse);
	}
}

let DataValidationHelper = {
	validateReimbursementItem,
	dateAfterCurrent,
	amountAboveMinimum,
};
module.exports = DataValidationHelper;

function validateReimbursementItem(reimbursementItem) {
	let isDateIncorrect = dateAfterCurrent(reimbursementItem.Date);
	let isAmountCorrect = amountAboveMinimum(reimbursementItem.Amount);
	let message = "";
	let errors = [];

	if (isDateIncorrect) {
		message += "Invalid date. Date can't be later than today. ";
		errors.push("date");
	}

	if (!isAmountCorrect) {
		message += "Invalid amount. amount can't be lower than minimum. ";
		errors.push("amount");
	}

	return {
		message,
		errors,
	};
}

function dateAfterCurrent(dateStr) {
	let testDate = new Date(dateStr);
	let dateNow = new Date();
	return dateNow - testDate < 0 ? true : false;
}

function amountAboveMinimum(amount) {
	return amount >= process.env.APPMINAMT;
}

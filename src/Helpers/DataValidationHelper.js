let DataValidationHelper = {
	validateReimbursementItem,
	dateBeforeCurrent,
	amountAboveMinimum,
};
module.exports = DataValidationHelper;

function validateReimbursementItem(reimbursementItem) {}

function dateBeforeCurrent(dateStr) {
	let pastDate = new Date(dateStr);
	let dateNow = new Date();
	return dateNow - pastDate > 0 ? true : false;
}

function amountAboveMinimum(amount) {
	return amount > process.env.APPMINAMT;
}

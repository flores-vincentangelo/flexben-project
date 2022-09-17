const DbCategory = require("../DataAccess/Database/DbCategory");

let DataValidationHelper = {
	validateReimbursementItem,
	dateAfterCurrent,
	amountAboveMinimum,
};
module.exports = DataValidationHelper;

async function validateReimbursementItem(reimbursementItem) {
	let isDateIncorrect = dateAfterCurrent(reimbursementItem.Date);
	let isAmountCorrect = amountAboveMinimum(reimbursementItem.Amount);
	let category = await DbCategory.getCategoryByCode(
		reimbursementItem.CategoryCode
	);

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

	if (!category) {
		message += "Invalid category code. ";
		errors.push("category");
	}

	return {
		reimbursementItem: {
			...reimbursementItem,
			CategoryId: category ? category.CategoryId : null,
			Date: formatDate(reimbursementItem.Date),
		},
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

function formatDate(dateStr) {
	let dateToFormat = new Date(dateStr);

	return `${dateToFormat.getFullYear()}-${
		dateToFormat.getMonth() + 1
	}-${dateToFormat.getDate()}`;
}

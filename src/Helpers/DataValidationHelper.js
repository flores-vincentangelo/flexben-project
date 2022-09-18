const DbCategory = require("../DataAccess/Database/DbCategory");
const DbFlexCycleCutoff = require("../DataAccess/Database/DbFlexCycleCutoff");

let DataValidationHelper = {
	validateReimbursementItem,
	dateAfterCurrent,
	amountAboveMinimum,
	isCategoryCodeValid,
	itemAmountExceedsCapFn,
};
module.exports = DataValidationHelper;

async function validateReimbursementItem(reimbursementItem, reimbTrans) {
	let isDateIncorrect = dateAfterCurrent(reimbursementItem.Date);
	let isAmountCorrect = amountAboveMinimum(reimbursementItem.Amount);
	let category = await isCategoryCodeValid(reimbursementItem.CategoryCode);
	let itemAmountExceedsCap = await itemAmountExceedsCapFn(
		reimbursementItem.Amount,
		reimbTrans.TotalReimbursementAmount,
		reimbTrans.FlexCutoffId
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

	if (itemAmountExceedsCap) {
		message +=
			"Adding this reimbursement item will exceed the maximum reimbursement amount for your flex cycle. ";
		errors.push("amount");
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

async function isCategoryCodeValid(categoryCode) {
	let category = await DbCategory.getCategoryByCode(categoryCode);

	return category ? category : false;
}

async function itemAmountExceedsCapFn(
	amount,
	totalReimbursementAmount,
	flexCutoffId
) {
	let flexCycle = await DbFlexCycleCutoff.getByFlexCycleId(flexCutoffId);
	let newTotal = totalReimbursementAmount + amount;
	return newTotal > flexCycle.CutoffCapAmount;
}

function formatDate(dateStr) {
	let dateToFormat = new Date(dateStr);

	return `${dateToFormat.getFullYear()}-${
		dateToFormat.getMonth() + 1
	}-${dateToFormat.getDate()}`;
}

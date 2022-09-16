const DataValidationHelper = require("../Helpers/DataValidationHelper");
const ReimbursementModel = require("../Models/ReimbursementModel");

test("dateAfterCurrent pastDateString false", () => {
	let pastDateStr = "08/20/2018";
	let isFalse = DataValidationHelper.dateAfterCurrent(pastDateStr);

	expect(isFalse).toBeFalsy();
});

test("dateAfterCurrent laterDateString true", () => {
	let futureDateStr = "12/12/2099";
	let isTrue = DataValidationHelper.dateAfterCurrent(futureDateStr);

	expect(isTrue).toBeTruthy();
});

test("dateAfterCurrent currentDate false", () => {
	let dateNow = new Date();
	let isFalse = DataValidationHelper.dateAfterCurrent(dateNow);

	expect(isFalse).toBeFalsy();
});

describe("process.env", () => {
	const env = process.env;

	beforeEach(() => {
		jest.resetModules();
		process.env = { ...env };
	});

	afterEach(() => {
		process.env = env;
	});

	test("amountAboveMinimum amountAboveMinimum true", () => {
		process.env.APPMINAMT = 300;

		let isTrue = DataValidationHelper.amountAboveMinimum(350);
		expect(isTrue).toBeTruthy();
	});

	test("amountAboveMinimum amountBelowMinimum false", () => {
		process.env.APPMINAMT = 900;

		let isFalse = DataValidationHelper.amountAboveMinimum(600);
		expect(isFalse).toBeFalsy();
	});

	test("validateReimbursementItem futureDate returnFailMessage", () => {
		let reimbursementItem = new ReimbursementModel();
		reimbursementItem.Date = "12/12/2099";
		reimbursementItem.OrNumber = "11111222223333";
		reimbursementItem.NameEstablishment = "Jollibee";
		reimbursementItem.TinEstablishment = "1111111111111";
		reimbursementItem.Amount = 800;
		reimbursementItem.Category = "FOODC";

		let returnedValue =
			DataValidationHelper.validateReimbursementItem(reimbursementItem);

		expect(returnedValue.message).toContain(
			"Invalid date. Date can't be later than today."
		);
		expect(returnedValue.errors).toContain("date");
	});

	test("validateReimbursementItem belowMinimumAmt returnFailMessage", () => {
		process.env.APPMINAMT = 900;
		let reimbursementItem = new ReimbursementModel();
		reimbursementItem.Date = "08/20/2018";
		reimbursementItem.OrNumber = "11111222223333";
		reimbursementItem.NameEstablishment = "Jollibee";
		reimbursementItem.TinEstablishment = "1111111111111";
		reimbursementItem.Amount = 400;
		reimbursementItem.Category = "FOODC";

		let returnedValue =
			DataValidationHelper.validateReimbursementItem(reimbursementItem);

		expect(returnedValue.message).toContain(
			"Invalid amount. amount can't be lower than minimum."
		);
		expect(returnedValue.errors).toContain("amount");
	});

	test("validateReimbursementItem belowMinimumAmt&futureDate returnFailMessage", () => {
		process.env.APPMINAMT = 900;
		let reimbursementItem = new ReimbursementModel();
		reimbursementItem.Date = "08/20/2099";
		reimbursementItem.OrNumber = "11111222223333";
		reimbursementItem.NameEstablishment = "Jollibee";
		reimbursementItem.TinEstablishment = "1111111111111";
		reimbursementItem.Amount = 400;
		reimbursementItem.Category = "FOODC";

		let returnedValue =
			DataValidationHelper.validateReimbursementItem(reimbursementItem);

		expect(returnedValue.message).toContain(
			"Invalid amount. amount can't be lower than minimum."
		);
		expect(returnedValue.errors).toContain("amount");
		expect(returnedValue.message).toContain(
			"Invalid date. Date can't be later than today."
		);
		expect(returnedValue.errors).toContain("date");
	});

	test("validateReimbursementItem allCorrect returnEmptyErrorsArr", () => {
		process.env.APPMINAMT = 300;
		let reimbursementItem = new ReimbursementModel();
		reimbursementItem.Date = "08/20/2018";
		reimbursementItem.OrNumber = "11111222223333";
		reimbursementItem.NameEstablishment = "Jollibee";
		reimbursementItem.TinEstablishment = "1111111111111";
		reimbursementItem.Amount = 400;
		reimbursementItem.Category = "FOODC";

		let returnedValue =
			DataValidationHelper.validateReimbursementItem(reimbursementItem);

		expect(returnedValue.errors.length).toBe(0);
	});
});

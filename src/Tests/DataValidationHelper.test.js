const DataValidationHelper = require("../Helpers/DataValidationHelper");

test("dateBeforeCurrent pastDateString true", () => {
	let pastDateStr = "08/20/2018";
	let isTrue = DataValidationHelper.dateBeforeCurrent(pastDateStr);

	expect(isTrue).toBeTruthy();
});

test("dateBeforeCurrent laterDateString false", () => {
	let futureDateStr = "12/12/2099";
	let isFalse = DataValidationHelper.dateBeforeCurrent(futureDateStr);

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
});

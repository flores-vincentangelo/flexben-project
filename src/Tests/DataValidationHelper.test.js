const DataValidationHelper = require("../Helpers/DataValidationHelper");
const ReimbursementItemModel = require("../Models/ReimbursementItemModel");

jest.mock("../DataAccess/Database/DbCategory", () => ({
	getCategoryByCode: jest.fn(),
}));

const mockDbCategory = require("../DataAccess/Database/DbCategory");

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
		process.env.APPMINAMT = 500;
	});

	afterEach(() => {
		process.env = env;
	});

	test("amountAboveMinimum amountAboveMinimum true", () => {
		let isTrue = DataValidationHelper.amountAboveMinimum(550);
		expect(isTrue).toBeTruthy();
	});

	test("amountAboveMinimum amountBelowMinimum false", () => {
		let isFalse = DataValidationHelper.amountAboveMinimum(300);
		expect(isFalse).toBeFalsy();
	});

	test("validateReimbursementItem futureDate returnFailMessage", async () => {
		let reimbursementItem = new ReimbursementItemModel();
		reimbursementItem.Date = "12/12/2099";
		reimbursementItem.OrNumber = "11111222223333";
		reimbursementItem.NameEstablishment = "Jollibee";
		reimbursementItem.TinEstablishment = "1111111111111";
		reimbursementItem.Amount = 800;
		reimbursementItem.Category = "FOODC";

		let returnedValue =
			await DataValidationHelper.validateReimbursementItem(
				reimbursementItem
			);

		expect(returnedValue.message).toContain(
			"Invalid date. Date can't be later than today."
		);
		expect(returnedValue.errors).toContain("date");
	});

	test("validateReimbursementItem belowMinimumAmt returnFailMessage", async () => {
		let reimbursementItem = new ReimbursementItemModel();
		reimbursementItem.Date = "08/20/2018";
		reimbursementItem.OrNumber = "11111222223333";
		reimbursementItem.NameEstablishment = "Jollibee";
		reimbursementItem.TinEstablishment = "1111111111111";
		reimbursementItem.Amount = 400;
		reimbursementItem.Category = "FOODC";

		let returnedValue =
			await DataValidationHelper.validateReimbursementItem(
				reimbursementItem
			);

		expect(returnedValue.message).toContain(
			"Invalid amount. amount can't be lower than minimum."
		);
		expect(returnedValue.errors).toContain("amount");
	});

	test("validateReimbursementItem belowMinimumAmt&futureDate returnFailMessage", async () => {
		let reimbursementItem = new ReimbursementItemModel();
		reimbursementItem.Date = "08/20/2099";
		reimbursementItem.OrNumber = "11111222223333";
		reimbursementItem.NameEstablishment = "Jollibee";
		reimbursementItem.TinEstablishment = "1111111111111";
		reimbursementItem.Amount = 400;
		reimbursementItem.Category = "FOODC";

		let returnedValue =
			await DataValidationHelper.validateReimbursementItem(
				reimbursementItem
			);

		expect(returnedValue.message).toContain(
			"Invalid amount. amount can't be lower than minimum."
		);
		expect(returnedValue.errors).toContain("amount");
		expect(returnedValue.message).toContain(
			"Invalid date. Date can't be later than today."
		);
		expect(returnedValue.errors).toContain("date");
	});

	test("validateReimbursementItem wrongCategoryCode returnFailMessage", async () => {
		let reimbursementItem = new ReimbursementItemModel();
		reimbursementItem.Date = "08/20/2018";
		reimbursementItem.OrNumber = "11111222223333";
		reimbursementItem.NameEstablishment = "Jollibee";
		reimbursementItem.TinEstablishment = "1111111111111";
		reimbursementItem.Amount = 600;
		reimbursementItem.Category = "FAKE_CODE";
		let returnedValue =
			await DataValidationHelper.validateReimbursementItem(
				reimbursementItem
			);

		expect(returnedValue.message).toContain("Invalid category code.");
		expect(returnedValue.errors).toContain("category");
	});

	test("validateReimbursementItem allCorrect returnEmptyErrorsArr", async () => {
		mockDbCategory.getCategoryByCode.mockReturnValueOnce({
			CategoryId: 4,
			Code: "",
			Name: "",
			Description: "",
			DateAdded: "",
			AddedBy: "",
			UpdatedDate: "",
			UpdatedBy: "",
		});

		process.env.APPMINAMT = 300;
		let reimbursementItem = new ReimbursementItemModel();
		reimbursementItem.Date = "08/20/2018";
		reimbursementItem.OrNumber = "11111222223333";
		reimbursementItem.NameEstablishment = "Jollibee";
		reimbursementItem.TinEstablishment = "1111111111111";
		reimbursementItem.Amount = 400;
		reimbursementItem.Category = "FOODC";

		let returnedValue =
			await DataValidationHelper.validateReimbursementItem(
				reimbursementItem
			);

		expect(returnedValue.errors.length).toBe(0);
	});
});

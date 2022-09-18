const DataValidationHelper = require("../Helpers/DataValidationHelper");
const ReimbursementItemModel = require("../Models/ReimbursementItemModel");
const ReimbursementTransactionModel = require("../Models/ReimbursementTransactionModel");
const FlexCycleCutoffModel = require("../Models/FlexCycleCutoffModel");

jest.mock("../DataAccess/Database/DbCategory", () => ({
	getCategoryByCode: jest.fn(),
}));

jest.mock("../DataAccess/Database/DbFlexCycleCutoff", () => ({
	getByFlexCycleId: jest.fn(),
}));

const mockDbFlexCycleCutoff = require("../DataAccess/Database/DbFlexCycleCutoff");
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

	let mockReimbursementItem = new ReimbursementItemModel();
	let mockReimbTrans = new ReimbursementTransactionModel();
	let mockFlexCycleCutoff = new FlexCycleCutoffModel();

	mockDbCategory.getCategoryByCode.mockReturnValue({
		CategoryId: 4,
		Code: "",
		Name: "",
		Description: "",
		DateAdded: "",
		AddedBy: "",
		UpdatedDate: "",
		UpdatedBy: "",
	});

	mockDbFlexCycleCutoff.getByFlexCycleId.mockReturnValue({
		FlexCutoffId: 3,
		StartDate: new Date("2018-08-31T16:00:00.000Z"),
		EndDate: new Date("2018-12-30T16:00:00.000Z"),
		IsActive: "y",
		FlexCycleId: 1,
		CutoffCapAmount: 15000,
		CutoffDescription: "last cut-off for 2018",
	});

	beforeEach(() => {
		jest.resetModules();
		process.env = { ...env };
		process.env.APPMINAMT = 500;

		mockReimbursementItem.Date = "12/12/2018";
		mockReimbursementItem.OrNumber = "11111222223333";
		mockReimbursementItem.NameEstablishment = "Jollibee";
		mockReimbursementItem.TinEstablishment = "1111111111111";
		mockReimbursementItem.Amount = 800;
		mockReimbursementItem.Category = "FOODC";

		mockReimbTrans.FlexReimbursementId = 1;
		mockReimbTrans.EmployeeId = 1;
		mockReimbTrans.FlexCutoffId = "";
		mockReimbTrans.TotalReimbursementAmount = 13000;
		mockReimbTrans.DateSubmitted = "";
		mockReimbTrans.Status = "";
		mockReimbTrans.DateUpdated = "";
		mockReimbTrans.TransactionNumber = "";

		// mockFlexCycleCutoff.FlexCutoffId = 3;
		// mockFlexCycleCutoff.StartDate = new Date("2018-08-31T16:00:00.000Z");
		// mockFlexCycleCutoff.EndDate = new Date("2018-12-30T16:00:00.000Z");
		// mockFlexCycleCutoff.IsActive = "y";
		// mockFlexCycleCutoff.FlexCycleId = 1;
		// mockFlexCycleCutoff.CutoffCapAmount = 15000;
		// mockFlexCycleCutoff.CutoffDescription = "last cut-off for 2018";
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

	test("isCategoryCodeValid wrongCode false", async () => {
		mockDbCategory.getCategoryByCode.mockReturnValueOnce(null);
		let isFalse = await DataValidationHelper.isCategoryCodeValid(
			"WRONG_CODE"
		);

		expect(isFalse).toBeFalsy();
	});
	test("isCategoryCodeValid rightCode category", async () => {
		let isTrue = await DataValidationHelper.isCategoryCodeValid("FOODC");

		expect(isTrue).toBeTruthy();
	});

	test("itemAmountExceedsCap 2000Item14000RunningTotal15000Cap true", async () => {
		mockReimbursementItem.Amount = 2000;
		mockReimbTrans.TotalReimbursementAmount = 14000;
		mockReimbTrans.FlexCutoffId = 0;

		let isTrue = await DataValidationHelper.itemAmountExceedsCapFn(
			mockReimbursementItem.Amount,
			mockReimbTrans.TotalReimbursementAmount,
			mockReimbTrans.FlexCutoffId
		);

		expect(isTrue).toBeTruthy();
	});
	test("itemAmountExceedsCap 1000Item14000RunningTotal15000Cap false", async () => {
		mockReimbursementItem.Amount = 1000;
		mockReimbTrans.TotalReimbursementAmount = 14000;
		mockReimbTrans.FlexCutoffId = 0;

		let isFalse = await DataValidationHelper.itemAmountExceedsCapFn(
			mockReimbursementItem.Amount,
			mockReimbTrans.TotalReimbursementAmount,
			mockReimbTrans.FlexCutoffId
		);

		expect(isFalse).toBeFalsy();
	});

	test("validateReimbursementItem futureDate returnFailMessage", async () => {
		mockReimbursementItem.Date = "12/12/2099";

		let returnedValue =
			await DataValidationHelper.validateReimbursementItem(
				mockReimbursementItem,
				mockReimbTrans
			);

		expect(returnedValue.message).toContain(
			"Invalid date. Date can't be later than today."
		);
		expect(returnedValue.errors).toContain("date");
	});

	test("validateReimbursementItem belowMinimumAmt returnFailMessage", async () => {
		mockReimbursementItem.Amount = 400;

		let returnedValue =
			await DataValidationHelper.validateReimbursementItem(
				mockReimbursementItem,
				mockReimbTrans
			);

		expect(returnedValue.message).toContain(
			"Invalid amount. amount can't be lower than minimum."
		);
		expect(returnedValue.errors).toContain("amount");
	});

	test("validateReimbursementItem belowMinimumAmt&futureDate returnFailMessage", async () => {
		mockReimbursementItem.Date = "08/20/2099";
		mockReimbursementItem.Amount = 400;

		let returnedValue =
			await DataValidationHelper.validateReimbursementItem(
				mockReimbursementItem,
				mockReimbTrans
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
		mockDbCategory.getCategoryByCode.mockReturnValueOnce(null);
		mockReimbursementItem.Category = "FAKE_CODE";
		let returnedValue =
			await DataValidationHelper.validateReimbursementItem(
				mockReimbursementItem,
				mockReimbTrans
			);

		expect(returnedValue.message).toContain("Invalid category code.");
		expect(returnedValue.errors).toContain("category");
	});

	test("validateReimbursementItem veryExpensiveItem returnFailMessage", async () => {
		mockReimbursementItem.Amount = 10000;
		let returnedValue =
			await DataValidationHelper.validateReimbursementItem(
				mockReimbursementItem,
				mockReimbTrans
			);
		expect(returnedValue.message).toContain(
			"Adding this reimbursement item will exceed the maximum reimbursement amount for your flex cycle. "
		);
		expect(returnedValue.errors).toContain("amount");
	});

	test("validateReimbursementItem allCorrect returnEmptyErrorsArr", async () => {
		mockDbFlexCycleCutoff.getByFlexCycleId.mockReturnValueOnce({});

		let returnedValue =
			await DataValidationHelper.validateReimbursementItem(
				mockReimbursementItem,
				mockReimbTrans
			);

		expect(returnedValue.errors.length).toBe(0);
		expect(returnedValue.reimbursementItem).toBeTruthy();
		expect(returnedValue.reimbursementItem.CategoryId).toBe(4);
	});
});

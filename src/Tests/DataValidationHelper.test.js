const DataValidationHelper = require("../Helpers/DataValidationHelper");

test("dateBeforeCurrent pastDateString true", () => {
	let pastDateStr = "08/20/2018";
	let isTrue = DataValidationHelper.dateBeforeCurrent(pastDateStr);

	expect(isTrue).toBeTruthy();
});

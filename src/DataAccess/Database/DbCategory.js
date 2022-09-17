const DbConnection = require("./DbConnection");
const mysql = require("mysql");
const CategoryModel = require("../../Models/CategoryModel");

let DbCategory = { getCategoryByCode };
module.exports = DbCategory;

async function getCategoryByCode(code) {
	let sql = "SELECT * FROM categories WHERE code = ?;";
	let inserts = [code];
	let query = mysql.format(sql, inserts);
	let singleResultArr = await DbConnection.runQuery(query);

	let category;
	if (singleResultArr.length === 1) {
		category = CategoryModel();
		category.CategoryId = singleResultArr[0].category_id;
		category.Code = singleResultArr[0].code;
		category.Name = singleResultArr[0].name;
		category.Description = singleResultArr[0].description;
		category.DateAdded = singleResultArr[0].date_added;
		category.AddedBy = singleResultArr[0].added_by;
		category.UpdatedDate = singleResultArr[0].updated_date;
		category.UpdatedBy = singleResultArr[0].updated_by;
	}
	return category;
}

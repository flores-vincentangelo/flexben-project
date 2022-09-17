const DbConnection = require("./DbConnection");
const mysql = require("mysql");
const CategoryModel = require("../../Models/CategoryModel");

let DbCategory = { getCategoryByCode, getAll };
module.exports = DbCategory;

async function getCategoryByCode(code) {
	let sql = "SELECT * FROM categories WHERE code = ?;";
	let inserts = [code];
	let query = mysql.format(sql, inserts);
	let singleResultArr = await DbConnection.runQuery(query);

	let category;
	if (singleResultArr.length === 1) {
		category = new CategoryModel();
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

async function getAll() {
	let query = "SELECT * FROM categories;";
	let resultArr = await DbConnection.runQuery(query);

	let categoryArr = [];
	resultArr.forEach(element => {
		let category = new CategoryModel();
		category.CategoryId = element.category_id;
		category.Code = element.code;
		category.Name = element.name;
		category.Description = element.description;
		category.DateAdded = element.date_added;
		category.AddedBy = element.added_by;
		category.UpdatedDate = element.updated_date;
		category.UpdatedBy = element.updated_by;
		categoryArr.push(category);
	});

	return categoryArr;
}

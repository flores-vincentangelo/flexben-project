const DbConnection = require("./DbConnection");
const mysql = require("mysql");
const CompanyModel = require("../../Models/CompanyModel");

let DbCompany = { getCompanyByEmployeeEmail };
module.exports = DbCompany;

async function getCompanyByEmployeeEmail(email) {
	let sql = `SELECT companies.* FROM employees
    LEFT JOIN companies
    ON employees.company_id = companies.company_id
    WHERE employees.email = ?;`;
	let inserts = [email];
	let query = mysql.format(sql, inserts);
	let singleResultArr = await DbConnection.runQuery(query);

	let company;
	if (singleResultArr.length === 1) {
		company = new CompanyModel();
		company.CompanyId = singleResultArr[0].company_id;
		company.Code = singleResultArr[0].code;
		company.Name = singleResultArr[0].name;
		company.Description = singleResultArr[0].description;
		company.Logo = singleResultArr[0].logo;
	}
	return company;
}

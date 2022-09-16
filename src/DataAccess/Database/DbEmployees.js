const DbConnection = require("./DbConnection");
const mysql = require("mysql");
const EmployeeModel = require("../../Models/EmployeeModel");

let DbEmployees = { getEmployeeDetailsByEmail };
module.exports = DbEmployees;

async function getEmployeeDetailsByEmail(email) {
	let sql = `SELECT employees.*, roles.name AS role_name 
    FROM employees LEFT JOIN roles
    ON employees.role_id = roles.role_id 
    WHERE email = ?;`;
	let inserts = [email];
	let query = mysql.format(sql, inserts);
	let singleResultArr = await DbConnection.runQuery(query);

	let employee;
	if (singleResultArr.length === 1) {
		employee = new EmployeeModel();
		employee.EmployeeId = singleResultArr[0].employee_id;
		employee.EmployeeNumber = singleResultArr[0].employee_number;
		employee.FirstName = singleResultArr[0].firstname;
		employee.LastName = singleResultArr[0].lastname;
		employee.Email = singleResultArr[0].email;
		employee.IsActive = singleResultArr[0].is_active;
		employee.DateAdded = singleResultArr[0].date_added;
		employee.CompanyId = singleResultArr[0].company_id;
		employee.RoleId = singleResultArr[0].role_id;
		employee.Role = singleResultArr[0].role_name;
	}
	return employee;
}

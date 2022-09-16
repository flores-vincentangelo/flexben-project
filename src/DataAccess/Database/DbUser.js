const DbConnection = require("./DbConnection");
const mysql = require("mysql");

let DbUser = { register };
module.exports = DbUser;

async function register(userModel) {
	let sql = "INSERT INTO accounts (employee_id, password) VALUES (?, ?);";
	let inserts = [userModel.EmployeeId, userModel.HashedPassword];
	let query = mysql.format(sql, inserts);
	return await DbConnection.runQuery(query);
}

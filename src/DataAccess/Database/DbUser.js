const DbConnection = require("./DbConnection");
const mysql = require("mysql");
const AccountModel = require("../../Models/AccountModel");

let DbUser = { register, login, getAccountByEmployeeId };
module.exports = DbUser;

async function register(userModel) {
	let sql = "INSERT INTO accounts (employee_id, password) VALUES (?, ?);";
	let inserts = [userModel.EmployeeId, userModel.HashedPassword];
	let query = mysql.format(sql, inserts);
	return await DbConnection.runQuery(query);
}

async function login() {}

async function getAccountByEmployeeId(employeeId) {
	let sql = "SELECT * FROM accounts WHERE employee_id = ?;";
	let inserts = [employeeId];
	let query = mysql.format(sql, inserts);
	let singleResultArr = await DbConnection.runQuery(query);

	let account = null;
	if (singleResultArr.length != 0) {
		account = new AccountModel();
		account.AccountId = singleResultArr[0].account_id;
		account.EmployeeId = singleResultArr[0].employee_id;
		account.HashedPassword = singleResultArr[0].password;
		account.IsActive = singleResultArr[0].is_active;
		account.DateUpdated = singleResultArr[0].date_updated;
	}
	return account;
}

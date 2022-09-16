const DbConnection = require("./DbConnection");
const mysql = require("mysql");
const ReimbursementModel = require("../../Models/ReimbursementModel");

let DbReimbursement = { addReimbursementTransaction };
module.exports = DbReimbursement;

async function fileReimbursementItem(reimbursementItem) {
	let sql = `
    insert 
    etc etc`;
	let inserts = [];
	let query = mysql.format(sql, inserts);
	let result = await DbConnection.runQuery(query);
}

async function getReimbursementTransactionsByEmail(email) {
	let sql = `
    insert 
    etc etc`;
	let inserts = [];
	let query = mysql.format(sql, inserts);
	// let result = await DbConnection.runQuery(query);
}

async function addReimbursementTransaction(employeeId, flexCutOffId) {
	let sql =
		"INSERT INTO flex_reimbursement (employee_id, flex_cut_off_id) VALUES (?, ?);";
	let inserts = [employeeId, flexCutOffId];
	let query = mysql.format(sql, inserts);
	return await DbConnection.runQuery(query);
}

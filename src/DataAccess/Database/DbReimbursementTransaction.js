const DbConnection = require("./DbConnection");
const mysql = require("mysql");
const ReimbursementTransactionModel = require("../../Models/ReimbursementTransactionModel");

let DbReimbursementTransaction = {
	add,
	getLatestDraftByEmail,
	updateAmountOnTransactionId,
};

module.exports = DbReimbursementTransaction;

async function add(employeeId, flexCutOffId) {
	let sql =
		"INSERT INTO flex_reimbursement (employee_id, flex_cut_off_id) VALUES (?, ?);";
	let inserts = [employeeId, flexCutOffId];
	let query = mysql.format(sql, inserts);
	return await DbConnection.runQuery(query);
}

async function getLatestDraftByEmail(email) {
	let sql = `SELECT flex_reimbursement.*
            FROM flex_reimbursement
            LEFT JOIN employees
            ON employees.employee_id = flex_reimbursement.employee_id
            WHERE flex_reimbursement.status = 'draft'
            AND employees.email = ?;`;
	let inserts = [email];
	let query = mysql.format(sql, inserts);
	let singleResultArr = await DbConnection.runQuery(query);

	let reimbTrans;
	if (singleResultArr.length === 1) {
		reimbTrans = new ReimbursementTransactionModel();

		reimbTrans.FlexReimbursementId =
			singleResultArr[0].flex_reimbursement_id;
		reimbTrans.EmployeeId = singleResultArr[0].employee_id;
		reimbTrans.FlexCutoffId = singleResultArr[0].flex_cut_off_id;
		reimbTrans.TotalReimbursementAmount =
			singleResultArr[0].total_reimbursement_amount;
		reimbTrans.DateSubmitted = singleResultArr[0].date_submitted;
		reimbTrans.Status = singleResultArr[0].status;
		reimbTrans.DateUpdated = singleResultArr[0].date_updated;
		reimbTrans.TransactionNumber = singleResultArr[0].transaction_number;
	}
	return reimbTrans;
}

async function updateAmountOnTransactionId(reimTransId, newAmount) {
	let sql =
		"UPDATE flex_reimbursement SET total_reimbursement_amount = ? WHERE flex_reimbursement_id = ?";
	let inserts = [newAmount, reimTransId];
	let query = mysql.format(sql, inserts);
	await DbConnection.runQuery(query);
}

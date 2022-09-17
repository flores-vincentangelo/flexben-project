const DbConnection = require("./DbConnection");
const mysql = require("mysql");
const ReimbursementTransactionModel = require("../../Models/ReimbursementTransactionModel");

let DbReimbursementTransaction = {
	addReimbursementTransaction,
	getLatestDraftReimbursementTransactionByEmail,
};

module.exports = DbReimbursementTransaction;

async function addReimbursementTransaction(employeeId, flexCutOffId) {
	let sql =
		"INSERT INTO flex_reimbursement (employee_id, flex_cut_off_id) VALUES (?, ?);";
	let inserts = [employeeId, flexCutOffId];
	let query = mysql.format(sql, inserts);
	return await DbConnection.runQuery(query);
}

async function getLatestDraftReimbursementTransactionByEmail(email) {
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

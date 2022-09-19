const DbConnection = require("./DbConnection");
const mysql = require("mysql");
const ReimbursementTransactionModel = require("../../Models/ReimbursementTransactionModel");
const EmployeeModel = require("../../Models/EmployeeModel");

let DbReimbursementTransaction = {
	add,
	getLatestDraftByEmail,
	updateAmountOnTransactionId,
	updateTransactionNumberAndStatusOnTransactionId,
	getByCutoffId,
	getByTransactionId,
	searchTransactionByEmployeeIdName,
	updateStatusToApprovedOnTransactionId,
	updateStatusToRejectedOnTransactionId,
	getByTransactionNumber,
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

async function updateTransactionNumberAndStatusOnTransactionId(reimbTrans) {
	let sql = `UPDATE flex_reimbursement
	SET status = 'Submitted', date_submitted = CURRENT_DATE,  transaction_number = ?
    WHERE flex_reimbursement_id = ?;`;
	let inserts = [
		reimbTrans.TransactionNumber,
		reimbTrans.FlexReimbursementId,
	];
	let query = mysql.format(sql, inserts);
	return await DbConnection.runQuery(query);
}

async function getByCutoffId(cutoffId) {
	let sql = `SELECT flex_reimbursement .*, employees.firstname, employees.lastName, employees.employee_number 
        FROM flex_reimbursement 
        LEFT JOIN employees
        ON flex_reimbursement.employee_id = employees.employee_id
        WHERE flex_cut_off_id = ? 
        AND status = "submitted"
        ORDER BY status DESC;`;
	let inserts = [cutoffId];
	let query = mysql.format(sql, inserts);
	let resultsArr = await DbConnection.runQuery(query);

	let transactionAndEmployeeArr = [];
	resultsArr.forEach(element => {
		let reimbTrans = new ReimbursementTransactionModel();
		let employee = new EmployeeModel();

		reimbTrans.FlexReimbursementId = element.flex_reimbursement_id;
		reimbTrans.EmployeeId = element.employee_id;
		reimbTrans.FlexCutoffId = element.flex_cut_off_id;
		reimbTrans.TotalReimbursementAmount =
			element.total_reimbursement_amount;
		reimbTrans.DateSubmitted = element.date_submitted;
		reimbTrans.Status = element.status;
		reimbTrans.DateUpdated = element.date_updated;
		reimbTrans.TransactionNumber = element.transaction_number;
		employee.EmployeeNumber = element.employee_number;
		employee.FirstName = element.firstname;
		employee.LastName = element.lastName;
		let customObj = { ...reimbTrans, ...employee };
		transactionAndEmployeeArr.push(customObj);
	});

	return transactionAndEmployeeArr;
}

async function getByTransactionId(reimbTransId) {
	let sql = `SELECT flex_reimbursement .*, employees.firstname, employees.lastName, employees.employee_number 
        FROM flex_reimbursement 
        LEFT JOIN employees
        ON flex_reimbursement.employee_id = employees.employee_id
        WHERE flex_reimbursement_id = ?;`;
	let inserts = [reimbTransId];
	let query = mysql.format(sql, inserts);
	let singleResultArr = await DbConnection.runQuery(query);

	let transactionAndEmployee;
	if (singleResultArr.length === 1) {
		let reimbTrans = new ReimbursementTransactionModel();
		let employee = new EmployeeModel();

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
		employee.EmployeeNumber = singleResultArr[0].employee_number;
		employee.FirstName = singleResultArr[0].firstname;
		employee.LastName = singleResultArr[0].lastName;
		transactionAndEmployee = { ...reimbTrans, ...employee };
	}

	return transactionAndEmployee;
}

async function searchTransactionByEmployeeIdName(
	empNumber,
	empLastname,
	empFirstname
) {
	let sql = `SELECT flex_reimbursement .*, employees.firstname, employees.lastName, employees.employee_number 
    FROM flex_reimbursement
    LEFT JOIN employees
    ON flex_reimbursement.employee_id = employees.employee_id
    WHERE employees.employee_number LIKE ?
    AND employees.firstname LIKE ?
    AND employees.lastname LIKE ?
    AND flex_reimbursement.status = 'submitted';`;
	let inserts = [
		"%" + empNumber + "%",
		"%" + empFirstname + "%",
		"%" + empLastname + "%",
	];
	let query = mysql.format(sql, inserts);
	let resultsArr = await DbConnection.runQuery(query);

	let transactionAndEmployeeArr = [];
	if (resultsArr.length != 0) {
		resultsArr.forEach(element => {
			let reimbTrans = new ReimbursementTransactionModel();
			let employee = new EmployeeModel();

			reimbTrans.FlexReimbursementId = element.flex_reimbursement_id;
			reimbTrans.EmployeeId = element.employee_id;
			reimbTrans.FlexCutoffId = element.flex_cut_off_id;
			reimbTrans.TotalReimbursementAmount =
				element.total_reimbursement_amount;
			reimbTrans.DateSubmitted = element.date_submitted;
			reimbTrans.Status = element.status;
			reimbTrans.DateUpdated = element.date_updated;
			reimbTrans.TransactionNumber = element.transaction_number;
			employee.EmployeeNumber = element.employee_number;
			employee.FirstName = element.firstname;
			employee.LastName = element.lastName;
			let customObj = { ...reimbTrans, ...employee };
			transactionAndEmployeeArr.push(customObj);
		});
	}
	return transactionAndEmployeeArr;
}

async function getByTransactionNumber(transactionNumber) {
	let sql = `SELECT flex_reimbursement.*, employees.firstname, employees.lastName, employees.employee_number, employees.email 
            FROM flex_reimbursement
            LEFT JOIN employees
            ON flex_reimbursement.employee_id = employees.employee_id
            WHERE flex_reimbursement.status = 'submitted'
            AND transaction_number = ?;`;
	let inserts = [transactionNumber];
	let query = mysql.format(sql, inserts);
	let singleResultArr = await DbConnection.runQuery(query);

	let transactionAndEmployee;
	if (singleResultArr.length === 1) {
		let reimbTrans = new ReimbursementTransactionModel();
		let employee = new EmployeeModel();

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
		employee.EmployeeNumber = singleResultArr[0].employee_number;
		employee.FirstName = singleResultArr[0].firstname;
		employee.LastName = singleResultArr[0].lastName;
		employee.Email = singleResultArr[0].email;
		transactionAndEmployee = { ...reimbTrans, ...employee };
	}

	return transactionAndEmployee;
}

async function updateStatusToApprovedOnTransactionId(transactionNumber) {
	let sql = `UPDATE flex_reimbursement
    SET status = 'Approved'
    WHERE transaction_number = ?
    AND status = 'Submitted';`;
	let inserts = [transactionNumber];
	let query = mysql.format(sql, inserts);
	return await DbConnection.runQuery(query);
}
async function updateStatusToRejectedOnTransactionId(transactionNumber) {
	let sql = `UPDATE flex_reimbursement
    SET status = 'Rejected'
    WHERE transaction_number = ?
    AND status = 'Submitted';`;
	let inserts = [transactionNumber];
	let query = mysql.format(sql, inserts);
	return await DbConnection.runQuery(query);
}

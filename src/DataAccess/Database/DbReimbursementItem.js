const DbConnection = require("./DbConnection");
const mysql = require("mysql");
const ReimbursementItemModel = require("../../Models/ReimbursementItemModel");

let DbReimbursementItem = { file, getItemsByEmail };
module.exports = DbReimbursementItem;

async function file(reimbursementItem) {
	let sql = `INSERT INTO flex_reimbursement_details  
    (flex_reimbursement_id, or_number, name_of_establishment, tin_of_establishment, amount, category_id, date_added) 
    VALUES (?, ?, ?, ?, ?, ?, ?);`;

	let inserts = [
		reimbursementItem.ReimTransId,
		reimbursementItem.OrNumber,
		reimbursementItem.NameEstablishment,
		reimbursementItem.TinEstablishment,
		reimbursementItem.Amount,
		reimbursementItem.CategoryId,
		reimbursementItem.Date,
	];
	let query = mysql.format(sql, inserts);
	await DbConnection.runQuery(query);
}

async function getItemsByEmail(email) {
	let sql = `SELECT flex_reimbursement_details.* FROM flex_reimbursement_details
    LEFT JOIN flex_reimbursement
    ON flex_reimbursement_details.flex_reimbursement_id = flex_reimbursement.flex_reimbursement_id
    LEFT JOIN employees
    ON flex_reimbursement.employee_id = employees.employee_id
    WHERE employees.email = ?;`;

	let inserts = [email];
	let query = mysql.format(sql, inserts);
	let resultsArr = await DbConnection.runQuery(query);

	let reimItemsArr = [];
	resultsArr.forEach(element => {
		let reimItem = new ReimbursementItemModel();
		reimItem.ReimItemId = element.flex_reimbursement_detail_id;
		reimItem.ReimTransId = element.flex_reimbursement_id;
		reimItem.OrNumber = element.or_number;
		reimItem.NameEstablishment = element.name_of_establishment;
		reimItem.TinEstablishment = element.tin_of_establishment;
		reimItem.Amount = element.amount;
		reimItem.CategoryId = element.category_id;
		reimItem.Status = element.status;
		reimItem.Date = element.date_added;
		reimItemsArr.push(reimItem);
	});

	return reimItemsArr;
}

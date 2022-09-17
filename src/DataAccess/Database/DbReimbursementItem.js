const DbConnection = require("./DbConnection");
const mysql = require("mysql");

let DbReimbursementItem = { file };
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
	// let sql = `SELECT * FROM `
}

const DbConnection = require("./DbConnection");
const mysql = require("mysql");

let DbReimbursementItem = { file };
module.exports = DbReimbursementItem;

async function file(reimTransId, reimbursementItem) {
	let sql = `INSERT INTO flex_reimbursement_details  
    (flex_reimbursement_id, or_number, name_of_establishment, tin_of_establishment, amount, category_id, date_added) 
    VALUES (?, ?, ?, ?, ?, ?, ?);`;

	let inserts = [
		reimTransId,
		reimbursementItem.OrNumber,
		reimbursementItem.NameEstablishment,
		reimbursementItem.TinEstablishment,
		reimbursementItem.Amount,
		reimbursementItem.Category,
		reimbursementItem.Date,
	];
	let query = mysql.format(sql, inserts);
	console.log(query);
	// let result = await DbConnection.runQuery(query);
}

const DbConnection = require("./DbConnection");
const mysql = require("mysql");
const ReimbursementModel = require("../../Models/ReimbursementModel");

let DbReimbursementItem = { fileReimbursementItem };
module.exports = DbReimbursementItem;

async function fileReimbursementItem(reimbursementItem) {
	let sql = `
    insert 
    etc etc`;
	let inserts = [];
	let query = mysql.format(sql, inserts);
	let result = await DbConnection.runQuery(query);
}

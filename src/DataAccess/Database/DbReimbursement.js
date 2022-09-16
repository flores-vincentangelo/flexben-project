const DbConnection = require("./DbConnection");
const ReimbursementModel = require("../../Models/ReimbursementModel");

let DbReimbursement = {};
module.exports = DbReimbursement;

async function fileReimbursementItem(reimbursementItem) {
	let sql = `
    insert 
    etc etc`;
	let inserts = [];
	let query = mysql.format(sql, inserts);
	// let result = await DbConnection.runQuery(query);
}

async function getReimbursementTransactionsByEmail(email) {
	let sql = `
    insert 
    etc etc`;
	let inserts = [];
	let query = mysql.format(sql, inserts);
	// let result = await DbConnection.runQuery(query);
}

async function createReimbursementTransactionByEmail(email) {}

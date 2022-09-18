const DbConnection = require("./DbConnection");
const mysql = require("mysql");
const ReimbursementItemModel = require("../../Models/ReimbursementItemModel");

let DbReimbursementItem = {
	file,
	getItemsByReimbTransId,
	getItemByItemIdAndTransactionId,
	deleteItemByItemIdAndTransactionId,
	updateStatusToSubmittedOnTransactionId,
};
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

async function getItemsByReimbTransId(reimbTransId) {
	let sql = `SELECT * FROM flex_reimbursement_details
    WHERE flex_reimbursement_id = ?
    AND deleted = 'n';`;

	let inserts = [reimbTransId];
	let query = mysql.format(sql, inserts);
	let resultsArr = await DbConnection.runQuery(query);

	let reimbItemsArr = [];
	resultsArr.forEach(element => {
		let reimbItem = new ReimbursementItemModel();
		reimbItem.ReimItemId = element.flex_reimbursement_detail_id;
		reimbItem.ReimTransId = element.flex_reimbursement_id;
		reimbItem.OrNumber = element.or_number;
		reimbItem.NameEstablishment = element.name_of_establishment;
		reimbItem.TinEstablishment = element.tin_of_establishment;
		reimbItem.Amount = element.amount;
		reimbItem.CategoryId = element.category_id;
		reimbItem.Status = element.status;
		reimbItem.Date = element.date_added;
		reimbItemsArr.push(reimbItem);
	});

	return reimbItemsArr;
}

async function getItemByItemIdAndTransactionId(itemId, transactionId) {
	let sql = `SELECT * 
        FROM flex_reimbursement_details 
        WHERE flex_reimbursement_detail_id = ?
        AND flex_reimbursement_id = ?
        AND deleted = 'n';`;
	let inserts = [itemId, transactionId];
	let query = mysql.format(sql, inserts);
	let singleResultArr = await DbConnection.runQuery(query);

	let reimbItem;
	if (singleResultArr.length === 1) {
		reimbItem = new ReimbursementItemModel();
		reimbItem.ReimItemId = singleResultArr[0].flex_reimbursement_detail_id;
		reimbItem.ReimTransId = singleResultArr[0].flex_reimbursement_id;
		reimbItem.OrNumber = singleResultArr[0].or_number;
		reimbItem.NameEstablishment = singleResultArr[0].name_of_establishment;
		reimbItem.TinEstablishment = singleResultArr[0].tin_of_establishment;
		reimbItem.Amount = singleResultArr[0].amount;
		reimbItem.CategoryId = singleResultArr[0].category_id;
		reimbItem.Status = singleResultArr[0].status;
		reimbItem.Date = singleResultArr[0].date_added;
	}

	return reimbItem;
}

async function deleteItemByItemIdAndTransactionId(itemId, transactionId) {
	let sql = `UPDATE flex_reimbursement_details 
        SET deleted = 'y'
        WHERE flex_reimbursement_detail_id = ?
        AND flex_reimbursement_id = ?
        AND status = 'draft'
        AND deleted = 'n';`;
	let inserts = [itemId, transactionId];
	let query = mysql.format(sql, inserts);
	return await DbConnection.runQuery(query);
}

async function updateStatusToSubmittedOnTransactionId(reimbTransId) {
	let sql = `UPDATE flex_reimbursement_details
	SET status = 'Submitted'
    WHERE flex_reimbursement_id = ?
    AND deleted = 'n';`;
	let inserts = [reimbTransId];
	let query = mysql.format(sql, inserts);
	return await DbConnection.runQuery(query);
}

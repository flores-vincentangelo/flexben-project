const DbConnection = require("./DbConnection");
const mysql = require("mysql");
const FlexCycleCutoffModel = require("../../Models/FlexCycleCutoffModel");

let DbFlexCycleCutoff = {};
module.exports = DbFlexCycleCutoff;

async function getLatestFlexCycle() {
	let sql = ``;
	let inserts = [];
	let query = mysql.format(sql, inserts);
	// let result = await DbConnection.runQuery(query);
}

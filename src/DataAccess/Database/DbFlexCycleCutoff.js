const DbConnection = require("./DbConnection");
const mysql = require("mysql");
const FlexCycleCutoffModel = require("../../Models/FlexCycleCutoffModel");

let DbFlexCycleCutoff = { getLatestFlexCycle };
module.exports = DbFlexCycleCutoff;

async function getLatestFlexCycle() {
	let sql = `
    SELECT 
    *
    FROM
        flex_cycle_cutoffs
    WHERE
        flex_cutoff_id = (SELECT 
                MAX(flex_cutoff_id)
            FROM
                flex_cycle_cutoffs
            WHERE
                is_active = 'y');`;
	let inserts = [];
	let query = mysql.format(sql, inserts);
	let singleResultArr = await DbConnection.runQuery(query);

	let flexCycleCutoff;
	if (singleResultArr.length === 1) {
		flexCycleCutoff = new FlexCycleCutoffModel();
		flexCycleCutoff.FlexCutoffId = singleResultArr[0].flex_cutoff_id;
		flexCycleCutoff.StartDate = singleResultArr[0].start_date;
		flexCycleCutoff.EndDate = singleResultArr[0].end_date;
		flexCycleCutoff.IsActive = singleResultArr[0].is_active;
		flexCycleCutoff.FlexCycleId = singleResultArr[0].flex_cycle_id;
		flexCycleCutoff.CutoffCapAmount = singleResultArr[0].cut_off_cap_amount;
		flexCycleCutoff.CutoffDescription =
			singleResultArr[0].cut_off_description;
	}
	return flexCycleCutoff;
}

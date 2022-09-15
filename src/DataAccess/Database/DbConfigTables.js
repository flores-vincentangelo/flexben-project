// var mysql = require("mysql");
const DbConnection = require("./DbConnection");

let DbConfigTables = { setupTables };
module.exports = DbConfigTables;

async function setupTables() {
	await dropTable("accounts");
	await setupAccountsTable();
	await dropTable("categories");
	await setupCategoriesTable();
	await dropTable("companies");
	await setupCompaniesTable();
	await dropTable("employees");
	await setupEmployeesTable();
	await dropTable("roles");
	await setupRolesTable();
	await dropTable("flex_cycle_cutoffs");
	await setupFlexCycleCutoffsTable();
	await dropTable("flex_reimbursement");
	await setupFlexReimbursementTable();
	await dropTable("flex_reimbursement_details");
	await setupFlexReimbursementDetailsTable();
}

async function dropTable(tableName) {
	let query = `DROP TABLE IF EXISTS ${tableName};`;
	return await DbConnection.runQuery(query);
}

async function setupAccountsTable() {
	let query = `CREATE TABLE accounts (
    account_id SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
    employee_id MEDIUMINT UNSIGNED,
    password VARCHAR(255),
    is_active CHAR,
    date_updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (account_id)
	)ENGINE=InnoDB DEFAULT CHARSET=utf8;`;
	return await DbConnection.runQuery(query);
}

async function setupCategoriesTable() {
	var query = `CREATE TABLE categories (
        category_id SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
        code VARCHAR(255),
        name VARCHAR(255),
        description TEXT,
        date_added TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        added_by VARCHAR(255) DEFAULT 'SYSTEM',
        updated_date  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        updated_by VARCHAR(255) DEFAULT 'SYSTEM',
        PRIMARY KEY (category_id))ENGINE=InnoDB DEFAULT CHARSET=utf8;`;
	return await DbConnection.runQuery(query);
}
async function setupCompaniesTable() {
	var query = `CREATE TABLE companies (
        company_id SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
        code VARCHAR(255),
        name VARCHAR(255),
        description TEXT,
        logo VARCHAR(255),
        PRIMARY KEY (company_id)
    )ENGINE=InnoDB DEFAULT CHARSET=utf8;`;
	return await DbConnection.runQuery(query);
}
async function setupEmployeesTable() {
	var query = `CREATE TABLE employees (

        employee_id SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
        employee_number MEDIUMINT UNSIGNED,
        firstname VARCHAR(255),
        lastname VARCHAR(255),
        email VARCHAR(255),
        is_active CHAR,
        date_added TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        company_id SMALLINT UNSIGNED,
        role_id SMALLINT UNSIGNED,
        PRIMARY KEY (employee_id)
    )ENGINE=InnoDB DEFAULT CHARSET=utf8;`;
	return await DbConnection.runQuery(query);
}
async function setupFlexCycleCutoffsTable() {
	var query = `CREATE TABLE flex_cycle_cutoffs (

        flex_cutoff_id SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
        start_date DATE,
        end_date DATE,
        is_active CHAR,
        flex_cycle_id SMALLINT UNSIGNED,
        cut_off_cap_amount MEDIUMINT UNSIGNED,
        cut_off_description VARCHAR(255),
        PRIMARY KEY (flex_cutoff_id)
    )ENGINE=InnoDB DEFAULT CHARSET=utf8;`;
	return await DbConnection.runQuery(query);
}
async function setupFlexReimbursementTable() {
	var query = `CREATE TABLE flex_reimbursement (

        flex_reimbursement_id SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
        employee_id MEDIUMINT UNSIGNED,
        flex_cut_off_id SMALLINT UNSIGNED,
        total_reimbursement_amount MEDIUMINT UNSIGNED,
        date_submitted DATE,
        status VARCHAR(255),
        date_updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        transaction_number VARCHAR(255),
        PRIMARY KEY (flex_reimbursement_id)
    )ENGINE=InnoDB DEFAULT CHARSET=utf8;`;
	return await DbConnection.runQuery(query);
}
async function setupFlexReimbursementDetailsTable() {
	var query = `CREATE TABLE flex_reimbursement_details (

        flex_reimbursement_detail_id SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
        flex_reimbursement_id SMALLINT UNSIGNED, 
        or_number MEDIUMINT UNSIGNED,
        name_of_establishment VARCHAR(255),
        tin_of_establishment VARCHAR(255),
        amount MEDIUMINT UNSIGNED,
        category_id SMALLINT UNSIGNED,
        status VARCHAR(255),
        date_added TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (flex_reimbursement_detail_id)
    )ENGINE=InnoDB DEFAULT CHARSET=utf8;`;
	return await DbConnection.runQuery(query);
}
async function setupRolesTable() {
	var query = `CREATE TABLE roles (

        role_id SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
        name VARCHAR(255),
        description VARCHAR(255),
        PRIMARY KEY(role_id)

    )ENGINE=InnoDB DEFAULT CHARSET=utf8;`;
	return await DbConnection.runQuery(query);
}

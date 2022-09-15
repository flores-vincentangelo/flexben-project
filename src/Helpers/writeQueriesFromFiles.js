let fsPromise = require("node:fs/promises");
const Category = require("../Models/Category");
const Employee = require("../Models/Employee");

// makeEmployeesQuery();
// makeCategoriesQuery();

async function makeEmployeesQuery() {
	let filenameInputEmployees =
		"../../references/txt-db-tables-flex/employees.txt";
	let filenameOutput = "../logs/queries/employees.txt";
	let employeeArr = [];
	let dataLineArr = await parseDataFromFile(filenameInputEmployees);
	dataLineArr.forEach(dataLine => {
		let dataPointArr = dataLine.split("|");
		let employee = new Employee();
		employee.EmployeeId = parseInt(dataPointArr[0]);
		employee.EmployeeNumber = parseInt(dataPointArr[1]);
		employee.FirstName = dataPointArr[2];
		employee.LastName = dataPointArr[3];
		employee.Email = dataPointArr[4];
		employee.IsActive = dataPointArr[5];
		employee.DateAdded = dataPointArr[6];
		employee.CompanyId = parseInt(dataPointArr[7]);
		employee.RoleId = parseInt(dataPointArr[8]);
		employeeArr.push(employee);
	});

	let valueClauseArr = [];
	employeeArr.forEach(employee => {
		let formattedValue = `(${employee.EmployeeNumber}, '${employee.FirstName}', '${employee.LastName}', '${employee.Email}', '${employee.IsActive}', '${employee.DateAdded}', ${employee.CompanyId}, ${employee.RoleId})`;
		valueClauseArr.push(formattedValue);
	});

	let finalQuery = `INSERT INTO employees (employee_number,firstname,lastname,email,is_active,date_added,company_id,role_id) VALUES ${valueClauseArr.join(
		","
	)}`;

	writeToFile(finalQuery, filenameOutput);
}

async function makeCategoriesQuery() {
	let { filenameInput, filenameOutput } = returnFilePaths("categories.txt");
	let categoryArr = [];
	let dataLineArr = await parseDataFromFile(filenameInput);
	dataLineArr.forEach(dataLine => {
		let dataPointArr = dataLine.split("|");
		let category = new Category();
		category.CategoryId = parseInt(dataPointArr[0]);
		category.Code = dataPointArr[1];
		category.Name = dataPointArr[2];
		category.Description = dataPointArr[3];
		category.DateAdded = dataPointArr[4];
		category.AddedBy = dataPointArr[5];
		categoryArr.push(category);
	});

	let valueClauseArr = [];
	categoryArr.forEach(category => {
		let formattedValue = `("${category.Code}", 
            "${category.Name}", 
            "${category.Description}")`;
		valueClauseArr.push(formattedValue);
	});
	let finalQuery = `INSERT INTO categories (code,name,description) VALUES ${valueClauseArr.join(
		","
	)}`;

	writeToFile(finalQuery, filenameOutput);
}

async function writeToFile(data, filename) {
	try {
		fsPromise.writeFile(filename, data, {
			encoding: "utf8",
			flag: "w+",
		});
	} catch (error) {
		console.error(error);
	}
}

async function parseDataFromFile(filename) {
	try {
		let data = await fsPromise.readFile(filename, {
			encoding: "utf8",
		});

		let dataLineArr = data.split("\n");
		dataLineArr.splice(0, 1);
		dataLineArr.splice(dataLineArr.length - 1, 1);
		return dataLineArr;
	} catch (error) {
		console.error(error);
	}
}

function returnFilePaths(filename) {
	let filenameInput = `../../references/txt-db-tables-flex/${filename}`;
	let filenameOutput = `../logs/queries/${filename}`;
	return {
		filenameInput,
		filenameOutput,
	};
}

let fsProimse = require("node:fs/promises");

let FileReimbursementTransaction = { print };
module.exports = FileReimbursementTransaction;

async function print(transaction, reimbItemsArr, categories) {
	// "reimbursement_balasabas_johncarlos_08282018_PWINNOV-2-20180828-1.txt"
	let transactionLastname = transaction.LastName.toLowerCase();
	let transactionFirstname = transaction.FirstName.toLowerCase().replace(
		" ",
		""
	);
	let date = formatDateNumbers(transaction.DateSubmitted);
	let filename = `reimbursement_${transactionLastname}_${transactionFirstname}_${date}_${transaction.TransactionNumber}.txt`;

	let toWrite = `Employee Name:   ${transaction.LastName}, ${transaction.FirstName}\n`;
	toWrite += `Employee Number:	${transaction.EmployeeNumber}\n`;
	toWrite += `Date Submitted:		${formatDateFull(transaction.DateSubmitted)}\n`;
	toWrite += `Transaction Number: ${transaction.TransactionNumber}\n`;
	toWrite += `Amount:	Php ${transaction.TotalReimbursementAmount.toFixed(
		2
	)}\n`;
	toWrite += "Status:	Submitted\n\n";
	toWrite += "=== DETAILS ===\n";

	try {
		categories.forEach(category => {
			toWrite += `CATEGORY: ${category.Name}\n`;
			let count = 1;
			let hasNoItemInCategory = true;
			reimbItemsArr.forEach(reimbItem => {
				if (reimbItem.CategoryId == category.CategoryId) {
					hasNoItemInCategory = false;
					toWrite += `Item # ${count}\n`;
					count++;
					toWrite += `Date: ${formatDateFull(reimbItem.Date)}\n`;
					toWrite += `OR Number: ${reimbItem.OrNumber}\n`;
					toWrite += `Name of Establishment: ${reimbItem.NameEstablishment}\n`;
					toWrite += `TIN of Establishment: ${reimbItem.TinEstablishment}\n`;
					toWrite += `Amount: Php ${reimbItem.Amount.toFixed(2)}\n`;
					toWrite += "Status: Submitted\n\n";
				}
			});

			if (hasNoItemInCategory) {
				toWrite += "N/A\n\n";
			}
		});

		fsProimse.writeFile(filename, toWrite, {
			encoding: "utf8",
			flag: "w+",
		});
	} catch (error) {
		console.error(error);
		throw error;
	}
}

function formatDateNumbers(dateStrToFormat) {
	let date = new Date(dateStrToFormat);
	let year = date.getFullYear();
	let month = (date.getMonth() + 1).toString().padStart(2, "0");
	let dateDay = date.getDate();
	return `${month}${dateDay}${year}`;
}

function formatDateFull(dateStrToFormat) {
	const monthWords = [
		"January",
		"February",
		"March",
		"April",
		"May",
		"June",
		"July",
		"August",
		"September",
		"October",
		"November",
		"December",
	];
	let date = new Date(dateStrToFormat);
	let year = date.getFullYear();
	let month = date.getMonth();
	let dateDay = date.getDate();
	return `${monthWords[month]} ${dateDay}, ${year}`;
}

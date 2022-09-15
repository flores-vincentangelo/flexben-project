let fsPromise = require("node:fs/promises");
const FILE_NAME = "./src/logs/log.txt";

let erroLog = {
	writeToFile,
};

async function writeToFile(data) {
	let toWrite = "*".repeat(80) + "\r\n";
	toWrite += `Date/Time: ${new Date().toLocaleDateString()} \r\n`;
	toWrite += `Exception Info: ${JSON.stringify(data)} \r\n`;
	toWrite += "*".repeat(80) + "\r\n";

	try {
		fsPromise.writeFile(FILE_NAME, toWrite, {
			encoding: "utf8",
			flag: "w+",
		});
	} catch (error) {
		console.error(error);
	}
}

module.exports = erroLog;

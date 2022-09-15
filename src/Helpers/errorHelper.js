const errorLog = require("../DataAccess/Files/errorLog");

let errorHelpers = {
	logErrorsToConsole,
	logErrorsToFile,
	clientErrorHandler,
	errorHandler,
	errorBuilder,
};

module.exports = errorHelpers;

function logErrorsToConsole(err, req, res, next) {
	console.error(
		`Log Entry: ${JSON.stringify(errorHelpers.errorBuilder(err))}`
	);
	console.error("*".repeat(80));
	next(err);
}

function logErrorsToFile(err, req, res, next) {
	let errorObject = errorHelpers.errorBuilder(err);

	errorObject.requestInfo = {
		hostname: req.hostname,
		path: req.path,
		app: req.app,
	};

	errorLog.writeToFile(errorObject);
	next(err);
}

function clientErrorHandler(err, req, res, next) {
	if (req.xhr) {
		res.status(500).json({
			status: 500,
			statusText: "Internal Server Error",
			message: "XMLHttpRequest error",
			error: {
				errno: 0,
				call: "XMLHttpRequest Call",
				code: "INTERNAL_SERVER_ERROR",
				message: "XMLHttpRequest error",
			},
		});
	} else {
		next(err);
	}
}

function errorHandler(err, req, res) {
	res.status(500).json(errorHelpers.errorBuilder(err));
}

function errorBuilder(err) {
	return {
		status: 500,
		statusText: "Internal Server Error",
		message: err.message,
		error: {
			errno: err.errno,
			call: err.syscall,
			code: "INTERNAL_SERVER_ERROR",
			message: err.message,
			//stack: err.stack,
		},
	};
}

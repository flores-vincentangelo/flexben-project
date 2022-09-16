let forbiddenResponse = {
	status: 403,
	statusText: "Forbidden",
	message: "Insufficient authorization to access data",
};

function conflictResponseBuilder(message) {
	return {
		status: 409,
		statusText: "Conflict",
		message: message,
	};
}

function unathorizedResponseBuilder(message) {
	return {
		status: 401,
		statusText: "Unauthorized",
		message: message,
	};
}

function noContentResponse(message) {
	return {
		status: 204,
		statusText: "No Content",
		message: message,
	};
}

function OkResponseBuilder(message) {
	return {
		status: 200,
		statusText: "OK",
		message: message,
	};
}

function notFoundBuilder(category, parameter, value) {
	let message = `The ${category} with ${parameter}: ${value} could not be found`;
	return {
		status: 404,
		statusText: "Not Found",
		message: message,
		error: {
			code: "NOT_FOUND",
			message: message,
		},
	};
}

function createdBuilder(message) {
	return {
		status: 201,
		statusText: "Created",
		message: message,
	};
}

let Responses = {
	forbiddenResponse,
	conflictResponseBuilder,
	unathorizedResponseBuilder,
	OkResponseBuilder,
	notFoundBuilder,
	noContentResponse,
	createdBuilder,
};

module.exports = Responses;

require("dotenv").config({ path: "./src/env/variables.env" });
let express = require("express");
const cookieParser = require("cookie-parser");
const errorHelper = require("./Helpers/errorHelper");
const jwtHelper = require("./Helpers/jwtHelper");

const ConfigRoutes = require("./Routes/ConfigRoutes");
const UserRoutes = require("./Routes/UserRoutes");
const EmployeeRoutes = require("./Routes/EmployeeRoutes");
const ReimbursementRoutes = require("./Routes/ReimbursementRoutes");

let app = express();

let router = express.Router();
app.use(express.json());
app.use(cookieParser());

// router.post("/register", UserRoutes.register);
router.post("/login", UserRoutes.login);
router.get("/logout", UserRoutes.logout);

router.get(
	"/employee-details",
	jwtHelper.verifyToken,
	EmployeeRoutes.getDetails
);

router.post(
	"/file-reimbursement",
	jwtHelper.verifyToken,
	ReimbursementRoutes.file
);
router.get(
	"/get-reimbursement-items",
	jwtHelper.verifyToken,
	ReimbursementRoutes.getLatestDraftReimbItems
);
router.delete(
	"/remove-reimbursement-item",
	jwtHelper.verifyToken,
	ReimbursementRoutes.deleteDraftReimbItem
);
router.get(
	"/create-reimbursement-transaction",
	jwtHelper.verifyToken,
	ReimbursementRoutes.createTransaction
);

//configure tables
router.get("/config/tables", ConfigRoutes.tables);

app.use("/api/", router);

app.use(errorHelper.logErrorsToConsole);
app.use(errorHelper.logErrorsToFile);
app.use(errorHelper.clientErrorHandler);
app.use(errorHelper.errorHandler);

app.listen(parseInt(process.env.SERVPORT), function () {
	console.log(
		`Node server is running on http://localhost:${process.env.SERVPORT}/api/`
	);
});

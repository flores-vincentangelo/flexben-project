require("dotenv").config({ path: "./src/env/variables.env" });
let express = require("express");
const cookieParser = require("cookie-parser");
const errorHelper = require("./Helpers/errorHelper");

let Config = require("./Routes/Config");

let app = express();

let router = express.Router();
app.use(express.json());
app.use(cookieParser());

//configure tables
router.get("/config/tables", Config.tables);

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

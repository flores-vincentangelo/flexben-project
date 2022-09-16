require("dotenv").config({ path: "./src/env/variables.env" });
let express = require("express");
const cookieParser = require("cookie-parser");
const errorHelper = require("./Helpers/errorHelper");

let ConfigRoutes = require("./Routes/ConfigRoutes");
let UserRoutes = require("./Routes/UserRoutes");

let app = express();

let router = express.Router();
app.use(express.json());
app.use(cookieParser());

// router.post("/register", UserRoutes.register);
router.post("/login", UserRoutes.login);
router.get("/logout", UserRoutes.logout);

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

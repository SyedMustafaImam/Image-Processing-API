"use strict";

import * as dotenv from "dotenv";
dotenv.config();

import * as fs from "fs";
import * as express from "express";
import * as debug from "debug";
import * as helmet from "helmet";
import * as morgan from "morgan";
import * as engines from "consolidate"

import routes from "./routes/routes";

const log = debug("app:main");
const httpLog = debug("app:endpoint");
const app = express();
const APP_PORT: Number|String = process.env.APP_PORT || 3030;
let server: express.Application;


log("Main dependencies loaded");


if (process.env.LOCAL_HTTPS) {
	server = require("https").createServer({
		"key": fs.readFileSync("./root/certificates/local/localhost-privkey.pem"),
		"cert": fs.readFileSync("./root/certificates/local/localhost-cert.pem"),
		"rejectUnauthorized": false
	}, app);
} else {
	server = require("http").createServer(app);
}

if (httpLog.enabled) {
	app.use(
		morgan(
			"combined",
			{
				"stream": {
					"write": msg => httpLog(msg.trimEnd())
				}
			}
		)
	);
}

app.engine("html", engines.ejs);
app.set("view engine", "ejs");
app.set("views", __dirname + "/client");

app.use(express.urlencoded({
	"extended": true,
	"limit": "3mb"
}));

app.use(express.json({"limit": "3mb"}));

app.use(helmet({
	"contentSecurityPolicy": false
}));

app.use("/docs/api", express.static("./docs/api/swagger-ui-dist"));
app.use("/docs/js", express.static("./docs/js"));

log("Express' plugins loaded");


server.listen(APP_PORT, () => {

	routes(app);
	return log(process.env.LOCAL_HTTPS ?
		`HTTPS Server up and running at https://localhost:${APP_PORT}` :
		`HTTP Server up and running at port ${APP_PORT}`
	);

});

export default server;

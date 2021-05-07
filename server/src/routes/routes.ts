"use strict";


import * as swaggerJSDoc from "swagger-jsdoc";
import * as JSDocOptions from "../../../root/swaggerJSDocs";
import * as url from "url";

import imagesHandler from "./partials/imagesHandler";


export default function (app) {

	app.use("/api/image", imagesHandler);

	app.get("/", (req, res) => {

		return res.redirect(
			url.format(
				{
					"pathname": "/api/image",
					"query": {
						"imageId": req.query.imageId || "",
						"width": req.query.width || "",
						"height": req.query.height || ""
					}
				}
			)
		);
	});

	app.get("/api-docs.json", function(req, res) {
		res.setHeader("Content-Type", "application/json");
		res.send(swaggerJSDoc(JSDocOptions));
	});

	app.use((err, req, res, next) => {
		try {
			if (Object.prototype.hasOwnProperty.call(err, "status")) {
				return res.status(err.status || 500).send(err.message || err);
			} else {
				let parsedError = JSON.parse(err.message);
				return res.status(parsedError.status || 500).send(parsedError.message || err.message || "Unknown Error");
			}
		} catch (e) {
			return res.status(err.status || 500).send(err.message || err);
		}
	});

}
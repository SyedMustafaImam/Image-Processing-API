"use strict";

import {Request, Response} from "express";

export default {
	validateImageParams(req: Request, res: Response, next: Function) {

		let imageId: String;
		let width: Number;
		let height: Number;

		if (!req.query.imageId) {
			return res.status(400).send("Can't proceed without Image ID");
		} else {
			imageId = req.query.imageId as String;
		}

		if (req.query.width && Number(req.query.width) <= 0) {
			return res.status(400).send(`Invalid "width" value: ${req.query.width}`);
		} else {
			width = Number(req.query.width) as Number;
		}

		if (req.query.height && Number(req.query.height) <= 0) {
			return res.status(400).send(`Invalid "height" value: ${req.query.height}`);
		} else {
			height = Number(req.query.width) as Number;
		}

		res.locals.imageId = imageId;
		res.locals.width = width;
		res.locals.height = height;
		next();
	}
};
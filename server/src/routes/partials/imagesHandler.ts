"use strict";

import {Router} from "express";
import sharpImageTs from "../../helpers/sharpImage";
import validators from "../middlewares/imageParams"
const router = Router();

/**
 * @swagger
 * /api/image:
 *   get:
 *     tags: [Images]
 *     summary: Get JPG image as a stream
 *     produces:
 *       - image/jpeg
 *     parameters:
 *      - name: imageId
 *        in: query
 *        required: true
 *        description: The Image ID to search for.
 *        schema:
 *          type: string
 *      - name: width
 *        in: query
 *        required: false
 *        description: The image's custom width.
 *        schema:
 *          type: integer
 *      - name: height
 *        in: query
 *        required: false
 *        description: The image's custom height.
 *        schema:
 *          type: integer
 *     responses:
 *       200:
 *         description: An array containing all events that match the criteria
 *       401:
 *         description: Invalid API token
 *       403:
 *         description: Expired or denied API token
 *       500:
 *         description: Error handler
 */
router.get("/",
	validators.validateImageParams,
	async (req, res) => {
		try {
			const image = await sharpImageTs.init(res.locals.imageId, res.locals.width, res.locals.height);
			res.type("jpg").status(200);
			image.readImageStream().pipe(res);
		} catch (e) {
			return res.status(e.status || 500).send(e.message || e || "Unknown error");
		}
	}
);

export default router;
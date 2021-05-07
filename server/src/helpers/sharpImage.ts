"use strict";

import * as fs from "fs";
import * as fsAsync from "fs/promises";
import * as sharp from "sharp";
import * as Stream from "stream";

const FULL_IMAGES_PATH: string = "./images/full";
const PROCESSED_IMAGES_PATH: string = "./images/processed"


export interface SharpImage {
	imageId: number,
	width: number,
	height: number,
	isOriginal: boolean,
	getStockImagePath: Function,
	getImagePath: Function,
	readImageStream: Function,
	checkIfOriginalImageExists: Function,
	init: Function
}

export default {

	/**
	 *  @type {string}
	 */
	"imageId": "",

	/**
	 *  @type {number}
	 */
	"width": 0,

	/**
	 *  @type {number}
	 */
	"height": 0,

	/**
	 *  @type {boolean}
	 */
	"isOriginal": true,

	/**
	 * Calculates the stock image path based on a constant and image ID.
	 *
	 * @method getStockImagePath
	 * @return {string} - The stock image path.
	 */
	getStockImagePath(): string {
		return `${FULL_IMAGES_PATH}/${this.imageId}`;
	},

	/**
	 * Calculates the processed image path based on a constant, combination of width and height, and the image ID.
	 *
	 * @method getImagePath
	 * @return {string} - The processed image path.
	 */
	getImagePath(): string {
		return (this.isOriginal ?
			this.getStockImagePath() :
			`${PROCESSED_IMAGES_PATH}/${this.width}x${this.height}/${this.imageId}`
		);
	},

	/**
	 * .
	 *
	 * @method readImageStream
	 * @throws It will throw a `404 - Not found` error if the `imageId` could not be found within the target image folder.
	 * @return {Stream} - The image readable stream.
	 */
	readImageStream(): Stream {
		try {
			return fs.createReadStream(this.getImagePath());
		} catch (e) {
			throw new Error(JSON.stringify({
				"status": 404,
				"message": "Image not found."
			}));
		}
	},

	async checkIfOriginalImageExists(): Promise<boolean> {
		try {
			let fileData = await fsAsync.open(this.getStockImagePath(), "r");
			await fileData.close();
			return true;
		} catch (e) {
			return false;
		}
	},

	async checkIfTransformedImageExists(): Promise<boolean> {
		try {
			let fileData = await fsAsync.open(this.getImagePath(), "r");
			await fileData.close();
			return true;
		} catch (e) {
			return false;
		}
	},

	/**
	 * Create a Sharp Image instance based on a stock image and return the file instance.
	 * If the transformed image already exists, it will be served from cache instead.
	 *
	 * @constructor
	 * @method init
	 * @async
	 * @param {string} imageId - The image ID.
	 * @param {number} [width=0] - The image desired width.
	 * @param {number} [height=0] - The image desired height.
	 * @throws It will throw a `400 - Bad request` error if the `imageId` parameter is not available.
	 * @throws It will throw a `404 - Not found` error if the `imageId` could not be found within the stock image folder.
	 * @throws It will throw a `500 - Internal server` error if some processing issue happens.
	 * @return {SharpImage} - The constructed file representation.
	 */
	"init": async function Constructor(imageId: string, width: number = 0, height: number = 0): Promise<SharpImage> {
		if (!imageId) {
			throw new Error(JSON.stringify({
				"status": 400,
				"message": "Invalid image parameters."
			}));
		}

		this.imageId = imageId;
		this.width = width || 0;
		this.height = height || 0;
		this.isOriginal = this.width <= 0 || this.height <= 0;


		//1. Check if the target image is the original one
		if (this.isOriginal) {

			//2.1 Check if the original image exists
			let originalImageExists = await this.checkIfOriginalImageExists();

			if (!originalImageExists) {
				//2.2 If the original image doesn't exist an error is emitted
				throw new Error(JSON.stringify({
					"status": 404,
					"message": `Image ${this.imageId} not found.`
				}));
			}


		} else {

			//3.1 Check if the transformed image exists
			let transformedImageExists = await this.checkIfTransformedImageExists();

			if (!transformedImageExists) {

				//3.2 If the processed image doesn't exist we need to check if the original is available.
				let originalImageExists = await this.checkIfOriginalImageExists();

				if (originalImageExists) {
					//3.3 If the original image exists we can create the processed one from it.

					//3.4 Create the processed folder based on width x height. e.g:, `images/processed/100x100/`
					await fsAsync.mkdir(
						`${PROCESSED_IMAGES_PATH}/${this.width}x${this.height}`,
						{ "recursive": true }
					);

					//3.5 Create the file binary
					let fileData = await fsAsync.open(this.getImagePath(), "w");

					//3.6 Write image data to file
					await fileData.write(
						await sharp(
							this.getStockImagePath()
						).resize(
							width, height
						).toBuffer()
					);

					//3.7 Close file data to clean up the memory
					await fileData.close();
				} else {
					//3.8 If the original image doesn't exist an error is emitted
					throw new Error(JSON.stringify({
						"status": 404,
						"message": `Image ${this.imageId} not found.`
					}));
				}
			}

		}

		return this;

	}
}
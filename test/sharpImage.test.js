"use strict";

import sharpImage from "../server/dist/helpers/sharpImage";
import * as fs from "fs";

const VALID_FILES = ["fjord.jpg", "palmtunnel.jpg"];
const INVALID_FILES = ["test.jpg", "xxx.jpg"];
const CUSTOM_HEIGHT = 90;
const CUSTOM_WIDTH = 100;

beforeAll(done => {
	fs.rmdir("images/processed/", {"recursive": true}, (err) => {
		done(err);
	});
});

afterAll(done => {
	fs.rmdir("images/processed/", {"recursive": true}, (err) => {
		done(err);
	});
});

test("Helper package's attributes should be available", () => {
	expect(sharpImage.hasOwnProperty("imageId")).toBeTruthy();
	expect(sharpImage.hasOwnProperty("height")).toBeTruthy();
	expect(sharpImage.hasOwnProperty("isOriginal")).toBeTruthy();
});

test("Helper package's methods should be available", () => {
	expect(typeof sharpImage.init).toStrictEqual("function");
	expect(typeof sharpImage.getStockImagePath).toStrictEqual("function");
	expect(typeof sharpImage.getImagePath).toStrictEqual("function");
	expect(typeof sharpImage.readImageStream).toStrictEqual("function");
	expect(typeof sharpImage.checkIfOriginalImageExists).toStrictEqual("function");
	expect(typeof sharpImage.checkIfTransformedImageExists).toStrictEqual("function");
});

test("Creating a new image using original properties", async () => {
	let sharpImageObject = await sharpImage.init(VALID_FILES[0]);
	expect(sharpImageObject.imageId).toStrictEqual(VALID_FILES[0]);
	expect(sharpImageObject.width).toStrictEqual(0);
	expect(sharpImageObject.height).toStrictEqual(0);
});

test("Creating a new image using custom properties", async () => {

	expect(
		fs.existsSync(`images/full/${VALID_FILES[0]}`)
	).toBeTruthy();


	expect(
		fs.existsSync(`images/processed/${CUSTOM_WIDTH}x${CUSTOM_HEIGHT}/${VALID_FILES[0]}`)
	).toBeFalsy();


	let sharpImageObject = await sharpImage.init(VALID_FILES[0], CUSTOM_WIDTH, CUSTOM_HEIGHT);

	expect(sharpImageObject.imageId).toStrictEqual(VALID_FILES[0]);
	expect(sharpImageObject.width).toStrictEqual(CUSTOM_WIDTH);
	expect(sharpImageObject.height).toStrictEqual(CUSTOM_HEIGHT);
	expect(sharpImageObject.isOriginal).toStrictEqual(false);

	expect(
		fs.existsSync(`images/processed/${CUSTOM_WIDTH}x${CUSTOM_HEIGHT}/${VALID_FILES[0]}`)
	).toBeTruthy();
});

test("Default the image to the original one if sizing properties are invalid", async () => {
	let sharpImageObject = await sharpImage.init(VALID_FILES[1], null, "");

	expect(sharpImageObject.imageId).toStrictEqual(VALID_FILES[1]);
	expect(sharpImageObject.width).toStrictEqual(0);
	expect(sharpImageObject.height).toStrictEqual(0);
	expect(sharpImageObject.isOriginal).toStrictEqual(true);

});

test("Return the original/stock image path through the specialized method", async () => {
	let sharpImageObject = await sharpImage.init(VALID_FILES[0], 100, 100);
	expect(sharpImageObject.getStockImagePath()).toStrictEqual(`./images/full/${VALID_FILES[0]}`);
});

test("Return the processed image path through the specialized method", async () => {
	let sharpImageObject = await sharpImage.init(VALID_FILES[0], 100, 100);
	expect(sharpImageObject.getImagePath()).toStrictEqual(`./images/processed/100x100/${VALID_FILES[0]}`);
});

test("Offers the image as stream", (done) => {
	sharpImage.init(VALID_FILES[0]).then(sharpImageObject => {
		sharpImageObject.readImageStream(
		).on("data", () => {
			return false;
		}).on("end", () => {
			done();
		});
	});
});

test("Throw an error if the original image doesn't exist", async () => {
	expect(
		fs.existsSync(`images/full/${INVALID_FILES[0]}`)
	).toBeFalsy();

	try {
		await sharpImage.init(INVALID_FILES[0]);
	} catch (e)  {
		let error = JSON.parse(e.message);
		expect(error.status).toStrictEqual(404);
		expect(error.message).toStrictEqual("Image test.jpg not found.");
	}
});


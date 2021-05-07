"use strict";

module.exports = {
	"swaggerDefinition": {
		"info": {
			"title": "Udacity FS Program",
			"version": "1.0.0"
		},
		"contact": {
			"name": "Udacity mentors support",
			"email": "danielpaladar@gmail.com"
		},
		"components": {
		},
		"servers": [{
			"url": "https://localhost:3030",
			"description": "Staging server"
		}],
		"tags": [],
		"openapi": "3.0.2"
	},
	"apis": [
		"./server/dist/routes/partials/**/*.js"
	]
};
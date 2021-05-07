/*jslint node: true, nomen:true*/
/*env:node*/
(function () {
	"use strict";
	require("dotenv").config({"silent": true});
	const gulp = require("gulp");
	const packageJson = require("./package.json");
	const workboxBuild = require("workbox-build");
	const argv = require("yargs").argv;
	const cond = require("gulp-cond");
	const fs = require("fs");
	const fse = require("fs-extra");
	const cssnano = require("cssnano");
	const cache = require("gulp-cache");
	const postcss = require("gulp-postcss");
	const sourcemaps = require("gulp-sourcemaps");
	const sass = require("gulp-sass");
	const eslint = require("gulp-eslint");
	const plumber = require("gulp-plumber");
	const path = require("path");
	const cssnext = require("postcss-cssnext");
	const log = require("fancy-log");
	const jsdoc = require("gulp-jsdoc3");
	const colors = require("ansi-colors");
	const replace = require("replace");
	const webpack = require("webpack");
	const cssUglifier = [
		cssnano()
	];
	const childProcess = require("child_process");

	let currentContext = "";
	let modulePath;
	let isProd;

	process.env.NODE_ENV = argv.prod ? "production" : "development";
	isProd = process.env.NODE_ENV === "production" || process.NODE_ENV === "production";

	let methods = {
		"errorHandler": function errorHandler(module, error, stack) {
			log(colors.red("ERROR FOUND BUILDING THIS ARTIFACT:"), colors.yellow(module));
			log(stack);
			log(error);
			return error;
		},
		"createFiles": function createFiles(files) {
			return Promise.all(files.map(function (file) {
				return new Promise(function (resolve, reject) {
					fse.outputFile(file.path, file.content || "", "utf-8", function (err) {
						if (err) {
							reject(err);
						} else {
							resolve("file saved");
						}
					});
				});
			}));
		},
		"appendFile": function appendFile(file) {
			return new Promise(function (resolve, reject) {
				fs.appendFile(file.path, file.content || "", "utf-8", function (err) {
					if (err) {
						reject(err);
					} else {
						resolve("file saved");
					}
				});
			});
		},

		"runWebpack": function (modulePath, isProdBuild, isWatcherEnabled) {
			log(`webpack ${isProdBuild ? "--env.production --env.NODE_ENV=production" : "--env.NODE_ENV=development"} ${isWatcherEnabled ? "--env.ENABLE_WATCH" : ""}`);
			log(`Webpack building module ${modulePath}`);
			log(`Build type: ${isProdBuild ? "production" : "development"}`);
			log(`Watcher enabled: ${isWatcherEnabled ? 'yes' : 'no'}`);

			const compiler = webpack(
				require("./" + modulePath + "/webpack.config.js")({
					"NODE_ENV": isProdBuild ?  "production" : "development",
					"production": isProdBuild
				})
			)

			if (isWatcherEnabled) {
				compiler.watch({

				}, (err, stats) => {
					if (err) {
						console.log(err);
					} else {
						console.log(stats.toJson("minimal"));
					}
				});
			} else {
				compiler.run((err, stats) => {
					if (err) {
						console.log(err);
					} else {
						console.log(stats.toJson("minimal"));
					}
				});
			}

		}
	};


	gulp.task("doc", function (cb) {
		let config = require("./jsdoc-config.json");
		gulp.src(["README.md", "./server/dist/**/*.js"], {read: false})
			.pipe(jsdoc(config, cb));
	});

	gulp.task("swagger-route", function (done) {

		const swaggerUiAssetPath = require("swagger-ui-dist").absolutePath();
		log(colors.green(`Replacing swagger route to ${colors.cyan("/api-docs.json")}`));
		replace({
			"regex": "http.*.json",
			"replacement": "/api-docs.json",
			"paths": [path.join(swaggerUiAssetPath, "index.html")],
			"recursive": false,
			"silent": true
		});

		fse.copy(swaggerUiAssetPath, "./docs/api/swagger-ui-dist", err => {
			if (err) {
				log(colors.red(err));
			}
			log(colors.blue("Swagger: API docs built and placed successfully"));
			done();
		});
	});

	gulp.task("lint", function (done) {
		modulePath = currentContext ? currentContext : ["client/" + (argv.module || argv.m || currentContext || "main") + "_module"].join();
		//@TODO Enable all submodules lint
		return gulp.src(
			(modulePath === "client/maixxn_module" ?
				[
					"./client/main_module/js/**/*.js",
					"./client/main_module/js/**/*.vue",
					"./submodules_dev/**/client/**/*.js",
					"./submodules_dev/**/client/**/*.vue"
				] :
				[`./${modulePath}/js/**/*.js`, `./${modulePath}/js/**/*.vue`]
			)
		).pipe(eslint({
			"fix": true
		}))
		.pipe(eslint.format())
		.pipe(eslint.failAfterError())
		.on("success", function () {
			done();
		})
		.on("error", function (error) {
			methods.errorHandler("lint", error, "Check the logs to see where it fails");
			done(error);
		});
	});

	gulp.task("lint:server", function () {
		return gulp.src(["./server/src/*.js", "./server/src/*.ts"])
			.pipe(eslint({
				"fix": true
			}))
			.pipe(eslint.format())
			.pipe(eslint.failAfterError())
			.on("error", function (error) {
				methods.errorHandler("lint:server", error, "Check the logs to see where it fails");
			})
	});


	gulp.task("generate-sw", function (done) {

		fs.readdir("./client", function (err, files) {
			Promise.all(
				files.map(file => {
					return new Promise((resolve, reject) => {
						if (fs.statSync(path.join("client")).isDirectory() && file.indexOf("_module") > -1) {
							let moduleId = file.split("_")[0];
							let modulePath =  ["client/" + moduleId + "_module"].join();
							log(`${colors.blue("SERVICE WORKER MODULE:")} ${moduleId} ${colors.blue("BUILD TYPE:")} ${process.env.NODE_ENV}`);


							workboxBuild.generateSW({
								"swDest": path.join("client", `service-worker-${moduleId}.js`),
								"modifyURLPrefix":  {
									"": `${moduleId}_module/`
								},
								"globDirectory": modulePath,
								"mode": isProd ? "production" : "development",
								"cacheId": [packageJson.name, moduleId, process.env.NODE_ENV].join("_"),
								"clientsClaim": true,
								"maximumFileSizeToCacheInBytes": 4 * 1024 * 1024,
								"cleanupOutdatedCaches": true,
								"skipWaiting": true,
								"runtimeCaching": [{
									"urlPattern": "https://fonts.googleapis.com/css?family=IBM+Plex+Sans:300,400,500,700|IBM+Plex+Mono:400,500,700|IBM+Plex+Serif:300,400,700&display=swap",
									"handler": "CacheFirst",
									"options": {
										"cacheName": 'google-fonts-stylesheets',
										"expiration": {
											"maxEntries": 5,
											"maxAgeSeconds": 60 * 60 * 24 * 365,
										},
										"cacheableResponse": {
											"statuses": [0, 200],
										},
									},
								}],

								"globPatterns": [
									"dist/css/*.css",
									"dist/js/*.js",
								],
							}).then(({count, size, warnings}) => {
								// Optionally, log any warnings and details.
								warnings.forEach(console.warn);
								console.log(`${count} files will be precached, totaling ${size} bytes.`);
								done();
							});

						} else {
							return resolve();
						}
					});
				})
			).then(() => {
				done()
			}).catch(err => {
				done(err)
			});
		});






	});

	gulp.task("css", function () {
		modulePath = currentContext ? currentContext : ["client/" + (argv.module || argv.m || currentContext || "main") + "_module"].join();
		if (isProd) {
			fse.remove(modulePath + "/dist/css/style.css.map");
		}
		return gulp.src([
			modulePath + "/css/*.css",
			modulePath + "/css/*.scss"
		])
			.pipe(plumber())
			.pipe(cache(sass().on("error", sass.logError)))
			.pipe(postcss([
				cssnext({})
			]))
			.pipe(cond(!isProd, sourcemaps.init({"loadMaps": true})))
			.pipe(cond(isProd, postcss(cssUglifier)))
			.pipe(cond(!isProd, sourcemaps.write("./")))
			.pipe(gulp.dest(modulePath + "/dist/css/"));
	});

	gulp.task("watch-css", function (done) {
		modulePath = currentContext ? currentContext : ["client/" + (argv.module || argv.m || currentContext || "main") + "_module"].join();
		if (argv.w || argv.watch) {
			log(colors.blue("Gulp watching CSS changes"));
			gulp.watch([
				modulePath + "/css/*.css",
				modulePath + "/css/*.scss"
			], gulp.parallel("css"));
		}

		done();
	});

	gulp.task("bundle-code", async function () {
		let enableWatcher = argv.w || argv.watch;
		modulePath = currentContext ? currentContext : ["client/" + (argv.module || argv.m || currentContext || "main") + "_module"].join();

		return await methods.runWebpack(
			modulePath, isProd, enableWatcher
		);
	});

	gulp.task("build", gulp.parallel("lint", "css", "bundle-code", "watch-css"));

	gulp.task("build-all", gulp.parallel("lint:server", "doc", "swagger-route", function iterateOverModules(done) {
		cache.clearAll();
		fs.readdir("./client", function (err, files) {
			Promise.all(
				files.map(file => {
					return new Promise((resolve, reject) => {
						if (fs.statSync(path.join("client")).isDirectory() && file.indexOf("_module") > -1) {
							let module = file.split("_")[0];
							log(`${colors.blue("MODULE:")} ${module} ${colors.blue("BUILD TYPE:")} ${process.env.NODE_ENV}`);
							childProcess.exec(
								`gulp build -m ${module} ${isProd ? '--prod' : ''}`,
								function (error, data) {
									log(data);
									if (error) {
										log(colors.red(`Module [${module}] errored`));
										log(error);
										console.log(error.toString())
										return reject(error);
									} else {
										log(colors.green(`Module [${module}] built successfully`));
										return resolve();
									}
								},
							);
						} else {
							return resolve();
						}
					});
				})
			).then(() => {
				done()
			}).catch(err => {
				done(err)
			});
		});
	}));



	gulp.task("help", function () {
		/*
		 params to doc
		 @ watch, alias w -> #build
		 @ prod -> #env
		 @ module, alias m -> #build
		 @ override, alias o -> #create-module
		 */

		log(colors.green("Task: build-all"), colors.magenta("#"));
		log(colors.green("Task: build"), colors.magenta("#"));
		log(colors.green("Task: lint"), colors.magenta("#"));
		log(colors.green("Task: lint:server"), colors.magenta("#"));
		log(colors.green("Task: js"), colors.magenta("#"));
		log(colors.green("Task: css"), colors.magenta("#"));
		log(colors.green("Task: generate-sw"), colors.magenta("#"));
		log(colors.green("Task: create-module"), colors.magenta("#"));
		log(colors.green("Task: images"), colors.magenta("#"));

	});


	process.on("exit", function (code) {
		log("About to exit with code:", code);
	});

}());

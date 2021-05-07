# Image Processing API 

## Intro

This application runs a simple node.js server and offers a REST endpoint to serve images through stream.

Transforms and automations are in place and are thoroughly described below. There is a [complete rubric checklist here](RUBRIC_CHECKLIST.md)


## Provided endpoint

After installing the dependencies, building and executing the project, the endpoint will be available as demonstrated below:

### Path

`/api/image`

### Query string parameters

| Query string param    | Description |
|-------------|---------------|
| imageId    | Any image available in the `images/full` folder   |
| width    | Custom image width - optional          |
| height | Custom image height - optional         |

### Full example

Considering the app running at port 3030 on your local environment, you can access the following endpoints

* Getting the original image - [http://localhost:3030/api/image?imageId=fjord.jpg](http://localhost:3030/api/image?imageId=fjord.jpg)
* Getting the same image with custom dimensions - [http://localhost:3030/api/image?imageId=fjord.jpg&width=100&height=100](http://localhost:3030/api/image?imageId=fjord.jpg&width=100&height=100)


The `/` root path can be used as alias, so the demonstrated above is equivalent to the demonstrated below:

* Getting the original image - [http://localhost:3030?imageId=fjord.jpg](http://localhost:3030?imageId=fjord.jpg)
* Getting the same image with custom dimensions - [http://localhost:3030?imageId=fjord.jpg&width=100&height=100](http://localhost:3030?imageId=fjord.jpg&width=100&height=100)




## Project stack

### Frontend

- TBD


### Backend

- [Node.js v14+](https://nodejs.org/)
- [Typescript](https://www.typescriptlang.org/)
- [Sharp package](https://www.npmjs.com/package/sharp)


### Tooling

- [Gulp.js](https://gulpjs.com/)
- [ESLint](https://eslint.org/)
- [Nodemon](https://nodemon.io/)
- [Jest](https://jestjs.io/docs/)
- [Swagger](https://jestjs.io/docs/)
- [JSDocs](https://jestjs.io/docs/)


## Getting started

To get this project up and running one will need to:

1. Download the project & install the dependencies
2. Add the environment variables
3. Build & execute the application


### Install dependencies

This is straightforward, after cloning/downloading this repository you can execute the following command from the root folder:

```bash
npm install
```


### Add the environment variables

Since this is a very simple app, all variables has a default injected into the code, but if you want to run the app in a
different port you can change it within the `.env` file.

1. Create a new file named `.env`
2. Add/modify the following values

| Variable    | Default value |
|-------------|---------------|
| NODE_ENV    | development   |
| APP_PORT    | 3030          |
| LOCAL_HTTPS | false         |
| DEBUG       | app:*         |


### Build & execute the application

Check out more details below, but after installing the dependencies you can start the app with the following command:

```bash
npm run start:server
```


## Automations

All tasks are available through `npm run` scripts.


### Linter/prettier

Code styling check and automatic fix is handled by ESLint through a Gulp task. You can execute the command below:

```bash
npm run lint:server
```


### Typescript transpiling

The backend code is delivered through the `server/src` folder, and the transformed output is placed under `server/dist.
You can execute the command below:

```bash
npm run build:server
```


### Executing Jest test

The test suite validates basic functionality of the images handler helper. You can execute the command below:

```bash
npm run test:server
```


### Executing the server

There are two modes of execution:

1. Single execution
2. Execution with watcher mode and restart enabled

The commands to achieve the builds described above are, respectively:

```bash
npm run start:server
npm run start:server:dev
```


### Generating documentation

There is a gulp task to automate Swagger doc generation through JS Docs, and JS Docs itself.

```bash
npm run documentation
```

After running this command, two folders will be generated, as listed below:

* docs/api
* docs/js

After starting the server, you can access both docs in the following URLs

1. [Swagger docs - /docs/api](http://localhost:3030/docs/api)
1. [JSDocs - /docs/js](http://localhost:3030/docs/js)



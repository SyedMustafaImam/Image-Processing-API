
## Setup and Architecture

### Set up a project structure that promotes scalability

#### Source code is kept separate from compiled code.

Yes, there is a `server/src` folder with typescript transpiled to `server/dist`


#### All tests should be contained in their own folder.

There is a single test file contained within a `test` folder located at the root path of the project.


#### Separate modules are created for any processing.

Yes, a dedicated helper was developed to handle specific requirements.


### Set up an npm project

#### Package.json should contain both devDependencies, and dependencies.

Yes, `devDependencies` are used for things to build the app e.g: typescript, gulp, etc. And runtime dependencies
are listed under `dependencies`.


#### Scripts should be created for testing, linting/prettier, starting the server, and compiling TS.

The NPM tasks were used to integrate and offer an interface for the following tools:

* Gulp
* Jest
* Typescript
* Swagger/JSDocs


#### Build script should run without error.

No errors were found after following the instructions available in the README.md file in a clean environment.


## Functionality

### Add and use Express to a node.js project

#### Start script should run without error

No errors were found after following the instructions available in the README.md after installing the
dependencies and building the project.


#### Provided endpoint should open in the browser with status 200

Endpoint respond successfully if handled as documented in the README.md file. Relevant errors are handled, and image is
served as a stream if found.


### Folow middleware documentation to use middleware to create an API

#### Accessing the provided endpoint should successfully resize an image and save to disk on first access, then pull from disk on subsequent access attempts.

The first access to the endpoint create a custom folder and file and serves it from this cache in subsequent access


#### An error message should be provided to the user when an image has failed to process or does not exist.

Errors are handled by a middleware and HTTP status code are used to be semantically stronger


### Write relevant unit tests to improve code quality and refactoring

#### Test script runs and all tests created pass.

The test suite can be executed end-to-end smoothly. 09 tests are available to test the helper conditions.


#### There is at least 1 test per endpoint and at least one test for image processing.

The helper is thoroughly tested, and for the API swagger docs are available. API can be tested there on the fly.


### Utilize TypeScript to avoid errors and improve maintainability

#### All code in the SRC folder should use the .ts filetype.

All scripts in the `server/src` folder are implemented using `.ts` files


#### Functions should include typed parameters and return types.

All methods uses typescript and JSDoc to enforce and document data types


#### Import and Export used for modules.

Import and export functions are used over common.js


#### Build script should successfully compile TS to JS.

No problems observed using the scripts available in package.json and documented in README file.


### Write well-formatted linted code

#### Prettier and Lint scripts should run without producing any error messages.

Script to perform ESLint check and apply automated fixes are in place and doesn't raise any warning








# supertest-api-tests

Demonstration of using SuperTest to run API tests against a simple REST API. This project uses `JSON Server` and `JSON Server Auth` to set up a simple API with authorization. I used my project `cypress-api-tests` as a reference to port what I was doing in Cypress over to SuperTest.

## Getting Started

### Installing

-   Install git
-   Clone the repo: `git clone https://github.com/MattBlakeQA/supertest-api-tests.git`
-   Install Node 18+
-   Install NPM
-   Install dependencies: `npm install`

### Running tests

-   Run all API tests: `npm run supertest`. This will automatically start up the server, run the tests, and then shutdown the server. The "database" is restored each run so there is nothing to set up/maintain.

### Report

An html report is generated automatically in `/reports`

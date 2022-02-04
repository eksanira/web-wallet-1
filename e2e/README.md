# Prepare

### Install modules
`npm i`

###### Sometimes browser installation required
`npx playwright install chrome`


### Run wallet*
*Only required for running tests on localhost.

Build and run wallet: `npm run wallet-start`.

More about wallet start in JsWallet/README.md.

# Run tests
`npx playwright test <path or test name>`

e.g. `npx playwright test src/tests/auth.test.ts` or `npx playwright test auth`

##### Run all tests:
`npm test`

# Configuration
`ENVIRONMENT`

Available options: 'local', 'devnet', 'testnet', 'prod'

Default value: 'local' (127.0.0.1)


`NETWORK`

Available options: 'devnet', 'testnet', 'mainnet'

Default value: 'testnet'

So, when you don't pass any params `http://127.0.0.1:8080/main-index.html` is used.


#### Debug
##### Enabling debug window
Add PWDEBUG=1 before your test script, e.g.

`PWDEBUG=1 npx playwright test`

##### Enable playwright logs

`DEBUG=pw:api`

### Allure
`allure generate ./allure-results --clean && allure open ./allure-report`


### LINTER
`npm run lint`

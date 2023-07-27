# image-builder-frontend

## Table of Contents
1. [How to build and run image-builder-frontend](#frontend-development)
   1. [Frontend Development](#frontend-development)
   2. [Backend Development](#backend-development)
2. [File structure](#file-structure)
3. [Style Guidelines](#style-guidelines)
4. [Test Guidelines](#test-guidelines)

## How to build and run image-builder-frontend

### Frontend Development

To develop the frontend you can use a proxy to run image-builder-frontend locally
against the chrome and backend at console.redhat.com.

Working against the production environment is preferred, as any work can be released without
worrying if a feature from stage has been released yet.

#### Nodejs and npm version

Make sure you have npm@7 and node 15+ installed. If you need multiple versions of nodejs check out [nvm](https://github.com/nvm-sh/nvm).

#### Webpack proxy

1. run `npm ci`

2. run `npm run prod-beta`. This command uses a prod-beta env by default. Configure your
   environment by the `env` attribute in `dev.webpack.config.js`.

3. Secondly redirect a few `prod.foo.redhat.com` to localhost, if this has not been done already.

```bash
echo "127.0.0.1 prod.foo.redhat.com" >> /etc/hosts
```

4. open browser at `https://prod.foo.redhat.com:1337/beta/insights/image-builder`

#### Webpack proxy (staging) -- *Runs with image-builder's stage deployment*

1. run `npm ci`

2. run `npm run stage-beta`. This command uses a stage-beta env by default. Configure your
   environment by the `env` attribute in `dev.webpack.config.js`.

3. Secondly redirect a few `stage.foo.redhat.com` to localhost, if this has not been done already.

```bash
echo "127.0.0.1 stage.foo.redhat.com" >> /etc/hosts
```

4. open browser at `https://stage.foo.redhat.com:1337/beta/insights/image-builder`

#### Insights proxy (deprecated)

1. Clone the insights proxy: https://github.com/RedHatInsights/insights-proxy

2. Setting up the proxy

    Choose a runner (podman or docker), and point the SPANDX_CONFIG variable to
    `profile/local-frontend.js` included in image-builder-frontend.

    ```
        sudo insights-proxy/scripts/patch-etc-hosts.sh
        export RUNNER="podman"
        export SPANDX_CONFIG=$PATH_TO/image-builder-frontend/profiles/local-frontend.js
        sudo -E insights-proxy/scripts/run.sh
    ```

3. Starting up image-builder-frontend

    In the image-builder-frontend checkout directory

    ```
        npm install
        npm start
    ```

The UI should be running on
https://prod.foo.redhat.com:1337/beta/insights/image-builder/landing.
Note that this requires you to have access to either production or stage (plus VPN and proxy config) of insights.

### Backend Development

To develop both the frontend and the backend you can again use the proxy to run both the
frontend and backend locally against the chrome at cloud.redhat.com. For instructions
see [devel/README.md](devel/README.md).

## File Structure

### Quick Reference
| Directory                                                                                                            | Description                                |
| ---------                                                                                                            | -----------                                |
| [`/api`](https://github.com/RedHatInsights/image-builder-frontend/tree/main/api)                                     | API schema and config files                |
| [`/config`](https://github.com/RedHatInsights/image-builder-frontend/tree/main/config)                               | webpack configuration                      |
| [`/devel`](https://github.com/RedHatInsights/image-builder-frontend/tree/main/devel)                                 | tools for local development                |
| [`/src`](https://github.com/RedHatInsights/image-builder-frontend/tree/main/src)                                     | source code                                |
| [`/src/Components`](https://github.com/RedHatInsights/image-builder-frontend/tree/main/src/Components)               | source code split by individual components |
| [`/src/test`](https://github.com/RedHatInsights/image-builder-frontend/tree/main/src/test)                           | test utilities                             |
| [`/src/test/mocks`](https://github.com/RedHatInsights/image-builder-frontend/tree/main/src/test/mocks)               | mock handlers and server config for MSW    |
| [`/src/store`](https://github.com/RedHatInsights/image-builder-frontend/tree/main/src/store)                         | Redux store                                |
| [`/src/api.js`](https://github.com/RedHatInsights/image-builder-frontend/blob/main/src/api.js)                       | API calls                                  |

## Style Guidelines

This project uses eslint's recommended styling guidelines. These rules can be found here:
https://eslint.org/docs/rules/

To run the linter, use:
```bash
npm run lint
```

Any errors that can be fixed automatically, can be corrected by running:
```bash
npm run lint --fix
```

All the linting rules and configuration of eslint can be found in [`.eslintrc.yml`](https://github.com/RedHatInsights/image-builder-frontend/blob/main/.eslintrc.yml).

### Additional eslint rules
There are also additional rules added to enforce code style. Those being:
- `import/order` -> enforces the order in import statements and separates them into groups based on their type
- `prefer-const` -> enforces use of `const` declaration for variables that are never reassigned
- `no-console` -> throws an error for any calls of `console` methods leftover after debugging

## Test Guidelines

This project is tested using the [Jest](https://jestjs.io/docs/getting-started) framework, [React Testing Library](https://testing-library.com/docs/react-testing-library/intro), and the [Mock Service Worker](https://mswjs.io/docs/) library.

All UI contributions must also include a new test or update an existing test in order to maintain code coverage.

### Running the tests

To run the unit tests, the linter, and the code coverage check run:
```bash
npm run test
```

These tests will also be run in our Travis CI when a PR is opened.

## API endpoints 

API slice definitions are generated using the [@rtk-query/codegen-openapi](https://redux-toolkit.js.org/rtk-query/usage/code-generation) package.

OpenAPI schema for the endpoints are stored in `/api/schema`. Their
corresponding configuration files are stored in `/api/config`. Each endpoint
has a corresponding empty API slice and generated API slice which are stored in
`/src/store`.

To generate or update API slice definitions, run:
```bash
npm run api
```

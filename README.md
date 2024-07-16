# Image Builder Frontend

## Principles

1. We want to use the latest and greatest web technologies.
2. We want to expose all the options and customizations possible, even if not all are visible by default.
3. The default path should be ‘short(est)’ clickpath, which should be determined in a data-driven way.
4. This is an [Insights application](https://github.com/RedHatInsights/), so it abides by some rules and standards of Insights.

## Table of Contents
1. [How to build and run image-builder-frontend](#frontend-development)
   1. [Frontend Development](#frontend-development)
      1. [API](#api-endpoints)
      2. [Unleash feature flags](#unleash-feature-flags)
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

Make sure you have npm@10 and node 18+ installed. If you need multiple versions of nodejs check out [nvm](https://github.com/nvm-sh/nvm).

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

#### API endpoints

API slice definitions are programmatically generated using the [@rtk-query/codegen-openapi](https://redux-toolkit.js.org/rtk-query/usage/code-generation) package.

OpenAPI schema for the endpoints are stored in `/api/schema`. Their
corresponding configuration files are stored in `/api/config`. Each endpoint
has a corresponding empty API slice and generated API slice which are stored in
`/src/store`.

##### Add a new API

For a hypothetical API called foobar

1. Download the foobar API OpenAPI json or yaml representation under
`api/schema/foobar.json`

2. Create a new "empty" API file under `src/store/emptyFoobarApi.ts` that has following
content:

```{ts}
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { FOOBAR_API } from '../constants';

// initialize an empty api service that we'll inject endpoints into later as needed
export const emptyFoobarApi = createApi({
  reducerPath: 'foobarApi',
  baseQuery: fetchBaseQuery({ baseUrl: FOO_BAR }),
  endpoints: () => ({}),
});
```

3. Declare new constant `FOOBAR_API` with the API url in `src/constants.ts`

```
export const FOOBAR_API = 'api/foobar/v1'
```

4. Create the config file for code generation in `api/config/foobar.ts` containing:

```
import type { ConfigFile } from '@rtk-query/codegen-openapi';

const config: ConfigFile = {
  schemaFile: '../schema/foobar.json',
  apiFile: '../../src/store/emptyFoobarApi.ts',
  apiImport: 'emptyEdgeApi',
  outputFile: '../../src/store/foobarApi.ts',
  exportName: 'foobarApi',
  hooks: true,
  filterEndpoints: ['getFoo', 'getBar', 'getFoobar'],
};
```

5. Update the `api.sh` script by adding a new line for npx to generate the code:

```
npx @rtk-query/codegen-openapi ./api/config/foobar.ts &
```


6. Update the `.eslintignore` file by adding a new line for the generated code:

```
foobarApi.ts
```

7. run api generation

```
npm run api
```

And voilà!

##### Add a new endpoint

To add a new endpoint, simply update the `api/config/foobar.ts` file with new
endpoints in the `filterEndpoints` table.

#### Unleash feature flags

Your user needs to have the corresponding rights, do the
same as this MR in internal gitlab https://gitlab.cee.redhat.com/service/app-interface/-/merge_requests/79225
you can ask on the slack channel https://redhat-internal.slack.com/archives/C023YSA47A4 for a merge if your MR stays unchecked for a little while.

Then connect to the following platforms:
* https://insights-stage.unleash.devshift.net/ for stage
* https://insights.unleash.devshift.net prod

Once you have a toggle to work with, on the frontend code there's just need to
import the `useFlag` hook and to use it. You can get some inspiration from
existing flags:

https://github.com/RedHatInsights/image-builder-frontend/blob/c84b493eba82ce83a7844943943d91112ffe8322/src/Components/ImagesTable/ImageLink.js#L99

##### Mocking flags for tests

Flags can be mocked for the unit tests to access some feature. Checkout:
https://github.com/osbuild/image-builder-frontend/blob/9a464e416bc3769cfc8e23b62f1dd410eb0e0455/src/test/Components/CreateImageWizard/CreateImageWizard.test.tsx#L49

If the two possible code path accessible via the toggles are defined in the code
base, then it's good practice to test the two of them. If not, only test what's
actually owned by the frontend project.


##### Cleaning the flags

Unleash toggles are expected to live for a limited amount of time, documentation
specify 40 days for a release, we should keep that in mind for each toggle
we're planning on using.

### Backend Development

To develop both the frontend and the backend you can again use the proxy to run both the
frontend and backend locally against the chrome at cloud.redhat.com. For instructions
see the [osbuild-getting-started project](https://github.com/osbuild/osbuild-getting-started).

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

These tests will also be run in our CI when a PR is opened.

### Using MSW data in development

If you want to develop in environment with mocked data, run the command `npm run stage-beta:msw`.

#### Enabling MSW
In a case you're seeing `Error: [MSW] Failed to register the Service Worker` in console, you might also need to configure SSL certification on your computer.

In order to do this install [mkcert](https://github.com/FiloSottile/mkcert)

After the installation, go to the `/node_modules/.cache/webpack-dev-server` folder and run following commands:

1. `mkcert -install`  to create a new certificate authority on your machine
2. `mkcert prod.foo.redhat.com`  to create the actual signed certificate

#### Mac Configuration
Follow these steps to find and paste the certification file into the 'Keychain Access' application:

1. Open the 'Keychain Access' application.

2. Select 'login' on the left side.

3. Navigate to the 'Certificates' tab.

4. Drag the certification file (located at /image-builder-frontend/node_modules/.cache/webpack-dev-server/server.pem) to the certification list.

5. Double-click on the added certificate (localhost certificate) to open the localhost window.

6. Open the 'Trust' dropdown menu.

7. Set all options to 'Always Trust'.

8. Close the localhost screen.

9. Run `npm run stage-beta:msw` and open the Firefox browser to verify that it is working as expected.

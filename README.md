# Image Builder Frontend

Frontend code for Image Builder.

## Project

* **Website**: https://www.osbuild.org
* **Bug Tracker**: https://github.com/osbuild/image-builder-frontend/issues
* **Discussions**: https://github.com/orgs/osbuild/discussions
* **Matrix**: #image-builder on [fedoraproject.org](https://matrix.to/#/#image-builder:fedoraproject.org)

## Principles

1. We want to use the latest and greatest web technologies.
2. We want to expose all the options and customizations possible, even if not all are visible by default.
3. The default path should be ‘short(est)’ clickpath, which should be determined in a data-driven way.
4. This is an [Insights application](https://github.com/RedHatInsights/), so it abides by some rules and standards of Insights.

## Table of Contents
1. [How to build and run image-builder-frontend](#frontend-development)
   1. [Frontend Development](#frontend-development)
   2. [Image builder as Cockpit plugin](#image-builder-as-cockpit-plugin)
   3. [Backend Development](#backend-development)
2. [API endpoints](#api-endpoints)
   1. [Add a new API schema](#add-a-new-api-schema)
   2. [Add a new endpoint](#add-a-new-endpoint)
3. [Unleash feature flags](#unleash-feature-flags)
   1. [Mocking flags for tests](#mocking-flags-for-tests)
   2. [Cleaning the flags](#cleaning-the-flags)
4. [File Structure](#file-structure)
5. [Style Guidelines](#style-guidelines)
6. [Test Guidelines](#test-guidelines)
7. [Running hosted service Playwright tests](#running-hosted-service-playwright-tests)
8. [Playwright Boot tests](#playwright-boot-tests)
   1. [Local development setup](#local-development-setup)
   2. [CI setup](#ci-setup)

## How to build and run image-builder-frontend

> [!IMPORTANT]
> Running image-builder-frontend against [console.redhat.com](https://console.redhat.com/) requires connection to the Red Hat VPN, which is only available to Red Hat employees. External contributors can locally run [image builder as Cockpit plugin](#image-builder-as-cockpit-plugin).
>
> As you will see in the following sections we **always** prefer `npm clean-install` (aka `npm ci`) over `npm install` to install dependencies exactly as they are defined in the `package-lock.json` file.<br/>
> This is crucial to avoid any discrepancies between the dependencies installed locally and the dependencies installed in the CI as well as unintentionally installing compromised dependencies.

### Frontend Development

To develop the frontend you can use a proxy to run image-builder-frontend locally
against the chrome and backend at console.redhat.com.

Working against the production environment is preferred, as any work can be released without
worrying if a feature from stage has been released yet.

#### Nodejs and npm version

Make sure you have npm@10 and node 22+ installed. If you need multiple versions of nodejs check out [nvm](https://github.com/nvm-sh/nvm).

#### Webpack proxy

1. run `npm clean-install`

2. run `npm run start:prod`

3. redirect `prod.foo.redhat.com` to localhost, if this has not been done already

```bash
echo "127.0.0.1 prod.foo.redhat.com" >> /etc/hosts
```

4. open browser at `https://prod.foo.redhat.com:1337/beta/insights/image-builder`

#### Webpack proxy (staging) -- *Runs with image-builder's stage deployment*

1. run `npm clean-install`

2. run `npm run start:stage`

3. redirect `stage.foo.redhat.com` to localhost, if this has not been done already

```bash
echo "127.0.0.1 stage.foo.redhat.com" >> /etc/hosts
```

4. open browser at `https://stage.foo.redhat.com:1337/beta/insights/image-builder`

### Image builder as Cockpit plugin

> [!NOTE]
> Issues marked with [cockpit-image-builder](https://github.com/osbuild/image-builder-frontend/issues?q=is%3Aissue%20state%3Aopen%20label%3Acockpit-image-builder) label are reproducible in image builder plugin and can be worked on by external contributors without connection to the Red Hat VPN.

#### Cockpit setup
To install and setup Cockpit follow guide at: https://cockpit-project.org/running.html

#### On-premises image builder installation and configuration
To install and configure `osbuild-composer` on your local machine follow our documentation: https://osbuild.org/docs/on-premises/installation/

#### Scripts for local development of image builder plugin

The following scripts are used to build the frontend with Webpack and install it into the Cockpit directories. These scripts streamline the development process by automating build and installation steps.

Runs Webpack with the specified configuration (cockpit/webpack.config.ts) to build the frontend assets.
Use this command whenever you need to compile the latest changes in your frontend code.

Creates the necessary directory in the user's local Cockpit share (~/.local/share/cockpit/).
Creates a symbolic link (image-builder-frontend) pointing to the built frontend assets (cockpit/public).
Use this command after building the frontend to install it locally for development purposes.
The symbolic link allows Cockpit to serve the frontend assets from your local development environment,
making it easier to test changes in real-time without deploying to a remote server.

```bash
make cockpit/build
```

```bash
make cockpit/devel-install
```

To uninstall and remove the symbolic link, run the following command:

```bash
make cockpit/devel-uninstall
```

For convenience, you can run the following to combine all three steps:


```bash
make cockpit/devel
```

### Backend Development

To develop both the frontend and the backend you can again use the proxy to run both the
frontend and backend locally against the chrome at cloud.redhat.com. For instructions
see the [osbuild-getting-started project](https://github.com/osbuild/osbuild-getting-started).

## API endpoints

API slice definitions are programmatically generated using the [@rtk-query/codegen-openapi](https://redux-toolkit.js.org/rtk-query/usage/code-generation) package.

The OpenAPI schema are imported during code generation. OpenAPI configuration files are
stored in `/api/config`. Each endpoint has a corresponding empty API slice and generated API
slice which are stored in `/src/store`.

### Add a new API schema

For a hypothetical API called foobar

1. Create a new "empty" API file under `src/store/emptyFoobarApi.ts` that has following
content:

```typescript
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { FOOBAR_API } from '../constants';

// initialize an empty api service that we'll inject endpoints into later as needed
export const emptyFoobarApi = createApi({
  reducerPath: 'foobarApi',
  baseQuery: fetchBaseQuery({ baseUrl: window.location.origin + FOO_BAR }),
  endpoints: () => ({}),
});
```

2. Declare new constant `FOOBAR_API` with the API url in `src/constants.ts`

```typescript
export const FOOBAR_API = 'api/foobar/v1'
```

3. Create the config file for code generation in `api/config/foobar.ts` containing:

```typescript
import type { ConfigFile } from '@rtk-query/codegen-openapi';

const config: ConfigFile = {
  schemaFile: 'URL_TO_THE_OPENAPI_SCHEMA',
  apiFile: '../../src/store/emptyFoobarApi.ts',
  apiImport: 'emptyContentSourcesApi',
  outputFile: '../../src/store/foobarApi.ts',
  exportName: 'foobarApi',
  hooks: true,
  filterEndpoints: ['getFoo', 'getBar', 'getFoobar'],
};
```

4. Update the `eslint.config.js` file by adding the generated code path to the ignores array:

```
ignores: [
   <other ignored files>,
  '**/foobarApi.ts',
]
```

5. run api generation

```bash
npm run api
```

And voilà!

### Add a new endpoint

To add a new endpoint, simply update the `api/config/foobar.ts` file with new
endpoints in the `filterEndpoints` table.

## Unleash feature flags

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

### Mocking flags for tests

Flags can be mocked for the unit tests to access some feature. Checkout:
https://github.com/osbuild/image-builder-frontend/blob/9a464e416bc3769cfc8e23b62f1dd410eb0e0455/src/test/Components/CreateImageWizard/CreateImageWizard.test.tsx#L49

If the two possible code path accessible via the toggles are defined in the code
base, then it's good practice to test the two of them. If not, only test what's
actually owned by the frontend project.


### Cleaning the flags

Unleash toggles are expected to live for a limited amount of time, documentation
specify 40 days for a release, we should keep that in mind for each toggle
we're planning on using.

## File Structure
### Quick Reference
| Directory                                                                                                            | Description                                |
| ---------                                                                                                            | -----------                                |
| [`/api`](https://github.com/RedHatInsights/image-builder-frontend/tree/main/api)                                     | API schema and config files                |
| [`/config`](https://github.com/RedHatInsights/image-builder-frontend/tree/main/config)                               | webpack configuration                      |
| [`/src`](https://github.com/RedHatInsights/image-builder-frontend/tree/main/src)                                     | source code                                |
| [`/src/Components`](https://github.com/RedHatInsights/image-builder-frontend/tree/main/src/Components)               | source code split by individual components |
| [`/src/test`](https://github.com/RedHatInsights/image-builder-frontend/tree/main/src/test)                           | test utilities                             |
| [`/src/test/mocks`](https://github.com/RedHatInsights/image-builder-frontend/tree/main/src/test/mocks)               | mock handlers and server config for MSW    |
| [`/src/store`](https://github.com/RedHatInsights/image-builder-frontend/tree/main/src/store)                         | Redux store                                |

## Style Guidelines

This project uses recommended rule sets rom several plugins:
- `@eslint/js`
- `typescript-eslint`
- `eslint-plugin-react`
- `eslint-plugin-react-hooks`
- `eslint-plugin-react-redux`
- `eslint-plugin-import`
- `eslint-plugin-jsx-a11y`
- `eslint-plugin-disable-autofix`
- `eslint-plugin-jest-dom`
- `eslint-plugin-testing-library`
- `eslint-plugin-playwright`
- `@redhat-cloud-services/eslint-config-redhat-cloud-services`

To run the linter, use:
```bash
npm run lint
```

Any errors that can be fixed automatically, can be corrected by running:
```bash
npm run lint:js:fix
```

All the linting rules and configuration of ESLint can be found in [`eslint.config.js`](https://github.com/RedHatInsights/image-builder-frontend/blob/main/eslint.config.js).

## Test Guidelines

This project is tested using the [Vitest](https://vitest.dev/guide/) framework, [React Testing Library](https://testing-library.com/docs/react-testing-library/intro), and the [Mock Service Worker](https://mswjs.io/docs/) library.

All UI contributions must also include a new test or update an existing test in order to maintain code coverage.

### Running the tests

To run the unit tests, the linter, and the code coverage check run:
```bash
npm run test
```

These tests will also be run in our CI when a PR is opened.

Note that `testing-library` DOM printout is currently disabled for all tests by the following configuration in `src/test/setup.ts`:
```typescript
configure({
  getElementError: (message: string) => {
    const error = new Error(message);
    error.name = 'TestingLibraryElementError';
    error.stack = '';
    return error;
  },
});
```
If you'd like to see the stack printed out you can either temporarily disable the configuration or generate a [Testing Playground](https://testing-playground.com/) link by adding `screen.logTestingPlaygroundURL()` to your test.

## Running hosted service Playwright tests

### Running tests

1. Copy the [example env file](playwright_example.env) content and create a file named `.env` in the root directory of the project. Paste the example file content into it.
   For local development fill in the:
    * `BASE_URL` - `https://stage.foo.redhat.com:1337` is required, which is already set in the example config
    * `PLAYWRIGHT_USER` - your consoledot stage username
    * `PLAYWRIGHT_PASSWORD` - your consoledot stage password

2. Make sure Playwright is installed as a dev dependency
   ```bash
   npm clean-install
   ```

3. Download the Playwright browsers with
   ```bash
   npx playwright install
   ```

4. Start the local development stage server by running
   ```bash
   npm run start:stage
   ```

5. Now you have two options of how to run the tests:
   * (Preferred) Use VS Code and the [Playwright Test module for VSCode](https://marketplace.visualstudio.com/items?itemName=ms-playwright.playwright). But other editors do have similar plugins for ease of use, if so desired
   * Using terminal - `npx playwright test` will run the playwright test suite. `npx playwright test --headed` will run the suite in a vnc-like browser so you can watch it's interactions.

### Dynamic vs static users
This applies to the **stage** environment only. By default we generate a new user for each CI run for the hosted tests, however there is an option to use static user as well. You can set credentials for said static user like this:
```.env
PLAYWRIGHT_STATIC_USER="<your_static_user_username>"
PLAYWRIGHT_STATIC_PASSWORD="<your_static_user_password>"
```
For local development purposes, you can use the same credentials as for `PLAYWRIGHT_USER` and `PLAYWRIGHT_PASSWORD` if you are using your stage account for those.
## Playwright Boot tests
This section describes what Playwright Boot tests are, how they work and how to run them locally.

Boot tests provide end to end coverage for Image Builder and they are used to test mainly integrations with other services. Their main advantage is that they build an image, upload it and **launch it on RHOSP** (RedHat OpenStack Platform). This way we can test images and their customizations through remotely executed commands on an actual running VM booted from the image.
Boot tests are located in the [playwright/BootTests](playwright/BootTests) directory.

### Local development setup
In order to run the Boot tests locally, we need to set up few things first on top of what we did in the [Running hosted service Playwright tests](#running-hosted-service-playwright-tests) section.

We need additional fields in the .env file, some of them are already set and don't need to be changed in the [example env file](playwright_example.env)), but some of them have to be set manually, specifically following:

```.env
OS_APPLICATION_CREDENTIAL_ID=<your_id>
OS_APPLICATION_CREDENTIAL_SECRET=<your_secret>
OS_SSH_KEY_NAME="<name_of_your_ssh_key_entry_in_openstack>"
```

In order to be able to access RHOSP within the Boot tests, we need to generate credentials and create an entry with our public ssh key on the platform. Log into [RHOSP dashboard](https://api.rhos-01.prod.psi.rdu2.redhat.com/) using **Keystone credentials** and navigate to Identity -> Application Credentials. There you can create the credentials (you will get values for `OS_APPLICATION_CREDENTIAL_ID` and `OS_APPLICATION_CREDENTIAL_SECRET`). In order to create an entry for your SSH key, navigate to Project -> Compute -> Keys and add your public key there.

By filling out these variables you should be able to run the Boot test locally successfully.

### CI setup
Boot tests run as a scheduled nightly Github Action with a custom runner in AWS Codebuild, but there is an option to run them manually on a PR as well.
#### Manual run
In order to run the Boot tests on a PR, you can open the `Boot tests` workflow in Github Actions and type in the number of PR into a `Pull Request number to run tests against` field. The action will then pull the code from a PR of that number and execute as usual.

#### Where can I see results?
You can find artifacts and link to a Currents report directly in the workflow run detail, but Currents will also link the report back to the PR when the workflow finishes as a *check*.
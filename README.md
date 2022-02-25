# image-builder-frontend

## Frontend Development

To develop the frontend you can use a proxy to run image-builder-frontend locally
against the chrome and backend at console.redhat.com.

Working against the production environment is preferred, as any work can be released without
worrying if a feature from stage has been released yet.

### Nodejs and npm version

Make sure you have npm@7 and node 15+ installed. If you need multiple versions of nodejs check out [nvm](https://github.com/nvm-sh/nvm).

### Webpack proxy

1. run `npm ci`

2. run `npm run start:proxy:beta`. This command uses a prod-beta env by default. Configure your
   environment by the `env` attribute in `dev.webpack.config.js`.

3. open browser at `https://prod.foo.redhat.com:1337/beta/insights/image-builder`

### Insights proxy (deprecated)

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

## Backend Development

To develop both the frontend and the backend you can again use the proxy to run both the
frontend and backend locally against the chrome at cloud.redhat.com. For instructions
see [devel/README.md](devel/README.md).


## Style Guidelines

This project uses eslint's recommended styling guidelines. These rules can be found here:
https://eslint.org/docs/rules/


## Test Guidelines

Testing is done using [React Testing Library](https://testing-library.com/docs/react-testing-library/intro). 
All UI contributions must also include a new test or update an existing test in order to maintain code coverage.

Tests can be run with
```
    npm run test
```

These tests will also be run in our Travis CI when a PR is opened.

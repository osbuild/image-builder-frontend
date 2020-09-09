# osbuild-installer-frontend

## Development

1. Clone the following repositories:
    * https://github.com/osbuild/osbuild-installer-frontend
    * https://github.com/osbuild/osbuild-installer
    * https://github.com/RedHatInsights/insights-proxy

Optional: https://github.com/osbuild/osbuild-composer

2. Setting up the proxy

    Choose a runner (podman or docker), and point the SPANDX_CONFIG variable to
    profile/local-frontend-and-api-with-identity.js included in
    osbuild-installer-frontend.

    ```
        sudo insights-proxy/scripts/patch-etc-hosts.sh
        export RUNNER="podman"
        export SPANDX_CONFIG=$PATH_TO/osbuild-installer-frontend/profiles/local-frontend-and-api-with-identity.js
        sudo -E insights-proxy/scripts/run.sh
    ```

3. Starting up osbuild-composer-cloud

    Make sure osbuild-composer is installed and osbuild-composer-cloud is
    enabled:

    `sudo systemctl enable --now osbuild-composer-cloud.socket`

    Start a remote worker like so:

    `sudo systemctl enable --now osbuild-remote-worker@localhost:8704`

4. Starting up osbuild-installer
    In the osbuild-installer checkout directory

    ```
        make build
        OSBUILD_SERVICE="http://127.0.0.1:8703/" ./osbuild-installer
    ```

5. Starting up osbuild-installer-frontend

    In the osbuild-installer-frontend checkout direcotry

    ```
        npm install
        npm start
    ```

The UI should be running on
https://prod.foo.redhat.com:1337/apps/osbuild-installer/landing, the api
(osbuild-installer) on
https://prod.foo.redhat.com:1337/api/osbuild-installer/v1/openapi.json

# image-builder-frontend

## Development

1. Clone the following repositories:
    * https://github.com/osbuild/image-builder-frontend
    * https://github.com/osbuild/image-builder
    * https://github.com/RedHatInsights/insights-proxy

Optional: https://github.com/osbuild/osbuild-composer

2. Setting up the proxy

    Choose a runner (podman or docker), and point the SPANDX_CONFIG variable to
    profile/local-frontend-and-api-with-identity.js included in
    image-builder-frontend.

    ```
        sudo insights-proxy/scripts/patch-etc-hosts.sh
        export RUNNER="podman"
        export SPANDX_CONFIG=$PATH_TO/image-builder-frontend/profiles/local-frontend-and-api-with-identity.js
        sudo -E insights-proxy/scripts/run.sh
    ```

3. Starting up osbuild-composer-cloud

    Make sure osbuild-composer is installed and osbuild-composer-cloud is
    enabled:

    `sudo systemctl enable --now osbuild-composer-cloud.socket`

    Start a remote worker like so:

    `sudo systemctl enable --now osbuild-remote-worker@localhost:8704`

4. Starting up image-builder
    In the image-builder checkout directory

    ```
        make build
        OSBUILD_SERVICE="http://127.0.0.1:8703/" ./image-builder
    ```

5. Starting up image-builder-frontend

    In the image-builder-frontend checkout direcotry

    ```
        npm install
        npm start
    ```

The UI should be running on
https://prod.foo.redhat.com:1337/apps/image-builder/landing, the api
(image-builder) on
https://prod.foo.redhat.com:1337/api/image-builder/v1/openapi.json

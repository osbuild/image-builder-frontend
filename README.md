# image-builder-frontend

## Development

You can skip step 3 and 4 if you don't need the full stack locally. However
while it's possible to click around the page and use mock data, it won't be able
to build images.

1. Clone the following repositories:
    * https://github.com/osbuild/image-builder-frontend
    * https://github.com/osbuild/image-builder
    * https://github.com/RedHatInsights/insights-proxy

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

3. Setting up osbuild-composer(-api)

    The easiest way to do this is to call `schutzbots/provision-composer.sh` from
    the `osbuild/image-builder` project. This will install composer, generate
    the needed certs, and put the configuration in place.

4. Starting up image-builder

    Point the URL to wherever composer is hosted, the client certificates and CA
    should be reused or copied over from the composer host, they're located in
    `/etc/osbuild-composer`.

    In the image-builder checkout directory

    ```
        make build
        OSBUILD_URL="https://$composer-url:$composer-port/api/composer/v1" \
        OSBUILD_CERT_PATH=/path/to/client-crt.pem \
        OSBUILD_KEY_PATH=/path/to/client-key.pem \
        OSBUILD_CA_PATH=/path/to/ca-crt.pem \
        ./image-builder
    ```

5. Starting up image-builder-frontend

    In the image-builder-frontend checkout directory

    ```
        npm install
        npm start
    ```

The UI should be running on
https://prod.foo.redhat.com:1337/apps/image-builder/landing, the api
(image-builder) on
https://prod.foo.redhat.com:1337/api/image-builder/v1/openapi.json

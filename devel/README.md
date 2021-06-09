# devtools

Development Tools for Image Builder

## Setup

To start local development, first clone the image bulider stack:

```bash
git clone git@github.com:osbuild/osbuild.git
git clone git@github.com:osbuild/osbuild-composer.git
git clone git@github.com:osbuild/image-builder.git
git clone git@github.com:osbuild/image-builder-frontend.git
```

Secondly redirect a few domains to localhost. One for each environment
of cloud.redhat.com that exists. You only need the ones you will be
developing against. If you are outside the Red Hat VPN, only `prod` is
available:

```bash
echo "127.0.0.1 prod.foo.redhat.com" >> /etc/hosts
echo "127.0.0.1 qa.foo.redhat.com" >> /etc/hosts
echo "127.0.0.1 ci.foo.redhat.com" >> /etc/hosts
echo "127.0.0.1 stage.foo.redhat.com" >> /etc/hosts
```

Lastly run the setup tool from image-builder-frontend to generate TLS certs
and potentially other runtime configuration.

```bash
cd image-builder-frontend/devel
./setup.sh
```

## Environment Variables

For the Image Builder backend to upload successfully, you need to set some environment variables. For AWS, for example, set the following environment variables in the `.env` file:

```
OSBUILD_AWS_REGION
OSBUILD_AWS_ACCESS_KEY_ID
OSBUILD_AWS_SECRET_ACCESS_KEY
OSBUILD_AWS_S3_BUCKET
```

And then add to the list of environment variables for the backend container in the `docker-compose.yml` file.

The config variables for the Image Builder backend can be found [here](https://github.com/osbuild/image-builder/blob/main/internal/config/config.go).

## Run

```bash
docker-compose up
```

Access the service through the GUI:
[http://prod.foo.redhat.com:1337/beta/](http://prod.foo.redhat.com:1337/beta/), or
directly through the API:
[https://prod.foo.redhat.com:1337/docs/api/image-builder](https://prod.foo.redhat.com:1337/docs/api/image-builder).

# devtools

Development Tools for Image Builder

## Setup

To start local development, first clone the image builder stack:

```bash
git clone git@github.com:osbuild/osbuild.git
git clone git@github.com:osbuild/osbuild-composer.git
git clone git@github.com:osbuild/image-builder.git
git clone git@github.com:osbuild/image-builder-frontend.git
```

The folder structure should look like:

```
.
├── image-builder
├── image-builder-frontend
├── osbuild
└── osbuild-composer
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
and extract the Grafana dashboards from the image-builder and osbuild-composer
repos.

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

To build the containers run the following command:

```bash
docker compose build # (or docker-compose build)
```

To run the containers:

```bash
docker compose up # (or docker-compose up)
```

Note: As per the [docker compose cli](https://docs.docker.com/compose/reference/) docs, the new syntax for running docker compose changed from
`docker-compose` to `docker compose`

Access the service through the GUI:
[https://stage.foo.redhat.com:1337/beta/insights/image-builder](https://stage.foo.redhat.com:1337/beta/insights/image-builder), or
directly through the API:
[https://stage.foo.redhat.com:1337/docs/api/image-builder](https://stage.foo.redhat.com:1337/docs/api/image-builder).

The metrics containers are only launched when explicitly required. The command for this is below:

```bash
docker compose --profile metrics up
```

Access the Grafana dashboard on [https://localhost:3000](https://localhost:3000). The default username is `admin` and the password is set to `foobar`.
The prometheus instance can be accessed on [https://localhost:9000](https://localhost:9000)

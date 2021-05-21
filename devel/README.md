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

## Run

```bash
docker compose up
```

Access the service through the GUI:
[http://prod.foo.redhat.com:1337/beta/](http://prod.foo.redhat.com:1337/beta/), or
directly through the API:
[https://prod.foo.redhat.com:1337/docs/api/image-builder](https://prod.foo.redhat.com:1337/docs/api/image-builder).

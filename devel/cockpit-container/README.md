# Cockpit Image Builder in RHEL Container

Lightweight RHEL container for testing the Cockpit Image Builder frontend. Uses **UBI 10** with osbuild COPR repositories for RHEL 9/10 packages. Cockpit listens on port **9091** to avoid conflicts with a local Cockpit instance on 9090.

## Prerequisites

- Podman (or Docker)
- **Red Hat subscription** on the build host – cockpit and cockpit-files come from RHEL AppStream. On a subscribed RHEL host, Podman automatically passes entitlements to the build via `/usr/share/rhel/secrets` → `/run/secrets`, and dnf uses them to access RHEL repos.

  On **Fedora** with subscription-manager: Podman may not auto-mount entitlements. Either:
  - Create `/usr/share/rhel/secrets` and copy your entitlement `.pem` files from `/etc/pki/entitlement/` there, or
  - Add to `/usr/share/containers/mounts.conf`: `/etc/pki/entitlement:/run/secrets`

## Repositories

The image uses osbuild COPR repositories:
- `@osbuild/osbuild` – osbuild
- `@osbuild/osbuild-composer` – osbuild-composer
- `@osbuild/cockpit-image-builder-main` – cockpit-image-builder

RHEL 9 repo files are in `repos/` for building a UBI 9 variant (edit the Dockerfile `COPY` and `FROM` to use them).

## Build

```bash
podman build -t cockpit-image-builder -f devel/cockpit-container/Dockerfile devel/cockpit-container
```

Or from the project root:

```bash
make cockpit/container-build
```

## Run

```bash
podman run -d --privileged \
  -p 9091:9091 \
  -v /sys/fs/cgroup:/sys/fs/cgroup:rw \
  --name cockpit-image-builder \
  cockpit-image-builder
```

Or:

```bash
make cockpit/container-run
```

## Access

Open a browser at:

```
http://localhost:9091
```

Use **http** (not https) for localhost – Cockpit allows unencrypted connections from 127.0.0.1 and avoids Firefox certificate errors (e.g. PR_END_OF_FILE_ERROR) with self-signed certs.

Default credentials (for development/testing only):

- **User:** `root`
- **Password:** `cockpit`

Change the password after first login: `podman exec -it cockpit-image-builder passwd root`

## Development: In-Container Watch Mode

For live development, mount the project and run webpack inside the container. The container watches for changes and rebuilds automatically.

```bash
make cockpit/container-build-dev   # One-time build (includes Node.js, adds dev entrypoint)
make cockpit/container-run-dev     # Starts container with project mounted at /app
```

The entrypoint runs `npm ci`, `make cockpit/download`, and `webpack --watch` inside the container. The plugin is symlinked to `~/.local/share/cockpit` (user directory) instead of `/usr/share/cockpit`, so Cockpit does not cache it aggressively.

**Automatic reload:** When webpack rebuilds, the browser automatically reloads the plugin iframe (via LiveReload on port 35729). Do not use the browser refresh (F5) as that reloads the entire Cockpit page and requires re-login.

First run may take **3–5 minutes** before Cockpit is reachable (`npm ci` ~2 min, build ~1 min, then systemd starts). Wait for the container to finish initializing before opening the browser.

## Troubleshooting

**"Connection reset" or "Connection refused"**

1. Check the container is running: `podman ps` (look for `cockpit-image-builder` with status "Up")
2. If it exited, check logs: `podman logs cockpit-image-builder`
3. Wait longer – the dev container needs 3–5 minutes on first start for `npm ci` and the initial build
4. Verify Cockpit is listening: `podman exec cockpit-image-builder ss -tlnp | grep 9091`
5. Try from inside the container: `podman exec cockpit-image-builder curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:9091`

**Auto-reload not working**

- Ensure port 35729 is exposed (check `podman port cockpit-image-builder` for 35729)
- The LiveReload script is only injected in development builds (webpack watch mode)

**Container exits immediately**

- Ensure the project is mounted at `/app` (check `podman inspect cockpit-image-builder` for Mounts)
- Check logs for npm or webpack errors
- Run without `-d` to watch startup: `podman run -it --rm --privileged -p 9091:9091 -v /sys/fs/cgroup:/sys/fs/cgroup:rw -v $(pwd):/app cockpit-image-builder-dev`

## Playwright Tests

Set in `.env`:

```
BASE_URL=http://127.0.0.1:9091
PLAYWRIGHT_USER=root
PLAYWRIGHT_PASSWORD=cockpit
```

Then run Cockpit-specific tests:

```bash
npx playwright test playwright/Cockpit/
```

## Stop and Remove

```bash
podman stop cockpit-image-builder
podman rm cockpit-image-builder
```

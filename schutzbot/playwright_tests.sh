#!/bin/bash
set -euo pipefail

PW_WORKERS=4

if [ -n "${PACKIT_PACKAGE_NAME:-}" ]; then
    # Runs in CI (Packit)
    cd "${TMT_TREE}"
    npm ci
elif [ -n "${TMT_SOURCE_DIR:-}" ]; then
    # Runs in dist-git
    cd "${TMT_SOURCE_DIR}/cockpit-image-builder"
    npm ci
elif [ "${CI:-}" != "true" ]; then
    # Local fallback
    cd ../
    npm ci
    # halve the workers on schutzbot to increase reliability
    PW_WORKERS=2
fi

sudo systemctl enable --now cockpit.socket

sudo useradd admin -p "$(openssl passwd foobar)"
sudo usermod -aG wheel admin
echo "admin ALL=(ALL:ALL) NOPASSWD: ALL" | sudo tee "/etc/sudoers.d/admin-nopasswd"

function upload_artifacts {
    if [ -n "${TMT_TEST_DATA:-}" ]; then
        mv playwright-report "$TMT_TEST_DATA"/playwright-report
    else
        USER="$(whoami)"
        sudo chown -R "$USER:$USER" playwright-report
        mv playwright-report /tmp/artifacts/
    fi
}
trap upload_artifacts EXIT

# to make package search work, the cdn repositories need to be replaced
# with the nightly repositories. image-builder looks up repository
# overrides in /etc/image-builder/repositories/$distro.json, where $distro
# is the full distro name including the minor version, e.g. rhel-10.2.

source /etc/os-release

if [ "${ID}" = "rhel" ]; then
    sudo mkdir -p /etc/image-builder/repositories

    major="${VERSION_ID%%.*}"
    nightly="http://download.devel.redhat.com/rhel-${major}/nightly/RHEL-${major}/latest-RHEL-${major}/compose"

    cat <<EOF | sudo tee "/etc/image-builder/repositories/rhel-${VERSION_ID}.json"
{
  "x86_64": [
    {
      "name": "baseos",
      "baseurl": "${nightly}/BaseOS/x86_64/os/",
      "check_gpg": false
    },
    {
      "name": "appstream",
      "baseurl": "${nightly}/AppStream/x86_64/os/",
      "check_gpg": false
    }
  ]
}
EOF
fi

sudo podman run \
     -e "PLAYWRIGHT_HTML_OPEN=never" \
     -e "CI=true" \
     -e "PLAYWRIGHT_USER=admin" \
     -e "PLAYWRIGHT_PASSWORD=foobar" \
     --net=host \
     -v "$PWD:/tests" \
     -v '/etc/os-release:/etc/os-release' \
     --privileged  \
     --rm \
     --init \
     mcr.microsoft.com/playwright:v1.56.1-noble \
     /bin/sh -c "cd tests && npx -y playwright@1.56.1 test --workers=${PW_WORKERS}"

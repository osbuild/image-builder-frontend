#!/bin/bash
set -euo pipefail

TMT_SOURCE_DIR=${TMT_SOURCE_DIR:-}
PW_WORKERS=4
if [ -n "$TMT_SOURCE_DIR" ]; then
    # Move to the directory with sources
    cd "${TMT_SOURCE_DIR}/cockpit-image-builder"
    npm ci
elif [ "${CI:-}" != "true" ]; then
    # packit drops us into the schutzbot directory
    cd ../
    npm ci
    # halve the workers on schutzbot to increase reliability
    PW_WORKERS=2
fi

sudo systemctl enable --now cockpit.socket

sudo useradd admin -p "$(openssl passwd foobar)"
sudo usermod -aG wheel admin
echo "admin ALL=(ALL:ALL) NOPASSWD: ALL" | sudo tee "/etc/sudoers.d/admin-nopasswd"

sudo podman build --tag playwright -f $(pwd)/schutzbot/Containerfile-Playwright .

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
# with the nightly repositories

sudo mkdir -p /etc/osbuild-composer/repositories

cat <<EOF | sudo tee -a /etc/osbuild-composer/repositories/rhel-9.json
{
  "x86_64": [
    {
      "name": "baseos",
      "baseurl": "http://download.devel.redhat.com/rhel-9/nightly/RHEL-9/latest-RHEL-9/compose/BaseOS/x86_64/os/",
      "check_gpg": false
    },
    {
      "name": "appstream",
      "baseurl": "http://download.devel.redhat.com/rhel-9/nightly/RHEL-9/latest-RHEL-9/compose/AppStream/x86_64/os/",
      "check_gpg": false
    }
  ]
}
EOF

cat <<EOF | sudo tee -a /etc/osbuild-composer/repositories/rhel-10.json
{
  "x86_64": [
    {
      "name": "baseos",
      "baseurl": "http://download.devel.redhat.com/rhel-10/nightly/RHEL-10/latest-RHEL-10/compose/BaseOS/x86_64/os/",
      "check_gpg": false
    },
    {
      "name": "appstream",
      "baseurl": "http://download.devel.redhat.com/rhel-10/nightly/RHEL-10/latest-RHEL-10/compose/AppStream/x86_64/os/",
      "check_gpg": false
    }
  ]
}
EOF

sudo systemctl enable --now osbuild-composer.socket osbuild-local-worker.socket
sudo systemctl start osbuild-worker@1

sudo podman run \
     -e "PLAYWRIGHT_HTML_OPEN=never" \
     -e "CI=true" \
     -e "PLAYWRIGHT_USER=admin" \
     -e "PLAYWRIGHT_PASSWORD=foobar" \
     -e "CURRENTS_PROJECT_ID=${CURRENTS_PROJECT_ID:-}" \
     -e "CURRENTS_RECORD_KEY=${CURRENTS_RECORD_KEY:-}" \
     --net=host \
     -v "$PWD:/tests" \
     -v '/etc:/etc' \
     -v '/etc/os-release:/etc/os-release' \
     --privileged  \
     --rm \
     --init \
     localhost/playwright \
     /bin/sh -c "cd tests && npx -y playwright@1.51.1 test --workers=${PW_WORKERS}"

#!/bin/bash
set -euo pipefail

# As playwright isn't supported on fedora/el, install dependencies
# beforehand.
sudo dnf install -y \
     alsa-lib \
     libXrandr-devel \
     libXdamage-devel \
     libXcomposite-devel \
     at-spi2-atk-devel \
     cups \
     atk

sudo systemctl enable --now cockpit.socket

sudo useradd admin -p "$(openssl passwd foobar)"
sudo usermod -aG wheel admin
echo "admin ALL=(ALL:ALL) NOPASSWD: ALL" | sudo tee "/etc/sudoers.d/admin-nopasswd"

function upload_artifacts {
    mkdir -p /tmp/artifacts/extra-screenshots
    USER="$(whoami)"
    sudo chown -R "$USER:$USER" playwright-report
    mv playwright-report /tmp/artifacts/
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
     -e "CURRENTS_PROJECT_ID=$CURRENTS_PROJECT_ID" \
     -e "CURRENTS_RECORD_KEY=$CURRENTS_RECORD_KEY" \
     --net=host \
     -v "$PWD:/tests" \
     --privileged  \
     --rm \
     --init \
     mcr.microsoft.com/playwright:v1.51.1-noble \
     /bin/sh -c "cd tests && npx -y playwright@1.51.1 test"
